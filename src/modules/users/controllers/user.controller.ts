import { Request, Response } from 'express';
import { Controller } from '../../../core/decorators/controller.decorator';
import { Get, Post } from '../../../core/decorators/http-methods.decorator';
import { Serializer } from '../../../core/decorators/serializer.decorator';
import { ValidateBody } from '../../../core/decorators/validate.decorator';
import { UserService } from '../services/user.service';
import { UserSerializer } from '../serializers/user.serializer';
import { CreateUserDto } from '../dtos/create-user.dto';

@Controller('/users')
export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  @Get('/')
  @Serializer(UserSerializer)
  async index(req: Request, res: Response) {
    return this.userService.findAll();
  }

  @Post('/')
  @ValidateBody(CreateUserDto)
  @Serializer(UserSerializer)
  async create(req: Request, res: Response) {
    return this.userService.create(req.body);
  }
}
