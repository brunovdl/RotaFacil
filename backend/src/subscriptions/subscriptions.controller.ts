import { Controller, Get, Post, Body, Param, Query, Headers, UseGuards } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CreatePixPaymentDto } from './dto/create-pix-payment.dto';
import { CreateCardPaymentDto } from './dto/create-card-payment.dto';

@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get()
  @UseGuards(AuthGuard)
  getSubscription(@CurrentUser() user: any) {
    return this.subscriptionsService.getSubscription(user.id);
  }

  @Post('activate')
  @UseGuards(AuthGuard)
  activate(@CurrentUser() user: any) {
    return this.subscriptionsService.activateSubscription(user.id);
  }

  @Post('cancel')
  @UseGuards(AuthGuard)
  cancel(@CurrentUser() user: any) {
    return this.subscriptionsService.cancelSubscription(user.id);
  }

  @Post('pix')
  @UseGuards(AuthGuard)
  createPix(@CurrentUser() user: any, @Body() dto: CreatePixPaymentDto) {
    return this.subscriptionsService.createPixPayment(user.id, dto);
  }

  @Post('card')
  @UseGuards(AuthGuard)
  createCard(@CurrentUser() user: any, @Body() dto: CreateCardPaymentDto) {
    return this.subscriptionsService.createCardPayment(user.id, dto);
  }

  @Get('check-payment/:paymentId')
  @UseGuards(AuthGuard)
  checkPayment(@Param('paymentId') paymentId: string, @CurrentUser() user: any) {
    return this.subscriptionsService.checkPaymentStatus(paymentId, user.id);
  }

  @Post('webhook')
  handleWebhook(
    @Body() body: any,
    @Query() query: any,
    @Headers('x-signature') signature?: string,
  ) {
    return this.subscriptionsService.handleWebhook(body, query, signature);
  }
}

