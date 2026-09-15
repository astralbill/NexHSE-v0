import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ArrowUpRight, Award, BriefcaseBusiness, Check, ChevronDown, ChevronLeft, ChevronRight, ClipboardCheck, Clock3, Flame, HardHat, HeartPulse, Leaf, Mail, MapPin, Phone, Search, ShieldCheck, Siren, Sparkles, Target, Users } from 'lucide-react';
import { Link, Route, Switch, Router as WouterRouter, useLocation, useParams } from 'wouter';
import heroImage from '@assets/image-36_1787989938472.jpg';
import trainingImage from '@assets/image-23_1787989938474.jpg';
import fireImage from '@assets/image-27_1787989938474.jpg';
import heightsImage from '@assets/image-33_1787989938474.jpg';
import fieldImage from '@assets/image-15_1787989938475.jpg';
import heightsStock from '@assets/img-05_1787989938475.webp';
import harnessImage from '@assets/img-04_1787989938476.jpg';
import nexhseLogo from '@assets/logo01_1787991144513.png';

const queryClient = new QueryClient();
const phone = '0705 065 852';
const email = 'info@nexhse.com';

type IconType = typeof ShieldCheck;
type Service = { slug: string; number: string; title: string; short: string; type: 'Consulting / Audit' | 'Training / Professional Development'; icon: IconType; image: string; group: string; };
type FAQ = { q: string; a: string };

const services: Service[] = [
  { slug: 'safety-health-audits', number: '01', title: 'Safety & Health Audits', short: 'A clear view of how your current safety systems perform in practice.', type: 'Consulting / Audit', icon: ClipboardCheck, image: heroImage, group: 'Assess' },
  { slug: 'risk-assessment', number: '02', title: 'Risk Assessment', short: 'Identify hazards, understand exposure and make the next control decision visible.', type: 'Consulting / Audit', icon: Target, image: harnessImage, group: 'Assess' },
  { slug: 'fire-audits', number: '03', title: 'Fire Audits', short: 'Practical review of fire risk, preparedness and response arrangements.', type: 'Consulting / Audit', icon: Flame, image: fireImage, group: 'Protect' },
  { slug: 'osh-committee-training', number: '04', title: 'OSH Committee Training', short: 'Give workplace safety committees the knowledge to participate with confidence.', type: 'Training / Professional Development', icon: Users, image: trainingImage, group: 'Develop' },
  { slug: 'fire-safety-training', number: '05', title: 'Fire Safety Training', short: 'Build calm, practical response habits before an emergency tests them.', type: 'Training / Professional Development', icon: Siren, image: fireImage, group: 'Develop' },
  { slug: 'first-aid-training', number: '06', title: 'First Aid Training', short: 'Develop the capability to act decisively in the critical first moments.', type: 'Training / Professional Development', icon: HeartPulse, image: trainingImage, group: 'Develop' },
  { slug: 'work-at-heights-training', number: '07', title: 'Work at Heights Training', short: 'Practical training for safer planning, equipment use and work at height.', type: 'Training / Professional Development', icon: HardHat, image: heightsImage, group: 'Develop' },
  { slug: 'environmental-impact-assessment', number: '08', title: 'Environmental Impact Assessment', short: 'Structured environmental insight to support responsible operational decisions.', type: 'Consulting / Audit', icon: Leaf, image: fieldImage, group: 'Sustain' },
  { slug: 'environmental-awareness-training', number: '09', title: 'Environmental Awareness Training', short: 'Help teams connect daily choices with environmental responsibility.', type: 'Training / Professional Development', icon: Leaf, image: fieldImage, group: 'Sustain' },
  { slug: 'environmental-audits', number: '10', title: 'Environmental Audits', short: 'Review environmental practice and identify opportunities to strengthen control.', type: 'Consulting / Audit', icon: Leaf, image: fieldImage, group: 'Sustain' },
];

const faqs: FAQ[] = [
  { q: 'How does NexHSE begin an engagement?', a: 'We start by understanding your organisation, operating context and the practical concern you need to solve. From there, we can shape an appropriate audit, training programme or consultation.' },
  { q: 'Can training be delivered at our workplace?', a: 'Delivery format is shaped around the programme and your organisation. Share the context with our team and we will advise on a suitable approach.' },
  { q: 'Do you provide quotations?', a: 'Yes. Request a quote with a few details about your organisation and requirement. A member of the NexHSE team can then follow up with the next step.' },
  { q: 'Are your courses available on fixed dates?', a: 'Course dates, durations and availability are content required for Phase 1. Contact us to discuss your intended programme or check back for published dates.' },
];

const meta: Record<string, { title: string; description: string }> = {
  home: { title: 'NexHSE Africa | Workplace Safety, HSE Training & Professional Development', description: 'NexHSE Africa helps organisations across Kenya and Africa protect people, reduce workplace risk and build practical HSE capability through audits, training, fire safety and environmental services.' },
  about: { title: 'About NexHSE Africa | Workplace Safety & Professional Development', description: 'Learn about NexHSE Africa, our approach to workplace safety, risk reduction, compliance, professional development and building stronger safety cultures.' },
  services: { title: 'HSE Services Kenya | Audits, Risk Assessment, Fire & Environmental | NexHSE', description: 'Explore NexHSE workplace safety, health, fire, risk assessment, training and environmental services designed around your operations, risks and people.' },
  training: { title: 'HSE Training Kenya | Fire Safety, First Aid, OSH & Work at Heights | NexHSE', description: 'Explore NexHSE workplace safety and professional development training, including fire safety, first aid, OSH committee and work-at-height programmes.' },
  projects: { title: 'NexHSE Projects & Case Studies | Workplace Safety in Practice', description: 'Explore NexHSE safety, training, fire and environmental projects and see how practical HSE solutions are applied across real operating environments.' },
  accreditations: { title: 'NexHSE Accreditations, Compliance & Professional Credentials', description: "Explore NexHSE's verified regulatory registrations, professional affiliations, certifications and workplace safety credentials." },
  testimonials: { title: 'NexHSE Client Testimonials | Workplace Safety & Training', description: 'Read verified feedback from organisations working with NexHSE across workplace safety, training, auditing and professional development.' },
  knowledge: { title: 'HSE Knowledge Hub | Workplace Safety & Compliance Kenya | NexHSE', description: 'Practical HSE insights, workplace safety guidance, fire safety information, risk management, environmental compliance and professional development from NexHSE.' },
  contact: { title: 'Contact NexHSE Africa | Workplace Safety & HSE Support Kenya', description: 'Contact NexHSE Africa for workplace safety audits, risk assessment, fire safety, training, environmental services, consultations and quotations.' },
};

function Seo({ page = 'home', title, description }: { page?: string; title?: string; description?: string }) {
  useEffect(() => {
    const details = meta[page] ?? meta.home;
    const finalTitle = title ?? details.title;
    const finalDescription = description ?? details.description;
    const canonicalUrl = `https://nexhse.co.ke${window.location.pathname}`;
    document.title = finalTitle;
    const set = (name: string, content: string) => {
      let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
      if (!el) { el = document.createElement('meta'); el.name = name; document.head.appendChild(el); }
      el.content = content;
    };
    const setProperty = (property: string, content: string) => {
      let el = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement | null;
      if (!el) { el = document.createElement('meta'); el.setAttribute('property', property); document.head.appendChild(el); }
      el.content = content;
    };
    set('description', finalDescription); set('robots', 'index, follow'); set('twitter:card', 'summary_large_image'); set('twitter:title', finalTitle); set('twitter:description', finalDescription); set('twitter:image', 'https://nexhse.co.ke/logo.png');
    setProperty('og:title', finalTitle); setProperty('og:description', finalDescription); setProperty('og:type', page === 'knowledge' && title ? 'article' : 'website'); setProperty('og:url', canonicalUrl); setProperty('og:site_name', 'NexHSE Africa'); setProperty('og:locale', 'en_KE'); setProperty('og:image', 'https://nexhse.co.ke/logo.png');
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.appendChild(canonical); }
    canonical.href = canonicalUrl;
    let structuredData = document.querySelector('#nexhse-structured-data') as HTMLScriptElement | null;
    if (!structuredData) { structuredData = document.createElement('script'); structuredData.id = 'nexhse-structured-data'; structuredData.type = 'application/ld+json'; document.head.appendChild(structuredData); }
    structuredData.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': [
        { '@type': 'Organization', '@id': 'https://nexhse.co.ke/#organization', name: 'NexHSE Africa', url: 'https://nexhse.co.ke/', logo: 'https://nexhse.co.ke/logo.png', email, telephone: '+254705065852', address: { '@type': 'PostalAddress', streetAddress: 'Rock Centre, Outer Ring Road', addressCountry: 'KE' }, areaServed: 'Africa', knowsAbout: ['Workplace health and safety', 'Risk assessment', 'Fire safety', 'Environmental compliance', 'HSE training'] },
        { '@type': 'WebSite', '@id': 'https://nexhse.co.ke/#website', name: 'NexHSE Africa', url: 'https://nexhse.co.ke/', publisher: { '@id': 'https://nexhse.co.ke/#organization' }, inLanguage: 'en-KE' },
        { '@type': 'WebPage', '@id': `${canonicalUrl}#webpage`, url: canonicalUrl, name: finalTitle, description: finalDescription, isPartOf: { '@id': 'https://nexhse.co.ke/#website' }, about: { '@id': 'https://nexhse.co.ke/#organization' }, inLanguage: 'en-KE' },
      ],
    });
  }, [page, title, description]);
  return null;
}

function Logo({ light = false }: { light?: boolean }) {
  return <Link href="/" className={`flex items-center gap-2 focus-ring ${light ? 'text-white' : 'text-[hsl(var(--primary))]'}`} data-testid="link-logo" aria-label="NexHSE Africa home">
    <img src={nexhseLogo} alt="NexHSE Africa — Safety & Growth" className="h-14 w-14 object-contain sm:h-16 sm:w-16" />
  </Link>;
}

