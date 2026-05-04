import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Telegram WebApp types
declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        ready: () => void;
        expand: () => void;
        showAlert: (message: string) => void;
      };
    };
  }
}

createRoot(document.getElementById('root')!).render(<App />)
