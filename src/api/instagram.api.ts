import {
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  IgApiClient,
  UserFeed,
  UserFeedResponseCarouselMediaItem,
  UserFeedResponseItemsItem,
  UserRepositoryInfoResponseUser,
  UserRepositorySearchResponseRootObject,
  UserStoryFeedResponseItemsItem,
} from 'instagram-private-api';
import { UserStoryFeed } from 'instagram-private-api/dist/feeds/user-story.feed';
import { LoginCredentialsDto } from 'src/auth/dto/user-credentials.dto';
import { MediaType } from './enums/media_type.enum';
import { ErrorResponseMessage } from './enums/response-message.enum';
import { Status } from './enums/status.enum';
import { BaseResponse } from './interfaces/api-response.interface';

export class InstagramApi {
  private api: IgApiClient;
  private userInfo: UserRepositoryInfoResponseUser;
  private currentFeed: UserFeed;
  private storyFeed: UserStoryFeed;
  constructor() {
    this.api = new IgApiClient();
  }

  async login(loginCredentials: LoginCredentialsDto): Promise<BaseResponse> {
    const { username, password } = loginCredentials;
    console.log(username, password);
    this.api.state.generateDevice(username);
    try {
      await this.api.simulate.preLoginFlow();
      const user = await this.api.account.login(username, password);
      process.nextTick(async () => await this.api.simulate.postLoginFlow());
      const { data } = await this.getUserInfo(user.username);
      this.userInfo = data;
      return { success: true, status: Status.SUCCESS, data: this.userInfo };
    } catch (err) {
      throw new UnauthorizedException(ErrorResponseMessage.LOGIN_FAILED);
    }
  }

  async getMyUserInfo(): Promise<BaseResponse> {
    return { success: true, status: Status.SUCCESS, data: this.userInfo };
  }

  async getUserInfo(username: string): Promise<BaseResponse> {
    try {
      const userInfo: UserRepositoryInfoResponseUser =
        await this.api.user.usernameinfo(username);
      return { success: true, status: Status.SUCCESS, data: userInfo };
    } catch (err) {
      throw new InternalServerErrorException(
        ErrorResponseMessage.USER_INFO_FAILED,
      );
    }
  }

  async getFeed(username: string): Promise<BaseResponse> {
    try {
      const userId: number = await this.api.user.getIdByUsername(username);
      if (!(await this.isPrivateAccount(userId))) {
        this.currentFeed = this.api.feed.user(userId);
        return { success: true, status: Status.SUCCESS };
      } else {
        return {
          success: false,
          status: Status.ACCESS_DENIED,
          message: ErrorResponseMessage.PRIVATE_ACCOUNT_FEED,
        };
      }
    } catch (err) {
      throw new InternalServerErrorException(
        ErrorResponseMessage.USER_FEED_FAILED,
      );
    }
  }

  async getMedia(firstMediaFetch: boolean = false): Promise<BaseResponse> {
    try {
      if (firstMediaFetch || this.currentFeed.isMoreAvailable()) {
        const mediaItems: UserFeedResponseItemsItem[] =
          await this.currentFeed.items();
        const mediaMapper = this.getMediaMapper();
        const parsedMediaItems = mediaItems.map(
          (media: UserFeedResponseItemsItem) => {
            return mediaMapper[media.media_type](media);
          },
        );
        return {
          success: true,
          status: Status.SUCCESS,
          data: parsedMediaItems,
        };
      } else {
        return { success: true, status: Status.SUCCESS, data: [] };
      }
    } catch (err) {
      throw new InternalServerErrorException(
        ErrorResponseMessage.USER_MEDIA_FAILED,
      );
    }
  }

  private getMediaMapper() {
    return {
      [MediaType.IMAGE]: this.getImageMediaObject,
      [MediaType.VIDEO]: this.getVideoMediaObject,
      [MediaType.CAROUSEL]: this.getCarouselMediaObject,
    };
  }

  private getCarouselMediaObject(media: UserFeedResponseItemsItem) {
    const carouselMedia = JSON.parse(JSON.stringify(media.carousel_media));
    const mediaArr = carouselMedia.map((media) => {
      return {
        mediaType: media.media_type,
        mediaUrl:
          media.media_type == MediaType.IMAGE
            ? media.image_versions2.candidates[0].url
            : media.video_versions[0].url,
        mediaPreview: media.image_versions2.candidates[0].url,
      };
    });
    return {
      mediaType: MediaType.CAROUSEL,
      mediaCount: media.carousel_media_count,
      mediaArr: mediaArr,
      commentCount: media.comment_count,
      likeCount: media.like_count,
    };
  }

