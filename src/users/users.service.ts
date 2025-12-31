import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}

  private readonly serviceName: string = 'UserService';

  public async create(input: CreateUserDto) {
    const { email, name } = input;
    Logger.log(`${this.serviceName} :: create :: start create user > ${name}`);

    try {
      const userExists = await this.prismaService.user.findUnique({
        where: { email },
      });
      Logger.log(
        `${this.serviceName} :: create :: check if user already exist`,
      );

      if (userExists) {
        Logger.error(`${this.serviceName} :: create :: user founded`);
        throw new ConflictException('Email already registered');
      }
      return this.prismaService.user.create({
        data: input,
      });
    } catch (error) {
      Logger.error(
        `${this.serviceName} :: create :: error while creating user`,
      );
      throw error;
    }
  }

  public async findAll() {
    try {
      Logger.log(`${this.serviceName} :: findAll :: start findAll method`);

      const response = await this.prismaService.user.findMany({
        include: { applications: true },
      });

      return response;
    } catch (error) {
      Logger.error(
        `${this.serviceName} :: findAll :: error while find all users`,
      );
      throw error;
    }
  }

  public async findOne(id: number) {
    try {
      Logger.log(`${this.serviceName} :: findOne :: start find user ${id}`);

      const userExists = await this.checkIfUserExists(id);

      return userExists;
    } catch (error) {
      Logger.error(
        `${this.serviceName} :: findOne :: error while find  user ${id}`,
      );
      throw error;
    }
  }

  public async update(id: number, updateUserDto: UpdateUserDto) {
    try {
      Logger.log(`${this.serviceName} :: update :: start update user ${id}`);

      await this.checkIfUserExists(id);

      const response = await this.prismaService.user.update({
        where: { id },
        data: updateUserDto,
      });

      return response;
    } catch (error) {
      Logger.error(
        `${this.serviceName} :: update :: error while updating user ${id}`,
      );
      throw error;
    }
  }

  public async remove(id: number) {
    try {
      Logger.log(`${this.serviceName} :: remove :: start delete user ${id}`);

      await this.checkIfUserExists(id);

      const response = await this.prismaService.user.delete({
        where: { id },
      });

      return response;
    } catch (error) {
      Logger.error(
        `${this.serviceName} :: remove :: error while deleting user ${id}`,
      );
      throw error;
    }
  }

  private async checkIfUserExists(id: number) {
    const userExists = await this.prismaService.user.findUnique({
      where: { id },
      include: { applications: true },
    });

    if (!userExists) {
      Logger.error(
        `${this.serviceName} :: checkIfUserExists :: user not founded`,
      );
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return userExists;
  }
}
