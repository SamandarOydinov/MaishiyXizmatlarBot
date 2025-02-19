import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Bot } from './models/bot.model';
import { InjectBot } from 'nestjs-telegraf';
import { Context, Markup, Telegraf } from 'telegraf';
import { BOT_NAME } from '../app.constants';
import { Usta } from './models/usta.model';
import { Admin } from './models/admin.model';
import { Mijoz } from './models/mijoz.model';

@Injectable()
export class BotService {
  constructor(
    @InjectModel(Bot) private readonly botModel: typeof Bot,
    @InjectModel(Usta) private readonly ustaModel: typeof Usta,
    @InjectModel(Admin) private readonly adminModel: typeof Admin,
    @InjectModel(Mijoz) private readonly mijozModel: typeof Mijoz,
    @InjectBot(BOT_NAME) private readonly bot: Telegraf<Context>,
  ) {}

  async start(ctx: Context) {
    try {
      const user_id = ctx.from?.id;
      const user = await this.botModel.findByPk(user_id);
      if (!user) {
        await this.botModel.create({
          user_id,
          user_name: ctx.from?.username,
          first_name: ctx.from?.first_name,
          last_name: ctx.from?.last_name,
          lang: ctx.from?.language_code,
        });
      }
      await ctx.replyWithHTML(
        "Ro'yxatdan o'tish uchun pastdagi tugmani bosing",
        {
          parse_mode: 'HTML',
          ...Markup.keyboard([["Ro'yxatdan o'tish"]])
            .resize()
            .oneTime(),
        },
      );
    } catch (error) {
      console.log('StartError: ', error);
    }
  }

