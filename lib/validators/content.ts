import { z } from "zod";

export const LinkItemSchema: z.ZodType<any> = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  desc: z.string().optional(),
  tag: z.string().optional(),
  href: z.string().url().optional(),
  children: z.array(z.lazy(() => LinkItemSchema)).optional(),
});

export const ContentBucketSchema = z.object({
  title: z.string().min(1),
  items: z.array(LinkItemSchema),
});