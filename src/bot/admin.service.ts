import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Admin } from './models/admin.model';
import { InjectBot } from 'nestjs-telegraf';
import { Context, Markup, Telegraf } from 'telegraf';
import { BOT_NAME } from '../app.constants';
import { Usta } from './models/usta.model';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(Admin) private readonly adminModel: typeof Admin,
    @InjectModel(Usta) private readonly ustaModel: typeof Usta,
    // @InjectModel(Mijoz) private readonly mijozModel: typeof Mijoz,
    @InjectBot(BOT_NAME) private readonly bot: Telegraf<Context>,
  ) {}

  async admin_menu(ctx: Context){
    const user_id = ctx.from?.id
    if(process.env.ADMIN_ID !== user_id){
      await ctx.replyWithHTML("uzur bu comandani faqat admin berish huquqiga ega", {
        parse_mode: "HTML",
        ...Markup.removeKeyboard(),
      })
    } else {
      const admin = await this.adminModel.findOne({ where: {user_id}})
      if(!admin){
        
      }
    }
  }
  
}
