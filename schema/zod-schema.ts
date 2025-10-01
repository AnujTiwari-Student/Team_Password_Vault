import * as z from "zod";

const ERR_PASSWORD_REQ = "Password doesn't meet requirements";
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{6,}$/;
const COMMON_PASSWORDS_SET = new Set([
  'password', '123456', '123456789', 'qwerty', 'abc123', 'football', '12345678',
  '111111', '1234567', 'sunshine', 'iloveyou',
]);

const PasswordField = z.string()
  .min(8, { message: ERR_PASSWORD_REQ })
  .regex(PASSWORD_REGEX, { message: ERR_PASSWORD_REQ })
  .refine(val => !COMMON_PASSWORDS_SET.has(val.toLowerCase()), {
    message: "Password is too common or insecure",
  });

export const LoginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: PasswordField,
  callbackUrl: z.string().optional(),
  csrfToken: z.string().optional(),
}).strict();

export const RegisterSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: PasswordField,
  confirmPassword: z.string(),
}).strict().refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
})

