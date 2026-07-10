import { RequestStatus } from '../../requests/requests.enums';

export class NotifyUserPayloadDto {
  notificationType: RequestStatus;
  skillName: string;
  fromUserId: string;
  fromUserName?: string;
}
