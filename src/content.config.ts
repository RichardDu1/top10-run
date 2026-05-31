import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const toolsCollection = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/tools" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    category: z.string().optional(),
    pubDate: z.union([z.string(), z.date()]).transform((val) => new Date(val)),
    updatedDate: z.union([z.string(), z.date()]).transform((val) => new Date(val)).optional(),
    heroImage: z.string().optional(),
    locale: z.string().default('en'),
  }),
});

export const collections = {
  'tools': toolsCollection,
};
