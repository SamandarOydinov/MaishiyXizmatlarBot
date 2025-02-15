import { Action, Ctx, Hears, On, Start, Update } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { BotService } from './bot.service';

@Update()
export class BotUpdate {
  constructor(private readonly botService: BotService) {}
  @Start()
  async onStart(@Ctx() ctx: Context) {
    console.log('salomsdjf');
    await this.botService.start(ctx);
  }

  @On('contact')
  async onContact(@Ctx() ctx: Context) {
    await this.botService.onContact(ctx);
  }

  @On('location')
  async onLocation(@Ctx() ctx: Context) {
    await this.botService.onLocation(ctx);
  }

  @Hears("Ro'yxatdan o'tish")
  async onRegister(@Ctx() ctx: Context) {
    await this.botService.onRegister(ctx);
  }

  @Action(/^usta_+\d+_+\d+$/)
  async onTasdiqlash(@Ctx() ctx: Context) {
    console.log('admin');
    await this.botService.onTasdiqlash(ctx);
  }

  @Action(/^bekor_+\d+_+\d+$/)
  async onBekor(@Ctx() ctx: Context) {
    await this.botService.onBekor(ctx);
  }

  @Action(/^approve_+\d+$/)
  async adminTasdiqladi(@Ctx() ctx: Context) {
    await this.botService.adminTasdiqladi(ctx);
  }

  @Action(/^reject_+\d+$/)
  async adminBekorQildi(@Ctx() ctx: Context) {
    await this.botService.adminBekorQildi(ctx);
  }

  @Action(/^check_+\d+$/)
  async onTekshirish(@Ctx() ctx: Context) {
    await this.botService.onTekshirish(ctx);
  }

  @Action(/^call_+\d+$/)
  async onCallWithAdmin(@Ctx() ctx: Context) {
    await this.botService.onCallWithAdmin(ctx);
  }

  @On('text')
  async onText(@Ctx() ctx: Context) {
    await this.botService.onText(ctx);
  }
}