  async onRegister(ctx: Context) {
    await ctx.replyWithHTML("siz kim bo'lib ro'yxatdan o'tmoqchisiz", {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: `Usta`,
              callback_data: `ustabulimi_${ctx.from?.id}`,
            },
            {
              text: `Mijoz`,
              callback_data: `mijozbulimi_${ctx.from?.id}`,
            },
          ],
        ],
      },
    });
  }

  async adminTasdiqladi(ctx: Context) {
    const contextAction = ctx.callbackQuery!['data'];
    const usta_id = Number(contextAction.split('_')[1]);
    const usta = await this.ustaModel.update(
      { status: true },
      { where: { user_id: usta_id } },
    );
    await this.bot.telegram.sendMessage(
      usta_id,
      "Tabriklayman ✅ sizning so'rovingiz adminlar tomonidan tasdiqlandi! ",
      {
        parse_mode: 'Markdown',
        ...Markup.removeKeyboard(),
      },
    );
  }

  async adminBekorQildi(ctx: Context) {
    const contextAction = ctx.callbackQuery!['data'];
    const usta_id = Number(contextAction.split('_')[1]);

    const usta = await this.ustaModel.update(
      { status: false },
      { where: { user_id: usta_id } },
    );
    await this.bot.telegram.sendMessage(
      usta_id,
      "Afsuski sizning so'rovingiz adminlar tomonidan bekor qilindi, nimanidir xato qilgandirsiz e'tibor qilib ko'ring!",
      {
        parse_mode: 'HTML',
        ...Markup.keyboard([["Ro'yxatdan o'tish"]])
          .resize()
          .oneTime(),
      },
    );
  }

  async onTekshirish(ctx: Context) {
    const usta = await this.ustaModel.findOne({
      where: { user_id: ctx.from?.id },
    });
    if (usta?.status)
      await ctx.reply("Tekshiruvdan muvaffaqiyatli o'tgansiz👌");
    await ctx.reply('Tekshirilmoqda...');
  }

  async onTasdiqlash(ctx: Context) {
    const contextAction = ctx.callbackQuery!['data'];
    const usta_id = Number(contextAction.split('_')[1]);
    const admin_id = Number(contextAction.split('_')[2]);
    const usta = await this.ustaModel.findOne({ where: { user_id: usta_id } });
    await this.bot.telegram.sendMessage(
      admin_id,
      `
usta ismi: ${usta?.first_name}
usta familiyasi: ${usta?.last_name}
usta manzili: ${usta?.manzili}
usta location: ${usta?.location}
usta ishni boshlash vaqti: ${usta?.start_work_time}
usta ishni tugatish vaqti: ${usta?.finish_work_time}
usta bir mijozga sarflaydigan o'rtacha vaqt: ${usta?.averageTimeForCustomer}
`,
      {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
          [Markup.button.callback('✅ Tasdiqlash', `approve_${usta_id}`)],
          [Markup.button.callback('❌ Bekor qilish', `reject_${usta_id}`)],
        ]),
      },
    );
    await ctx.reply('✅ So‘rovingiz adminlarga yuborildi!');

    await ctx.reply("quyidagi bo'limlardan birini tanlang", {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: 'Tekshirish',
              callback_data: `check_${usta_id}`,
            },
            {
              text: 'Bekor qilish',
              callback_data: `bekor_${usta_id}_${admin_id}`,
            },
            {
              text: "Admin bilan bog'lanish",
              callback_data: `call_${usta_id}_${admin_id}`,
            },
          ],
        ],
      },
    });
  }

  async onCallWithAdmin(ctx: Context) {
    const contextAction = ctx.callbackQuery!['data'];
    const usta_id = Number(contextAction.split('_')[1]);
    const usta = await this.ustaModel.findOne({ where: { user_id: usta_id } });
    if (usta) {
      usta.call_with_admin = 'call with admin';
      await usta.save();
      await ctx.reply(
        "iltimos adminga yubormoqchi bo'lgan matningizni yuboring",
      );
    } else {
      await ctx.reply("siz hali ro'yxatdan o'tmagansiz: ", {
        parse_mode: 'HTML',
        ...Markup.keyboard([['/start']])
          .resize()
          .oneTime(),
      });
    }
  }

  async onBekor(ctx: Context) {
    const contextAction = ctx.callbackQuery!['data'];
    const usta_id = Number(contextAction.split('_')[1]);
    const admin_id = Number(contextAction.split('_')[2]);
    const newUsta = await this.ustaModel.findOne({
      where: { user_id: usta_id },
    });
    await this.bot.telegram.sendMessage(
      admin_id,
      `<---Mana shu shaxs kirib bekor qildi--->
usta ismi: ${newUsta?.first_name}
usta familiyasi: ${newUsta?.last_name}
usta manzili: ${newUsta?.manzili}
usta location: ${newUsta?.location}
usta ishni boshlash vaqti: ${newUsta?.start_work_time}
usta ishni tugatish vaqti: ${newUsta?.finish_work_time}
usta bir mijozga sarflaydigan o'rtacha vaqt: ${newUsta?.averageTimeForCustomer}
`,
    );
    const usta = await this.ustaModel.destroy({ where: { user_id: usta_id } });
    await ctx.reply("Yana qaytadan urinib ko'rishingiz mumkin!", {
      parse_mode: 'HTML',
      ...Markup.keyboard([["Ro'yxatdan o'tish"]]),
    });
  }

  async onContact(ctx: Context) {
    try {
      if ('contact' in ctx.message!) {
        const user_id = ctx.from?.id;
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
        } else if (ctx.message.contact.user_id !== user_id) {
          await ctx.reply(
            "iltimos do'stim faqat o'zingizning accountingizga ochilgan contactni yuboring",
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
          const usta = await this.ustaModel.findOne({ where: { user_id } });
          const mijoz = await this.mijozModel.findOne({ where: { user_id } });
          if (usta && usta.last_state !== 'finish') {
            if (usta.last_state == 'phone_number') {
              usta.last_state = 'ustaxona_name';
              let phone_number = ctx.message.contact.phone_number;
              if (phone_number[0] !== '+') {
                phone_number = '+' + phone_number;
              }
              usta!.phone_number = phone_number;
              await usta!.save();
              await ctx.reply(
                "telefon raqamingiz muvaffaqiyatli saqlandi do'stim👍",
              );
              await ctx.reply('endi ish xonangiz nomini kiriting: ', {
                parse_mode: 'HTML',
                ...Markup.removeKeyboard(),
              });
            }
          }
          if (mijoz && mijoz.last_state !== 'finish') {
            if (mijoz.last_state == 'phone_number') {
              mijoz.last_state = 'location';
              mijoz.phone_number = ctx.message.contact.phone_number;
              mijoz.status = true
              await mijoz.save();
              await ctx.reply('bizga lokatsiyani yuboring: ', {
                parse_mode: 'HTML',
                ...Markup.keyboard([
                  [Markup.button.locationRequest('locatsiyani yuborish')],
                ])
                  .resize()
                  .oneTime(),
              });
            }
          }
        }
      }
    } catch (error) {
      console.log('contactError: ', error);
    }
  }

  async onFinishWorkTime(ctx: Context) {
    const contextAction = ctx.callbackQuery!['data'];
    const usta_id = contextAction.split('_')[3];
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
    } else {
      usta.last_state = 'averageTimeForCustomer';
      usta.finish_work_time = `${contextAction.split('_')[2]}:00`;
      await usta?.save();
      const times: Number[] = [10, 15, 20, 25, 30, 35, 40, 35];

      const buttons: { text: string; callback_data: string }[][] = [];
      for (let i = 0; i < times.length; i += 8) {
        const row: { text: string; callback_data: string }[] = [];
        for (let j = i; j < i + 8 && j < times.length; j++) {
          row.push({
            text: `${times[j]}:00`,
            callback_data: `average_timeforclient_${times[j]}_${usta_id}`,
          });
        }
        buttons.push(row);
      }
      buttons.push([
        {
          text: 'boshqa',
          callback_data: `averagetime_other_${usta.user_id}`,
        },
        {
          text: 'orqaga',
          callback_data: `averagetime_orqaga_${usta.user_id}`,
        },
      ]);

      await ctx.reply("har bir mijoz uchun qancha vaqt sarflaysiz o'rtacha: ", {
        reply_markup: {
          inline_keyboard: buttons,
        },
      });
    }
  }

  async onStartWorkTime(ctx: Context) {
    const contextAction = ctx.callbackQuery!['data'];
    const usta_id = contextAction.split('_')[3];
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
    } else {
      usta.last_state = 'finish_work_time';
      usta.start_work_time = `${contextAction.split('_')[2]}:00`;
      await usta?.save();
      const times: number[] = [16, 17, 18, 19, 20, 21, 22];

      const buttons: { text: string; callback_data: string }[][] = [];
      for (let i = 0; i < times.length; i += 7) {
        const row: { text: string; callback_data: string }[] = [];
        for (let j = i; j < i + 7 && j < times.length; j++) {
          row.push({
            text: `${times[j]}:00`,
            callback_data: `finish_work_${times[j]}_${usta.user_id}`,
          });
        }
        buttons.push(row);
      }
      buttons.push([
        {
          text: 'boshqa',
          callback_data: `finishworktime_other_${usta.user_id}`,
        },
        {
          text: 'orqaga',
          callback_data: `finishworktime_orqaga_${usta.user_id}`,
        },
      ]);

      await ctx.reply('nechchida tugatasiz kunduzgi ishni: ', {
        reply_markup: {
          inline_keyboard: buttons,
        },
      });
    }
  }

  async onAverageTimeForClient(ctx: Context) {
    const contextAction = ctx.callbackQuery!['data'];
    const usta_id = contextAction.split('_')[3];
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
    } else {
      const averageTime = contextAction.split('_')[2];
      usta.last_state = 'finish';
      usta.averageTimeForCustomer = averageTime;
      usta.save();
      await ctx.reply(
        "Tabriklayman 👍 siz usta bo'lishingiz uchun bir qadam qoldi siz endi adminga so'rov jo'natasiz va u tasdiqlagandan keyin siz usta maqomiga erishasiz: ",
        {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: 'Tasdiqlash ✅',
                  callback_data: `usta_${usta_id}_${process.env.ADMIN_ID}`,
                },
                {
                  text: 'Bekor qilish 🙅‍♂️',
                  callback_data: `bekor_${usta_id}_${process.env.ADMIN_ID}`,
                },
              ],
            ],
          },
        },
      );
    }
  }

  async onLocation(ctx: Context) {
    try {
      if ('location' in ctx.message!) {
        const user_id = ctx.from?.id;
        const usta = await this.ustaModel.findOne({ where: { user_id } });
        const user = await this.botModel.findOne({ where: { user_id } });
        const mijoz = await this.mijozModel.findOne({ where: { user_id } });
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
        } else {
          if (usta && usta.last_state !== 'finish') {
            if (usta.last_state == 'location') {
              usta.last_state = 'start_work_time';
              let lat = ctx.message.location.latitude;
              let long = ctx.message.location.longitude;
              usta!.location = { lat, long };
              await usta!.save();
              await ctx.reply(
                "locatsiyangiz muvaffaqiyatli saqlandi do'stim👍",
                { parse_mode: 'HTML', ...Markup.removeKeyboard() },
              );
              const times: number[] = [8, 9, 10, 11, 12, 13];

              const buttons: { text: string; callback_data: string }[][] = [];
              for (let i = 0; i < times.length; i += 6) {
                const row: { text: string; callback_data: string }[] = [];
                for (let j = i; j < i + 6 && j < times.length; j++) {
                  row.push({
                    text: `${times[j]}:00`,
                    callback_data: `start_work_${times[j]}_${usta.user_id}`,
                  });
                }
                buttons.push(row);
              }
              buttons.push([
                {
                  text: 'boshqa',
                  callback_data: `startworktime_other_${usta.user_id}`,
                },
                {
                  text: 'orqaga',
                  callback_data: `startworktime_orqaga_${usta.user_id}`,
                },
              ]);

              await ctx.reply('ishni soat nechchida boshlamoqchisiz: ', {
                reply_markup: {
                  inline_keyboard: buttons,
                },
              });
            }
          }

          if (mijoz) {
            if (mijoz.last_state !== 'finish') {
              if (mijoz.last_state == 'location') {
                mijoz.last_state = 'usta';
                mijoz.location = {
                  lat: ctx.message.location.latitude,
                  long: ctx.message.location.longitude,
                };
                await mijoz.save();
                const ustalar = await this.ustaModel.findAll();
                await ctx.reply('siz ustalardan birini tanlang: ', {
                  reply_markup: {
                    inline_keyboard: [
                      [
                        {
                          text: `name: ${ustalar[0]?.first_name}`,
                          callback_data: `bandqilish_${ustalar[0]?.user_id}_${mijoz.user_id}`,
                        },
                        {
                          text: `name: ${ustalar[1]?.first_name}`,
                          callback_data: `bandqilish_${ustalar[1]?.user_id}_${mijoz.user_id}`,
                        },
                      ],
                    ],
                  },
                });
              }
            }
          }
        }
      }
    } catch (error) {
      console.log('contactError: ', error);
    }
  }

  async onText(ctx: Context) {
    if ('text' in ctx.message!) {
      const user_id = ctx.from?.id;
      const user = await this.botModel.findOne({ where: { user_id } });
      const usta = await this.ustaModel.findOne({ where: { user_id } });
      const admin = await this.adminModel.findOne({ where: { user_id } });
      const mijoz = await this.mijozModel.findOne({ where: { user_id } });
      if (!user) {
        await ctx.reply(`Siz avval ro'yxatdan o'ting`, {
          parse_mode: 'HTML',
          ...Markup.keyboard([['/start']]).resize(),
        });
      } else if (usta) {
        if (usta.last_state !== 'finish') {
          if (usta.last_state == 'first_name') {
            usta.last_state = 'last_name';
            usta!.first_name = ctx.message.text;
            await usta!.save();
            await ctx.reply('endi familiyangizni kiriting: ', {
              parse_mode: 'HTML',
              ...Markup.removeKeyboard(),
            });
          } else if (usta.last_state == 'last_name') {
            usta.last_state = 'phone_number';
            usta.last_name = ctx.message.text;
            await usta.save();
            await ctx.reply(
              `Iltimos, o'zingizni telefon raqamingizni yuboring`,
              {
                parse_mode: 'HTML',
                ...Markup.keyboard([
                  [Markup.button.contactRequest('Telefon raqamni yuborish')],
                ])
                  .resize()
                  .oneTime(),
              },
            );
          } else if (usta?.last_state == 'ustaxona_name') {
            usta.last_state = 'manzil';
            usta.ustaxona_name = ctx.message.text;
            await usta.save();
            await ctx.reply("do'stim endi ish xona manzilini kiriting: ", {
              parse_mode: 'HTML',
              ...Markup.removeKeyboard(),
            });
          } else if (usta?.last_state == 'manzil') {
            usta.last_state = "mo'ljal";
            usta.manzili = ctx.message.text;
            await usta.save();
            await ctx.reply("endi bizga taxminiy mo'ljal kerak: ", {
              parse_mode: 'HTML',
              ...Markup.removeKeyboard(),
            });
          } else if (usta?.last_state == "mo'ljal") {
            usta.last_state = 'location';
            usta.destination = ctx.message.text;
            await usta.save();
            await ctx.reply('endi bizga sizning lokatsiyangiz kerak: ', {
              parse_mode: 'HTML',
              ...Markup.keyboard([
                [Markup.button.locationRequest('Locatsiyani yuborish')],
              ])
                .resize()
                .oneTime(),
            });
          }
        } else if (usta.call_with_admin == 'call with admin') {
          if(ctx.message.text !== "end"){
          const message = ctx.message.text;
          await this.bot.telegram.sendMessage(process.env.ADMIN_ID!, message);
        }else{
          usta.call_with_admin = "end"
          await usta.save()
          await this.bot.telegram.sendMessage(process.env.ADMIN_ID!, ctx.message.text)
        }
      }
      }

      if (admin && admin.last_state !== 'finish') {
        if (admin.last_state === 'addService') {
          admin.last_state = 'finish';
          await admin.save();
        }
      }
      if (mijoz) {
        if (mijoz.last_state !== 'finish') {
          if (mijoz.last_state == 'name') {
            mijoz.last_state = 'phone_number';
            mijoz.name = ctx.message.text;
            await mijoz.save();
            await ctx.reply(
              "Telefon raqamingizni yuborsangiz bazaga saqlab qo'yamiz",
              {
                parse_mode: 'HTML',
                ...Markup.keyboard([
                  [Markup.button.contactRequest('Telefon raqamni yuborish')],
                ])
                  .resize()
                  .oneTime(),
              },
            );
          } else if(mijoz.last_state === "usta"){
            mijoz.last_state = ""
          }
        }
      }
    }
  }
}
