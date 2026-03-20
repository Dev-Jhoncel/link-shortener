export class CreateUrlDto {
  url: string;
  shortCode?: string;
  description?: string;
  userId?: number;
  expiresAt?: Date;
  isAActive?: boolean;
}
