export interface DocPage {
  slug: string; // 'overview' | 'essentials/components'
  title: string; // Tiêu đề tiếng Việt
  description?: string;
  source: string; // URL bản gốc angular.dev
  status: 'draft' | 'reviewed';
  blocks: Block[];
}

export type Block =
  | { type: 'heading'; level: 2 | 3 | 4; id: string; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'cards'; items: CardItem[] }
  | { type: 'code'; file?: string; lang: string; code: string[] }
  | { type: 'callout'; kind: 'note' | 'tip' | 'warning'; text: string }
  | { type: 'table'; headers: string[]; rows: string[][] }
  | { type: 'links'; items: { text: string; href: string }[] };

export interface CardItem {
  title: string;
  body: string;
  link: string; // Text trên link/button
  href: string; // 'https://...' hoặc 'essentials/components'
}

export interface NavItem {
  label: string;
  path?: string;
  badge?: 'Updated' | 'New';
  children?: NavItem[];
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}
