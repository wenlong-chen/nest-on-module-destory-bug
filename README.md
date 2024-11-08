To reproduce the bug, run `npm start` and then shut it down with Ctrl + C.

You should see the following log:

```
 % npm start

> nest-on-module-destroy-bug@0.0.1 start
> nest start

[Nest] 81294  - 11/08/2024, 1:14:30 PM     LOG [NestFactory] Starting Nest application...
[Nest] 81294  - 11/08/2024, 1:14:30 PM     LOG [InstanceLoader] AppModule dependencies initialized +4ms
[Nest] 81294  - 11/08/2024, 1:14:30 PM     LOG [InstanceLoader] BModule dependencies initialized +0ms
[Nest] 81294  - 11/08/2024, 1:14:30 PM     LOG [InstanceLoader] AModule dependencies initialized +0ms
[Nest] 81294  - 11/08/2024, 1:14:30 PM     LOG [NestApplication] Nest application successfully started +3ms
^C[Nest] 81294  - 11/08/2024, 1:14:33 PM   ERROR [NestApplicationContext] Error happened during shutdown
Error: file closed
    at fsCall (node:internal/fs/promises:456:17)
    at FileHandle.write (node:internal/fs/promises:226:12)
    at BService.log (/nest-on-module-destroy-bug/src/app.ts:9:19)
    at AService.onModuleDestroy (/nest-on-module-destroy-bug/src/app.ts:36:25)
    at MapIterator.iteratee (/nest-on-module-destroy-bug/node_modules/@nestjs/core/hooks/on-module-destroy.hook.js:22:43)
    at MapIterator.next (/nest-on-module-destroy-bug/node_modules/iterare/src/map.ts:9:39)
    at IteratorWithOperators.next (/nest-on-module-destroy-bug/node_modules/iterare/src/iterate.ts:19:28)
    at Function.from (<anonymous>)
    at IteratorWithOperators.toArray (/nest-on-module-destroy-bug/node_modules/iterare/src/iterate.ts:227:22)
    at callOperator (/nest-on-module-destroy-bug/node_modules/@nestjs/core/hooks/on-module-destroy.hook.js:23:10)
```