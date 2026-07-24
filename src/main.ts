import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe());

  const config = new DocumentBuilder()
    .setTitle('Reentry API')
    .setDescription('Reentry Backend API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api/docs', app, document);

  app.enableCors({
    origin: 'http://localhost:5173', // your frontend URL
    credentials: true,
  });

  await app.listen(3000);

  console.log(`Application running on: http://localhost:3000`);
  console.log(`Swagger Docs: http://localhost:3000/api/docs`);
}

bootstrap();
