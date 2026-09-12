import { useState, useRef, useEffect } from 'react';
import { Image as ImageIcon, Smile, X, Palette } from 'lucide-react';

const COVER_PRESETS = [
  { id: 'sunset', name: 'Sunset Glow', bg: 'bg-gradient-to-r from-violet-600 via-pink-500 to-amber-400' },
  { id: 'sky', name: 'Sky Horizon', bg: 'bg-gradient-to-r from-sky-400 via-rose-300 to-amber-200' },
  { id: 'emerald', name: 'Emerald Forest', bg: 'bg-gradient-to-r from-emerald-500 via-teal-600 to-cyan-700' },
  { id: 'midnight', name: 'Midnight Aurora', bg: 'bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900' },
  { id: 'minimal', name: 'Monochrome Slate', bg: 'bg-gradient-to-r from-zinc-700 via-neutral-800 to-stone-900' },
  { id: 'candy', name: 'Candy Pastel', bg: 'bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-400' },
];

const EMOJI_PRESETS = [
  '📝', '🚀', '💡', '🎯', '📂', '🔥', '✨', '⭐', '📊', '💻',
  '🎨', '📌', '🧪', '🛠️', '📖', '🏆', '⚡', '🎉', '🌿', '❤️',
  '☕', '🔮', '🌐', '💼', '📅', '🧠', '⚙️', '🔍', '📋', '🔑',
];

export default function EditorHeader({
  title = '',
  icon = '📝',
  coverImage = '',
  onTitleChange,
  onIconChange,
  onCoverChange,
}) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showCoverPicker, setShowCoverPicker] = useState(false);

  const emojiRef = useRef(null);
  const coverRef = useRef(null);

  // Close popovers on click outside
  useEffect(() => {
    const handleMousedown = (e) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target)) {
        setShowEmojiPicker(false);
      }
      if (coverRef.current && !coverRef.current.contains(e.target)) {
        setShowCoverPicker(false);
      }
    };
    document.addEventListener('mousedown', handleMousedown);
    return () => document.removeEventListener('mousedown', handleMousedown);
  }, []);

  const handleSelectCover = (bgClass) => {
    if (onCoverChange) onCoverChange(bgClass);
    setShowCoverPicker(false);
  };

  const handleRemoveCover = () => {
    if (onCoverChange) onCoverChange('');
    setShowCoverPicker(false);
  };

  const handleSelectEmoji = (selectedIcon) => {
    if (onIconChange) onIconChange(selectedIcon);
    setShowEmojiPicker(false);
  };

  return (
    <div className="w-full relative">
      {/* Cover Image Banner */}
      {coverImage ? (
        <div className={`relative group w-full h-36 sm:h-48 md:h-56 ${coverImage} overflow-hidden transition-all duration-300`}>
          <div className="absolute top-3 right-3 sm:right-4 flex items-center gap-1.5 sm:gap-2 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={() => setShowCoverPicker(!showCoverPicker)}
              className="bg-black/60 hover:bg-black/80 text-white text-[11px] sm:text-xs px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-md backdrop-blur-md flex items-center gap-1.5 transition-all shadow-sm"
            >
              <Palette className="w-3.5 h-3.5" />
              <span>Change Cover</span>
            </button>
            <button
              type="button"
              onClick={handleRemoveCover}
              className="bg-black/60 hover:bg-red-600/90 text-white text-[11px] sm:text-xs px-2 py-1 sm:py-1.5 rounded-md backdrop-blur-md flex items-center gap-1 transition-all shadow-sm"
              title="Remove Cover"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Cover Palette Selector Dropdown */}
          {showCoverPicker && (
            <div
              ref={coverRef}
              className="absolute top-12 right-3 sm:right-4 z-40 bg-white rounded-xl shadow-2xl border border-neutral-200 p-3 w-64 max-w-[calc(100vw-2rem)] animate-in fade-in zoom-in-95 duration-150"
            >
              <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
                Preset Gradients
              </div>
              <div className="grid grid-cols-2 gap-2">
                {COVER_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectCover(preset.bg)}
                    className={`h-12 rounded-lg ${preset.bg} border border-black/10 hover:scale-105 transition-transform flex items-end p-1 shadow-sm`}
                    title={preset.name}
                  >
                    <span className="text-[10px] text-white font-medium drop-shadow-md truncate">
                      {preset.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : null}

      <div className="max-w-4xl mx-auto px-4 sm:px-8 md:px-12 pt-4 sm:pt-6">
        {/* Header Action Toolbar (when no cover) */}
        {!coverImage && (
          <div className="flex items-center gap-3 text-xs text-neutral-400 mb-3 select-none">
            <button
              type="button"
              onClick={() => handleSelectCover(COVER_PRESETS[0].bg)}
              className="flex items-center gap-1 hover:text-neutral-700 transition-colors py-1 px-1.5 rounded hover:bg-neutral-100"
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Add Cover</span>
            </button>
            <button
              type="button"
              onClick={() => setShowEmojiPicker(true)}
              className="flex items-center gap-1 hover:text-neutral-700 transition-colors py-1 px-1.5 rounded hover:bg-neutral-100"
            >
              <Smile className="w-3.5 h-3.5" />
              <span>Change Icon</span>
            </button>
          </div>
        )}

        {/* Emoji Icon & Emoji Picker */}
        <div className="relative inline-block mb-3" ref={emojiRef}>
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="text-3xl sm:text-4xl select-none cursor-pointer hover:scale-110 active:scale-95 transition-transform p-1 rounded-lg hover:bg-neutral-100 block"
            title="Click to change icon"
          >
            {icon || '📝'}
          </button>

          {showEmojiPicker && (
            <div className="absolute left-0 top-14 z-50 bg-white rounded-xl shadow-2xl border border-neutral-200 p-3 w-64 max-w-[calc(100vw-2rem)] animate-in fade-in zoom-in-95 duration-150">
              <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
                Select an Icon
              </div>
              <div className="grid grid-cols-5 gap-1 max-h-48 overflow-y-auto p-1">
                {EMOJI_PRESETS.map((emojiChar) => (
                  <button
                    key={emojiChar}
                    type="button"
                    onClick={() => handleSelectEmoji(emojiChar)}
                    className="text-xl p-1.5 rounded-lg hover:bg-neutral-100 transition-colors flex items-center justify-center hover:scale-110"
                  >
                    {emojiChar}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Document Title Input */}
        <input
          type="text"
          value={title || ''}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Untitled"
          className="w-full text-2xl sm:text-3xl md:text-4xl font-extrabold text-neutral-900 placeholder-neutral-300 focus:outline-none bg-transparent border-none p-0 tracking-tight leading-tight"
        />
      </div>
    </div>
  );
}