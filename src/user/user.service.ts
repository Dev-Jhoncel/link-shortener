import { Injectable, BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { hashPassword, comparePassword } from 'src/lib/password';
import { UserResponse } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  /**
   * Register a new user
   * @param createUserDto - User registration data
   * @returns UserResponse - Created user without password
   * @throws BadRequestException - If passwords don't match
   * @throws ConflictException - If email already exists
   */
  async create(createUserDto: CreateUserDto): Promise<UserResponse> {
    const { email, password, passwordConfirm, firstName, lastName } = createUserDto;

    // Validate passwords match
    if (password !== passwordConfirm) {
      throw new BadRequestException('Passwords do not match');
    }

    // Check if user already exists
    const existingUser = await this.prisma.client.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await this.prisma.client.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
      },
    });

    // Return user without password
    return this.sanitizeUser(user);
  }

  /**
   * Find user by email
   * @param email - User email
   * @returns User object with password for authentication
   * @throws NotFoundException - If user not found
   */
  async findByEmail(email: string) {
    const user = await this.prisma.client.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  /**
   * Find user by ID
   * @param id - User ID
   * @returns UserResponse - User without password
   * @throws NotFoundException - If user not found
   */
  async findOne(id: string): Promise<UserResponse> {
    const user = await this.prisma.client.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.sanitizeUser(user);
  }

  /**
   * Find all users
   * @returns UserResponse[] - Array of users without passwords
   */
  async findAll(): Promise<UserResponse[]> {
    const users = await this.prisma.client.user.findMany();
    return users.map((user) => this.sanitizeUser(user));
  }

  /**
   * Update user information
   * @param id - User ID
   * @param updateUserDto - Data to update
   * @returns UserResponse - Updated user without password
   * @throws NotFoundException - If user not found
   */
  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserResponse> {
    // Verify user exists
    await this.findOne(id);

    const user = await this.prisma.client.user.update({
      where: { id },
      data: updateUserDto,
    });

    return this.sanitizeUser(user);
  }

  /**
   * Remove (soft delete) a user
   * @param id - User ID
   * @returns UserResponse - Deleted user
   * @throws NotFoundException - If user not found
   */
  async remove(id: string): Promise<UserResponse> {
    await this.findOne(id);

    const user = await this.prisma.client.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return this.sanitizeUser(user);
  }

  /**
   * Validate user credentials
   * @param email - User email
   * @param password - Plain text password
   * @returns UserResponse - User if credentials are valid
   * @throws NotFoundException - If user not found
   * @throws BadRequestException - If password is incorrect
   */
  async validateCredentials(email: string, password: string): Promise<UserResponse> {
    const user = await this.findByEmail(email);

    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      throw new BadRequestException('Invalid credentials');
    }

    return this.sanitizeUser(user);
  }

  /**
   * Remove password from user object
   * @param user - User object from database
   * @returns UserResponse - User without password
   */
  private sanitizeUser(user: any): UserResponse {
    const { password, deletedAt, ...sanitized } = user;
    return sanitized;
  }
}
