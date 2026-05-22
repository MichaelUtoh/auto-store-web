import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
  remember: z.boolean().optional(),
});

export const registerSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    phone: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const addressSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  line1: z.string().min(1, "Address line is required"),
  line2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  postalCode: z.string().min(1, "Postal code is required"),
  country: z.string().min(1, "Country is required"),
  phone: z.string().min(1, "Phone is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type AddressInput = z.infer<typeof addressSchema>;

export const createQuestionSchema = z
  .object({
    title: z
      .string()
      .min(5, "Title must be at least 5 characters")
      .max(200, "Title must be at most 200 characters"),
    body: z
      .string()
      .min(10, "Details must be at least 10 characters")
      .max(5000, "Details must be at most 5000 characters"),
    productId: z.string().optional(),
    categoryId: z.string().optional(),
    make: z.string().optional(),
    model: z.string().optional(),
    year: z.string().optional(),
    contextType: z.enum(["product", "category", "vehicle"]),
  })
  .superRefine((data, ctx) => {
    if (data.contextType === "product" && !data.productId?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Select a product context or use another tab",
        path: ["productId"],
      });
    }
    if (data.contextType === "category" && !data.categoryId?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Select a category",
        path: ["categoryId"],
      });
    }
    if (data.contextType === "vehicle") {
      if (!data.make?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Make is required",
          path: ["make"],
        });
      }
      if (!data.model?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Model is required",
          path: ["model"],
        });
      }
    }
  });

export type CreateQuestionInput = z.infer<typeof createQuestionSchema>;
