import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { CreateUrlDto } from './dto/create-url.dto';
import { generateShortCode } from 'src/lib/generateShortCode';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from 'src/generated/prisma';

const MAX_SHORT_CODE_ATTEMPTS = 3;
const PUBLIC_SCOPE = 'public';

@Injectable()
export class UrlService {
  constructor(private prisma: PrismaService) {}

  async create(createUrlDto: CreateUrlDto) {
    const userId = createUrlDto.userId ?? null;

    for (let attempt = 0; attempt < MAX_SHORT_CODE_ATTEMPTS; attempt++) {
      const shortCode = generateShortCode();

      const data: Prisma.LinkUncheckedCreateInput = {
        url: createUrlDto.url,
        description: createUrlDto.description,
        expiresAt: createUrlDto.expiresAt,
        isActive: createUrlDto.isActive,
        userId: userId ?? undefined,
        scope: userId ?? PUBLIC_SCOPE,
        shortCode,
      };

      try {
        return await this.prisma.client.link.create({ data });
      } catch (error) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === 'P2002'
        ) {
          continue;
        }
        throw error;
      }
    }

    throw new ServiceUnavailableException(
      `Could not generate a unique short code after ${MAX_SHORT_CODE_ATTEMPTS} attempts`,
    );
  }

  async getLink(shortCode: string, userId?: string | null) {
    return await this.prisma.client.link.findFirst({
      where: {
        shortCode,
        scope: userId ?? PUBLIC_SCOPE,
        isActive: true,
        deletedAt: null,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
    });
  }
}
