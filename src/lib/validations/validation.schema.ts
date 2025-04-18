import { z as zod } from "zod";

export const userSchema = {
  body: zod.object({
    name: zod.string().min(1),
    email: zod.string().email(),
    password: zod.string().min(6),
    role: zod.enum(["CUSTOMER", "ORGANIZER"]),
  }),
  params: zod.object({
    id: zod.string(),
  }),
};
