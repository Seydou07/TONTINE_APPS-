import { Controller, Get, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TransactionsService } from './transactions.service';
import { PayContributionDto } from './dto/pay-contribution.dto';
import { InitiatePayoutDto } from './dto/initiate-payout.dto';

@ApiTags('Transactions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('transactions')
export class TransactionsController {
  constructor(private transactionsService: TransactionsService) {}

  @Post('pay')
  @ApiOperation({ summary: 'Payer une cotisation' })
  pay(@Request() req: any, @Body() dto: PayContributionDto) {
    return this.transactionsService.recordContribution(req.user.id, dto);
  }

  @Post('payout')
  @ApiOperation({ summary: 'Initier un virement au bénéficiaire (président)' })
  payout(@Request() req: any, @Body() dto: InitiatePayoutDto) {
    return this.transactionsService.initiatePayout(req.user.id, dto);
  }

  @Get('my')
  @ApiOperation({ summary: 'Mes transactions' })
  getMyTransactions(@Request() req: any) {
    return this.transactionsService.getMyTransactions(req.user.id);
  }

  @Get('circle/:circleId')
  @ApiOperation({ summary: 'Transactions d\'un cercle' })
  getCircleTransactions(
    @Param('circleId') circleId: string,
    @Request() req: any,
    @Query('type') type?: string,
    @Query('status') status?: string,
    @Query('cycleId') cycleId?: string,
  ) {
    return this.transactionsService.getCircleTransactions(circleId, req.user.id, { type, status, cycleId });
  }
}
