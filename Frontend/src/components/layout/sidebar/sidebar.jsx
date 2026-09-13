import { useState } from 'react';
import {
  Plus,
  Search,
  FilePlus,
  X,
  BookOpen,
  LogOut,
  User,
  Sparkles,
  LogIn,
} from 'lucide-react';
import DocumentItem from './documentitems';

export default function Sidebar({
  documents = [],
  activeDocId,
  user = null,
  isGuest = false,
  onSelectDoc,
  onCreateDoc,
  onDeleteDoc,
  onLogout,
  onTriggerAuth,
  isOpen = false,
  onClose,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const filteredDocs = documents.filter((doc) =>
    (doc.title || 'Untitled').toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  const handleSelect = (id) => {
    onSelectDoc(id);
    if (onClose) onClose();
  };

  const handleCreate = () => {
    onCreateDoc();
    if (onClose) onClose();
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-neutral-900/40 backdrop-blur-xs z-40 md:hidden transition-opacity"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 md:static w-72 h-screen bg-neutral-50/95 border-r border-neutral-200/80 flex flex-col select-none shrink-0 shadow-xl md:shadow-none transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Workspace Header */}
        <div className="p-3.5 border-b border-neutral-200/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-neutral-900 text-white flex items-center justify-center text-xs font-bold shadow-sm">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-sm text-neutral-900 tracking-tight block leading-tight">
                Workshops
              </span>
              <span className="text-[11px] text-neutral-400 font-medium">
                {isGuest ? 'Guest Session' : 'Personal Workspace'}
              </span>
            </div>
          </div>

          {/* Close Button on Mobile */}
          <button
            type="button"
            onClick={onClose}
            className="md:hidden p-1.5 rounded-lg hover:bg-neutral-200 text-neutral-500 hover:text-neutral-800 transition-colors cursor-pointer"
            title="Close sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search & Actions Bar */}
        <div className="px-3 py-2 border-b border-neutral-200/60 text-sm">
          {isSearchOpen ? (
            <div className="relative flex items-center">
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search docs..."
                className="w-full bg-white border border-neutral-200 rounded-md pl-8 pr-7 py-1 text-xs text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-neutral-400 shadow-xs"
              />
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setIsSearchOpen(false);
                }}
                className="p-1 text-neutral-400 hover:text-neutral-700 absolute right-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md hover:bg-neutral-200/60 transition-colors text-left text-neutral-600 font-medium text-xs cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Search className="w-3.5 h-3.5 text-neutral-400" />
                <span>Search documents</span>
              </div>
              <kbd className="text-[10px] bg-neutral-200 text-neutral-500 px-1.5 py-0.5 rounded font-mono">
                /
              </kbd>
            </button>
          )}
        </div>

        {/* Documents List */}
        <div className="flex-1 overflow-y-auto px-2 py-3">
          <div className="flex items-center justify-between px-2 mb-1.5 text-[11px] font-bold text-neutral-400 tracking-wider uppercase">
            <div className="flex items-center gap-1.5">
              <span>Documents</span>
              <span className="text-[10px] text-neutral-400 bg-neutral-200/60 px-1.5 py-0.2 rounded-full font-mono">
                {documents.length}
              </span>
            </div>
            <button
              type="button"
              onClick={handleCreate}
              className="p-1 hover:bg-neutral-200 rounded-md text-neutral-500 hover:text-neutral-900 transition-colors cursor-pointer"
              title="Create new page"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-0.5">
            {filteredDocs.length === 0 ? (
              <div className="px-2 py-8 text-center text-xs text-neutral-400">
                {searchQuery ? (
                <>No documents found matching: {searchQuery}</>
              ) : (
                  <>
                    No documents yet.
                    <br />
                    <span className="text-neutral-500 font-medium">Click below to create one.</span>
                  </>
                )}
              </div>
            ) : (
              filteredDocs.map((doc) => (
                <DocumentItem
                  key={doc.id || doc._id}
                  doc={doc}
                  isActive={(doc.id || doc._id) === activeDocId}
                  onSelect={handleSelect}
                  onDelete={onDeleteDoc}
                />
              ))
            )}
          </div>
        </div>

        {/* New Page CTA Button */}
        <div className="p-3 border-t border-neutral-200/60 bg-neutral-50/50">
          <button
            type="button"
            onClick={handleCreate}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-100 text-xs font-semibold text-neutral-800 shadow-xs hover:shadow-sm transition-all active:scale-[0.99] cursor-pointer"
          >
            <FilePlus className="w-3.5 h-3.5 text-neutral-600" />
            <span>New Document</span>
          </button>
        </div>

        {/* User Account / Guest Profile Footer */}
        <div className="p-3 border-t border-neutral-200/80 bg-neutral-100/70">
          {isGuest ? (
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-bold shrink-0">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-neutral-800 truncate">Guest Mode</p>
                  <p className="text-[10px] text-neutral-500 truncate">In-memory session</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onTriggerAuth}
                className="flex items-center gap-1 text-[11px] font-bold text-neutral-900 bg-white hover:bg-neutral-200 border border-neutral-200 px-2 py-1 rounded-md transition-colors cursor-pointer shrink-0 shadow-2xs"
                title="Sign In or Register to save documents permanently"
              >
                <LogIn className="w-3 h-3" />
                <span>Sign In</span>
              </button>
            </div>
          ) : user ? (
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-full bg-neutral-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
                  {user.name ? user.name.charAt(0).toUpperCase() : <User className="w-3.5 h-3.5" />}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-neutral-800 truncate">{user.name || 'User'}</p>
                  <p className="text-[10px] text-neutral-400 truncate">{user.email}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onLogout}
                className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer shrink-0"
                title="Log Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : null}
        </div>
      </aside>
    </>
  );
}