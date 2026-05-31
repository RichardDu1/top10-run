import os
import datetime
import json
from scrapling import Fetcher

# Define the targets for our AI Coding Tools MVP
TARGETS = {
    "cursor": "https://www.cursor.com",
    "windsurf": "https://codeium.com/windsurf",
    "aider": "https://aider.chat"
}

CONTENT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "src", "content", "tools", "en"))

def ensure_dir(path):
    if not os.path.exists(path):
        os.makedirs(path)

def scrape_and_generate():
    ensure_dir(CONTENT_DIR)
    fetcher = Fetcher()
    
    for slug, url in TARGETS.items():
        print(f"Scraping {slug} from {url}...")
        try:
            page = fetcher.get(url)
            
            # Extract basic info
            title_el = page.css("title")
            title = title_el[0].text.strip() if title_el else slug.capitalize()
            
            desc_el = page.css("meta[name='description']")
            description = desc_el[0].attrib.get('content', '').strip() if desc_el else f"The best AI tool: {slug}"
            
            # Extract main text content for the body (limit length)
            # Find all paragraph tags and join the first few
            paragraphs = page.css("p")
            body_text = "\n\n".join([p.text.strip() for p in paragraphs[:5] if p.text.strip()])
            if not body_text:
                body_text = "No detailed description available."
            
            # Generate Markdown
            md_content = f"""---
title: "{title.replace('"', '')}"
description: "{description.replace('"', '')}"
pubDate: 2026-05-31
locale: "en"
---

# {title}

**URL:** [{url}]({url})

## Overview
{description}

## Features & Highlights
{body_text}

## Verdict
*This content was automatically generated via the Scrapling workflow.*
"""
            # Save to file
            filepath = os.path.join(CONTENT_DIR, f"{slug}.md")
            with open(filepath, "w", encoding="utf-8") as f:
                f.write(md_content)
                
            print(f"Successfully generated {filepath}")
            
        except Exception as e:
            print(f"Failed to scrape {url}: {e}")

if __name__ == "__main__":
    scrape_and_generate()
