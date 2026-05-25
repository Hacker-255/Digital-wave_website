import { Toaster } from 'sonner';
import { AppShell } from './components/AppShell';

type AppProps = {
  clerkMissing?: boolean;
};

export default function App({ clerkMissing = false }: AppProps) {
  return (
    <>
      <AppShell clerkMissing={clerkMissing} />
      <Toaster richColors theme="dark" position="top-right" />
    </>
  );
}
