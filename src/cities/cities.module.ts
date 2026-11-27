import { Module } from '@nestjs/common';
import { CitiesService } from './cities.service';
import { CitiesController } from './cities.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  controllers: [CitiesController],
  providers: [CitiesService],
  imports: [AuthModule],
})
export class CitiesModule {}
