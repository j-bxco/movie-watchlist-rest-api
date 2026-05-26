import { z } from "zod";

const authFields = {
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .toLowerCase()
    .pipe(z.email({ error: "Invalid email format" })),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
};

const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters"),
  ...authFields,
});

const loginSchema = z.object({
  ...authFields,
});

export { registerSchema, loginSchema };