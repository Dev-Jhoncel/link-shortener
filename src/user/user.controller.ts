import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  HttpCode,
  UseFilters,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponse } from './entities/user.entity';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * Register a new user
   * @param createUserDto - User registration data
   * @returns UserResponse - Created user
   */
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() createUserDto: CreateUserDto): Promise<UserResponse> {
    return this.userService.create(createUserDto);
  }

  /**
   * Get all users
   * @returns UserResponse[] - Array of all users
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(): Promise<UserResponse[]> {
    return this.userService.findAll();
  }

  /**
   * Get user by ID
   * @param id - User ID
   * @returns UserResponse - User information
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string): Promise<UserResponse> {
    return this.userService.findOne(id);
  }

  /**
   * Update user information
   * @param id - User ID
   * @param updateUserDto - Data to update
   * @returns UserResponse - Updated user
   */
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserResponse> {
    return this.userService.update(id, updateUserDto);
  }

  /**
   * Delete a user (soft delete)
   * @param id - User ID
   * @returns UserResponse - Deleted user
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string): Promise<UserResponse> {
    return await this.userService.remove(id);
  }
}
