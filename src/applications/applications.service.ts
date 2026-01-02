import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UsersService } from 'src/users/users.service';
import { ApplicationEntity } from './entities/application.entity';

@Injectable()
export class ApplicationsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly usersService: UsersService,
  ) {}

  private readonly serviceName: string = 'ApplicationService';

  public async create(input: CreateApplicationDto) {
    const { userId, link } = input;
    Logger.log(
      `${this.serviceName} :: create :: start create application > userId :: ${userId}`,
    );

    try {
      await this.usersService.checkIfUserExists(userId);
      await this.checkIfApplicationIsRepeated(userId, link);

      const response = await this.prismaService.application.create({
        data: input,
      });

      return new ApplicationEntity(response);
    } catch (error) {
      Logger.error(
        `${this.serviceName} :: create :: error while creating application`,
      );
      throw error;
    }
  }

  public async findAll(): Promise<ApplicationEntity[]> {
    try {
      Logger.log(`${this.serviceName} :: findAll :: start findAll method`);

      const applications = await this.prismaService.application.findMany();

      return applications.map((user) => new ApplicationEntity(user));
    } catch (error) {
      Logger.error(
        `${this.serviceName} :: findAll :: error while find all applications`,
      );
      throw error;
    }
  }

  public async findOne(id: number): Promise<ApplicationEntity> {
    try {
      Logger.log(
        `${this.serviceName} :: findOne :: start find application ${id}`,
      );

      const response = await this.prismaService.application.findUnique({
        where: { id },
      });

      if (!response) {
        throw new NotFoundException(`Application with ID ${id} not found`);
      }

      return new ApplicationEntity(response);
    } catch (error) {
      Logger.error(
        `${this.serviceName} :: findOne :: error while find  application ${id}`,
      );
      throw error;
    }
  }

  public async update(
    id: number,
    input: UpdateApplicationDto,
  ): Promise<ApplicationEntity> {
    try {
      Logger.log(
        `${this.serviceName} :: update :: start update application ${id}`,
      );

      await this.checkIfApplicationExists(id);

      const response = await this.prismaService.application.update({
        where: { id },
        data: input,
      });

      return new ApplicationEntity(response);
    } catch (error) {
      Logger.error(
        `${this.serviceName} :: update :: error while updating application ${id}`,
      );
      throw error;
    }
  }

  public async remove(id: number): Promise<ApplicationEntity> {
    try {
      Logger.log(
        `${this.serviceName} :: remove :: start delete application ${id}`,
      );

      await this.checkIfApplicationExists(id);

      const response = await this.prismaService.application.delete({
        where: { id },
      });

      return new ApplicationEntity(response);
    } catch (error) {
      Logger.error(
        `${this.serviceName} :: remove :: error while deleting application ${id}`,
      );
      throw error;
    }
  }

  private async checkIfApplicationIsRepeated(userId: number, link: string) {
    const applicationExists = await this.prismaService.application.findFirst({
      where: {
        userId,
        link,
      },
    });

    if (applicationExists) {
      Logger.error(
        `${this.serviceName} :: checkIfApplicationExists :: email founded`,
      );
      throw new ConflictException(
        `You have already registered an application with this link.`,
      );
    }
  }

  public async checkIfApplicationExists(id: number) {
    const applicationExists = await this.prismaService.application.findUnique({
      where: { id },
    });

    if (!applicationExists) {
      Logger.error(
        `${this.serviceName} :: checkIfApplicationExists :: application not founded`,
      );
      throw new NotFoundException(`Application with ID ${id} not found`);
    }

    return applicationExists;
  }
}
