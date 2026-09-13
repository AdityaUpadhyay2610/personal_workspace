import { useState, useEffect, useCallback } from 'react';
import Sidebar from '../components/layout/sidebar/sidebar';
import Navbar from '../components/layout/navbar';
import EditorHeader from '../features/editor/editorHeader';
import EditorCanvas from '../features/editor/editorCanvas';
import documentServices from '../services/documentServices';
import useAutoSave from '../features/editor/hooks/useAutoSave';
import GuestRegisterModal from '../components/auth/GuestRegisterModal';
import { useAuth } from '../context/AuthContext';
import { Loader2, AlertTriangle, Plus, RefreshCw, UserPlus } from 'lucide-react';

const GUEST_STARTER_DOC = {
  _id: 'guest-starter-1',
  id: 'guest-starter-1',
  title: 'Welcome to Personal Workspace',
  icon: '✨',
  coverImage: '',
  content: [
    { id: 'b1', type: 'h1', text: 'Welcome to your Personal Docx Workspace' },
    {
      id: 'b2',
      type: 'paragraph',
      text: 'This is an interactive document editor. You can write rich text, insert code blocks, tables, and Kanban boards.',
    },
    {
      id: 'b3',
      type: 'todo',
      text: 'Try creating new blocks using the "/" slash command menu',
      checked: false,
    },
    {
      id: 'b4',
      type: 'todo',
      text: 'Sign up for a free account to enable permanent cloud auto-save',
      checked: false,
    },
    {
      id: 'b5',
      type: 'table',
      headers: ['Feature', 'Guest Mode', 'Registered User'],
      rows: [
        ['Local Editing & Formatting', '✅ Full Access', '✅ Full Access'],
        ['DOCX File Export', '✅ Instant Download', '✅ Instant Download'],
        ['Cloud Auto-Save & Sync', '❌ In-memory only', '✅ Multi-device Sync'],
        ['Private Isolated Storage', '❌ In-memory only', '✅ Encrypted DB'],
      ],
    },
  ],
};

