import { Injectable } from '@nestjs/common';
import { InstagramApi } from 'src/api/instagram.api';
import { LoginCredentialsDto } from './dto/user-credentials.dto';

@Injectable()
export class AuthService {
  constructor(private instagramApi: InstagramApi) {}
  async login(loginCredentials: LoginCredentialsDto) {
    return this.instagramApi.login(loginCredentials);
  }
}
