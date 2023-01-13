import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { ApiModule } from 'src/api/api.module';

@Module({
  imports: [ApiModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
