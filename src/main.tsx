import React from 'react';
import ReactDOM from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import App from './App';
import './styles.css';

const rawClerkKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const clerkKey = (() => {
  if (!rawClerkKey) return '';
  const invalidPlaceholderPatterns = [
    'your_publishable_key',
    'your_clerk_publishable_key',
    'pk_test_humble-dragon',
    'pk_live_your_clerk_publishable_key',
  ];

  return invalidPlaceholderPatterns.some((pattern) => rawClerkKey.includes(pattern))
    ? ''
    : rawClerkKey;
})();

function Root() {
  const app = !clerkKey ? <App clerkMissing /> : (
    <ClerkProvider publishableKey={clerkKey}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ClerkProvider>
  );

  return (
    <ThemeProvider>
      {app}
    </ThemeProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
);
