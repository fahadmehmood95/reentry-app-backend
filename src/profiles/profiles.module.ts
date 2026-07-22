import { Module } from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { ProfilesController } from './profiles.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientProfile } from './entity/client.profile.entity';
import { CoachProfile } from './entity/coach.profile.entity';
import { CoachProfileRepository } from './repository/coachprofile.repository';
import { ClientProfileRepository } from './repository/clientprofile.repository';

@Module({
  imports: [TypeOrmModule.forFeature([ClientProfile, CoachProfile])],
  providers: [ProfilesService, ClientProfileRepository, CoachProfileRepository],
  controllers: [ProfilesController],
  exports: [ClientProfileRepository, CoachProfileRepository],
})
export class ProfilesModule {}
