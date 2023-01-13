import { Module } from '@nestjs/common';
import { InstagramApi } from './instagram.api';

@Module({
  providers: [InstagramApi],
  exports: [InstagramApi],
})
export class ApiModule {}
