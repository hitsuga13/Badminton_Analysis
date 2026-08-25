import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const allowedOrigins = [
    'http://localhost:9000',
    'http://localhost:9001',
    'https://hitsuga13.github.io',
    ...(process.env.FRONTEND_ORIGINS?.split(',').map((origin) => origin.trim()) ?? []),
  ];

  app.enableCors({
<<<<<<< Updated upstream
    origin: [
      'http://localhost:9000',
      'http://localhost:9001',
      'https://hitsuga13.github.io',
    ],
    credentials: true,
  });
  //await app.listen(process.env.PORT ?? 3000);
  await app.listen(process.env.PORT || 3000);
=======
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`CORS blocked origin: ${origin}`));
    },
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
>>>>>>> Stashed changes
}
bootstrap();
