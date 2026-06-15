import { Module } from '@nestjs/common';
import { NotificationsGateWay } from './notifications-gateway';

@Module({
  providers: [NotificationsGateWay],
})
export class NotificationsModule {}
