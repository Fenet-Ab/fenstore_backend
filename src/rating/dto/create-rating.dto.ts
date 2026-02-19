import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateRatingDto {
    @IsInt()
    @Min(1)
    @Max(5)
    value: number;

    @IsOptional()
    @IsString()
    comment?: string;
}
