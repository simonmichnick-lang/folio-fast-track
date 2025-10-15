// src/lib/validation/holding.ts
import { z } from "zod";

export const HoldingSchema = z.object({
  symbol: z.string().min(1, "Symbol is required"),
  name: z.string().min(1, "Name is required"),
  shares: z.number().positive("Shares must be > 0"),
  purchasePrice: z.number().min(0, "Purchase price must be ≥ 0"),
  currentPrice: z.number().min(0, "Current price must be ≥ 0"),
  purchaseDate: z.string().min(10, "Purchase date is required"), // keep as 'YYYY-MM-DD'
  // category: z.string().optional(), // uncomment if you keep category
});

export type HoldingInput = z.infer<typeof HoldingSchema>;
