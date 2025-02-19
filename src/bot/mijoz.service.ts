import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Context, Markup } from 'telegraf';
import { Mijoz } from './models/mijoz.model';
import { Bot } from './models/bot.model';

@Injectable()
export class MijozService {
  mijozlar: Partial<Mijoz> = {};
  constructor(
    @InjectModel(Mijoz) private readonly mijozModel: typeof Mijoz,
    @InjectModel(Bot) private readonly botModel: typeof Bot,
  ) {}

  async onMijoz(ctx: Context) {
    const user_id = ctx.from?.id;
    const mijoz = await this.mijozModel.findOne({ where: { user_id } });
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
      this.mijozlar.last_name = 'a';
    }
    if (!mijoz) {
      await this.mijozModel.create({
        user_id,
        user_name: ctx.from?.username,
        first_name: ctx.from?.first_name,
        last_name: ctx.from?.last_name,
        lang: ctx.from?.language_code,
      });
      await ctx.replyWithHTML('sizga qanday xizmat kerak: ', {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: 'SARTAROSHXONA 💇',
                callback_data: `xizmat_SARTAROSHXONA_${user_id}`,
              },
            ],
            [
              {
                text: "GO'ZALLIK SALONI 💅",
                callback_data: `xizmat_BEAUTYSALON_${user_id}`,
              },
            ],
            [
              {
                text: 'ZARGARLIK USTAXONASI 💍',
                callback_data: `xizmat_ZARGAR_${user_id}`,
              },
            ],
            [
              {
                text: 'SOATSOZ 🕰',
                callback_data: `xizmat_SOATSOZ_${user_id}`,
              },
            ],
            [
              {
                text: 'POYABZAL USTAXONASI 👞',
                callback_data: `xizmat_POYABZAL_${user_id}`,
              },
            ],
          ],
        },
      });
    } else if (!mijoz.status) {
      await ctx.reply(
        `Iltimos, <b>Telefon raqamni yuborish</b> tugmasini bosing`,
        {
          parse_mode: 'HTML',
          ...Markup.keyboard([
            [Markup.button.contactRequest('Telefon raqamni yuborish')],
          ])
            .resize()
            .oneTime(),
        },
      );
    } else {
      await ctx.reply(`biror bo'limni tanlang👇`, {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: `Mijozlar`,
                callback_data: `mijozlar_${mijoz.user_id}`,
              },
              {
                text: `Parametrlar`,
                callback_data: `settings_${mijoz.user_id}`,
              },
            ],
          ],
        },
      });
    }
  }

  async onMyCustomer(ctx: Context) {
    let mijozlar = await this.mijozModel.findAll({ include: Mijoz });
    console.log('=>', mijozlar);
    const contextAction = ctx.callbackQuery!['data'];
    const mijoz_id = contextAction.split('_')[1];
    const mijoz = await this.mijozModel.findOne({
      where: { user_id: mijoz_id },
    });
    console.log(1);
    if (!mijoz) {
      await ctx.replyWithHTML(
        'iltimos <b>/start</b> tugmasini bosing yoki pastdagi buttonni bosing',
        {
          parse_mode: 'HTML',
          ...Markup.keyboard([['/start']])
            .resize()
            .oneTime(),
        },
      );
    } else if (!mijoz.status) {
      await ctx.reply(
        `Iltimos, <b>Telefon raqamni yuborish</b> tugmasini bosing`,
        {
          parse_mode: 'HTML',
          ...Markup.keyboard([
            [Markup.button.contactRequest('Telefon raqamni yuborish')],
          ])
            .resize()
            .oneTime(),
        },
      );
      
    } else {
      let mijozlar = this.mijozModel.findAll({ include: Mijoz });
      console.log('=>', mijozlar);

      // if (mijoz.mijozlar) {
      //   await ctx.reply('Sizni band qilgan mijozlaringiz 👇: ');
      //   mijoz.mijozlar.forEach(async (mijoz) => {
      //     await ctx.reply(
      //       `Mijoz ID: ${mijoz.mijozid}\nMijoz name: ${mijoz.name}\nmijoz vaqti: ${mijoz.time}`,
      //       {
      //         reply_markup: {
      //           inline_keyboard: [
      //             [
      //               {
      //                 text: "Mijoz bilan bog'lanish",
      //                 callback_data: `callingCustomer_${mijoz_id}_${mijoz.mijozid}`,
      //               },
      //               {
      //                 text: `Mijozni bekor qilish 🚫`,
      //                 callback_data: `mijoznibekorqilish_${mijoz_id}_${mijoz.time}`,
      //               },
      //             ],
      //           ],
      //         },
      //       },
      //     );
      //   });
      // } else {
      //   await ctx.reply(
      //     "Do'stim hozircha ba'zi sabablarga ko'ra mijozlar mavjud emas",
      //   );
      // }
    }
  }

  async onXizmat(ctx: Context) {
    const contextAction = ctx.callbackQuery!['data'];
    const xizmat = contextAction.split('_')[1];
    const user_id = Number(contextAction.split('_')[2]);
    const mijoz = await this.mijozModel.findOne({ where: { user_id } });
    console.log("mijoz1: ", mijoz);
    if (!mijoz) {
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
      mijoz.xizmat = xizmat;
      mijoz.last_state = 'name';
      await mijoz.save();
      await ctx.replyWithHTML('iltimos ismingizni kiriting: ', {
        parse_mode: 'HTML',
        ...Markup.removeKeyboard(),
      });
    }
  }
}
