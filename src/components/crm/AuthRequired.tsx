import { LockKeyhole } from 'lucide-react';
import { SignedIn, SignedOut, SignInButton, SignUpButton } from '@clerk/clerk-react';
import { CRM_ROUTE } from '../../constants/design';

interface AuthRequiredProps {
  clerkMissing: boolean;
  children: React.ReactNode;
}

export function AuthRequired({ clerkMissing, children }: AuthRequiredProps) {
  if (clerkMissing) {
    return (
      <div className="auth-lock">
        <LockKeyhole size={28} />
        <h2>Login required</h2>
        <p>Add your Clerk publishable key to unlock the Digital Wave CRM workspace.</p>
      </div>
    );
  }

  return (
    <>
      <SignedOut>
        <div className="auth-lock">
          <LockKeyhole size={28} />
          <h2>Sign in to open the CRM</h2>
          <p>Use Google, GitHub, Apple, or email through Clerk before accessing CRM records and workflows.</p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <SignInButton mode="modal" forceRedirectUrl={CRM_ROUTE}>
              <button className="landing-ghost">Sign In</button>
            </SignInButton>
            <SignUpButton mode="modal" forceRedirectUrl={CRM_ROUTE}>
              <button className="landing-primary">Create account</button>
            </SignUpButton>
          </div>
        </div>
      </SignedOut>
      <SignedIn>{children}</SignedIn>
    </>
  );
}
