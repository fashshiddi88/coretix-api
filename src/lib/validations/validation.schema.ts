import { z as zod } from "zod";

export const userSchema = {
  body: zod.object({
    name: zod.string().min(1),
    email: zod.string().email(),
    password: zod.string().min(6),
    referredBy: zod.string().optional(),
    role: zod.enum(["CUSTOMER", "ORGANIZER"]),
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

const baseEventSchema = zod.object({
  title: zod.string().min(3, "Title must be at least 3 characters"),
  description: zod
    .string()
    .min(10, "Description must be at least 10 characters"),
  category: zod.string().min(3, "Category is required"),
  location: zod.string().min(3, "Location is required"),
  imageUrl: zod.string().url("Image URL must be valid"),
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