function Navbar() {
  const [open, setOpen] = useState(false);
  const [location] = useLocation();
  const links = [['About', '/about'], ['Services', '/services'], ['Training', '/training'], ['Projects', '/projects'], ['Knowledge', '/knowledge'], ['Contact', '/contact']];
  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [open]);
  return <header className="relative z-40 border-b border-[hsl(var(--border)/.7)] bg-[hsl(var(--background)/.93)] backdrop-blur-md">
    <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 lg:px-8">
      <Logo />
      <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary navigation">
        {links.map(([label, href]) => { const isCurrent = location === href || location.startsWith(`${href}/`); return <Link key={href} href={href} className={`focus-ring text-[13px] font-semibold transition-colors hover:text-[hsl(var(--primary))] ${isCurrent ? 'text-[hsl(var(--primary))]' : 'text-[hsl(var(--muted-foreground))]'}`} aria-current={isCurrent ? 'page' : undefined} data-testid={`link-nav-${label.toLowerCase()}`}>{label}</Link>; })}
      </nav>
      <div className="hidden items-center gap-3 lg:flex">
        <a href="https://wa.me/254705065852" target="_blank" rel="noreferrer" className="focus-ring flex min-h-11 items-center gap-2 rounded-full border border-[hsl(var(--border))] px-4 text-[12px] font-bold text-[hsl(var(--primary))] transition-colors hover:border-[hsl(var(--accent))] hover:text-[hsl(var(--accent))]" data-testid="link-whatsapp"><span className="h-2 w-2 rounded-full bg-[hsl(var(--accent))]" /> WhatsApp</a>
        <Link href="/request-a-quote" className="focus-ring flex min-h-11 items-center gap-2 rounded-full bg-[hsl(var(--primary))] px-5 text-[12px] font-bold tracking-wide text-white transition-transform hover:-translate-y-0.5" data-testid="link-header-quote">Request a quote <ArrowUpRight size={15} /></Link>
      </div>
       <button onClick={() => setOpen(!open)} className="mobile-menu-toggle focus-ring relative grid h-11 w-11 place-items-center rounded-full border border-[hsl(var(--border))] transition-[transform,background-color,border-color] duration-700 ease-[cubic-bezier(.16,1,.3,1)] hover:border-[hsl(var(--accent)/.55)] hover:bg-[hsl(var(--secondary)/.55)] lg:hidden" aria-label={open ? 'Close navigation' : 'Open navigation'} aria-expanded={open} data-testid="button-mobile-menu">
         <span className={`hamburger-aura ${open ? 'is-open' : ''}`} aria-hidden="true"><span /><span /></span>
         <span className={`hamburger-mark ${open ? 'is-open' : ''}`} aria-hidden="true"><span /><span /><span /></span>
      </button>
    </div>
    <nav className={`mobile-nav lg:hidden ${open ? 'is-open' : ''}`} aria-label="Mobile navigation" aria-hidden={!open}>
      <MobileNavSlideshow />
       <div className="mobile-nav-organic-lines" aria-hidden="true"><span /><span /><span /></div>
      <div className="mobile-nav-content relative z-10 px-5 py-4">
        {links.map(([label, href]) => { const isCurrent = location === href || location.startsWith(`${href}/`); return <Link onClick={() => setOpen(false)} key={href} href={href} className={`mobile-nav-link focus-ring flex min-h-12 items-center justify-between border-b border-[hsl(var(--border)/.65)] text-sm font-semibold ${isCurrent ? 'is-current' : ''}`} aria-current={isCurrent ? 'page' : undefined} data-testid={`link-mobile-${label.toLowerCase()}`}><span>{label}</span><ChevronRight size={16} className="text-[hsl(var(--accent))]" /></Link>; })}
        <Link onClick={() => setOpen(false)} href="/request-a-quote" className="mobile-nav-quote focus-ring mt-4 flex min-h-12 items-center justify-center rounded-full bg-[hsl(var(--primary))] font-bold text-white" data-testid="link-mobile-quote">Request a quote <ArrowUpRight size={16} className="ml-2" /></Link>
      </div>
    </nav>
  </header>;
}

function MobileActions() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    let settleTimer: number | undefined;
    const handleScroll = () => {
      setVisible(false);
      if (settleTimer) window.clearTimeout(settleTimer);
      settleTimer = window.setTimeout(() => setVisible(true), 220);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (settleTimer) window.clearTimeout(settleTimer);
    };
  }, []);

  return <div className={`fixed inset-x-3 bottom-3 z-30 grid grid-cols-3 overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card)/.94)] p-1 shadow-[0_12px_40px_rgba(15,52,68,.18)] backdrop-blur transition-all duration-200 md:hidden ${visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-[calc(100%+1rem)] opacity-0'}`} aria-hidden={!visible}>
    <a href="https://wa.me/254705065852" target="_blank" rel="noreferrer" className="focus-ring flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-xl text-[10px] font-bold text-[hsl(var(--accent))]" data-testid="link-sticky-whatsapp"><span className="text-xs">WhatsApp</span></a>
    <a href={`tel:${phone.replaceAll(' ', '')}`} className="focus-ring flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-xl text-[10px] font-bold text-[hsl(var(--primary))]" data-testid="link-sticky-call"><Phone size={15} /><span>Call</span></a>
    <Link href="/request-a-quote" className="focus-ring flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-xl bg-[hsl(var(--primary))] text-[10px] font-bold text-white" data-testid="link-sticky-quote"><ArrowUpRight size={15} /><span>Quote</span></Link>
  </div>;
}

function Footer() {
  return <footer className="site-footer relative isolate overflow-hidden bg-[hsl(var(--primary))] pb-28 pt-16 text-white md:pb-10">
    <FooterSlideshow />
    <div className="relative z-10 mx-auto max-w-7xl px-5 lg:px-8">
      <div className="grid gap-12 border-b border-white/15 pb-12 lg:grid-cols-[1.5fr_1fr_1fr_1.2fr]">
        <div><Logo light /><p className="mt-6 max-w-sm text-sm leading-7 text-white/65">Workplace safety and professional development for organisations building stronger, safer ways of working across Africa.</p><span className="mt-6 inline-flex items-center gap-2 rounded-full border border-[hsl(var(--accent)/.5)] px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-[hsl(var(--secondary))]"><span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--accent))]" /> Safety first</span></div>
        <FooterList title="Explore" links={[['About', '/about'], ['Services', '/services'], ['Training', '/training'], ['Projects', '/projects'], ['Knowledge', '/knowledge']]} />
        <FooterList title="Start a conversation" links={[['Contact', '/contact'], ['Request a quote', '/request-a-quote'], ['Accreditations', '/accreditations'], ['Testimonials', '/testimonials']]} />
        <div><p className="mono-label text-[10px] text-[hsl(var(--secondary))]">CONTACT</p><address className="mt-5 space-y-4 text-sm not-italic text-white/75"><a href="https://maps.google.com/?q=Rock+Centre+Outer+Ring+Road" className="focus-ring flex items-start gap-3" data-testid="link-footer-address"><MapPin size={17} className="mt-0.5 shrink-0 text-[hsl(var(--accent))]" />Rock Centre, Outer Ring Road</a><a href={`tel:${phone.replaceAll(' ', '')}`} className="focus-ring flex items-center gap-3" data-testid="link-footer-phone"><Phone size={16} className="text-[hsl(var(--accent))]" />{phone}</a><a href={`mailto:${email}`} className="focus-ring flex items-center gap-3" data-testid="link-footer-email"><Mail size={16} className="text-[hsl(var(--accent))]" />{email}</a></address></div>
      </div>
      <div className="flex flex-col gap-3 pt-6 text-[11px] text-white/45 sm:flex-row sm:items-center sm:justify-between"><span>© {new Date().getFullYear()} NexHSE Africa. Content subject to confirmation.</span><span>Privacy · Terms · Accessibility</span></div>
    </div>
  </footer>;
}

function FooterSlideshow() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrent(index => (index + 1) % heroSlides.length);
    }, 8500);
    return () => window.clearInterval(timer);
  }, []);

  return <div className="footer-slideshow" aria-hidden="true">
    {heroSlides.map((slide, index) => <img key={slide.label} src={slide.image} alt="" className={`footer-slideshow-image ${index === current ? 'is-active' : ''}`} />)}
    <div className="footer-slideshow-blur" />
    <div className="footer-slideshow-wash" />
  </div>;
}

function MobileNavSlideshow() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrent(index => (index + 1) % heroSlides.length);
    }, 5200);
    return () => window.clearInterval(timer);
  }, []);

  return <div className="mobile-nav-slideshow" aria-hidden="true">
    {heroSlides.map((slide, index) => <img key={slide.label} src={slide.image} alt="" className={`mobile-nav-slideshow-image ${index === current ? 'is-active' : ''}`} />)}
    <div className="mobile-nav-slideshow-wash" />
  </div>;
}

function FooterList({ title, links }: { title: string; links: string[][] }) {
  return <div><p className="mono-label text-[10px] text-[hsl(var(--secondary))]">{title}</p><div className="mt-5 space-y-3">{links.map(([label, href]) => <Link href={href} key={href} className="focus-ring block w-fit text-sm text-white/70 transition-colors hover:text-white" data-testid={`link-footer-${label.toLowerCase().replaceAll(' ', '-')}`}>{label}</Link>)}</div></div>;
}

function Shell({ children }: { children: ReactNode }) {
  return <div className="grain min-h-[100dvh]"><Navbar />{children}<Footer /><MobileActions /></div>;
}

function Breadcrumbs({ items }: { items: string[][] }) {
  return <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-2 text-[11px] font-semibold text-[hsl(var(--muted-foreground))]"><Link href="/" className="focus-ring hover:text-[hsl(var(--accent))]" data-testid="link-breadcrumb-home">Home</Link>{items.map(([label, href]) => <span key={label} className="flex items-center gap-2"><ChevronRight size={12} /><Link href={href} className="focus-ring hover:text-[hsl(var(--accent))]" data-testid={`link-breadcrumb-${label.toLowerCase().replaceAll(' ', '-')}`}>{label}</Link></span>)}</nav>;
}

function OrganicBackdrop({ dark = false, vivid = false }: { dark?: boolean; vivid?: boolean }) {
  return <div className={`organic-backdrop ${dark ? 'organic-backdrop--dark' : ''} ${vivid ? 'organic-backdrop--vivid' : ''}`} aria-hidden="true"><span /><span /><span /><span /><span /></div>;
}

function OrganicImage({ src, alt, className = '', variant = 'quiet', loading = 'lazy' }: { src: string; alt: string; className?: string; variant?: 'quiet' | 'dark'; loading?: 'lazy' | 'eager' }) {
  return <div className={`organic-image organic-image--${variant} ${className}`}><img src={src} alt={alt} loading={loading} /></div>;
}

const heroSlides = [
  { image: heroImage, alt: 'Safety professionals in protective equipment during a practical construction-site training session', label: 'FIELD PRACTICE', caption: 'Learning where the work happens.' },
  { image: trainingImage, alt: 'Workplace safety learners gathered for a classroom training session', label: 'BUILD CAPABILITY', caption: 'Knowledge that travels back to the workplace.' },
  { image: heightsImage, alt: 'Safety professionals demonstrating ladder and harness procedures at height', label: 'CONTROL EXPOSURE', caption: 'Practical decisions for changing conditions.' },
  { image: fireImage, alt: 'Two workplace trainees operating a fire extinguisher during a practical exercise', label: 'PREPARE TO RESPOND', caption: 'Calm response starts before the emergency.' },
];

