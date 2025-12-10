import { Controller } from '@/core/decorators/controller.decorator';
import { Post } from '@/core/decorators/route.decorators';
import { Body, Cookie } from '@/core/decorators/param.decorators';
import { AuthService } from '../services/auth.service';
import { UserService } from '../../users/services/user.service';

@Controller('/auth')
export class AuthController {
  private authService = new AuthService();
  private userService = new UserService();

  @Post('/register')
  async register(@Body() body: any) {
    try {
      const { email, password, name } = body;
      const hashedPassword = await this.authService.hashPassword(password);
      const user = await this.userService.create({ email, password: hashedPassword, name });
      return user;
    } catch (error: any) {
      throw new Error(error.message); // Elysia will handle error
    }
  }

  @Post('/login')
  async login(@Body() body: any, @Cookie() cookie: any) {
    try {
      const { email, password } = body;
      const user = await this.authService.validateUser(email, password);
      if (!user) {
        throw new Error('Invalid credentials');
      }
      const token = this.authService.generateToken(user);

      cookie.Authentication.set({
        value: token,
        httpOnly: true,
        path: '/',
      });

      return { user, token };
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  @Post('/logout')
  logout(@Cookie() cookie: any) {
    cookie.Authentication.remove();
    return { message: 'Logged out successfully' };
  }
}
