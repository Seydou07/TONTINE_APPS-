import { Controller, Get, Post, Patch, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CirclesService } from './circles.service';
import { CreateCircleDto } from '@venega/types';

@ApiTags('Circles')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('circles')
export class CirclesController {
  constructor(private circlesService: CirclesService) {}

  @Post()
  @ApiOperation({ summary: 'Créer un nouveau cercle' })
  create(@Request() req: any, @Body() dto: CreateCircleDto) {
    return this.circlesService.create(req.user.id, dto);
  }

  @Get('my')
  @ApiOperation({ summary: 'Mes cercles' })
  getMyCircles(@Request() req: any) {
    return this.circlesService.getMyCircles(req.user.id);
  }

  @Get('join/:inviteCode')
  @ApiOperation({ summary: 'Consulter un cercle via le code d\'invitation' })
  findByInviteCode(@Param('inviteCode') inviteCode: string) {
    return this.circlesService.findByInviteCode(inviteCode);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Détails d\'un cercle' })
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.circlesService.findById(id, req.user.id);
  }

  @Post(':id/join')
  @ApiOperation({ summary: 'Demander à rejoindre un cercle' })
  requestJoin(
    @Param('id') id: string,
    @Request() req: any,
    @Body() body: {
      fullName: string;
      phoneNumber: string;
      depositNumber: string;
      cnibFrontUrl: string;
      cnibBackUrl: string;
      conditionsAccepted: boolean;
    },
  ) {
    return this.circlesService.requestJoin(req.user.id, id, body);
  }

  @Get(':id/requests')
  @ApiOperation({ summary: 'Voir les demandes d\'adhésion (président)' })
  getJoinRequests(@Param('id') id: string, @Request() req: any) {
    return this.circlesService.getJoinRequests(id, req.user.id);
  }

  @Patch('requests/:requestId')
  @ApiOperation({ summary: 'Valider ou rejeter une demande d\'adhésion' })
  decideJoinRequest(
    @Param('requestId') requestId: string,
    @Request() req: any,
    @Body() body: { approved: boolean; rejectionReason?: string },
  ) {
    return this.circlesService.decideJoinRequest(requestId, req.user.id, body.approved, body.rejectionReason);
  }
}
