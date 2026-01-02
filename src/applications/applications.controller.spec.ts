import { Test, TestingModule } from '@nestjs/testing';
import { ApplicationsController } from './applications.controller';
import { ApplicationsService } from './applications.service';
import { Status, FollowUpStatus } from '@prisma/client';
import { ApplicationEntity } from './entities/application.entity';

describe('ApplicationsController', () => {
  let controller: ApplicationsController;
  let service: ApplicationsService;

  const mockApplicationEntity = new ApplicationEntity({
    id: 1,
    title: 'Node Developer',
    link: 'http://jobs.com/1',
    recruiter: 'John Doe',
    company: 'Tech Corp',
    status: Status.APPLIED,
    followUpStatus: FollowUpStatus.TO_DO,
    userId: 1 satisfies number,
  });

  const mockService = {
    create: jest.fn().mockResolvedValue(mockApplicationEntity),
    findAll: jest.fn().mockResolvedValue([mockApplicationEntity]),
    findOne: jest.fn().mockResolvedValue(mockApplicationEntity),
    update: jest.fn().mockResolvedValue(mockApplicationEntity),
    remove: jest.fn().mockResolvedValue(mockApplicationEntity),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApplicationsController],
      providers: [
        {
          provide: ApplicationsService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<ApplicationsController>(ApplicationsController);
    service = module.get<ApplicationsService>(ApplicationsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call service.create with correct values', async () => {
      const dto = { ...mockApplicationEntity };
      delete dto.id; // DTO de criação geralmente não tem ID

      const result = await controller.create(
        dto satisfies Partial<ApplicationEntity>,
      );

      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockApplicationEntity);
    });
  });

  describe('findAll', () => {
    it('should call service.findAll', async () => {
      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual([mockApplicationEntity]);
    });
  });

  describe('findOne', () => {
    it('should call service.findOne with correct ID', async () => {
      const id = '1';
      const result = await controller.findOne(id);

      expect(service.findOne).toHaveBeenCalledWith(+id);
      expect(result).toEqual(mockApplicationEntity);
    });
  });

  describe('update', () => {
    it('should call service.update with correct values', async () => {
      const id = '1';
      const updateDto = { title: 'New Title' };

      const result = await controller.update(id, updateDto as any);

      expect(service.update).toHaveBeenCalledWith(+id, updateDto);
      expect(result).toEqual(mockApplicationEntity);
    });
  });

  describe('remove', () => {
    it('should call service.remove with correct ID', async () => {
      const id = '1';
      const result = await controller.remove(id);

      expect(service.remove).toHaveBeenCalledWith(+id);
      expect(result).toEqual(mockApplicationEntity);
    });
  });
});
