import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Context, Markup } from 'telegraf';
import { Usta } from './models/usta.model';
import { Bot } from './models/bot.model';

@Injectable()
export class UstaService {
  constructor(
    @InjectModel(Usta) private readonly ustaModel: typeof Usta,
    @InjectModel(Bot) private readonly botModel: typeof Bot,
  ) {}

  async onUsta(ctx: Context) {
    const user_id = ctx.from?.id;
    const usta = await this.ustaModel.findOne({ where: { user_id } });
    const user = await this.botModel.findOne({ where: { user_id } });
    if (!user) {
      await ctx.replyWithHTML(
        'iltimos <b>/start</b> tugmasini bosing yoki pastdagi buttonni bosing',
        {
          parse_mode: 'HTML',
          ...Markup.keyboard([['/start']])
            .resize()
            .oneTime(),
        },
      );
    }
    if (!usta) {
      await this.ustaModel.create({
        user_id,
        user_name: ctx.from?.username,
        first_name: ctx.from?.first_name,
        last_name: ctx.from?.last_name,
        lang: ctx.from?.language_code,
      });

      //   await ctx.reply(
      //     `Iltimos, <b>Telefon raqamni yuborish</b> tugmasini bosing`,
      //     {
      //       parse_mode: 'HTML',
      //       ...Markup.keyboard([
      //         [Markup.button.contactRequest('Telefon raqamni yuborish')],
      //       ])
      //         .resize()
      //         .oneTime(),
      //     },
      //   );
    }
    await ctx.replyWithHTML("Kerakli bo'limni tanlang", {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: 'SARTAROSHXONA',
              callback_data: `kasb_SARTAROSHXONA_${user_id}`,
            },
          ],
          [
            {
              text: "GO'ZALLIK SALONI",
              callback_data: `kasb_BEAUTYSALON_${user_id}`,
            },
          ],
          [
            {
              text: 'ZARGARLIK USTAXONASI',
              callback_data: `kasb_ZARGAR_${user_id}`,
            },
          ],
          [
            {
              text: 'SOATSOZ',
              callback_data: `kasb_SOATSOZ_${user_id}`,
            },
          ],
          [
            {
              text: 'POYABZAL USTAXONASI',
              callback_data: `kasb_POYABZAL_${user_id}`,
            },
          ],
        ],
      },
    });
  }

  async onKasb(ctx: Context) {
    const contextAction = ctx.callbackQuery!['data'];
    const kasb = contextAction.split('_')[1];
    const user_id = Number(contextAction.split('_')[2]);
    console.log('contextAction: ', contextAction);
    const usta = await this.ustaModel.findOne({where: {user_id}});
    console.log(usta);
    if (!usta) {
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
      usta.kasb = kasb;
      usta.last_state = 'first_name';
      await usta?.save();
      await ctx.replyWithHTML('iltimos ismingizni kiriting: ', {
        parse_mode: 'HTML',
        ...Markup.removeKeyboard(),
      });
    }
  }
}