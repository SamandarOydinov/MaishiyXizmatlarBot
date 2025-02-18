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
      await ctx.replyWithHTML("Kerakli bo'limni tanlang", {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: 'SARTAROSHXONA 💇',
                callback_data: `kasb_SARTAROSHXONA_${user_id}`,
              },
            ],
            [
              {
                text: "GO'ZALLIK SALONI 💅",
                callback_data: `kasb_BEAUTYSALON_${user_id}`,
              },
            ],
            [
              {
                text: 'ZARGARLIK USTAXONASI 💍',
                callback_data: `kasb_ZARGAR_${user_id}`,
              },
            ],
            [
              {
                text: 'SOATSOZ 🕰',
                callback_data: `kasb_SOATSOZ_${user_id}`,
              },
            ],
            [
              {
                text: 'POYABZAL USTAXONASI 👞',
                callback_data: `kasb_POYABZAL_${user_id}`,
              },
            ],
          ],
        },
      });
    } else if (!usta.status) {
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
                callback_data: `mijozlar_${usta.user_id}`,
              },
              {
                text: `Mening ish kunlarim`,
                callback_data: `myworkday_${usta.user_id}`,
              },
              {
                text: `Parametrlar`,
                callback_data: `settings_${usta.user_id}`,
              },
            ],
          ],
        },
      });
    }
  }

  async onMyCustomer(ctx: Context) {
    const contextAction = ctx.callbackQuery!['data'];
    const usta_id = contextAction.split('_')[1];
    const usta = await this.ustaModel.findOne({ where: { user_id: usta_id } });
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
    } else if (!usta.status) {
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
      if (usta.mijozlar) {
        await ctx.reply('Sizni band qilgan mijozlaringiz 👇: ');
        usta.mijozlar.forEach(async (mijoz) => {
          await ctx.reply(
            `Mijoz ID: ${mijoz.mijozid}\nMijoz name: ${mijoz.name}\nmijoz vaqti: ${mijoz.time}`,
            {
              reply_markup: {
                inline_keyboard: [
                  [
                    {
                      text: "Mijoz bilan bog'lanish",
                      callback_data: `callingCustomer_${usta_id}_${mijoz.mijozid}`,
                    },
                    {
                      text: `Mijozni bekor qilish 🚫`,
                      callback_data: `mijoznibekorqilish_${usta_id}_${mijoz.time}`,
                    },
                  ],
                ],
              },
            },
          );
        });
      } else {
        await ctx.reply(
          "Do'stim hozircha ba'zi sabablarga ko'ra mijozlar mavjud emas",
        );
      }
    }
  }

  async onMyWorkday(ctx: Context) {
    const contextAction = ctx.callbackQuery!['data'];
    const usta_id = contextAction.split('_')[1];
    const usta = await this.ustaModel.findOne({ where: { user_id: usta_id } });
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
    } else if (!usta.status) {
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
      const current = new Date();
      current.setDate(25);
      const days: String[] = [];
      for (let i = 0; i < 10; i++) {
        days.push(`${current}`);
        current.setDate(current.getDate() + 1);
      }
      const buttons: { text: string; callback_data: string }[][] = [];
      for (let i = 0; i < days.length; i += 5) {
        const row: { text: string; callback_data: string }[] = [];
        for (let j = i; j < i + 5 && j < days.length; j++) {
          const day = days[j].split(' ');
          row.push({
            text: `${day[2]}-${day[1]}`,
            callback_data: `myworkday_${day[2]}_${day[1]}_${usta_id}`,
          });
        }
        buttons.push(row);
      }
      await ctx.reply(`sizning ish kunlaringiz 1 haftalik: `, {
        reply_markup: {
          inline_keyboard: buttons,
        },
      });
    }
  }

  async onKasb(ctx: Context) {
    const contextAction = ctx.callbackQuery!['data'];
    const kasb = contextAction.split('_')[1];
    const user_id = Number(contextAction.split('_')[2]);
    const usta = await this.ustaModel.findOne({ where: { user_id } });
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
