import { Controller, Get, Param, Res, HttpStatus } from '@nestjs/common';
import type { Response } from 'express';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get(':shortCode')
  async redirectMe(
    @Param('shortCode') shortCode: string,
    @Res() res: Response,
  ): Promise<void> {
    const url = await this.appService.findByShortCode(shortCode);
    res.redirect(HttpStatus.FOUND, url.url);
  }
}
