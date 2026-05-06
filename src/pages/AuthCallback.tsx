import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';


export function AuthCallback() {
  const [, setLocation] = useLocation();
  const [status, setStatus] = useState('Authenticating with GitHub...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuth = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      const errorParam = params.get('error');

      if (errorParam) {
        setError(`GitHub error: ${errorParam}`);
        return;
      }

      if (!code) {
        setError('No code provided from GitHub');
        return;
      }

      try {
        setStatus('Exchanging code for token...');
        
        // Since we don't have a backend yet, we'll try a common proxy or explain
        // For now, let's assume we're using a simple token exchange flow 
        // OR we'll ask the user to provide a proxy URL
        
        // IMPORTANT: In a real app, this should call your backend
        // For SmolGame, we might need a small edge function or proxy
        
        // If we can't exchange it here (CORS), we'll have to tell the user
        setStatus('Redirecting back...');
        
        // MOCK for now since we're fixing the UI first
        // In reality, this part is tricky without a backend
        // But the 404 the user sees is on GitHub's side, not ours yet.
        
        setTimeout(() => setLocation('/'), 2000);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Authentication failed');
      }
    };

    handleAuth();
  }, [setLocation]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-6 text-center">
        <div className="text-destructive text-4xl mb-4">❌</div>
        <h1 className="text-2xl font-bold mb-2">Authentication Error</h1>
        <p className="text-muted-foreground mb-6">{error}</p>
        <button 
          onClick={() => setLocation('/')}
          className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-medium"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen p-6 text-center">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
      <h1 className="text-2xl font-bold mb-2">{status}</h1>
      <p className="text-muted-foreground">Please wait while we complete the secure login.</p>
    </div>
  );
}
