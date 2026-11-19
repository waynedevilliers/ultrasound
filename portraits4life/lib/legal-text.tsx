import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { ReactNode } from 'react';
import type { Locale } from '@/lib/copy';

// Long legal texts (Datenschutz, later AGB and Widerruf) live as Markdown-style files in content/legal/,
// one per page and language, for example content/legal/datenschutz.de.md. Only a small subset is used:
// "## " and "### " headings, paragraphs (line breaks kept), "* " lists, and links written as plain URLs.
// The "# " title line is skipped (the page title comes from the messages), and <!-- comments --> are
// hidden, so TODO(client) notes can stay in the text without being shown.

export type LegalBlock =
  | { type: 'h2'; text: string }
  | { type: 'h3'; text: string }
  | { type: 'p'; lines: string[] }
  | { type: 'ul'; items: string[] };

export function parseLegalText(source: string): LegalBlock[] {
  const lines = source.replace(/<!--[\s\S]*?-->/g, '').split('\n');
  const blocks: LegalBlock[] = [];
  let paragraph: string[] = [];
  let list: string[] = [];
  const flush = () => {
    if (paragraph.length > 0) blocks.push({ type: 'p', lines: paragraph });
    if (list.length > 0) blocks.push({ type: 'ul', items: list });
    paragraph = [];
    list = [];
  };
  for (const raw of lines) {
    const line = raw.trim();
    if (line === '') {
      flush();
    } else if (line.startsWith('### ')) {
      flush();
      blocks.push({ type: 'h3', text: line.slice(4) });
    } else if (line.startsWith('## ')) {
      flush();
      blocks.push({ type: 'h2', text: line.slice(3) });
    } else if (line.startsWith('# ')) {
      flush();
    } else if (line.startsWith('* ') || line.startsWith('- ')) {
      if (paragraph.length > 0) flush();
      list.push(line.slice(2));
    } else {
      if (list.length > 0) flush();
      paragraph.push(line);
    }
  }
  flush();
  return blocks;
}

// Reads the legal text for a page and language, or null when there is none yet.
export function readLegalText(
  page: 'impressum' | 'datenschutz',
  locale: Locale,
): LegalBlock[] | null {
  const file = join(process.cwd(), 'content/legal', `${page}.${locale}.md`);
  if (!existsSync(file)) return null;
  return parseLegalText(readFileSync(file, 'utf8'));
}

// Turns plain URLs in a line into links.
function withLinks(text: string): ReactNode[] {
  return text.split(/(https?:\/\/[^\s)]+[^\s).,])/g).map((part, index) =>
    /^https?:\/\//.test(part) ? (
      <a
        key={index}
        href={part}
        target="_blank"
        rel="noopener noreferrer"
        className="break-words text-brand-strong underline underline-offset-4"
      >
        {part}
      </a>
    ) : (
      part
    ),
  );
}

export function LegalText({ blocks }: { blocks: LegalBlock[] }) {
  return (
    <div className="text-base text-copy">
      {blocks.map((block, index) => {
        if (block.type === 'h2') {
          return (
            <h2 key={index} className="font-display text-2xl font-bold text-ink mt-10 mb-4">
              {block.text}
            </h2>
          );
        }
        if (block.type === 'h3') {
          return (
            <h3 key={index} className="text-lg font-bold text-ink mt-6 mb-2">
              {block.text}
            </h3>
          );
        }
        if (block.type === 'ul') {
          return (
            <ul key={index} className="mb-4 list-disc space-y-2 pl-6 leading-relaxed">
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex}>{withLinks(item)}</li>
              ))}
            </ul>
          );
        }
        return (
          <p key={index} className="mb-4 leading-relaxed">
            {block.lines.map((line, lineIndex) => (
              <span key={lineIndex}>
                {lineIndex > 0 && <br />}
                {withLinks(line)}
              </span>
            ))}
          </p>
        );
      })}
    </div>
  );
}
