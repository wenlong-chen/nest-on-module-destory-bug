import {
  Controller,
  Get,
  INestApplication,
  Inject,
  Injectable,
  Module,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { GraphQLModule, Query, Resolver } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { createHttpTerminator } from 'http-terminator';

import { FileHandle, open } from 'fs/promises';

@Module({})
export class FirstModule {
  private app: INestApplication;

  setApp(app: INestApplication) {
    this.app = app;
  }

  async onModuleDestroy() {
    console.log('FirstService.onModuleDestroy');
    const httpTerminator = createHttpTerminator({
      server: this.app.getHttpServer(),
    });
    await httpTerminator.terminate();
    console.log('httpTerminator.terminate() completed');
  }
}

@Injectable()
export class LoggerService implements OnModuleInit, OnModuleDestroy {
  private fh: FileHandle;

  async log(message: string) {
    await this.fh.write(message);
    await this.fh.sync();
  }

  async onModuleInit() {
    console.log('LoggerService.onModuleInit');
    this.fh = await open('test.txt', 'w');
  }

  async onModuleDestroy() {
    console.log('LoggerService.onModuleDestroy');
    await this.fh.close();
  }
}

@Module({
  providers: [LoggerService],
  exports: [LoggerService],
  imports: [FirstModule],
})
export class LoggerModule {}

@Injectable()
export class FooService implements OnModuleInit, OnModuleDestroy {
  constructor(@Inject(LoggerService) private loggerService: LoggerService) {}

  async longRunningTask() {
    for (let i = 0; i < 30; i++) {
      await this.loggerService.log(`Task iteration ${i}\n`);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  async onModuleInit() {
    console.log('FooService.onModuleInit');
  }

  async onModuleDestroy() {
    console.log('FooService.onModuleDestroy');
  }
}

@Controller('/')
export class FooController {
  constructor(@Inject(FooService) private fooService: FooService) {}

  @Get('/')
  async index() {
    await this.fooService.longRunningTask();
    return 'Hello World!';
  }
}

@Resolver(() => String)
export class FooResolver {
  constructor(@Inject(FooService) private fooService: FooService) {}

  @Query(() => String)
  async foo() {
    await this.fooService.longRunningTask();
    return 'Hello World!';
  }
}

@Module({
  imports: [LoggerModule],
  controllers: [FooController],
  providers: [FooService, FooResolver],
  exports: [FooService],
})
export class FooModule {}

@Injectable()
export class AppService implements OnModuleInit, OnModuleDestroy {
  onModuleDestroy() {
    console.log('AppService.onModuleDestroy');
  }
  onModuleInit() {
    console.log('AppService.onModuleInit');
  }
}

@Module({
  imports: [
    FirstModule,
    FooModule,
    LoggerModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      subscriptions: {
        'graphql-ws': true,
        'subscriptions-transport-ws': true,
      },
      autoSchemaFile: 'schema.gql',
    }),
  ],
  providers: [AppService],
})
export class AppModule implements OnModuleDestroy {
  onModuleDestroy() {
    console.log('AppModule.onModuleDestroy');
  }
}
