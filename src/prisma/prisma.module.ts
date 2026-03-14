import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.serive';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
