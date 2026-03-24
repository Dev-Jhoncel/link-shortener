import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { UrlService } from './url/url.service';
import { Link } from '../src/generated/prisma';

@Injectable()
export class AppService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly urlService: UrlService,
  ) {}

  async findByShortCode(shortCode: string): Promise<Link> {
    try {
      const redirect_url = await this.urlService.getLink(shortCode);
      if (!redirect_url)
        throw new NotFoundException(`Short code "${shortCode}" not found`);
      return redirect_url;
    } catch (error) {
      console.error('Error finding URL by short code:', error);
      throw new NotFoundException(`Short code "${shortCode}" not found`);
    }
  }
}
