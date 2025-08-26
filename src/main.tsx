import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { AuthProvider } from './contexts/AuthContext'
import { PreferencesProvider } from './contexts/PreferencesContext'

createRoot(document.getElementById("root")!).render(
  <PreferencesProvider>
    <AuthProvider>
      <App />
    </AuthProvider>
  </PreferencesProvider>
);
