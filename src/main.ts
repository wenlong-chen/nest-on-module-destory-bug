import { NestFactory } from '@nestjs/core';
import { AppModule, FirstModule } from './app';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.get(FirstModule).setApp(app);
  app.enableShutdownHooks();
  await app.listen(3000);
}
bootstrap();
