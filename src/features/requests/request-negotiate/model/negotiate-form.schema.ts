import { z } from 'zod';

export const negotiateFormSchema = z.object({
  message: z.string().min(1, 'Message is required'),
});

export type TNegotiateFormValues = z.infer<typeof negotiateFormSchema>;
