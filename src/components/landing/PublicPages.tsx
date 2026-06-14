import { ArrowRight, CheckCircle, Mail } from 'lucide-react';
import type { ReactNode } from 'react';
import { Footer } from './LandingSections';
import { Navbar } from './Navbar';
import { pageForPath, services, SITE_URL } from '../../constants/seo';

type PublicPageProps = {
  pathname: string;
  clerkMissing: boolean;
};

const contactHref = 'mailto:contact@digital-wave.solutions?subject=Digital%20Wave%20project%20request';

function PageShell({ pathname, clerkMissing, children }: PublicPageProps & { children: ReactNode }) {
  const page = pageForPath(pathname);
  return (
    <main className="min-h-screen bg-[#050816] text-white">
      <Navbar clerkMissing={clerkMissing} />
      <section className="dark-section section-grid pt-28 pb-16">
        <div className="relative z-10 mx-auto max-w-5xl px-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-blue-300">Digital Wave</p>
          <h1 className="max-w-3xl text-4xl font-bold leading-tight sm:text-5xl">{page.title.replace(' | Digital Wave', '').replace(' | Digital Solutions for Business', '')}</h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-gray-300">{page.description}</p>
        </div>
      </section>
      {children}
      <Footer />
    </main>
  );
}

function ServiceCard({ href, title, description }: { href: string; title: string; description: string }) {
  return (
    <a href={href} className="group rounded-xl border border-white/[0.08] bg-white/[0.03] p-5 transition hover:border-blue-400/30 hover:bg-white/[0.06]">
      <h2 className="text-lg font-semibold text-white">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-gray-400">{description}</p>
      <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-blue-300">Learn more <ArrowRight size={14} /></span>
    </a>
  );
}

