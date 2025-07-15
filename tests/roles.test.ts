import { Response, NextFunction } from 'express';
import { editor } from '../middleware/roles';
import { IRequest } from '../types';

describe('Roles Middleware', () => {
  describe('editor', () => {
    let mockRequest: Partial<IRequest>;
    let mockResponse: Partial<Response>;
    let nextFunction: NextFunction = jest.fn();

    beforeEach(() => {
      mockRequest = {};
      mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      nextFunction = jest.fn();
    });

    it('should call next() if user has "editor" role', () => {
      mockRequest = {
        user: {
          id: '123',
          roles: ['editor'],
        },
      };

      editor(mockRequest as IRequest, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });

    it('should return 403 if user does not have "editor" role', () => {
      mockRequest = {
        user: {
          id: '123',
          roles: ['viewer'],
        },
      };

      editor(mockRequest as IRequest, mockResponse as Response, nextFunction);

      expect(nextFunction).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        ok: false,
        msg: 'Editor permissions required. Access denied.',
      });
    });

    it('should return 403 if user has no roles', () => {
      mockRequest = {
        user: {
          id: '123',
          roles: [],
        },
      };

      editor(mockRequest as IRequest, mockResponse as Response, nextFunction);

      expect(nextFunction).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        ok: false,
        msg: 'Editor permissions required. Access denied.',
      });
    });

    it('should return 403 if req.user is undefined', () => {
      mockRequest = {};

      editor(mockRequest as IRequest, mockResponse as Response, nextFunction);

      expect(nextFunction).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        ok: false,
        msg: 'Editor permissions required. Access denied.',
      });
    });
  });
});
