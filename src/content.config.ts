import { glob } from 'astro/loaders';
import { defineCollection, reference } from 'astro:content';
import { z } from 'astro/zod';

const relatedSiteSchema = z.object({
  title: z.string().min(1),
  url: z.url(),
  description: z.string().optional(),
});

const gallery = defineCollection({
  loader: glob({
    pattern: '**/*.{yaml,yml}',
    base: './src/content/gallery',
  }),
  schema: ({ image }) => z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    thumbnail: image(),
    relatedSites: z.array(relatedSiteSchema).default([]),
  }),
});

const post = defineCollection({
  loader: glob({
    pattern: '**/[^_]*.{md,mdx}',
    base: './src/content/post',
  }),
  schema: ({ image }) => z.object({
    title: z.string(),
    description: z.string(),
    image: image().optional(),
    categories: z.array(reference('gallery')).min(1),
    mcategories: z.array(z.string()).optional(),
    pubDate: z.coerce.date(),
    updDate: z.coerce.date().optional(),
  }),
});

export const collections = { post, gallery };
