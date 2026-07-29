import { Controller, Get, Put, Delete, Body, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import * as bcrypt from 'bcryptjs';

@Controller('users')
@UseGuards(AuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  getProfile(@CurrentUser() user: any) {
    return this.usersService.findById(user.id);
  }

  @Put('profile')
  updateProfile(
    @CurrentUser() user: any,
    @Body() data: { name?: string; email?: string },
  ) {
    return this.usersService.updateProfile(user.id, data);
  }

  @Put('password')
  async updatePassword(
    @CurrentUser() user: any,
    @Body('password') password: string,
  ) {
    const hashedPassword = await bcrypt.hash(password, 10);
    return this.usersService.updatePassword(user.id, hashedPassword);
  }

  @Delete('account')
  deleteAccount(@CurrentUser() user: any) {
    return this.usersService.deleteAccount(user.id);
  }
}
