import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
    ) { }

    async register(dto: RegisterDto) {
        const { name, email, password, adminSecret } = dto;

        const userExists = await this.prisma.user.findUnique({
            where: { email },
        });

        if (userExists) {
            throw new BadRequestException('User already exists');
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Verify admin secret against environment variable
        let userRole: any = 'USER';
        if (adminSecret && adminSecret === process.env.ADMIN_SECRET) {
            userRole = 'ADMIN';
        }

        const user = await this.prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: userRole,
            },
        });

        const token = this.jwtService.sign({ userId: user.id, role: user.role });

        return {
            message: 'User registered successfully',
            token,
            role: user.role.toLowerCase(),
        };
    }

    async login(dto: LoginDto) {
        const { email, password } = dto;

        const user = await this.prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const token = this.jwtService.sign({ userId: user.id, role: user.role });

        return {
            token,
            role: user.role.toLowerCase(),
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
            }
        };
    }
}

