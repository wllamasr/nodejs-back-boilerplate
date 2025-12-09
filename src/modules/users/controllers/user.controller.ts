import { Controller } from '@/core/decorators/controller.decorator';
import { Get, Post, Put, Delete } from '@/core/decorators/route.decorators';
import { Body, Param } from '@/core/decorators/param.decorators';
import { UserService } from '../services/user.service';

@Controller('/users')
export class UserController {
  private userService = new UserService();

  @Get('/')
  findAll() {
    return this.userService.findAll();
  }

  @Post('/')
  create(@Body() body: any) {
    return this.userService.create(body);
  }

  @Get('/:id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(parseInt(id));
  }

  @Put('/:id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.userService.update(parseInt(id), body);
  }

  @Delete('/:id')
  delete(@Param('id') id: string) {
    return this.userService.delete(parseInt(id));
  }
}
