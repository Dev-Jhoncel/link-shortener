export class CreateUrlDto {
  constructor(
    url: string,
    shortCode?: string,
    description?: string,
    userId?: string,
    expiresAt?: Date,
    isActive?: boolean,
  ) {
    this.url = url;
    this.shortCode = shortCode;
    this.description = description;
    this.userId = userId;
    this.expiresAt = expiresAt;
    this.isActive = isActive;
  }
  url: string;
  shortCode?: string;
  description?: string;
  userId?: string;
  expiresAt?: Date;
  isActive?: boolean;
}
