import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Admin } from './models/admin.model';
import { InjectBot } from 'nestjs-telegraf';
import { Context, Markup, Telegraf } from 'telegraf';
import { BOT_NAME } from '../app.constants';
import { Usta } from './models/usta.model';
import { Bot } from './models/bot.model';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(Admin) private readonly adminModel: typeof Admin,
    @InjectModel(Usta) private readonly ustaModel: typeof Usta,
    @InjectModel(Bot) private readonly botModel: typeof Bot,
    // @InjectModel(Mijoz) private readonly mijozModel: typeof Mijoz,
    @InjectBot(BOT_NAME) private readonly bot: Telegraf<Context>,
  ) {}


  async admin_menu(ctx: Context) {
    const user_id = ctx.from?.id;
    if (process.env.ADMIN_ID != user_id) {
      await ctx.replyWithHTML(
        'uzur bu comandani faqat admin berish huquqiga ega',
        {
          parse_mode: 'HTML',
          ...Markup.removeKeyboard(),
        },
      );
    } else {
      const admin = await this.botModel.findOne({ where: { user_id } });
      if (!admin) {
        await ctx.replyWithHTML(
          'iltimos <b>/start</b> tugmasini bosing yoki pastdagi buttonni bosing',
          {
            parse_mode: 'HTML',
            ...Markup.keyboard([['/start']])
              .resize()
              .oneTime(),
          },
        );
      } else {
          await ctx.reply(`Menu`, {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: `Xizmat qo'shish`,
                  callback_data: `addService_${admin.user_id}`,
                },{
                  text: `Ustalar`,
                  callback_data: `ustalar_${admin.user_id}`,
                },{
                  text: `Mijozlar`,
                  callback_data: `mijozlar_${admin.user_id}`,
                },
              ],[
                {
                  text: `Bloklanganlar`,
                  callback_data: `Blockeds_${admin.user_id}`,
                },{
                  text: `Parametrlar`,
                  callback_data: `settings_${admin.user_id}`,
                }
              ],
            ],
          },
        });
      }
    }
  }

  async onAddService(ctx: Context){
    const user_id = ctx.from?.id;
    if (process.env.ADMIN_ID != user_id) {
      await ctx.replyWithHTML(
        'uzur bu comandani faqat admin berish huquqiga ega',
        {
          parse_mode: 'HTML',
          ...Markup.removeKeyboard(),
        },
      );
    } else {
      const admin = await this.botModel.findOne({ where: { user_id } });
      if (!admin) {
        await ctx.replyWithHTML(
          'iltimos <b>/start</b> tugmasini bosing yoki pastdagi buttonni bosing',
          {
            parse_mode: 'HTML',
            ...Markup.keyboard([['/start']])
              .resize()
              .oneTime(),
          },
        );
      } else {
        admin.last_state = "addService"
        await ctx.reply("Kiritmoqchi bo'lgan servicingiz nomini kiriting: ",
          {
            parse_mode: "HTML",
            ...Markup.removeKeyboard()
          }
        )
      }
    }
  }
}