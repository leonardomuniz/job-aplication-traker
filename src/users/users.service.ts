import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserEntity } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}

  private readonly serviceName: string = 'UserService';

  public async create(input: CreateUserDto): Promise<UserEntity> {
    const { email, name } = input;
    Logger.log(`${this.serviceName} :: create :: start create user > ${name}`);

    try {
      await this.checkIfEmailExists(email);

      const response = await this.prismaService.user.create({ data: input });

      return new UserEntity(response);
    } catch (error) {
      Logger.error(
        `${this.serviceName} :: create :: error while creating user`,
      );
      throw error;
    }
  }

  public async findAll(): Promise<UserEntity[]> {
    try {
      Logger.log(`${this.serviceName} :: findAll :: start findAll method`);

      const users = await this.prismaService.user.findMany({
        include: { applications: true },
      });

      return users.map((user) => new UserEntity(user));
    } catch (error) {
      Logger.error(
        `${this.serviceName} :: findAll :: error while find all users`,
      );
      throw error;
    }
  }

  public async findOne(id: number): Promise<UserEntity> {
    try {
      Logger.log(`${this.serviceName} :: findOne :: start find user ${id}`);

      const response = await this.checkIfUserExists(id);

      return new UserEntity(response);
    } catch (error) {
      Logger.error(
        `${this.serviceName} :: findOne :: error while find  user ${id}`,
      );
      throw error;
    }
  }

  public async update(id: number, input: UpdateUserDto): Promise<UserEntity> {
    const { email } = input;
    try {
      Logger.log(`${this.serviceName} :: update :: start update user ${id}`);

      await this.checkIfUserExists(id);
      await this.checkIfEmailExists(email, id);

      const response = await this.prismaService.user.update({
        where: { id },
        data: input,
      });

      return new UserEntity(response);
    } catch (error) {
      Logger.error(
        `${this.serviceName} :: update :: error while updating user ${id}`,
      );
      throw error;
    }
  }

  public async remove(id: number): Promise<UserEntity> {
    try {
      Logger.log(`${this.serviceName} :: remove :: start delete user ${id}`);

      await this.checkIfUserExists(id);

      const response = await this.prismaService.user.delete({ where: { id } });

      return new UserEntity(response);
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

  private async checkIfEmailExists(email?: string, userId?: number) {
    if (!email) {
      return;
    }

    const emailExists = await this.prismaService.user.findUnique({
      where: { email },
      include: { applications: true },
    });

    if (emailExists && emailExists.id !== userId) {
      Logger.error(
        `${this.serviceName} :: checkIfEmailExists :: email founded`,
      );
      throw new ConflictException(
        `User with email '${email}' ealready registered`,
      );
    }
  }
}