export default function Workspace() {
  const { user, isGuest, logout, isRegisterModalOpen, openRegisterModal, closeRegisterModal } = useAuth();

  const [documents, setDocuments] = useState(() => (isGuest ? [GUEST_STARTER_DOC] : []));
  const [activeDoc, setActiveDoc] = useState(() => (isGuest ? GUEST_STARTER_DOC : null));
  const [loading, setLoading] = useState(!isGuest);
  const [error, setError] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Hook to handle auto-saving and track saveStatus: 'saved' | 'saving' | 'error' | 'guest'
  const { saveStatus, queueAutoSave, saveImmediate } = useAutoSave(
    activeDoc,
    (updatedDoc) => {
      if (updatedDoc) {
        const docId = updatedDoc._id || updatedDoc.id;
        setDocuments((prev) =>
          prev.map((doc) =>
            (doc._id || doc.id) === docId
              ? { ...doc, title: updatedDoc.title, icon: updatedDoc.icon, updatedAt: new Date().toISOString() }
              : doc
          )
        );
      }
    },
    500,
    isGuest
  );

  // Load a single document by ID
  const loadDocument = useCallback(
    async (id) => {
      if (!id) return;

      if (isGuest) {
        const found = documents.find((d) => (d._id || d.id) === id);
        if (found) {
          setActiveDoc(found);
          setError(null);
        }
        return;
      }

      try {
        const doc = await documentServices.getById(id);
        setActiveDoc(doc);
        setError(null);
      } catch (err) {
        console.error('Failed to load document:', err);
        setError('Could not load the requested document.');
      }
    },
    [isGuest, documents]
  );

  // Fetch initial document list on mount for logged in user
  const fetchAllDocs = useCallback(async () => {
    if (isGuest) {
      setLoading(false);
      return;
    }

    setError(null);
    try {
      const data = await documentServices.getAll();
      setDocuments(data || []);
      if (data && data.length > 0) {
        const firstDoc = await documentServices.getById(data[0]._id);
        setActiveDoc(firstDoc);
      } else {
        setActiveDoc(null);
      }
    } catch (err) {
      console.error('Failed to fetch user documents:', err);
      setError('Unable to load your documents. Please verify your connection.');
    } finally {
      setLoading(false);
    }
  }, [isGuest]);

  useEffect(() => {
    if (isGuest) {
      setDocuments([GUEST_STARTER_DOC]);
      setActiveDoc(GUEST_STARTER_DOC);
      setLoading(false);
      return;
    }

    let isMounted = true;

    async function initialize() {
      try {
        const data = await documentServices.getAll();
        if (!isMounted) return;
        setDocuments(data || []);
        if (data && data.length > 0) {
          const firstDoc = await documentServices.getById(data[0]._id);
          if (isMounted) setActiveDoc(firstDoc);
        } else {
          if (isMounted) setActiveDoc(null);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Failed to initialize documents:', err);
          setError('Unable to load documents from database.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    initialize();

    return () => {
      isMounted = false;
    };
  }, [isGuest]);

  // Update browser tab title based on current document
  useEffect(() => {
    if (activeDoc?.title && activeDoc.title.trim() !== '') {
      document.title = `${activeDoc.title} · Document Workshops`;
    } else {
      document.title = 'Document Workshops';
    }
  }, [activeDoc?.title]);

  // Create new document
  const handleCreateDoc = async () => {
    if (isGuest) {
      const newGuestDoc = {
        _id: `guest-${crypto.randomUUID()}`,
        id: `guest-${crypto.randomUUID()}`,
        title: 'Untitled Document',
        icon: '📝',
        coverImage: '',
        content: [
          { id: crypto.randomUUID(), type: 'h1', text: 'New Page' },
          { id: crypto.randomUUID(), type: 'paragraph', text: 'Start typing or press "/" to insert blocks...' },
        ],
      };
      setDocuments((prev) => [newGuestDoc, ...prev]);
      setActiveDoc(newGuestDoc);
      setError(null);
      return;
    }

    try {
      const newDoc = await documentServices.create({
        title: 'Untitled Document',
        icon: '📝',
        coverImage: '',
        content: [
          { id: crypto.randomUUID(), type: 'h1', text: 'New Page' },
          { id: crypto.randomUUID(), type: 'paragraph', text: 'Start writing notes or press "/" for commands...' },
        ],
      });

      setDocuments((prev) => [newDoc, ...prev]);
      setActiveDoc(newDoc);
      setError(null);
    } catch (err) {
      console.error('Failed to create document:', err);
      setError('Failed to create a new document in database.');
    }
  };

  // Switch to another document
  const handleSelectDoc = async (id) => {
    const activeId = activeDoc?._id || activeDoc?.id;
    if (activeDoc && activeId === id) return;
    await loadDocument(id);
  };

  // Update title
  const handleTitleChange = (newTitle) => {
    if (!activeDoc) return;
    const docId = activeDoc._id || activeDoc.id;
    setActiveDoc((prev) => ({ ...prev, title: newTitle }));
    setDocuments((prev) =>
      prev.map((doc) => ((doc._id || doc.id) === docId ? { ...doc, title: newTitle } : doc))
    );
    queueAutoSave({ title: newTitle });
  };

  // Update icon
  const handleIconChange = (newIcon) => {
    if (!activeDoc) return;
    const docId = activeDoc._id || activeDoc.id;
    setActiveDoc((prev) => ({ ...prev, icon: newIcon }));
    setDocuments((prev) =>
      prev.map((doc) => ((doc._id || doc.id) === docId ? { ...doc, icon: newIcon } : doc))
    );
    saveImmediate({ icon: newIcon });
  };

  // Update cover image
  const handleCoverChange = (coverImageClass) => {
    if (!activeDoc) return;
    setActiveDoc((prev) => ({ ...prev, coverImage: coverImageClass }));
    saveImmediate({ coverImage: coverImageClass });
  };

  // Update content blocks
  const handleUpdateBlocks = (newBlocks) => {
    if (!activeDoc) return;
    setActiveDoc((prev) => ({ ...prev, content: newBlocks }));
    queueAutoSave({ content: newBlocks });
  };

  // Delete a document
  const handleDeleteDoc = async (id) => {
    const activeId = activeDoc?._id || activeDoc?.id;
    const remaining = documents.filter((doc) => (doc._id || doc.id) !== id);
    setDocuments(remaining);

    if (activeDoc && activeId === id) {
      if (remaining.length > 0) {
        loadDocument(remaining[0]._id || remaining[0].id);
      } else {
        setActiveDoc(null);
      }
    }

    if (!isGuest) {
      try {
        await documentServices.delete(id);
      } catch (err) {
        console.error('Failed to delete document:', err);
        setError('Failed to delete document from database.');
        fetchAllDocs();
      }
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white">
      {/* Guest Register / Save Warning Modal */}
      <GuestRegisterModal
        isOpen={isRegisterModalOpen}
        onClose={closeRegisterModal}
        currentDocTitle={activeDoc?.title || 'Untitled'}
        currentDocContent={activeDoc?.content || []}
      />

      {/* Sidebar Navigation */}
      <Sidebar
        documents={documents.map((d) => ({ ...d, id: d._id || d.id }))}
        activeDocId={activeDoc?._id || activeDoc?.id}
        user={user}
        isGuest={isGuest}
        onSelectDoc={handleSelectDoc}
        onCreateDoc={handleCreateDoc}
        onDeleteDoc={handleDeleteDoc}
        onLogout={logout}
        onTriggerAuth={openRegisterModal}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Workspace Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-white min-w-0">
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center text-sm text-neutral-400 gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-neutral-500" />
            <p>Loading your documents...</p>
          </div>
        ) : error ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-500 mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-neutral-800 mb-1">Connection Issue</h3>
            <p className="text-sm text-neutral-500 max-w-md mb-4">{error}</p>
            <button
              type="button"
              onClick={fetchAllDocs}
              className="flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white rounded-lg text-xs font-medium hover:bg-neutral-800 transition-colors shadow-sm cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          </div>
        ) : activeDoc ? (
          <>
            {/* Top Navigation Bar */}
            <Navbar
              title={activeDoc.title}
              saveStatus={saveStatus}
              content={activeDoc.content || []}
              isGuest={isGuest}
              onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
              onGuestSavePrompt={openRegisterModal}
            />

            {/* Scrollable Document Area */}
            <div className="flex-1 overflow-y-auto">
              <EditorHeader
                key={`header-${activeDoc._id || activeDoc.id}`}
                title={activeDoc.title}
                icon={activeDoc.icon}
                coverImage={activeDoc.coverImage}
                onTitleChange={handleTitleChange}
                onIconChange={handleIconChange}
                onCoverChange={handleCoverChange}
              />
              <EditorCanvas
                key={`canvas-${activeDoc._id || activeDoc.id}`}
                blocks={activeDoc.content || []}
                onUpdateBlocks={handleUpdateBlocks}
                title={activeDoc.title}
              />
            </div>
          </>
        ) : (
          /* Empty Workspace State */
          <div className="flex-1 flex flex-col items-center justify-center text-neutral-400 gap-3 p-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-neutral-100 flex items-center justify-center text-2xl shadow-xs">
              📄
            </div>
            <div>
              <h3 className="text-base font-semibold text-neutral-800 mb-0.5">No document selected</h3>
              <p className="text-xs text-neutral-500">Create a page or select one from the sidebar to get started.</p>
            </div>
            <button
              type="button"
              onClick={handleCreateDoc}
              className="flex items-center gap-1.5 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 px-4 py-2 rounded-lg transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create New Page</span>
            </button>
          </div>
        )}
      </main>
    </div>
  );
}