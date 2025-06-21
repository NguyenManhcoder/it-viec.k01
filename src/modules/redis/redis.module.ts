import { Global, Module } from "@nestjs/common";
import { redisProvider } from "./redisprovider";

@Global()
@Module({
  providers:[...redisProvider],
  exports:[...redisProvider],
})
export class RedisModule {}