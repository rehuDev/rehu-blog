import { glob } from 'astro/loaders';
import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';

const post = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/post' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    image: z.string().optional(),
    categories: z.array(z.string().min(1)).min(1),
    mcategories: z.array(z.string()).optional(),
    pubDate: z.coerce.date(),
    updDate: z.coerce.date().optional(),
  }),
});

export const collections = { post };
