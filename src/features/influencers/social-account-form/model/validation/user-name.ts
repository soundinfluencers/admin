import { z } from 'zod';

export const userNameSchema = z
.string()
.trim()
.min(1, 'Account name is required')
.max(50, 'Account name must be 50 characters or less')
.regex(/^[\p{L}0-9\s.\-_]+$/u, {
  message: 'Name contains invalid characters',
})
.transform((val) => val.replace(/\s+/g, ' '));
