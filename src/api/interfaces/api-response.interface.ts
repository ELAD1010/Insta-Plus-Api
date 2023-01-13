import { ErrorResponseMessage } from '../enums/response-message.enum';
import { Status } from '../enums/status.enum';

export interface BaseResponse {
  success: boolean;
  status: Status;
  message?: ErrorResponseMessage;
  data?: any;
}
