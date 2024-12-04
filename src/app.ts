import {
  Controller,
  Get,
  INestApplication,
  Inject,
  Injectable,
  Module,
  OnModuleDestroy,
  OnModuleInit,
  Sse,
} from '@nestjs/common';
import { GraphQLModule, Query, Resolver } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { createHttpTerminator } from 'http-terminator';

import { FileHandle, open } from 'fs/promises';
import { NestApplication } from '@nestjs/core';
import { Observable } from 'rxjs';

@Module({})
export class FirstModule {
  private app: INestApplication;

  setApp(app: INestApplication) {
    this.app = app;
    const container = app['container'] as NestApplication['container'];
    const modulesGenerator = container.getModules().values();
    for (const module of modulesGenerator) {
      if (module.name === this.constructor.name) {
        module.distance = Infinity;
      }
    }
  }

  async onModuleDestroy() {
    console.log('FirstModule.onModuleDestroy');
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

  @Sse('/sse')
  sse(): Observable<MessageEvent> {
    return new Observable((subscriber) => {
      let i = 0;
      const interval = setInterval(() => {
        subscriber.next({ data: `hello ${i++}` } as MessageEvent);

        if (i >= 60) {
          clearInterval(interval);
          subscriber.next({ data: 'hello done' } as MessageEvent);
          subscriber.complete();
        }
      }, 1000);

      return () => {
        console.log('clean up sse');
        clearInterval(interval);
      };
    });
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