function HeroSlideshow() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const touchStart = useRef<number | null>(null);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const syncMotionPreference = () => setReducedMotion(media.matches);
    syncMotionPreference();
    media.addEventListener?.('change', syncMotionPreference);
    return () => media.removeEventListener?.('change', syncMotionPreference);
  }, []);

  useEffect(() => {
    if (paused || reducedMotion) return;
    const timer = window.setInterval(() => setCurrent(index => (index + 1) % heroSlides.length), 6200);
    return () => window.clearInterval(timer);
  }, [paused, reducedMotion]);

  const goTo = (index: number) => setCurrent((index + heroSlides.length) % heroSlides.length);
  const goPrevious = () => goTo(current - 1);
  const goNext = () => goTo(current + 1);

  return <div
    className="absolute inset-0 z-0 overflow-hidden"
    role="region"
    aria-roledescription="carousel"
    aria-label="NexHSE field practice"
    data-testid="region-hero-slideshow"
    onMouseEnter={() => setPaused(true)}
    onMouseLeave={() => setPaused(false)}
    onFocusCapture={() => setPaused(true)}
    onBlurCapture={event => {
      const next = event.relatedTarget as Node | null;
      if (!next || !event.currentTarget.contains(next)) setPaused(false);
    }}
    onTouchStart={event => { touchStart.current = event.touches[0]?.clientX ?? null; }}
    onTouchEnd={event => {
      if (touchStart.current === null) return;
      const distance = (event.changedTouches[0]?.clientX ?? touchStart.current) - touchStart.current;
      if (Math.abs(distance) > 42) distance > 0 ? goPrevious() : goNext();
      touchStart.current = null;
    }}
  >
    {heroSlides.map((slide, index) => <img
      key={slide.label}
      src={slide.image}
      alt={index === current ? slide.alt : ''}
      aria-hidden={index !== current}
      className={`hero-slide-image absolute inset-0 h-full w-full object-cover object-center ${index === current ? 'scale-100 opacity-55' : 'scale-105 opacity-0'}`}
    />)}
    <div className="organic-wash" />
    <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-4 lg:bottom-8 lg:left-auto lg:right-8 lg:w-[330px]">
      <div aria-live="polite">
        <p className="mono-label text-[9px] text-[hsl(var(--secondary))]">{heroSlides[current].label}</p>
        <p className="mt-1 text-xs text-white/70" data-testid="text-hero-slide-caption">{heroSlides[current].caption}</p>
      </div>
      <div className="flex items-center gap-2">
        <button type="button" onClick={goPrevious} className="focus-ring grid h-10 w-10 place-items-center rounded-full border border-white/30 bg-[hsl(var(--primary)/.32)] text-white backdrop-blur-sm transition-colors hover:bg-white/15" aria-label="Previous hero image" data-testid="button-hero-previous"><ChevronLeft size={17} /></button>
        <button type="button" onClick={goNext} className="focus-ring grid h-10 w-10 place-items-center rounded-full border border-white/30 bg-[hsl(var(--primary)/.32)] text-white backdrop-blur-sm transition-colors hover:bg-white/15" aria-label="Next hero image" data-testid="button-hero-next"><ChevronRight size={17} /></button>
      </div>
    </div>
    <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-2 lg:bottom-9 lg:left-8 lg:translate-x-0" aria-label="Choose hero image">
      {heroSlides.map((slide, index) => <button key={slide.label} type="button" onClick={() => goTo(index)} className="focus-ring flex h-7 w-7 items-center justify-center" aria-label={`Show hero image ${index + 1}`} aria-current={index === current ? 'true' : undefined} data-testid={`button-hero-indicator-${index}`}><span className={`block h-1.5 rounded-full transition-all ${index === current ? 'w-7 bg-[hsl(var(--accent))]' : 'w-2 bg-white/50'}`} /></button>)}
    </div>
  </div>;
}

function PageIntro({ eyebrow, title, text, image }: { eyebrow: string; title: string; text: string; image?: string }) {
  return <section className="relative overflow-hidden bg-[hsl(var(--primary))] text-white"><OrganicBackdrop dark /><div className="relative mx-auto grid max-w-7xl items-end gap-10 px-5 pb-16 pt-14 lg:grid-cols-[1.2fr_.8fr] lg:px-8 lg:pb-20 lg:pt-20"><div className="reveal"><p className="mono-label mb-5 text-[10px] text-[hsl(var(--secondary))]">{eyebrow}</p><h1 className="display max-w-3xl text-5xl leading-[1.02] tracking-[-.045em] sm:text-6xl">{title}</h1><p className="mt-6 max-w-xl text-base leading-7 text-white/70">{text}</p></div>{image && <OrganicImage src={image} alt="NexHSE professionals learning and applying workplace safety practice" variant="dark" className="reveal reveal-delay-1 relative h-52 border border-white/20 lg:h-64" />}<span className="absolute bottom-5 left-5 mono-label text-[9px] text-white/75 lg:bottom-7 lg:left-auto lg:right-8">FIELD / PRACTICE / PEOPLE</span></div><div className="pointer-events-none absolute -right-24 -top-40 h-96 w-96 rounded-full border border-[hsl(var(--accent)/.3)]" /></section>;
}

function SectionHeader({ eyebrow, title, text, action }: { eyebrow: string; title: string; text?: string; action?: ReactNode }) {
  return <div className="mb-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between"><div><p className="mono-label text-[10px] font-bold text-[hsl(var(--accent))]">{eyebrow}</p><h2 className="display mt-3 max-w-2xl text-4xl leading-[1.08] tracking-[-.04em] text-[hsl(var(--primary))] sm:text-5xl">{title}</h2>{text && <p className="mt-4 max-w-xl text-sm leading-7 text-[hsl(var(--muted-foreground))]">{text}</p>}</div>{action}</div>;
}

function TrustStrip() {
  return <section className="border-b border-[hsl(var(--border))] bg-[hsl(var(--card))]"><div className="mx-auto max-w-7xl px-5 py-8 lg:px-8"><div className="grid gap-6 sm:grid-cols-3 lg:grid-cols-5">{[['01', 'Organisations served', 'Tailored HSE support'], ['02', 'Professionals trained', 'Practical team learning'], ['03', 'Years of experience', 'Risk-led decision making'], ['04', 'Industries supported', 'Cross-sector perspective'], ['05', 'Credentials', 'Verified on request']].map(([n, label, value]) => <div key={n} className="flex items-start gap-3 border-l-2 border-[hsl(var(--accent)/.4)] pl-4"><span className="mono-label text-[10px] text-[hsl(var(--accent))]">{n}</span><div><p className="text-[11px] font-bold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">{label}</p><p className="mt-1 text-xs text-[hsl(var(--primary))]">{value}</p></div></div>)}</div></div></section>;
}

function ServiceCard({ service, compact = false }: { service: Service; compact?: boolean }) {
  const Icon = service.icon;
  return <Link href={`/services/${service.slug}`} className={`group focus-ring relative block overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] transition-all duration-300 hover:-translate-y-1 hover:border-[hsl(var(--accent)/.65)] hover:shadow-[0_18px_45px_rgba(20,70,76,.12)] ${compact ? '' : 'min-h-[270px]'}`} data-testid={`card-service-${service.slug}`}>
     <OrganicImage src={service.image} alt="" className="service-card-image pointer-events-none absolute right-0 top-0 h-40 w-40 opacity-[.24] transition-all duration-700 group-hover:scale-110 group-hover:opacity-[.38]" />
    <div className="relative flex min-h-[270px] flex-col p-6"><div className="flex items-start justify-between"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[hsl(var(--secondary))] text-[hsl(var(--accent))]"><Icon size={19} /></span><span className="mono-label text-[10px] text-[hsl(var(--muted-foreground))]">{service.number}</span></div><div className="pt-10"><p className="text-[10px] font-bold uppercase tracking-widest text-[hsl(var(--accent))]">{service.group} · {service.type.split(' / ')[0]}</p><h3 className="mt-2 text-xl font-bold tracking-tight text-[hsl(var(--primary))]">{service.title}</h3><p className="mt-2 max-w-xs text-sm leading-6 text-[hsl(var(--muted-foreground))]">{service.short}</p><span className="mt-5 inline-flex items-center gap-2 text-xs font-bold text-[hsl(var(--primary))]">Explore service <ArrowUpRight size={15} className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" /></span></div></div>
  </Link>;
}