export function PublicPage({ pathname, clerkMissing }: PublicPageProps) {
  const service = services.find((item) => `/services/${item.slug}` === pathname);

  if (service) {
    return (
      <PageShell pathname={pathname} clerkMissing={clerkMissing}>
        <section className="dark-section-alt py-16">
          <div className="mx-auto grid max-w-5xl gap-8 px-4 md:grid-cols-[1.2fr_0.8fr]">
            <div>
              <h2 className="text-2xl font-bold text-white">How Digital Wave helps</h2>
              <p className="mt-4 text-sm leading-7 text-gray-300">
                {service.description} We plan the customer journey, build the technical system, connect the tools your team already uses, and keep the experience simple for your customers.
              </p>
              <ul className="mt-6 space-y-3 text-sm text-gray-300">
                {['Clear business process mapping', 'Responsive design and stable implementation', 'Automation-ready structure', 'Support for growth, reporting, and future integrations'].map((item) => (
                  <li key={item} className="flex gap-2"><CheckCircle size={16} className="mt-0.5 shrink-0 text-emerald-400" />{item}</li>
                ))}
              </ul>
            </div>
            <aside className="rounded-xl border border-blue-400/20 bg-blue-500/10 p-5">
              <h2 className="text-xl font-semibold text-white">Start a {service.shortTitle.toLowerCase()} project</h2>
              <p className="mt-3 text-sm leading-6 text-gray-300">Tell Digital Wave what you want to build, improve, or automate. We will help turn it into a practical digital system.</p>
              <a href={contactHref} className="landing-primary mt-5 inline-flex">Contact Digital Wave <Mail size={16} /></a>
            </aside>
          </div>
        </section>
      </PageShell>
    );
  }

  switch (pathname) {
    case '/about':
      return (
        <PageShell pathname={pathname} clerkMissing={clerkMissing}>
          <section className="dark-section-alt py-16">
            <div className="mx-auto max-w-4xl px-4 text-sm leading-7 text-gray-300">
              <p>Digital Wave is a digital solutions business focused on practical systems for growing companies. We build websites, AI automation, AI chatbots, CRM systems, booking systems, loyalty systems, and digital marketing infrastructure.</p>
              <p className="mt-4">Businesses choose Digital Wave because we combine clean user experience, automation thinking, and business operations knowledge. The goal is not only to launch a website, but to create systems that help teams capture leads, serve customers, and work faster.</p>
            </div>
          </section>
        </PageShell>
      );
    case '/services':
      return (
        <PageShell pathname={pathname} clerkMissing={clerkMissing}>
          <section className="dark-section-alt py-16">
            <div className="mx-auto grid max-w-6xl gap-4 px-4 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((item) => (
                <ServiceCard key={item.slug} href={`/services/${item.slug}`} title={item.shortTitle} description={item.description} />
              ))}
            </div>
          </section>
        </PageShell>
      );
    case '/portfolio':
      return (
        <PageShell pathname={pathname} clerkMissing={clerkMissing}>
          <section className="dark-section-alt py-16">
            <div className="mx-auto grid max-w-5xl gap-4 px-4 md:grid-cols-3">
              {['Business websites and landing pages', 'CRM and customer management tools', 'Booking, loyalty, and automation systems'].map((item) => (
                <article key={item} className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-5">
                  <h2 className="text-lg font-semibold text-white">{item}</h2>
                  <p className="mt-2 text-sm leading-6 text-gray-400">Digital Wave creates digital systems that are planned around real customer journeys, internal workflows, and measurable business outcomes.</p>
                </article>
              ))}
            </div>
          </section>
        </PageShell>
      );
    case '/contact':
      return (
        <PageShell pathname={pathname} clerkMissing={clerkMissing}>
          <section className="dark-section-alt py-16">
            <div className="mx-auto max-w-4xl px-4">
              <div className="rounded-xl border border-blue-400/20 bg-blue-500/10 p-6">
                <h2 className="text-2xl font-bold text-white">Contact Digital Wave</h2>
                <p className="mt-3 text-sm leading-7 text-gray-300">Tell us about your website, automation, chatbot, CRM, booking system, digital marketing, or loyalty system project.</p>
                <a href={contactHref} className="landing-primary mt-5 inline-flex"><Mail size={16} /> contact@digital-wave.solutions</a>
              </div>
            </div>
          </section>
        </PageShell>
      );
    case '/privacy-policy':
      return (
        <PageShell pathname={pathname} clerkMissing={clerkMissing}>
          <LegalCopy title="Privacy Policy" />
        </PageShell>
      );
    case '/terms':
      return (
        <PageShell pathname={pathname} clerkMissing={clerkMissing}>
          <LegalCopy title="Terms of Service" />
        </PageShell>
      );
    default:
      return (
        <PageShell pathname="/" clerkMissing={clerkMissing}>
          <section className="dark-section-alt py-16">
            <div className="mx-auto max-w-4xl px-4">
              <p className="text-sm text-gray-300">Visit the Digital Wave homepage at <a className="text-blue-300" href={SITE_URL}>{SITE_URL}</a>.</p>
            </div>
          </section>
        </PageShell>
      );
  }
}

function LegalCopy({ title }: { title: string }) {
  return (
    <section className="dark-section-alt py-16">
      <div className="mx-auto max-w-4xl space-y-5 px-4 text-sm leading-7 text-gray-300">
        <h2 className="text-2xl font-bold text-white">{title}</h2>
        <p>Digital Wave uses information shared by visitors, leads, and clients to respond to inquiries, plan projects, deliver digital services, improve systems, and maintain secure business communication.</p>
        <p>Digital Wave services may include websites, automation systems, AI chatbots, CRM systems, booking systems, loyalty systems, and digital marketing support. Project-specific terms, deliverables, and responsibilities are confirmed directly with each client.</p>
        <p>For questions about this page, contact Digital Wave at <a className="text-blue-300" href="mailto:contact@digital-wave.solutions">contact@digital-wave.solutions</a>.</p>
      </div>
    </section>
  );
}
