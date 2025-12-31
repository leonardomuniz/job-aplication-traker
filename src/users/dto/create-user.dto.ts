import { IsEmail, IsString, Length } from '@nestjs/class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    description: 'Users e-mail',
    example: 'bob.bobo@outlook.com.br',
  })
  @IsEmail({}, { message: 'Invalid email address' })
  public readonly email: string;

  @ApiProperty({
    description: 'Users name',
    example: 'Bob o bobo',
  })
  @IsString()
  @Length(4, 30, { message: 'Name must be between 4 and 30 characters' })
  public readonly name: string;

  @ApiProperty({
    description: 'Users password',
    example: 'test123',
  })
  @Length(4, 20, { message: 'Password must be between 4 and 20 characters' })
  public readonly password: string;
}
