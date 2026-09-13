import { AuthProvider, useAuth } from './context/AuthContext';
import Workspace from './pages/workSpace';
import AuthPage from './pages/AuthPage';
import { Loader2 } from 'lucide-react';

function AppContent() {
  const { isAuthenticated, isGuest, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-neutral-950 text-neutral-400 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <p className="text-xs font-medium tracking-wide">Loading workspace...</p>
      </div>
    );
  }

  if (isAuthenticated || isGuest) {
    return <Workspace />;
  }

  return <AuthPage />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}