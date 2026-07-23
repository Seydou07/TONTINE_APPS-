import { Module } from '@nestjs/common';
import { SolidarityController } from './solidarity.controller';
import { SolidarityService } from './solidarity.service';

@Module({
  controllers: [SolidarityController],
  providers: [SolidarityService],
  exports: [SolidarityService],
})
export class SolidarityModule {}
