import { Injectable } from '@nestjs/common';
import { CreateUrlDto } from './dto/create-url.dto';
import { generateShortCode } from 'src/lib/generateShortCode';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from 'src/generated/prisma';

@Injectable()
export class UrlService {
  constructor(private prisma: PrismaService) {}

  async create(createUrlDto: CreateUrlDto) {
    const shortCode = generateShortCode();
    const data: Prisma.LinkCreateInput = {
      ...createUrlDto,
      shortCode,
    };
    await this.prisma.client.link.create({ data });
    return shortCode;
  }

  async getLink(shortCode: string) {
    return await this.prisma.client.link.findUnique({ where: { shortCode } });
  }
}
