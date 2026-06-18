import { NotificationTypes } from '../notifications.enums';

export class NotifyUserPayloadDto {
  notificationType: NotificationTypes;
  skillName: string;
  fromUserId: string;
  fromUserName?: string;
}