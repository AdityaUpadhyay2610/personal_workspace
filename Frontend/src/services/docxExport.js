import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  ShadingType,
} from 'docx';

/**
 * Generates and downloads a .docx file on the user's device
 * @param {string} title - Title of the document
 * @param {Array} content - List of block objects
 */
export async function exportToDocx(title = 'Untitled', content = []) {
  const children = [];

  // Document Title Header
  children.push(
    new Paragraph({
      text: title && title.trim() !== '' ? title : 'Untitled Document',
      heading: HeadingLevel.TITLE,
      spacing: { after: 300, before: 100 },
    })
  );

  let numberedCounter = 0;

  content.forEach((block) => {
    if (block.type === 'numbered') {
      numberedCounter += 1;
    } else {
      numberedCounter = 0;
    }

    // 1. Headings
    if (block.type === 'h1' || block.type === 'heading') {
      children.push(
        new Paragraph({
          text: block.text || '',
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 240, after: 120 },
        })
      );
    } else if (block.type === 'h2') {
      children.push(
        new Paragraph({
          text: block.text || '',
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 },
        })
      );
    } else if (block.type === 'h3') {
      children.push(
        new Paragraph({
          text: block.text || '',
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 160, after: 80 },
        })
      );
    }
    // 2. To-do Item
    else if (block.type === 'todo') {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: block.checked ? '☑ ' : '☐ ',
              bold: true,
              size: 24,
              color: block.checked ? '10B981' : '6B7280',
            }),
            new TextRun({
              text: block.text || '',
              strike: Boolean(block.checked),
              color: block.checked ? '9CA3AF' : '1F2937',
              size: 22,
            }),
          ],
          spacing: { after: 80 },
        })
      );
    }
    // 3. Bullet List
    else if (block.type === 'bullet') {
      children.push(
        new Paragraph({
          text: block.text || '',
          bullet: { level: 0 },
          spacing: { after: 80 },
        })
      );
    }
    // 4. Numbered List
    else if (block.type === 'numbered') {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: `${numberedCounter}. `, bold: true }),
            new TextRun({ text: block.text || '' }),
          ],
          spacing: { after: 80 },
        })
      );
    }
    // 5. Quote
    else if (block.type === 'quote') {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: block.text || '',
              italics: true,
              color: '4B5563',
            }),
          ],
          indent: { left: 720 },
          spacing: { before: 120, after: 120 },
        })
      );
    }
    // 6. Code Block
    else if (block.type === 'code') {
      const codeLines = (block.text || '').split('\n');
      const textRuns = [];

      codeLines.forEach((line, index) => {
        textRuns.push(
          new TextRun({
            text: line || ' ',
            font: 'Consolas',
            size: 19,
            color: '1E293B',
            break: index > 0 ? 1 : 0,
          })
        );
      });

      children.push(
        new Paragraph({
          children: textRuns,
          shading: {
            type: ShadingType.CLEAR,
            fill: 'F1F5F9',
          },
          spacing: { before: 140, after: 140 },
          indent: { left: 360, right: 360 },
        })
      );
    }
    // 7. Divider
    else if (block.type === 'divider') {
      children.push(
        new Paragraph({
          border: {
            bottom: {
              color: 'CBD5E1',
              size: 8,
              space: 4,
              value: 'single',
            },
          },
          spacing: { before: 160, after: 160 },
        })
      );
    }
    // 8. Table Block
    else if (block.type === 'table') {
      const headers = block.headers || ['Name', 'Tag', 'Notes'];
      const rows = block.rows || [];

      const tableRows = [
        new TableRow({
          tableHeader: true,
          children: headers.map(
            (h) =>
              new TableCell({
                shading: { type: ShadingType.CLEAR, fill: 'E2E8F0' },
                children: [
                  new Paragraph({
                    children: [new TextRun({ text: h || '', bold: true, size: 21 })],
                  }),
                ],
              })
          ),
        }),
        ...rows.map(
          (row) =>
            new TableRow({
              children: headers.map(
                (_, cIdx) =>
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [new TextRun({ text: row[cIdx] || '', size: 20 })],
                      }),
                    ],
                  })
              ),
            })
        ),
      ];

      children.push(
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: tableRows,
        })
      );
      children.push(new Paragraph({ text: '', spacing: { after: 140 } }));
    }
    // 9. Board View Block
    else if (block.type === 'board') {
      const columns = block.columns || [];
      children.push(
        new Paragraph({
          text: 'Kanban Board View',
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 180, after: 100 },
        })
      );

      columns.forEach((col) => {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: `▸ ${col.title}`, bold: true, size: 22 })],
            spacing: { before: 80, after: 40 },
          })
        );

        (col.cards || []).forEach((card) => {
          children.push(
            new Paragraph({
              text: card.title || '',
              bullet: { level: 0 },
              spacing: { after: 40 },
            })
          );
        });
      });
      children.push(new Paragraph({ text: '', spacing: { after: 140 } }));
    }
    // 10. Default: Paragraph
    else {
      if (block.text && block.text.trim() !== '') {
        children.push(
          new Paragraph({
            text: block.text,
            spacing: { after: 100 },
          })
        );
      }
    }
  });

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: children.length > 0 ? children : [new Paragraph({ text: '' })],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const cleanFileName = (title || 'Untitled Document')
    .replace(/[^\w\s-]/gi, '')
    .trim()
    .replace(/\s+/g, '_');

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${cleanFileName || 'Document'}.docx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
