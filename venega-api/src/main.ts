import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ── Global prefix ──
  app.setGlobalPrefix('api/v1');

  // ── CORS ──
  app.enableCors({
    origin: [
      'http://localhost:3000',   // Web
      'http://localhost:3001',   // Backoffice
      'http://localhost:8081',   // Expo web
    ],
    credentials: true,
  });

  // ── Validation globale ──
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // ── Swagger ──
  const config = new DocumentBuilder()
    .setTitle('Venega API')
    .setDescription('API pour la plateforme de tontine digitale Venega')
    .setVersion('0.1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = process.env.APP_PORT || 3000;
  await app.listen(port);
  console.log(`🚀 Venega API running on http://localhost:${port}`);
  console.log(`📄 Swagger docs at http://localhost:${port}/docs`);
}
bootstrap();