function Home() {
  const [solve, setSolve] = useState('I need to reduce workplace risk');
  const recommendations = useMemo(() => {
    if (solve.includes('fire')) return services.filter(s => ['fire-audits', 'fire-safety-training'].includes(s.slug));
    if (solve.includes('training')) return services.filter(s => s.type.startsWith('Training')).slice(0, 3);
    if (solve.includes('environmental')) return services.filter(s => s.group === 'Sustain');
    if (solve.includes('audit')) return services.filter(s => s.type.startsWith('Consulting'));
    if (solve.includes('programme')) return services.filter(s => ['safety-health-audits', 'osh-committee-training', 'environmental-awareness-training'].includes(s.slug));
    return services.filter(s => ['risk-assessment', 'safety-health-audits', 'osh-committee-training'].includes(s.slug));
  }, [solve]);
  return <Shell><Seo /><main className="home-page">
    <section className="relative isolate overflow-hidden bg-[hsl(var(--primary))] text-white"><HeroSlideshow /><OrganicBackdrop dark /><div className="relative z-10 mx-auto grid min-h-[650px] max-w-7xl items-end gap-12 px-5 pb-16 pt-20 lg:grid-cols-[1.1fr_.9fr] lg:px-8 lg:pb-24"><div className="reveal"><p className="mono-label mb-6 flex items-center gap-3 text-[10px] text-[hsl(var(--secondary))]"><span className="h-px w-8 bg-[hsl(var(--accent))]" />Workplace health, safety & environmental support</p><h1 className="display max-w-3xl text-[3.6rem] leading-[.98] tracking-[-.055em] sm:text-7xl lg:text-[5.8rem]">Building safer,<br /><em className="font-medium text-[hsl(var(--secondary))]">smarter</em> & more<br />compliant workplaces.</h1><p className="mt-8 max-w-lg text-base leading-7 text-white/75">NexHSE helps organisations across Kenya and Africa protect people, manage workplace risk and build practical safety capability through audits, training and environmental support.</p><div className="mt-9 flex flex-wrap gap-3"><Link href="/request-a-quote" className="focus-ring flex min-h-12 items-center gap-3 rounded-full bg-[hsl(var(--accent))] px-6 text-sm font-bold text-white transition-transform hover:-translate-y-0.5" data-testid="link-hero-quote">Request a quote <ArrowUpRight size={17} /></Link><Link href="/training" className="focus-ring flex min-h-12 items-center gap-3 rounded-full border border-white/35 px-6 text-sm font-bold text-white transition-colors hover:bg-white/10" data-testid="link-hero-training">Explore training <ChevronRight size={16} /></Link></div></div><div className="reveal reveal-delay-2 hidden justify-end lg:flex"><div className="w-72 rounded-2xl border border-white/20 bg-[hsl(var(--primary)/.5)] p-5 backdrop-blur-md"><p className="mono-label text-[9px] text-[hsl(var(--secondary))]">THE NEXHSE STANDARD</p><div className="mt-12 flex items-end justify-between border-b border-white/20 pb-4"><span className="display text-5xl">01</span><span className="text-right text-xs leading-5 text-white/65">Translate regulation<br />into everyday practice.</span></div><p className="pt-4 text-xs leading-5 text-white/65">Technical competence is only useful when it changes what happens on the ground.</p></div></div></div><div className="absolute bottom-7 right-8 z-10 hidden items-center gap-3 text-[10px] text-white/55 lg:flex"><span className="h-px w-12 bg-white/35" />Scroll to explore</div></section>
     <TrustStrip />
     <section className="relative overflow-hidden px-5 py-24 lg:px-8 lg:py-32"><div className="grid-line pointer-events-none absolute inset-0 opacity-40" /><div className="relative mx-auto grid max-w-7xl gap-14 lg:grid-cols-[.8fr_1.2fr]"><div><p className="mono-label text-[10px] text-[hsl(var(--accent))]">The NexHSE idea</p><h2 className="display mt-5 max-w-lg text-5xl leading-[1.03] tracking-[-.05em] text-[hsl(var(--primary))] sm:text-6xl">Safety is not an expense.<br /><span className="text-[hsl(var(--accent))]">It is an investment.</span></h2></div><div className="lg:pt-10"><p className="max-w-xl text-lg leading-8 text-[hsl(var(--muted-foreground))]">Good safety work is not a binder on a shelf. It is the confidence to make better decisions, the systems that prevent loss and the capability to respond when conditions change.</p><div className="mt-10 grid gap-0 border-t border-[hsl(var(--border))] sm:grid-cols-2">{[['01', 'Protect people', 'Put human protection at the centre of every operational decision.'], ['02', 'Reduce risk', 'Make hazards visible, then make the next control practical.'], ['03', 'Strengthen compliance', 'Turn regulatory responsibility into everyday practice.'], ['04', 'Develop capability', 'Build the people and habits that keep safety moving.']].map(([n, t, d]) => <div key={n} className="border-b border-[hsl(var(--border))] py-6 pr-5"><span className="mono-label text-[10px] text-[hsl(var(--accent))]">{n}</span><h3 className="mt-3 font-bold text-[hsl(var(--primary))]">{t}</h3><p className="mt-2 text-sm leading-6 text-[hsl(var(--muted-foreground))]">{d}</p></div>)}</div></div></div></section>
     <section className="bg-[hsl(var(--secondary)/.55)] px-5 py-24 lg:px-8"><div className="mx-auto max-w-7xl"><SectionHeader eyebrow="What we do" title="A practical route from concern to control." text="Explore the right entry point for your organisation. Our offering brings assessment, protection, development and environmental responsibility together." action={<Link href="/services" className="focus-ring flex w-fit items-center gap-2 text-sm font-bold text-[hsl(var(--primary))]" data-testid="link-home-services">View all services <ArrowUpRight size={16} /></Link>} /><div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">{[['ASSESS', 'See what is happening', 'Audits and risk assessment that make priorities clearer.', 'safety-health-audits'], ['PROTECT', 'Prepare for what matters', 'Fire safety and workplace protection for real conditions.', 'fire-audits'], ['DEVELOP', 'Build capability', 'Practical training for the people who make safety possible.', 'osh-committee-training'], ['SUSTAIN', 'Think beyond today', 'Environmental support for responsible operations.', 'environmental-audits']].map(([eyebrow, title, text, slug], i) => <Link href={`/services/${slug}`} key={eyebrow} className="group focus-ring rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 transition-transform hover:-translate-y-1" data-testid={`card-home-group-${i}`}><span className="mono-label text-[10px] text-[hsl(var(--accent))]">{eyebrow}</span><h3 className="mt-14 text-xl font-bold text-[hsl(var(--primary))]">{title}</h3><p className="mt-2 text-sm leading-6 text-[hsl(var(--muted-foreground))]">{text}</p><span className="mt-8 grid h-9 w-9 place-items-center rounded-full bg-[hsl(var(--primary))] text-white transition-transform group-hover:translate-x-1"><ArrowUpRight size={15} /></span></Link>)}</div></div></section>
      <section className="home-projects-section relative overflow-hidden px-5 py-16 lg:px-8 lg:py-20">
       <div className="home-projects-wash" aria-hidden="true">
          <span className="home-projects-shape home-projects-shape--teal" />
         <span className="home-projects-shape home-projects-shape--lime" />
         <span className="home-projects-shape home-projects-shape--mint" />
         <span className="home-projects-shape home-projects-shape--olive" />
         <span className="home-projects-shape home-projects-shape--pink" />
         <span className="home-projects-shape home-projects-shape--cream" />
       </div>
       <div className="relative z-10 mx-auto max-w-7xl">
         <div className="home-projects-header mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
           <div>
               <p className="mono-label text-[10px] font-bold text-[hsl(var(--primary))]">Proof of work</p>
               <h2 className="display mt-3 max-w-2xl text-4xl leading-[1.08] tracking-[-.04em] text-[hsl(var(--primary))] sm:text-5xl">Real work. Real environments. Real outcomes.</h2>
           </div>
             <p className="max-w-xl text-sm leading-7 text-[hsl(var(--primary)/.72)]">Case studies and project stories will be published here as content is approved for release.</p>
         </div>
         <div className="home-projects-grid grid gap-5 lg:grid-cols-[1.35fr_.65fr]">
           <div className="home-projects-feature relative min-h-[370px] overflow-hidden">
             <img src={fieldImage} alt="Safety team walking through a working agricultural environment" loading="lazy" />
             <div className="home-projects-feature-shade" />
             <div className="home-projects-feature-copy">
                 <span className="mono-label text-[10px] text-[hsl(var(--secondary))]">FEATURED CASE STUDY</span>
                 <h3 className="display mt-3 max-w-md text-3xl text-white">Project stories are coming soon.</h3>
                 <p className="mt-3 max-w-md text-sm text-white/70">We will share authorised project details, context and outcomes here.</p>
             </div>
           </div>
           <div className="home-projects-side flex min-h-[370px] flex-col justify-between">
             <div>
               <BriefcaseBusiness className="home-projects-side-icon" />
                 <p className="mono-label mt-14 text-[10px] font-bold text-[hsl(var(--primary))]">Content discipline</p>
                 <h3 className="mt-3 text-2xl font-bold text-[hsl(var(--primary))]">No invented claims.</h3>
                 <p className="mt-3 max-w-xs text-sm leading-6 text-[hsl(var(--primary)/.72)]">Only verified clients, environments and outcomes will make it onto this page.</p>
             </div>
             <Link href="/projects" className="focus-ring mt-8 flex w-fit items-center gap-2 text-sm font-bold text-[hsl(var(--primary))]" data-testid="link-home-projects">View projects <ArrowUpRight size={16} /></Link>
           </div>
         </div>
       </div>
     </section>
      <section className="px-5 py-24 lg:px-8 lg:py-32"><div className="mx-auto max-w-7xl"><SectionHeader eyebrow="Interactive service discovery" title="What are you trying to solve?" text="Start with the operational question. We will point you toward the most relevant NexHSE services." /><div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr]"><div className="space-y-2">{['I need to reduce workplace risk', 'I need a safety audit', 'I need fire safety support', 'I need employee training', 'I need environmental compliance support', 'I need to strengthen our HSE programme'].map(item => <button key={item} onClick={() => setSolve(item)} className={`focus-ring flex min-h-14 w-full items-center justify-between rounded-xl border px-5 text-left text-sm font-bold transition-colors ${solve === item ? 'border-[hsl(var(--accent))] bg-[hsl(var(--secondary))] text-[hsl(var(--primary))]' : 'border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:border-[hsl(var(--accent)/.6)]'}`} data-testid={`button-solve-${item.toLowerCase().replaceAll(' ', '-')}`}>{item}<ChevronRight size={17} className={solve === item ? 'text-[hsl(var(--accent))]' : ''} /></button>)}</div><div className="rounded-2xl bg-[hsl(var(--primary))] p-6 text-white sm:p-8"><div className="flex items-center justify-between border-b border-white/15 pb-5"><div><p className="mono-label text-[9px] text-[hsl(var(--secondary))]">RECOMMENDED STARTING POINT</p><h3 className="mt-2 text-lg font-bold">{solve}</h3></div><Sparkles size={20} className="text-[hsl(var(--secondary))]" /></div><div className="mt-5 grid gap-3">{recommendations.map(s => <Link href={`/services/${s.slug}`} key={s.slug} className="focus-ring group flex items-center gap-4 rounded-xl border border-white/15 bg-white/5 p-4 transition-colors hover:bg-white/10" data-testid={`link-recommendation-${s.slug}`}><span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[hsl(var(--accent))]"><s.icon size={16} /></span><span className="flex-1"><strong className="block text-sm">{s.title}</strong><small className="mt-1 block text-xs text-white/55">{s.type}</small></span><ArrowUpRight size={16} className="text-[hsl(var(--secondary))]" /></Link>)}</div></div></div></div></section>
      <section className="bg-[hsl(var(--primary))] px-5 py-24 text-white lg:px-8 lg:py-28"><div className="mx-auto max-w-7xl"><div className="grid gap-10 lg:grid-cols-[1fr_1.25fr] lg:items-center"><div><p className="mono-label text-[10px] text-[hsl(var(--secondary))]">Training & development</p><h2 className="display mt-4 text-5xl leading-[1.04] tracking-[-.045em] sm:text-6xl">Develop the people who make safety possible.</h2><p className="mt-6 max-w-md text-sm leading-7 text-white/65">Professional development should change behaviour beyond the classroom. Explore a catalogue prepared for practical, workplace-relevant learning.</p><Link href="/training" className="focus-ring mt-8 inline-flex min-h-12 items-center gap-3 rounded-full border border-white/30 px-5 text-sm font-bold hover:bg-white/10" data-testid="link-home-training">Explore the catalogue <ArrowUpRight size={16} /></Link></div><div className="relative h-[350px] overflow-hidden rounded-[2rem]"><img src={trainingImage} alt="NexHSE training session with workers learning in a classroom" loading="lazy" className="h-full w-full object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-[hsl(var(--primary)/.7)] to-transparent" /><div className="absolute bottom-5 left-5 right-5 flex items-end justify-between"><span className="mono-label text-[9px] text-white/75">FIELD-LED LEARNING</span><span className="rounded-full bg-white/15 px-3 py-2 text-[10px] font-bold backdrop-blur">Content catalogue</span></div></div></div></div></section>
      <section className="border-t border-[hsl(var(--border))] px-5 py-24 lg:px-8"><div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[.8fr_1.2fr]"><div><p className="mono-label text-[10px] text-[hsl(var(--accent))]">Safety intelligence</p><h2 className="display mt-4 text-5xl leading-[1.05] tracking-[-.05em] text-[hsl(var(--primary))]">Good decisions need good information.</h2><Link href="/knowledge" className="focus-ring mt-7 inline-flex items-center gap-2 text-sm font-bold text-[hsl(var(--primary))]" data-testid="link-home-knowledge">Explore knowledge <ArrowUpRight size={16} /></Link></div><div className="grid gap-4 sm:grid-cols-2">{[['Safety', 'Workplace risk assessment', 'Practical guidance will be published here.'], ['Fire', 'Fire safety audits', 'Practical guidance will be published here.'], ['Environment', 'Environmental responsibility', 'Practical guidance will be published here.'], ['Training', 'Building safety capability', 'Practical guidance will be published here.']].map(([cat, title, text], i) => <Link href="/knowledge" key={cat} className="focus-ring group rounded-2xl border border-[hsl(var(--border))] p-5 hover:border-[hsl(var(--accent))]" data-testid={`card-insight-${i}`}><div className="flex items-center justify-between"><span className="mono-label text-[10px] text-[hsl(var(--accent))]">{cat}</span><ArrowUpRight size={15} className="text-[hsl(var(--muted-foreground))] transition-transform group-hover:translate-x-1" /></div><h3 className="mt-8 font-bold text-[hsl(var(--primary))]">{title}</h3><p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">{text}</p></Link>)}</div></div></section>
    <QuoteCTA />
  </main></Shell>;
}

