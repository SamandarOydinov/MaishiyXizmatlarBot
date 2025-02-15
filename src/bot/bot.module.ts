import { Module } from '@nestjs/common';
import { BotService } from './bot.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { Bot } from './models/bot.model';
import { BotUpdate } from './bot.update';
import { UstaUpdate } from './usta.update';
import { UstaService } from './usta.service';
import { Usta } from './models/usta.model';

@Module({
  imports: [SequelizeModule.forFeature([Bot, Usta])],
  providers: [UstaService, UstaUpdate, BotService, BotUpdate ],
  exports: [BotService],
})
export class BotModule {}
