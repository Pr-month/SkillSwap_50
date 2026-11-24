import { IsIn } from 'class-validator';
import { RequestStatus } from '../request.enums';

export class UpdateRequestDto {
  @IsIn([RequestStatus.ACCEPTED, RequestStatus.REJECTED], {
    message: 'status must be either "accepted" or "rejected"',
  })
  status!: RequestStatus;
}
