import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Github, Mail, Menu, X } from 'lucide-react';
import { SignInButton, SignUpButton, UserButton, useAuth, useUser } from '@clerk/clerk-react';
import { cn } from '../../utils/cn';
import { APP_NAME, CRM_ROUTE } from '../../constants/design';
import { NAV_LINKS } from '../../constants/data';
import logo from '../../assets/digital-wave-logo.png';

interface NavbarProps {
  clerkMissing: boolean;
}

function AuthControls({ clerkMissing }: NavbarProps) {
  const { isSignedIn } = useAuth();

  if (clerkMissing) {
    return (
      <div className="flex items-center gap-2">
        <button className="landing-ghost" onClick={() => window.location.href = 'https://github.com'}><Github size={16} /> GitHub</button>
        <button className="landing-ghost" onClick={() => window.location.href = 'mailto:contact@digitalwave.com'}><Mail size={16} /> Email</button>
      </div>
    );
  }
  if (isSignedIn) {
    return <UserButton afterSignOutUrl="/" />;
  }

  return (
    <div className="flex items-center gap-3">
      <SignInButton mode="modal" forceRedirectUrl={CRM_ROUTE}>
        <button className="landing-ghost">Sign In</button>
      </SignInButton>
      <SignUpButton mode="modal" forceRedirectUrl={CRM_ROUTE}>
        <button className="landing-primary">Get Started</button>
      </SignUpButton>
    </div>
  );
}

export function Navbar({ clerkMissing }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={cn(
        'fixed left-0 right-0 top-0 z-50 transition-all duration-300',
        scrolled ? 'border-b border-white/10 bg-[#050816]/80 shadow-lg shadow-blue-500/5 backdrop-blur-xl' : 'bg-transparent',
      )}
    >
      <div className="mx-auto flex h-12 max-w-7xl items-center justify-between px-4 sm:px-6">
        <a href="/" className="flex items-center gap-2">
          <img src={logo} alt={APP_NAME} className="h-[22px] w-[22px] rounded object-cover brightness-0 invert" />
          <span className="text-sm font-bold text-white">{APP_NAME}</span>
        </a>
        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} className="rounded-md px-3 py-1.5 text-xs text-gray-300 transition-all duration-200 hover:bg-white/5 hover:text-white">
              {link.label}
            </a>
          ))}
        </nav>
        <div className="hidden md:flex"><AuthControls clerkMissing={clerkMissing} /></div>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-300 transition-all hover:bg-white/5 hover:text-white md:hidden" aria-label="Menu">
          {mobileOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t border-white/10 bg-[#050816]/95 backdrop-blur-xl md:hidden"
          >
            <div className="space-y-0.5 px-4 py-3">
              {NAV_LINKS.map((link) => (
                <a key={link.href} href={link.href} onClick={() => setMobileOpen(false)} className="block rounded-lg px-3 py-2 text-sm text-gray-300 transition-all hover:bg-white/5 hover:text-white">
                  {link.label}
                </a>
              ))}
              <div className="mt-3 flex flex-col gap-2 border-t border-white/10 pt-3">
                {clerkMissing ? (
                  <>
                    <a className="landing-ghost w-full" href={CRM_ROUTE} onClick={() => setMobileOpen(false)}>Sign In</a>
                    <a className="landing-primary w-full" href={CRM_ROUTE} onClick={() => setMobileOpen(false)}>Get Started</a>
                  </>
                ) : (
                  <>
                    <SignInButton mode="modal" forceRedirectUrl={CRM_ROUTE}>
                      <button className="landing-ghost w-full">Sign In</button>
                    </SignInButton>
                    <SignUpButton mode="modal" forceRedirectUrl={CRM_ROUTE}>
                      <button className="landing-primary">Get Started</button>
                    </SignUpButton>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

export function RedirectSignedInToCrm() {
  const { isSignedIn, isLoaded } = useUser();

  useEffect(() => {
    if (isLoaded && isSignedIn && window.location.pathname !== CRM_ROUTE) {
      window.location.assign(CRM_ROUTE);
    }
  }, [isLoaded, isSignedIn]);

  return null;
}
