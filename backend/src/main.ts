import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const compression = require('compression');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Compressão HTTP (Gzip/Brotli) — reduz payload em ~70% para respostas JSON
  app.use(compression({ level: 6, threshold: 1024 }));

  app.enableCors({
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
  });

  app.useGlobalFilters(new HttpExceptionFilter());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.setGlobalPrefix('api');


  const port = process.env.BACKEND_PORT || process.env.PORT || 3001;
  await app.listen(port);
  console.log(`RotaFácil API running on port ${port}`);
}
bootstrap();
