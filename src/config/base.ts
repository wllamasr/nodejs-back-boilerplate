import { Config } from './types';
import * as dotenv from 'dotenv';

dotenv.config();

export const baseConfig: Partial<Config> = {
  port: parseInt(process.env.PORT || '3000', 10),
  secrets: {
    jwtSecret: process.env.JWT_SECRET,
  },
};
