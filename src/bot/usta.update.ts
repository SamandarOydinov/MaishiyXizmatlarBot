import { Action, Ctx, Hears, On, Start, Update } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { UstaService } from './usta.service';

@Update()
export class UstaUpdate {
  constructor(private readonly ustaService: UstaService) {}

  @Hears('Usta')
  async onUsta(@Ctx() ctx: Context) {
    await this.ustaService.onUsta(ctx);
  }

  @Action(/^kasb_[A-Z]+_\d+$/)
  async onKasb(@Ctx() ctx: Context) {
    await this.ustaService.onKasb(ctx);
  }
}
