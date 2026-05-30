import { motion } from 'framer-motion';
import { ArrowRight, Check, ChevronDown, ChevronLeft, ChevronRight, Sparkles, Star, Quote, Brain, Zap, Workflow, GitBranch, LayoutDashboard, Bell, Send } from 'lucide-react';
import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { SignInButton, SignUpButton } from '@clerk/clerk-react';
import { cn } from '../../utils/cn';
import { CRM_ROUTE } from '../../constants/design';
import { companies, FEATURES, iconMap, PRICING_PLANS, TESTIMONIALS, FAQ_ITEMS, NAV_LINKS } from '../../constants/data';

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

export function TrustedBySection() {
  return (
    <section className="relative border-y border-white/5 bg-[#0B1023] py-12">
      <div className="mx-auto max-w-7xl px-4">
        <p className="mb-6 text-center text-[10px] font-medium uppercase tracking-[0.15em] text-gray-500">Trusted by innovative companies worldwide</p>
        <div className="grid grid-cols-2 items-center gap-4 sm:grid-cols-4 lg:grid-cols-8">
          {companies.map((name, index) => (
            <motion.div key={name} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.05 }} className="flex items-center justify-center">
              <div className="flex items-center gap-2.5 rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2 transition-all hover:bg-white/[0.06]">
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

export function FeaturesSection() {
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

export function CrmPreviewSection() {
  const aiFeatures = [
    { icon: Brain, title: 'AI-Powered Insights', description: 'Smart recommendations and predictive analytics that help you make better decisions faster.' },
    { icon: Sparkles, title: 'Automated Workflows', description: 'Set triggers and actions to automate repetitive tasks across your entire operation.' },
    { icon: Zap, title: 'Smart Lead Scoring', description: 'AI automatically scores leads based on engagement, fit, and purchase intent signals.' },
  ];

  return (
    <section className="dark-section-alt section-grid overflow-hidden py-20 sm:py-24">
      <div className="absolute left-1/4 right-1/4 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
      <div className="relative z-10 mx-auto max-w-7xl px-4">
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

export function WhyChooseUsSection() {
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

export function TestimonialsSection() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);
  const testimonial = TESTIMONIALS[current];

  useEffect(() => {
    const timer = setInterval(() => { setDirection(1); setCurrent((p) => (p + 1) % TESTIMONIALS.length); }, 4000);
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
              <motion.div key={current} custom={direction} initial={{ x: direction > 0 ? 300 : -300, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: direction > 0 ? -300 : 300, opacity: 0 }} transition={{ duration: 0.35 }} className="w-full max-w-lg">
                <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-xl shadow-black/10">
                  <div className="mb-4 flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={14} className={cn('fill-current', i < testimonial.rating ? 'text-amber-400' : 'text-gray-200')} />)}
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
            <button onClick={() => { setDirection(-1); setCurrent((p) => (p - 1 + TESTIMONIALS.length) % TESTIMONIALS.length); }} className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-gray-400 transition-all hover:bg-white/10 hover:text-white"><ChevronLeft size={14} /></button>
            <div className="flex items-center gap-2">
              {TESTIMONIALS.map((_, i) => <button key={i} onClick={() => { setDirection(i > current ? 1 : -1); setCurrent(i); }} className={cn('h-1.5 rounded-full transition-all', i === current ? 'w-6 bg-blue-400' : 'w-1.5 bg-white/20')} aria-label={`Show testimonial ${i + 1}`} />)}
            </div>
            <button onClick={() => { setDirection(1); setCurrent((p) => (p + 1) % TESTIMONIALS.length); }} className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-gray-400 transition-all hover:bg-white/10 hover:text-white"><ChevronRight size={14} /></button>
          </div>
        </div>
      </div>
    </section>
  );
}

interface LandingSectionProps {
  clerkMissing: boolean;
}

export function PricingSection({ clerkMissing }: LandingSectionProps) {
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
                {clerkMissing ? (
                  <button className={plan.popular ? 'landing-primary w-full' : 'landing-ghost w-full'} onClick={() => window.alert('Set VITE_CLERK_PUBLISHABLE_KEY in .env to enable Clerk authentication.')}>{plan.cta} <ArrowRight size={14} /></button>
                ) : (
                  <SignUpButton mode="modal" forceRedirectUrl={CRM_ROUTE}>
                    <button className={plan.popular ? 'landing-primary w-full' : 'landing-ghost w-full'}>{plan.cta} <ArrowRight size={14} /></button>
                  </SignUpButton>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FaqSection() {
  const [open, setOpen] = useState(0);
  return (
    <section id="contact" className="dark-section-alt py-20 sm:py-24">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/5 to-transparent" />
      <div className="relative z-10 mx-auto max-w-2xl px-4">
        <SectionIntro eyebrow="FAQ" title="Frequently Asked Questions" body="Everything you need to know about Digital Wave CRM." />
        <div className="space-y-2">
          {FAQ_ITEMS.map((item, index) => (
            <div key={item.question} className={cn('overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.03] transition-all', open === index && 'border-blue-500/20 shadow-lg shadow-blue-500/5')}>
              <button onClick={() => setOpen(open === index ? -1 : index)} className="group flex w-full items-center justify-between px-5 py-3.5 text-left text-sm font-medium text-gray-200 transition-all hover:bg-white/[0.02]">
                <span>{item.question}</span>
                <ChevronDown size={14} className={cn('ml-4 shrink-0 text-gray-500 transition-transform', open === index && 'rotate-180')} />
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

export function CtaSection({ clerkMissing }: LandingSectionProps) {
  return (
    <section className="dark-section relative overflow-hidden py-20 sm:py-24">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-blue-500/10 to-cyan-500/20" />
      <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/10 blur-[150px]" />
      <div className="relative z-10 mx-auto max-w-3xl px-4 text-center">
        <div className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-[10px] text-blue-300"><Sparkles size={12} /> Get Started Today</div>
        <h2 className="text-3xl font-bold leading-tight text-white sm:text-4xl md:text-5xl">Ready to Transform Your <span className="bg-gradient-to-r from-blue-400 via-blue-300 to-cyan-300 bg-clip-text text-transparent">Business Operations</span>?</h2>
        <p className="mx-auto mt-4 max-w-xl text-sm text-gray-400 sm:text-base">Join 2,000+ businesses using Digital Wave CRM to manage clients, projects, and teams with confidence.</p>
        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          {clerkMissing ? (
            <>
              <button className="landing-primary" onClick={() => window.alert('Set VITE_CLERK_PUBLISHABLE_KEY in .env to enable Clerk authentication.')}>Start Free Trial <ArrowRight size={16} /></button>
              <button className="landing-ghost" onClick={() => window.alert('Set VITE_CLERK_PUBLISHABLE_KEY in .env to enable Clerk authentication.')}>Book a Demo</button>
            </>
          ) : (
            <>
              <SignUpButton mode="modal" forceRedirectUrl={CRM_ROUTE}>
                <button className="landing-primary">Start Free Trial <ArrowRight size={16} /></button>
              </SignUpButton>
              <SignInButton mode="modal" forceRedirectUrl={CRM_ROUTE}>
                <button className="landing-ghost">Book a Demo</button>
              </SignInButton>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="relative border-t border-white/5 bg-[#050816]">
      <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 via-transparent to-transparent" />
      <div className="relative z-10 mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-1 gap-8 py-14 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <a href="/" className="mb-4 inline-flex items-center gap-2">
              <span className="bg-gradient-to-r from-blue-400 via-blue-300 to-cyan-300 bg-clip-text text-lg font-bold text-transparent">Digital Wave CRM</span>
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
              <input placeholder="Enter your email" className="block h-8 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-gray-300 placeholder:text-gray-500 transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
              <button className="inline-flex h-8 shrink-0 items-center justify-center rounded-xl bg-blue-600 px-2.5 py-1 text-xs font-medium text-white transition-all hover:bg-blue-500"><Send size={12} /></button>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center justify-between gap-3 border-t border-white/5 py-5 sm:flex-row">
          <p className="text-xs text-gray-500">&copy; {new Date().getFullYear()} Digital Wave CRM. All rights reserved.</p>
          <div className="flex items-center gap-5"><a href="#" className="text-xs text-gray-500 hover:text-blue-300">Privacy Policy</a><a href="#" className="text-xs text-gray-500 hover:text-blue-300">Terms of Service</a></div>
        </div>
      </div>
    </footer>
  );
}
