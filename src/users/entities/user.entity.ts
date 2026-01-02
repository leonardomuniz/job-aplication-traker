import { Exclude } from 'class-transformer';

export class UserEntity {
  public readonly id: number;
  public readonly email: string;
  public readonly name: string;

  @Exclude()
  public readonly password?: string;

  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }
}
