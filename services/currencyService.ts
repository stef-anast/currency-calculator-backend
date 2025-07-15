import Currency, { ICurrency } from '../models/currency';

export class CurrencyNotFoundError extends Error {
  constructor(symbol: string) {
    super(`Currency ${symbol} not found`);
    this.name = 'CurrencyNotFoundError';
  }
}

export class CurrencyAlreadyExistsError extends Error {
  constructor(symbol: string) {
    super(`Currency ${symbol} already exists`);
    this.name = 'CurrencyAlreadyExistsError';
  }
}

export class ExchangeRateNotFoundError extends Error {
  constructor(from: string, to: string) {
    super(`Exchange rate from ${from} to ${to} not found`);
    this.name = 'ExchangeRateNotFoundError';
  }
}

export class CurrencyService {
  static async getAllCurrencies(): Promise<ICurrency[]> {
    return await Currency.find();
  }

  static async findCurrencyBySymbol(symbol: string): Promise<ICurrency | null> {
    return await Currency.findOne({ symbol });
  }

  static async validateCurrencyExists(symbol: string): Promise<ICurrency> {
    const currency = await this.findCurrencyBySymbol(symbol);
    if (!currency) {
      throw new CurrencyNotFoundError(symbol);
    }
    return currency;
  }

  static async createCurrency(
    symbol: string,
    name: string
  ): Promise<ICurrency> {
    const existingCurrency = await this.findCurrencyBySymbol(symbol);
    if (existingCurrency) {
      throw new CurrencyAlreadyExistsError(symbol);
    }

    const currency = new Currency({
      symbol,
      name,
      rates: new Map<string, number>(),
    });
    currency.rates.set(symbol, 1);

    return await currency.save();
  }

  static async deleteCurrency(symbol: string): Promise<void> {
    const deleteResult = await Currency.deleteOne({ symbol });
    if (deleteResult.deletedCount === 0) {
      throw new CurrencyNotFoundError(symbol);
    }

    const query = { [`rates.${symbol}`]: { $exists: true } };
    await Currency.updateMany(query, {
      $unset: { [`rates.${symbol}`]: 1 },
    });
  }

  static async setExchangeRate(
    fromSymbol: string,
    toSymbol: string,
    rate: number
  ): Promise<void> {
    if (fromSymbol === toSymbol) {
      throw new Error('Source and target currencies must be different');
    }

    await Promise.all([
      this.validateCurrencyExists(fromSymbol),
      this.validateCurrencyExists(toSymbol),
    ]);

    await Promise.all([
      Currency.updateOne(
        { symbol: fromSymbol },
        { [`rates.${toSymbol}`]: rate }
      ),
      Currency.updateOne(
        { symbol: toSymbol },
        { [`rates.${fromSymbol}`]: 1 / rate }
      ),
    ]);
  }

  static async removeExchangeRate(
    fromSymbol: string,
    toSymbol: string
  ): Promise<void> {
    if (fromSymbol === toSymbol) {
      throw new Error('Source and target currencies must be different');
    }

    const [fromCurrency, toCurrency] = await Promise.all([
      this.validateCurrencyExists(fromSymbol),
      this.validateCurrencyExists(toSymbol),
    ]);

    // Check if exchange rate exists
    if (!fromCurrency.rates.has(toSymbol)) {
      throw new ExchangeRateNotFoundError(fromCurrency.name, toCurrency.name);
    }

    await Promise.all([
      Currency.updateOne(
        { symbol: fromSymbol },
        { $unset: { [`rates.${toSymbol}`]: 1 } }
      ),
      Currency.updateOne(
        { symbol: toSymbol },
        { $unset: { [`rates.${fromSymbol}`]: 1 } }
      ),
    ]);
  }

  static async convertCurrency(
    fromSymbol: string,
    toSymbol: string,
    amount: number
  ): Promise<{
    base: string;
    target: string;
    amount: number;
    convertedAmount: number;
    exchangeRate: number;
  }> {
    if (fromSymbol === toSymbol) {
      return {
        base: fromSymbol,
        target: toSymbol,
        amount,
        convertedAmount: amount,
        exchangeRate: 1,
      };
    }

    const [fromCurrency, toCurrency] = await Promise.all([
      this.validateCurrencyExists(fromSymbol),
      this.validateCurrencyExists(toSymbol),
    ]);

    if (!fromCurrency.rates.has(toSymbol)) {
      throw new ExchangeRateNotFoundError(fromCurrency.name, toCurrency.name);
    }

    const exchangeRate = fromCurrency.rates.get(toSymbol)!;
    const convertedAmount = amount * exchangeRate;

    return {
      base: fromSymbol,
      target: toSymbol,
      amount,
      convertedAmount,
      exchangeRate,
    };
  }
}
