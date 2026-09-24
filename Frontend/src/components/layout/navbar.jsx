import { useState } from 'react';
import {
  Share2,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Copy,
  Check,
  FileText,
  Maximize2,
  Minimize2,
  Menu,
  FileDown,
  Sparkles,
  UserPlus,
  ChevronDown,
  Type,
  List,
  ListOrdered,
  CheckSquare,
  Code2,
  Table2,
  KanbanSquare,
  Quote,
  Minus,
  Bold,
  Italic,
  Underline,
} from 'lucide-react';
import { exportToDocx } from '../../services/docxExport';

export default function Navbar({
  title = 'Untitled',
  saveStatus = 'saved',
  content = [],
  isGuest = false,
  onToggleSidebar,
  onGuestSavePrompt,
  onInsertBlock,
  activeBlock,
  onFormatChange,
}) {
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isExportingDocx, setIsExportingDocx] = useState(false);
  const [isEditMenuOpen, setIsEditMenuOpen] = useState(false);

  // Compute stats: word count & block count
  const totalWords = content.reduce((acc, block) => {
    if (!block.text) return acc;
    const words = block.text.trim().split(/\s+/).filter(Boolean);
    return acc + words.length;
  }, 0);

  const handleDownloadDocx = async () => {
    if (isGuest && onGuestSavePrompt) {
      onGuestSavePrompt();
      return;
    }

    try {
      setIsExportingDocx(true);
      await exportToDocx(title, content);
    } catch (err) {
      console.error('Failed to export docx:', err);
      alert('Failed to generate .docx file. Please check console for details.');
    } finally {
      setIsExportingDocx(false);
    }
  };

  const handleCopyMarkdown = () => {
    const markdownLines = [];
    if (title) markdownLines.push(`# ${title}\n`);

    content.forEach((block) => {
      if (block.type === 'table') {
        const headers = block.headers || ['Name', 'Tag', 'Notes'];
        const rows = block.rows || [];
        const headerRow = `| ${headers.join(' | ')} |`;
        const dividerRow = `| ${headers.map(() => '---').join(' | ')} |`;
        const dataRows = rows.map((row) => `| ${row.join(' | ')} |`).join('\n');
        markdownLines.push(`${headerRow}\n${dividerRow}\n${dataRows}`);
        return;
      } else if (block.type === 'board') {
        const columns = block.columns || [];
        const boardLines = [`### Board View\n`];
        columns.forEach((col) => {
          boardLines.push(`**${col.title}**`);
          (col.cards || []).forEach((c) => {
            boardLines.push(`- ${c.title}`);
          });
          boardLines.push('');
        });
        markdownLines.push(boardLines.join('\n'));
        return;
      }

      if (!block.text) return;
      if (block.type === 'h1' || block.type === 'heading') markdownLines.push(`# ${block.text}`);
      else if (block.type === 'h2') markdownLines.push(`## ${block.text}`);
      else if (block.type === 'h3') markdownLines.push(`### ${block.text}`);
      else if (block.type === 'todo') markdownLines.push(`- [${block.checked ? 'x' : ' '}] ${block.text}`);
      else if (block.type === 'bullet') markdownLines.push(`- ${block.text}`);
      else if (block.type === 'numbered') markdownLines.push(`1. ${block.text}`);
      else if (block.type === 'quote') markdownLines.push(`> ${block.text}`);
      else if (block.type === 'code') markdownLines.push(`\`\`\`\n${block.text}\n\`\`\``);
      else if (block.type === 'divider') markdownLines.push(`---`);
      else markdownLines.push(block.text);
    });

    navigator.clipboard.writeText(markdownLines.join('\n\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const editActions = [
    { type: 'paragraph', label: 'Text', icon: Type },
    { type: 'h1', label: 'Heading 1', icon: Type },
    { type: 'bullet', label: 'Bulleted list', icon: List },
    { type: 'numbered', label: 'Numbered list', icon: ListOrdered },
    { type: 'todo', label: 'To-do', icon: CheckSquare },
    { type: 'quote', label: 'Quote', icon: Quote },
    { type: 'code', label: 'Code', icon: Code2 },
    { type: 'table', label: 'Table', icon: Table2 },
    { type: 'board', label: 'Board', icon: KanbanSquare },
    { type: 'divider', label: 'Divider', icon: Minus },
  ];
  const activeStyle = activeBlock?.style || {};

  return (
    <header className="h-12 border-b border-neutral-200/80 px-3 sm:px-6 flex items-center justify-between bg-white text-neutral-600 text-sm select-none shrink-0 z-10 shadow-xs">
      {/* Sidebar Toggle & Breadcrumb */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
        {/* Mobile Hamburger Toggle */}
        <button
          type="button"
          onClick={onToggleSidebar}
          className="md:hidden p-1.5 -ml-1 rounded-md text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
          title="Toggle sidebar menu"
        >
          <Menu className="w-4 h-4" />
        </button>

        <span className="text-neutral-400 font-medium text-xs hidden lg:inline">Workspace</span>
        <span className="text-neutral-300 hidden lg:inline">/</span>
        <span className="font-semibold text-neutral-800 text-xs sm:text-sm truncate max-w-[100px] xs:max-w-[140px] sm:max-w-[200px] md:max-w-[260px]">
          {title && title.trim() !== '' ? title : 'Untitled'}
        </span>

        {/* Dynamic Save State Indicator */}
        <div className="flex items-center gap-1 text-xs pl-1 sm:pl-2 shrink-0">
          {isGuest ? (
            <span
              onClick={onGuestSavePrompt}
              className="flex items-center gap-1 text-amber-700 bg-amber-50 border border-amber-200/70 px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-semibold cursor-pointer hover:bg-amber-100 transition-colors"
              title="Guest Mode: Click to register and enable cloud autosave"
            >
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>Guest Mode (Not Saved)</span>
            </span>
          ) : (
            <>
              {saveStatus === 'saving' && (
                <span className="flex items-center gap-1 text-amber-600 font-medium bg-amber-50 px-1.5 sm:px-2 py-0.5 rounded-full">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span className="text-[10px] sm:text-[11px] hidden xs:inline">Saving...</span>
                </span>
              )}

              {saveStatus === 'saved' && (
                <span className="flex items-center gap-1 text-emerald-600 font-medium bg-emerald-50 px-1.5 sm:px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  <span className="text-[10px] sm:text-[11px] hidden xs:inline">Cloud Saved</span>
                </span>
              )}

              {saveStatus === 'error' && (
                <span
                  className="flex items-center gap-1 text-red-600 font-medium bg-red-50 px-1.5 sm:px-2 py-0.5 rounded-full"
                  title="Changes not saved to cloud"
                >
                  <AlertCircle className="w-3 h-3 text-red-500" />
                  <span className="text-[10px] sm:text-[11px] hidden xs:inline">Save Error</span>
                </span>
              )}
            </>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        <div className="hidden xl:flex items-center gap-1 border-r border-neutral-200 pr-2">
          <select
            value={activeStyle.fontFamily || 'Inter'}
            onChange={(event) => onFormatChange?.({ fontFamily: event.target.value })}
            disabled={!activeBlock}
            className="h-7 max-w-24 rounded border border-neutral-200 bg-white px-1 text-[11px] text-neutral-700 disabled:cursor-not-allowed disabled:opacity-40"
            title="Font family"
          >
            <option value="Inter">Inter</option>
            <option value="Georgia">Georgia</option>
            <option value="Arial">Arial</option>
            <option value="monospace">Mono</option>
          </select>
          <select
            value={activeStyle.fontSize || '16px'}
            onChange={(event) => onFormatChange?.({ fontSize: event.target.value })}
            disabled={!activeBlock}
            className="h-7 w-14 rounded border border-neutral-200 bg-white px-1 text-[11px] text-neutral-700 disabled:cursor-not-allowed disabled:opacity-40"
            title="Font size"
          >
            {['12px', '14px', '16px', '18px', '24px', '32px'].map((size) => <option key={size} value={size}>{size}</option>)}
          </select>
          <label className="relative flex h-7 w-7 cursor-pointer items-center justify-center rounded border border-neutral-200 bg-white" title="Text color">
            <input
              type="color"
              value={activeStyle.color || '#262626'}
              onChange={(event) => onFormatChange?.({ color: event.target.value })}
              disabled={!activeBlock}
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
              aria-label="Text color"
            />
            <span className="h-3.5 w-3.5 rounded-sm border border-neutral-300" style={{ backgroundColor: activeStyle.color || '#262626' }} />
          </label>
          {[
            { key: 'bold', label: 'Bold', Icon: Bold },
            { key: 'italic', label: 'Italic', Icon: Italic },
            { key: 'underline', label: 'Underline', Icon: Underline },
          ].map(({ key, label, Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => onFormatChange?.({ [key]: !activeStyle[key] })}
              disabled={!activeBlock}
              className={`flex h-7 w-7 items-center justify-center rounded border text-neutral-600 transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${activeStyle[key] ? 'border-neutral-900 bg-neutral-900 text-white' : 'border-neutral-200 bg-white hover:bg-neutral-100'}`}
              title={label}
              aria-label={label}
              aria-pressed={Boolean(activeStyle[key])}
            >
              <Icon className="h-3.5 w-3.5" />
            </button>
          ))}
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setIsEditMenuOpen((open) => !open)}
            className="flex items-center gap-1 px-2 sm:px-2.5 py-1 text-xs font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-md transition-colors cursor-pointer"
            title="Insert an editing block"
            aria-expanded={isEditMenuOpen}
          >
            <span>Edit</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
          {isEditMenuOpen && (
            <div className="absolute right-0 top-9 z-30 w-48 rounded-lg border border-neutral-200 bg-white p-1.5 shadow-xl">
              <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-neutral-400">Insert block</p>
              {editActions.map(({ type, label, icon: Icon }) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => {
                    onInsertBlock?.(type);
                    setIsEditMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs text-neutral-700 hover:bg-neutral-100"
                >
                  <Icon className="h-3.5 w-3.5 text-neutral-500" />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Document Stats Badge */}
        <div className="hidden md:flex items-center gap-1 text-xs text-neutral-400 bg-neutral-100 px-2.5 py-1 rounded-md">
          <FileText className="w-3 h-3 text-neutral-500" />
          <span>
            {totalWords} {totalWords === 1 ? 'word' : 'words'}
          </span>
        </div>

        {/* Guest Register CTA Button */}
        {isGuest && (
          <button
            type="button"
            onClick={onGuestSavePrompt}
            className="flex items-center gap-1 px-2 sm:px-2.5 py-1 text-xs font-semibold text-neutral-900 bg-neutral-100 hover:bg-neutral-200 rounded-md transition-colors cursor-pointer border border-neutral-200"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Register to Save</span>
          </button>
        )}

        {/* Save/Export to DOCX Button */}
        <button
          type="button"
          onClick={handleDownloadDocx}
          disabled={isExportingDocx}
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-md transition-all shadow-xs hover:shadow-sm disabled:opacity-50 cursor-pointer"
          title={isGuest ? 'Click to register and save document' : 'Save as Microsoft Word (.docx) file'}
        >
          {isExportingDocx ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span className="hidden sm:inline">Saving...</span>
            </>
          ) : (
            <>
              <FileDown className="w-3.5 h-3.5" />
              <span>Save DOCX</span>
            </>
          )}
        </button>

        {/* Quick Copy Markdown */}
        <button
          type="button"
          onClick={handleCopyMarkdown}
          className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-md transition-colors cursor-pointer"
          title="Copy document content as Markdown"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-emerald-700 font-medium">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-neutral-500" />
              <span className="hidden sm:inline">Copy MD</span>
            </>
          )}
        </button>

        {/* Share Button */}
        <button
          type="button"
          onClick={() => {
            navigator.clipboard.writeText(window.location.href);
            alert('Document link copied to clipboard!');
          }}
          className="hidden sm:flex items-center gap-1.5 px-2 sm:px-2.5 py-1 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-md transition-colors cursor-pointer"
          title="Share document link"
        >
          <Share2 className="w-3.5 h-3.5 text-neutral-500" />
          <span>Share</span>
        </button>

        {/* Fullscreen Toggle */}
        <button
          type="button"
          onClick={toggleFullscreen}
          className="hidden sm:flex p-1.5 hover:bg-neutral-100 rounded-md text-neutral-500 hover:text-neutral-800 transition-colors cursor-pointer"
          title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
        >
          {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
        </button>
      </div>
    </header>
  );
}