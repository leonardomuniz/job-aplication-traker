import { FollowUpStatus, Status } from '@prisma/client';

export class ApplicationEntity {
  public readonly id: number;
  public readonly title: string;
  public readonly link: string;
  public readonly recruiter: string;
  public readonly company: string;
  public readonly status: Status;
  public readonly followUpStatus: FollowUpStatus;
  public readonly userId: number | null;

  constructor(partial: Partial<ApplicationEntity>) {
    Object.assign(this, partial);
  }
}
