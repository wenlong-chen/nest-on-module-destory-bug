import { Global, Injectable, Module, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { FileHandle, open } from 'fs/promises';

@Injectable()
export class BService implements OnModuleInit, OnModuleDestroy {
  private fh: FileHandle

  async log(message: string) {
    await this.fh.write(message);
  }

  async onModuleInit() {
    this.fh = await open('test.txt', 'w');
  }

  async onModuleDestroy() {
    await this.fh.close();
  }
}

@Module({
  providers: [BService],
  exports: [BService],
})
export class BModule {}

@Injectable()
export class AService implements OnModuleInit, OnModuleDestroy {
  constructor(private bService: BService) {}

  async onModuleInit() {
    await this.bService.log('AService.onModuleInit\n');
  }

  async onModuleDestroy() {
    await this.bService.log('AService.onModuleDestroy\n');
  }
}

@Module({
  imports: [BModule],
  providers: [AService],
  exports: [AService]
})
export class AModule {}

@Module({
  imports: [AModule, BModule],
})
export class AppModule {}

