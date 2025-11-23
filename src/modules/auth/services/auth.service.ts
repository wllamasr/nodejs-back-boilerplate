import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '../../../core/config/config.service';
import { UserService } from '../../users/services/user.service';

export class AuthService {
  constructor(
    private userService: UserService,
    private configService: ConfigService,
  ) { }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  generateToken(payload: any): string {
    const secret = this.configService.get<any>('secrets').jwtSecret;
    return jwt.sign(payload, secret, { expiresIn: '1h' });
  }

  verifyToken(token: string): any {
    const secret = this.configService.get<any>('secrets').jwtSecret;
    try {
      return jwt.verify(token, secret);
    } catch (e) {
      return null;
    }
  }

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.userService.findByEmail(email);
    if (user && (await this.comparePassword(pass, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }
}
