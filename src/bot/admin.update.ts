import { Action, Command, Ctx, Hears, On, Start, Update } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { AdminService } from './admin.service';

@Update()
export class AdminUpdate {
  constructor(private readonly adminService: AdminService) {}
  
  @Command("admin")
  async admin_menu(@Ctx() ctx: Context){
    await this.adminService.admin_menu(ctx)
  }
}
