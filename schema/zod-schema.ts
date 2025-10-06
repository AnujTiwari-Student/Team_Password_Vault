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

export const OrgCreationSchema = z.object({
    orgName: z
        .string()
        .min(1, { message: "Organization name is required" })
        .min(3, { message: "Organization name must be at least 3 characters" })
        .max(50, { message: "Organization name must be less than 50 characters" })
        .regex(
            /^[a-zA-Z0-9\s\-_&.]+$/,
            { message: "Organization name can only contain letters, numbers, spaces, and -_&." }
        )
        .transform((val) => val.trim()) // Remove leading/trailing whitespace
        .refine(
            (val) => val.length > 0,
            { message: "Organization name cannot be only whitespace" }
        )
        .refine(
            (val) => !val.match(/\s{2,}/),
            { message: "Organization name cannot contain multiple consecutive spaces" }
        ),
});

export type OrgCreationType = z.infer<typeof OrgCreationSchema>;

export const CompleteOrgCreationSchema = z.object({
    orgName: OrgCreationSchema.shape.orgName,
    masterKeyHash: z.string().min(1, "Master key hash is required"),
    encryptedMasterKey: z.string().min(1, "Encrypted master key is required"),
    userId: z.string().uuid("Invalid user ID format"),
});

export type CompleteOrgCreationType = z.infer<typeof CompleteOrgCreationSchema>;


