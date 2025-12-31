import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { UserEntity } from './entities/user.entity';

const mockUser = {
  id: 1,
  email: 'bob.bobo@email.com',
  name: 'Bob o bobo',
  password: 'teste123',
  applications: [],
};

const mockPrismaService = {
  user: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should successfully create a user', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue(mockUser);

      const result = await service.create(mockUser);

      expect(result).toBeInstanceOf(UserEntity);
      expect(result.email).toBe(mockUser.email);
      expect(mockPrismaService.user.create).toHaveBeenCalled();
    });

    it('should throw ConflictException if email is already in use', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      await expect(service.create(mockUser)).rejects.toThrow(ConflictException);
    });
  });

  describe('update', () => {
    it('should update user when data is valid', async () => {
      mockPrismaService.user.findUnique
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(null);

      mockPrismaService.user.update.mockResolvedValue({
        ...mockUser,
        name: 'Novo Nome',
      });

      const result = await service.update(1, { name: 'Novo Nome' });

      expect(result.name).toBe('Novo Nome');
      expect(mockPrismaService.user.update).toHaveBeenCalled();
    });

    it('should throw ConflictException if email belongs to another user', async () => {
      mockPrismaService.user.findUnique.mockResolvedValueOnce(null);

      await expect(service.update(999, { name: 'Novo' })).rejects.toThrow(
        NotFoundException,
      );

      expect(mockPrismaService.user.update).not.toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException if user does not exist', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete and return user entity', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.delete.mockResolvedValue(mockUser);

      const result = await service.remove(1);
      expect(result).toBeInstanceOf(UserEntity);
      expect(mockPrismaService.user.delete).toHaveBeenCalled();
    });
  });
});
