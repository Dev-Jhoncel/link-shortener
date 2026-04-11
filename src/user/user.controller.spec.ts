import { Test, TestingModule } from '@nestjs/testing';
import {
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

describe('UserController', () => {
  let controller: UserController;
  let service: UserService;

  const mockUserResponse = {
    id: '123',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    createdAt: new Date(),
    updatedAt: new Date(),
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
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      jest.spyOn(service, 'create').mockResolvedValueOnce(mockUserResponse);

      const result = await controller.register(createUserDto);

      expect(result).toEqual(mockUserResponse);
      expect(service.create).toHaveBeenCalledWith(createUserDto);
    });

    it('should handle registration error - duplicate email', async () => {
      jest.spyOn(service, 'create').mockRejectedValueOnce(new ConflictException('Email already in use'));

      await expect(controller.register(createUserDto)).rejects.toThrow(ConflictException);
    });

    it('should handle registration error - password mismatch', async () => {
      jest.spyOn(service, 'create').mockRejectedValueOnce(new BadRequestException('Passwords do not match'));

      await expect(controller.register(createUserDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const mockUsers = [mockUserResponse, { ...mockUserResponse, id: '456' }];
      jest.spyOn(service, 'findAll').mockResolvedValueOnce(mockUsers);

      const result = await controller.findAll();

      expect(result).toEqual(mockUsers);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a user by ID', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValueOnce(mockUserResponse);

      const result = await controller.findOne('123');

      expect(result).toEqual(mockUserResponse);
      expect(service.findOne).toHaveBeenCalledWith('123');
    });

    it('should throw NotFoundException if user not found', async () => {
      jest.spyOn(service, 'findOne').mockRejectedValueOnce(new NotFoundException('User not found'));

      await expect(controller.findOne('invalid-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update user information', async () => {
      const updateDto: UpdateUserDto = { firstName: 'Updated' };
      const updatedUser = { ...mockUserResponse, firstName: 'Updated' };
      jest.spyOn(service, 'update').mockResolvedValueOnce(updatedUser);

      const result = await controller.update('123', updateDto);

      expect(result).toEqual(updatedUser);
      expect(service.update).toHaveBeenCalledWith('123', updateDto);
    });
  });

  describe('remove', () => {
    it('should delete a user', async () => {
      jest.spyOn(service, 'remove').mockResolvedValueOnce(mockUserResponse);

      const result = await controller.remove('123');

      expect(result).toEqual(mockUserResponse);
      expect(service.remove).toHaveBeenCalledWith('123');
    });
  });
});
