import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { UrlService } from './url.service';
import { CreateUrlDto } from './dto/create-url.dto';

@Controller('url')
export class UrlController {
  constructor(private readonly urlService: UrlService) {}

  @Post()
  create(@Body() createUrlDto: CreateUrlDto) {
    return this.urlService.create(createUrlDto);
  }

  @Get(':userId/:shortCode')
  async getLink(
    @Param('userId') userId: string,
    @Param('shortCode') shortCode: string,
  ) {
    return await this.urlService.getLink(shortCode, userId);
  }
}