function QuoteCTA() {
  return <section className="quote-cta-section px-5 py-12 lg:px-8 lg:py-16"><div className="quote-cta-panel relative isolate mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] border border-white/20 bg-[hsl(var(--primary))] text-white sm:rounded-[3.5rem]"><OrganicBackdrop dark vivid /><div className="relative grid gap-10 px-6 py-12 sm:px-10 lg:grid-cols-[1fr_.72fr] lg:items-center lg:px-16 lg:py-16"><div className="relative z-10"><p className="mono-label text-[10px] text-[hsl(var(--secondary))]">Start a conversation</p><h2 className="display mt-4 max-w-2xl text-5xl leading-[1.02] tracking-[-.045em] sm:text-6xl">Let’s build a safer workplace.</h2><p className="mt-5 max-w-xl text-sm leading-7 text-white/70">Whether you are strengthening an existing safety programme or building one from the ground up, NexHSE is ready to work alongside your team.</p><div className="mt-7 flex flex-wrap items-center gap-5"><Link href="/request-a-quote" className="focus-ring flex min-h-12 items-center gap-2 rounded-full bg-[hsl(var(--accent))] px-5 text-sm font-bold text-white transition-transform hover:-translate-y-0.5" data-testid="link-cta-quote">Request a quote <ArrowUpRight size={16} /></Link><Link href="/contact" className="focus-ring inline-flex items-center gap-2 text-sm font-bold text-white/85 hover:text-white" data-testid="link-cta-consultation">Book a consultation <ChevronRight size={16} /></Link></div></div><div className="quote-cta-visual relative z-10 h-52 w-full sm:h-64 lg:h-72"><img src={trainingImage} alt="NexHSE professionals learning together in a workplace training session" loading="lazy" className="h-full w-full object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-[hsl(var(--primary)/.6)] via-transparent to-transparent" /><span className="absolute bottom-4 left-5 mono-label text-[9px] text-white/75">FIELD-LED / PRACTICAL / PEOPLE</span></div></div></div></section>;
}

