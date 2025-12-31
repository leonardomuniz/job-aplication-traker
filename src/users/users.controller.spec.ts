import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { UserEntity } from './entities/user.entity';

const mockUser = {
  id: 1,
  email: 'bob.bobo@email.com',
  name: 'Bob o bobo',
  password: 'teste123',
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

describe('UsersController', () => {
  let controller: UsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        UsersService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create an user if email is not registered', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue(mockUser);

      const response = await controller.create(mockUser);

      expect(mockPrismaService.user.findUnique).toHaveBeenCalled();
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: mockUser,
      });
      expect(response).toEqual(new UserEntity(mockUser));
    });

    it('should throw ConflictException if email is already registered', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      await expect(controller.create(mockUser)).rejects.toThrow(
        ConflictException,
      );
      expect(mockPrismaService.user.create).not.toHaveBeenCalled();
    });

    it('should return when email is not provided', async () => {
      const mockWithoutEmail: Partial<typeof mockUser> = mockUser;
      delete mockWithoutEmail.email;

      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue(mockWithoutEmail);

      const response = await controller.create(
        mockWithoutEmail as typeof mockUser,
      );

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledTimes(0);
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: mockWithoutEmail,
      });
      expect(response).toEqual(new UserEntity(mockWithoutEmail));
    });
  });

  describe('findAll', () => {
    it('should return a list of users', async () => {
      mockPrismaService.user.findMany.mockResolvedValue([mockUser]);

      const response = await controller.findAll();

      expect(mockPrismaService.user.findMany).toHaveBeenCalled();
      expect(response).toEqual([mockUser]);
    });

    it('should throw error error when something is wrong in the service', async () => {
      const databaseErrorMessage = 'Database connection failed';
      const databaseError = new Error(databaseErrorMessage);
      mockPrismaService.user.findMany.mockRejectedValue(databaseError);

      await expect(controller.findAll()).rejects.toThrow(databaseErrorMessage);
      expect(mockPrismaService.user.findMany).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should find user by id', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const response = await controller.findOne(1);

      expect(mockPrismaService.user.findUnique).toHaveBeenCalled();
      expect(response).toEqual(mockUser);
    });

    it('should throw NotFoundedException if id do not exist', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(controller.findOne(0)).rejects.toThrow(NotFoundException);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalled();
    });
    //
  });

  describe('update', () => {
    const updateDto = { name: 'Novo Nome', email: 'novo@email.com' };
    const updatedUser = { ...mockUser, ...updateDto };
    it('should update user with success', async () => {
      mockPrismaService.user.findUnique
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(null);
      mockPrismaService.user.update.mockResolvedValue(updatedUser);

      const response = await controller.update(mockUser.id, updatedUser);

      expect(mockPrismaService.user.findUnique).toHaveBeenCalled();
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: updatedUser,
      });
      expect(response).toEqual(new UserEntity(updatedUser));
    });

    it('should not update user if user is not founded', async () => {
      mockPrismaService.user.findUnique.mockResolvedValueOnce(null);

      await expect(controller.update(mockUser.id, updateDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockPrismaService.user.findUnique).toHaveBeenCalled();
    });

    it('should not update user if email is taken by ANOTHER user', async () => {
      const anotherUser = { id: 2, email: 'already.exist@email.com' };

      mockPrismaService.user.findUnique
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(anotherUser);

      await expect(
        controller.update(1, { email: 'already.exist@email.com' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('remove', () => {
    it('should delet user with success', async () => {
      mockPrismaService.user.findUnique.mockResolvedValueOnce(mockUser);
      mockPrismaService.user.delete.mockResolvedValue(mockUser);

      const response = await controller.remove(mockUser.id);

      expect(mockPrismaService.user.findUnique).toHaveBeenCalled();
      expect(mockPrismaService.user.delete).toHaveBeenCalledWith({
        where: { id: mockUser.id },
      });
      expect(response).toEqual(new UserEntity(mockUser));
    });
    it('should throw erro if user do not exist', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(controller.remove(0)).rejects.toThrow(NotFoundException);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalled();
    });
  });
});
