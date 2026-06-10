import { PartialType } from '@nestjs/mapped-types';
import { CreateRequestDto } from './create-request.dto';
import { Status } from '../requests.enums';

export class UpdateRequestDto extends PartialType(CreateRequestDto) {
  status: Status;
}