  private getImageMediaObject(media: UserFeedResponseItemsItem) {
    return {
      mediaType: MediaType.IMAGE,
      mediaUrl: media.image_versions2.candidates[0].url,
      commentCount: media.comment_count,
      likeCount: media.like_count,
    };
  }

  private getVideoMediaObject(media: UserFeedResponseItemsItem) {
    return {
      mediaType: MediaType.VIDEO,
      mediaUrl: media.video_versions[0].url,
      videoLength: media.video_duration.toString(),
      videoPreview: media.image_versions2.candidates[0].url,
      commentCount: media.comment_count,
      likeCount: media.like_count,
    };
  }

  async getStoryFeed(username: string): Promise<BaseResponse> {
    try {
      const userId: number = await this.api.user.getIdByUsername(username);
      if (!(await this.isPrivateAccount(userId))) {
        this.storyFeed = this.api.feed.userStory(userId);
        return { success: true, status: Status.SUCCESS };
      } else {
        return {
          success: false,
          status: Status.ACCESS_DENIED,
          message: ErrorResponseMessage.PRIVATE_ACCOUNT_STORIES,
        };
      }
    } catch (err) {
      throw new InternalServerErrorException(
        ErrorResponseMessage.USER_STORY_FEED_FAILED,
      );
    }
  }

  async getStory(firstStoryFetch: boolean = false): Promise<BaseResponse> {
    try {
      if (firstStoryFetch || this.storyFeed.isMoreAvailable()) {
        const mediaItems: UserStoryFeedResponseItemsItem[] =
          await this.storyFeed.items();
        const storyMapper = this.getStoryMapper();
        const parsedMediaItems = mediaItems.map(
          (media: UserStoryFeedResponseItemsItem) => {
            return storyMapper[media.media_type](media);
          },
        );
        return {
          success: true,
          status: Status.SUCCESS,
          data: parsedMediaItems,
        };
      } else {
        return { success: true, status: Status.SUCCESS, data: [] };
      }
    } catch (err) {
      throw new InternalServerErrorException(
        ErrorResponseMessage.USER_STORY_FAILED,
      );
    }
  }

  private getStoryMapper() {
    return {
      [MediaType.IMAGE]: this.getImageStoryObject,
      [MediaType.VIDEO]: this.getVideoStoryObject,
    };
  }

  private getImageStoryObject(media: UserStoryFeedResponseItemsItem) {
    return {
      MediaType: MediaType.IMAGE,
      mediaUrl: media.image_versions2.candidates[0].url,
    };
  }

  private getVideoStoryObject(media: UserStoryFeedResponseItemsItem) {
    return {
      MediaType: MediaType.VIDEO,
      mediaUrl: media.video_versions[0].url,
      videoLength: media.video_duration,
    };
  }

  private async isPrivateAccount(userId: number): Promise<boolean> {
    try {
      const { is_private } = await this.api.user.info(userId);
      return is_private;
    } catch (err) {
      throw new InternalServerErrorException(
        ErrorResponseMessage.API_CONNECTION_FAILED,
      );
    }
  }

  async getMediaByTag(hashTag: string): Promise<BaseResponse> {
    try {
      const relatedMediaToHashtag: UserFeedResponseItemsItem[] = [];
      const mediaMapper = this.getMediaMapper();
      const items = await this.currentFeed.items();
      items.forEach((item) => {
        const parsedCaption = JSON.parse(JSON.stringify(item.caption));
        if (this.isIncludedHashTag(parsedCaption, hashTag)) {
          relatedMediaToHashtag.push(mediaMapper[item.media_type](item));
        }
      });
      while (this.currentFeed.isMoreAvailable()) {
        const items = await this.currentFeed.items();
        items.forEach((item) => {
          const parsedCaption = JSON.parse(JSON.stringify(item.caption));
          if (this.isIncludedHashTag(parsedCaption, hashTag)) {
            relatedMediaToHashtag.push(mediaMapper[item.media_type](item));
          }
        });
      }
      return {
        success: true,
        status: Status.SUCCESS,
        data: relatedMediaToHashtag,
      };
    } catch (err) {
      throw new InternalServerErrorException(
        ErrorResponseMessage.USER_MEDIA_BY_TAG_FAILED,
      );
    }
  }

  private isIncludedHashTag(caption: any, tag: string) {
    const hashTag = '#' + tag;
    if (!caption || !caption.text.includes(hashTag)) return false;
    return true;
  }

  async searchUser(searchTerm: string) {
    try {
      const usersResult: UserRepositorySearchResponseRootObject =
        await this.api.user.search(searchTerm);
      return { success: true, status: Status.SUCCESS, data: usersResult.users };
    } catch (err) {
      throw new InternalServerErrorException(
        ErrorResponseMessage.USER_SEARCH_FAILED,
      );
    }
  }
}
