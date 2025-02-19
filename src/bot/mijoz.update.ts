import { Action, Ctx, Update } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { MijozService } from './mijoz.service';

@Update()
export class MijozUpdate {
  constructor(private readonly mijozService: MijozService) {}

  @Action(/^mijozbulimi_+\d+$/)
  async onMijoz(@Ctx() ctx: Context) {
    await this.mijozService.onMijoz(ctx);
  }

  @Action(/^xizmat_[A-Z]+_\d+$/)
  async onXizmat(@Ctx() ctx: Context) {
    await this.mijozService.onXizmat(ctx);
  }
}
