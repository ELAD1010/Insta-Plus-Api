import { Controller, Get, Post, Body } from '@nestjs/common';
import {
  ApiBody,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginCredentialsDto } from './dto/user-credentials.dto';
import { BaseResponse } from '../api/interfaces/api-response.interface';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiBody({ type: LoginCredentialsDto })
  @ApiOkResponse({ status: 200, description: 'Login Successfully' })
  @ApiInternalServerErrorResponse({
    status: 500,
    description: 'Failed To Log In',
  })
  create(@Body() loginCredentials: LoginCredentialsDto) {
    return this.authService.login(loginCredentials);
  }
}
