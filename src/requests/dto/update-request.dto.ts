import { PartialType } from '@nestjs/mapped-types';
import { CreateRequestDto } from './create-request.dto';
import { RequestStatus } from '../requests.enums';

export class UpdateRequestDto extends PartialType(CreateRequestDto) {
  status: RequestStatus;
}
