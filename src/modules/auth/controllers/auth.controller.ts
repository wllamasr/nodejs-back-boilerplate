import { Request, Response } from 'express';
import { Controller } from '../../../core/decorators/controller.decorator';
import { Post } from '../../../core/decorators/http-methods.decorator';
import { ValidateBody } from '../../../core/decorators/validate.decorator';
import { AuthService } from '../services/auth.service';
import { UserService } from '../../users/services/user.service';
import { RegisterDto } from '../dtos/register.dto';
import { LoginDto } from '../dtos/login.dto';

@Controller('/auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UserService,
  ) { }

  @Post('/register')
  @ValidateBody(RegisterDto)
  async register(req: Request, res: Response) {
    try {
      const { email, password, name } = req.body;
      const hashedPassword = await this.authService.hashPassword(password);
      const user = await this.userService.create({ email, password: hashedPassword, name });
      res.json(user);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  @Post('/login')
  @ValidateBody(LoginDto)
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const user = await this.authService.validateUser(email, password);
      if (!user) {
        res.status(401).json({ message: 'Invalid credentials' });
        return;
      }
      const token = this.authService.generateToken(user);
      res.cookie('Authentication', token, {
        httpOnly: true,
        path: '/',
      });
      res.json({ user, token });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  @Post('/logout')
  async logout(req: Request, res: Response) {
    res.clearCookie('Authentication');
    res.json({ message: 'Logged out successfully' });
  }
}
