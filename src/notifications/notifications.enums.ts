import { RequestStatus } from '../requests/requests.enums';
type NotificationInfo = [RequestStatus, string];

export const notifications: NotificationInfo[] = [
  [
    RequestStatus.NEWREQ,
    'Получен новый запрос на обмен навыками от пользователя',
  ],
  [
    RequestStatus.REJECTED,
    'Ваш запрос на обмен навыками отклонен пользователем',
  ],
  [RequestStatus.APPROVED, 'Ваш запрос на обмен навыками принят пользователем'],
];
