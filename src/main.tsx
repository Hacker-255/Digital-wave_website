import React from 'react';
import ReactDOM from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import App from './App';
import './styles.css';

const clerkKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

const Root = () => {
  if (!clerkKey) {
    return <App clerkMissing />;
  }

  return (
    <ClerkProvider publishableKey={clerkKey}>
      <App />
    </ClerkProvider>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
);
