import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: ['http://localhost:9000', 'http://localhost:9001'],
    credentials: true,
  });
  //await app.listen(process.env.PORT ?? 3000);
  await app.listen(process.env.PORT || 3000);
}
bootstrap();
