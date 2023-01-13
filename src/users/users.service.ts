import { Injectable } from '@nestjs/common';
import { InstagramApi } from 'src/api/instagram.api';
import { BaseResponse } from 'src/api/interfaces/api-response.interface';
import { UserType } from './enums/user-type.enum';

@Injectable()
export class UsersService {
  constructor(private instagramApi: InstagramApi) {}

  async getInfo(userType: UserType, username?: string): Promise<BaseResponse> {
    const infoByUserType = {
      [UserType.ME]: () => this.instagramApi.getMyUserInfo(),
      [UserType.OTHERS]: () => this.instagramApi.getUserInfo(username),
    };

    return await infoByUserType[userType]();
  }

  async getFeed(username: string): Promise<BaseResponse> {
    const response: BaseResponse = await this.instagramApi.getFeed(username);
    if (response.success) {
      return this.instagramApi.getMedia(true);
    }
    return response;
  }

  async getMedia(): Promise<BaseResponse> {
    return await this.instagramApi.getMedia();
  }

  async getStoryFeed(username: string): Promise<BaseResponse> {
    const response: BaseResponse = await this.instagramApi.getStoryFeed(
      username,
    );
    if (response.success) {
      return this.instagramApi.getStory(true);
    }
    return response;
  }

  async getStories(): Promise<BaseResponse> {
    return await this.instagramApi.getStory();
  }

  async getMediaByTag(
    username: string,
    hashTag: string,
  ): Promise<BaseResponse> {
    const response: BaseResponse = await this.instagramApi.getFeed(username);
    if (response.success) {
      return await this.instagramApi.getMediaByTag(hashTag);
    }
    return response;
  }

  async searchUser(searchTerm: string) {
    return this.instagramApi.searchUser(searchTerm);
  }
}
