import { describe, it, expect, vi } from 'vitest';
import type { Request, Response } from 'express';
import { validateRequest } from '../validateRequest.js';
import { loginSchema } from '../../validators/authValidators.js'

function mockRes() {
  const res: Partial<Response> = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res as Response;
}

describe('validateRequest middleware', () => {
  it('calls next() when validation passes', () => {
    const req = { body: { email: 'john@example.com', password: 'password123' } } as Request;
    const res = mockRes();
    const next = vi.fn();

    validateRequest(loginSchema, 'body')(req, res, next);

    expect(next).toHaveBeenCalledOnce();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('returns 400 with a readable message when validation fails', () => {
    const req = { body: { email: 'not-an-email' } } as Request;
    const res = mockRes();
    const next = vi.fn();

    validateRequest(loginSchema, 'body')(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining('email') })
    );
  });
});