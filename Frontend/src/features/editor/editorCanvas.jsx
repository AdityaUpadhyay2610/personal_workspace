import { useState, useRef, useEffect, useCallback } from 'react';
import { Plus, GripVertical, Trash2 } from 'lucide-react';
import SlashMenu from './slashMenu';
import CodeBlock from './codeBlock';
import TableBlock from './tableBlock';
import BoardBlock from './boardBlock';
import { exportToDocx } from '../../services/docxExport';

export default function EditorCanvas({ blocks = [], onUpdateBlocks, title = 'Untitled', onActiveBlockChange }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuQuery, setMenuQuery] = useState('');
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [activeBlockId, setActiveBlockId] = useState(null);

  const blockRefs = useRef({});
  const getBlockStyle = (block) => ({
    ...(block.style?.fontFamily ? { fontFamily: block.style.fontFamily } : {}),
    ...(block.style?.fontSize ? { fontSize: block.style.fontSize } : {}),
    ...(block.style?.color ? { color: block.style.color } : {}),
    ...(block.style?.bold ? { fontWeight: 700 } : {}),
    ...(block.style?.italic ? { fontStyle: 'italic' } : {}),
    ...(block.style?.underline ? { textDecoration: 'underline' } : {}),
  });

  const handleBlockFocus = (blockId) => onActiveBlockChange?.(blockId);

  // Auto resize helper
  const autoResize = useCallback((el) => {
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, []);

  // Ensure all textareas are properly sized on mount or when blocks change
  useEffect(() => {
    Object.values(blockRefs.current).forEach((el) => {
      if (el && el.tagName === 'TEXTAREA') {
        autoResize(el);
      }
    });
  }, [blocks, autoResize]);

  // 1. Text input change handler with smart '/' detection
  const handleTextChange = (id, newText, targetElement) => {
    const updated = blocks.map((block) =>
      block.id === id ? { ...block, text: newText } : block
    );
    onUpdateBlocks(updated);

    // Smart slash command detection: match / at beginning or after whitespace
    const slashMatch = newText.match(/(?:^|\s)\/([a-zA-Z0-9]*)$/);

    if (slashMatch && targetElement) {
      const rect = targetElement.getBoundingClientRect();
      // Menu is fixed, so use viewport rect without adding scroll offset
      setMenuPosition({
        top: rect.bottom + 4,
        left: Math.max(16, rect.left),
      });
      setMenuQuery(slashMatch[1] || '');
      setActiveBlockId(id);
      setMenuOpen(true);
    } else {
      setMenuOpen(false);
    }
  };

  // 2. Select block type from slash menu
  const handleSelectBlockType = (type) => {
    if (type === 'export-docx') {
      const updated = blocks.map((block) => {
        if (block.id === activeBlockId) {
          const lastSlashIndex = block.text ? block.text.lastIndexOf('/') : -1;
          const cleanText = lastSlashIndex !== -1 ? block.text.slice(0, lastSlashIndex).trim() : block.text || '';
          return { ...block, text: cleanText };
        }
        return block;
      });
      onUpdateBlocks(updated);
      setMenuOpen(false);
      setMenuQuery('');
      exportToDocx(title, updated);
      return;
    }
    const updated = blocks.map((block) => {
      if (block.id === activeBlockId) {
        // Safely strip the trailing /query without raw regex crash
        const lastSlashIndex = block.text ? block.text.lastIndexOf('/') : -1;
        const cleanText = lastSlashIndex !== -1 ? block.text.slice(0, lastSlashIndex).trim() : block.text || '';

        let extraFields = {};
        if (type === 'table') {
          extraFields = {
            headers: block.headers || ['Name', 'Tag', 'Notes'],
            rows: block.rows || [
              ['Task 1', 'Active', 'Initial design draft'],
              ['Task 2', 'Pending', 'Code review'],
            ],
          };
        } else if (type === 'board') {
          extraFields = {
            columns: block.columns || [
              {
                id: crypto.randomUUID(),
                title: 'To Do',
                color: 'amber',
                cards: [{ id: crypto.randomUUID(), title: 'Brainstorm feature ideas' }],
              },
              {
                id: crypto.randomUUID(),
                title: 'In Progress',
                color: 'blue',
                cards: [{ id: crypto.randomUUID(), title: 'Build UI prototype' }],
              },
              {
                id: crypto.randomUUID(),
                title: 'Done',
                color: 'emerald',
                cards: [{ id: crypto.randomUUID(), title: 'Project setup & repository' }],
              },
            ],
          };
        }

        return {
          ...block,
          type: type,
          text: cleanText,
          checked: type === 'todo' ? false : undefined,
          ...extraFields,
        };
      }
      return block;
    });

    onUpdateBlocks(updated);
    setMenuOpen(false);
    setMenuQuery('');

    setTimeout(() => {
      const activeInput = blockRefs.current[activeBlockId];
      if (activeInput) {
        activeInput.focus();
        if (activeInput.tagName === 'TEXTAREA') autoResize(activeInput);
      }
    }, 20);
  };

  // Update custom block fields (table rows/headers, board columns/cards)
  const handleUpdateBlockData = (id, customData) => {
    const updated = blocks.map((block) =>
      block.id === id ? { ...block, ...customData } : block
    );
    onUpdateBlocks(updated);
  };

  // 3. Toggle checkbox
  const handleToggleTodo = (id) => {
    const updated = blocks.map((block) =>
      block.id === id ? { ...block, checked: !block.checked } : block
    );
    onUpdateBlocks(updated);
  };

  // 4. Delete specific block
  const handleDeleteBlock = (id) => {
    if (blocks.length <= 1) {
      onUpdateBlocks([{ id: crypto.randomUUID(), type: 'paragraph', text: '' }]);
      return;
    }
    const updated = blocks.filter((b) => b.id !== id);
    onUpdateBlocks(updated);
  };

  // 5. Add a block after index
  const handleAddBlockAfter = (index, type = 'paragraph') => {
    const newBlock = {
      id: crypto.randomUUID(),
      type,
      text: '',
      checked: type === 'todo' ? false : undefined,
    };
    const updated = [...blocks];
    updated.splice(index + 1, 0, newBlock);
    onUpdateBlocks(updated);

    setTimeout(() => {
      const nextInput = blockRefs.current[newBlock.id];
      if (nextInput) {
        nextInput.focus();
        if (nextInput.tagName === 'TEXTAREA') autoResize(nextInput);
      }
    }, 20);
  };

  // 6. Keyboard navigation (Enter / Backspace)
  const handleKeyDown = (e, index, block) => {
    if (menuOpen) return;

    // Enter key handling
    if (e.key === 'Enter') {
      // Allow multi-line typing in code block unless Shift/Cmd+Enter
      if (block.type === 'code' && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
        return; // default newline inside textarea
      }

      if (!e.shiftKey) {
        e.preventDefault();

        // If list or todo is empty, convert back to paragraph (outdent)
        if ((block.type === 'todo' || block.type === 'bullet' || block.type === 'numbered') && (!block.text || block.text.trim() === '')) {
          const updated = [...blocks];
          updated[index] = { ...block, type: 'paragraph', checked: undefined };
          onUpdateBlocks(updated);
          return;
        }

        // Continue same list type for todo, bullet, numbered
        let nextType = 'paragraph';
        if (block.type === 'todo') nextType = 'todo';
        else if (block.type === 'bullet') nextType = 'bullet';
        else if (block.type === 'numbered') nextType = 'numbered';

        handleAddBlockAfter(index, nextType);
      }
    }

    // Backspace handling
    else if (e.key === 'Backspace') {
      const isBlockEmpty = !block.text || block.text === '';

      // If at start of a styled block and it's not a normal paragraph, revert to paragraph first
      if (isBlockEmpty && block.type !== 'paragraph') {
        e.preventDefault();
        const updated = [...blocks];
        updated[index] = { ...block, type: 'paragraph', checked: undefined };
        onUpdateBlocks(updated);
        return;
      }

      // If paragraph is empty and we have more than 1 block, remove it and focus previous
      if (isBlockEmpty && blocks.length > 1) {
        e.preventDefault();
        const updated = blocks.filter((_, i) => i !== index);
        onUpdateBlocks(updated);

        const prevBlock = blocks[index - 1] || blocks[index + 1];
        if (prevBlock) {
          setTimeout(() => {
            const prevInput = blockRefs.current[prevBlock.id];
            if (prevInput) {
              prevInput.focus();
              if (prevInput.setSelectionRange && prevInput.value) {
                const len = prevInput.value.length;
                prevInput.setSelectionRange(len, len);
              }
            }
          }, 20);
        }
      }
    }
  };

  const [draggedBlockId, setDraggedBlockId] = useState(null);
  const [dragOverInfo, setDragOverInfo] = useState(null); // { blockId: string, position: 'top' | 'bottom' }

  // Drag and drop handlers for code snippets ONLY
  const handleDragStart = (e, block) => {
    if (block.type !== 'code') {
      e.preventDefault();
      return;
    }
    setDraggedBlockId(block.id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', block.id);
    e.dataTransfer.setData('application/x-code-block', block.id);
  };

  const handleDragOver = (e, targetBlock) => {
    if (!draggedBlockId) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    if (targetBlock.id === draggedBlockId) {
      if (dragOverInfo !== null) setDragOverInfo(null);
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    const position = e.clientY < midY ? 'top' : 'bottom';

    if (!dragOverInfo || dragOverInfo.blockId !== targetBlock.id || dragOverInfo.position !== position) {
      setDragOverInfo({ blockId: targetBlock.id, position });
    }
  };

  const handleDragLeave = (e, targetBlock) => {
    if (e.relatedTarget && e.currentTarget.contains(e.relatedTarget)) {
      return;
    }
    if (dragOverInfo?.blockId === targetBlock.id) {
      setDragOverInfo(null);
    }
  };

  const handleDrop = (e, targetBlock) => {
    e.preventDefault();
    if (!draggedBlockId || draggedBlockId === targetBlock.id) {
      setDraggedBlockId(null);
      setDragOverInfo(null);
      return;
    }

    const fromIndex = blocks.findIndex((b) => b.id === draggedBlockId);
    if (fromIndex === -1) {
      setDraggedBlockId(null);
      setDragOverInfo(null);
      return;
    }

    const newBlocks = [...blocks];
    const [movedBlock] = newBlocks.splice(fromIndex, 1);

    let toIndex = newBlocks.findIndex((b) => b.id === targetBlock.id);
    if (toIndex === -1) {
      setDraggedBlockId(null);
      setDragOverInfo(null);
      return;
    }

    if (dragOverInfo?.position === 'bottom') {
      toIndex += 1;
    }

    newBlocks.splice(toIndex, 0, movedBlock);
    onUpdateBlocks(newBlocks);
    setDraggedBlockId(null);
    setDragOverInfo(null);
  };

  const handleDragEnd = () => {
    setDraggedBlockId(null);
    setDragOverInfo(null);
  };

  // Helper to calculate numbered list counters
  let numberedCounter = 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 md:px-12 py-4 sm:py-6 text-neutral-800 space-y-1 relative min-h-[500px]">
      {blocks.length === 0 ? (
        <div className="py-8 text-center">
          <button
            type="button"
            onClick={() =>
              onUpdateBlocks([{ id: crypto.randomUUID(), type: 'paragraph', text: '' }])
            }
            className="text-neutral-400 italic text-sm hover:text-neutral-600 transition-colors cursor-text inline-block p-4 border border-dashed border-neutral-200 rounded-lg w-full"
          >
            Click here or press any key to start writing...
          </button>
        </div>
      ) : (
        blocks.map((block, index) => {
          if (block.type === 'numbered') {
            numberedCounter += 1;
          } else {
            numberedCounter = 0;
          }

          const isCodeBlock = block.type === 'code';
          const isCurrentDragged = draggedBlockId === block.id;
          const showDropTop = dragOverInfo?.blockId === block.id && dragOverInfo?.position === 'top';
          const showDropBottom = dragOverInfo?.blockId === block.id && dragOverInfo?.position === 'bottom';

          return (
            <div
              key={block.id}
              onDragOver={(e) => handleDragOver(e, block)}
              onDragLeave={(e) => handleDragLeave(e, block)}
              onDrop={(e) => handleDrop(e, block)}
              className="relative"
            >
              {/* Drop Target Indicator Line (Above) */}
              {showDropTop && (
                <div className="relative py-1 flex items-center justify-center animate-in fade-in duration-100">
                  <div className="w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-500 rounded-full shadow-md shadow-blue-500/40" />
                  <span className="absolute right-2 px-2 py-0.5 text-[10px] font-mono bg-blue-600 text-white rounded-full font-medium shadow pointer-events-none">
                    Move snippet here
                  </span>
                </div>
              )}

              <div
                className={`group relative flex items-start gap-1.5 -ml-7 pl-7 sm:-ml-8 sm:pl-8 rounded-lg hover:bg-neutral-50/50 transition-colors ${
                  isCurrentDragged ? 'opacity-30' : ''
                }`}
              >
                {/* Block Action Controls (Accessible on hover & touch) */}
                <div className="absolute left-0 top-1.5 opacity-30 sm:opacity-0 sm:group-hover:opacity-100 group-focus-within:opacity-100 flex items-center gap-0.5 text-neutral-400 transition-opacity z-10">
                  <button
                    type="button"
                    onClick={() => handleAddBlockAfter(index)}
                    className="p-1 hover:bg-neutral-200 rounded text-neutral-400 hover:text-neutral-700 transition-colors"
                    title="Add block below"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>

                  {/* Drag Handle enabled ONLY for code snippets */}
                  {isCodeBlock && (
                    <div
                      draggable
                      onDragStart={(e) => handleDragStart(e, block)}
                      onDragEnd={handleDragEnd}
                      className="p-1 cursor-grab active:cursor-grabbing text-neutral-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title="Drag code snippet to reorder"
                    >
                      <GripVertical className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>

                {/* Render Block by Type */}
                <div className="flex-1 w-full min-w-0">
                  {/* Heading 1 */}
                  {(block.type === 'h1' || block.type === 'heading') && (
                    <input
                      ref={(el) => (blockRefs.current[block.id] = el)}
                      type="text"
                      value={block.text || ''}
                      placeholder="Heading 1"
                      onChange={(e) => handleTextChange(block.id, e.target.value, e.target)}
                      onFocus={() => handleBlockFocus(block.id)}
                      onKeyDown={(e) => handleKeyDown(e, index, block)}
                      style={getBlockStyle(block)}
                      className="w-full text-2xl sm:text-3xl font-extrabold text-neutral-900 placeholder-neutral-300 border-none bg-transparent focus:outline-none py-1.5 tracking-tight"
                    />
                  )}

                  {/* Heading 2 */}
                  {block.type === 'h2' && (
                    <input
                      ref={(el) => (blockRefs.current[block.id] = el)}
                      type="text"
                      value={block.text || ''}
                      placeholder="Heading 2"
                      onChange={(e) => handleTextChange(block.id, e.target.value, e.target)}
                      onFocus={() => handleBlockFocus(block.id)}
                      onKeyDown={(e) => handleKeyDown(e, index, block)}
                      style={getBlockStyle(block)}
                      className="w-full text-xl sm:text-2xl font-bold text-neutral-800 placeholder-neutral-300 border-none bg-transparent focus:outline-none py-1 tracking-tight"
                    />
                  )}

                  {/* Heading 3 */}
                  {block.type === 'h3' && (
                    <input
                      ref={(el) => (blockRefs.current[block.id] = el)}
                      type="text"
                      value={block.text || ''}
                      placeholder="Heading 3"
                      onChange={(e) => handleTextChange(block.id, e.target.value, e.target)}
                      onFocus={() => handleBlockFocus(block.id)}
                      onKeyDown={(e) => handleKeyDown(e, index, block)}
                      style={getBlockStyle(block)}
                      className="w-full text-lg sm:text-xl font-semibold text-neutral-800 placeholder-neutral-300 border-none bg-transparent focus:outline-none py-1 tracking-tight"
                    />
                  )}

                  {/* To-Do Item */}
                  {block.type === 'todo' && (
                    <div className="flex items-start gap-2.5 py-1">
                      <input
                        type="checkbox"
                        checked={Boolean(block.checked)}
                        onChange={() => handleToggleTodo(block.id)}
                        className="mt-1 rounded w-4 h-4 accent-neutral-900 cursor-pointer text-white"
                      />
                      <input
                        ref={(el) => (blockRefs.current[block.id] = el)}
                        type="text"
                        value={block.text || ''}
                        placeholder="To-do..."
                        onChange={(e) => handleTextChange(block.id, e.target.value, e.target)}
                        onFocus={() => handleBlockFocus(block.id)}
                        onKeyDown={(e) => handleKeyDown(e, index, block)}
                        style={getBlockStyle(block)}
                        className={`w-full text-base bg-transparent border-none focus:outline-none ${
                          block.checked
                            ? 'line-through text-neutral-400 selection:bg-neutral-200'
                            : 'text-neutral-800'
                        }`}
                      />
                    </div>
                  )}

                  {/* Bullet List */}
                  {block.type === 'bullet' && (
                    <div className="flex items-start gap-2.5 py-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-neutral-700 shrink-0 mt-2.5 mx-1" />
                      <input
                        ref={(el) => (blockRefs.current[block.id] = el)}
                        type="text"
                        value={block.text || ''}
                        placeholder="List item..."
                        onChange={(e) => handleTextChange(block.id, e.target.value, e.target)}
                        onFocus={() => handleBlockFocus(block.id)}
                        onKeyDown={(e) => handleKeyDown(e, index, block)}
                        style={getBlockStyle(block)}
                        className="w-full text-base text-neutral-800 placeholder-neutral-300 border-none bg-transparent focus:outline-none py-0.5"
                      />
                    </div>
                  )}

                  {/* Numbered List */}
                  {block.type === 'numbered' && (
                    <div className="flex items-start gap-2 py-0.5">
                      <span className="font-mono text-sm text-neutral-500 shrink-0 mt-1 min-w-[20px] select-none">
                        {numberedCounter}.
                      </span>
                      <input
                        ref={(el) => (blockRefs.current[block.id] = el)}
                        type="text"
                        value={block.text || ''}
                        placeholder="Numbered item..."
                        onChange={(e) => handleTextChange(block.id, e.target.value, e.target)}
                        onFocus={() => handleBlockFocus(block.id)}
                        onKeyDown={(e) => handleKeyDown(e, index, block)}
                        style={getBlockStyle(block)}
                        className="w-full text-base text-neutral-800 placeholder-neutral-300 border-none bg-transparent focus:outline-none py-0.5"
                      />
                    </div>
                  )}

                  {/* Quote Block */}
                  {block.type === 'quote' && (
                    <div className="border-l-4 border-neutral-300 pl-3 py-1 my-1 italic bg-neutral-50/50 rounded-r">
                      <textarea
                        ref={(el) => {
                          blockRefs.current[block.id] = el;
                          autoResize(el);
                        }}
                        rows={1}
                        value={block.text || ''}
                        placeholder="Empty quote..."
                        onInput={(e) => autoResize(e.target)}
                        onChange={(e) => handleTextChange(block.id, e.target.value, e.target)}
                        onFocus={() => handleBlockFocus(block.id)}
                        onKeyDown={(e) => handleKeyDown(e, index, block)}
                        style={getBlockStyle(block)}
                        className="w-full text-base text-neutral-700 placeholder-neutral-400 resize-none overflow-hidden border-none bg-transparent focus:outline-none leading-relaxed italic"
                      />
                    </div>
                  )}

                  {/* Code Block (macOS Window Style) */}
                  {block.type === 'code' && (
                    <CodeBlock
                      block={block}
                      onChange={(newText, targetEl) => handleTextChange(block.id, newText, targetEl)}
                      onKeyDown={(e) => handleKeyDown(e, index, block)}
                      inputRef={(el) => {
                        if (el) blockRefs.current[block.id] = el;
                      }}
                      onDragStart={(e) => handleDragStart(e, block)}
                      onDragEnd={handleDragEnd}
                      isDragging={isCurrentDragged}
                    />
                  )}

                  {/* Table Block */}
                  {block.type === 'table' && (
                    <TableBlock
                      block={block}
                      onChange={(data) => handleUpdateBlockData(block.id, data)}
                    />
                  )}

                  {/* Board View Block */}
                  {block.type === 'board' && (
                    <BoardBlock
                      block={block}
                      onChange={(data) => handleUpdateBlockData(block.id, data)}
                    />
                  )}

                  {/* Divider Block */}
                  {block.type === 'divider' && (
                    <div className="py-3 flex items-center">
                      <hr className="w-full border-t border-neutral-200 my-2" />
                    </div>
                  )}

                  {/* Default: Paragraph */}
                  {(!block.type || block.type === 'paragraph') && (
                    <textarea
                      ref={(el) => {
                        blockRefs.current[block.id] = el;
                        autoResize(el);
                      }}
                      rows={1}
                      value={block.text || ''}
                      placeholder="Type '/' for commands..."
                      onInput={(e) => autoResize(e.target)}
                      onChange={(e) => handleTextChange(block.id, e.target.value, e.target)}
                      onFocus={() => handleBlockFocus(block.id)}
                      onKeyDown={(e) => handleKeyDown(e, index, block)}
                      style={getBlockStyle(block)}
                      className="w-full text-base text-neutral-800 placeholder-neutral-300 resize-none overflow-hidden border-none bg-transparent focus:outline-none leading-relaxed py-1"
                    />
                  )}
                </div>

                {/* Block delete button on hover */}
                <button
                  type="button"
                  onClick={() => handleDeleteBlock(block.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-neutral-200 rounded text-neutral-300 hover:text-red-500 transition-opacity ml-1 mt-1"
                  title="Delete block"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Drop Target Indicator Line (Below) */}
              {showDropBottom && (
                <div className="relative py-1 flex items-center justify-center animate-in fade-in duration-100">
                  <div className="w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-500 rounded-full shadow-md shadow-blue-500/40" />
                  <span className="absolute right-2 px-2 py-0.5 text-[10px] font-mono bg-blue-600 text-white rounded-full font-medium shadow pointer-events-none">
                    Move snippet here
                  </span>
                </div>
              )}
            </div>
          );
        })
      )}

      {/* Slash Command Popup Menu */}
      {menuOpen && (
        <SlashMenu
          query={menuQuery}
          position={menuPosition}
          onSelect={handleSelectBlockType}
          onClose={() => setMenuOpen(false)}
        />
      )}
    </div>
  );
}