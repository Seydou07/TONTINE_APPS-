import { Controller, Get, Post, Patch, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SolidarityService } from './solidarity.service';
import { SubmitAidRequestDto, VoteAidRequestDto } from '@venega/types';

@ApiTags('Solidarity')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('solidarity')
export class SolidarityController {
  constructor(private solidarityService: SolidarityService) {}

  @Post('requests')
  @ApiOperation({ summary: 'Soumettre une demande d\'aide' })
  submitRequest(@Request() req: any, @Body() dto: SubmitAidRequestDto) {
    return this.solidarityService.submitRequest(req.user.id, dto);
  }

  @Post('requests/:id/vote')
  @ApiOperation({ summary: 'Voter sur une demande d\'aide' })
  vote(
    @Param('id') id: string,
    @Request() req: any,
    @Body() body: { approved: boolean },
  ) {
    return this.solidarityService.vote(id, req.user.id, body.approved);
  }

  @Get('circles/:circleId/requests')
  @ApiOperation({ summary: 'Demandes d\'aide d\'un cercle' })
  getCircleRequests(@Param('circleId') circleId: string, @Request() req: any) {
    return this.solidarityService.getCircleRequests(circleId, req.user.id);
  }

  @Patch('requests/:id/disburse')
  @ApiOperation({ summary: 'Décaisser les fonds (président)' })
  disburse(@Param('id') id: string, @Request() req: any) {
    return this.solidarityService.disburse(id, req.user.id);
  }
}
