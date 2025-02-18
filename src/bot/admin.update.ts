import { Action, Command, Ctx, Hears, On, Start, Update } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { AdminService } from './admin.service';

@Update()
export class AdminUpdate {
  constructor(private readonly adminService: AdminService) {}
  
  @Action(/addService_+\d+$/)
  async onAddService(@Ctx() ctx: Context){
    await this.adminService.onAddService(ctx)
  }
}
