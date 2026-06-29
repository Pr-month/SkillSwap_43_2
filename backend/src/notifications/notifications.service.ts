import { BadRequestException, Injectable } from '@nestjs/common';
import { NotifyUserPayloadDto } from './dto/notify-user-payload.dto';
import { notifications } from './notifications.enums';

@Injectable()
export class NotificationsService {
  constructor() {}

  createNotification(payload: NotifyUserPayloadDto): string {
    const notificationInfo = notifications.find(
      (n) => n[0] === payload.notificationType,
    );
    if (notificationInfo) {
      return `${notificationInfo[1]} ${payload.fromUserName ?? payload.fromUserId}`;
    } else {
      throw new BadRequestException('Unknown notification type');
    }
  }
}
