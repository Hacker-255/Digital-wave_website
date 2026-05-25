import { useEffect, useRef, useState, type ReactNode } from 'react';
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton, useUser } from '@clerk/clerk-react';
import { AnimatePresence, motion, useScroll, useTransform } from 'framer-motion';
import {
  Activity,
  ArrowRight,
  BarChart3,
  Bell,
  Bot,
  Brain,
  Building2,
  Check,
  CheckCircle,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircuitBoard,
  ClipboardList,
  DollarSign,
  Download,
  FolderKanban,
  GitBranch,
  GitMerge,
  Github,
  Inbox,
  LayoutGrid,
  LayoutDashboard,
  LockKeyhole,
  Mail,
  Menu,
  MessageCircleQuestion,
  RotateCcw,
  Quote,
  Search,
  Settings,
  Send,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  Trash2,
  Upload,
  Users,
  Workflow,
  X,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import logo from '../assets/digital-wave-logo.png';
import { WorkflowPage } from '../pages/WorkflowPage';

type AppShellProps = {
  clerkMissing: boolean;
};

const APP_NAME = 'Digital Wave CRM';
const crmRoute = '/crm';

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Features', href: '#features' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Contact', href: '#contact' },
];

const FEATURES = [
  { icon: 'Users', title: 'Client Management', description: 'Manage clients with profiles, history, preferences, and communication logs in one place.' },
  { icon: 'LayoutDashboard', title: 'Project Management', description: 'Track projects from planning to delivery with real-time status and team collaboration.' },
  { icon: 'Workflow', title: 'Workflow Automation', description: 'Automate repetitive tasks, triggers, and notifications to streamline operations.' },
  { icon: 'GitMerge', title: 'Sales Pipeline', description: 'Track leads from inquiry to close with visual pipeline stages and forecasting.' },
  { icon: 'BarChart3', title: 'Advanced Analytics', description: 'Revenue insights, team performance, and business metrics at a glance.' },
  { icon: 'Bot', title: 'AI-Powered Insights', description: 'Smart recommendations, client summaries, and predictive analytics.' },
];

const PRICING_PLANS = [
  { name: 'Starter', price: '$29', period: '/month', description: 'For small teams just getting started.', features: ['Up to 5 team members', '500 clients', 'Basic analytics', 'Email support', '1 project workspace'], cta: 'Get Started', popular: false },
  { name: 'Professional', price: '$79', period: '/month', description: 'For growing businesses ready to scale.', features: ['Up to 20 team members', 'Unlimited clients', 'Advanced analytics', 'Priority support', 'API access', 'AI insights', 'Unlimited projects'], cta: 'Start Free Trial', popular: true },
  { name: 'Enterprise', price: '$199', period: '/month', description: 'For large organizations with custom needs.', features: ['Unlimited team members', 'Unlimited clients', 'Full analytics suite', '24/7 dedicated support', 'Custom integrations', 'Dedicated account manager', 'SSO & SAML'], cta: 'Contact Sales', popular: false },
];

const TESTIMONIALS = [
  { name: 'Sarah Johnson', role: 'CEO, TechFlow Solutions', avatar: 'SJ', content: 'This CRM transformed how we manage our clients. Our team productivity has doubled since switching.', rating: 5 },
  { name: 'Marcus Chen', role: 'CTO, CloudBase Inc', avatar: 'MC', content: 'The pipeline management and automation features are incredible. Our conversion rate is up 40%.', rating: 5 },
  { name: 'Emily Rodriguez', role: 'Operations Director, DevStack', avatar: 'ER', content: 'Beautiful UI and incredibly intuitive. My team adapted in days, not weeks.', rating: 5 },
  { name: 'David Park', role: 'CEO, Arcanum Systems', avatar: 'DP', content: 'We evaluated 6 CRMs before choosing Digital Wave. The AI-powered insights alone make it worth it.', rating: 5 },
  { name: 'Lisa Thompson', role: 'Founder, DataPulse LLC', avatar: 'LT', content: 'The workflow automation saved us 20 hours per week. Our team can finally focus on what matters.', rating: 4 },
  { name: 'James Wilson', role: 'CTO, SkyBridge Tech', avatar: 'JW', content: 'Enterprise-grade security with consumer-grade UX. That is incredibly rare and exactly what we needed.', rating: 5 },
];

const FAQ_ITEMS = [
  { question: 'What is Digital Wave CRM?', answer: 'A modern platform for managing clients, projects, teams, and business operations with powerful automation and analytics.' },
  { question: 'Can I migrate data from another system?', answer: 'Yes, we offer seamless migration support from most major CRM and project management platforms.' },
  { question: 'How secure is my data?', answer: 'All data is encrypted at rest and in transit with enterprise-grade security protocols.' },
  { question: 'Is there a free trial?', answer: 'Yes, 14-day free trial on our Professional plan with no credit card required.' },
];

const companies = ['TechFlow Inc', 'CloudBase Corp', 'DevStack Ltd', 'NexGen Digital', 'Arcanum Systems', 'DataPulse', 'SkyBridge Tech', 'Apex Software'];
const iconMap: Record<string, LucideIcon> = { Users, LayoutDashboard, GitMerge, BarChart3, Bot, Workflow };
const barHeights = [35, 55, 40, 70, 50, 85, 60, 45, 75, 55, 90, 65];

function cn(...classes: Array<string | boolean | undefined | null>) {
  return classes.filter(Boolean).join(' ');
}

function CtaButton({ children, variant = 'primary' }: { children: ReactNode; variant?: 'primary' | 'ghost' }) {
  return (
    <SignUpButton mode="modal" forceRedirectUrl={crmRoute}>
      <button className={variant === 'primary' ? 'landing-primary' : 'landing-ghost'}>{children}</button>
    </SignUpButton>
  );
}

function LoginButton({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <SignInButton mode="modal" forceRedirectUrl={crmRoute}>
      <button className={className ?? 'landing-ghost'}>{children}</button>
    </SignInButton>
  );
}

function AuthControls({ clerkMissing }: AppShellProps) {
  if (clerkMissing) {
    return (
      <div className="flex items-center gap-2">
        <button className="landing-ghost"><Github size={16} /> GitHub</button>
        <button className="landing-ghost"><Mail size={16} /> Email</button>
      </div>
    );
  }

  return (
    <>
      <SignedOut>
        <div className="flex items-center gap-3">
          <LoginButton className="landing-ghost">Sign In</LoginButton>
          <CtaButton>Get Started</CtaButton>
        </div>
      </SignedOut>
      <SignedIn>
        <UserButton afterSignOutUrl="/" />
      </SignedIn>
    </>
  );
}

function AuthRequired({ clerkMissing, children }: AppShellProps & { children: ReactNode }) {
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
            <LoginButton className="landing-ghost">Sign In</LoginButton>
            <CtaButton>Create account</CtaButton>
          </div>
        </div>
      </SignedOut>
      <SignedIn>{children}</SignedIn>
    </>
  );
}

function usePathRoute() {
  const [path, setPath] = useState(window.location.pathname || '/');

  useEffect(() => {
    const onRouteChange = () => setPath(window.location.pathname || '/');
    window.addEventListener('popstate', onRouteChange);
    return () => window.removeEventListener('popstate', onRouteChange);
  }, []);

  return path;
}

function RedirectSignedInToCrm() {
  const { isSignedIn, isLoaded } = useUser();

  useEffect(() => {
    if (isLoaded && isSignedIn && window.location.pathname !== crmRoute) {
      window.location.assign(crmRoute);
    }
  }, [isLoaded, isSignedIn]);

  return null;
}

export function AppShell({ clerkMissing }: AppShellProps) {
  const route = usePathRoute();
  const isCrmPage = route === crmRoute || route === '/workflows';

  return isCrmPage ? (
    <WorkingCrmApplicationPage clerkMissing={clerkMissing} />
  ) : (
    <>
      {!clerkMissing && <RedirectSignedInToCrm />}
      <LandingPage clerkMissing={clerkMissing} />
    </>
  );
}

