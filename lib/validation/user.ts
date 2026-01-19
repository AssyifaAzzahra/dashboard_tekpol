// lib/validation/user.ts
import { z } from "zod";

// helper: trim string, "" -> undefined
const emptyToUndefined = (v: unknown) => {
  if (typeof v !== "string") return v;
  const t = v.trim();
  return t === "" ? undefined : t;
};

// ✅ Email: optional, kalau ada harus valid email
const EmailField = z.preprocess(
  emptyToUndefined,
  z.string().trim().toLowerCase().email("Invalid email address").optional()
);

// ✅ SAP: optional, kalau ada harus angka
const SapNoField = z.preprocess(
  emptyToUndefined,
  z.string().trim().regex(/^\d+$/, "No. SAP harus angka").optional()
);

export const createUserSchema = z
  .object({
    name: z.string().min(1, "Nama wajib diisi"),

    // ✅ tidak pakai refine(val) lagi -> aman
    email: EmailField,
    sapNo: SapNoField,

    password: z.string().min(6, "Password minimal 6 karakter"),
    role: z.string().min(1, "Role wajib diisi"),

    isPic: z.boolean().optional(),
    pksCode: z.preprocess(emptyToUndefined, z.string().trim().optional()),
  })
  .superRefine((data, ctx) => {
    const emailOk = typeof data.email === "string" && data.email.trim() !== "";
    const sapOk = typeof data.sapNo === "string" && data.sapNo.trim() !== "";

    // ✅ minimal salah satu harus diisi
    if (!emailOk && !sapOk) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Isi minimal Email atau No. SAP",
        path: ["email"],
      });
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Isi minimal Email atau No. SAP",
        path: ["sapNo"],
      });
    }
  });

export type CreateUserInput = z.infer<typeof createUserSchema>;
