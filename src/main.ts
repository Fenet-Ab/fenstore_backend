import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });

  // Global request logging middleware
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    res.on('finish', () => {
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} ${res.statusCode}`);
    });
    next();
  });

  app.setGlobalPrefix('api');

  // Enable validation globally
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Strip properties that don't have decorators
    forbidNonWhitelisted: true, // Throw error if non-whitelisted properties exist
    transform: true, // Automatically transform payloads to DTO instances
  }));

  await app.listen(process.env.PORT ?? 5000);
}
bootstrap();
