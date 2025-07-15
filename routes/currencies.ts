import express, { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';

import auth from '../middleware/auth';
import { editor, viewer } from '../middleware/roles';
import { CurrencyService } from '../services/currencyService';
import { ResponseUtils } from '../utils/responseUtils';

const router: Router = express.Router();

router.get('/', [auth, viewer], async (req: Request, res: Response) => {
  try {
    const currencies = await CurrencyService.getAllCurrencies();
    const currenciesList = currencies.map((curr) => ({
      symbol: curr.symbol,
      name: curr.name,
      rates: curr.rates,
    }));

    return ResponseUtils.successWithResult(res, currenciesList);
  } catch (error) {
    return ResponseUtils.handleServiceError(res, error as Error);
  }
});

router.post(
  '/',
  [auth, editor],
  body('symbol').not().isEmpty(),
  body('name').not().isEmpty(),
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return ResponseUtils.validationError(res, errors.array());
    }

    const { symbol, name } = req.body;

    try {
      const newCurrency = await CurrencyService.createCurrency(symbol, name);
      return ResponseUtils.created(
        res,
        undefined,
        `Successfully added ${newCurrency.symbol}`
      );
    } catch (error) {
      return ResponseUtils.handleServiceError(res, error as Error);
    }
  }
);

router.delete(
  '/',
  [auth, editor],
  body('symbol').not().isEmpty(),
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return ResponseUtils.validationError(res, errors.array());
    }

    const { symbol } = req.body;

    try {
      await CurrencyService.deleteCurrency(symbol);
      return ResponseUtils.noContent(res);
    } catch (error) {
      return ResponseUtils.handleServiceError(res, error as Error);
    }
  }
);

router.put(
  '/rate',
  [auth, editor],
  body('base').not().isEmpty(),
  body('target').not().isEmpty(),
  body('rate').not().isEmpty().isNumeric(),
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return ResponseUtils.validationError(res, errors.array());
    }

    const { base, target } = req.body;
    const rate: number = Number(req.body.rate);

    if (base === target) {
      return ResponseUtils.error(res, 'Target and base should be different.');
    }

    try {
      await CurrencyService.setExchangeRate(base, target, rate);
      return ResponseUtils.created(
        res,
        undefined,
        `Successfully set exchange rate: ${base} -> ${target}: ${rate}`
      );
    } catch (error) {
      return ResponseUtils.handleServiceError(res, error as Error);
    }
  }
);

router.delete(
  '/rate',
  [auth, editor],
  body('base').not().isEmpty(),
  body('target').not().isEmpty(),
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return ResponseUtils.validationError(res, errors.array());
    }

    const { base, target } = req.body;

    if (base === target) {
      return ResponseUtils.error(res, 'Target and base should be different.');
    }

    try {
      await CurrencyService.removeExchangeRate(base, target);
      return ResponseUtils.noContent(res);
    } catch (error) {
      return ResponseUtils.handleServiceError(res, error as Error);
    }
  }
);

router.post(
  '/convert',
  [auth, viewer],
  body('base').not().isEmpty(),
  body('target').not().isEmpty(),
  body('amount').not().isEmpty().isNumeric(),
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return ResponseUtils.validationError(res, errors.array());
    }

    const { base, target } = req.body;
    const amount: number = Number(req.body.amount);

    try {
      const result = await CurrencyService.convertCurrency(
        base,
        target,
        amount
      );
      return ResponseUtils.success(res, result);
    } catch (error) {
      return ResponseUtils.handleServiceError(res, error as Error);
    }
  }
);

export default router;
