import { Exclude } from 'class-transformer';

export class UserEntity {
  id: number;
  email: string;
  name: string;

  @Exclude()
  password?: string;

  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }
}
