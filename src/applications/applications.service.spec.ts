import { Test, TestingModule } from '@nestjs/testing';
import { ApplicationsService } from './applications.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { UsersService } from 'src/users/users.service';
import { FollowUpStatus, Status } from '@prisma/client';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { ApplicationEntity } from './entities/application.entity';

const mockPrismaService = {
  application: {
    create: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

const mockUsersService = {
  checkIfUserExists: jest.fn(),
};

const mockApplication = {
  title: 'Node Developer',
  id: 1,
  link: 'http://jobs.com/1',
  recruiter: 'John Doe',
  company: 'Tech Corp',
  status: Status.APPLIED,
  followUpStatus: FollowUpStatus.TO_DO,
  userId: 1,
};

const newMockApplication = {
  title: 'python Developer',
  id: 2,
  link: 'http://jobs.com/1',
  recruiter: 'Bob Gods',
  company: 'Tabajara Corp',
  status: Status.APPLIED,
  followUpStatus: FollowUpStatus.TO_DO,
  userId: 1,
};

describe('ApplicationsService', () => {
  let service: ApplicationsService;
  let prisma: typeof mockPrismaService;
  let usersService: typeof mockUsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: UsersService, useValue: mockUsersService },
      ],
    }).compile();

    service = module.get<ApplicationsService>(ApplicationsService);
    prisma = module.get(PrismaService);
    usersService = module.get(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create an application with success', async () => {
      usersService.checkIfUserExists.mockResolvedValue(true);
      prisma.application.findFirst.mockResolvedValue(null);
      prisma.application.create.mockResolvedValue({ mockApplication });

      const result = await service.create(mockApplication);

      expect(result).toBeDefined();
      expect(prisma.application.create).toHaveBeenCalledWith({
        data: mockApplication,
      });
      expect(usersService.checkIfUserExists).toHaveBeenCalledWith(
        mockApplication.userId,
      );
    });

    it('should throw error when user is not found', async () => {
      usersService.checkIfUserExists.mockRejectedValue(
        new NotFoundException('User not found'),
      );

      await expect(service.create(mockApplication)).rejects.toThrow(
        NotFoundException,
      );
      expect(prisma.application.create).not.toHaveBeenCalled();
    });

    it('should throw error when application already exists', async () => {
      usersService.checkIfUserExists.mockResolvedValue(true);
      prisma.application.findFirst.mockResolvedValue({ mockApplication });

      await expect(service.create(mockApplication)).rejects.toThrow(
        ConflictException,
      );
      expect(prisma.application.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return a list of applications', async () => {
      const applicationsArray = [mockApplication, newMockApplication];
      prisma.application.findMany.mockResolvedValue(applicationsArray);

      const result = await service.findAll();

      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(ApplicationEntity);
      expect(prisma.application.findMany).toHaveBeenCalledTimes(1);
    });

    it('should throw an error if something goes wrong', async () => {
      prisma.application.findMany.mockRejectedValue(new Error('DB Error'));

      await expect(service.findAll()).rejects.toThrow();
    });
  });

  describe('findOne', () => {
    it('should return an application entity when found', async () => {
      const applicationId = 1;
      prisma.application.findUnique.mockResolvedValue(mockApplication);

      const result = await service.findOne(applicationId);

      expect(result).toBeInstanceOf(ApplicationEntity);
      expect(result?.id).toBe(applicationId);
      expect(prisma.application.findUnique).toHaveBeenCalledWith({
        where: { id: applicationId },
      });
    });

    it('should throw NotFoundException if application is not found', async () => {
      const applicationId = 999;

      prisma.application.findUnique.mockResolvedValue(null);

      await expect(service.findOne(applicationId)).rejects.toThrow(
        NotFoundException,
      );

      await expect(service.findOne(applicationId)).rejects.toThrow(
        `Application with ID ${applicationId} not found`,
      );

      expect(prisma.application.findUnique).toHaveBeenCalledWith({
        where: { id: applicationId },
      });
    });

    it('should throw an error if database fails', async () => {
      prisma.application.findUnique.mockRejectedValue(
        new Error('Connection failed'),
      );

      await expect(service.findOne(1)).rejects.toThrow();
    });
  });

  describe('update', () => {
    const updateDto = { title: 'Updated Job Title' };

    it('should update application with success', async () => {
      const updatedApplication = { ...mockApplication, ...updateDto };

      prisma.application.findUnique.mockResolvedValue(mockApplication);
      prisma.application.update = jest
        .fn()
        .mockResolvedValue(updatedApplication);

      const result = await service.update(mockApplication.id, updateDto);

      expect(result).toBeInstanceOf(ApplicationEntity);
      expect(result.title).toBe(updateDto.title);
      expect(prisma.application.findUnique).toHaveBeenCalledWith({
        where: { id: mockApplication.id },
      });
    });

    it('should throw error if application do not exist', async () => {
      prisma.application.findUnique.mockResolvedValue(null);

      await expect(
        service.update(mockApplication.id, updateDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove application with success', async () => {
      prisma.application.findUnique.mockResolvedValue(mockApplication);
      prisma.application.delete = jest.fn().mockResolvedValue(mockApplication);

      const result = await service.remove(mockApplication.id);

      expect(result).toBeInstanceOf(ApplicationEntity);
      expect(prisma.application.delete).toHaveBeenCalledWith({
        where: { id: mockApplication.id },
      });
    });

    it('should throw error if application do not exist', async () => {
      prisma.application.findUnique.mockResolvedValue(null);

      await expect(service.remove(mockApplication.id)).rejects.toThrow(
        NotFoundException,
      );
      expect(prisma.application.delete).not.toHaveBeenCalled();
    });
  });
});
