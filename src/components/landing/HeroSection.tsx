import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  Activity, ArrowRight, BarChart3, CheckCircle, DollarSign, FolderKanban, TrendingUp, Users,
} from 'lucide-react';
import { SignInButton, SignUpButton } from '@clerk/clerk-react';
import { cn } from '../../utils/cn';
import { CRM_ROUTE } from '../../constants/design';
import { barHeights } from '../../constants/data';

const floatingIcons = [
  { icon: TrendingUp, x: '15%', y: '20%', delay: 0, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  { icon: Users, x: '85%', y: '15%', delay: 0.5, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  { icon: BarChart3, x: '10%', y: '70%', delay: 1, color: 'text-violet-400', bg: 'bg-violet-500/10' },
  { icon: DollarSign, x: '90%', y: '75%', delay: 1.5, color: 'text-amber-400', bg: 'bg-amber-500/10' },
];

interface HeroSectionProps {
  clerkMissing: boolean;
}

export function HeroSection({ clerkMissing }: HeroSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

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
          <motion.div
            key={item.color}
            className={cn('absolute hidden h-12 w-12 items-center justify-center rounded-2xl border border-white/10 backdrop-blur-sm lg:flex', item.bg)}
            style={{ left: item.x, top: item.y }}
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: item.delay }}
          >
            <Icon size={18} className={item.color} />
          </motion.div>
        );
      })}

      <motion.div style={{ y, opacity }} className="relative z-10 mx-auto max-w-5xl px-4 pt-24 text-center sm:pt-32">
        <motion.div variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } }} initial="hidden" animate="visible">
          <motion.div variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } }} className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs text-blue-300 backdrop-blur-sm">
            <span className="animate-pulse-glow flex h-1.5 w-1.5 rounded-full bg-blue-400" />
            Trusted by 2,000+ businesses worldwide
          </motion.div>
          <motion.h1 variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } }} className="text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            <span className="text-white">Modern CRM &</span><br />
            <span className="bg-gradient-to-r from-blue-400 via-blue-300 to-cyan-300 bg-clip-text text-transparent">Software Solutions</span>
          </motion.h1>
          <motion.p variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } }} className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-gray-400 sm:text-base">
            Manage clients, teams, workflows, and business operations in one powerful platform. Powered by AI. Built for scale.
          </motion.p>
          <motion.div variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } }} className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            {clerkMissing ? (
              <>
                <a className="landing-primary" href={CRM_ROUTE}>Start Free Trial <ArrowRight size={16} /></a>
                <a className="landing-ghost" href={CRM_ROUTE}>CRM Login</a>
              </>
            ) : (
              <>
                <SignUpButton mode="modal" forceRedirectUrl={CRM_ROUTE}>
                  <button className="landing-primary">Start Free Trial <ArrowRight size={16} /></button>
                </SignUpButton>
                <SignInButton mode="modal" forceRedirectUrl={CRM_ROUTE}>
                  <button className="landing-ghost"><Activity size={16} /> CRM Login</button>
                </SignInButton>
              </>
            )}
          </motion.div>
          <motion.div variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } }} className="mt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-gray-500">
            {['No credit card', '14-day free trial', 'Cancel anytime'].map((item) => (
              <span key={item} className="flex items-center gap-1.5"><CheckCircle size={12} className="text-emerald-400" /> {item}</span>
            ))}
          </motion.div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.6 }} className="mx-auto mt-16 max-w-4xl">
          <div className="glow-blue-lg relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] shadow-2xl shadow-blue-500/5 backdrop-blur-xl">
            <div className="flex items-center gap-1.5 border-b border-white/5 px-4 py-3">
              <div className="h-2.5 w-2.5 rounded-full bg-red-500/80" /><div className="h-2.5 w-2.5 rounded-full bg-amber-500/80" /><div className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
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
                    <motion.div
                      key={index}
                      initial={{ height: 0 }}
                      animate={{ height: `${height}%` }}
                      transition={{ duration: 0.8, delay: 0.8 + index * 0.05 }}
                      className="flex-1 rounded-sm bg-gradient-to-t from-blue-500 to-blue-400/80 opacity-80 transition-opacity hover:opacity-100"
                    />
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
