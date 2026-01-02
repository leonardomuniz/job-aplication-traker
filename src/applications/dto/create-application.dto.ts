import {
  IsEnum,
  IsNumber,
  IsString,
  IsUrl,
  Length,
} from '@nestjs/class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { FollowUpStatus, Status } from '@prisma/client';

export class CreateApplicationDto {
  @ApiProperty({
    description: 'Aplication title',
    example: 'Node develober senior',
  })
  @IsString({ message: 'Job offer title must be a string' })
  @Length(4, 30, { message: 'Title must be between 4 and 30 characters' })
  public readonly title: string;

  @ApiProperty({
    description: 'Link application',
    example: 'http://application.com',
  })
  @IsUrl({}, { message: 'Link must be valid' })
  public readonly link: string;

  @ApiProperty({
    description: 'Recruiter name',
    example: 'Bob o bobo',
  })
  @IsString({ message: 'Recruiter name must be a string' })
  @Length(4, 30, { message: 'Recruiter must be between 4 and 30 characters' })
  public readonly recruiter: string;

  @ApiProperty({
    description: 'Company name',
    example: 'Bob o bobo',
  })
  @IsString({ message: 'Company name must be a string' })
  @Length(4, 30, { message: 'Company must be between 4 and 30 characters' })
  public readonly company: string;

  @ApiProperty({
    description: 'Status off aplication',
    example: 'APPLIED | INTERVIEWING | TECHNICAL_TEST | REJECTED | ACCEPTED',
  })
  @IsEnum(Status)
  public readonly status!: Status;

  @ApiProperty({
    description: 'Status if have made the follow up',
    example: 'DONE | TO_DO',
  })
  @IsEnum(FollowUpStatus)
  public readonly followUpStatus: FollowUpStatus;

  @ApiProperty({
    description: 'Users responsible off that application',
    example: '1',
  })
  @IsNumber()
  public readonly userId: number;
}
