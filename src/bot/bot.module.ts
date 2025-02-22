import { Module } from '@nestjs/common';
import { BotService } from './bot.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { Bot } from './models/bot.model';
import { BotUpdate } from './bot.update';
import { UstaUpdate } from './usta.update';
import { UstaService } from './usta.service';
import { Usta } from './models/usta.model';
import { AdminService } from './admin.service';
import { AdminUpdate } from './admin.update';
import { Admin } from './models/admin.model';
import { Mijoz } from './models/mijoz.model';
import { MijozService } from './mijoz.service';
import { MijozUpdate } from './mijoz.update';

@Module({
  imports: [SequelizeModule.forFeature([Bot, Usta, Admin, Mijoz])],
  providers: [
    UstaService,
    UstaUpdate,
    BotService,
    BotUpdate,
    AdminService,
    AdminUpdate,
    MijozService,
    MijozUpdate,
  ],
  exports: [BotService],
})
export class BotModule {}
