import { z } from 'zod';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const Block = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('heading'),
    level: z.union([z.literal(2), z.literal(3), z.literal(4)]),
    id: z.string(),
    text: z.string()
  }),
  z.object({
    type: z.literal('paragraph'),
    text: z.string()
  }),
  z.object({
    type: z.literal('list'),
    items: z.array(z.string())
  }),
  z.object({
    type: z.literal('cards'),
    items: z.array(
      z.object({
        title: z.string(),
        body: z.string(),
        link: z.string(),
        href: z.string()
      })
    )
  }),
  z.object({
    type: z.literal('code'),
    file: z.string().optional(),
    lang: z.string(),
    code: z.array(z.string())
  }),
  z.object({
    type: z.literal('callout'),
    kind: z.enum(['note', 'tip', 'warning']),
    text: z.string()
  }),
  z.object({
    type: z.literal('table'),
    headers: z.array(z.string()),
    rows: z.array(z.array(z.string()))
  }),
  z.object({
    type: z.literal('links'),
    items: z.array(
      z.object({
        text: z.string(),
        href: z.string()
      })
    )
  })
]);

const Page = z.object({
  slug: z.string(),
  title: z.string(),
  description: z.string().optional(),
  source: z.string().url(),
  status: z.enum(['draft', 'reviewed']),
  blocks: z.array(Block)
});

function getAllFiles(dir: string): string[] {
  let results: string[] = [];
  const list = readdirSync(dir);
  for (const file of list) {
    const fullPath = join(dir, file);
    const stat = statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getAllFiles(fullPath));
    } else {
      results.push(fullPath);
    }
  }
  return results;
}

let bad = 0;
let totalChecked = 0;
const files = getAllFiles('public/content');

for (const filePath of files) {
  if (!filePath.endsWith('.json') || filePath.endsWith('nav.json')) continue;
  totalChecked++;
  try {
    const content = JSON.parse(readFileSync(filePath, 'utf8'));
    const result = Page.safeParse(content);
    if (!result.success) {
      bad++;
      console.error(`❌ Lỗi schema tại file ${filePath}:`, result.error.issues);
    } else {
      console.log(`✅ Hợp lệ: ${filePath} (${content.blocks.length} blocks)`);
    }
  } catch (err: any) {
    bad++;
    console.error(`❌ Lỗi cú pháp JSON tại file ${filePath}:`, err.message);
  }
}

console.log(`\n========================================`);
console.log(`Tổng số file kiểm tra: ${totalChecked}`);
console.log(`Hợp lệ: ${totalChecked - bad}`);
console.log(`Lỗi: ${bad}`);
console.log(`========================================\n`);

process.exit(bad ? 1 : 0);
