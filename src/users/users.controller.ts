import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { UserType } from './enums/user-type.enum';
import { UsersService } from './users.service';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('info/me')
  @ApiOkResponse({ status: 200, description: 'Current User Info Response' })
  @ApiInternalServerErrorResponse({
    status: 500,
    description: 'Failed To Fetch Current User Info',
  })
  getMyInfo() {
    return this.usersService.getInfo(UserType.ME);
  }

  @Get('info/:username')
  @ApiParam({
    name: 'username',
    type: String,
    description: 'The Username Of The Target User',
  })
  @ApiOkResponse({ status: 200, description: 'User Info Response' })
  @ApiInternalServerErrorResponse({
    status: 500,
    description: 'Failed To Fetch User Info',
  })
  getInfo(@Param('username') username: string) {
    return this.usersService.getInfo(UserType.OTHERS, username);
  }

  @Get('feed/:username')
  @ApiParam({
    name: 'username',
    type: String,
    description: 'The Username Of The Target User',
  })
  @ApiOkResponse({ status: 200, description: 'User Feed Response' })
  @ApiInternalServerErrorResponse({
    status: 500,
    description: 'Failed To Fetch User Feed',
  })
  getFeed(@Param('username') username: string) {
    return this.usersService.getFeed(username);
  }

  @Get('media')
  @ApiParam({
    name: 'username',
    type: String,
    description: 'The Username Of The Target User',
  })
  @ApiOkResponse({ status: 200, description: 'User Media Response' })
  @ApiInternalServerErrorResponse({
    status: 500,
    description: 'Failed To Fetch User Media',
  })
  getMedia() {
    return this.usersService.getMedia();
  }

  @Get('story-feed/:username')
  @ApiParam({
    name: 'username',
    type: String,
    description: 'The Username Of The Target User',
  })
  @ApiOkResponse({ status: 200, description: 'User Story Feed Response' })
  @ApiInternalServerErrorResponse({
    status: 500,
    description: 'Failed To Fetch User Story Feed',
  })
  getStoryFeed(@Param('username') username: string) {
    return this.usersService.getStoryFeed(username);
  }

  @Get('story')
  @ApiParam({
    name: 'username',
    type: String,
    description: 'The Username Of The Target User',
  })
  @ApiOkResponse({ status: 200, description: 'User Story Response' })
  @ApiInternalServerErrorResponse({
    status: 500,
    description: 'Failed To Fetch User Stories',
  })
  getStories() {
    return this.usersService.getStories();
  }

  @Get('media-by-tag/:username')
  @ApiParam({
    name: 'username',
    type: String,
    description: 'The Username Of The Target User',
  })
  @ApiQuery({ name: 'tag', type: String, description: 'The Hashtag To Search' })
  @ApiOkResponse({ status: 200, description: 'User Media By Tag Response' })
  @ApiInternalServerErrorResponse({
    status: 500,
    description: 'Failed To Fetch User Media By Tag',
  })
  getMediaByTag(
    @Param('username') username: string,
    @Query('tag') hashTag: string,
  ) {
    return this.usersService.getMediaByTag(username, hashTag);
  }

  @Get('search')
  @ApiQuery({
    name: 'searchTerm',
    type: String,
    description: 'The Username To Search For',
  })
  @ApiOkResponse({ status: 200, description: 'User Search Results' })
  @ApiInternalServerErrorResponse({
    status: 500,
    description: 'Failed To Fetch Users',
  })
  searchUsers(@Query('searchTerm') searchTerm: string) {
    console.log(searchTerm);
    return this.usersService.searchUser(searchTerm);
  }
}
