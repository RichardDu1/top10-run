import fs from 'fs/promises';
import path from 'path';
import { callDeepSeek } from './deepseek_client.mjs';

const CLUSTERS_PATH = 'C:/Users/Administrator/.gemini/antigravity/brain/e739864f-020f-477c-a43b-ae5c5ee006fb/scratch/top10run_clusters.json';
const OUTPUT_DIR = path.join(process.cwd(), 'src/content/tools');
const LANGUAGES = ['en', 'zh', 'es', 'fr']; // Added multiple languages

async function loadKeywords() {
  const raw = await fs.readFile(CLUSTERS_PATH, 'utf-8');
  const data = JSON.parse(raw);
  let keywords = [];
  for (const cluster of data.clusters) {
    keywords.push({ keyword: cluster.pillar_keyword, category: cluster.cluster_name });
    for (const kw of cluster.cluster_keywords) {
      keywords.push({ keyword: kw, category: cluster.cluster_name });
    }
  }
  return keywords;
}

async function ensureDir(dir) {
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (err) {
    if (err.code !== 'EEXIST') throw err;
  }
}

async function generateRanking(keywordObj, locale) {
  const prompt = `
You are a highly analytical SEO expert writing for "top10.run", a site dedicated to ultra-fast, accurate top 10 rankings.
Keyword: "${keywordObj.keyword}"
Language: ${locale}

You must construct a Top 10 listicle that relies on STRICT, real-world data (actual pricing, known pros/cons). 
Do not hallucinate fake products. Only list the actual top software/tools for this category.

Output ONLY valid MDX format.
Do not wrap it in markdown code blocks (\`\`\`mdx).

REQUIREMENTS:
1. FRONTMATTER (Output strictly as YAML):
---
title: "${keywordObj.keyword} (2026 Rankings)"
description: "The definitive ranking for ${keywordObj.keyword}. Compare pricing, pros, and cons instantly."
pubDate: 2026-05-31
category: "${keywordObj.category}"
locale: "${locale}"
---

2. BODY:
- A brief introduction highlighting why picking the right tool matters.
- A numbered list (1 to 10) of the best tools. For EACH tool, use this exact format:

### [1-10]. [Tool Name]
**Best for**: [1 short sentence]
**Pricing**: [Exact real-world pricing, e.g. Starts at $12/mo, or Free tier available]
- **Pros**:
  - [Pro 1]
  - [Pro 2]
- **Cons**:
  - [Con 1]

- A brief conclusion summarizing the #1 overall winner.
`;

  console.log(`[${locale}] Generating: ${keywordObj.keyword}...`);
  let content = await callDeepSeek(prompt, "You are an expert software reviewer who only provides strictly factual pricing and feature data.", 0.3);
  if (!content) return;

  // Clean MDX wrapping
  content = content.replace(/^```(mdx?|markdown|yaml)?\n/i, '').replace(/\n```$/i, '');

  const slug = keywordObj.keyword.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const dirPath = path.join(OUTPUT_DIR, locale);
  await ensureDir(dirPath);
  
  const filePath = path.join(dirPath, `${slug}.md`);
  await fs.writeFile(filePath, content, 'utf-8');
  console.log(`✅ Saved: [${locale}] ${slug}.md`);
}

async function main() {
  const keywords = await loadKeywords();
  console.log(`Loaded ${keywords.length} keywords. Will generate for ${LANGUAGES.length} languages.`);
  
  // For safety and test, just process the first 3 keywords
  const testKeywords = keywords.slice(0, 3);
  
  for (const kw of testKeywords) {
    for (const locale of LANGUAGES) {
      await generateRanking(kw, locale);
      // Wait to respect rate limits
      await new Promise(r => setTimeout(r, 2000));
    }
  }
  
  console.log('🎉 Multi-language ranking generation complete!');
}

main().catch(console.error);