function About() {
  return <Shell><Seo page="about" /><main><PageIntro eyebrow="About NexHSE Africa" title="Serious about the work behind safer workplaces." text="NexHSE is a workplace health, safety, environmental and professional-development company serving organisations across Africa." image={trainingImage} /><section className="mx-auto max-w-7xl px-5 py-24 lg:px-8"><Breadcrumbs items={[['About', '/about']]} /><div className="grid gap-14 lg:grid-cols-[.8fr_1.2fr]"><div><p className="mono-label text-[10px] text-[hsl(var(--accent))]">Who we are</p><h2 className="display mt-4 text-5xl leading-[1.05] text-[hsl(var(--primary))]">Technical enough for the system. Human enough for the people.</h2></div><div className="space-y-5 text-base leading-8 text-[hsl(var(--muted-foreground))]"><p>We work around the realities of operating environments: people, equipment, time, responsibility and change. Our role is to help organisations protect people, prevent loss and build workplaces where safety is second nature.</p><p>Our work is anchored in safety culture, risk reduction, regulatory compliance, workplace excellence and continuous improvement.</p></div></div><div className="mt-24 grid gap-5 lg:grid-cols-3"><div className="rounded-2xl bg-[hsl(var(--primary))] p-7 text-white lg:col-span-2"><p className="mono-label text-[10px] text-[hsl(var(--secondary))]">Mission</p><p className="display mt-10 max-w-2xl text-3xl leading-tight">To empower organizations with the knowledge, systems and confidence to protect people, prevent loss, and build workplaces where safety is second nature.</p></div><div className="rounded-2xl border border-[hsl(var(--border))] p-7"><p className="mono-label text-[10px] text-[hsl(var(--accent))]">Vision</p><p className="mt-10 text-xl font-bold leading-8 text-[hsl(var(--primary))]">A future where every workplace across Africa operates on a foundation of safety excellence, professional integrity and continuous growth.</p></div></div></section><section className="bg-[hsl(var(--secondary)/.6)] px-5 py-24 lg:px-8"><div className="mx-auto max-w-7xl"><SectionHeader eyebrow="Our approach" title="Make the right thing easier to do." /><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[['Integrity', 'Be clear, responsible and honest about the work.'], ['Professionalism', 'Bring preparation, respect and discipline to every engagement.'], ['Innovation', 'Keep improving how safety knowledge reaches the workplace.'], ['Excellence', 'Hold the detail to a high standard because the detail matters.'], ['Teamwork', 'Safety is built with people, not delivered at people.'], ['Safety first', 'Keep human protection at the centre of each decision.']].map(([t, d], i) => <div key={t} className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6"><span className="mono-label text-[10px] text-[hsl(var(--accent))]">0{i + 1}</span><h3 className="mt-8 text-lg font-bold text-[hsl(var(--primary))]">{t}</h3><p className="mt-2 text-sm leading-6 text-[hsl(var(--muted-foreground))]">{d}</p></div>)}</div></div></section><section className="mx-auto max-w-7xl px-5 py-24 lg:px-8"><SectionHeader eyebrow="Why NexHSE" title="Built for the reality on the ground." /><div className="grid gap-4 md:grid-cols-2">{['Experienced professionals', 'Practical, field-tested solutions', 'Customized training', 'Compliance-focused delivery', 'Modern safety standards', 'Reliable ongoing support'].map((item, i) => <div key={item} className="flex items-center gap-4 border-b border-[hsl(var(--border))] py-5"><span className="grid h-9 w-9 place-items-center rounded-full bg-[hsl(var(--secondary))] text-[hsl(var(--accent))]"><Check size={17} /></span><span className="font-semibold text-[hsl(var(--primary))]">{item}</span><span className="mono-label ml-auto text-[10px] text-[hsl(var(--muted-foreground))]">0{i + 1}</span></div>)}</div></section><QuoteCTA /></main></Shell>;
}

function Services() {
  const [query, setQuery] = useState(''); const [filter, setFilter] = useState('All');
  const filtered = services.filter(s => (filter === 'All' || s.type.startsWith(filter)) && `${s.title} ${s.short}`.toLowerCase().includes(query.toLowerCase()));
  return <Shell><Seo page="services" /><main><PageIntro eyebrow="Services" title="The right safety work starts with the right question." text="Explore consulting, audits, training and environmental support shaped around your operations, risks and people." image={harnessImage} /><section className="mx-auto max-w-7xl px-5 py-20 lg:px-8"><Breadcrumbs items={[['Services', '/services']]} /><div className="mb-10 flex flex-col gap-4 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 md:flex-row"><label className="flex flex-1 items-center gap-3 rounded-xl bg-[hsl(var(--secondary)/.6)] px-4"><Search size={17} className="text-[hsl(var(--accent))]" /><span className="sr-only">Search services</span><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search services" className="focus-ring min-h-11 w-full bg-transparent text-sm outline-none" data-testid="input-search-services" /></label><div className="flex gap-2 overflow-auto">{['All', 'Consulting', 'Training'].map(f => <button key={f} onClick={() => setFilter(f)} className={`focus-ring min-h-11 whitespace-nowrap rounded-full px-4 text-xs font-bold ${filter === f ? 'bg-[hsl(var(--primary))] text-white' : 'border border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))]'}`} data-testid={`button-filter-services-${f.toLowerCase()}`}>{f === 'All' ? 'All services' : f === 'Consulting' ? 'Consulting / Audit' : 'Training / Development'}</button>)}</div></div><div className="mb-8 flex items-end justify-between"><div><p className="mono-label text-[10px] text-[hsl(var(--accent))]">10 core services</p><h2 className="display mt-2 text-4xl text-[hsl(var(--primary))]">A clear catalogue, not a wall of cards.</h2></div><span className="mono-label text-[10px] text-[hsl(var(--muted-foreground))]">{filtered.length} showing</span></div>{filtered.length ? <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{filtered.map(s => <ServiceCard key={s.slug} service={s} />)}</div> : <EmptyState title="No services match that search." text="Try a broader term or reset the filters." action={() => { setQuery(''); setFilter('All'); }} actionLabel="Reset filters" />}</section></main></Shell>;
}

function ServiceDetail() {
  const { slug = '' } = useParams<{ slug: string }>(); const service = services.find(s => s.slug === slug) ?? services[0]; const [openFaq, setOpenFaq] = useState<number | null>(0); const Icon = service.icon;
  return <Shell><Seo page="services" title={`${service.title} | NexHSE Africa`} description={`${service.title} from NexHSE Africa. Practical workplace health, safety, environmental and professional-development support.`} /><main><section className="bg-[hsl(var(--primary))] text-white"><div className="mx-auto max-w-7xl px-5 pb-16 pt-12 lg:px-8 lg:pb-24 lg:pt-16"><Breadcrumbs items={[['Services', '/services'], [service.title, `/services/${service.slug}`]]} /><div className="grid items-end gap-10 lg:grid-cols-[1.1fr_.9fr]"><div><div className="grid h-12 w-12 place-items-center rounded-xl bg-[hsl(var(--accent))]"><Icon size={22} /></div><p className="mono-label mt-7 text-[10px] text-[hsl(var(--secondary))]">{service.number} / {service.type}</p><h1 className="display mt-4 text-5xl leading-[1.02] tracking-[-.045em] sm:text-7xl">{service.title}</h1><p className="mt-6 max-w-xl text-base leading-7 text-white/70">{service.short}</p><Link href="/request-a-quote" className="focus-ring mt-8 inline-flex min-h-12 items-center gap-2 rounded-full bg-[hsl(var(--accent))] px-5 text-sm font-bold" data-testid="link-service-quote">Discuss this service <ArrowUpRight size={16} /></Link></div><div className="h-72 overflow-hidden rounded-[2rem] border border-white/20"><img src={service.image} alt={`${service.title} in a practical workplace setting`} className="h-full w-full object-cover" /></div></div></div></section><section className="mx-auto max-w-7xl px-5 py-20 lg:px-8"><div className="grid gap-16 lg:grid-cols-[.75fr_1.25fr]"><div className="lg:sticky lg:top-24 lg:h-fit"><p className="mono-label text-[10px] text-[hsl(var(--accent))]">Service brief</p><h2 className="display mt-4 text-4xl leading-tight text-[hsl(var(--primary))]">Clearer decisions.<br />Stronger practice.</h2></div><div className="space-y-12"><InfoBlock title="What it is" text={`A focused ${service.type.toLowerCase()} engagement for organisations that want to understand their context and take practical next steps.`} /><InfoBlock title="Why it matters" text="Safety performance depends on what people can see, understand and act on. A structured approach helps teams move from assumption to informed action." /><InfoBlock title="The NexHSE approach" text="We listen to the operating context, work with the people closest to the risk and keep recommendations grounded in practice. The detail of scope is confirmed with your team before work begins." /><div><p className="mono-label text-[10px] text-[hsl(var(--accent))]">What may be included</p><div className="mt-5 grid gap-3 sm:grid-cols-2">{['Context and scope discussion', 'Practical review of current arrangements', 'Clear observations and priorities', 'Conversation about next steps'].map(item => <div key={item} className="flex gap-3 rounded-xl border border-[hsl(var(--border))] p-4 text-sm text-[hsl(var(--muted-foreground))]"><Check size={17} className="shrink-0 text-[hsl(var(--accent))]" />{item}</div>)}</div><p className="mt-4 text-xs text-[hsl(var(--muted-foreground))]">Final deliverables are confirmed against your organisation’s scope. CONTENT REQUIRED for service-specific technical schedules.</p></div><div><p className="mono-label text-[10px] text-[hsl(var(--accent))]">Frequently asked</p><div className="mt-4 divide-y divide-[hsl(var(--border))] border-y border-[hsl(var(--border))]">{faqs.map((faq, i) => <div key={faq.q}><button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="focus-ring flex min-h-16 w-full items-center justify-between text-left text-sm font-bold text-[hsl(var(--primary))]" aria-expanded={openFaq === i} data-testid={`button-faq-${i}`}><span>{faq.q}</span><ChevronDown size={17} className={`transition-transform ${openFaq === i ? 'rotate-180 text-[hsl(var(--accent))]' : ''}`} /></button>{openFaq === i && <p className="pb-5 pr-8 text-sm leading-6 text-[hsl(var(--muted-foreground))]">{faq.a}</p>}</div>)}</div></div></div></div></section><QuoteCTA /></main></Shell>;
}

function InfoBlock({ title, text }: { title: string; text: string }) { return <div><p className="mono-label text-[10px] text-[hsl(var(--accent))]">{title}</p><p className="mt-4 max-w-2xl text-lg leading-8 text-[hsl(var(--muted-foreground))]">{text}</p></div>; }

function Training() {
  const [filter, setFilter] = useState('All'); const courseServices = services.filter(s => s.type.startsWith('Training')); const shown = filter === 'All' ? courseServices : courseServices.filter(s => filter === 'Statutory' ? ['osh-committee-training', 'first-aid-training', 'fire-safety-training'].includes(s.slug) : filter === 'Technical' ? s.slug === 'work-at-heights-training' : false);
  return <Shell><Seo page="training" /><main><PageIntro eyebrow="Training & development" title="Competence that travels back to the workplace." text="Explore professional development programmes for the people who make safety possible. Course dates, durations and pricing are published only when confirmed." image={trainingImage} /><section className="mx-auto max-w-7xl px-5 py-20 lg:px-8"><Breadcrumbs items={[['Training', '/training']]} /><div className="grid gap-10 lg:grid-cols-[.7fr_1.3fr]"><aside><p className="mono-label text-[10px] text-[hsl(var(--accent))]">Catalogue controls</p><h2 className="display mt-4 text-4xl text-[hsl(var(--primary))]">Find the right learning route.</h2><div className="mt-8 space-y-2">{['All', 'Statutory', 'Technical', 'Management'].map(f => <button key={f} onClick={() => setFilter(f)} className={`focus-ring flex min-h-12 w-full items-center justify-between rounded-xl px-4 text-left text-sm font-bold ${filter === f ? 'bg-[hsl(var(--primary))] text-white' : 'border border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))]'}`} data-testid={`button-filter-training-${f.toLowerCase()}`}>{f}<ChevronRight size={16} /></button>)}</div><div className="mt-8 rounded-2xl bg-[hsl(var(--secondary))] p-5"><Clock3 size={19} className="text-[hsl(var(--accent))]" /><p className="mt-4 text-sm font-bold text-[hsl(var(--primary))]">Dates, delivery mode and duration</p><p className="mt-2 text-xs leading-5 text-[hsl(var(--muted-foreground))]">CONTENT REQUIRED. Tell us what your team needs and we can discuss the next step.</p></div></aside><div><div className="mb-6 flex items-center justify-between"><p className="text-sm text-[hsl(var(--muted-foreground))]">Showing <strong className="text-[hsl(var(--primary))]">{shown.length}</strong> programmes</p><span className="mono-label text-[10px] text-[hsl(var(--muted-foreground))]">Phase 01 catalogue</span></div><div className="grid gap-4 sm:grid-cols-2">{shown.map(s => <CourseCard key={s.slug} service={s} />)}</div></div></div></section><QuoteCTA /></main></Shell>;
}

function CourseCard({ service }: { service: Service }) {
  return <Link href={`/training/${service.slug}`} className="group focus-ring overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]" data-testid={`card-course-${service.slug}`}><OrganicImage src={service.image} alt={`${service.title} training`} className="relative mx-2 mt-2 h-40" /><div className="relative -mt-40 h-40 overflow-hidden rounded-[2rem]"><div className="absolute inset-0 bg-gradient-to-t from-[hsl(var(--primary)/.7)] to-transparent" /><span className="absolute bottom-4 left-4 rounded-full bg-white/15 px-3 py-1 text-[9px] font-bold uppercase tracking-widest text-white backdrop-blur">Content catalogue</span></div><div className="p-5"><p className="mono-label text-[9px] text-[hsl(var(--accent))]">{service.group} / PROFESSIONAL DEVELOPMENT</p><h3 className="mt-3 text-lg font-bold text-[hsl(var(--primary))]">{service.title}</h3><p className="mt-2 text-sm leading-6 text-[hsl(var(--muted-foreground))]">{service.short}</p><div className="mt-5 flex items-center justify-between border-t border-[hsl(var(--border))] pt-4 text-xs font-bold text-[hsl(var(--primary))]"><span>Details & booking</span><ArrowUpRight size={15} /></div></div></Link>;
}

function CourseDetail() {
  const { course = '' } = useParams<{ course: string }>(); const service = services.find(s => s.slug === course && s.type.startsWith('Training')) ?? services[3];
  return <Shell><Seo page="training" title={`${service.title} | NexHSE Africa`} /><main><PageIntro eyebrow="Course detail · Content catalogue" title={service.title} text={service.short} image={service.image} /><section className="mx-auto max-w-7xl px-5 py-20 lg:px-8"><Breadcrumbs items={[['Training', '/training'], [service.title, `/training/${service.slug}`]]} /><div className="grid gap-12 lg:grid-cols-[1.25fr_.75fr]"><div><InfoBlock title="Course overview" text="This course page is prepared for the future NexHSE catalogue. Course-specific overview, audience, objectives and requirements are CONTENT REQUIRED and will be confirmed before publication." /><div className="mt-12 grid gap-4 sm:grid-cols-2">{[['Who should attend', 'CONTENT REQUIRED'], ['Learning objectives', 'CONTENT REQUIRED'], ['Format & duration', 'CONTENT REQUIRED'], ['Certification / completion', 'CONTENT REQUIRED'], ['Available dates', 'Check availability'], ['Price / quote status', 'Request a quote']].map(([label, value]) => <div key={label} className="rounded-2xl border border-[hsl(var(--border))] p-5"><p className="mono-label text-[9px] text-[hsl(var(--accent))]">{label}</p><p className="mt-4 text-sm font-bold text-[hsl(var(--primary))]">{value}</p></div>)}</div></div><div className="h-fit rounded-2xl bg-[hsl(var(--primary))] p-7 text-white lg:sticky lg:top-24"><p className="mono-label text-[10px] text-[hsl(var(--secondary))]">Ready to discuss training?</p><h2 className="display mt-8 text-3xl">Let’s shape the right programme for your team.</h2><p className="mt-4 text-sm leading-6 text-white/65">Share your organisation, audience and preferred timing. We’ll follow up with the next step.</p><Link href="/request-a-quote" className="focus-ring mt-7 flex min-h-12 items-center justify-center gap-2 rounded-full bg-[hsl(var(--accent))] text-sm font-bold" data-testid="link-course-book">Book training <ArrowUpRight size={16} /></Link></div></div></section><section className="bg-[hsl(var(--secondary)/.6)] px-5 py-20 lg:px-8"><div className="mx-auto max-w-7xl"><SectionHeader eyebrow="Course FAQ" title="Questions before you book?" /><FAQList /></div></section></main></Shell>;
}

function FAQList() { const [open, setOpen] = useState<number | null>(0); return <div className="max-w-3xl divide-y divide-[hsl(var(--border))] border-y border-[hsl(var(--border))]">{faqs.map((faq, i) => <div key={faq.q}><button onClick={() => setOpen(open === i ? null : i)} className="focus-ring flex min-h-16 w-full items-center justify-between text-left text-sm font-bold text-[hsl(var(--primary))]" aria-expanded={open === i} data-testid={`button-course-faq-${i}`}>{faq.q}<ChevronDown size={16} className={open === i ? 'rotate-180 text-[hsl(var(--accent))]' : ''} /></button>{open === i && <p className="pb-5 pr-8 text-sm leading-6 text-[hsl(var(--muted-foreground))]">{faq.a}</p>}</div>)}</div>; }

function Projects() {
  const [filter, setFilter] = useState('');
  return <Shell><Seo page="projects" /><main><PageIntro eyebrow="Projects & case studies" title="Real work. Real environments. Real outcomes." text="A visual project library is being prepared. We will publish authorised project context and outcomes as content is approved." image={fieldImage} /><section className="mx-auto max-w-7xl px-5 py-20 lg:px-8"><Breadcrumbs items={[['Projects', '/projects']]} /><div className="mb-10 flex flex-wrap gap-2">{['Industry', 'Service', 'Location'].map(f => <button key={f} onClick={() => setFilter(filter === f ? '' : f)} aria-pressed={filter === f} className={`focus-ring flex min-h-11 items-center gap-2 rounded-full border px-4 text-xs font-bold ${filter === f ? 'border-[hsl(var(--accent))] bg-[hsl(var(--secondary))] text-[hsl(var(--primary))]' : 'border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))]'}`} data-testid={`button-project-filter-${f.toLowerCase()}`}>{f}<ChevronDown size={14} /></button>)}</div>{filter && <p className="mb-6 text-sm text-[hsl(var(--muted-foreground))]">Filtering by <strong className="text-[hsl(var(--primary))]">{filter}</strong>. Approved project data will populate this view.</p>}<div className="grid gap-6 lg:grid-cols-2"><div className="relative overflow-hidden rounded-[2rem] bg-[hsl(var(--primary))]"><img src={fieldImage} alt="Safety team in an agricultural field environment" className="h-80 w-full object-cover opacity-70" /><div className="absolute inset-0 bg-gradient-to-t from-[hsl(var(--primary))] via-transparent to-transparent" /><div className="absolute bottom-7 left-7 right-7"><span className="mono-label text-[10px] text-[hsl(var(--secondary))]">CASE STUDY LIBRARY</span><h2 className="display mt-3 text-4xl text-white">New projects coming soon.</h2><p className="mt-3 text-sm text-white/65">Client, industry, location and outcome details will appear here when authorised.</p></div></div><EmptyState title="Project details are being prepared." text="The interface is ready for approved case notes, images and outcomes." href="/contact" actionLabel="Talk to NexHSE" /></div></section></main></Shell>;
}

function ProjectDetail() { return <Shell><Seo page="projects" title="Project case study | NexHSE Africa" /><main><PageIntro eyebrow="Project detail · Content required" title="A case study will live here." text="Project context, response and outcome will be published once details are approved for release." image={fieldImage} /><section className="mx-auto max-w-4xl px-5 py-20 lg:px-8"><Breadcrumbs items={[['Projects', '/projects'], ['Case study', '/projects/coming-soon']]} /><div className="grid gap-4 sm:grid-cols-3">{['The challenge', 'The response', 'The result'].map((item, i) => <div key={item} className="rounded-2xl border border-[hsl(var(--border))] p-5"><span className="mono-label text-[10px] text-[hsl(var(--accent))]">0{i + 1}</span><h2 className="mt-8 font-bold text-[hsl(var(--primary))]">{item}</h2><p className="mt-3 text-sm text-[hsl(var(--muted-foreground))]">CONTENT REQUIRED</p></div>)}</div><div className="mt-12 rounded-2xl bg-[hsl(var(--secondary))] p-8"><p className="text-sm leading-7 text-[hsl(var(--muted-foreground))]">This reusable case-study template is ready for authorised imagery, industry, service, location and outcomes.</p><Link href="/contact" className="focus-ring mt-6 inline-flex items-center gap-2 text-sm font-bold text-[hsl(var(--primary))]" data-testid="link-project-contact">Discuss a project <ArrowUpRight size={16} /></Link></div></section></main></Shell>; }

function EmptyState({ title, text, action, href, actionLabel }: { title: string; text: string; action?: () => void; href?: string; actionLabel?: string }) { return <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-[hsl(var(--border))] bg-[hsl(var(--secondary)/.35)] p-8 text-center"><span className="grid h-12 w-12 place-items-center rounded-full bg-[hsl(var(--secondary))] text-[hsl(var(--accent))]"><Sparkles size={19} /></span><h3 className="mt-5 text-lg font-bold text-[hsl(var(--primary))]">{title}</h3><p className="mt-2 max-w-sm text-sm leading-6 text-[hsl(var(--muted-foreground))]">{text}</p>{href && <Link href={href} className="focus-ring mt-5 inline-flex min-h-11 items-center rounded-full bg-[hsl(var(--primary))] px-5 text-xs font-bold text-white" data-testid="link-empty-state-action">{actionLabel}</Link>}{action && <button onClick={action} className="focus-ring mt-5 min-h-11 rounded-full bg-[hsl(var(--primary))] px-5 text-xs font-bold text-white" data-testid="button-empty-state-action">{actionLabel}</button>}</div>; }

function Accreditations() { return <Shell><Seo page="accreditations" /><main><PageIntro eyebrow="Credentials & compliance" title="Authority should be evidenced, not assumed." text="This page is prepared for verified regulatory registrations, professional affiliations, certifications, training credentials and relevant standards." image={harnessImage} /><section className="mx-auto max-w-7xl px-5 py-20 lg:px-8"><Breadcrumbs items={[['Accreditations', '/accreditations']]} /><div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{['Regulatory bodies', 'Professional affiliations', 'Certifications', 'Training credentials', 'Relevant standards', 'Document gallery'].map((item, i) => <div key={item} className="min-h-44 rounded-2xl border border-[hsl(var(--border))] p-6"><Award className="text-[hsl(var(--accent))]" /><p className="mono-label mt-8 text-[10px] text-[hsl(var(--accent))]">0{i + 1}</p><h2 className="mt-2 text-lg font-bold text-[hsl(var(--primary))]">{item}</h2><p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">CONTENT REQUIRED</p></div>)}</div><div className="mt-10 rounded-2xl border border-[hsl(var(--destructive)/.25)] bg-[hsl(var(--destructive)/.06)] p-6 text-sm leading-6 text-[hsl(var(--muted-foreground))]"><strong className="text-[hsl(var(--destructive))]">Publication discipline.</strong> Logos and claims will only be displayed once NexHSE supplies evidence and approves the wording for publication.</div></section></main></Shell>; }

function Testimonials() { return <Shell><Seo page="testimonials" /><main><PageIntro eyebrow="Testimonials" title="Trust is earned in the work." text="Verified feedback from NexHSE clients will be published here. We do not use placeholder ratings or invented client statements." image={trainingImage} /><section className="mx-auto max-w-7xl px-5 py-20 lg:px-8"><Breadcrumbs items={[['Testimonials', '/testimonials']]} /><EmptyState title="Testimonials are coming soon." text="This space is ready for approved quotes, organisation, role, industry and service association." href="/contact" actionLabel="Contact NexHSE" /></section><QuoteCTA /></main></Shell>; }

const articles = [['Safety', 'Workplace risk assessment', 'A practical knowledge note on understanding hazards and choosing the next control.'], ['Fire', 'Fire safety audits', 'A future guide to the questions that make fire preparedness more visible.'], ['Environment', 'Environmental audits', 'A practical introduction to reviewing environmental practice responsibly.'], ['Training', 'Building safety capability', 'Why training needs to travel back into everyday work.']];
function Knowledge() { const [query, setQuery] = useState(''); const shown = articles.filter(a => a.join(' ').toLowerCase().includes(query.toLowerCase())); return <Shell><Seo page="knowledge" /><main><PageIntro eyebrow="Safety intelligence" title="Useful information for better safety decisions." text="A structured knowledge layer for workplace safety, compliance, risk management, fire, environment and professional development." image={fireImage} /><section className="mx-auto max-w-7xl px-5 py-20 lg:px-8"><Breadcrumbs items={[['Knowledge', '/knowledge']]} /><div className="mb-10 flex max-w-xl items-center gap-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4"><Search size={17} className="text-[hsl(var(--accent))]" /><label className="sr-only" htmlFor="knowledge-search">Search knowledge</label><input id="knowledge-search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search safety intelligence" className="focus-ring min-h-12 w-full bg-transparent text-sm outline-none" data-testid="input-search-knowledge" /></div>{shown.length ? <div className="grid gap-4 md:grid-cols-2">{shown.map(([category, title, text], i) => <Link href={`/knowledge/article-${i + 1}`} key={title} className="group focus-ring rounded-2xl border border-[hsl(var(--border))] p-6 transition-all hover:-translate-y-1 hover:border-[hsl(var(--accent))]" data-testid={`card-article-${i}`}><div className="flex items-center justify-between"><span className="mono-label text-[10px] text-[hsl(var(--accent))]">{category}</span><ArrowUpRight size={16} className="text-[hsl(var(--muted-foreground))]" /></div><h2 className="mt-14 text-2xl font-bold text-[hsl(var(--primary))]">{title}</h2><p className="mt-3 max-w-md text-sm leading-6 text-[hsl(var(--muted-foreground))]">{text}</p><p className="mono-label mt-8 text-[9px] text-[hsl(var(--muted-foreground))]">CONTENT CATALOGUE · READ ARTICLE</p></Link>)}</div> : <EmptyState title="No articles match that search." text="Try another phrase or check back as new safety intelligence is published." />}</section><QuoteCTA /></main></Shell>; }

function ArticleDetail() { const { article = '' } = useParams<{ article: string }>(); const index = Math.max(0, Math.min(articles.length - 1, Number(article.replace('article-', '')) - 1 || 0)); const [category, title, text] = articles[index]; return <Shell><Seo page="knowledge" title={`${title} | NexHSE Africa`} /><main><PageIntro eyebrow={`${category} · Knowledge note`} title={title} text={text} image={category === 'Fire' ? fireImage : category === 'Training' ? trainingImage : fieldImage} /><article className="mx-auto max-w-4xl px-5 py-20 lg:px-8"><Breadcrumbs items={[['Knowledge', '/knowledge'], [title, `/knowledge/${article}`]]} /><div className="mb-10 flex flex-wrap gap-5 border-b border-[hsl(var(--border))] pb-6 text-[10px] font-bold uppercase tracking-widest text-[hsl(var(--muted-foreground))]"><span>Author · CONTENT REQUIRED</span><span>Publication date · CONTENT REQUIRED</span><span>Reading time · CONTENT REQUIRED</span></div><div className="prose prose-lg max-w-none prose-headings:font-serif prose-headings:text-[hsl(var(--primary))] prose-p:text-[hsl(var(--muted-foreground))]"><p>This article template is ready for a practical NexHSE knowledge note. It will bring together clear context, considered guidance and links to relevant services once the source content is approved.</p><h2>What this means in practice</h2><p>Good safety information should help people see the issue, understand their responsibility and decide what to do next. The final article will be specific to the relevant workplace context and will avoid unsupported claims.</p><h2>Keep the conversation moving</h2><p>When the answer needs more than an article, NexHSE can help you explore the right service or training route for your organisation.</p></div><Link href="/request-a-quote" className="focus-ring mt-10 inline-flex min-h-12 items-center gap-2 rounded-full bg-[hsl(var(--primary))] px-5 text-sm font-bold text-white" data-testid="link-article-quote">Talk to NexHSE <ArrowUpRight size={16} /></Link></article></main></Shell>; }

function Contact() { const [sent, setSent] = useState(false); return <Shell><Seo page="contact" /><main><PageIntro eyebrow="Contact NexHSE Africa" title="Let’s talk about the work that matters." text="Tell us what you are working through. We will help you find the right next conversation." image={fieldImage} /><section className="mx-auto max-w-7xl px-5 py-20 lg:px-8"><Breadcrumbs items={[['Contact', '/contact']]} /><div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr]"><div><p className="mono-label text-[10px] text-[hsl(var(--accent))]">Find us</p><div className="mt-6 space-y-5"><ContactDetail icon={MapPin} label="Address" value="Rock Centre, Outer Ring Road" href="https://maps.google.com/?q=Rock+Centre+Outer+Ring+Road" /><ContactDetail icon={Phone} label="Phone" value={phone} href={`tel:${phone.replaceAll(' ', '')}`} /><ContactDetail icon={Mail} label="Email" value={email} href={`mailto:${email}`} /></div><div className="mt-10 h-52 overflow-hidden rounded-2xl bg-[hsl(var(--secondary))]"><div className="grid h-full place-items-center bg-[radial-gradient(circle_at_center,hsl(var(--accent)/.2)_1px,transparent_1px)] [background-size:18px_18px]"><div className="rounded-full bg-[hsl(var(--primary))] p-3 text-white"><MapPin size={22} /></div></div></div></div><div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 sm:p-8"><p className="mono-label text-[10px] text-[hsl(var(--accent))]">Send an enquiry</p>{sent ? <div className="flex min-h-72 flex-col items-center justify-center text-center"><span className="grid h-12 w-12 place-items-center rounded-full bg-[hsl(var(--secondary))] text-[hsl(var(--accent))]"><Check /></span><h2 className="mt-5 text-2xl font-bold text-[hsl(var(--primary))]">Thank you. Your enquiry is ready for follow-up.</h2><p className="mt-3 text-sm text-[hsl(var(--muted-foreground))]">A member of the NexHSE team can contact you at the details provided.</p><button onClick={() => setSent(false)} className="focus-ring mt-6 text-sm font-bold text-[hsl(var(--accent))]" data-testid="button-send-another">Send another enquiry</button></div> : <form onSubmit={e => { e.preventDefault(); setSent(true); }} className="mt-6 space-y-5"><div className="grid gap-5 sm:grid-cols-2"><Field label="Your name" name="name" required /><Field label="Work email" name="email" type="email" required /></div><Field label="Organisation" name="organisation" /><label className="block text-sm font-semibold text-[hsl(var(--primary))]">How can we help?<textarea required name="message" rows={5} className="focus-ring mt-2 w-full resize-none rounded-xl border border-[hsl(var(--input))] bg-transparent p-3 text-sm outline-none" data-testid="textarea-contact-message" /></label><button className="focus-ring flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[hsl(var(--primary))] text-sm font-bold text-white" data-testid="button-submit-contact">Send enquiry <ArrowUpRight size={16} /></button></form>}</div></div></section><QuoteCTA /></main></Shell>; }

function ContactDetail({ icon: Icon, label, value, href }: { icon: IconType; label: string; value: string; href: string }) { return <a href={href} className="focus-ring flex items-start gap-4" data-testid={`link-contact-${label.toLowerCase()}`}><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[hsl(var(--secondary))] text-[hsl(var(--accent))]"><Icon size={18} /></span><span><span className="mono-label block text-[9px] text-[hsl(var(--muted-foreground))]">{label}</span><span className="mt-1 block text-sm font-bold text-[hsl(var(--primary))]">{value}</span></span></a>; }
function Field({ label, name, type = 'text', required = false }: { label: string; name: string; type?: string; required?: boolean }) { return <label className="block text-sm font-semibold text-[hsl(var(--primary))]">{label}{required && <span className="ml-1 text-[hsl(var(--destructive))]">*</span>}<input name={name} type={type} required={required} className="focus-ring mt-2 min-h-12 w-full rounded-xl border border-[hsl(var(--input))] bg-transparent px-3 text-sm outline-none" data-testid={`input-contact-${name}`} /></label>; }

function Quote() { const [step, setStep] = useState(1); const [done, setDone] = useState(false); const [need, setNeed] = useState(''); const steps = ['What do you need?', 'Your organisation', 'Engagement', 'Timing', 'Your details', 'Review & submit']; const needs = services.slice(0, 6); return <Shell><Seo page="contact" title="Request a Quote | NexHSE Africa" description="Tell NexHSE Africa what your organisation needs and start a practical conversation about workplace safety, training and environmental support." /><main><section className="bg-[hsl(var(--primary))] text-white"><div className="mx-auto max-w-7xl px-5 pb-16 pt-14 lg:px-8 lg:pb-20"><Breadcrumbs items={[['Request a quote', '/request-a-quote']]} /><p className="mono-label text-[10px] text-[hsl(var(--secondary))]">Progressive enquiry</p><h1 className="display mt-5 max-w-3xl text-5xl leading-[1.02] tracking-[-.045em] sm:text-7xl">Start with the situation.<br /><em className="font-medium text-[hsl(var(--secondary))]">We’ll find the route.</em></h1><p className="mt-6 max-w-xl text-base leading-7 text-white/70">A few focused questions help us understand the shape of your requirement. No pricing engine is connected yet.</p></div></section><section className="mx-auto max-w-7xl px-5 py-16 lg:px-8"><div className="mb-12 grid grid-cols-3 gap-2 sm:grid-cols-6">{steps.map((s, i) => <div key={s} className={`${i + 1 <= step ? 'text-[hsl(var(--accent))]' : 'text-[hsl(var(--muted-foreground))]'}`}><div className={`h-1 rounded-full ${i + 1 <= step ? 'bg-[hsl(var(--accent))]' : 'bg-[hsl(var(--border))]'}`} /><span className="mt-3 block text-[10px] font-bold leading-4">{i + 1}. {s}</span></div>)}</div>{done ? <div className="mx-auto max-w-xl rounded-2xl bg-[hsl(var(--secondary))] p-10 text-center"><span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[hsl(var(--accent))] text-white"><Check /></span><h2 className="display mt-6 text-4xl text-[hsl(var(--primary))]">Your request is ready for a conversation.</h2><p className="mt-4 text-sm leading-6 text-[hsl(var(--muted-foreground))]">Thank you. NexHSE can follow up using the contact details provided.</p><Link href="/contact" className="focus-ring mt-7 inline-flex min-h-11 items-center gap-2 rounded-full bg-[hsl(var(--primary))] px-5 text-xs font-bold text-white" data-testid="link-quote-done-contact">Back to contact <ArrowUpRight size={15} /></Link></div> : <div className="mx-auto max-w-3xl rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 sm:p-10"><p className="mono-label text-[10px] text-[hsl(var(--accent))]">Step {step} of 6</p>{step === 1 && <div><h2 className="display mt-4 text-4xl text-[hsl(var(--primary))]">What do you need?</h2><p className="mt-3 text-sm text-[hsl(var(--muted-foreground))]">Choose the closest starting point. We can refine it together.</p><div className="mt-8 grid gap-3 sm:grid-cols-2">{needs.map(s => <button key={s.slug} onClick={() => setNeed(s.title)} className={`focus-ring min-h-16 rounded-xl border p-4 text-left text-sm font-bold ${need === s.title ? 'border-[hsl(var(--accent))] bg-[hsl(var(--secondary))] text-[hsl(var(--primary))]' : 'border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))]'}`} data-testid={`button-quote-need-${s.slug}`}>{s.title}</button>)}</div></div>}{step === 2 && <StepFields title="Tell us about your organisation." fields={['Organisation name', 'Industry or operating context', 'Location']} />}{step === 3 && <StepFields title="What does the engagement involve?" fields={['Who is involved?', 'What would success look like?', 'Anything we should understand?']} />}{step === 4 && <StepFields title="When do you need it?" fields={['Preferred timing', 'Is there a deadline?', 'Additional timing notes']} />}{step === 5 && <StepFields title="Your contact details." fields={['Your name', 'Work email', 'Phone number']} />}{step === 6 && <div><h2 className="display mt-4 text-4xl text-[hsl(var(--primary))]">Review & submit.</h2><div className="mt-8 space-y-3 rounded-xl bg-[hsl(var(--secondary)/.6)] p-5 text-sm"><p><strong>Need:</strong> {need || 'Not selected yet'}</p><p><strong>Organisation detail:</strong> Ready to discuss</p><p><strong>Timing:</strong> To be confirmed</p><p><strong>Contact:</strong> Ready to collect</p></div><p className="mt-4 text-xs text-[hsl(var(--muted-foreground))]">This Phase 1 form demonstrates the experience. Connect it to the enquiry endpoint before production launch.</p></div>}<div className="mt-10 flex justify-between gap-3 border-t border-[hsl(var(--border))] pt-6">{step > 1 ? <button onClick={() => setStep(step - 1)} className="focus-ring min-h-11 rounded-full border border-[hsl(var(--border))] px-5 text-xs font-bold text-[hsl(var(--primary))]" data-testid="button-quote-back">Back</button> : <span />}{step < 6 ? <button onClick={() => setStep(step + 1)} disabled={step === 1 && !need} className="focus-ring min-h-11 rounded-full bg-[hsl(var(--primary))] px-6 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-40" data-testid="button-quote-next">Continue <ChevronRight size={14} className="ml-1 inline" /></button> : <button onClick={() => setDone(true)} className="focus-ring min-h-11 rounded-full bg-[hsl(var(--accent))] px-6 text-xs font-bold text-white" data-testid="button-quote-submit">Submit request <ArrowUpRight size={15} className="ml-1 inline" /></button>}</div></div>}</section></main></Shell>; }
function StepFields({ title, fields }: { title: string; fields: string[] }) { return <div><h2 className="display mt-4 text-4xl text-[hsl(var(--primary))]">{title}</h2><div className="mt-8 space-y-5">{fields.map(f => <label key={f} className="block text-sm font-semibold text-[hsl(var(--primary))]">{f}<input className="focus-ring mt-2 min-h-12 w-full rounded-xl border border-[hsl(var(--input))] bg-transparent px-3 text-sm outline-none" data-testid={`input-quote-${f.toLowerCase().replaceAll(' ', '-')}`} /></label>)}</div></div>; }

function AppRouter() { return <Switch><Route path="/" component={Home} /><Route path="/about" component={About} /><Route path="/services" component={Services} /><Route path="/services/:slug" component={ServiceDetail} /><Route path="/training" component={Training} /><Route path="/training/:course" component={CourseDetail} /><Route path="/projects" component={Projects} /><Route path="/projects/:project" component={ProjectDetail} /><Route path="/accreditations" component={Accreditations} /><Route path="/testimonials" component={Testimonials} /><Route path="/knowledge" component={Knowledge} /><Route path="/knowledge/:article" component={ArticleDetail} /><Route path="/contact" component={Contact} /><Route path="/request-a-quote" component={Quote} /><Route component={NotFound} /></Switch>; }
function NotFound() { return <Shell><main className="mx-auto flex min-h-[65vh] max-w-3xl flex-col items-center justify-center px-5 text-center"><p className="mono-label text-[10px] text-[hsl(var(--accent))]">404 / PAGE NOT FOUND</p><h1 className="display mt-5 text-6xl text-[hsl(var(--primary))]">That route is out of scope.</h1><p className="mt-5 text-sm text-[hsl(var(--muted-foreground))]">The page you’re looking for may be coming soon.</p><Link href="/" className="focus-ring mt-8 rounded-full bg-[hsl(var(--primary))] px-6 py-3 text-sm font-bold text-white" data-testid="link-not-found-home">Return home</Link></main></Shell>; }
function Router() { const [location] = useLocation(); return <ErrorBoundary resetKey={location}><AppRouter /></ErrorBoundary>; }
export default function App() { return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><Router /></WouterRouter><Toaster /></TooltipProvider></QueryClientProvider>; }