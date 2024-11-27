import { NestFactory } from '@nestjs/core';
import { AppModule, FirstService } from './app';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.get(FirstService).setApp(app);
  app.enableShutdownHooks();
  await app.listen(3000);
}
bootstrap();
