import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { UserService } from './user.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import * as passwordLib from 'src/lib/password';

jest.mock('src/lib/password');

describe('UserService', () => {
  let service: UserService;
  let prismaService: PrismaService;

  const mockUser = {
    id: '123',
    email: 'test@example.com',
    password: 'hashedPassword123',
    firstName: 'John',
    lastName: 'Doe',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  const createUserDto: CreateUserDto = {
    email: 'newuser@example.com',
    password: 'Test@1234567890',
    passwordConfirm: 'Test@1234567890',
    firstName: 'Jane',
    lastName: 'Smith',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: {
            client: {
              user: {
                create: jest.fn(),
                findUnique: jest.fn(),
                findMany: jest.fn(),
                update: jest.fn(),
              },
            },
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create (Registration)', () => {
    it('should create a new user successfully', async () => {
      const mockHashPassword = jest.spyOn(passwordLib, 'hashPassword').mockResolvedValueOnce('hashedPassword');
      jest.spyOn(prismaService.client.user, 'findUnique').mockResolvedValueOnce(null);
      jest.spyOn(prismaService.client.user, 'create').mockResolvedValueOnce(mockUser);

      const result = await service.create(createUserDto);

      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      });

      expect(mockHashPassword).toHaveBeenCalledWith(createUserDto.password);
      expect(prismaService.client.user.findUnique).toHaveBeenCalledWith({
        where: { email: createUserDto.email },
      });
    });

    it('should throw BadRequestException if passwords do not match', async () => {
      const invalidDto: CreateUserDto = {
        ...createUserDto,
        passwordConfirm: 'DifferentPassword@123',
      };

      await expect(service.create(invalidDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw ConflictException if email already exists', async () => {
      jest.spyOn(prismaService.client.user, 'findUnique').mockResolvedValueOnce(mockUser);

      await expect(service.create(createUserDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('findByEmail', () => {
    it('should find a user by email', async () => {
      jest.spyOn(prismaService.client.user, 'findUnique').mockResolvedValueOnce(mockUser);

      const result = await service.findByEmail(mockUser.email);

      expect(result).toEqual(mockUser);
      expect(prismaService.client.user.findUnique).toHaveBeenCalledWith({
        where: { email: mockUser.email },
      });
    });

    it('should throw NotFoundException if user does not exist', async () => {
      jest.spyOn(prismaService.client.user, 'findUnique').mockResolvedValueOnce(null);

      await expect(service.findByEmail('nonexistent@example.com')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findOne', () => {
    it('should find a user by ID and return sanitized user', async () => {
      jest.spyOn(prismaService.client.user, 'findUnique').mockResolvedValueOnce(mockUser);

      const result = await service.findOne(mockUser.id);

      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      });
    });

    it('should throw NotFoundException if user does not exist', async () => {
      jest.spyOn(prismaService.client.user, 'findUnique').mockResolvedValueOnce(null);

      await expect(service.findOne('invalid-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return all users without passwords', async () => {
      const mockUsers = [mockUser, { ...mockUser, id: '456', email: 'another@example.com' }];
      jest.spyOn(prismaService.client.user, 'findMany').mockResolvedValueOnce(mockUsers);

      const result = await service.findAll();

      expect(result).toHaveLength(2);
      expect(result[0]).not.toHaveProperty('password');
      expect(result[1]).not.toHaveProperty('password');
    });
  });

  describe('update', () => {
    it('should update user information', async () => {
      const updateDto = { firstName: 'Updated' };
      jest.spyOn(prismaService.client.user, 'findUnique').mockResolvedValueOnce(mockUser);
      jest.spyOn(prismaService.client.user, 'update').mockResolvedValueOnce({
        ...mockUser,
        firstName: 'Updated',
      });

      const result = await service.update(mockUser.id, updateDto);

      expect(result.firstName).toBe('Updated');
      expect(prismaService.client.user.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: updateDto,
      });
    });

    it('should throw NotFoundException if user does not exist', async () => {
      jest.spyOn(prismaService.client.user, 'findUnique').mockResolvedValueOnce(null);

      await expect(service.update('invalid-id', { firstName: 'New' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should soft delete a user', async () => {
      const deletedUser = { ...mockUser, deletedAt: new Date() };
      jest.spyOn(prismaService.client.user, 'findUnique').mockResolvedValueOnce(mockUser);
      jest.spyOn(prismaService.client.user, 'update').mockResolvedValueOnce(deletedUser);

      const result = await service.remove(mockUser.id);

      expect(prismaService.client.user.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: { deletedAt: expect.any(Date) },
      });
    });

    it('should throw NotFoundException if user does not exist', async () => {
      jest.spyOn(prismaService.client.user, 'findUnique').mockResolvedValueOnce(null);

      await expect(service.remove('invalid-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('validateCredentials', () => {
    it('should validate correct credentials', async () => {
      jest.spyOn(prismaService.client.user, 'findUnique').mockResolvedValueOnce(mockUser);
      jest.spyOn(passwordLib, 'comparePassword').mockResolvedValueOnce(true);

      const result = await service.validateCredentials(mockUser.email, 'Test@1234567890');

      expect(result).not.toHaveProperty('password');
      expect(passwordLib.comparePassword).toHaveBeenCalledWith('Test@1234567890', mockUser.password);
    });

    it('should throw BadRequestException for invalid password', async () => {
      jest.spyOn(prismaService.client.user, 'findUnique').mockResolvedValueOnce(mockUser);
      jest.spyOn(passwordLib, 'comparePassword').mockResolvedValueOnce(false);

      await expect(
        service.validateCredentials(mockUser.email, 'WrongPassword@123'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if user does not exist', async () => {
      jest.spyOn(prismaService.client.user, 'findUnique').mockResolvedValueOnce(null);

      await expect(service.validateCredentials('nonexistent@example.com', 'Test@1234567890')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
