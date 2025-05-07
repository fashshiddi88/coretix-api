import { array, z as zod } from "zod";

export const userSchema = {
  body: zod.object({
    name: zod.string().min(1),
    email: zod.string().email(),
    password: zod.string().min(6),
    referredBy: zod.string().optional(),
    role: zod.enum(["CUSTOMER", "ORGANIZER"]).optional().default("CUSTOMER"),
  }),
  params: zod.object({
    id: zod.string(),
  }),
};

export const ticketTypeSchema = zod.object({
  name: zod.string().min(1, "Ticket name is required"),
  price: zod.number().min(0, "Ticket price must be a positive number"),
  totalQuantity: zod.number().int().min(1, "Total quantity must be at least 1"),
});

export const ticketTypeArraySchema = zod.array(ticketTypeSchema);

export const ticketSchema = {
  body: ticketTypeSchema,
  array: ticketTypeArraySchema,
  params: zod.object({
    id: zod.string().regex(/^\d+$/, "ID must be a number"),
  }),
};

export const promotionSchema = zod.object({
  title: zod.string().min(1, "Promo name is required"),
  code: zod.string().min(1, "Promo code is required"),
  amount: zod.number().min(1, "Amount must be at least 1"),
  startDate: zod
    .string()
    .refine((val) => !isNaN(Date.parse(val)), "Invalid start date"),
  endDate: zod
    .string()
    .refine((val) => !isNaN(Date.parse(val)), "Invalid end date"),
  quota: zod.number().int().positive().optional(),
});

export const promotionArraySchema = zod.array(promotionSchema);

export const promoSchema = {
  body: promotionSchema,
  array: promotionArraySchema,
  params: zod.object({
    id: zod.string().regex(/^\d+$/, "ID must be a number"),
  }),
};

const baseEventSchema = zod.object({
  title: zod.string().min(3, "Title must be at least 3 characters"),
  description: zod
    .string()
    .min(10, "Description must be at least 10 characters"),
  category: zod.enum([
    "SPORTS",
    "MUSIC",
    "ART",
    "CONFERENCE",
    "COMMUNITY",
    "THEATER",
    "EDUCATION",
    "ATTRACTION",
  ]),
  location: zod.string().min(3, "Location is required"),
  imageUrl: zod.string().url("Image URL must be valid").optional(),
  price: zod.number().min(0, "Price must be a positive number"),
  availableSeats: zod
    .number()
    .int()
    .min(1, "Available seats must be at least 1"),
  startDate: zod.coerce.date({
    invalid_type_error: "Start date must be a valid date",
  }),
  endDate: zod.coerce.date({
    invalid_type_error: "End date must be a valid date",
  }),
  ticketTypes: zod
    .array(ticketTypeSchema)
    .min(1, "At least one ticket type is required"),
  promotions: zod.array(promotionSchema).optional(),
});

// Full schema dengan refine, untuk create
const createEventSchema = baseEventSchema.refine(
  (data) => !data.startDate || !data.endDate || data.startDate < data.endDate,
  {
    message: "Start date must be before end date",
    path: ["endDate"],
  }
);

// Partial schema untuk update
const updateEventSchema = baseEventSchema.partial();

export const eventSchema = {
  body: createEventSchema, // default create
  updateBody: updateEventSchema, // khusus update
  params: zod.object({
    id: zod.string().regex(/^\d+$/, "ID must be a number"),
  }),
};

export const authSchema = {
  forgotPassword: zod.object({ email: zod.string().email() }),
  resetPassword: zod.object({
    token: zod.string(),
    newPassword: zod.string().min(6),
  }),
};

export const createTransactionSchema = zod.object({
  ticketTypeId: zod.number(),
  promotionCode: zod.string().optional(),
  voucherCode: zod.string().optional(),
  usePoints: zod.boolean().optional(),
});

export const ticketTypeParamSchema = zod.object({
  ticketTypeId: zod.string().regex(/^\d+$/, "ticketTypeId must be a number"),
});
