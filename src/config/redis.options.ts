import { CacheModuleAsyncOptions } from "@nestjs/cache-manager";
import { redisStore } from "cache-manager-redis-store";

export const RedisOptions: CacheModuleAsyncOptions = {
  isGlobal: true,
  useFactory: async () => {
    const store = await redisStore({
      socket: {
        // host: '172.20.36.47',
        host:'localhost',
        port: 6379,
      },
      database: 1,
    });
    return {
      store: () => store,
    };
  },
};