import fs from 'fs/promises';
import path from 'path';

const CLUSTERS_FILE = 'C:/Users/Administrator/.gemini/antigravity/brain/e739864f-020f-477c-a43b-ae5c5ee006fb/scratch/top10run_clusters.json';
const OUTPUT_DIR = path.join(process.cwd(), 'src/content/tools/en');

async function ensureDir(dir) {
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (err) {
    if (err.code !== 'EEXIST') throw err;
  }
}

function mockGenerate(keyword, clusterName) {
  const slug = keyword.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  return `---
title: "${keyword} (2026)"
description: "The fastest, most minimal list of the ${keyword}. We've tested them so you don't have to."
pubDate: 2026-05-31
category: "${clusterName}"
author: "top10.run team"
---

# ${keyword}

Welcome to the minimalist guide for **${keyword}**.

## 1. The Undisputed Leader
The best overall tool with the highest value for money and fastest execution speed.

## 2. The Challenger
Great alternative if you need specific niche features.

## 3. The Budget Pick
Perfect for those who just need the basics done right without subscriptions.

*(Note: Content will be expanded via DeepSeek API script injection)*
`;
}

async function main() {
  await ensureDir(OUTPUT_DIR);
  const data = JSON.parse(await fs.readFile(CLUSTERS_FILE, 'utf-8'));
  
  for (const cluster of data.clusters) {
    // Generate pillar
    let mdx = mockGenerate(cluster.pillar_keyword, cluster.cluster_name);
    let slug = cluster.pillar_keyword.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    await fs.writeFile(path.join(OUTPUT_DIR, `${slug}.md`), mdx, 'utf-8');
    
    // Generate clusters
    for (const kw of cluster.cluster_keywords) {
      mdx = mockGenerate(kw, cluster.cluster_name);
      slug = kw.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      await fs.writeFile(path.join(OUTPUT_DIR, `${slug}.md`), mdx, 'utf-8');
    }
  }
  
  console.log(`Generated ${data.content_architecture.total_articles} pages for top10.run.`);
}

main().catch(console.error);
