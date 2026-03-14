import { Get, Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  @Get(':shortCode')
  getlink(shortCode: string): string {
    return shortCode;
  }
}
