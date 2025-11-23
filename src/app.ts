import { Application } from './core/application';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';

dotenv.config();

const PORT = parseInt(process.env.PORT || '3000', 10);

const app = new Application(AppModule);

app.listen(PORT);
