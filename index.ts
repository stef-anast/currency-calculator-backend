import dotenv from 'dotenv';
dotenv.config();

import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import mongoose from 'mongoose';

import { config } from './config';
import authRouter from './routes/auth';
import currenciesRouter from './routes/currencies';

const app: Express = express();

mongoose.set('strictQuery', true);
mongoose.connect(config.databaseUri).catch((err) => console.log(err));

const db = mongoose.connection;
db.on('error', (err) => console.log(err));
db.once('open', () => console.log('Connected to Database'));

app.use(cors());
app.use(express.json());

app.use('/auth', authRouter);
app.use('/currencies', currenciesRouter);

app.get('/', (req: Request, res: Response) => {
  res.json({ msg: 'Currency Calculator Backend' });
});

interface SyntaxErrorWithStatus extends SyntaxError {
  status?: number;
  body?: unknown;
}

app.use(
  (
    err: SyntaxErrorWithStatus,
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
      return res.status(400).json({
        ok: false,
        msg: 'Bad request.',
      });
    }
    next();
  }
);

app.listen(config.port, () => {
  console.log(`Server started on port ${config.port}`);
});