function Navbar({ clerkMissing }: AppShellProps) {
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
      className={cn('fixed left-0 right-0 top-0 z-50 transition-all duration-300', scrolled ? 'border-b border-white/10 bg-[#050816]/80 shadow-lg shadow-blue-500/5 backdrop-blur-xl' : 'bg-transparent')}
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

        <div className="hidden md:flex">
          <AuthControls clerkMissing={clerkMissing} />
        </div>

        <button onClick={() => setMobileOpen(!mobileOpen)} className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-300 transition-all hover:bg-white/5 hover:text-white md:hidden" aria-label="Menu">
          {mobileOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden border-t border-white/10 bg-[#050816]/95 backdrop-blur-xl md:hidden">
            <div className="space-y-0.5 px-4 py-3">
              {NAV_LINKS.map((link) => (
                <a key={link.href} href={link.href} onClick={() => setMobileOpen(false)} className="block rounded-lg px-3 py-2 text-sm text-gray-300 transition-all hover:bg-white/5 hover:text-white">
                  {link.label}
                </a>
              ))}
              <div className="mt-3 flex flex-col gap-2 border-t border-white/10 pt-3">
                <LoginButton className="landing-ghost w-full">Sign In</LoginButton>
                <CtaButton>Get Started</CtaButton>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

function HeroSection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const floatingIcons = [
    { icon: TrendingUp, x: '15%', y: '20%', delay: 0, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { icon: Users, x: '85%', y: '15%', delay: 0.5, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { icon: BarChart3, x: '10%', y: '70%', delay: 1, color: 'text-violet-400', bg: 'bg-violet-500/10' },
    { icon: DollarSign, x: '90%', y: '75%', delay: 1.5, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  ];

  return (
    <section ref={ref} className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#050816]">
      <div className="absolute inset-0">
        <div className="animate-pulse-glow absolute -left-32 top-1/4 h-96 w-96 rounded-full bg-blue-500/20 blur-[120px]" />
        <div className="absolute right-0 top-1/3 h-80 w-80 rounded-full bg-blue-600/15 blur-[100px]" />
        <div className="absolute bottom-1/4 left-1/3 h-64 w-64 rounded-full bg-cyan-500/10 blur-[80px]" />
      </div>
      <div className="section-grid absolute inset-0 opacity-30" />

      {floatingIcons.map((item) => {
        const Icon = item.icon;
        return (
          <motion.div key={item.color} className={cn('absolute hidden h-12 w-12 items-center justify-center rounded-2xl border border-white/10 backdrop-blur-sm lg:flex', item.bg)} style={{ left: item.x, top: item.y }} animate={{ y: [0, -12, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: item.delay }}>
            <Icon size={18} className={item.color} />
          </motion.div>
        );
      })}

      <motion.div style={{ y, opacity }} className="relative z-10 mx-auto max-w-5xl px-4 pt-24 text-center sm:pt-32">
        <motion.div variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } }} initial="hidden" animate="visible">
          <motion.div variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } } }} className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs text-blue-300 backdrop-blur-sm">
            <span className="animate-pulse-glow flex h-1.5 w-1.5 rounded-full bg-blue-400" />
            Trusted by 2,000+ businesses worldwide
          </motion.div>
          <motion.h1 variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } } }} className="text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            <span className="text-white">Modern CRM &</span><br />
            <span className="bg-gradient-to-r from-blue-400 via-blue-300 to-cyan-300 bg-clip-text text-transparent">Software Solutions</span>
          </motion.h1>
          <motion.p variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } } }} className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-gray-400 sm:text-base">
            Manage clients, teams, workflows, and business operations in one powerful platform. Powered by AI. Built for scale.
          </motion.p>
          <motion.div variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } } }} className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <CtaButton>Start Free Trial <ArrowRight size={16} /></CtaButton>
            <LoginButton><Activity size={16} /> CRM Login</LoginButton>
          </motion.div>
          <motion.div variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } } }} className="mt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-gray-500">
            {['No credit card', '14-day free trial', 'Cancel anytime'].map((item) => <span key={item} className="flex items-center gap-1.5"><CheckCircle size={12} className="text-emerald-400" /> {item}</span>)}
          </motion.div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.6 }} className="mx-auto mt-16 max-w-4xl">
          <div className="glow-blue-lg relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] shadow-2xl shadow-blue-500/5 backdrop-blur-xl">
            <div className="flex items-center gap-1.5 border-b border-white/5 px-4 py-3">
              <div className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
              <div className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
              <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
              <span className="ml-2 text-[10px] font-medium text-gray-500">Dashboard Overview</span>
            </div>
            <div className="p-5">
              <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                {[
                  { label: 'Revenue', value: '$284.5K', change: '+12.5%', icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                  { label: 'Active Projects', value: '38', change: '+4 this month', icon: FolderKanban, color: 'text-blue-400', bg: 'bg-blue-500/10' },
                  { label: 'Team Members', value: '12', change: '+2 new', icon: Users, color: 'text-violet-400', bg: 'bg-violet-500/10' },
                ].map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <div key={stat.label} className="rounded-xl border border-white/5 bg-white/[0.03] p-3 transition-colors hover:bg-white/[0.06]">
                      <div className="mb-2 flex items-center justify-between">
                        <div className={cn('flex h-7 w-7 items-center justify-center rounded-lg', stat.bg)}><Icon size={14} className={stat.color} /></div>
                        <span className="text-[10px] font-medium text-emerald-400">{stat.change}</span>
                      </div>
                      <div className="text-lg font-bold text-white">{stat.value}</div>
                      <div className="text-[10px] text-gray-500">{stat.label}</div>
                    </div>
                  );
                })}
              </div>
              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-400">Monthly Revenue</span>
                  <span className="text-[10px] text-gray-500">Last 12 months</span>
                </div>
                <div className="flex h-28 items-end gap-1.5">
                  {barHeights.map((height, index) => (
                    <motion.div key={index} initial={{ height: 0 }} animate={{ height: `${height}%` }} transition={{ duration: 0.8, delay: 0.8 + index * 0.05 }} className="flex-1 rounded-sm bg-gradient-to-t from-blue-500 to-blue-400/80 opacity-80 transition-opacity hover:opacity-100" />
                  ))}
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[['2K+', 'Businesses'], ['99.9%', 'Uptime'], ['4.9', 'Rating'], ['50K+', 'Projects']].map(([value, label]) => (
                  <div key={label} className="rounded-lg border border-white/5 bg-white/[0.02] p-2 text-center">
                    <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-400 bg-clip-text text-sm font-bold text-transparent">{value}</div>
                    <div className="text-[10px] text-gray-500">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}

function TrustedBySection() {
  return (
    <section className="relative border-y border-white/5 bg-[#0B1023] py-12">
      <div className="mx-auto max-w-7xl px-4">
        <p className="mb-6 text-center text-[10px] font-medium uppercase tracking-[0.15em] text-gray-500">Trusted by innovative companies worldwide</p>
        <div className="grid grid-cols-2 items-center gap-4 sm:grid-cols-4 lg:grid-cols-8">
          {companies.map((name, index) => (
            <motion.div key={name} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.05, duration: 0.3 }} className="flex items-center justify-center">
              <div className="flex items-center gap-2.5 rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2 transition-all duration-300 hover:bg-white/[0.06]">
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 text-[10px] font-bold text-blue-300">{name.charAt(0)}</div>
                <span className="text-xs font-medium text-gray-400">{name}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  return (
    <section id="features" className="dark-section section-grid py-20 sm:py-24">
      <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 via-transparent to-transparent" />
      <div className="relative z-10 mx-auto max-w-7xl px-4">
        <SectionIntro eyebrow="Powerful Features" title="Everything You Need to Scale Your Business" body="Powerful tools to manage clients, projects, sales, and teams in one platform." />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => {
            const Icon = iconMap[feature.icon];
            return (
              <motion.div key={feature.title} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <div className="group relative h-full rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5 backdrop-blur-xl transition-all duration-500 hover:border-blue-500/20 hover:bg-white/[0.06]">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 text-blue-300 transition-transform duration-300 group-hover:scale-110">{Icon && <Icon size={17} />}</div>
                  </div>
                  <h3 className="mb-1.5 text-sm font-semibold text-white">{feature.title}</h3>
                  <p className="text-xs leading-relaxed text-gray-400">{feature.description}</p>
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 origin-left scale-x-0 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-transform duration-500 group-hover:scale-x-100" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function SectionIntro({ eyebrow, title, body }: { eyebrow: string; title: string; body: string }) {
  const [head, tail] = title.includes(' to ') ? title.split(' to ') : [title, ''];
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="mb-12 text-center">
      <span className="mb-4 inline-flex items-center rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-[10px] text-blue-300">{eyebrow}</span>
      <h2 className="text-3xl font-bold text-white sm:text-4xl">
        {head}{tail && ' to '}
        {tail && <span className="bg-gradient-to-r from-blue-400 via-blue-300 to-cyan-300 bg-clip-text text-transparent">{tail}</span>}
      </h2>
      <p className="mx-auto mt-3 max-w-2xl text-sm text-gray-400">{body}</p>
    </motion.div>
  );
}

function CrmPreviewSection() {
  const aiFeatures = [
    { icon: Brain, title: 'AI-Powered Insights', description: 'Smart recommendations and predictive analytics that help you make better decisions faster.' },
    { icon: Sparkles, title: 'Automated Workflows', description: 'Set triggers and actions to automate repetitive tasks across your entire operation.' },
    { icon: Zap, title: 'Smart Lead Scoring', description: 'AI automatically scores leads based on engagement, fit, and purchase intent signals.' },
  ];

  return (
    <section className="dark-section-alt section-grid overflow-hidden py-20 sm:py-24">
      <div className="absolute left-1/4 right-1/4 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionIntro eyebrow="AI-Powered" title="Intelligent Automation for Modern Teams" body="From lead scoring to workflow automation, our AI engine handles the heavy lifting so your team can focus on what matters." />
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-5 md:grid-cols-3">
          {aiFeatures.map((feature) => {
            const Icon = feature.icon;
            return (
              <motion.div key={feature.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <div className="group h-full rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6 backdrop-blur-xl transition-all duration-500 hover:border-blue-500/20 hover:bg-white/[0.06]">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/20"><Icon size={20} className="text-white" /></div>
                  <h3 className="mb-2 text-base font-semibold text-white">{feature.title}</h3>
                  <p className="text-sm leading-relaxed text-gray-400">{feature.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
        <div className="mx-auto mt-14 grid max-w-3xl grid-cols-2 gap-4 md:grid-cols-4">
          {[['10K+', 'Workflows Automated'], ['40%', 'Avg. Productivity Gain'], ['99.9%', 'AI Accuracy Rate'], ['5min', 'Avg. Setup Time']].map(([value, label]) => (
            <div key={label} className="rounded-xl border border-white/5 bg-white/[0.03] p-4 text-center">
              <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-400 bg-clip-text text-xl font-bold text-transparent">{value}</div>
              <div className="mt-1 text-xs text-gray-500">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function WhyChooseUsSection() {
  const workflowFeatures = [
    { icon: Workflow, title: 'Visual Pipeline Builder', description: 'Drag-and-drop interface to design custom workflows that match your business processes perfectly.', color: 'from-blue-500 to-cyan-500' },
    { icon: GitBranch, title: 'Conditional Triggers', description: 'Set up if-this-then-that rules to automatically route tasks, send notifications, and update records.', color: 'from-violet-500 to-blue-500' },
    { icon: LayoutDashboard, title: 'Project Timelines', description: 'Timeline views to track progress, dependencies, and milestones across projects.', color: 'from-emerald-500 to-teal-500' },
    { icon: Bell, title: 'Smart Notifications', description: 'Real-time alerts for deadlines, updates, and important changes so nothing falls through the cracks.', color: 'from-amber-500 to-orange-500' },
  ];

  return (
    <section className="dark-section overflow-hidden py-20 sm:py-24">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/5 to-transparent" />
      <div className="relative z-10 mx-auto max-w-7xl px-4">
        <SectionIntro eyebrow="Workflow Management" title="Streamline Your Entire Workflow" body="From lead capture to project delivery, automate every step of your business operations." />
        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-5 sm:grid-cols-2">
          {workflowFeatures.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="group h-full rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6 backdrop-blur-xl transition-all duration-500 hover:border-blue-500/20 hover:bg-white/[0.06]">
                <div className="flex items-start gap-4">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${item.color}`}><Icon size={18} className="text-white" /></div>
                  <div>
                    <h3 className="mb-1.5 text-sm font-semibold text-white">{item.title}</h3>
                    <p className="text-xs leading-relaxed text-gray-400">{item.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);
  const testimonial = TESTIMONIALS[current];

  useEffect(() => {
    const timer = setInterval(() => {
      setDirection(1);
      setCurrent((previous) => (previous + 1) % TESTIMONIALS.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="dark-section-alt overflow-hidden py-20 sm:py-24">
      <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 via-transparent to-blue-500/5" />
      <div className="relative z-10 mx-auto max-w-4xl px-4">
        <SectionIntro eyebrow="Testimonials" title="What Our Clients Say" body="Trusted by businesses of all sizes worldwide." />
        <div className="relative">
          <div className="flex min-h-[240px] items-center justify-center">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div key={current} custom={direction} initial={{ x: direction > 0 ? 300 : -300, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: direction > 0 ? -300 : 300, opacity: 0 }} transition={{ duration: 0.35, ease: 'easeInOut' }} className="w-full max-w-lg">
                <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-xl shadow-black/10">
                  <div className="mb-4 flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, index) => <Star key={index} size={14} className={cn('fill-current', index < testimonial.rating ? 'text-amber-400' : 'text-gray-200')} />)}
                  </div>
                  <Quote size={20} className="mb-3 text-blue-200" />
                  <p className="mb-5 text-sm leading-relaxed text-gray-700">"{testimonial.content}"</p>
                  <div className="flex items-center gap-3 border-t border-gray-100 pt-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 text-xs font-bold text-white shadow-md">{testimonial.avatar}</div>
                    <div className="text-left">
                      <div className="text-sm font-semibold text-gray-900">{testimonial.name}</div>
                      <div className="text-xs text-gray-500">{testimonial.role}</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="mt-6 flex items-center justify-center gap-4">
            <button onClick={() => { setDirection(-1); setCurrent((previous) => (previous - 1 + TESTIMONIALS.length) % TESTIMONIALS.length); }} className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-gray-400 transition-all hover:bg-white/10 hover:text-white"><ChevronLeft size={14} /></button>
            <div className="flex items-center gap-2">
              {TESTIMONIALS.map((_, index) => <button key={index} onClick={() => { setDirection(index > current ? 1 : -1); setCurrent(index); }} className={cn('h-1.5 rounded-full transition-all duration-300', index === current ? 'w-6 bg-blue-400' : 'w-1.5 bg-white/20 hover:bg-white/40')} aria-label={`Show testimonial ${index + 1}`} />)}
            </div>
            <button onClick={() => { setDirection(1); setCurrent((previous) => (previous + 1) % TESTIMONIALS.length); }} className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-gray-400 transition-all hover:bg-white/10 hover:text-white"><ChevronRight size={14} /></button>
          </div>
        </div>
      </div>
    </section>
  );
}

function PricingSection() {
  return (
    <section id="pricing" className="dark-section py-20 sm:py-24">
      <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 via-transparent to-transparent" />
      <div className="relative z-10 mx-auto max-w-7xl px-4">
        <SectionIntro eyebrow="Pricing" title="Simple, Transparent Pricing" body="No hidden fees. Choose the perfect plan for your business." />
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-5 md:grid-cols-3">
          {PRICING_PLANS.map((plan) => (
            <div key={plan.name} className={cn('relative', plan.popular && 'md:-mt-2 md:mb-[-8px]')}>
              {plan.popular && <div className="absolute -top-3 left-1/2 z-10 -translate-x-1/2"><span className="inline-flex rounded-full bg-blue-500 px-3 py-0.5 text-xs font-semibold text-white shadow-lg shadow-blue-500/25">Most Popular</span></div>}
              <div className={cn('flex h-full flex-col rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6 backdrop-blur-xl transition-all duration-500 hover:border-blue-500/20', plan.popular && 'border-blue-500/30 shadow-xl shadow-blue-500/10 ring-1 ring-blue-500/20')}>
                <div className="mb-5">
                  <h3 className="mb-0.5 text-lg font-bold text-white">{plan.name}</h3>
                  <p className="text-xs text-gray-400">{plan.description}</p>
                </div>
                <div className="mb-5"><span className="text-3xl font-bold text-white">{plan.price}</span><span className="ml-1 text-xs text-gray-500">{plan.period}</span></div>
                <ul className="mb-6 flex-1 space-y-2.5">
                  {plan.features.map((feature) => <li key={feature} className="flex items-start gap-2.5 text-xs text-gray-300"><Check size={14} className="mt-0.5 shrink-0 text-blue-400" />{feature}</li>)}
                </ul>
                <CtaButton variant={plan.popular ? 'primary' : 'ghost'}>{plan.cta} <ArrowRight size={14} /></CtaButton>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FaqSection() {
  const [open, setOpen] = useState(0);
  return (
    <section id="contact" className="dark-section-alt py-20 sm:py-24">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/5 to-transparent" />
      <div className="relative z-10 mx-auto max-w-2xl px-4">
        <SectionIntro eyebrow="FAQ" title="Frequently Asked Questions" body="Everything you need to know about Digital Wave CRM." />
        <div className="space-y-2">
          {FAQ_ITEMS.map((item, index) => (
            <div key={item.question} className={cn('overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.03] transition-all duration-200', open === index && 'border-blue-500/20 shadow-lg shadow-blue-500/5')}>
              <button onClick={() => setOpen(open === index ? -1 : index)} className="group flex w-full items-center justify-between px-5 py-3.5 text-left text-sm font-medium text-gray-200 transition-all duration-200 hover:bg-white/[0.02]">
                <span>{item.question}</span>
                <ChevronDown size={14} className={cn('ml-4 shrink-0 text-gray-500 transition-transform duration-200', open === index && 'rotate-180')} />
              </button>
              <AnimatePresence>
                {open === index && <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><div className="px-5 pb-4 text-sm leading-relaxed text-gray-400">{item.answer}</div></motion.div>}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CtaSection() {
  return (
    <section className="dark-section relative overflow-hidden py-20 sm:py-24">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-blue-500/10 to-cyan-500/20" />
      <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/10 blur-[150px]" />
      <div className="relative z-10 mx-auto max-w-3xl px-4 text-center">
        <div className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-[10px] text-blue-300"><Sparkles size={12} /> Get Started Today</div>
        <h2 className="text-3xl font-bold leading-tight text-white sm:text-4xl md:text-5xl">Ready to Transform Your <span className="bg-gradient-to-r from-blue-400 via-blue-300 to-cyan-300 bg-clip-text text-transparent">Business Operations</span>?</h2>
        <p className="mx-auto mt-4 max-w-xl text-sm text-gray-400 sm:text-base">Join 2,000+ businesses using Digital Wave CRM to manage clients, projects, and teams with confidence.</p>
        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <CtaButton>Start Free Trial <ArrowRight size={16} /></CtaButton>
          <LoginButton>Book a Demo</LoginButton>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="relative border-t border-white/5 bg-[#050816]">
      <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 via-transparent to-transparent" />
      <div className="relative z-10 mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-1 gap-8 py-14 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <a href="/" className="mb-4 flex items-center gap-2">
              <span className="bg-gradient-to-r from-blue-400 via-blue-300 to-cyan-300 bg-clip-text text-lg font-bold text-transparent">{APP_NAME}</span>
            </a>
            <p className="mb-5 max-w-md text-sm leading-relaxed text-gray-400">The modern CRM platform for growing businesses. Manage clients, projects, teams, and operations with confidence.</p>
          </div>
          <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-300">Quick Links</h4>
            <ul className="space-y-2.5">{NAV_LINKS.map((link) => <li key={link.href}><a href={link.href} className="text-sm text-gray-400 transition-colors hover:text-blue-300">{link.label}</a></li>)}</ul>
          </div>
          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-300">Stay Updated</h4>
            <div className="flex gap-2">
              <input placeholder="Enter your email" className="block h-8 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-gray-300 placeholder:text-gray-500 transition-all duration-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
              <button className="inline-flex h-8 shrink-0 items-center justify-center rounded-xl bg-blue-600 px-2.5 py-1 text-xs font-medium text-white transition-all duration-200 hover:bg-blue-500"><Send size={12} /></button>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center justify-between gap-3 border-t border-white/5 py-5 sm:flex-row">
          <p className="text-xs text-gray-500">&copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.</p>
          <div className="flex items-center gap-5"><a href="#" className="text-xs text-gray-500 hover:text-blue-300">Privacy Policy</a><a href="#" className="text-xs text-gray-500 hover:text-blue-300">Terms of Service</a></div>
        </div>
      </div>
    </footer>
  );
}

function LandingPage({ clerkMissing }: AppShellProps) {
  return (
    <main className="min-h-screen bg-[#050816]">
      <Navbar clerkMissing={clerkMissing} />
      <HeroSection />
      <TrustedBySection />
      <FeaturesSection />
      <CrmPreviewSection />
      <WhyChooseUsSection />
      <TestimonialsSection />
      <PricingSection />
      <FaqSection />
      <CtaSection />
      <Footer />
    </main>
  );
}

function CrmApplicationPage({ clerkMissing }: AppShellProps) {
  const [activeModule, setActiveModule] = useState('Companies');
  const [commandOpen, setCommandOpen] = useState(false);
  const [lastAction, setLastAction] = useState('Ready');
  const sidebarItems: Array<[LucideIcon, string, string]> = [
    [Building2, 'Companies', 'text-blue-300 bg-blue-500/20'],
    [Users, 'People', 'text-indigo-300 bg-indigo-500/20'],
    [Target, 'Opportunities', 'text-rose-300 bg-rose-500/20'],
    [CheckCircle2, 'Tasks', 'text-teal-300 bg-teal-500/20'],
    [ClipboardList, 'Notes', 'text-cyan-300 bg-cyan-500/20'],
    [LayoutGrid, 'Dashboards', 'text-slate-300 bg-slate-500/20'],
    [CircuitBoard, 'Workflows', 'text-orange-300 bg-orange-500/20'],
  ];

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isTyping = target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA';
      if (isTyping) return;

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setCommandOpen(true);
      }

      if (event.key === '/') {
        event.preventDefault();
        setCommandOpen(true);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <main className="min-h-screen bg-[#050816] text-slate-100">
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#050816]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-12 max-w-7xl items-center justify-between px-4 sm:px-6">
          <a href="/" className="flex items-center gap-2">
            <img src={logo} alt="Digital Wave" className="h-[22px] w-[22px] rounded object-cover brightness-0 invert" />
            <span className="text-sm font-bold text-white">{APP_NAME}</span>
          </a>
          <div className="hidden items-center gap-1 md:flex">
            <a href="/" className="rounded-md px-3 py-1.5 text-xs text-gray-300 hover:bg-white/5 hover:text-white">Landing</a>
            <a href="/crm" className="rounded-md bg-white/5 px-3 py-1.5 text-xs text-white">CRM App</a>
          </div>
          <AuthControls clerkMissing={clerkMissing} />
        </div>
      </nav>

      <AuthRequired clerkMissing={clerkMissing}>
        <section id="crm-app" className="mx-auto max-w-7xl px-4 py-8 md:px-6">
          <div className="crm-app-shell">
            <aside className="crm-sidebar">
              <div className="mb-6 flex items-center gap-3">
                <img src={logo} alt="Digital Wave" className="h-9 w-9 rounded object-cover brightness-0 invert" />
              <div>
                <b>Digital Wave CRM</b>
                <span>Workspace</span>
              </div>
            </div>
            <div className="mb-5">
              <p className="mb-2 px-3 text-xs font-semibold text-slate-500">Workspace</p>
              {sidebarItems.map(([Icon, label, tone]) => (
                <button
                  className={activeModule === label ? 'crm-nav-item active' : 'crm-nav-item'}
                  key={label}
                  onClick={() => setActiveModule(label)}
                  type="button"
                >
                  <span className={cn('flex h-7 w-7 items-center justify-center rounded-lg', tone)}>
                    <Icon size={17} />
                  </span>
                  {label}
                  {label === 'Workflows' && <ChevronRight size={15} className="ml-auto text-slate-500" />}
                </button>
              ))}
            </div>
            <div>
              <p className="mb-2 px-3 text-xs font-semibold text-slate-500">Other</p>
              {[
                [Settings, 'Settings'],
                [MessageCircleQuestion, 'Documentation'],
              ].map(([Icon, label]) => (
                <button
                  className={activeModule === label ? 'crm-nav-item active' : 'crm-nav-item'}
                  key={label as string}
                  onClick={() => setActiveModule(label as string)}
                  type="button"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 text-slate-300">
                    <Icon size={17} />
                  </span>
                  {label as string}
                </button>
              ))}
            </div>
            </aside>
            <div className="crm-workspace">
              <CrmModule
                module={activeModule}
                onOpenCommand={() => setCommandOpen(true)}
                lastAction={lastAction}
              />
            </div>
          </div>
          <CommandPalette
            activeModule={activeModule}
            open={commandOpen}
            onClose={() => setCommandOpen(false)}
            onAction={(action) => {
              setLastAction(action);
              setCommandOpen(false);
            }}
            onNavigate={setActiveModule}
          />
        </section>
      </AuthRequired>
    </main>
  );
}

function CrmModule({ module, onOpenCommand, lastAction }: { module: string; onOpenCommand: () => void; lastAction: string }) {
  const headerLabel = module === 'Opportunities' ? 'Opportunities pipeline' : module;
  const helperText = {
    People: 'Client relationships, owners, lifecycle status, and next actions.',
    Companies: 'Account records, value, health, and open opportunities.',
    Opportunities: 'Track revenue from qualified lead to signed customer.',
    Tasks: 'Daily execution board for sales, delivery, and follow-up.',
    Notes: 'Meeting notes, call summaries, and account context.',
    Dashboards: 'Saved dashboard views and operational metrics.',
    Inbox: 'Customer messages, notifications, and assignment queue.',
    Reports: 'Revenue, productivity, workflow, and conversion analytics.',
    Workflows: 'Create, run, version, and audit CRM automations.',
    Settings: 'Workspace, billing, members, and experience settings.',
    Documentation: 'Guides, API docs, and product references.',
  }[module];

  if (module === 'Workflows') {
    return (
      <div>
        <div className="crm-workspace-header">
          <div>
            <span className="eyebrow">Automation studio</span>
            <h2>Workflows</h2>
            <p className="mt-2 text-sm text-slate-400">{helperText}</p>
          </div>
          <button className="crm-command-button" onClick={onOpenCommand} type="button"><Search size={15} /> Search</button>
        </div>
        <WorkflowPage />
      </div>
    );
  }

  return (
    <div>
      <div className="crm-workspace-header">
        <div>
          <span className="eyebrow">CRM app</span>
          <h2>{headerLabel}</h2>
          <p className="mt-2 text-sm text-slate-400">{helperText}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="crm-command-button" onClick={onOpenCommand} type="button"><Search size={15} /> Search</button>
          <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 px-3 py-2 text-xs text-blue-200">{lastAction}</div>
        </div>
      </div>
      {module === 'Opportunities' && <DealsPanel />}
      {module === 'People' && <SimpleCrmPanel type="people" />}
      {module === 'Companies' && <SimpleCrmPanel type="companies" />}
      {module === 'Tasks' && <SimpleCrmPanel type="tasks" />}
      {module === 'Notes' && <SimpleCrmPanel type="notes" />}
      {module === 'Dashboards' && <ReportsPanel />}
      {module === 'Settings' && <SettingsPanel />}
      {module === 'Documentation' && <DocumentationPanel />}
    </div>
  );
}

function DealsPanel() {
  return (
    <>
      <div className="pipeline-grid">
        {[
          ['Qualified', 'Acme Cloud', '$84,000', 'Demo booked'],
          ['Proposal', 'Northstar AI', '$62,000', 'Security review'],
          ['Negotiation', 'Blue Ridge Labs', '$41,000', 'Contract sent'],
        ].map(([stage, account, value, note]) => (
          <div className="deal-card" key={account}>
            <span>{stage}</span>
            <h3>{account}</h3>
            <b>{value}</b>
            <p>{note}</p>
          </div>
        ))}
      </div>
      <div className="crm-data-grid">
        <div><span>Today</span><strong>18 tasks</strong></div>
        <div><span>Pipeline</span><strong>$187k</strong></div>
        <div><span>Automation runs</span><strong>128</strong></div>
      </div>
    </>
  );
}

function SimpleCrmPanel({ type }: { type: 'people' | 'companies' | 'tasks' | 'notes' }) {
  const rows = {
    people: [
      ['Sarah Johnson', 'CEO at Acme Cloud', 'Hot lead'],
      ['Marcus Chen', 'CTO at Northstar AI', 'Security review'],
      ['Emily Rodriguez', 'Ops Director at Blue Ridge Labs', 'Contract sent'],
    ],
    companies: [
      ['Acme Cloud', '$84,000 pipeline', 'Healthy'],
      ['Northstar AI', '$62,000 pipeline', 'Reviewing'],
      ['Blue Ridge Labs', '$41,000 pipeline', 'Negotiation'],
    ],
    tasks: [
      ['Send proposal follow-up', 'Due today', 'High'],
      ['Prepare security answers', 'Due tomorrow', 'Medium'],
      ['Schedule onboarding call', 'Friday', 'Normal'],
    ],
    notes: [
      ['Acme Cloud discovery notes', 'Budget confirmed and timeline is Q3', 'Pinned'],
      ['Northstar security review', 'SOC2 evidence requested', 'Shared'],
      ['Blue Ridge negotiation', 'Legal asked for revised payment terms', 'Draft'],
    ],
  }[type];

  return (
    <div className="grid gap-3">
      {rows.map(([title, detail, status]) => (
        <div className="crm-list-row" key={title}>
          <div>
            <b>{title}</b>
            <span>{detail}</span>
          </div>
          <em>{status}</em>
        </div>
      ))}
    </div>
  );
}

function ReportsPanel() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {[
        ['Revenue growth', '+24%', 'Compared with last month'],
        ['Lead conversion', '38%', 'Qualified to proposal'],
        ['Workflow success', '99.2%', 'Last 128 automation runs'],
      ].map(([title, value, detail]) => (
        <div className="deal-card" key={title}>
          <span>{title}</span>
          <b>{value}</b>
          <p>{detail}</p>
        </div>
      ))}
    </div>
  );
}

function SettingsPanel() {
  return <SimpleCrmPanel type="tasks" />;
}

function DocumentationPanel() {
  return (
    <div className="grid gap-3">
      {[
        ['Getting started', 'Set up records, pipelines, and team permissions', 'Guide'],
        ['Workflow automation', 'Triggers, actions, conditions, and run history', 'Docs'],
        ['API reference', 'Connect external systems and custom apps', 'API'],
      ].map(([title, detail, status]) => (
        <div className="crm-list-row" key={title}>
          <div><b>{title}</b><span>{detail}</span></div>
          <em>{status}</em>
        </div>
      ))}
    </div>
  );
}

function CommandPalette({
  activeModule,
  open,
  onClose,
  onAction,
  onNavigate,
}: {
  activeModule: string;
  open: boolean;
  onClose: () => void;
  onAction: (action: string) => void;
  onNavigate: (module: string) => void;
}) {
  const [query, setQuery] = useState('');
  const moduleName = activeModule === 'Opportunities' ? 'Opportunities' : activeModule;
  const actions: Array<{ icon: LucideIcon; label: string; shortcut?: string; run: () => void }> = [
    { icon: Upload, label: `Import ${moduleName}`, run: () => onAction(`Import ${moduleName} started`) },
    { icon: Download, label: 'Export View', run: () => onAction('Export prepared') },
    { icon: Trash2, label: `See deleted ${moduleName}`, run: () => onAction(`Deleted ${moduleName} opened`) },
    { icon: LayoutGrid, label: 'Create View', run: () => onAction('New view created') },
    { icon: Search, label: 'Search', shortcut: '/', run: () => onAction('Search opened') },
    { icon: Sparkles, label: 'Ask AI', shortcut: '@', run: () => onAction('Ask AI ready') },
    { icon: RotateCcw, label: 'View Previous AI Chats', run: () => onAction('AI chat history opened') },
    { icon: Mail, label: 'Compose Email', run: () => onAction('Email composer opened') },
    { icon: Settings, label: 'Go to Settings', shortcut: 'G then S', run: () => onNavigate('Settings') },
    { icon: Settings, label: 'Go to Experience Settings', run: () => onAction('Experience settings opened') },
    { icon: Github, label: 'Go to Accounts Settings', run: () => onAction('Accounts settings opened') },
    { icon: Inbox, label: 'Go to Emails Settings', run: () => onAction('Email settings opened') },
  ];
  const filtered = actions.filter((action) => action.label.toLowerCase().includes(query.toLowerCase()));

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        if (open) onClose();
      }
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose, open]);

  if (!open) return null;

  return (
    <div className="command-overlay" role="dialog" aria-label="Command menu">
      <div className="command-panel">
        <div className="command-search">
          <Search size={18} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} autoFocus placeholder="Search actions, records, settings..." />
          <button onClick={onClose} type="button"><X size={16} /></button>
        </div>
        <div className="command-section-label">Other</div>
        <div className="command-list">
          {filtered.map((action) => {
            const Icon = action.icon;
            return (
              <button className="command-item" key={action.label} onClick={action.run} type="button">
                <span><Icon size={18} /></span>
                <b>{action.label}</b>
                {action.shortcut && <em>{action.shortcut}</em>}
              </button>
            );
          })}
          {filtered.length === 0 && <div className="command-empty">No actions found</div>}
        </div>
      </div>
    </div>
  );
}

type CrmRecord = {
  title: string;
  detail: string;
  status: string;
  module: string;
};

type CrmAction =
  | 'import'
  | 'export'
  | 'deleted'
  | 'create-view'
  | 'search'
  | 'ask-ai'
  | 'ai-history'
  | 'compose-email'
  | 'settings'
  | 'experience-settings'
  | 'accounts-settings'
  | 'emails-settings';

const baseCrmRecords: Record<string, CrmRecord[]> = {
  Companies: [
    { title: 'Acme Cloud', detail: '$84,000 pipeline', status: 'Healthy', module: 'Companies' },
    { title: 'Northstar AI', detail: '$62,000 pipeline', status: 'Reviewing', module: 'Companies' },
    { title: 'Blue Ridge Labs', detail: '$41,000 pipeline', status: 'Negotiation', module: 'Companies' },
  ],
  People: [
    { title: 'Sarah Johnson', detail: 'CEO at Acme Cloud', status: 'Hot lead', module: 'People' },
    { title: 'Marcus Chen', detail: 'CTO at Northstar AI', status: 'Security review', module: 'People' },
    { title: 'Emily Rodriguez', detail: 'Ops Director at Blue Ridge Labs', status: 'Contract sent', module: 'People' },
  ],
  Opportunities: [
    { title: 'Acme Cloud expansion', detail: '$84,000 - Demo booked', status: 'Qualified', module: 'Opportunities' },
    { title: 'Northstar AI platform', detail: '$62,000 - Security review', status: 'Proposal', module: 'Opportunities' },
    { title: 'Blue Ridge Labs rollout', detail: '$41,000 - Contract sent', status: 'Negotiation', module: 'Opportunities' },
  ],
  Tasks: [
    { title: 'Send proposal follow-up', detail: 'Due today', status: 'High', module: 'Tasks' },
    { title: 'Prepare security answers', detail: 'Due tomorrow', status: 'Medium', module: 'Tasks' },
    { title: 'Schedule onboarding call', detail: 'Friday', status: 'Normal', module: 'Tasks' },
  ],
  Notes: [
    { title: 'Acme Cloud discovery notes', detail: 'Budget confirmed and timeline is Q3', status: 'Pinned', module: 'Notes' },
    { title: 'Northstar security review', detail: 'SOC2 evidence requested', status: 'Shared', module: 'Notes' },
    { title: 'Blue Ridge negotiation', detail: 'Legal asked for revised payment terms', status: 'Draft', module: 'Notes' },
  ],
};

const deletedCrmRecords: CrmRecord[] = [
  { title: 'Legacy Systems Ltd', detail: 'Deleted from Companies yesterday', status: 'Deleted', module: 'Companies' },
  { title: 'Old lead import batch', detail: 'Deleted from People last week', status: 'Deleted', module: 'People' },
  { title: 'Expired renewal opportunity', detail: 'Deleted from Opportunities', status: 'Deleted', module: 'Opportunities' },
];

function WorkingCrmApplicationPage({ clerkMissing }: AppShellProps) {
  const [activeModule, setActiveModule] = useState('Companies');
  const [commandOpen, setCommandOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');
  const [records, setRecords] = useState(baseCrmRecords);
  const [viewMode, setViewMode] = useState<'active' | 'deleted'>('active');
  const [savedViews, setSavedViews] = useState<string[]>(['Default view']);
  const [lastAction, setLastAction] = useState('Ready');
  const [emailOpen, setEmailOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('Summarize my highest priority CRM actions.');
  const [aiAnswer, setAiAnswer] = useState('Ask AI can summarize leads, companies, opportunities, and workflow priorities.');

  const sidebarItems: Array<[LucideIcon, string, string]> = [
    [Building2, 'Companies', 'text-blue-300 bg-blue-500/20'],
    [Users, 'People', 'text-indigo-300 bg-indigo-500/20'],
    [Target, 'Opportunities', 'text-rose-300 bg-rose-500/20'],
    [CheckCircle2, 'Tasks', 'text-teal-300 bg-teal-500/20'],
    [ClipboardList, 'Notes', 'text-cyan-300 bg-cyan-500/20'],
    [LayoutGrid, 'Dashboards', 'text-slate-300 bg-slate-500/20'],
    [CircuitBoard, 'Workflows', 'text-orange-300 bg-orange-500/20'],
  ];

  const filteredRecords = filterCrmRecords(records, activeModule, globalSearch, viewMode);
  const allMatches = filterCrmRecords(records, 'All', globalSearch, 'active');

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isTyping = target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA';
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setCommandOpen(true);
      }
      if (!isTyping && event.key === '/') {
        event.preventDefault();
        setCommandOpen(true);
      }
      if (!isTyping && event.key === '@') {
        event.preventDefault();
        setAiOpen(true);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  async function askAi() {
    setLastAction('Asking AI...');
    setAiOpen(true);
    const context = Object.values(records).flat().map((record) => `${record.module}: ${record.title} - ${record.detail} (${record.status})`).join('\n');

    try {
      const response = await fetch('/api/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiPrompt, context }),
      });
      if (!response.ok) throw new Error('AI request failed');
      const data = await response.json() as { answer?: string };
      setAiAnswer(data.answer || 'AI returned no answer.');
      setLastAction('AI answer ready');
    } catch {
      setAiAnswer('Priority summary: follow up with Acme Cloud today, answer Northstar AI security questions, and keep Blue Ridge Labs contract moving. Suggested automation: create a task when an opportunity reaches proposal.');
      setLastAction('AI fallback answer ready');
    }
  }

  function runAction(action: CrmAction) {
    const moduleRecords = records[activeModule] ?? [];

    if (action === 'import') {
      const imported: CrmRecord = {
        title: `Imported ${activeModule.slice(0, -1) || 'record'} ${moduleRecords.length + 1}`,
        detail: `Added to ${activeModule} from CSV import`,
        status: 'Imported',
        module: activeModule,
      };
      setRecords((current) => ({ ...current, [activeModule]: [imported, ...(current[activeModule] ?? [])] }));
      setLastAction(`Imported 1 ${activeModule} record`);
      return;
    }

    if (action === 'export') {
      const blob = new Blob([JSON.stringify(moduleRecords, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `${activeModule.toLowerCase()}-view.json`;
      anchor.click();
      URL.revokeObjectURL(url);
      setLastAction(`Exported ${activeModule} view`);
      return;
    }

    if (action === 'deleted') {
      setViewMode('deleted');
      setLastAction(`Showing deleted ${activeModule}`);
      return;
    }

    if (action === 'create-view') {
      const viewName = `${activeModule} view ${savedViews.length + 1}`;
      setSavedViews((current) => [...current, viewName]);
      setLastAction(`Created ${viewName}`);
      return;
    }

    if (action === 'search') {
      setLastAction('Search ready');
      return;
    }

    if (action === 'ask-ai') {
      void askAi();
      return;
    }

    if (action === 'ai-history') {
      setAiOpen(true);
      setAiAnswer('Previous AI chats: Lead prioritization, workflow recommendations, proposal follow-up summary.');
      setLastAction('AI history opened');
      return;
    }

    if (action === 'compose-email') {
      setEmailOpen(true);
      setLastAction('Email composer opened');
      return;
    }

    if (action === 'settings') {
      setActiveModule('Settings');
      setLastAction('Settings opened');
      return;
    }

    setActiveModule('Settings');
    setLastAction(action.replace(/-/g, ' ') + ' opened');
  }

  return (
    <main className="min-h-screen bg-[#050816] text-slate-100">
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#050816]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-12 max-w-7xl items-center justify-between px-4 sm:px-6">
          <a href="/" className="flex items-center gap-2">
            <img src={logo} alt="Digital Wave" className="h-[22px] w-[22px] rounded object-cover brightness-0 invert" />
            <span className="text-sm font-bold text-white">{APP_NAME}</span>
          </a>
          <div className="hidden items-center gap-1 md:flex">
            <a href="/" className="rounded-md px-3 py-1.5 text-xs text-gray-300 hover:bg-white/5 hover:text-white">Landing</a>
            <a href="/crm" className="rounded-md bg-white/5 px-3 py-1.5 text-xs text-white">CRM App</a>
          </div>
          <AuthControls clerkMissing={clerkMissing} />
        </div>
      </nav>

      <AuthRequired clerkMissing={clerkMissing}>
        <section id="crm-app" className="mx-auto max-w-7xl px-4 py-8 md:px-6">
          <div className="crm-app-shell">
            <aside className="crm-sidebar">
              <div className="mb-6 flex items-center gap-3">
                <img src={logo} alt="Digital Wave" className="h-9 w-9 rounded object-cover brightness-0 invert" />
                <div><b>Digital Wave CRM</b><span>Workspace</span></div>
              </div>
              <div className="mb-5">
                <p className="mb-2 px-3 text-xs font-semibold text-slate-500">Workspace</p>
                {sidebarItems.map(([Icon, label, tone]) => (
                  <button className={activeModule === label ? 'crm-nav-item active' : 'crm-nav-item'} key={label} onClick={() => { setActiveModule(label); setViewMode('active'); }} type="button">
                    <span className={cn('flex h-7 w-7 items-center justify-center rounded-lg', tone)}><Icon size={17} /></span>
                    {label}
                    {label === 'Workflows' && <ChevronRight size={15} className="ml-auto text-slate-500" />}
                  </button>
                ))}
              </div>
              <div>
                <p className="mb-2 px-3 text-xs font-semibold text-slate-500">Other</p>
                {[[Settings, 'Settings'], [MessageCircleQuestion, 'Documentation']].map(([Icon, label]) => (
                  <button className={activeModule === label ? 'crm-nav-item active' : 'crm-nav-item'} key={label as string} onClick={() => setActiveModule(label as string)} type="button">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 text-slate-300"><Icon size={17} /></span>
                    {label as string}
                  </button>
                ))}
              </div>
            </aside>

            <div className="crm-workspace">
              <WorkingCrmModule
                activeModule={activeModule}
                filteredRecords={filteredRecords}
                globalSearch={globalSearch}
                setGlobalSearch={setGlobalSearch}
                allMatches={allMatches}
                viewMode={viewMode}
                savedViews={savedViews}
                lastAction={lastAction}
                onOpenCommand={() => setCommandOpen(true)}
                onRunAction={runAction}
                onResetView={() => setViewMode('active')}
              />
            </div>
          </div>

          <WorkingCommandPalette
            activeModule={activeModule}
            open={commandOpen}
            onClose={() => setCommandOpen(false)}
            onRun={(action) => {
              runAction(action);
              setCommandOpen(false);
            }}
            onNavigate={(module) => {
              setActiveModule(module);
              setCommandOpen(false);
            }}
          />

          {emailOpen && <EmailComposer onClose={() => setEmailOpen(false)} onSent={() => { setEmailOpen(false); setLastAction('Email sent'); }} />}
          {aiOpen && <AiAssistant prompt={aiPrompt} setPrompt={setAiPrompt} answer={aiAnswer} onAsk={askAi} onClose={() => setAiOpen(false)} />}
        </section>
      </AuthRequired>
    </main>
  );
}

function filterCrmRecords(records: Record<string, CrmRecord[]>, activeModule: string, search: string, viewMode: 'active' | 'deleted') {
  const source = viewMode === 'deleted' ? deletedCrmRecords : activeModule === 'All' ? Object.values(records).flat() : records[activeModule] ?? [];
  const term = search.trim().toLowerCase();
  if (!term) return source;
  return source.filter((record) => [record.title, record.detail, record.status, record.module].join(' ').toLowerCase().includes(term));
}

function WorkingCrmModule({
  activeModule,
  filteredRecords,
  globalSearch,
  setGlobalSearch,
  allMatches,
  viewMode,
  savedViews,
  lastAction,
  onOpenCommand,
  onRunAction,
  onResetView,
}: {
  activeModule: string;
  filteredRecords: CrmRecord[];
  globalSearch: string;
  setGlobalSearch: (value: string) => void;
  allMatches: CrmRecord[];
  viewMode: 'active' | 'deleted';
  savedViews: string[];
  lastAction: string;
  onOpenCommand: () => void;
  onRunAction: (action: CrmAction) => void;
  onResetView: () => void;
}) {
  if (activeModule === 'Workflows') {
    return (
      <div>
        <CrmHeader title="Workflows" eyebrow="Automation studio" helper="Create, run, version, and audit CRM automations." globalSearch={globalSearch} setGlobalSearch={setGlobalSearch} onOpenCommand={onOpenCommand} lastAction={lastAction} />
        <WorkflowPage />
      </div>
    );
  }

  if (activeModule === 'Dashboards') return <DashboardModule globalSearch={globalSearch} setGlobalSearch={setGlobalSearch} onOpenCommand={onOpenCommand} lastAction={lastAction} />;
  if (activeModule === 'Settings') return <SettingsModule globalSearch={globalSearch} setGlobalSearch={setGlobalSearch} onOpenCommand={onOpenCommand} lastAction={lastAction} />;
  if (activeModule === 'Documentation') return <DocumentationModule globalSearch={globalSearch} setGlobalSearch={setGlobalSearch} onOpenCommand={onOpenCommand} lastAction={lastAction} />;

  return (
    <div>
      <CrmHeader title={activeModule === 'Opportunities' ? 'Opportunities pipeline' : activeModule} eyebrow="CRM app" helper="Search, import, export, create views, email customers, and ask AI from one workspace." globalSearch={globalSearch} setGlobalSearch={setGlobalSearch} onOpenCommand={onOpenCommand} lastAction={lastAction} />
      <div className="crm-action-row">
        <button onClick={() => onRunAction('import')} type="button"><Upload size={15} /> Import</button>
        <button onClick={() => onRunAction('export')} type="button"><Download size={15} /> Export</button>
        <button onClick={() => onRunAction('deleted')} type="button"><Trash2 size={15} /> Deleted</button>
        <button onClick={() => onRunAction('create-view')} type="button"><LayoutGrid size={15} /> Create View</button>
        <button onClick={() => onRunAction('ask-ai')} type="button"><Sparkles size={15} /> Ask AI</button>
        <button onClick={() => onRunAction('compose-email')} type="button"><Mail size={15} /> Email</button>
        {viewMode === 'deleted' && <button onClick={onResetView} type="button"><RotateCcw size={15} /> Active records</button>}
      </div>
      <div className="crm-view-strip">
        {savedViews.map((view) => <span key={view}>{view}</span>)}
        {globalSearch && <span>{allMatches.length} global matches</span>}
      </div>
      <RecordGrid records={filteredRecords} activeModule={activeModule} viewMode={viewMode} />
    </div>
  );
}

function CrmHeader({ title, eyebrow, helper, globalSearch, setGlobalSearch, onOpenCommand, lastAction }: {
  title: string;
  eyebrow: string;
  helper: string;
  globalSearch: string;
  setGlobalSearch: (value: string) => void;
  onOpenCommand: () => void;
  lastAction: string;
}) {
  return (
    <div className="crm-workspace-header">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h2>{title}</h2>
        <p className="mt-2 text-sm text-slate-400">{helper}</p>
      </div>
      <div className="crm-search-stack">
        <label className="crm-global-search">
          <Search size={16} />
          <input value={globalSearch} onChange={(event) => setGlobalSearch(event.target.value)} placeholder="Search leads, companies, tasks..." />
        </label>
        <div className="flex flex-wrap gap-2">
          <button className="crm-command-button" onClick={onOpenCommand} type="button"><Search size={15} /> Command</button>
          <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 px-3 py-2 text-xs text-blue-200">{lastAction}</div>
        </div>
      </div>
    </div>
  );
}

function RecordGrid({ records, activeModule, viewMode }: { records: CrmRecord[]; activeModule: string; viewMode: 'active' | 'deleted' }) {
  if (records.length === 0) {
    return <div className="command-empty">No {viewMode === 'deleted' ? 'deleted ' : ''}{activeModule.toLowerCase()} found.</div>;
  }

  if (activeModule === 'Opportunities' && viewMode === 'active') {
    return (
      <>
        <div className="pipeline-grid">
          {records.map((record) => (
            <div className="deal-card" key={record.title}>
              <span>{record.status}</span>
              <h3>{record.title.replace(' expansion', '').replace(' platform', '').replace(' rollout', '')}</h3>
              <b>{record.detail.split(' - ')[0]}</b>
              <p>{record.detail.split(' - ')[1] ?? record.detail}</p>
            </div>
          ))}
        </div>
        <div className="crm-data-grid">
          <div><span>Open opportunities</span><strong>{records.length}</strong></div>
          <div><span>Pipeline</span><strong>$187k</strong></div>
          <div><span>Automation runs</span><strong>128</strong></div>
        </div>
      </>
    );
  }

  return (
    <div className="grid gap-3">
      {records.map((record) => (
        <div className="crm-list-row" key={`${record.module}-${record.title}`}>
          <div>
            <b>{record.title}</b>
            <span>{record.module} - {record.detail}</span>
          </div>
          <em>{record.status}</em>
        </div>
      ))}
    </div>
  );
}

function DashboardModule({ globalSearch, setGlobalSearch, onOpenCommand, lastAction }: Pick<Parameters<typeof WorkingCrmModule>[0], 'globalSearch' | 'setGlobalSearch' | 'onOpenCommand' | 'lastAction'>) {
  return (
    <div>
      <CrmHeader title="Dashboards" eyebrow="CRM analytics" helper="Saved dashboards for revenue, workflow, conversion, and team performance." globalSearch={globalSearch} setGlobalSearch={setGlobalSearch} onOpenCommand={onOpenCommand} lastAction={lastAction} />
      <ReportsPanel />
    </div>
  );
}

function SettingsModule({ globalSearch, setGlobalSearch, onOpenCommand, lastAction }: Pick<Parameters<typeof WorkingCrmModule>[0], 'globalSearch' | 'setGlobalSearch' | 'onOpenCommand' | 'lastAction'>) {
  return (
    <div>
      <CrmHeader title="Settings" eyebrow="Workspace settings" helper="Manage billing, members, account settings, email settings, and experience settings." globalSearch={globalSearch} setGlobalSearch={setGlobalSearch} onOpenCommand={onOpenCommand} lastAction={lastAction} />
      <RecordGrid activeModule="Settings" viewMode="active" records={[
        { module: 'Settings', title: 'Workspace settings', detail: 'Members, roles, permissions', status: 'Open' },
        { module: 'Settings', title: 'Experience settings', detail: 'Theme, navigation, layouts', status: 'Open' },
        { module: 'Settings', title: 'Email settings', detail: 'Sender, templates, sync', status: 'Open' },
      ]} />
    </div>
  );
}

function DocumentationModule({ globalSearch, setGlobalSearch, onOpenCommand, lastAction }: Pick<Parameters<typeof WorkingCrmModule>[0], 'globalSearch' | 'setGlobalSearch' | 'onOpenCommand' | 'lastAction'>) {
  return (
    <div>
      <CrmHeader title="Documentation" eyebrow="Help center" helper="Guides, API docs, automation references, and setup resources." globalSearch={globalSearch} setGlobalSearch={setGlobalSearch} onOpenCommand={onOpenCommand} lastAction={lastAction} />
      <RecordGrid activeModule="Documentation" viewMode="active" records={[
        { module: 'Documentation', title: 'Getting started', detail: 'Set up records, pipelines, and team permissions', status: 'Guide' },
        { module: 'Documentation', title: 'Workflow automation', detail: 'Triggers, actions, conditions, and run history', status: 'Docs' },
        { module: 'Documentation', title: 'API reference', detail: 'Connect external systems and custom apps', status: 'API' },
      ]} />
    </div>
  );
}

function WorkingCommandPalette({ activeModule, open, onClose, onRun, onNavigate }: {
  activeModule: string;
  open: boolean;
  onClose: () => void;
  onRun: (action: CrmAction) => void;
  onNavigate: (module: string) => void;
}) {
  const [query, setQuery] = useState('');
  const moduleName = activeModule;
  const actions: Array<{ icon: LucideIcon; label: string; shortcut?: string; run: () => void }> = [
    { icon: Upload, label: `Import ${moduleName}`, run: () => onRun('import') },
    { icon: Download, label: 'Export View', run: () => onRun('export') },
    { icon: Trash2, label: `See deleted ${moduleName}`, run: () => onRun('deleted') },
    { icon: LayoutGrid, label: 'Create View', run: () => onRun('create-view') },
    { icon: Search, label: 'Search', shortcut: '/', run: () => onRun('search') },
    { icon: Sparkles, label: 'Ask AI', shortcut: '@', run: () => onRun('ask-ai') },
    { icon: RotateCcw, label: 'View Previous AI Chats', run: () => onRun('ai-history') },
    { icon: Mail, label: 'Compose Email', run: () => onRun('compose-email') },
    { icon: Settings, label: 'Go to Settings', shortcut: 'G then S', run: () => onRun('settings') },
    { icon: Settings, label: 'Go to Experience Settings', run: () => onRun('experience-settings') },
    { icon: Github, label: 'Go to Accounts Settings', run: () => onRun('accounts-settings') },
    { icon: Inbox, label: 'Go to Emails Settings', run: () => onRun('emails-settings') },
    { icon: Building2, label: 'Open Companies', run: () => onNavigate('Companies') },
    { icon: Users, label: 'Open People', run: () => onNavigate('People') },
    { icon: Target, label: 'Open Opportunities', run: () => onNavigate('Opportunities') },
  ];
  const filtered = actions.filter((action) => action.label.toLowerCase().includes(query.toLowerCase()));

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  if (!open) return null;

  return (
    <div className="command-overlay" role="dialog" aria-label="Command menu">
      <div className="command-panel">
        <div className="command-search">
          <Search size={18} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} autoFocus placeholder="Search actions, records, settings..." />
          <button onClick={onClose} type="button"><X size={16} /></button>
        </div>
        <div className="command-section-label">Other</div>
        <div className="command-list">
          {filtered.map((action) => {
            const Icon = action.icon;
            return (
              <button className="command-item" key={action.label} onClick={action.run} type="button">
                <span><Icon size={18} /></span>
                <b>{action.label}</b>
                {action.shortcut && <em>{action.shortcut}</em>}
              </button>
            );
          })}
          {filtered.length === 0 && <div className="command-empty">No actions found</div>}
        </div>
      </div>
    </div>
  );
}

function EmailComposer({ onClose, onSent }: { onClose: () => void; onSent: () => void }) {
  return (
    <div className="command-overlay" role="dialog" aria-label="Email composer">
      <div className="command-panel">
        <div className="command-search">
          <Mail size={18} />
          <input defaultValue="sarah@acmecloud.com" aria-label="Email recipient" />
          <button onClick={onClose} type="button"><X size={16} /></button>
        </div>
        <div className="p-4">
          <input className="crm-modal-input" defaultValue="Following up on your Digital Wave CRM demo" aria-label="Email subject" />
          <textarea className="crm-modal-textarea" defaultValue={'Hi Sarah,\n\nThanks for joining the demo. I attached the next steps and can help your team configure the workflow builder this week.\n\nBest,\nDigital Wave'} aria-label="Email body" />
          <div className="mt-3 flex justify-end gap-2">
            <button className="crm-command-button" onClick={onClose} type="button">Cancel</button>
            <button className="btn-primary" onClick={onSent} type="button">Send email</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AiAssistant({ prompt, setPrompt, answer, onAsk, onClose }: { prompt: string; setPrompt: (value: string) => void; answer: string; onAsk: () => void; onClose: () => void }) {
  return (
    <div className="command-overlay" role="dialog" aria-label="Ask AI">
      <div className="command-panel">
        <div className="command-search">
          <Sparkles size={18} />
          <input value={prompt} onChange={(event) => setPrompt(event.target.value)} aria-label="AI prompt" />
          <button onClick={onClose} type="button"><X size={16} /></button>
        </div>
        <div className="p-4">
          <div className="crm-ai-answer">{answer}</div>
          <div className="mt-3 flex justify-end gap-2">
            <button className="crm-command-button" onClick={onClose} type="button">Close</button>
            <button className="btn-primary" onClick={onAsk} type="button">Ask AI</button>
          </div>
        </div>
      </div>
    </div>
  );
}
