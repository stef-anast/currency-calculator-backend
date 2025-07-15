import { Response } from 'express';
import { ValidationError } from 'express-validator';

interface ApiResponse<T = unknown> {
  ok: boolean;
  data?: T;
  msg?: string;
  errors?: ValidationError[];
  count?: number;
}

export class ResponseUtils {
  static success<T>(
    res: Response,
    data?: T,
    message?: string,
    statusCode = 200
  ): Response {
    const response: ApiResponse<T> = {
      ok: true,
      ...(data !== undefined && { data }),
      ...(message && { msg: message }),
    };

    if (Array.isArray(data)) {
      response.count = data.length;
    }

    return res.status(statusCode).json(response);
  }

  static successWithResult<T>(
    res: Response,
    result: T,
    message?: string,
    statusCode = 200
  ): Response {
    const response = {
      ok: true,
      ...(Array.isArray(result) && { count: result.length }),
      result,
      ...(message && { msg: message }),
    };

    return res.status(statusCode).json(response);
  }

  static created<T>(res: Response, data?: T, message?: string): Response {
    return this.success(res, data, message, 201);
  }

  static noContent(res: Response): Response {
    return res.status(204).send();
  }

  static error(
    res: Response,
    message: string,
    statusCode = 400,
    errors?: ValidationError[]
  ): Response {
    const response: ApiResponse = {
      ok: false,
      msg: message,
      ...(errors && { errors }),
    };

    return res.status(statusCode).json(response);
  }

  static validationError(res: Response, errors: ValidationError[]): Response {
    return this.error(res, 'Validation failed', 400, errors);
  }

  static unauthorized(res: Response, message = 'Unauthorized'): Response {
    return this.error(res, message, 401);
  }

  static forbidden(res: Response, message = 'Forbidden'): Response {
    return this.error(res, message, 403);
  }

  static notFound(res: Response, message = 'Not found'): Response {
    return this.error(res, message, 404);
  }

  static conflict(res: Response, message = 'Conflict'): Response {
    return this.error(res, message, 409);
  }

  static internalError(
    res: Response,
    message = 'Internal server error'
  ): Response {
    return this.error(res, message, 500);
  }

  static handleServiceError(res: Response, error: Error): Response {
    if (error.name === 'CurrencyNotFoundError') {
      return this.notFound(res, error.message);
    }

    if (error.name === 'CurrencyAlreadyExistsError') {
      return this.conflict(res, error.message);
    }

    if (error.name === 'ExchangeRateNotFoundError') {
      return this.notFound(res, error.message);
    }

    console.error('Unexpected service error:', error);
    return this.internalError(res);
  }
}
