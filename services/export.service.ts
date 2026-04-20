import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { AksharDocument, OutputFormat } from '../types/block.types';
import { BLOCK_TYPE_COLORS } from '../constants/theme';

function generateHtml(doc: AksharDocument): string {
  const lang = doc.languages[0]?.split('-')[0] ?? 'en';

  const blocksHtml = doc.blocks
    .map((block) => {
      const dir = block.isRtl ? ' dir="rtl"' : '';
      switch (block.type) {
        case 'HEADER':
          return `<h1${dir}>${block.content}</h1>`;
        case 'HEADLINE':
          return `<h2${dir}>${block.content}</h2>`;
        case 'SUB_HEADLINE':
          return `<h3${dir}>${block.content}</h3>`;
        case 'SECTION_TITLE':
          return `<h4${dir}>${block.content}</h4>`;
        case 'PARAGRAPH':
          return `<p${dir}>${block.content}</p>`;
        case 'FOOTNOTE':
          return `<footer${dir}><small>${block.content}</small></footer>`;
        case 'PAGE_NO':
          return `<div class="page-no"${dir}>${block.content}</div>`;
        case 'IMAGE':
          return `<figure><figcaption>${block.imageCaption ?? ''}</figcaption></figure>`;
        case 'TABLE':
          if (block.tableData) {
            const rows = block.tableData
              .map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join('')}</tr>`)
              .join('');
            return `<table${dir}><tbody>${rows}</tbody></table>`;
          }
          return `<table${dir}><tbody><tr><td>${block.content}</td></tr></tbody></table>`;
        default:
          return `<p${dir}>${block.content}</p>`;
      }
    })
    .join('\n');

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${doc.title}</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 800px; margin: 2rem auto; padding: 0 1rem; line-height: 1.6; }
    h1 { color: #1A1A2E; } h2 { color: #374151; } h3, h4 { color: #4B5563; }
    p { color: #1F2937; } table { border-collapse: collapse; width: 100%; }
    td, th { border: 1px solid #E5E7EB; padding: 0.5rem; }
    footer { color: #6B7280; font-size: 0.875rem; border-top: 1px solid #E5E7EB; margin-top: 2rem; }
    .page-no { text-align: center; color: #9CA3AF; font-size: 0.75rem; }
  </style>
</head>
<body>
${blocksHtml}
</body>
</html>`;
}

function generateMarkdown(doc: AksharDocument): string {
  return doc.blocks
    .map((block) => {
      switch (block.type) {
        case 'HEADER': return `# ${block.content}`;
        case 'HEADLINE': return `## ${block.content}`;
        case 'SUB_HEADLINE': return `### ${block.content}`;
        case 'SECTION_TITLE': return `#### ${block.content}`;
        case 'PARAGRAPH': return block.content;
        case 'FOOTNOTE': return `[^footnote]: ${block.content}`;
        case 'PAGE_NO': return `---\n*Page ${block.content}*\n---`;
        case 'IMAGE': return `![${block.imageCaption ?? ''}](image)`;
        case 'TABLE':
          if (block.tableData && block.tableData.length > 0) {
            const header = `| ${block.tableData[0].join(' | ')} |`;
            const divider = `| ${block.tableData[0].map(() => '---').join(' | ')} |`;
            const rows = block.tableData
              .slice(1)
              .map((row) => `| ${row.join(' | ')} |`)
              .join('\n');
            return `${header}\n${divider}\n${rows}`;
          }
          return block.content;
        default: return block.content;
      }
    })
    .join('\n\n');
}

function generateJson(doc: AksharDocument): string {
  const output = {
    document: {
      title: doc.title,
      pageCount: doc.pages.length,
      languages: doc.languages,
      extractedAt: doc.createdAt,
      blocks: doc.blocks,
    },
  };
  return JSON.stringify(output, null, 2);
}

export async function exportDocument(
  doc: AksharDocument,
  format: OutputFormat
): Promise<string> {
  switch (format) {
    case 'html': return generateHtml(doc);
    case 'markdown': return generateMarkdown(doc);
    case 'json': return generateJson(doc);
  }
}

export async function shareDocument(doc: AksharDocument, format: OutputFormat): Promise<void> {
  const content = await exportDocument(doc, format);
  const ext = format === 'html' ? 'html' : format === 'json' ? 'json' : 'md';
  const fileName = `${doc.title.replace(/\s+/g, '_')}.${ext}`;
  const fileUri = `${FileSystem.cacheDirectory}${fileName}`;

  await FileSystem.writeAsStringAsync(fileUri, content, { encoding: FileSystem.EncodingType.UTF8 });

  const canShare = await Sharing.isAvailableAsync();
  if (canShare) {
    await Sharing.shareAsync(fileUri, {
      mimeType: format === 'html' ? 'text/html' : format === 'json' ? 'application/json' : 'text/markdown',
      dialogTitle: `Share ${doc.title}`,
    });
  }
}

export async function saveToFiles(doc: AksharDocument, format: OutputFormat): Promise<string> {
  const content = await exportDocument(doc, format);
  const ext = format === 'html' ? 'html' : format === 'json' ? 'json' : 'md';
  const fileName = `${doc.title.replace(/\s+/g, '_')}.${ext}`;
  const fileUri = `${FileSystem.documentDirectory}${fileName}`;

  await FileSystem.writeAsStringAsync(fileUri, content, { encoding: FileSystem.EncodingType.UTF8 });
  return fileUri;
}

export function estimateExportSize(doc: AksharDocument, format: OutputFormat): string {
  const rough = doc.blocks.reduce((acc, b) => acc + (b.content?.length ?? 0), 0);
  const multiplier = format === 'html' ? 3 : format === 'json' ? 4 : 1.2;
  const bytes = Math.round(rough * multiplier);
  if (bytes < 1024) return `~${bytes} B`;
  if (bytes < 1024 * 1024) return `~${(bytes / 1024).toFixed(0)} KB`;
  return `~${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
