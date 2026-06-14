export const SITE_URL = 'https://digital-wave.solutions';

export const HOME_TITLE = 'Digital Wave | AI Automation, Websites & Digital Solutions';
export const HOME_DESCRIPTION = 'Digital Wave builds websites, automation systems, AI chatbots, CRM tools, booking systems, loyalty systems, and digital solutions for businesses.';

export type ServiceSlug =
  | 'web-development'
  | 'ai-automation'
  | 'chatbots'
  | 'crm-systems'
  | 'booking-systems'
  | 'digital-marketing'
  | 'loyalty-systems';

export type ServicePage = {
  slug: ServiceSlug;
  title: string;
  shortTitle: string;
  description: string;
  keywords: string;
};

export const services: ServicePage[] = [
  {
    slug: 'web-development',
    title: 'Digital Wave Web Development',
    shortTitle: 'Web Development',
    description: 'Digital Wave builds fast, responsive websites and web applications for businesses that need a professional online presence.',
    keywords: 'Digital Wave Web Development, Digital Wave Egypt, web development Egypt, business websites',
  },
  {
    slug: 'ai-automation',
    title: 'Digital Wave AI Automation',
    shortTitle: 'AI Automation',
    description: 'Digital Wave creates AI automation systems that reduce manual work, connect tools, and help teams move faster.',
    keywords: 'Digital Wave AI Automation, AI automation Egypt, business automation, workflow automation',
  },
  {
    slug: 'chatbots',
    title: 'Digital Wave AI Chatbots',
    shortTitle: 'AI Chatbots',
    description: 'Digital Wave builds AI chatbots for customer support, lead capture, booking flows, and business operations.',
    keywords: 'Digital Wave AI chatbots, AI chatbot Egypt, customer support chatbot, lead chatbot',
  },
  {
    slug: 'crm-systems',
    title: 'Digital Wave CRM Systems',
    shortTitle: 'CRM Systems',
    description: 'Digital Wave designs CRM systems for managing leads, customers, tasks, deals, teams, and business workflows.',
    keywords: 'Digital Wave CRM, Digital Wave CRM systems, CRM Egypt, custom CRM systems',
  },
  {
    slug: 'booking-systems',
    title: 'Digital Wave Booking System',
    shortTitle: 'Booking Systems',
    description: 'Digital Wave develops booking systems for appointments, service scheduling, confirmations, reminders, and customer management.',
    keywords: 'Digital Wave Booking System, booking system Egypt, appointment booking software',
  },
  {
    slug: 'digital-marketing',
    title: 'Digital Wave Digital Marketing',
    shortTitle: 'Digital Marketing',
    description: 'Digital Wave supports businesses with digital marketing systems, landing pages, funnels, campaigns, tracking, and growth tools.',
    keywords: 'Digital Wave digital marketing, digital marketing Egypt, marketing automation',
  },
  {
    slug: 'loyalty-systems',
    title: 'Digital Wave Loyalty Systems',
    shortTitle: 'Loyalty Systems',
    description: 'Digital Wave builds loyalty systems that help businesses reward repeat customers and improve retention.',
    keywords: 'Digital Wave loyalty systems, loyalty system Egypt, customer retention software',
  },
];

export type SeoPage = {
  path: string;
  title: string;
  description: string;
  keywords: string;
};

export const publicPages: SeoPage[] = [
  {
    path: '/',
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    keywords: 'Digital Wave, Digital Wave Egypt, Digital Wave Solutions, Digital Wave AI Automation, Digital Wave Web Development, Digital Wave CRM, Digital Wave Booking System',
  },
  {
    path: '/about',
    title: 'About Digital Wave | Digital Solutions for Business',
    description: 'Learn about Digital Wave, a digital solutions company building websites, AI automation, chatbots, CRM systems, booking systems, and loyalty systems.',
    keywords: 'About Digital Wave, Digital Wave Egypt, Digital Wave Solutions',
  },
  {
    path: '/services',
    title: 'Digital Wave Services | Websites, AI Automation, CRM & Marketing',
    description: 'Explore Digital Wave services including web development, AI automation, AI chatbots, CRM systems, booking systems, digital marketing, and loyalty systems.',
    keywords: 'Digital Wave services, Digital Wave Web Development, Digital Wave AI Automation, Digital Wave CRM',
  },
  {
    path: '/portfolio',
    title: 'Digital Wave Portfolio | Websites, CRM & Automation Work',
    description: 'See the types of websites, CRM tools, automation systems, booking systems, and digital solutions Digital Wave creates for businesses.',
    keywords: 'Digital Wave portfolio, Digital Wave projects, CRM portfolio, automation portfolio',
  },
  {
    path: '/contact',
    title: 'Contact Digital Wave | Websites, AI Automation & CRM Systems',
    description: 'Contact Digital Wave to discuss websites, AI automation, chatbots, CRM systems, booking systems, digital marketing, and loyalty systems.',
    keywords: 'Contact Digital Wave, Digital Wave Egypt contact, Digital Wave Solutions',
  },
  {
    path: '/privacy-policy',
    title: 'Privacy Policy | Digital Wave',
    description: 'Read the Digital Wave privacy policy for website visitors, leads, clients, CRM users, and business contacts.',
    keywords: 'Digital Wave privacy policy',
  },
  {
    path: '/terms',
    title: 'Terms of Service | Digital Wave',
    description: 'Read the Digital Wave terms of service for websites, automation systems, CRM systems, booking systems, and digital services.',
    keywords: 'Digital Wave terms, Digital Wave terms of service',
  },
  ...services.map((service) => ({
    path: `/services/${service.slug}`,
    title: `${service.title} | Digital Wave`,
    description: service.description,
    keywords: service.keywords,
  })),
];

export function pageForPath(pathname: string): SeoPage {
  const normalized = pathname === '' ? '/' : pathname.replace(/\/$/, '') || '/';
  return publicPages.find((page) => page.path === normalized) || publicPages[0];
}

export function canonicalUrl(pathname: string) {
  const normalized = pathname === '/' ? '' : pathname.replace(/\/$/, '');
  return `${SITE_URL}${normalized}`;
}
