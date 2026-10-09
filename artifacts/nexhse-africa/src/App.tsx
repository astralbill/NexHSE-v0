import { createContext, lazy, Suspense, useContext, useEffect, useMemo, useRef, useState, type ChangeEvent, type CSSProperties, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { getSupabaseBrowserClient } from '@/lib/supabase';
import { getServiceMediaSlides, workAtHeightImages } from '@/lib/service-media';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ArrowUpRight, Award, BriefcaseBusiness, Check, ChevronDown, ChevronLeft, ChevronRight, ClipboardCheck, Clock3, Download, FileText, Flame, HardHat, HeartPulse, Leaf, Mail, MapPin, Phone, Search, ShieldCheck, ShoppingCart, Siren, Sparkles, Target, Users } from 'lucide-react';
import { FaFacebookF, FaGoogle, FaLinkedinIn, FaTiktok } from 'react-icons/fa6';
import { Link, Route, Switch, Router as WouterRouter, useLocation, useParams } from 'wouter';
const heroImage = '/assets/image-36_1787989938472-CuZj7f29.jpg';
const trainingImage = '/assets/shop/PPE-01.jpg';
const fireImage = '/assets/image-27_1787989938474-CtfajE2K.jpg';
const heightsImage = '/assets/osh-03.jpeg';
const fieldImage = '/assets/on-field.jpeg';
const firstAidImage = '/assets/first-aid01.jpeg';
const harnessImage = '/assets/osh-04.jpeg';
const environmentalImage = '/assets/tea-harvesting.jpeg';
const trainingRoomImage = '/assets/image-04.jpg';
const riskReviewImage = '/assets/image-01.jpeg';
const auditMeetingImage = '/assets/image-02.jpg';
const siteTrainingImage = fieldImage;
const constructionTrainingImage = '/assets/image-07.jpg';
const nexhseLogo = '/assets/logo01_1787991144513-BzpG7v81.png';

const queryClient = new QueryClient();
const AdminInvoicesPage = lazy(() => import('@/components/admin-sales').then(module => ({ default: module.AdminInvoicesPage })));
const AdminQuotesPage = lazy(() => import('@/components/admin-sales').then(module => ({ default: module.AdminQuotesPage })));
const QuoteRequestForm = lazy(() => import('@/components/admin-sales').then(module => ({ default: module.QuoteRequestForm })));
const phone = '0705 065 852';
const siteUrl = 'https://www.nexhse.co.ke';
const email = 'info@nexhse.co.ke';
type SiteStoreKey = 'nexhse-shop-cart' | 'nexhse-shop-products' | 'nexhse-shop-orders' | 'nexhse-service-tickets' | 'nexhse-blog-posts';
const siteStoreKeys: SiteStoreKey[] = ['nexhse-shop-cart', 'nexhse-shop-products', 'nexhse-shop-orders', 'nexhse-service-tickets', 'nexhse-blog-posts'];
const emptyCart: Record<string, number> = {};
const emptyOrders: ShopOrder[] = [];
const emptyTickets: ServiceTicket[] = [];
type SiteStoreContextValue = { read: <T>(key: SiteStoreKey, fallback: T) => Promise<T>; write: (key: SiteStoreKey, value: unknown) => void; appendOrder: (order: Omit<ShopOrder, 'id' | 'createdAt'>, fallback: ShopOrder) => Promise<ShopOrder> };
const SiteStoreContext = createContext<SiteStoreContextValue | null>(null);
const socialLinks = [
  { label: 'Find NexHSE Africa on Facebook', href: 'https://www.facebook.com/search/pages/?q=NexHSE%20Africa', icon: FaFacebookF, testId: 'link-footer-facebook' },
  { label: 'Find NexHSE Africa on TikTok', href: 'https://www.tiktok.com/search?q=NexHSE%20Africa', icon: FaTiktok, testId: 'link-footer-tiktok' },
  { label: 'Find NexHSE Africa on LinkedIn', href: 'https://www.linkedin.com/search/results/companies/?keywords=NexHSE%20Africa', icon: FaLinkedinIn, testId: 'link-footer-linkedin' },
  { label: 'Open NexHSE Africa on Google Business', href: 'https://www.google.com/maps/search/?api=1&query=NexHSE%20Africa%2C%20Nairobi', icon: FaGoogle, testId: 'link-footer-google-business' },
];

function slideshowWindow(current: number, length: number) {
  return new Set([current, (current + 1) % length, (current + length - 1) % length]);
}

type IconType = typeof ShieldCheck;
type Service = { id?: string; slug: string; number: string; title: string; short: string; outcome: string; type: string; icon: IconType; image: string; group: string; active?: boolean };
type FAQ = { q: string; a: string };
type ShopProduct = { id?: string; sku?: string; name: string; category: string; price: number; basePrice?: number; promotionName?: string | null; promotionCode?: string | null; image: string; imageBackground: string; description: string; longDescription: string; seoTitle: string; seoDescription: string; keywords: string[]; features: string[]; useCases: string[]; brand: string; condition: string; stock: number; active?: boolean };
type ShopPromotion = { id: string; code: string; name: string; description: string; discountType: 'percentage' | 'fixed'; discountValue: number; productIds: string[]; startsAt: string | null; endsAt: string | null; usageLimit: number | null; usageCount: number; active: boolean };
type DeliveryDetails = { name: string; email: string; phone: string; address: string; county: string; notes: string };
type ShopOrder = { id: string; createdAt: string; items: { name: string; quantity: number; price: number; image: string }[]; subtotal: number; deliveryFee: number; total: number; delivery: DeliveryDetails; paymentMethod: 'M-Pesa' | 'Card' | 'Bank transfer' | 'Pay on delivery'; paymentStatus: 'pending' | 'awaiting confirmation' | 'paid' | 'failed' | 'refunded'; orderStatus: 'received' | 'processing' | 'ready for dispatch' | 'dispatched' | 'completed' | 'cancelled'; paymentStatusToken?: string; trackingNumber?: string | null; carrier?: string | null; expectedDeliveryAt?: string | null };
type ServiceTicket = { id: string; name: string; email: string; subject: string; priority: 'normal' | 'urgent'; details: string; status: 'open' | 'in progress' | 'resolved'; createdAt: string };

const legacyServiceSlugs: Record<string, string> = {
  'safety-health-audits': 'health-safety-audits',
  'fire-audits': 'fire-safety-inspections-audits',
  'osh-committee-training': 'osh-training',
  'environmental-audits': 'environmental-impact-assessment-audits',
};

function resolveServiceSlug(slug: string) {
  return legacyServiceSlugs[slug] ?? slug;
}

export const services: Service[] = [
  { slug: 'osh-training', number: '01', title: 'OSH Training', short: 'Builds core hazard awareness and legal compliance org-wide.', outcome: 'Your workforce spots and stops hazards before they become incidents.', type: 'OSH — TRAINING & CAPACITY BUILDING', icon: Users, image: trainingImage, group: 'Training' },
  { slug: 'fire-safety-training', number: '02', title: 'Fire Safety Training', short: 'Prevention, response and evacuation skills, including fire marshals.', outcome: "Your building passes fire inspections — and your team doesn't freeze in a real fire.", type: 'OSH — TRAINING & CAPACITY BUILDING', icon: Flame, image: fireImage, group: 'Training' },
  { slug: 'first-aid-training', number: '03', title: 'First Aid Training', short: 'Certified first aider and refresher training aligned to the 2024 Regulations.', outcome: 'A trained responder is on-site the moment an injury happens.', type: 'OSH — TRAINING & CAPACITY BUILDING', icon: HeartPulse, image: firstAidImage, group: 'Training' },
  { slug: 'work-at-height-confined-space-training', number: '04', title: 'Work at Height & Confined Space Training', short: 'Specialised competence for high-risk access, fall protection and entry.', outcome: 'High-risk tasks are done only by people actually qualified to do them.', type: 'OSH — TRAINING & CAPACITY BUILDING', icon: HardHat, image: heightsImage, group: 'Training' },
  { slug: 'emergency-response-training', number: '05', title: 'Emergency Response Training', short: 'Builds organisational readiness to respond to workplace emergencies.', outcome: 'Your team reacts fast and correctly — not in panic — when something goes wrong.', type: 'OSH — TRAINING & CAPACITY BUILDING', icon: Siren, image: constructionTrainingImage, group: 'Training' },
  { slug: 'alcohol-drug-abuse-training', number: '06', title: 'Training on Alcohol & Drug', short: 'Awareness training and workplace policy support for substance-related risk.', outcome: 'Substance-related incidents get prevented, not just punished after the fact.', type: 'OSH — TRAINING & CAPACITY BUILDING', icon: ShieldCheck, image: trainingRoomImage, group: 'Training' },
  { slug: 'ppe-training', number: '07', title: 'PPE Training', short: 'Correct selection, fitting and use of personal protective equipment.', outcome: "PPE actually protects — because it's worn and used correctly.", type: 'OSH — TRAINING & CAPACITY BUILDING', icon: ShieldCheck, image: siteTrainingImage, group: 'Training' },
  { slug: 'risk-assessments', number: '08', title: 'Risk Assessments', short: 'Identifies and controls workplace hazards before they cause harm.', outcome: 'You know your real exposure before an incident forces you to find out.', type: 'ASSESSMENTS, AUDITS & POLICY', icon: Target, image: riskReviewImage, group: 'Assess' },
  { slug: 'health-safety-audits', number: '09', title: 'Health & Safety Audits', short: 'Independent verification against statutory and ISO 45001 standards.', outcome: 'You walk into any inspection or lender review with evidence, not excuses.', type: 'ASSESSMENTS, AUDITS & POLICY', icon: ClipboardCheck, image: auditMeetingImage, group: 'Assess' },
  { slug: 'fire-safety-inspections-audits', number: '10', title: 'Fire Safety Inspections & Audits', short: 'Verifies fire controls against the Fire Risk Reduction Rules, 2007.', outcome: 'No surprises when the fire inspector shows up.', type: 'ASSESSMENTS, AUDITS & POLICY', icon: Flame, image: fireImage, group: 'Assess' },
  { slug: 'osh-policies', number: '11', title: 'Development of OSH Policies', short: 'Tailored policy frameworks built for your operation.', outcome: 'A safety management system that actually functions — not a binder on a shelf.', type: 'ASSESSMENTS, AUDITS & POLICY', icon: ClipboardCheck, image: auditMeetingImage, group: 'Policy' },
  { slug: 'asbestos-containing-materials-surveys', number: '12', title: 'Asbestos Containing Materials (ACM) Surveys', short: 'Identification and risk management of legacy asbestos hazards.', outcome: 'You know where the risk is before it becomes a lawsuit or a stalled demolition.', type: 'ASSESSMENTS, AUDITS & POLICY', icon: Search, image: fieldImage, group: 'Assess' },
  { slug: 'chemical-mechanical-safety', number: '13', title: 'Chemical & Mechanical Safety', short: 'Safe handling, storage and operation around hazards and machinery.', outcome: 'Fewer chemical-exposure and machinery incidents on your site.', type: 'SPECIALISED SERVICES', icon: ShieldCheck, image: constructionTrainingImage, group: 'Specialised' },
  { slug: 'disaster-preparedness-management', number: '14', title: 'Disaster Preparedness & Management', short: 'Structured planning and readiness for large-scale or catastrophic events.', outcome: 'Your organisation has a plan before the crisis, not during it.', type: 'SPECIALISED SERVICES', icon: Siren, image: fieldImage, group: 'Specialised' },
  { slug: 'construction-site-safety-management-monitoring', number: '15', title: 'Construction Site Safety Management & Monitoring', short: 'On-site HSE oversight and supervision through the project lifecycle.', outcome: 'Continuous safety coverage without hiring a full-time HSE officer.', type: 'SPECIALISED SERVICES', icon: HardHat, image: siteTrainingImage, group: 'Specialised' },
  { slug: 'firefighting-equipment-supply-maintenance', number: '16', title: 'Firefighting Equipment Supply & Maintenance', short: 'Reliable, inspected firefighting equipment supply and upkeep.', outcome: 'Equipment works the one time it actually matters.', type: 'EQUIPMENT SUPPLY', icon: Flame, image: fireImage, group: 'Equipment' },
  { slug: 'ppe-supply', number: '17', title: 'PPE Supply', short: 'Quality PPE supplied alongside the training to use it correctly.', outcome: "Staff are equipped and know how to use exactly what they're given.", type: 'EQUIPMENT SUPPLY', icon: ShieldCheck, image: harnessImage, group: 'Equipment' },
  { slug: 'first-aid-appliances-supply', number: '18', title: 'First Aid Appliances Supply', short: 'Fully stocked, compliant first aid kits and station equipment.', outcome: "No excuse for an empty first aid box when it's needed most.", type: 'EQUIPMENT SUPPLY', icon: HeartPulse, image: firstAidImage, group: 'Equipment' },
  { slug: 'environmental-impact-assessment-audits', number: '19', title: 'Environmental Impact Assessment & Audits', short: 'Assesses and verifies environmental compliance and impact management.', outcome: 'Your project clears NEMA approval without a redesign-and-resubmit cycle.', type: 'ENVIRONMENTAL MANAGEMENT', icon: Leaf, image: environmentalImage, group: 'Environment' },
  { slug: 'environmental-education-training', number: '20', title: 'Environmental Education (Training)', short: 'Builds environmental awareness and responsibility across your workforce.', outcome: 'Your team makes environmentally sound decisions without being told twice.', type: 'ENVIRONMENTAL MANAGEMENT', icon: Leaf, image: fieldImage, group: 'Environment' },
  { slug: 'environmental-policies-management-plans', number: '21', title: 'Environmental Policies & Management Plans', short: 'Structured frameworks that guide consistent environmental performance.', outcome: 'Consistent environmental practice — not ad hoc decisions per site.', type: 'ENVIRONMENTAL MANAGEMENT', icon: Leaf, image: environmentalImage, group: 'Environment' },
  { slug: 'environmental-management-systems', number: '22', title: 'Environmental Management Systems', short: 'Systems-based approach to continual environmental improvement.', outcome: 'Environmental performance that improves year over year, not just once.', type: 'ENVIRONMENTAL MANAGEMENT', icon: Leaf, image: fieldImage, group: 'Environment' },
  { slug: 'waste-management', number: '23', title: 'Waste Management', short: 'Safe, compliant handling, storage and disposal of waste streams.', outcome: 'No regulatory exposure from how your waste is handled.', type: 'ENVIRONMENTAL MANAGEMENT', icon: Leaf, image: environmentalImage, group: 'Environment' },
  { slug: 'effluent-emissions-management', number: '24', title: 'Effluent & Emissions Management', short: 'Discharge control planning and monitoring for liquid and airborne emissions.', outcome: 'Emissions stay within legal limits — verifiably.', type: 'ENVIRONMENTAL MANAGEMENT', icon: Leaf, image: environmentalImage, group: 'Environment' },
];

const faqs: FAQ[] = [
  { q: 'How does NexHSE begin an engagement?', a: 'We start by understanding your organisation, operating context and the practical concern you need to solve. From there, we can shape an appropriate audit, training programme or consultation.' },
  { q: 'Can training be delivered at our workplace?', a: 'Delivery format is shaped around the programme and your organisation. Share the context with our team and we will advise on a suitable approach.' },
  { q: 'Do you provide quotations?', a: 'Yes. Request a quote with a few details about your organisation and requirement. A member of the NexHSE team can then follow up with the next step.' },
  { q: 'Are your courses available on fixed dates?', a: 'Course dates, durations and availability are content required for Phase 1. Contact us to discuss your intended programme or check back for published dates.' },
];

const meta: Record<string, { title: string; description: string; keywords: string }> = {
  home: { title: 'NexHSE Africa | Workplace Safety, HSE Training & Professional Development', description: 'NexHSE Africa helps organisations across Kenya and Africa protect people, reduce workplace risk and build practical HSE capability through audits, training, fire safety and environmental services.', keywords: 'workplace safety Kenya, HSE training Kenya, fire safety training, environmental compliance, occupational safety, risk assessments, health and safety consulting' },
  about: { title: 'About NexHSE Africa | Workplace Safety & Professional Development', description: 'Learn about NexHSE Africa, our approach to workplace safety, risk reduction, compliance, professional development and building stronger safety cultures.', keywords: 'about NexHSE Africa, HSE consultants Kenya, workplace safety experts, occupational safety solutions' },
  services: { title: 'HSE Services Kenya | Audits, Risk Assessment, Fire & Environmental | NexHSE', description: 'Explore NexHSE workplace safety, health, fire, risk assessment, training and environmental services designed around your operations, risks and people.', keywords: 'HSE services Kenya, workplace safety audits, risk assessments Kenya, fire safety inspections, environmental compliance services' },
  training: { title: 'HSE Training Kenya | Fire Safety, First Aid, OSH & Work at Heights | NexHSE', description: 'Explore NexHSE workplace safety and professional development training, including fire safety, first aid, OSH committee and work-at-height programmes.', keywords: 'HSE training Kenya, fire safety training, first aid training, work at height training, OSH training Africa' },
  projects: { title: 'NexHSE Projects & Case Studies | Workplace Safety in Practice', description: 'Explore NexHSE safety, training, fire and environmental projects and see how practical HSE solutions are applied across real operating environments.', keywords: 'HSE projects Kenya, safety case studies, fire safety implementation, workplace safety project examples' },
  accreditations: { title: 'NexHSE Accreditations, Compliance & Professional Credentials', description: "Explore NexHSE's verified regulatory registrations, professional affiliations, certifications and workplace safety credentials.", keywords: 'NexHSE accreditations, HSE compliance credentials, workplace safety professional credentials, certified safety training providers' },
  testimonials: { title: 'NexHSE Client Testimonials | Workplace Safety & Training', description: 'Read verified feedback from organisations working with NexHSE across workplace safety, training, auditing and professional development.', keywords: 'NexHSE testimonials, HSE client reviews, workplace safety feedback, safety training results' },
  knowledge: { title: 'HSE Knowledge Hub | Workplace Safety & Compliance Kenya | NexHSE', description: 'Practical HSE insights, workplace safety guidance, fire safety information, risk management, environmental compliance and professional development from NexHSE.', keywords: 'HSE knowledge Kenya, workplace safety blog, fire safety advice, environmental management resources, compliance guidance' },
  faqs: { title: 'HSE FAQs Kenya | Workplace Safety, Fire & Environmental Questions | NexHSE', description: 'Answers to common workplace health and safety, fire safety, training, auditing and environmental management questions from NexHSE Africa.', keywords: 'HSE FAQs Kenya, workplace safety questions, fire safety FAQs, environmental compliance questions, training FAQ' },
  blog: { title: 'NexHSE Africa Blog | Workplace Safety, HSE & Environmental Insights', description: 'Practical workplace safety, HSE compliance, fire safety, training and environmental management insights for organisations in Kenya and Africa.', keywords: 'workplace safety blog, HSE insights, fire safety tips, environmental management insights, occupational health and safety articles' },
  contact: { title: 'Contact NexHSE Africa | Workplace Safety & HSE Support Kenya', description: 'Contact NexHSE Africa for workplace safety audits, risk assessment, fire safety, training, environmental services, consultations and quotations.', keywords: 'contact NexHSE Africa, HSE consultants Kenya, workplace safety support, request a quote, fire safety consultation' },
};

function Seo({ page = 'home', title, description, product }: { page?: string; title?: string; description?: string; product?: ShopProduct }) {
  useEffect(() => {
    const details = meta[page] ?? meta.home;
    const finalTitle = title ?? details.title;
    const finalDescription = description ?? details.description;
    const finalKeywords = details.keywords || 'NexHSE Africa, HSE training, workplace safety, fire safety, environmental compliance';
    const canonicalOrigin = window.location.hostname.toLowerCase() === 'shop.nexhse.co.ke' ? 'https://shop.nexhse.co.ke' : siteUrl;
    const canonicalUrl = `${canonicalOrigin}${window.location.pathname}`;
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
    const isPrivateOrTransactional = window.location.hostname.toLowerCase() === 'admin.nexhse.co.ke' || window.location.pathname.startsWith('/admin') || window.location.pathname === '/shop/checkout' || window.location.pathname === '/checkout';
    const robotsPolicy = isPrivateOrTransactional ? 'noindex, nofollow, noarchive, nosnippet' : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';
    set('description', finalDescription); set('keywords', finalKeywords); set('author', 'NexHSE Africa'); set('application-name', 'NexHSE Africa'); set('language', 'en-KE'); set('robots', robotsPolicy); set('googlebot', robotsPolicy); set('bingbot', robotsPolicy); set('twitter:card', 'summary_large_image'); set('twitter:title', finalTitle); set('twitter:description', finalDescription); set('twitter:image', `${siteUrl}/logo.png`);
    setProperty('og:title', finalTitle); setProperty('og:description', finalDescription); setProperty('og:type', (page === 'knowledge' || page === 'blog') && title ? 'article' : 'website'); setProperty('og:url', canonicalUrl); setProperty('og:site_name', 'NexHSE Africa'); setProperty('og:locale', 'en_KE'); setProperty('og:image', `${siteUrl}/logo.png`);
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.appendChild(canonical); }
    canonical.href = canonicalUrl;
    const alternateEnKe = document.querySelector('link[rel="alternate"][hreflang="en-KE"]') as HTMLLinkElement | null;
    if (!alternateEnKe) {
      const alt = document.createElement('link');
      alt.rel = 'alternate';
      alt.hreflang = 'en-KE';
      alt.href = canonicalUrl;
      document.head.appendChild(alt);
    }
    const xDefault = document.querySelector('link[rel="alternate"][hreflang="x-default"]') as HTMLLinkElement | null;
    if (!xDefault) {
      const alt = document.createElement('link');
      alt.rel = 'alternate';
      alt.hreflang = 'x-default';
      alt.href = siteUrl;
      document.head.appendChild(alt);
    }
    let structuredData = document.querySelector('#nexhse-structured-data') as HTMLScriptElement | null;
    if (!structuredData) { structuredData = document.createElement('script'); structuredData.id = 'nexhse-structured-data'; structuredData.type = 'application/ld+json'; document.head.appendChild(structuredData); }

    const organizationSchema = {
      '@type': 'Organization',
      '@id': `${siteUrl}/#organization`,
      name: 'NexHSE Africa',
      url: `${siteUrl}/`,
      logo: `${siteUrl}/logo.png`,
      email,
      telephone: '+254705065852',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Rock Centre, Outer Ring Road',
        addressCountry: 'KE',
      },
      areaServed: ['Kenya', 'Africa'],
      knowsAbout: ['Workplace health and safety', 'Risk assessment', 'Fire safety', 'Environmental compliance', 'HSE training'],
    };

    const websiteSchema = {
      '@type': 'WebSite',
      '@id': `${siteUrl}/#website`,
      name: 'NexHSE Africa',
      url: `${siteUrl}/`,
      publisher: { '@id': `${siteUrl}/#organization` },
      inLanguage: 'en-KE',
    };

    const pageSchema = {
      '@type': 'WebPage',
      '@id': `${canonicalUrl}#webpage`,
      url: canonicalUrl,
      name: finalTitle,
      description: finalDescription,
      isPartOf: { '@id': `${siteUrl}/#website` },
      about: { '@id': `${siteUrl}/#organization` },
      inLanguage: 'en-KE',
    };

    const breadcrumbSchema = page !== 'home' ? [{
      '@type': 'BreadcrumbList',
      '@id': `${canonicalUrl}#breadcrumb`,
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${siteUrl}/` },
        { '@type': 'ListItem', position: 2, name: finalTitle, item: canonicalUrl },
      ],
    }] : [];

    const productSchema = product ? [{
      '@type': 'Product',
      '@id': `${canonicalUrl}#product`,
      name: product.name,
      description: product.seoDescription,
      image: [`${siteUrl}${product.image}`],
      sku: productSlug(product),
      brand: { '@type': 'Brand', name: product.brand },
      category: product.category,
      keywords: product.keywords.join(', '),
      offers: {
        '@type': 'Offer',
        url: canonicalUrl,
        priceCurrency: 'KES',
        price: product.price,
        availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        itemCondition: 'https://schema.org/NewCondition',
      },
    }] : [];

    const faqSchema = page === 'faqs' ? [{ '@type': 'FAQPage', mainEntity: faqs.map(faq => ({ '@type': 'Question', name: faq.q, acceptedAnswer: { '@type': 'Answer', text: faq.a } })) }] : [];
    const articleSchema = ((page === 'knowledge' || page === 'blog') && title) ? [{ '@type': 'Article', headline: finalTitle, description: finalDescription, url: canonicalUrl, author: { '@type': 'Organization', name: 'NexHSE Africa', url: `${siteUrl}/` }, publisher: { '@id': `${siteUrl}/#organization` }, mainEntityOfPage: { '@type': 'WebPage', '@id': `${canonicalUrl}#webpage` } }] : [];

    structuredData.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': [organizationSchema, websiteSchema, pageSchema, ...breadcrumbSchema, ...productSchema, ...faqSchema, ...articleSchema],
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
  const [visible, setVisible] = useState(true);
  const [location] = useLocation();
  const { cart } = useShopCart();
  const hostname = window.location.hostname.toLowerCase();
  const quoteHref = hostname === 'shop.nexhse.co.ke' || hostname === 'admin.nexhse.co.ke' ? 'https://nexhse.co.ke/request-a-quote' : '/request-a-quote';
  const cartCount = Object.values(cart).reduce((sum, quantity) => sum + quantity, 0);
  const links = hostname === 'shop.nexhse.co.ke'
    ? [['Main site', 'https://nexhse.co.ke'], ['Shop', '/']]
    : hostname === 'admin.nexhse.co.ke'
      ? [['Public site', 'https://nexhse.co.ke'], ['Shop', 'https://shop.nexhse.co.ke']]
      : [['About', '/about'], ['Services', '/services'], ['Training', '/training'], ['Shop', 'https://shop.nexhse.co.ke'], ['Knowledge', '/knowledge'], ['Blog', '/blog'], ['Contact', '/contact']];
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
  useEffect(() => {
    if (open) {
      setVisible(true);
      return;
    }
    let settleTimer: number | undefined;
    let frame = 0;
    const handleScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        setVisible(false);
        if (settleTimer) window.clearTimeout(settleTimer);
        settleTimer = window.setTimeout(() => setVisible(true), 260);
      });
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (frame) window.cancelAnimationFrame(frame);
      if (settleTimer) window.clearTimeout(settleTimer);
    };
  }, [open]);
  return <header className={`site-header z-40 border-b border-[hsl(var(--border)/.7)] bg-[hsl(var(--background)/.93)] backdrop-blur-md ${visible || open ? 'is-visible' : ''}`}>
    <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 lg:px-8">
      <Logo />
      <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary navigation">
        {links.map(([label, href]) => { const isCurrent = location === href || location.startsWith(`${href}/`); const className = `focus-ring text-[13px] font-semibold transition-colors hover:text-[hsl(var(--primary))] ${isCurrent ? 'text-[hsl(var(--primary))]' : 'text-[hsl(var(--muted-foreground))]'}`; return href.startsWith('https://') ? <a key={href} href={href} className={className} data-testid={`link-nav-${label.toLowerCase()}`}>{label}</a> : <Link key={href} href={href} className={className} aria-current={isCurrent ? 'page' : undefined} data-testid={`link-nav-${label.toLowerCase()}`}>{label}</Link>; })}
      </nav>
      <div className="hidden items-center gap-3 lg:flex">
        <Link href={cartHref()} className="focus-ring relative inline-flex min-h-11 items-center gap-2 rounded-full border border-[hsl(var(--border))] px-4 text-[12px] font-bold text-[hsl(var(--primary))] transition-colors hover:border-[hsl(var(--accent))] hover:text-[hsl(var(--accent))]" data-testid="link-header-cart" aria-label="View shopping cart">
          <ShoppingCart size={15} />
          <span>Cart</span>
          {cartCount > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-[hsl(var(--primary))] px-1 text-[10px] font-bold text-white">{cartCount}</span>}
        </Link>
        <a href="https://wa.me/254705065852" target="_blank" rel="noreferrer" className="focus-ring flex min-h-11 items-center gap-2 rounded-full border border-[hsl(var(--border))] px-4 text-[12px] font-bold text-[hsl(var(--primary))] transition-colors hover:border-[hsl(var(--accent))] hover:text-[hsl(var(--accent))]" data-testid="link-whatsapp"><span className="h-2 w-2 rounded-full bg-[hsl(var(--accent))]" /> WhatsApp</a>
        {quoteHref.startsWith('https://') ? <a href={quoteHref} className="focus-ring flex min-h-11 items-center gap-2 rounded-full bg-[hsl(var(--primary))] px-5 text-[12px] font-bold tracking-wide text-white transition-transform hover:-translate-y-0.5" data-testid="link-header-quote">Request a quote <ArrowUpRight size={15} /></a> : <Link href={quoteHref} className="focus-ring flex min-h-11 items-center gap-2 rounded-full bg-[hsl(var(--primary))] px-5 text-[12px] font-bold tracking-wide text-white transition-transform hover:-translate-y-0.5" data-testid="link-header-quote">Request a quote <ArrowUpRight size={15} /></Link>}
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
        {links.map(([label, href]) => { const isCurrent = location === href || location.startsWith(`${href}/`); const className = `mobile-nav-link focus-ring flex min-h-12 items-center justify-between border-b border-[hsl(var(--border)/.65)] text-sm font-semibold ${isCurrent ? 'is-current' : ''}`; return href.startsWith('https://') ? <a onClick={() => setOpen(false)} key={href} href={href} className={className} data-testid={`link-mobile-${label.toLowerCase()}`}><span>{label}</span><ChevronRight size={16} className="text-[hsl(var(--accent))]" /></a> : <Link onClick={() => setOpen(false)} key={href} href={href} className={className} aria-current={isCurrent ? 'page' : undefined} data-testid={`link-mobile-${label.toLowerCase()}`}><span>{label}</span><ChevronRight size={16} className="text-[hsl(var(--accent))]" /></Link>; })}
        <Link onClick={() => setOpen(false)} href={cartHref()} className="mobile-nav-link focus-ring mt-2 flex min-h-12 items-center justify-between border-b border-[hsl(var(--border)/.65)] text-sm font-semibold" data-testid="link-mobile-cart"><span>Cart{cartCount > 0 ? ` (${cartCount})` : ''}</span><ShoppingCart size={16} className="text-[hsl(var(--accent))]" /></Link>
        {quoteHref.startsWith('https://') ? <a onClick={() => setOpen(false)} href={quoteHref} className="mobile-nav-quote focus-ring mt-4 flex min-h-12 items-center justify-center rounded-full bg-[hsl(var(--primary))] font-bold text-white" data-testid="link-mobile-quote">Request a quote <ArrowUpRight size={16} className="ml-2" /></a> : <Link onClick={() => setOpen(false)} href={quoteHref} className="mobile-nav-quote focus-ring mt-4 flex min-h-12 items-center justify-center rounded-full bg-[hsl(var(--primary))] font-bold text-white" data-testid="link-mobile-quote">Request a quote <ArrowUpRight size={16} className="ml-2" /></Link>}
      </div>
    </nav>
  </header>;
}

function MobileActions() {
  const [visible, setVisible] = useState(true);
  const hostname = window.location.hostname.toLowerCase();
  const quoteHref = hostname === 'shop.nexhse.co.ke' || hostname === 'admin.nexhse.co.ke' ? 'https://nexhse.co.ke/request-a-quote' : '/request-a-quote';

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

  if (hostname === 'admin.nexhse.co.ke') return null;
  return <div className={`fixed inset-x-3 bottom-3 z-30 grid grid-cols-3 overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card)/.94)] p-1 shadow-[0_12px_40px_rgba(15,52,68,.18)] backdrop-blur transition-all duration-200 md:hidden ${visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-[calc(100%+1rem)] opacity-0'}`} aria-hidden={!visible}>
    <a href="https://wa.me/254705065852" target="_blank" rel="noreferrer" className="focus-ring flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-xl text-[10px] font-bold text-[hsl(var(--accent))]" data-testid="link-sticky-whatsapp"><span className="text-xs">WhatsApp</span></a>
    <a href={`tel:${phone.replaceAll(' ', '')}`} className="focus-ring flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-xl text-[10px] font-bold text-[hsl(var(--primary))]" data-testid="link-sticky-call"><Phone size={15} /><span>Call</span></a>
      {quoteHref.startsWith('https://') ? <a href={quoteHref} className="focus-ring flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-xl bg-[hsl(var(--primary))] text-[10px] font-bold text-white" data-testid="link-sticky-quote"><ArrowUpRight size={15} /><span>Quote</span></a> : <Link href={quoteHref} className="focus-ring flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-xl bg-[hsl(var(--primary))] text-[10px] font-bold text-white" data-testid="link-sticky-quote"><ArrowUpRight size={15} /><span>Quote</span></Link>}
  </div>;
}

function Footer() {
  return <footer className="site-footer relative isolate overflow-hidden bg-[hsl(var(--primary))] pb-28 pt-16 text-white md:pb-10">
    <FooterSlideshow />
    <div className="relative z-10 mx-auto max-w-7xl px-5 lg:px-8">
      <div className="grid gap-12 border-b border-white/15 pb-12 lg:grid-cols-[1.5fr_1fr_1fr_1.2fr]">
        <div><Logo light /><p className="mt-6 max-w-sm text-sm leading-7 text-white/65">Workplace safety and professional development for organisations building stronger, safer ways of working across Africa.</p><span className="mt-6 inline-flex items-center gap-2 rounded-full border border-[hsl(var(--accent)/.5)] px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-[hsl(var(--secondary))]"><span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--accent))]" /> Safety first</span></div>
        <FooterList title="Explore" links={[['About', '/about'], ['Services', '/services'], ['Training', '/training'], ['Shop', '/shop'], ['Projects', '/projects'], ['Knowledge', '/knowledge'], ['HSE FAQs', '/faqs'], ['Blog', '/blog']]} />
        <FooterList title="Start a conversation" links={[['Contact', '/contact'], ['Request a quote', '/request-a-quote'], ['Accreditations', '/accreditations'], ['Testimonials', '/testimonials']]} />
        <div><p className="mono-label text-[10px] text-[hsl(var(--secondary))]">CONTACT</p><address className="mt-5 space-y-4 text-sm not-italic text-white/75"><a href="https://maps.google.com/?q=Rock+Centre+Outer+Ring+Road" className="focus-ring flex items-start gap-3" data-testid="link-footer-address"><MapPin size={17} className="mt-0.5 shrink-0 text-[hsl(var(--accent))]" />Rock Centre, Outer Ring Road</a><a href={`tel:${phone.replaceAll(' ', '')}`} className="focus-ring flex items-center gap-3" data-testid="link-footer-phone"><Phone size={16} className="text-[hsl(var(--accent))]" />{phone}</a><a href={`mailto:${email}`} className="focus-ring flex items-center gap-3" data-testid="link-footer-email"><Mail size={16} className="text-[hsl(var(--accent))]" />{email}</a></address><div className="footer-socials" aria-label="NexHSE Africa social profiles">{socialLinks.map(({ label, href, icon: Icon, testId }) => <a key={testId} href={href} target="_blank" rel="noreferrer" aria-label={label} title={label} className="footer-social-link focus-ring" data-testid={testId}><Icon aria-hidden="true" /></a>)}</div></div>
      </div>
      <FooterMap />
      <div className="flex flex-col gap-3 pt-6 text-[11px] text-white/45 sm:flex-row sm:items-center sm:justify-between"><span>© {new Date().getFullYear()} NexHSE Africa. Content subject to confirmation.</span><span>Privacy · Terms · Accessibility</span></div>
    </div>
  </footer>;
}

function FooterMap() {
  return <div className="footer-map"><p className="mono-label text-[9px] text-[hsl(var(--secondary))]">HEAD OFFICE / NAIROBI</p><div className="mt-3"><HeadOfficeMap /></div></div>;
}

function FooterSlideshow() {
  const [current, setCurrent] = useState(0);
  const visibleSlides = slideshowWindow(current, footerSlides.length);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrent(index => (index + 1) % heroSlides.length);
    }, 7000);
    return () => window.clearInterval(timer);
  }, []);

  return <div className="footer-slideshow" aria-hidden="true">
    {footerSlides.map((slide, index) => visibleSlides.has(index) ? <img key={slide.label} src={slide.image} alt="" loading="lazy" decoding="async" className={`footer-slideshow-image ${index === current ? 'is-active' : ''}`} /> : null)}
    <div className="footer-slideshow-blur" />
    <div className="footer-slideshow-wash" />
  </div>;
}

function MobileNavSlideshow() {
  const [current, setCurrent] = useState(0);
  const visibleSlides = slideshowWindow(current, footerSlides.length);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrent(index => (index + 1) % heroSlides.length);
    }, 7000);
    return () => window.clearInterval(timer);
  }, []);

  return <div className="mobile-nav-slideshow" aria-hidden="true">
    {footerSlides.map((slide, index) => visibleSlides.has(index) ? <img key={slide.label} src={slide.image} alt="" loading="lazy" decoding="async" className={`mobile-nav-slideshow-image ${index === current ? 'is-active' : ''}`} /> : null)}
    <div className="mobile-nav-slideshow-wash" />
  </div>;
}

function FooterList({ title, links }: { title: string; links: string[][] }) {
  const hostname = window.location.hostname.toLowerCase();
  const resolveHref = (href: string) => {
    if (hostname === 'shop.nexhse.co.ke') return href === '/shop' ? '/' : `${siteUrl}${href}`;
    if (hostname === 'admin.nexhse.co.ke') return href === '/shop' ? 'https://shop.nexhse.co.ke' : `${siteUrl}${href}`;
    return href === '/shop' ? 'https://shop.nexhse.co.ke' : href;
  };
  return <div><p className="mono-label text-[10px] text-[hsl(var(--secondary))]">{title}</p><div className="mt-5 space-y-3">{links.map(([label, href]) => { const target = resolveHref(href); const className = 'focus-ring block w-fit text-sm text-white/70 transition-colors hover:text-white'; return target.startsWith('https://') ? <a href={target} key={href} className={className} data-testid={`link-footer-${label.toLowerCase().replaceAll(' ', '-')}`}>{label}</a> : <Link href={target} key={href} className={className} data-testid={`link-footer-${label.toLowerCase().replaceAll(' ', '-')}`}>{label}</Link>; })}</div></div>;
}

function LegacyAdminOrderPanel() {
  const { orders, updateOrder } = useShopOrders();
  return <section className="mx-auto w-full max-w-7xl border-t border-[hsl(var(--border))] px-5 py-12 lg:px-8"><div className="flex items-end justify-between gap-4"><div><p className="mono-label text-[10px] text-[hsl(var(--accent))]">Live order queue</p><h2 className="display mt-2 text-3xl text-[hsl(var(--primary))]">Orders and payment rails</h2></div><span className="text-xs text-[hsl(var(--muted-foreground))]">{orders.length} order{orders.length === 1 ? '' : 's'}</span></div>{orders.length ? <div className="mt-6 space-y-3">{orders.map(order => <div key={order.id} className="grid gap-4 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 lg:grid-cols-[1.2fr_.7fr_.8fr_.8fr]"><div><p className="font-bold text-[hsl(var(--primary))]">{order.id}</p><p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">{order.delivery.name} · {order.delivery.county}</p><p className="mt-2 text-xs text-[hsl(var(--muted-foreground))]">{order.items.map(item => `${item.name} x${item.quantity}`).join(', ')}</p></div><div><p className="mono-label text-[9px] text-[hsl(var(--accent))]">Payment</p><p className="mt-2 text-xs font-bold text-[hsl(var(--primary))]">{order.paymentMethod}</p><p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">{order.paymentStatus}</p></div><div><p className="mono-label text-[9px] text-[hsl(var(--accent))]">Total</p><p className="mt-2 font-bold text-[hsl(var(--primary))]">KSh {order.total.toLocaleString()}</p><p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">{new Date(order.createdAt).toLocaleString()}</p></div><label className="text-xs font-bold text-[hsl(var(--primary))]">Order status<select value={order.orderStatus} onChange={event => updateOrder(order.id, { orderStatus: event.target.value as ShopOrder['orderStatus'] })} className="focus-ring mt-2 min-h-10 w-full rounded-xl border border-[hsl(var(--border))] bg-white px-2 text-xs outline-none" data-testid={`select-admin-order-status-${order.id}`}><option>received</option><option>processing</option><option>ready for dispatch</option><option>dispatched</option><option>completed</option></select></label></div>)}</div> : <p className="mt-6 rounded-2xl border border-dashed border-[hsl(var(--border))] p-8 text-sm text-[hsl(var(--muted-foreground))]">No orders have been placed yet. New checkout submissions will appear here automatically.</p>}</section>;
}

function AdminOrderPanel() {
  const { orders, updateOrder } = useShopOrders();
  const [selectedId, setSelectedId] = useState('');
  const [events, setEvents] = useState<{ id: string; eventType: string; status: string; note: string; trackingNumber?: string | null; carrier?: string | null; createdAt: string }[]>([]);
  const [tracking, setTracking] = useState<Record<string, { carrier: string; trackingNumber: string; expectedDeliveryAt: string }>>({});
  const [followups, setFollowups] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  useEffect(() => {
    if (!selectedId) return;
    void fetch(`/api/admin-data?resource=orders&id=${encodeURIComponent(selectedId)}`, { credentials: 'same-origin', cache: 'no-store' }).then(response => response.json()).then(result => setEvents(Array.isArray(result.events) ? result.events : [])).catch(() => setEvents([]));
  }, [selectedId, orders]);
  const saveTracking = (order: ShopOrder) => {
    const details = tracking[order.id] ?? { carrier: order.carrier ?? '', trackingNumber: order.trackingNumber ?? '', expectedDeliveryAt: order.expectedDeliveryAt ?? '' };
    updateOrder(order.id, details);
    setError('');
  };
  const logFollowup = (order: ShopOrder) => {
    const note = followups[order.id]?.trim();
    if (!note) return;
    updateOrder(order.id, { note });
    setFollowups(current => ({ ...current, [order.id]: '' }));
    setSelectedId(order.id);
  };
  return <section className="mx-auto w-full max-w-7xl border-t border-[hsl(var(--border))] px-5 py-12 lg:px-8"><div className="flex items-end justify-between gap-4"><div><p className="mono-label text-[10px] text-[hsl(var(--accent))]">Live order queue</p><h2 className="display mt-2 text-3xl text-[hsl(var(--primary))]">Orders, tracking and follow-up</h2></div><span className="text-xs text-[hsl(var(--muted-foreground))]">{orders.length} order{orders.length === 1 ? '' : 's'}</span></div>{orders.length ? <div className="mt-6 space-y-4">{orders.map(order => {
    const details = tracking[order.id] ?? { carrier: order.carrier ?? '', trackingNumber: order.trackingNumber ?? '', expectedDeliveryAt: order.expectedDeliveryAt?.slice(0, 10) ?? '' };
    return <article key={order.id} className="border-t border-[hsl(var(--border))] py-5"><div className="grid gap-5 xl:grid-cols-[1fr_.8fr_1.2fr]"><div><p className="font-bold text-[hsl(var(--primary))]">{order.id} · {order.delivery.name}</p><p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">{order.delivery.email} · {order.delivery.phone}</p><p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">{order.delivery.address}, {order.delivery.county}</p><p className="mt-3 text-xs text-[hsl(var(--muted-foreground))]">{order.items.map(item => `${item.name} x${item.quantity}`).join(', ')}</p><p className="mt-3 text-sm font-bold text-[hsl(var(--primary))]">KSh {order.total.toLocaleString()} · {new Date(order.createdAt).toLocaleString()}</p><a href={`mailto:${encodeURIComponent(order.delivery.email)}?subject=${encodeURIComponent(`NexHSE order ${order.id}`)}`} className="focus-ring mt-3 inline-flex text-xs font-bold text-[hsl(var(--accent))]">Email customer follow-up</a></div><div className="grid content-start gap-3"><label className="text-xs font-bold">Fulfilment status<select value={order.orderStatus} onChange={event => updateOrder(order.id, { orderStatus: event.target.value as ShopOrder['orderStatus'] })} className="focus-ring mt-1 min-h-10 w-full rounded-lg border border-[hsl(var(--border))] bg-white px-2 text-xs"><option value="received">Received</option><option value="processing">Processing</option><option value="ready for dispatch">Ready for dispatch</option><option value="dispatched">Dispatched</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option></select></label><label className="text-xs font-bold">Payment status<select value={order.paymentStatus} onChange={event => updateOrder(order.id, { paymentStatus: event.target.value as ShopOrder['paymentStatus'] })} className="focus-ring mt-1 min-h-10 w-full rounded-lg border border-[hsl(var(--border))] bg-white px-2 text-xs"><option value="pending">Pending</option><option value="awaiting confirmation">Awaiting confirmation</option><option value="paid">Paid</option><option value="failed">Failed</option><option value="refunded">Refunded</option></select></label></div><div><div className="grid gap-3 sm:grid-cols-3"><label className="text-xs font-bold">Carrier<input value={details.carrier} onChange={event => setTracking(current => ({ ...current, [order.id]: { ...details, carrier: event.target.value } }))} className="focus-ring mt-1 min-h-10 w-full rounded-lg border border-[hsl(var(--border))] px-2 text-xs" /></label><label className="text-xs font-bold">Tracking number<input value={details.trackingNumber} onChange={event => setTracking(current => ({ ...current, [order.id]: { ...details, trackingNumber: event.target.value } }))} className="focus-ring mt-1 min-h-10 w-full rounded-lg border border-[hsl(var(--border))] px-2 text-xs" /></label><label className="text-xs font-bold">Expected delivery<input type="date" value={details.expectedDeliveryAt} onChange={event => setTracking(current => ({ ...current, [order.id]: { ...details, expectedDeliveryAt: event.target.value } }))} className="focus-ring mt-1 min-h-10 w-full rounded-lg border border-[hsl(var(--border))] px-2 text-xs" /></label></div><button type="button" onClick={() => saveTracking(order)} className="focus-ring mt-3 min-h-9 rounded-lg border border-[hsl(var(--border))] px-3 text-xs font-bold">Save tracking details</button><label className="mt-4 block text-xs font-bold">Log a customer follow-up<textarea value={followups[order.id] ?? ''} onChange={event => setFollowups(current => ({ ...current, [order.id]: event.target.value }))} className="focus-ring mt-1 min-h-16 w-full rounded-lg border border-[hsl(var(--border))] p-2 text-xs" /></label><button type="button" onClick={() => logFollowup(order)} className="focus-ring mt-2 min-h-9 rounded-lg bg-[hsl(var(--primary))] px-3 text-xs font-bold text-white">Record follow-up</button>{selectedId === order.id && events.length > 0 && <div className="mt-4 border-l border-[hsl(var(--border))] pl-3">{events.slice().reverse().map(event => <p key={event.id} className="mb-2 text-xs text-[hsl(var(--muted-foreground))]">{new Date(event.createdAt).toLocaleString()} · {event.status}{event.note ? ` · ${event.note}` : ''}</p>)}</div>}</div></div></article>;
  })}</div> : <p className="mt-6 text-sm text-[hsl(var(--muted-foreground))]">No orders have been recorded yet.</p>}{error && <p role="alert" className="mt-3 text-sm text-[hsl(var(--destructive))]">{error}</p>}</section>;
}

function SiteStoreProvider({ children }: { children: ReactNode }) {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const pendingRef = useRef(new Map<string, (value: unknown) => void>());
  const queueRef = useRef<{ type: 'get' | 'set'; key: SiteStoreKey; value?: unknown; requestId?: string }[]>([]);
  const requestCountRef = useRef(0);
  const isRemoteHost = ['shop.nexhse.co.ke', 'admin.nexhse.co.ke'].includes(window.location.hostname.toLowerCase());
  const [bridgeReady, setBridgeReady] = useState(!isRemoteHost);

  useEffect(() => {
    if (!isRemoteHost) return;
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== siteUrl || !event.data) return;
      if (event.data.type === 'bridge-ready') {
        setBridgeReady(true);
        for (const message of queueRef.current.splice(0)) frameRef.current?.contentWindow?.postMessage(message, siteUrl);
      } else if (event.data.type === 'store-result') {
        const resolve = pendingRef.current.get(event.data.requestId);
        if (resolve) {
          pendingRef.current.delete(event.data.requestId);
          resolve(event.data.value);
        }
      } else if (event.data.type === 'store-update' && event.data.key) {
        window.dispatchEvent(new CustomEvent('nexhse-store-sync', { detail: { key: event.data.key, value: event.data.value } }));
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [isRemoteHost]);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (!event.key || !siteStoreKeys.includes(event.key as SiteStoreKey)) return;
      let value: unknown = null;
      try { value = event.newValue === null ? null : JSON.parse(event.newValue); } catch { return; }
      window.dispatchEvent(new CustomEvent('nexhse-store-sync', { detail: { key: event.key, value } }));
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const request = (message: { type: 'get' | 'set'; key: SiteStoreKey; value?: unknown; requestId?: string }) => {
    if (bridgeReady) frameRef.current?.contentWindow?.postMessage(message, siteUrl);
    else queueRef.current.push(message);
  };

  const value = useMemo<SiteStoreContextValue>(() => ({
    read: <T,>(key: SiteStoreKey, fallback: T) => {
      const readLocal = () => {
        try {
          const raw = window.localStorage.getItem(key);
          if (raw === null) return fallback;
          const parsed = JSON.parse(raw);
          return parsed ?? fallback as T;
        } catch { return fallback; }
      };
      if (key === 'nexhse-shop-cart') {
        if (!isRemoteHost) return Promise.resolve(readLocal());
        const requestId = `get-${++requestCountRef.current}`;
        return new Promise<T>(resolve => {
          pendingRef.current.set(requestId, result => resolve((result ?? readLocal()) as T));
          request({ type: 'get', key, requestId });
        });
      }
      const remoteRead = fetch(`/api/site-store?key=${encodeURIComponent(key)}`, { credentials: 'same-origin', cache: 'no-store' }).then(async response => {
        if (!response.ok) throw new Error('Shared store not available');
        return (await response.json()).value as T | null;
      });
      if (!isRemoteHost) return remoteRead.catch(() => readLocal()).then(result => result ?? fallback);
      const readBridge = () => new Promise<T | null>(resolve => {
        const requestId = `get-${++requestCountRef.current}`;
        pendingRef.current.set(requestId, result => resolve((result ?? null) as T | null));
        request({ type: 'get', key, requestId });
      });
      return remoteRead.then(async result => result ?? await readBridge()).catch(() => readBridge()).then(result => result ?? readLocal());
    },
    write: (key, data) => {
      try { window.localStorage.setItem(key, JSON.stringify(data)); } catch { return; }
      if (isRemoteHost) request({ type: 'set', key, value: data });
      if (key !== 'nexhse-shop-cart') void fetch('/api/site-store', { method: 'PUT', credentials: 'same-origin', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ key, value: data }) }).catch(() => undefined);
    },
    appendOrder: async (order, fallback) => {
      try {
        const response = await fetch('/api/site-store', { method: 'POST', credentials: 'same-origin', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ key: 'nexhse-shop-orders', order }) });
        if (!response.ok) {
          const result = await response.json().catch(() => null);
          throw new Error(result?.error ?? 'We could not save your order. Please try again.');
        }
        return (await response.json()).order as ShopOrder;
      } catch (error) {
        if (error instanceof Error) throw error;
        throw new Error('We could not save your order. Please try again.');
      }
    },
  }), [bridgeReady, isRemoteHost]);

  return <SiteStoreContext.Provider value={value}>{children}{isRemoteHost && <iframe ref={frameRef} src={`${siteUrl}/storage-bridge.html`} onLoad={() => frameRef.current?.contentWindow?.postMessage({ type: 'bridge-init' }, siteUrl)} title="NexHSE shared storage bridge" tabIndex={-1} aria-hidden="true" className="site-storage-bridge" />}</SiteStoreContext.Provider>;
}

function useSiteStore<T>(key: SiteStoreKey, fallback: T): [T, (value: T | ((current: T) => T)) => void] {
  const context = useContext(SiteStoreContext);
  if (!context) throw new Error('SiteStoreProvider is missing');

  const readLocal = () => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw === null) return fallback;
      const parsed = JSON.parse(raw);
      return parsed ?? fallback;
    } catch {
      return fallback;
    }
  };

  const [value, setValue] = useState<T>(() => readLocal());
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    void context.read(key, fallback).then(result => {
      if (!active) return;
      const localValue = readLocal();
      const nextValue = typeof result === 'object' && result && typeof localValue === 'object' && localValue && !Array.isArray(result) && !Array.isArray(localValue) && Object.keys(localValue).length > 0
        ? { ...fallback, ...localValue, ...result }
        : (result ?? localValue ?? fallback);
      if (JSON.stringify(value) !== JSON.stringify(nextValue)) setValue(nextValue as T);
      setLoaded(true);
    });
    const onSync = (event: Event) => {
      const detail = (event as CustomEvent<{ key: SiteStoreKey; value: T }>).detail;
      if (detail.key === key) setValue(detail.value);
    };
    window.addEventListener('nexhse-store-sync', onSync);
    return () => { active = false; window.removeEventListener('nexhse-store-sync', onSync); };
  }, [context, key, fallback]);

  useEffect(() => {
    const remoteStoreHost = ['shop.nexhse.co.ke', 'admin.nexhse.co.ke'].includes(window.location.hostname.toLowerCase());
    const refresh = () => {
      if (document.visibilityState !== 'visible') return;
      void context.read(key, fallback).then(remote => {
        const localValue = readLocal();
        const nextValue = remote ?? localValue ?? fallback;
        setValue(current => JSON.stringify(current) === JSON.stringify(nextValue) ? current : nextValue as T);
      });
    };
    const timer = remoteStoreHost ? window.setInterval(refresh, 60_000) : undefined;
    window.addEventListener('focus', refresh);
    return () => { if (timer) window.clearInterval(timer); window.removeEventListener('focus', refresh); };
  }, [context, key, fallback]);

  useEffect(() => {
    if (!loaded) return;
    const currentValue = value;
    try { window.localStorage.setItem(key, JSON.stringify(currentValue)); } catch { /* ignore storage quota errors */ }
    context.write(key, currentValue);
  }, [context, key, loaded, value]);

  return [value, setValue];
}

function Shell({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const isAdminHost = window.location.hostname.toLowerCase() === 'admin.nexhse.co.ke';
  const showAdminNav = isAdminHost || location.startsWith('/admin');
  if (showAdminNav) return <div className="admin-app-shell min-h-[100dvh]"><AdminWorkspaceHeader isAdminHost={isAdminHost} />{children}</div>;
  return <div className="grain min-h-[100dvh]"><CursorAtmosphere /><Navbar /><CheckoutGatewayStatusNotice location={location} /><PageCanvasArtwork />{children}<CartDock /><Footer /><MobileActions /></div>;
}

function AdminWorkspaceHeader({ isAdminHost }: { isAdminHost: boolean }) {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    let frame = 0;
    let settleTimer: number | undefined;
    const handleScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        setVisible(false);
        if (settleTimer) window.clearTimeout(settleTimer);
        settleTimer = window.setTimeout(() => setVisible(true), 260);
      });
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (frame) window.cancelAnimationFrame(frame);
      if (settleTimer) window.clearTimeout(settleTimer);
    };
  }, []);

  return <div className={`admin-header-shell ${visible ? 'is-visible' : ''}`}><header className="admin-topbar"><a href={isAdminHost ? '/' : '/admin'} className="focus-ring flex items-center gap-3" aria-label="NexHSE operations home"><img src={nexhseLogo} alt="" /><span><strong>NexHSE</strong><small>OPERATIONS</small></span></a><span className="admin-topbar-status"><span /> Workspace</span></header><AdminWorkspaceNavigation /></div>;
}

function CheckoutGatewayStatusNotice({ location }: { location: string }) {
  const isCheckout = location === '/checkout' || location === '/shop/checkout';
  const [gatewayStatus, setGatewayStatus] = useState<PaymentGatewayStatus | null>(null);

  useEffect(() => {
    if (!isCheckout) return;
    void getPaymentGatewayStatus().then(setGatewayStatus).catch(() => setGatewayStatus({ stripeEnabled: false, stripeReady: false, mpesaEnabled: false, mpesaReady: false, requiresConfiguration: true, mode: 'unconfigured' }));
  }, [isCheckout]);

  if (!isCheckout || !gatewayStatus?.requiresConfiguration) return null;
  return <div role="status" className="mx-auto mt-4 max-w-7xl px-5 lg:px-8"><p className="rounded-lg border border-[hsl(var(--accent)/.35)] bg-[hsl(var(--secondary)/.65)] px-4 py-3 text-xs leading-5 text-[hsl(var(--primary))]">Online card and M-Pesa payments are not configured yet. Choose Bank transfer or Pay on delivery to place an order.</p></div>;
}

function AdminWorkspaceNavigation() {
  const isAdminHost = window.location.hostname.toLowerCase() === 'admin.nexhse.co.ke';
  const base = isAdminHost ? '' : '/admin';
  const [isOwner, setIsOwner] = useState(false);
  const [location] = useLocation();
  useEffect(() => { void fetch('/api/admin-session', { credentials: 'same-origin', cache: 'no-store' }).then(response => response.json()).then(result => setIsOwner(result.user?.role === 'owner')).catch(() => undefined); }, []);
  const allLinks = [['Overview', base || '/'], ['Orders', `${base}/orders`], ['Customers', `${base}/customers`], ['Service desk', `${base}/service`], ['Quotes', `${base}/quotes`], ['Invoices', `${base}/invoices`], ['Products', `${base}/products`], ['Promotions', `${base}/promotions`], ['Services', `${base}/services`], ['Team access', `${base}/users`], ['Blog', `${base}/blog`]];
  const links = isOwner ? allLinks : allLinks.filter(([label]) => ['Overview', 'Orders', 'Customers', 'Service desk'].includes(label));
  const signOut = async () => {
    await fetch('/api/admin-session', { method: 'DELETE', credentials: 'same-origin' });
    try {
      const supabase = await getSupabaseBrowserClient();
      await supabase.auth.signOut();
    } catch { /* Legacy-only sessions may not have Supabase configured. */ }
    window.location.reload();
  };
  return <nav className="admin-workspace-nav" aria-label="Admin workspace">{links.map(([label, href]) => { const active = location === href || (href !== (base || '/') && location.startsWith(`${href}/`)); return <Link key={label} href={href} className={`focus-ring ${active ? 'is-active' : ''}`} aria-current={active ? 'page' : undefined} data-testid={`link-admin-${label.toLowerCase().replaceAll(' ', '-')}`}>{label}</Link>; })}<button type="button" onClick={() => void signOut()} className="focus-ring admin-sign-out" data-testid="button-admin-sign-out">Sign out</button></nav>;
}

function CartDock() {
  const { cart, addToCart, removeFromCart, clearCart } = useShopCart();
  const { products } = useShopProducts();
  const [open, setOpen] = useState(false);
  const count = Object.values(cart).reduce((sum, quantity) => sum + quantity, 0);
  if (!count) return null;

  const items = products.filter(product => cart[product.name]).map(product => ({
    ...product,
    quantity: cart[product.name] ?? 0,
    lineTotal: product.price * (cart[product.name] ?? 0),
  }));
  const total = items.reduce((sum, item) => sum + item.lineTotal, 0);

  return <div className={`cart-dock ${open ? 'cart-dock--open' : ''}`} data-testid="link-cart-dock">
    <button type="button" onClick={() => setOpen(current => !current)} className="cart-dock-toggle focus-ring" aria-expanded={open} aria-label={open ? 'Collapse cart details' : 'Expand cart details'}>
      <span className="cart-dock-summary">
        <span className="cart-dock-header mono-label text-[9px] text-[hsl(var(--secondary))]">Your cart</span>
        <strong>{count} item{count === 1 ? '' : 's'}</strong>
      </span>
      <span className="cart-dock-total"><ShoppingCart size={15} /> KSh {total.toLocaleString()} <ChevronDown size={14} className={open ? 'rotate-180' : ''} /></span>
    </button>

    {open && <div className="cart-dock-panel">
      <div className="cart-dock-panel-header">
        <p className="mono-label text-[9px] text-[hsl(var(--accent))]">Order details</p>
        {items.length > 1 && <button type="button" onClick={clearCart} className="focus-ring cart-dock-clear" data-testid="button-cart-clear">Clear all</button>}
      </div>

      <div className="cart-dock-items">
        {items.map(item => <div key={item.name} className="cart-dock-item">
          <div className="cart-dock-item-meta">
            <img src={item.image} alt={item.name} />
            <div>
              <p>{item.name}</p>
              <span>KSh {item.price.toLocaleString()} each</span>
            </div>
          </div>
          <div className="cart-dock-item-controls">
            <button type="button" onClick={() => removeFromCart(item.name)} className="focus-ring" aria-label={`Remove one ${item.name}`} data-testid={`button-cart-remove-${item.name.toLowerCase().replaceAll(' ', '-')}`}>−</button>
            <span>{item.quantity}</span>
            <button type="button" onClick={() => addToCart(item.name)} className="focus-ring" aria-label={`Add one ${item.name}`} data-testid={`button-cart-add-${item.name.toLowerCase().replaceAll(' ', '-')}`}>+</button>
          </div>
          <strong>KSh {item.lineTotal.toLocaleString()}</strong>
        </div>)}
      </div>

      <div className="cart-dock-footer">
        <div>
          <span className="mono-label text-[9px] text-[hsl(var(--muted-foreground))]">Subtotal</span>
          <strong>KSh {total.toLocaleString()}</strong>
        </div>
        <Link href={cartHref()} className="focus-ring cart-dock-checkout" data-testid="link-cart-checkout" onClick={() => setOpen(false)}>View cart <ArrowUpRight size={15} /></Link>
      </div>
    </div>}
  </div>;
}

function CursorAtmosphere() {
  const orbRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number | null>(null);
  const positionRef = useRef({ x: -100, y: -100 });

  useEffect(() => {
    const move = (event: PointerEvent) => {
      positionRef.current = { x: event.clientX, y: event.clientY };
      if (frameRef.current !== null) return;
      frameRef.current = window.requestAnimationFrame(() => {
        if (orbRef.current) orbRef.current.style.transform = `translate3d(${positionRef.current.x}px, ${positionRef.current.y}px, 0)`;
        frameRef.current = null;
      });
    };
    window.addEventListener('pointermove', move, { passive: true });
    return () => {
      window.removeEventListener('pointermove', move);
      if (frameRef.current !== null) window.cancelAnimationFrame(frameRef.current);
    };
  }, []);

  return <div ref={orbRef} className="cursor-atmosphere" aria-hidden="true"><span /></div>;
}

function PageCanvasArtwork() {
  return <div className="page-canvas-art" aria-hidden="true"><span /><span /><span /><i /><i /></div>;
}

function Breadcrumbs({ items }: { items: string[][] }) {
  return <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-2 text-[11px] font-semibold text-[hsl(var(--muted-foreground))]"><Link href="/" className="focus-ring hover:text-[hsl(var(--accent))]" data-testid="link-breadcrumb-home">Home</Link>{items.map(([label, href]) => <span key={label} className="flex items-center gap-2"><ChevronRight size={12} /><Link href={href} className="focus-ring hover:text-[hsl(var(--accent))]" data-testid={`link-breadcrumb-${label.toLowerCase().replaceAll(' ', '-')}`}>{label}</Link></span>)}</nav>;
}

function OrganicBackdrop({ dark = false, vivid = false }: { dark?: boolean; vivid?: boolean }) {
  return <div className={`organic-backdrop ${dark ? 'organic-backdrop--dark' : ''} ${vivid ? 'organic-backdrop--vivid' : ''}`} aria-hidden="true"><span /><span /><span /><span /><span /></div>;
}

function OrganicImage({ src, alt, className = '', variant = 'quiet', loading = 'lazy', style }: { src: string; alt: string; className?: string; variant?: 'quiet' | 'dark'; loading?: 'lazy' | 'eager'; style?: CSSProperties }) {
  return <div className={`organic-image organic-image--${variant} ${className}`} style={style}><img src={src} alt={alt} loading={loading} /></div>;
}

const organicBorderPresets = [
  { image: '46% 54% 32% 68% / 62% 36% 64% 38%', back: '60% 40% 55% 45% / 42% 61% 39% 58%', outline: '37% 63% 45% 55% / 58% 40% 60% 42%' },
  { image: '62% 38% 57% 43% / 40% 63% 37% 60%', back: '42% 58% 34% 66% / 61% 43% 57% 39%', outline: '54% 46% 64% 36% / 35% 60% 40% 65%' },
  { image: '34% 66% 48% 52% / 55% 31% 69% 45%', back: '53% 47% 65% 35% / 38% 62% 38% 62%', outline: '64% 36% 42% 58% / 59% 35% 65% 41%' },
  { image: '55% 45% 66% 34% / 35% 57% 43% 65%', back: '36% 64% 44% 56% / 60% 37% 63% 40%', outline: '49% 51% 33% 67% / 42% 66% 34% 58%' },
  { image: '40% 60% 38% 62% / 67% 43% 57% 33%', back: '66% 34% 53% 47% / 35% 57% 43% 65%', outline: '34% 66% 59% 41% / 55% 40% 60% 45%' },
];

function randomOrganicBorders(count: number) {
  const shuffled = [...organicBorderPresets];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return Array.from({ length: count }, (_, index) => shuffled[index % shuffled.length]);
}

function OrganicSlideshow({ slides, className, variant = 'quiet', label }: { slides: { image: string; alt: string }[]; className: string; variant?: 'quiet' | 'dark'; label: string }) {
  const [current, setCurrent] = useState(() => Math.floor(Math.random() * slides.length));
  const [reducedMotion, setReducedMotion] = useState(false);
  const [borders] = useState(() => randomOrganicBorders(slides.length));

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const syncMotionPreference = () => setReducedMotion(media.matches);
    syncMotionPreference();
    media.addEventListener?.('change', syncMotionPreference);
    return () => media.removeEventListener?.('change', syncMotionPreference);
  }, []);

  useEffect(() => {
    if (reducedMotion || slides.length < 2) return;
    const timer = window.setInterval(() => setCurrent(index => (index + 1) % slides.length), 6500);
    return () => window.clearInterval(timer);
  }, [reducedMotion, slides.length]);

  const style = {
    '--organic-image-radius': borders[current].image,
    '--organic-before-radius': borders[current].back,
    '--organic-after-radius': borders[current].outline,
  } as CSSProperties;
  const visibleSlides = slideshowWindow(current, slides.length);

  return <div className={`organic-slideshow ${className}`} role="region" aria-roledescription="carousel" aria-label={label} data-testid={`slideshow-${label.toLowerCase().replaceAll(' ', '-')}`}>
    <div className={`organic-image organic-image--${variant} organic-slideshow-frame`} style={style}>
      {slides.map((slide, index) => visibleSlides.has(index) ? <img key={slide.image} src={slide.image} alt={index === current ? slide.alt : ''} aria-hidden={index !== current} loading="lazy" decoding="async" className={`organic-slideshow-image ${index === current ? 'is-active' : ''}`} /> : null)}
    </div>
  </div>;
}

const heroSlides = [
  { image: '/assets/slide-01.jpeg', alt: 'NexHSE Africa workplace safety practice', label: 'FIELD PRACTICE 01', caption: 'Learning where the work happens.' },
  { image: '/assets/slide-02.jpeg', alt: 'NexHSE Africa safety training and field work', label: 'BUILD CAPABILITY 01', caption: 'Knowledge that travels back to the workplace.' },
  { image: '/assets/slide-033.jpeg', alt: 'NexHSE Africa environmental and workplace safety services', label: 'CONTROL EXPOSURE 01', caption: 'Practical decisions for changing conditions.' },
  { image: '/assets/slide-04.jpeg', alt: 'NexHSE Africa safety professionals at work', label: 'PREPARE TO RESPOND 01', caption: 'Calm response starts before the emergency.' },
  { image: '/assets/slide-05.jpeg', alt: 'NexHSE Africa practical safety services', label: 'SAFER WORKPLACES 01', caption: 'Protect people and strengthen operations.' },
  { image: heroImage, alt: 'Safety professionals in protective equipment during a practical construction-site training session', label: 'FIELD PRACTICE 02', caption: 'Learning where the work happens.' },
  { image: siteTrainingImage, alt: 'Workers learning safety practice in an active operational environment', label: 'BUILD CAPABILITY 02', caption: 'Knowledge that travels back to the workplace.' },
  { image: environmentalImage, alt: 'Environmental management and field practice in a natural workplace setting', label: 'CONTROL EXPOSURE 02', caption: 'Practical decisions for changing conditions.' },
  { image: fireImage, alt: 'Two workplace trainees operating a fire extinguisher during a practical exercise', label: 'PREPARE TO RESPOND 02', caption: 'Calm response starts before the emergency.' },
];

const footerSlides = [
  ...heroSlides,
  ...workAtHeightImages.map((image, index) => ({
    image,
    alt: `NexHSE work-at-height practice, image ${index + 1}`,
    label: `WORK AT HEIGHT ${String(index + 1).padStart(2, '0')}`,
    caption: 'High-risk work controlled through practical competence.',
  })),
];

const trainingDevelopmentSlides = [
  { image: trainingRoomImage, alt: 'NexHSE training session with workers learning in a classroom' },
  { image: fireImage, alt: 'Trainees practising workplace fire response with an extinguisher' },
  { image: firstAidImage, alt: 'First-aid training equipment prepared for practical instruction' },
  { image: heightsImage, alt: 'Work-at-height safety equipment used for training' },
  { image: fieldImage, alt: 'Safety training and field practice in an active workplace' },
  ...workAtHeightImages.map((image, index) => ({ image, alt: `Work-at-height training and fall protection practice, image ${index + 1}` })),
];

const conversationSlides = [
  { image: fieldImage, alt: 'NexHSE professionals applying safety practice in the field' },
  { image: heroImage, alt: 'Safety professionals in protective equipment during site training' },
  { image: fireImage, alt: 'Workplace trainees practising a fire response' },
  { image: environmentalImage, alt: 'Environmental management in a working landscape' },
  ...workAtHeightImages.map((image, index) => ({ image, alt: `Work-at-height safety practice, image ${index + 1}` })),
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
    const timer = window.setInterval(() => setCurrent(index => (index + 1) % heroSlides.length), 7000);
    return () => window.clearInterval(timer);
  }, [paused, reducedMotion]);

  const goTo = (index: number) => setCurrent((index + heroSlides.length) % heroSlides.length);
  const goPrevious = () => goTo(current - 1);
  const goNext = () => goTo(current + 1);
  const visibleSlides = slideshowWindow(current, heroSlides.length);

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
    {heroSlides.map((slide, index) => visibleSlides.has(index) ? <img
      key={slide.label}
      src={slide.image}
      alt={index === current ? slide.alt : ''}
      aria-hidden={index !== current}
      loading={index === 0 ? 'eager' : 'lazy'}
      decoding="async"
      className={`hero-slide-image absolute inset-0 h-full w-full object-cover object-center ${index === current ? 'scale-100 opacity-55' : 'scale-105 opacity-0'}`}
    /> : null)}
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

function PageHeroSlideshow({ image, alt }: { image: string; alt: string }) {
  const slides = [
    { image, alt },
    { image: trainingImage, alt: 'NexHSE professionals learning workplace safety practice' },
    { image: heightsImage, alt: 'NexHSE professionals demonstrating safe work at height' },
    { image: fireImage, alt: 'NexHSE professionals practising fire safety response' },
  ];
  const [current, setCurrent] = useState(0);
  useEffect(() => {
    const timer = window.setInterval(() => setCurrent(index => (index + 1) % slides.length), 7000);
    return () => window.clearInterval(timer);
  }, [slides.length]);
  return <div className={`page-hero-slideshow page-hero-slideshow--${current}`} aria-live="polite"><div className="page-hero-slideshow-outline" aria-hidden="true" />{slides.map((slide, index) => <img key={`${slide.image}-${index}`} src={slide.image} alt={index === current ? slide.alt : ''} aria-hidden={index !== current} className={`page-hero-slide ${index === current ? 'is-active' : ''}`} />)}<div className="page-hero-slideshow-dots" aria-hidden="true">{slides.map((slide, index) => <span key={slide.image} className={index === current ? 'is-active' : ''} />)}</div></div>;
}

function PageIntro({ eyebrow, title, text, image, service, hideFieldLabel = eyebrow === 'Safety and Growth' || eyebrow === 'SERVICE PORTFOLIO' }: { eyebrow: string; title: string; text: string; image?: string; service?: Service; hideFieldLabel?: boolean }) {
  return <><section className="relative overflow-hidden bg-[hsl(var(--primary))] text-white"><OrganicBackdrop dark /><div className="relative mx-auto grid max-w-7xl items-end gap-10 px-5 pb-16 pt-14 lg:grid-cols-[1fr_1fr] lg:px-8 lg:pb-20 lg:pt-20"><div className="reveal"><p className="mono-label mb-5 text-[10px] text-[hsl(var(--secondary))]">{eyebrow}</p><h1 className="display max-w-3xl text-5xl leading-[1.02] tracking-[-.045em] sm:text-6xl">{title}</h1><p className="mt-6 max-w-xl text-base leading-7 text-white/70">{text}</p></div>{image && (service ? <ServiceMediaSlideshow service={service} className="page-hero-slideshow relative overflow-hidden" /> : <PageHeroSlideshow image={image} alt="NexHSE professionals learning and applying workplace safety practice" />)}{!hideFieldLabel && <span className="absolute bottom-5 left-5 mono-label text-[9px] text-white/75 lg:bottom-7 lg:left-auto lg:right-8">FIELD / PRACTICE / PEOPLE</span>}</div><div className="pointer-events-none absolute -right-24 -top-40 h-96 w-96 rounded-full border border-[hsl(var(--accent)/.3)]" /></section><div className="hero-linework" aria-hidden="true"><span /><span /><span /><i /><i /></div>{eyebrow === 'Contact NexHSE Africa' && <div className="head-office-map-wrap"><HeadOfficeMap /></div>}</>;
}

const shopHeroSlides = [
  { image: '/assets/shop/helmet.jpg', alt: 'Industrial safety helmet from the NexHSE shop catalogue' },
  { image: '/assets/shop/boots.jpg', alt: 'Protective safety boots from the NexHSE shop catalogue' },
  { image: '/assets/shop/6kg.jpg', alt: 'Fire extinguisher from the NexHSE shop catalogue' },
  { image: '/assets/shop/fire-blanket.jpg', alt: 'Fire blanket from the NexHSE shop catalogue' },
  { image: '/assets/shop/vest.jpg', alt: 'High visibility vest from the NexHSE shop catalogue' },
];

function ShopHero() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => setCurrent(index => (index + 1) % shopHeroSlides.length), 7000);
    return () => window.clearInterval(timer);
  }, []);

  return <section className="relative overflow-hidden bg-[hsl(var(--primary))] text-white"><OrganicBackdrop dark /><div className="relative mx-auto grid max-w-7xl items-end gap-10 px-5 pb-16 pt-14 lg:grid-cols-[1fr_1fr] lg:px-8 lg:pb-20 lg:pt-20"><div className="reveal"><p className="mono-label mb-5 text-[10px] text-[hsl(var(--secondary))]">Shop NexHSE</p><h1 className="display max-w-3xl text-5xl leading-[1.02] tracking-[-.045em] sm:text-6xl">Essential protection.<br /><em className="font-medium text-[hsl(var(--secondary))]">Ready to order.</em></h1><p className="mt-6 max-w-xl text-base leading-7 text-white/70">PPE and fire equipment selected for safer workplaces, prepared teams and practical site readiness.</p><a href="#shop-catalogue" className="focus-ring mt-8 inline-flex min-h-11 items-center gap-2 rounded-full bg-[hsl(var(--accent))] px-5 text-xs font-bold text-white">Browse catalogue <ArrowUpRight size={15} /></a></div><div className={`page-hero-slideshow shop-hero-slideshow page-hero-slideshow--${current}`} aria-live="polite"><div className="page-hero-slideshow-outline" aria-hidden="true" />{shopHeroSlides.map((slide, index) => <img key={slide.image} src={slide.image} alt={index === current ? slide.alt : ''} aria-hidden={index !== current} className={`page-hero-slide ${index === current ? 'is-active' : ''}`} />)}<div className="page-hero-slideshow-dots" aria-label="Shop catalogue images">{shopHeroSlides.map((slide, index) => <button key={slide.image} type="button" onClick={() => setCurrent(index)} aria-label={`Show shop catalogue slide ${index + 1}`} className="focus-ring flex h-5 w-5 items-center justify-center"><span className={index === current ? 'is-active' : ''} /></button>)}</div></div><span className="absolute bottom-5 left-5 mono-label text-[9px] text-white/75 lg:bottom-7 lg:left-auto lg:right-8">PPE / FIRE EQUIPMENT / READINESS</span></div><div className="hero-linework" aria-hidden="true"><span /><span /><span /><i /><i /></div></section>;
}

function HeadOfficeMap() {
  return <div className="head-office-map"><iframe title="NexHSE Africa head office location" src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.773512027595!2d36.88958127311163!3d-1.3112601356500362!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f13222322a00d%3A0x3e94434aab7adc4f!2sNexHSE%20Africa!5e0!3m2!1sen!2ske!4v1789582869273!5m2!1sen!2ske" width="600" height="450" loading="lazy" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen /></div>;
}

function SectionHeader({ eyebrow, title, text, action }: { eyebrow: string; title: string; text?: string; action?: ReactNode }) {
  return <div className="mb-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between"><div><p className="mono-label text-[10px] font-bold text-[hsl(var(--accent))]">{eyebrow}</p><h2 className="display mt-3 max-w-2xl text-4xl leading-[1.08] tracking-[-.04em] text-[hsl(var(--primary))] sm:text-5xl">{title}</h2>{text && <p className="mt-4 max-w-xl text-sm leading-7 text-[hsl(var(--muted-foreground))]">{text}</p>}</div>{action}</div>;
}

function TrustStrip() {
  return null;
}

function ServiceGallery() {
  const [cycle, setCycle] = useState(0);
  const galleryPool = [
    [trainingRoomImage, 'Training & capacity building', 'Practical learning that travels back to the workplace.'],
    [riskReviewImage, 'Assessments & policy', 'Clearer evidence for better safety decisions.'],
    [siteTrainingImage, 'Specialised site support', 'Safety practice grounded in real operating conditions.'],
    [environmentalImage, 'Environmental management', 'Responsible operations supported by practical systems.'],
    [firstAidImage, 'First aid readiness', 'Prepared responders and equipment when it matters.'],
    [fireImage, 'Fire safety practice', 'Calm response starts with practical preparation.'],
    [heightsImage, 'Work at height', 'High-risk work controlled through real competence.'],
    [fieldImage, 'Field-led oversight', 'Safety decisions grounded in the working environment.'],
    [constructionTrainingImage, 'Construction safety', 'Continuous coverage across the project lifecycle.'],
    [auditMeetingImage, 'Safety systems', 'Policies and audits that support consistent practice.'],
  ];
  const gallerySlots = [
    { offset: 0, tilt: -3.5, duration: '4.8s' },
    { offset: 3, tilt: 2.4, duration: '6.2s' },
    { offset: 6, tilt: -1.8, duration: '5.4s' },
    { offset: 8, tilt: 4.1, duration: '7s' },
  ];
  useEffect(() => {
    const timer = window.setInterval(() => setCycle(value => value + 1), 7000);
    return () => window.clearInterval(timer);
  }, []);
  return <section className="service-gallery col-span-full mt-12 border-t border-[hsl(var(--border))] pt-16" aria-labelledby="service-gallery-title"><SectionHeader eyebrow="Field gallery" title="The work is practical, visible and people-centred." text="A changing view of the environments and learning moments behind the NexHSE service portfolio." /><div className="service-gallery-grid">{gallerySlots.map((slot, index) => { const [image, label, caption] = galleryPool[(cycle * gallerySlots.length + slot.offset) % galleryPool.length]; return <figure key={`gallery-slot-${index}`} className="service-gallery-item group" style={{ '--gallery-tilt': `${slot.tilt}deg`, '--gallery-speed': slot.duration } as CSSProperties}><div className="service-gallery-frame"><img key={`${image}-${cycle}`} src={image} alt={label} loading={cycle === 0 ? 'eager' : 'lazy'} /><div className="service-gallery-hover" /><div className="service-gallery-label"><span className="mono-label">{label}</span><span className="service-gallery-index">0{index + 1}</span></div></div><figcaption>{caption}</figcaption></figure>; })}</div></section>;
}

function ServiceCard({ service, compact = false }: { service: Service; compact?: boolean }) {
  const Icon = service.icon;
  return <><Link href={`/services/${service.slug}`} className={`group focus-ring relative block overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] transition-all duration-300 hover:-translate-y-1 hover:border-[hsl(var(--accent)/.65)] hover:shadow-[0_18px_45px_rgba(20,70,76,.12)] ${compact ? '' : 'min-h-[350px]'}`} data-testid={`card-service-${service.slug}`}>
    <ServiceMediaSlideshow service={service} className="service-card-image relative h-44 overflow-hidden" />
    <div className="relative flex min-h-[205px] flex-col p-6"><div className="flex items-start justify-between"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[hsl(var(--secondary))] text-[hsl(var(--accent))]"><Icon size={19} /></span><span className="mono-label text-[10px] text-[hsl(var(--muted-foreground))]">{service.number}</span></div><div className="pt-6"><p className="mono-label text-[9px] text-[hsl(var(--accent))]">SERVICE</p><h3 className="mt-2 text-xl font-bold tracking-tight text-[hsl(var(--primary))]">{service.title}</h3><p className="mono-label mt-5 text-[9px] text-[hsl(var(--accent))]">WHAT IT IS</p><p className="mt-2 text-sm leading-6 text-[hsl(var(--muted-foreground))]">{service.short}</p><p className="mono-label mt-5 text-[9px] text-[hsl(var(--accent))]">THE OUTCOME</p><p className="mt-2 text-sm leading-6 text-[hsl(var(--primary))]">{service.outcome}</p><span className="mt-5 inline-flex items-center gap-2 text-xs font-bold text-[hsl(var(--primary))]">Explore service <ArrowUpRight size={15} className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" /></span></div></div>
  </Link></>;
}

function ServiceMediaSlideshow({ service, className }: { service: Service; className: string }) {
  const slides = useMemo(() => getServiceMediaSlides(service), [service.image, service.slug, service.title, service.type]);
  const [current, setCurrent] = useState(0);
  const [previous, setPrevious] = useState<number | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const frame = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = frame.current;
    if (!element || !('IntersectionObserver' in window)) {
      setIsVisible(true);
      return;
    }
    const observer = new IntersectionObserver(entries => {
      setIsVisible(entries.some(entry => entry.isIntersecting));
    }, { rootMargin: '120px' });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible || slides.length < 2) return;
    const timer = window.setTimeout(() => {
      setPrevious(current);
      setCurrent((current + 1) % slides.length);
    }, 6500);
    return () => window.clearTimeout(timer);
  }, [current, isVisible, slides.length]);

  useEffect(() => {
    if (previous === null) return;
    const timer = window.setTimeout(() => {
      setPrevious(active => active === previous ? null : active);
    }, 2000);
    return () => window.clearTimeout(timer);
  }, [previous]);

  useEffect(() => {
    if (!isVisible || slides.length < 2) return;
    const nextSlide = slides[(current + 1) % slides.length];
    if (nextSlide && !nextSlide.image.toLowerCase().endsWith('.mp4')) {
      const preload = new Image();
      preload.src = nextSlide.image;
    }
  }, [current, isVisible, slides]);

  const activeSlide = slides[current];
  if (!activeSlide) return null;
  const visibleSlides = previous === null ? [current] : [previous, current];
  return <div ref={frame} className={className} role="region" aria-roledescription="carousel" aria-label={`${service.title} images`} data-testid={`slideshow-service-${service.slug}`}>
    {visibleSlides.map(index => {
      const slide = slides[index];
      const isActive = index === current;
      const isVideo = slide.image.toLowerCase().endsWith('.mp4');
      const mediaClassName = `service-media-slide absolute inset-0 h-full w-full object-cover ${isActive ? 'is-active' : ''}`;
      return isVideo
        ? <video key={slide.image} src={slide.image} autoPlay={isActive} muted loop playsInline preload={isActive ? 'auto' : 'none'} aria-label={isActive ? slide.alt : undefined} aria-hidden={!isActive} className={mediaClassName} />
        : <img key={slide.image} src={slide.image} alt={isActive ? slide.alt : ''} aria-hidden={!isActive} loading="eager" decoding="async" className={mediaClassName} />;
    })}
    <div className="absolute inset-0 bg-gradient-to-t from-[hsl(var(--primary)/.82)] via-[hsl(var(--primary)/.22)] to-transparent" />
    <span className="absolute bottom-4 left-5 right-5 mono-label text-[10px] text-white">{service.title}</span>
  </div>;
}

function Home() {
  const [solve, setSolve] = useState('I need to reduce workplace risk');
  const recommendations = useMemo(() => {
    if (solve.includes('fire')) return services.filter(s => ['fire-safety-inspections-audits', 'fire-safety-training'].includes(s.slug));
    if (solve.includes('training')) return services.filter(s => s.type === 'OSH — TRAINING & CAPACITY BUILDING').slice(0, 3);
    if (solve.includes('environmental')) return services.filter(s => s.type === 'ENVIRONMENTAL MANAGEMENT').slice(0, 3);
    if (solve.includes('audit')) return services.filter(s => s.type === 'ASSESSMENTS, AUDITS & POLICY').slice(0, 3);
    if (solve.includes('programme')) return services.filter(s => ['risk-assessments', 'osh-training', 'environmental-education-training'].includes(s.slug));
    return services.filter(s => ['risk-assessments', 'health-safety-audits', 'osh-training'].includes(s.slug));
  }, [solve]);
  return <Shell><Seo /><main className="home-page">
    <section className="relative isolate overflow-hidden bg-[hsl(var(--primary))] text-white"><HeroSlideshow /><OrganicBackdrop dark /><div className="relative z-10 mx-auto grid min-h-[700px] max-w-7xl items-end gap-12 px-5 pb-16 pt-20 lg:grid-cols-[1.1fr_.9fr] lg:px-8 lg:pb-24"><div className="reveal"><p className="mono-label mb-6 flex items-center gap-3 text-[10px] text-[hsl(var(--secondary))]"><span className="h-px w-8 bg-[hsl(var(--accent))]" />Kenya-based EHS consultancy for safer workplaces</p><h1 className="display max-w-4xl text-[2.4rem] leading-[1.06] sm:text-5xl lg:text-[4.1rem]">The protection of life takes priority over deadlines, cost, or convenience — no exceptions.</h1><p className="mt-8 max-w-lg text-base leading-7 text-white/75">NexHSE Africa is a Kenya-based Environmental, Health and Safety (EHS) consultancy helping organisations protect people, improve operational resilience and build practical safety capability through audits, training, fire safety, environmental support and professional development.</p><div className="mt-9 flex flex-wrap gap-3"><Link href="/request-a-quote" className="focus-ring flex min-h-12 items-center gap-3 rounded-full bg-[hsl(var(--accent))] px-6 text-sm font-bold text-white transition-transform hover:-translate-y-0.5" data-testid="link-hero-quote">Request a quote <ArrowUpRight size={17} /></Link><Link href="/services" className="focus-ring flex min-h-12 items-center gap-3 rounded-full border border-white/35 px-6 text-sm font-bold text-white transition-colors hover:bg-white/10" data-testid="link-hero-training">Explore services <ChevronRight size={16} /></Link></div></div><div className="reveal reveal-delay-2 hidden justify-end lg:flex"><div className="w-72 rounded-2xl border border-white/20 bg-[hsl(var(--primary)/.5)] p-5 backdrop-blur-md"><p className="mono-label text-[9px] text-[hsl(var(--secondary))]">THE NEXHSE STANDARD</p><div className="mt-12 flex items-end justify-between border-b border-white/20 pb-4"><span className="display text-5xl">01</span><span className="text-right text-xs leading-5 text-white/65">Translate regulation<br />into everyday practice.</span></div><p className="pt-4 text-xs leading-5 text-white/65">Technical competence is only useful when it changes what happens on the ground.</p></div></div></div><div className="absolute bottom-7 right-8 z-10 hidden items-center gap-3 text-[10px] text-white/55 lg:flex"><span className="h-px w-12 bg-white/35" />Scroll to explore</div></section>
     <TrustStrip />
     <section className="relative overflow-hidden px-5 py-24 lg:px-8 lg:py-32"><div className="grid-line pointer-events-none absolute inset-0 opacity-40" /><div className="relative mx-auto grid max-w-7xl gap-14 lg:grid-cols-[.8fr_1.2fr]"><div><p className="mono-label text-[10px] text-[hsl(var(--accent))]">The NexHSE idea</p><h2 className="display mt-5 max-w-lg text-5xl leading-[1.03] tracking-[-.05em] text-[hsl(var(--primary))] sm:text-6xl">Safety is not an expense.<br /><span className="text-[hsl(var(--accent))]">It is an investment.</span></h2></div><div className="lg:pt-10"><p className="max-w-xl text-lg leading-8 text-[hsl(var(--muted-foreground))]">Good safety work is not a binder on a shelf. It is the confidence to make better decisions, the systems that prevent loss and the capability to respond when conditions change.</p><div className="mt-10 grid gap-0 border-t border-[hsl(var(--border))] sm:grid-cols-2">{[['01', 'Protect people', 'Put human protection at the centre of every operational decision.'], ['02', 'Reduce risk', 'Make hazards visible, then make the next control practical.'], ['03', 'Strengthen compliance', 'Turn regulatory responsibility into everyday practice.'], ['04', 'Develop capability', 'Build the people and habits that keep safety moving.']].map(([n, t, d]) => <div key={n} className="border-b border-[hsl(var(--border))] py-6 pr-5"><span className="mono-label text-[10px] text-[hsl(var(--accent))]">{n}</span><h3 className="mt-3 font-bold text-[hsl(var(--primary))]">{t}</h3><p className="mt-2 text-sm leading-6 text-[hsl(var(--muted-foreground))]">{d}</p></div>)}</div></div></div></section>
     <section className="bg-[hsl(var(--secondary)/.55)] px-5 py-24 lg:px-8"><div className="mx-auto max-w-7xl"><SectionHeader eyebrow="What we do" title="A practical route from concern to control." text="We work with organisations to understand the real risk picture, reduce exposure and strengthen the systems that keep people safe and operations resilient." action={<Link href="/services" className="focus-ring flex w-fit items-center gap-2 text-sm font-bold text-[hsl(var(--primary))]" data-testid="link-home-services">View all services <ArrowUpRight size={16} /></Link>} /><div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">{[['ASSESS', 'See what is happening', 'Audits and risk review that make priorities clearer and decisions evidence-based.', 'health-safety-audits'], ['PROTECT', 'Prepare for what matters', 'Fire safety, PPE and site controls designed for real operating conditions.', 'fire-safety-inspections-audits'], ['DEVELOP', 'Build capability', 'Training that changes habits, confidence and accountability at the workface.', 'osh-training'], ['SUSTAIN', 'Think beyond today', 'Environmental planning and management systems that support long-term performance.', 'environmental-impact-assessment-audits']].map(([eyebrow, title, text, slug], i) => <Link href={`/services/${slug}`} key={eyebrow} className="group focus-ring rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 transition-transform hover:-translate-y-1" data-testid={`card-home-group-${i}`}><span className="mono-label text-[10px] text-[hsl(var(--accent))]">{eyebrow}</span><h3 className="mt-14 text-xl font-bold text-[hsl(var(--primary))]">{title}</h3><p className="mt-2 text-sm leading-6 text-[hsl(var(--muted-foreground))]">{text}</p><span className="mt-8 grid h-9 w-9 place-items-center rounded-full bg-[hsl(var(--primary))] text-white transition-transform group-hover:translate-x-1"><ArrowUpRight size={15} /></span></Link>)}</div></div></section>
      <section className="px-5 py-20 lg:px-8 lg:py-24"><div className="mx-auto max-w-7xl"><SectionHeader eyebrow="NexHSE approach" title="A simple workflow that aligns your risk, people and next step." text="We help you move from awareness to action, then into a clear service and quotation conversation." /><div className="grid gap-5 lg:grid-cols-4">{[['01', 'Assess the context', 'We understand the task, site, risk profile and what is already in place.'], ['02', 'Prioritise the hazard', 'We focus on the exposures with the greatest operational, legal or people impact.'], ['03', 'Design the solution', 'We match the right training, audit, equipment, environmental support or management controls.'], ['04', 'Request a quote', 'You move to a practical engagement and a clear next step with NexHSE.']].map(([step, title, text]) => <div key={step} className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6"><span className="mono-label text-[10px] text-[hsl(var(--accent))]">{step}</span><h3 className="mt-8 text-xl font-bold text-[hsl(var(--primary))]">{title}</h3><p className="mt-3 text-sm leading-6 text-[hsl(var(--muted-foreground))]">{text}</p></div>)}</div></div></section>
      <section className="px-5 py-24 lg:px-8 lg:py-32"><div className="mx-auto max-w-7xl"><SectionHeader eyebrow="Interactive service discovery" title="What are you trying to solve?" text="Start with the operational question. We will point you toward the most relevant NexHSE services." /><div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr]"><div className="space-y-2">{['I need to reduce workplace risk', 'I need a safety audit', 'I need fire safety support', 'I need employee training', 'I need environmental compliance support', 'I need to strengthen our HSE programme'].map(item => <button key={item} onClick={() => setSolve(item)} className={`focus-ring flex min-h-14 w-full items-center justify-between rounded-xl border px-5 text-left text-sm font-bold transition-colors ${solve === item ? 'border-[hsl(var(--accent))] bg-[hsl(var(--secondary))] text-[hsl(var(--primary))]' : 'border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:border-[hsl(var(--accent)/.6)]'}`} data-testid={`button-solve-${item.toLowerCase().replaceAll(' ', '-')}`}>{item}<ChevronRight size={17} className={solve === item ? 'text-[hsl(var(--accent))]' : ''} /></button>)}</div><div className="rounded-2xl bg-[hsl(var(--primary))] p-6 text-white sm:p-8"><div className="flex items-center justify-between border-b border-white/15 pb-5"><div><p className="mono-label text-[9px] text-[hsl(var(--secondary))]">RECOMMENDED STARTING POINT</p><h3 className="mt-2 text-lg font-bold">{solve}</h3></div><Sparkles size={20} className="text-[hsl(var(--secondary))]" /></div><div className="mt-5 grid gap-3">{recommendations.map(s => <Link href={`/services/${s.slug}`} key={s.slug} className="focus-ring group flex items-center gap-4 rounded-xl border border-white/15 bg-white/5 p-4 transition-colors hover:bg-white/10" data-testid={`link-recommendation-${s.slug}`}><span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[hsl(var(--accent))]"><s.icon size={16} /></span><span className="flex-1"><strong className="block text-sm">{s.title}</strong><small className="mt-1 block text-xs text-white/55">{s.type}</small></span><ArrowUpRight size={16} className="text-[hsl(var(--secondary))]" /></Link>)}</div></div></div></div></section>
      <section className="bg-[hsl(var(--primary))] px-5 py-24 text-white lg:px-8 lg:py-28"><div className="mx-auto max-w-7xl"><div className="grid gap-10 lg:grid-cols-[1fr_1.25fr] lg:items-center"><div><p className="mono-label text-[10px] text-[hsl(var(--secondary))]">Training & development</p><h2 className="display mt-4 text-5xl leading-[1.04] tracking-[-.045em] sm:text-6xl">Develop the people who make safety possible.</h2><p className="mt-6 max-w-md text-sm leading-7 text-white/65">Professional development should change behaviour beyond the classroom. Explore a catalogue prepared for practical, workplace-relevant learning.</p><Link href="/training" className="focus-ring mt-8 inline-flex min-h-12 items-center gap-3 rounded-full border border-white/30 px-5 text-sm font-bold hover:bg-white/10" data-testid="link-home-training">Explore the catalogue <ArrowUpRight size={16} /></Link></div><OrganicSlideshow slides={trainingDevelopmentSlides} className="relative h-[300px] min-w-0 sm:h-[350px]" variant="dark" label="Training and development" /></div></div></section>
      <section className="border-t border-[hsl(var(--border))] px-5 py-24 lg:px-8"><div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[.8fr_1.2fr]"><div><p className="mono-label text-[10px] text-[hsl(var(--accent))]">Safety intelligence</p><h2 className="display mt-4 text-5xl leading-[1.05] tracking-[-.05em] text-[hsl(var(--primary))]">Good decisions need good information.</h2><Link href="/knowledge" className="focus-ring mt-7 inline-flex items-center gap-2 text-sm font-bold text-[hsl(var(--primary))]" data-testid="link-home-knowledge">Explore knowledge <ArrowUpRight size={16} /></Link></div><div className="grid gap-4 sm:grid-cols-2">{[['Safety', 'Workplace risk assessment', 'Practical guidance will be published here.'], ['Fire', 'Fire safety audits', 'Practical guidance will be published here.'], ['Environment', 'Environmental responsibility', 'Practical guidance will be published here.'], ['Training', 'Building safety capability', 'Practical guidance will be published here.']].map(([cat, title, text], i) => <Link href="/knowledge" key={cat} className="focus-ring group rounded-2xl border border-[hsl(var(--border))] p-5 hover:border-[hsl(var(--accent))]" data-testid={`card-insight-${i}`}><div className="flex items-center justify-between"><span className="mono-label text-[10px] text-[hsl(var(--accent))]">{cat}</span><ArrowUpRight size={15} className="text-[hsl(var(--muted-foreground))] transition-transform group-hover:translate-x-1" /></div><h3 className="mt-8 font-bold text-[hsl(var(--primary))]">{title}</h3><p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">{text}</p></Link>)}</div></div></section>
    <QuoteCTA />
  </main></Shell>;
}

function QuoteCTA() {
  return <section className="quote-cta-section px-5 py-12 lg:px-8 lg:py-16"><div className="quote-cta-panel relative isolate mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] border border-white/20 bg-[hsl(var(--primary))] text-white sm:rounded-[3.5rem]"><OrganicBackdrop dark vivid /><div className="relative grid gap-10 px-6 py-12 sm:px-10 lg:grid-cols-[1fr_.72fr] lg:items-center lg:px-16 lg:py-16"><div className="relative z-10"><p className="mono-label text-[10px] text-[hsl(var(--secondary))]">Start a conversation</p><h2 className="display mt-4 max-w-2xl text-5xl leading-[1.02] tracking-[-.045em] sm:text-6xl">Let’s build a safer workplace.</h2><p className="mt-5 max-w-xl text-sm leading-7 text-white/70">Whether you are strengthening an existing safety programme or building one from the ground up, NexHSE is ready to work alongside your team.</p><div className="mt-7 flex flex-wrap items-center gap-5"><Link href="/request-a-quote" className="focus-ring flex min-h-12 items-center gap-2 rounded-full bg-[hsl(var(--accent))] px-5 text-sm font-bold text-white transition-transform hover:-translate-y-0.5" data-testid="link-cta-quote">Request a quote <ArrowUpRight size={16} /></Link><Link href="/contact" className="focus-ring inline-flex items-center gap-2 text-sm font-bold text-white/85 hover:text-white" data-testid="link-cta-consultation">Book a consultation <ChevronRight size={16} /></Link></div></div><OrganicSlideshow slides={conversationSlides} className="relative z-10 h-52 w-full sm:h-64 lg:h-72" variant="dark" label="Start a conversation" /></div></div></section>;
}

function AboutLegacy() {
  return <Shell><Seo page="about" /><main><PageIntro eyebrow="About NexHSE Africa" title="Safety leadership built around people, systems and practical action." text="NexHSE Africa helps organisations improve workplace safety, risk management, environmental performance and staff capability through clear, practical support." image={trainingImage} /><section className="mx-auto max-w-7xl px-5 py-24 lg:px-8"><Breadcrumbs items={[['About', '/about']]} /><div className="grid gap-14 lg:grid-cols-[.8fr_1.2fr]"><div><p className="mono-label text-[10px] text-[hsl(var(--accent))]">Who we are</p><h2 className="display mt-4 text-5xl leading-[1.05] text-[hsl(var(--primary))]">Technical enough for the system. Human enough for the people.</h2></div><div className="space-y-5 text-base leading-8 text-[hsl(var(--muted-foreground))]"><p>NexHSE Africa is a Kenya-based Environmental, Health and Safety (EHS) consultancy dedicated to helping organisations protect people, strengthen compliance and build safer, more resilient workplaces. We work across the realities of site-based operations, commercial environments and changing risk conditions.</p><p>Our work is grounded in practical observation, risk-led thinking and the understanding that safety culture is built through repeatable systems, informed decision-making and capability development. We support organisations in turning good intentions into consistent operational practice.</p></div></div><div className="mt-24 grid gap-5 lg:grid-cols-3"><div className="rounded-2xl bg-[hsl(var(--primary))] p-7 text-white lg:col-span-2"><p className="mono-label text-[10px] text-[hsl(var(--secondary))]">Mission</p><p className="display mt-10 max-w-2xl text-3xl leading-tight">To empower organisations with the knowledge, systems and confidence to protect people, prevent loss and build workplaces where safety is second nature.</p></div><div className="rounded-2xl border border-[hsl(var(--border))] p-7"><p className="mono-label text-[10px] text-[hsl(var(--accent))]">Vision</p><p className="mt-10 text-xl font-bold leading-8 text-[hsl(var(--primary))]">To be a trusted EHS partner for organisations across Kenya and Africa, helping them build safer, smarter and more compliant workplaces.</p></div></div></section><section className="bg-[hsl(var(--secondary)/.6)] px-5 py-24 lg:px-8"><div className="mx-auto max-w-7xl"><SectionHeader eyebrow="Our approach" title="Make the right thing easier to do." /><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[['Integrity', 'Be clear, responsible and honest about the work.'], ['Professionalism', 'Bring preparation, respect and discipline to every engagement.'], ['Innovation', 'Keep improving how safety knowledge reaches the workplace.'], ['Excellence', 'Hold the detail to a high standard because the detail matters.'], ['Teamwork', 'Safety is built with people, not delivered at people.'], ['Safety first', 'Keep human protection at the centre of each decision.']].map(([t, d], i) => <div key={t} className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6"><span className="mono-label text-[10px] text-[hsl(var(--accent))]">0{i + 1}</span><h3 className="mt-8 text-lg font-bold text-[hsl(var(--primary))]">{t}</h3><p className="mt-2 text-sm leading-6 text-[hsl(var(--muted-foreground))]">{d}</p></div>)}</div></div></section><section className="mx-auto max-w-7xl px-5 py-24 lg:px-8"><SectionHeader eyebrow="Why NexHSE" title="Built for the reality on the ground." /><div className="grid gap-4 md:grid-cols-2">{['Experienced professionals', 'Practical, field-tested solutions', 'Customized training', 'Compliance-focused delivery', 'Modern safety standards', 'Reliable ongoing support'].map((item, i) => <div key={item} className="flex items-center gap-4 border-b border-[hsl(var(--border))] py-5"><span className="grid h-9 w-9 place-items-center rounded-full bg-[hsl(var(--secondary))] text-[hsl(var(--accent))]"><Check size={17} /></span><span className="font-semibold text-[hsl(var(--primary))]">{item}</span><span className="mono-label ml-auto text-[10px] text-[hsl(var(--muted-foreground))]">0{i + 1}</span></div>)}</div></section><QuoteCTA /></main></Shell>;
}

function About() {
  const values = [
    ['Safety First, Always', 'The protection of life takes priority over deadlines, cost, or convenience — no exceptions.'],
    ['Integrity in Every Assessment', "We report what we find, even when it's inconvenient for the client or for us. Our clients trust our findings because we don't soften them."],
    ['Practical Over Paper', 'We train for real competence and genuine behaviour change — not just a certificate that satisfies an inspector and gets filed away.'],
    ['Environmental Stewardship', 'The "E" in EHS is never an afterthought to the "HS." Environmental responsibility is built into how we assess and advise from the start.'],
    ['Growth Through Safety', "We measure our own success by one thing: our clients' ability to operate, scale, and expand safely."],
  ];
  return <Shell><Seo page="about" /><main><PageIntro eyebrow="Safety and Growth" title="About NexHSE Africa" text="NexHSE Africa is a Kenya-based Environmental, Health and Safety (EHS) consultancy helping organizations protect their people, their environment, and their ability to grow. We work with construction firms, manufacturers, EPZ operators, distributors, banking & finance sectors, telecom infrastructure providers, NGOs and donor-financed infrastructure projects across Kenya — with East Africa and the wider continent as the next chapter of our story." image={trainingImage} /><section className="mx-auto max-w-7xl px-5 py-20 lg:px-8"><Breadcrumbs items={[[ 'About NexHSE Africa', '/about' ]]} /><p className="max-w-4xl text-lg leading-8 text-[hsl(var(--muted-foreground))]">We believe safety and growth aren't in tension — they're the same goal. A workplace that protects its people is a workplace that can scale, win bigger contracts, and operate without the constant risk of incident, litigation, or lost time. That belief sits behind everything we do, from a single-day fire safety training to a full ISO 45001 management system rollout.</p><div className="mt-16 grid gap-6 lg:grid-cols-2"><section className="border-t border-[hsl(var(--border))] pt-6"><p className="mono-label text-[10px] text-[hsl(var(--accent))]">Our Mission</p><h2 className="display mt-4 text-3xl text-[hsl(var(--primary))]">Our Mission</h2><p className="mt-5 text-base leading-8 text-[hsl(var(--muted-foreground))]">To protect people, workplaces, and the environment across Africa by delivering practical, locally-grounded Environmental, Health and Safety solutions that empower organizations to grow safely.</p></section><section className="border-t border-[hsl(var(--border))] pt-6"><p className="mono-label text-[10px] text-[hsl(var(--accent))]">Our Vision</p><h2 className="display mt-4 text-3xl text-[hsl(var(--primary))]">Our Vision</h2><p className="mt-5 text-base leading-8 text-[hsl(var(--muted-foreground))]">To be Africa's most trusted Environmental, Health and Safety partner — growing from Kenya across East Africa and, ultimately, the continent.</p></section></div><section className="mt-16 border-t border-[hsl(var(--border))] pt-6"><p className="mono-label text-[10px] text-[hsl(var(--accent))]">Our Values</p><h2 className="display mt-4 text-4xl text-[hsl(var(--primary))]">Our Values</h2><div className="mt-6 grid gap-x-8 sm:grid-cols-2 lg:grid-cols-3">{values.map(([title, text], index) => <article key={title} className="border-t border-[hsl(var(--border))] py-6"><p className="mono-label text-[10px] text-[hsl(var(--accent))]">VALUE {String(index + 1).padStart(2, '0')}</p><h3 className="mt-3 text-lg font-bold text-[hsl(var(--primary))]">{title}</h3><p className="mt-3 text-sm leading-7 text-[hsl(var(--muted-foreground))]">{text}</p></article>)}</div></section><section className="mt-12 border-t border-[hsl(var(--border))] pt-6"><p className="mono-label text-[10px] text-[hsl(var(--accent))]">Geographic Positioning</p><p className="mt-4 max-w-4xl text-base leading-8 text-[hsl(var(--muted-foreground))]">NexHSE Africa — currently serving the Kenyan market, with planned expansion across East Africa and, over time, the whole of Africa.</p></section></section></main></Shell>;
}

function ServicesLegacy() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All');
  const filters = ['All', 'Training', 'Assessments', 'Specialised', 'Equipment', 'Environmental'];
  const filtered = services.filter(service => {
    const matchesFilter = filter === 'All' || (filter === 'Training' && service.type === 'Training & Capacity Building') || (filter === 'Assessments' && service.type === 'Assessments, Audits & Policy') || (filter === 'Specialised' && service.type === 'Specialised Services') || (filter === 'Equipment' && service.type === 'Equipment Supply') || (filter === 'Environmental' && service.type === 'Environmental Management');
    return matchesFilter && `${service.title} ${service.short} ${service.outcome}`.toLowerCase().includes(query.toLowerCase());
  });
  return <Shell><Seo page="services" /><main><PageIntro eyebrow="Services portfolio" title="The right safety work starts with the right question." text="Explore the full NexHSE Africa service portfolio, shaped around your operations, risks and people." image={harnessImage} /><section className="mx-auto max-w-7xl px-5 py-20 lg:px-8"><Breadcrumbs items={[['Services', '/services']]} /><div className="mb-10 flex flex-col gap-4 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 md:flex-row"><label className="flex flex-1 items-center gap-3 rounded-xl bg-[hsl(var(--secondary)/.6)] px-4"><Search size={17} className="text-[hsl(var(--accent))]" /><span className="sr-only">Search services</span><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search services" className="focus-ring min-h-11 w-full bg-transparent text-sm outline-none" data-testid="input-search-services" /></label><div className="flex gap-2 overflow-auto">{filters.map(option => <button key={option} onClick={() => setFilter(option)} className={`focus-ring min-h-11 whitespace-nowrap rounded-full px-4 text-xs font-bold ${filter === option ? 'bg-[hsl(var(--primary))] text-white' : 'border border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))]'}`} data-testid={`button-filter-services-${option.toLowerCase()}`}>{option === 'All' ? 'All services' : option}</button>)}</div></div><div className="mb-8 flex items-end justify-between"><div><p className="mono-label text-[10px] text-[hsl(var(--accent))]">24 portfolio services</p><h2 className="display mt-2 text-4xl text-[hsl(var(--primary))]">A clear catalogue, not a wall of cards.</h2></div><span className="mono-label text-[10px] text-[hsl(var(--muted-foreground))]">{filtered.length} showing</span></div>{filtered.length ? <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{filtered.map(service => <ServiceCard key={service.slug} service={service} />)}</div> : <EmptyState title="No services match that search." text="Try a broader term or reset the filters." action={() => { setQuery(''); setFilter('All'); }} actionLabel="Reset filters" />}</section></main></Shell>;
}

function LegacyServices() {
  const [query, setQuery] = useState(''); const [filter, setFilter] = useState('All');
  const filtered = services.filter(s => (filter === 'All' || (filter === 'Training' && s.type === 'Training & Capacity Building') || (filter === 'Assessments' && s.type === 'Assessments, Audits & Policy') || (filter === 'Specialised' && s.type === 'Specialised Services') || (filter === 'Equipment' && s.type === 'Equipment Supply') || (filter === 'Environmental' && s.type === 'Environmental Management')) && `${s.title} ${s.short} ${s.outcome}`.toLowerCase().includes(query.toLowerCase()));
  return <Shell><Seo page="services" /><main><PageIntro eyebrow="Services" title="The right safety work starts with the right question." text="Explore consulting, audits, training and environmental support shaped around your operations, risks and people." image={harnessImage} /><section className="mx-auto max-w-7xl px-5 py-20 lg:px-8"><Breadcrumbs items={[['Services', '/services']]} /><div className="mb-10 flex flex-col gap-4 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 md:flex-row"><label className="flex flex-1 items-center gap-3 rounded-xl bg-[hsl(var(--secondary)/.6)] px-4"><Search size={17} className="text-[hsl(var(--accent))]" /><span className="sr-only">Search services</span><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search services" className="focus-ring min-h-11 w-full bg-transparent text-sm outline-none" data-testid="input-search-services" /></label><div className="flex gap-2 overflow-auto">{['All', 'Consulting', 'Training'].map(f => <button key={f} onClick={() => setFilter(f)} className={`focus-ring min-h-11 whitespace-nowrap rounded-full px-4 text-xs font-bold ${filter === f ? 'bg-[hsl(var(--primary))] text-white' : 'border border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))]'}`} data-testid={`button-filter-services-${f.toLowerCase()}`}>{f === 'All' ? 'All services' : f === 'Consulting' ? 'Consulting / Audit' : 'Training / Development'}</button>)}</div></div><div className="mb-8 flex items-end justify-between"><div><p className="mono-label text-[10px] text-[hsl(var(--accent))]">10 core services</p><h2 className="display mt-2 text-4xl text-[hsl(var(--primary))]">A clear catalogue, not a wall of cards.</h2></div><span className="mono-label text-[10px] text-[hsl(var(--muted-foreground))]">{filtered.length} showing</span></div>{filtered.length ? <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{filtered.map(s => <ServiceCard key={s.slug} service={s} />)}</div> : <EmptyState title="No services match that search." text="Try a broader term or reset the filters." action={() => { setQuery(''); setFilter('All'); }} actionLabel="Reset filters" />}</section></main></Shell>;
}

function ServicesMiddleLegacy() {
  const serviceRecords = useServices();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All');
  const categories = [
    { key: 'Training & Capacity Building', label: 'Training & capacity building', title: 'Build the capability that keeps people safe.', image: trainingImage, text: 'Practical learning for the people who make safe work possible.' },
    { key: 'Assessments, Audits & Policy', label: 'Assessments, audits & policy', title: 'See the exposure clearly, then act on it.', image: riskReviewImage, text: 'Independent evidence and policy frameworks for better decisions.' },
    { key: 'Specialised Services', label: 'Specialised services', title: 'Support for complex and changing conditions.', image: constructionTrainingImage, text: 'Focused oversight for high-risk work, emergencies and operational hazards.' },
    { key: 'Equipment Supply', label: 'Equipment supply', title: 'The right equipment, ready when it matters.', image: fireImage, text: 'Reliable safety equipment supplied and maintained for real use.' },
    { key: 'Environmental Management', label: 'Environmental management', title: 'Make responsible operations part of the system.', image: environmentalImage, text: 'Environmental planning, education and controls that endure.' },
  ];
  const matches = (service: Service) => `${service.title} ${service.short} ${service.outcome}`.toLowerCase().includes(query.toLowerCase());
  const visibleCategories = categories.filter(category => filter === 'All' || category.key === filter).map(category => ({ ...category, services: serviceRecords.filter(service => service.type === category.key && matches(service)) })).filter(category => category.services.length);
  return <Shell><Seo page="services" /><main className="services-page relative overflow-hidden"><div className="service-line-art" aria-hidden="true"><span /><span /><span /><span /></div><PageIntro eyebrow="Services portfolio" title="The right safety work starts with the right question." text="Explore the full NexHSE Africa service portfolio, grouped by the work your organisation needs to do." image={harnessImage} /><section className="relative z-10 mx-auto max-w-7xl px-5 py-20 lg:px-8"><Breadcrumbs items={[[ 'Services', '/services' ]]} /><div className="mb-14 flex flex-col gap-4 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card)/.88)] p-4 backdrop-blur-sm md:flex-row"><label className="flex flex-1 items-center gap-3 rounded-xl bg-[hsl(var(--secondary)/.6)] px-4"><Search size={17} className="text-[hsl(var(--accent))]" /><span className="sr-only">Search services</span><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search services" className="focus-ring min-h-11 w-full bg-transparent text-sm outline-none" data-testid="input-search-services" /></label><div className="flex gap-2 overflow-auto">{['All', ...categories.map(category => category.key)].map(option => <button key={option} onClick={() => setFilter(option)} className={`focus-ring min-h-11 whitespace-nowrap rounded-full px-4 text-xs font-bold ${filter === option ? 'bg-[hsl(var(--primary))] text-white' : 'border border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))]'}`} data-testid={`button-filter-services-${option.toLowerCase().replaceAll(' ', '-')}`}>{option === 'All' ? 'All services' : categories.find(category => category.key === option)?.label}</button>)}</div></div><div className="space-y-20">{visibleCategories.map((category, categoryIndex) => <section key={category.key} className={`service-category service-category--${categoryIndex % 2 ? 'reverse' : 'standard'}`}><div className="service-category-heading"><ServiceMediaSlideshow service={category.services[0]} className="service-category-visual organic-image organic-image--quiet relative overflow-hidden" /><div><p className="mono-label text-[10px] font-bold text-[hsl(var(--accent))]">{String(categoryIndex + 1).padStart(2, '0')} / {category.label}</p><h2 className="display mt-3 max-w-xl text-4xl leading-[1.05] tracking-[-.04em] text-[hsl(var(--primary))] sm:text-5xl">{category.title}</h2><p className="mt-4 max-w-lg text-sm leading-7 text-[hsl(var(--muted-foreground))]">{category.text}</p></div></div><div className="service-category-grid">{category.services.map((service, index) => <div key={service.slug} className={`service-tile-stagger service-tile-stagger--${index % 3}`}><ServiceCard service={service} /></div>)}</div></section>)}</div>{!visibleCategories.length && <EmptyState title="No services match that search." text="Try a broader term or reset the filters." action={() => { setQuery(''); setFilter('All'); }} actionLabel="Reset filters" />}<ServiceGallery /></section></main></Shell>;
}

function Services() {
  const serviceRecords = useServices();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All');
  const categories = ['OSH — TRAINING & CAPACITY BUILDING', 'ASSESSMENTS, AUDITS & POLICY', 'SPECIALISED SERVICES', 'EQUIPMENT SUPPLY', 'ENVIRONMENTAL MANAGEMENT'];
  const matching = (service: Service) => `${service.title} ${service.short} ${service.outcome}`.toLowerCase().includes(query.trim().toLowerCase());
  return <Shell><Seo page="services" title="SERVICE PORTFOLIO | NexHSE Africa" description="What We Offer, What It Involves, What You Get" /><main className="services-page relative overflow-hidden"><PageIntro eyebrow="" title="SERVICE PORTFOLIO" text="What We Offer, What It Involves, What You Get" image={harnessImage} hideFieldLabel /><section className="relative z-10 mx-auto max-w-7xl px-5 py-16 lg:px-8"><Breadcrumbs items={[[ 'Services', '/services' ]]} /><p className="mb-8 max-w-3xl text-base leading-7 text-[hsl(var(--muted-foreground))]">Every NexHSE Africa service below is built around a real business outcome, not just a technical activity.</p><div className="mb-8 flex flex-col gap-4 border-b border-[hsl(var(--border))] pb-6 md:flex-row md:items-center md:justify-between"><label className="flex min-h-11 max-w-xl flex-1 items-center gap-3 rounded-xl border border-[hsl(var(--border))] px-4"><Search size={17} className="text-[hsl(var(--accent))]" /><span className="sr-only">Search services</span><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search services" className="focus-ring w-full bg-transparent text-sm outline-none" /></label><div className="flex flex-wrap gap-2">{['All', ...categories].map(category => <button key={category} type="button" onClick={() => setFilter(category)} aria-pressed={filter === category} className={`focus-ring min-h-10 rounded-full border px-3 text-xs font-bold ${filter === category ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))] text-white' : 'border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))]'}`}>{category === 'All' ? 'All services' : category}</button>)}</div></div><div className="space-y-16">{categories.filter(category => filter === 'All' || filter === category).map(category => {
    const records = serviceRecords.filter(service => service.type === category && matching(service));
    return records.length ? <section key={category} aria-labelledby={`category-${category}`}><h2 id={`category-${category}`} className="display border-b border-[hsl(var(--border))] pb-4 text-2xl leading-tight text-[hsl(var(--primary))] sm:text-3xl">{category}</h2><div className="mt-6 grid items-stretch gap-5 md:grid-cols-2 xl:grid-cols-3">{records.map(service => <ServiceCard key={service.slug} service={service} />)}</div></section> : null;
  })}</div></section></main></Shell>;
}

function ServiceDetailLegacy() {
  const { slug = '' } = useParams<{ slug: string }>(); const serviceRecords = useServices(); const service = serviceRecords.find(s => s.slug === resolveServiceSlug(slug)) ?? serviceRecords[0]; const [openFaq, setOpenFaq] = useState<number | null>(0); const Icon = service.icon;
  const relatedServices = serviceRecords.filter(s => s.type === service.type && s.slug !== service.slug).slice(0, 3);
  return <Shell><Seo page="services" title={`${service.title} | NexHSE Africa`} description={`${service.title} from NexHSE Africa. Practical workplace health, safety, environmental and professional-development support.`} /><main><section className="bg-[hsl(var(--primary))] text-white"><div className="mx-auto max-w-7xl px-5 pb-16 pt-12 lg:px-8 lg:pb-24 lg:pt-16"><Breadcrumbs items={[['Services', '/services'], [service.title, `/services/${service.slug}`]]} /><div className="grid items-end gap-10 lg:grid-cols-[1.1fr_.9fr]"><div><div className="grid h-12 w-12 place-items-center rounded-xl bg-[hsl(var(--accent))]"><Icon size={22} /></div><p className="mono-label mt-7 text-[10px] text-[hsl(var(--secondary))]">{service.number} / {service.type}</p><h1 className="display mt-4 text-5xl leading-[1.02] tracking-[-.045em] sm:text-7xl">{service.title}</h1><p className="mt-6 max-w-xl text-base leading-7 text-white/70">{service.short}</p><Link href="/request-a-quote" className="focus-ring mt-8 inline-flex min-h-12 items-center gap-2 rounded-full bg-[hsl(var(--accent))] px-5 text-sm font-bold" data-testid="link-service-quote">Discuss this service <ArrowUpRight size={16} /></Link></div><div className="h-72 overflow-hidden rounded-[2rem] border border-white/20"><img src={service.image} alt={`${service.title} in a practical workplace setting`} className="h-full w-full object-cover" /></div></div></div></section><section className="mx-auto max-w-7xl px-5 py-20 lg:px-8"><div className="grid gap-16 lg:grid-cols-[.75fr_1.25fr]"><div className="lg:sticky lg:top-24 lg:h-fit"><p className="mono-label text-[10px] text-[hsl(var(--accent))]">Service brief</p><h2 className="display mt-4 text-4xl leading-tight text-[hsl(var(--primary))]">Clearer decisions.<br />Stronger practice.</h2></div><div className="space-y-12"><InfoBlock title="What it is" text={`A focused ${service.type.toLowerCase()} engagement for organisations that want to understand their context and take practical next steps.`} />
          <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6"><p className="mono-label text-[10px] text-[hsl(var(--accent))]">Related services</p><label className="mt-4 block text-sm font-semibold text-[hsl(var(--primary))]">Choose a related service<select className="mt-2 min-h-12 w-full rounded-xl border border-[hsl(var(--border))] bg-white px-3 text-sm text-[hsl(var(--primary))]" defaultValue={service.slug} onChange={(event) => window.location.assign(`/services/${event.target.value}`)} data-testid="select-related-service"><option value={service.slug} disabled>{service.title}</option>{relatedServices.map(related => <option key={related.slug} value={related.slug}>{related.title}</option>)}</select></label></div>
          <div className="rounded-2xl bg-[hsl(var(--secondary))] p-6"><p className="mono-label text-[10px] text-[hsl(var(--accent))]">Client workflow</p><div className="mt-5 grid gap-3 sm:grid-cols-3">{[['01', 'Scope'], ['02', 'Assess'], ['03', 'Quote']].map(([step, label]) => <div key={step} className="rounded-xl bg-white p-4"><p className="mono-label text-[9px] text-[hsl(var(--accent))]">{step}</p><p className="mt-2 text-sm font-bold text-[hsl(var(--primary))]">{label}</p></div>)}</div><Link href="/request-a-quote" className="focus-ring mt-6 inline-flex items-center gap-2 text-sm font-bold text-[hsl(var(--primary))]" data-testid="link-service-quote-flow">Request a service quotation <ArrowUpRight size={16} /></Link></div>
          <InfoBlock title="Why it matters" text="Safety performance depends on what people can see, understand and act on. A structured approach helps teams move from assumption to informed action." /><InfoBlock title="The NexHSE approach" text="We listen to the operating context, work with the people closest to the risk and keep recommendations grounded in practice. The detail of scope is confirmed with your team before work begins." /><div><p className="mono-label text-[10px] text-[hsl(var(--accent))]">What may be included</p><div className="mt-5 grid gap-3 sm:grid-cols-2">{['Context and scope discussion', 'Practical review of current arrangements', 'Clear observations and priorities', 'Conversation about next steps'].map(item => <div key={item} className="flex gap-3 rounded-xl border border-[hsl(var(--border))] p-4 text-sm text-[hsl(var(--muted-foreground))]"><Check size={17} className="shrink-0 text-[hsl(var(--accent))]" />{item}</div>)}</div><p className="mt-4 text-xs text-[hsl(var(--muted-foreground))]">Final deliverables are confirmed against your organisation’s scope. CONTENT REQUIRED for service-specific technical schedules.</p></div><div><p className="mono-label text-[10px] text-[hsl(var(--accent))]">Frequently asked</p><div className="mt-4 divide-y divide-[hsl(var(--border))] border-y border-[hsl(var(--border))]">{faqs.map((faq, i) => <div key={faq.q}><button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="focus-ring flex min-h-16 w-full items-center justify-between text-left text-sm font-bold text-[hsl(var(--primary))]" aria-expanded={openFaq === i} data-testid={`button-faq-${i}`}><span>{faq.q}</span><ChevronDown size={17} className={`transition-transform ${openFaq === i ? 'rotate-180 text-[hsl(var(--accent))]' : ''}`} /></button>{openFaq === i && <p className="pb-5 pr-8 text-sm leading-6 text-[hsl(var(--muted-foreground))]">{faq.a}</p>}</div>)}</div></div></div></div></section><QuoteCTA /></main></Shell>;
}

function ServiceDetail() {
  const { slug = '' } = useParams<{ slug: string }>();
  const serviceRecords = useServices();
  const service = serviceRecords.find(item => item.slug === resolveServiceSlug(slug)) ?? serviceRecords[0];
  return <Shell><Seo page="services" title={`${service.title} | NexHSE Africa`} description={service.short} /><main><section className="bg-[hsl(var(--primary))] text-white"><div className="mx-auto max-w-7xl px-5 pb-14 pt-12 lg:px-8 lg:pb-20"><Breadcrumbs items={[[ 'Services', '/services' ], [ service.title, `/services/${service.slug}` ]]} /><p className="mono-label mt-10 text-[10px] text-[hsl(var(--secondary))]">{service.type}</p><h1 className="display mt-4 max-w-4xl text-5xl leading-tight sm:text-7xl">{service.title}</h1></div></section><section className="mx-auto max-w-7xl px-5 py-12 lg:px-8"><div className="grid gap-8 lg:grid-cols-[1fr_.9fr]"><div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1"><article className="border-t border-[hsl(var(--border))] pt-5"><p className="mono-label text-[10px] text-[hsl(var(--accent))]">WHAT IT IS</p><p className="mt-4 text-lg leading-8 text-[hsl(var(--muted-foreground))]">{service.short}</p></article><article className="border-t border-[hsl(var(--border))] pt-5"><p className="mono-label text-[10px] text-[hsl(var(--accent))]">THE OUTCOME</p><p className="mt-4 text-lg leading-8 text-[hsl(var(--primary))]">{service.outcome}</p></article><Link href="/request-a-quote" className="focus-ring mt-2 inline-flex min-h-12 w-fit items-center gap-2 rounded-full bg-[hsl(var(--accent))] px-5 text-sm font-bold text-white">Request a quote <ArrowUpRight size={16} /></Link></div><ServiceMediaSlideshow service={service} className="organic-image organic-image--quiet relative h-72 overflow-hidden sm:h-96" /></div><div className="mt-12 border-t border-[hsl(var(--border))] pt-6"><Link href="/services" className="focus-ring text-sm font-bold text-[hsl(var(--primary))]">SERVICE PORTFOLIO</Link></div></section></main></Shell>;
}

function InfoBlock({ title, text }: { title: string; text: string }) { return <div><p className="mono-label text-[10px] text-[hsl(var(--accent))]">{title}</p><p className="mt-4 max-w-2xl text-lg leading-8 text-[hsl(var(--muted-foreground))]">{text}</p></div>; }

function Training() {
  const serviceRecords = useServices();
  const [filter, setFilter] = useState('All'); const courseServices = serviceRecords.filter(s => s.type === 'OSH — TRAINING & CAPACITY BUILDING'); const shown = filter === 'All' ? courseServices : courseServices.filter(s => filter === 'Statutory' ? ['osh-training', 'first-aid-training', 'fire-safety-training'].includes(s.slug) : filter === 'Technical' ? ['work-at-height-confined-space-training', 'ppe-training'].includes(s.slug) : false);
  return <Shell><Seo page="training" /><main><PageIntro eyebrow="Training & development" title="Competence that travels back to the workplace." text="Explore professional development programmes for the people who make safety possible. Course dates, durations and pricing are published only when confirmed." image={trainingImage} /><section className="mx-auto max-w-7xl px-5 py-20 lg:px-8"><Breadcrumbs items={[['Training', '/training']]} /><div className="grid gap-10 lg:grid-cols-[.7fr_1.3fr]"><aside><p className="mono-label text-[10px] text-[hsl(var(--accent))]">Catalogue controls</p><h2 className="display mt-4 text-4xl text-[hsl(var(--primary))]">Find the right learning route.</h2><div className="mt-8 space-y-2">{['All', 'Statutory', 'Technical', 'Management'].map(f => <button key={f} onClick={() => setFilter(f)} className={`focus-ring flex min-h-12 w-full items-center justify-between rounded-xl px-4 text-left text-sm font-bold ${filter === f ? 'bg-[hsl(var(--primary))] text-white' : 'border border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))]'}`} data-testid={`button-filter-training-${f.toLowerCase()}`}>{f}<ChevronRight size={16} /></button>)}</div><div className="mt-8 rounded-2xl bg-[hsl(var(--secondary))] p-5"><Clock3 size={19} className="text-[hsl(var(--accent))]" /><p className="mt-4 text-sm font-bold text-[hsl(var(--primary))]">Dates, delivery mode and duration</p><p className="mt-2 text-xs leading-5 text-[hsl(var(--muted-foreground))]">CONTENT REQUIRED. Tell us what your team needs and we can discuss the next step.</p></div></aside><div><div className="mb-6 flex items-center justify-between"><p className="text-sm text-[hsl(var(--muted-foreground))]">Showing <strong className="text-[hsl(var(--primary))]">{shown.length}</strong> programmes</p><span className="mono-label text-[10px] text-[hsl(var(--muted-foreground))]">Phase 01 catalogue</span></div><div className="grid gap-4 sm:grid-cols-2">{shown.map(s => <CourseCard key={s.slug} service={s} />)}</div></div></div></section><QuoteCTA /></main></Shell>;
}

function CourseCard({ service }: { service: Service }) {
  return <Link href={`/training/${service.slug}`} className="group focus-ring overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]" data-testid={`card-course-${service.slug}`}><ServiceMediaSlideshow service={service} className="relative mx-2 mt-2 h-40 overflow-hidden rounded-[2rem]" /><div className="p-5"><p className="mono-label text-[9px] text-[hsl(var(--accent))]">{service.group} / PROFESSIONAL DEVELOPMENT</p><h3 className="mt-3 text-lg font-bold text-[hsl(var(--primary))]">{service.title}</h3><p className="mt-2 text-sm leading-6 text-[hsl(var(--muted-foreground))]">{service.short}</p><div className="mt-5 flex items-center justify-between border-t border-[hsl(var(--border))] pt-4 text-xs font-bold text-[hsl(var(--primary))]"><span>Details & booking</span><ArrowUpRight size={15} /></div></div></Link>;
}

function CourseDetail() {
  const { course = '' } = useParams<{ course: string }>();
  const serviceRecords = useServices();
  const service = serviceRecords.find(s => s.slug === course && s.type === 'OSH — TRAINING & CAPACITY BUILDING') ?? serviceRecords[0];
  return <Shell><Seo page="training" title={`${service.title} | NexHSE Africa`} /><main><PageIntro eyebrow="Course detail · Content catalogue" title={service.title} text={service.short} image={service.image} service={service} /><section className="mx-auto max-w-7xl px-5 py-20 lg:px-8"><Breadcrumbs items={[['Training', '/training'], [service.title, `/training/${service.slug}`]]} /><div className="grid gap-12 lg:grid-cols-[1.25fr_.75fr]"><div><InfoBlock title="Course overview" text="This course page is prepared for the future NexHSE catalogue. Course-specific overview, audience, objectives and requirements are CONTENT REQUIRED and will be confirmed before publication." /><div className="mt-12 grid gap-4 sm:grid-cols-2">{[['Who should attend', 'CONTENT REQUIRED'], ['Learning objectives', 'CONTENT REQUIRED'], ['Format & duration', 'CONTENT REQUIRED'], ['Certification / completion', 'CONTENT REQUIRED'], ['Available dates', 'Check availability'], ['Price / quote status', 'Request a quote']].map(([label, value]) => <div key={label} className="rounded-2xl border border-[hsl(var(--border))] p-5"><p className="mono-label text-[9px] text-[hsl(var(--accent))]">{label}</p><p className="mt-4 text-sm font-bold text-[hsl(var(--primary))]">{value}</p></div>)}</div></div><div className="h-fit rounded-2xl bg-[hsl(var(--primary))] p-7 text-white lg:sticky lg:top-24"><p className="mono-label text-[10px] text-[hsl(var(--secondary))]">Ready to discuss training?</p><h2 className="display mt-8 text-3xl">Let’s shape the right programme for your team.</h2><p className="mt-4 text-sm leading-6 text-white/65">Share your organisation, audience and preferred timing. We’ll follow up with the next step.</p><Link href="/request-a-quote" className="focus-ring mt-7 flex min-h-12 items-center justify-center gap-2 rounded-full bg-[hsl(var(--accent))] text-sm font-bold" data-testid="link-course-book">Book training <ArrowUpRight size={16} /></Link></div></div></section><section className="bg-[hsl(var(--secondary)/.6)] px-5 py-20 lg:px-8"><div className="mx-auto max-w-7xl"><SectionHeader eyebrow="Course FAQ" title="Questions before you book?" /><FAQList /></div></section></main></Shell>;
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

function HseFaqs() {
  return <Shell><Seo page="faqs" /><main><PageIntro eyebrow="HSE FAQs" title="Clear answers for safer decisions." text="Practical answers to common workplace health, safety, fire, training and environmental management questions." image={trainingImage} /><section className="mx-auto max-w-5xl px-5 py-20 lg:px-8"><Breadcrumbs items={[['HSE FAQs', '/faqs']]} /><SectionHeader eyebrow="Frequently asked" title="Questions organisations ask before they act." text="These answers provide a starting point. Your operating context determines the right next step." /><FAQList /></section><QuoteCTA /></main></Shell>;
}

export const blogPosts = [
  { slug: 'why-risk-assessments-matter-before-incidents', category: 'Risk management', title: 'Why risk assessments matter before incidents happen', excerpt: 'A practical way to make workplace exposure visible and choose controls before an incident forces the conversation.', date: '2026-09-01', read: '5 min read', image: riskReviewImage, body: ['Risk assessment is the starting point for useful safety work. It turns a general concern into a documented understanding of hazards, people exposed, existing controls and the next improvement that matters.', 'The strongest assessments are grounded in the real task, not only the written procedure. They involve the people doing the work, test whether controls are practical and create a clear route from finding to action.', 'For organisations operating across multiple sites or changing conditions, a repeatable risk assessment process helps leaders compare exposure, prioritise resources and demonstrate that safety decisions are being managed deliberately.'] },
  { slug: 'building-fire-ready-workplaces', category: 'Fire safety', title: 'Building fire-ready workplaces', excerpt: 'Preparedness is more than equipment: it is prevention, practiced response, clear roles and a building people can evacuate.', date: '2026-08-18', read: '4 min read', image: fireImage, body: ['Fire readiness begins with understanding how a fire could start, spread and affect the people in a building. Inspections, training and equipment maintenance work together as one prevention and response system.', 'Fire marshals need practical confidence, evacuation routes need to remain usable and teams need to know what to do before an alarm becomes a real emergency.', 'A regular review of controls helps organisations find gaps early and maintain evidence for internal governance, inspections and statutory responsibilities.'] },
  { slug: 'training-that-changes-workplace-behaviour', category: 'HSE training', title: 'Training that changes workplace behaviour', excerpt: 'The value of training is measured after the classroom, when people apply the knowledge to everyday work.', date: '2026-07-30', read: '5 min read', image: trainingRoomImage, body: ['Good HSE training connects legal responsibility and technical knowledge to the decisions people make during real work. It should give learners language, confidence and practical habits they can use immediately.', 'The best programmes use examples from the organisation, leave room for questions and make the next safe action clear. Refresher learning then helps reinforce what teams have already built.', 'Training becomes more valuable when supervisors and leaders support the same expectations on site, in meetings and during routine planning.'] },
  { slug: 'environmental-management-as-operational-discipline', category: 'Environment', title: 'Environmental management as operational discipline', excerpt: 'Environmental performance improves when responsibilities, controls and monitoring are built into the way work is planned.', date: '2026-07-12', read: '4 min read', image: environmentalImage, body: ['Environmental management is not a separate document on a shelf. It is the practical discipline of understanding impacts, setting controls and checking whether those controls work.', 'Waste, effluent, emissions and resource use each require clear ownership. Teams need to know what good practice looks like and what to do when conditions change.', 'A structured management system helps organisations learn over time, demonstrate compliance and make environmental responsibility part of everyday operational decisions.'] },
  { slug: 'ppe-selection-that-works-on-site', category: 'PPE', title: 'PPE selection that works on site', excerpt: 'The right protective equipment starts with understanding the task, the hazard and the people expected to use it.', date: '2026-06-28', read: '4 min read', image: '/assets/shop/PPE-01.jpg', body: ['Personal protective equipment is most useful when it is selected around the real task rather than purchased as a generic checklist. The work environment, exposure, fit and compatibility all matter.', 'Teams also need clear instruction on fitting, inspection, cleaning, storage and replacement. Equipment that is uncomfortable or poorly understood is less likely to protect people consistently.', 'A practical PPE programme connects assessment, selection, training and supervision so that equipment becomes part of safe work instead of a last-minute response.'] },
  { slug: 'what-a-useful-safety-audit-should-leave-behind', category: 'Audits', title: 'What a useful safety audit should leave behind', excerpt: 'An audit creates value when it helps an organisation see priorities clearly and act on them after the report is delivered.', date: '2026-06-14', read: '5 min read', image: auditMeetingImage, body: ['A useful safety audit does more than list gaps. It explains the operational context, identifies the controls that matter most and gives leaders enough evidence to decide what should happen next.', 'The strongest findings are specific, proportionate and connected to ownership. They help teams distinguish between urgent exposure, system weakness and longer-term improvement.', 'When findings are reviewed with the people who will implement them, an audit becomes a route into better practice rather than a document that disappears into a filing system.'] },
  { slug: 'first-aid-readiness-starts-before-the-injury', category: 'First aid', title: 'First aid readiness starts before the injury', excerpt: 'Prepared first aid response depends on people, equipment, access and practice working together before an incident occurs.', date: '2026-05-30', read: '4 min read', image: firstAidImage, body: ['First aid readiness is a workplace system, not only a box of supplies. Organisations need suitable equipment, trained responders, clear access and a way to check whether arrangements remain current.', 'Teams should know how to raise an alert, where help is located and who takes responsibility while professional support is being arranged.', 'Regular checks and refresher training keep the response practical. They also help leaders identify gaps before a small incident exposes a larger weakness.'] },
  { slug: 'confined-space-planning-and-the-permit-to-work', category: 'High-risk work', title: 'Confined-space planning and the permit to work', excerpt: 'High-risk entry depends on preparation, atmospheric awareness, communication and a clear decision to stop when conditions change.', date: '2026-05-16', read: '6 min read', image: heightsImage, body: ['Confined-space work requires more than identifying the space. The team needs to understand the hazards that may be present, how conditions will be checked and what rescue arrangements are available.', 'A permit-to-work process helps make those decisions visible before entry. It should clarify roles, controls, communication and the conditions that require the work to stop.', 'Planning is strongest when it reflects the actual space and task. Generic paperwork cannot replace competent people, suitable equipment and a rehearsed emergency response.'] },
];

type BlogPost = (typeof blogPosts)[number];

function useBlogPosts() {
  const [storedPosts, setStoredPosts] = useState<BlogPost[]>(blogPosts);
  useEffect(() => {
    let active = true;
    const refresh = () => void fetch('/api/admin-data?resource=blog', { cache: 'no-store' }).then(response => response.ok ? response.json() : null).then(result => {
      if (active && Array.isArray(result?.items) && result.items.length) setStoredPosts(result.items);
    }).catch(() => undefined);
    refresh();
    const timer = window.setInterval(() => { if (document.visibilityState === 'visible') refresh(); }, 60_000);
    window.addEventListener('focus', refresh);
    return () => { active = false; window.clearInterval(timer); window.removeEventListener('focus', refresh); };
  }, []);
  const posts = storedPosts.length ? storedPosts : blogPosts;

  const addPost = (post: BlogPost) => {
    setStoredPosts(current => [post, ...current]);
    void fetch('/api/admin-data?resource=blog', { method: 'POST', credentials: 'same-origin', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ post }) }).catch(() => undefined);
  };
  return { posts, addPost };
}

function Blog() {
  return <Shell><Seo page="blog" /><main><PageIntro eyebrow="NexHSE Africa blog" title="Practical HSE thinking for better work." text="Workplace safety, fire, training, risk and environmental insights for organisations building stronger systems." image={fieldImage} /><section className="mx-auto max-w-7xl px-5 py-20 lg:px-8"><Breadcrumbs items={[['Blog', '/blog']]} /><SectionHeader eyebrow="Latest insights" title="Useful context for the decisions in front of you." text="Explore practical guidance from the NexHSE service areas." /><div className="grid gap-5 md:grid-cols-2">{blogPosts.map(post => <Link key={post.slug} href={`/blog/${post.slug}`} className="group focus-ring overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]" data-testid={`card-blog-${post.slug}`}><div className="relative h-56 overflow-hidden"><img src={post.image} alt="" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" /><div className="absolute inset-0 bg-gradient-to-t from-[hsl(var(--primary)/.78)] to-transparent" /><span className="absolute bottom-4 left-5 mono-label text-[10px] text-white">{post.category}</span></div><div className="p-6"><div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-[hsl(var(--muted-foreground))]"><span>{post.date}</span><span>{post.read}</span></div><h2 className="mt-4 text-2xl font-bold text-[hsl(var(--primary))]">{post.title}</h2><p className="mt-3 text-sm leading-6 text-[hsl(var(--muted-foreground))]">{post.excerpt}</p><span className="mt-6 inline-flex items-center gap-2 text-xs font-bold text-[hsl(var(--primary))]">Read article <ArrowUpRight size={15} /></span></div></Link>)}</div></section></main></Shell>;
}

function BlogDetail() {
  const { slug = '' } = useParams<{ slug: string }>(); const post = blogPosts.find(item => item.slug === slug) ?? blogPosts[0];
  return <Shell><Seo page="blog" title={`${post.title} | NexHSE Africa`} description={post.excerpt} /><main><PageIntro eyebrow={`${post.category} · NexHSE blog`} title={post.title} text={post.excerpt} image={post.image} /><article className="mx-auto max-w-4xl px-5 py-20 lg:px-8"><Breadcrumbs items={[['Blog', '/blog'], [post.title, `/blog/${post.slug}`]]} /><div className="mb-10 flex flex-wrap gap-5 border-b border-[hsl(var(--border))] pb-6 text-[10px] font-bold uppercase tracking-widest text-[hsl(var(--muted-foreground))]"><span>{post.date}</span><span>{post.read}</span><span>{post.category}</span></div><div className="prose prose-lg max-w-none prose-headings:font-serif prose-headings:text-[hsl(var(--primary))] prose-p:text-[hsl(var(--muted-foreground))]">{post.body.map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div><Link href="/request-a-quote" className="focus-ring mt-10 inline-flex min-h-12 items-center gap-2 rounded-full bg-[hsl(var(--primary))] px-5 text-sm font-bold text-white" data-testid="link-blog-quote">Discuss your HSE needs <ArrowUpRight size={16} /></Link></article></main></Shell>;
}

const articles = [['Safety', 'Workplace risk assessment', 'A practical knowledge note on understanding hazards and choosing the next control.'], ['Fire', 'Fire safety audits', 'A future guide to the questions that make fire preparedness more visible.'], ['Environment', 'Environmental audits', 'A practical introduction to reviewing environmental practice responsibly.'], ['Training', 'Building safety capability', 'Why training needs to travel back into everyday work.']];
function Knowledge() { const [query, setQuery] = useState(''); const shown = articles.filter(a => a.join(' ').toLowerCase().includes(query.toLowerCase())); return <Shell><Seo page="knowledge" /><main><PageIntro eyebrow="Safety intelligence" title="Useful information for better safety decisions." text="A structured knowledge layer for workplace safety, compliance, risk management, fire, environment and professional development." image={fireImage} /><section className="mx-auto max-w-7xl px-5 py-20 lg:px-8"><Breadcrumbs items={[['Knowledge', '/knowledge']]} /><div className="mb-10 flex max-w-xl items-center gap-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4"><Search size={17} className="text-[hsl(var(--accent))]" /><label className="sr-only" htmlFor="knowledge-search">Search knowledge</label><input id="knowledge-search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search safety intelligence" className="focus-ring min-h-12 w-full bg-transparent text-sm outline-none" data-testid="input-search-knowledge" /></div>{shown.length ? <div className="grid gap-4 md:grid-cols-2">{shown.map(([category, title, text], i) => <Link href={`/knowledge/article-${i + 1}`} key={title} className="group focus-ring rounded-2xl border border-[hsl(var(--border))] p-6 transition-all hover:-translate-y-1 hover:border-[hsl(var(--accent))]" data-testid={`card-article-${i}`}><div className="flex items-center justify-between"><span className="mono-label text-[10px] text-[hsl(var(--accent))]">{category}</span><ArrowUpRight size={16} className="text-[hsl(var(--muted-foreground))]" /></div><h2 className="mt-14 text-2xl font-bold text-[hsl(var(--primary))]">{title}</h2><p className="mt-3 max-w-md text-sm leading-6 text-[hsl(var(--muted-foreground))]">{text}</p><p className="mono-label mt-8 text-[9px] text-[hsl(var(--muted-foreground))]">CONTENT CATALOGUE · READ ARTICLE</p></Link>)}</div> : <EmptyState title="No articles match that search." text="Try another phrase or check back as new safety intelligence is published." />}</section><QuoteCTA /></main></Shell>; }

function ArticleDetail() { const { article = '' } = useParams<{ article: string }>(); const index = Math.max(0, Math.min(articles.length - 1, Number(article.replace('article-', '')) - 1 || 0)); const [category, title, text] = articles[index]; return <Shell><Seo page="knowledge" title={`${title} | NexHSE Africa`} /><main><PageIntro eyebrow={`${category} · Knowledge note`} title={title} text={text} image={category === 'Fire' ? fireImage : category === 'Training' ? trainingImage : fieldImage} /><article className="mx-auto max-w-4xl px-5 py-20 lg:px-8"><Breadcrumbs items={[['Knowledge', '/knowledge'], [title, `/knowledge/${article}`]]} /><div className="mb-10 flex flex-wrap gap-5 border-b border-[hsl(var(--border))] pb-6 text-[10px] font-bold uppercase tracking-widest text-[hsl(var(--muted-foreground))]"><span>Author · CONTENT REQUIRED</span><span>Publication date · CONTENT REQUIRED</span><span>Reading time · CONTENT REQUIRED</span></div><div className="prose prose-lg max-w-none prose-headings:font-serif prose-headings:text-[hsl(var(--primary))] prose-p:text-[hsl(var(--muted-foreground))]"><p>This article template is ready for a practical NexHSE knowledge note. It will bring together clear context, considered guidance and links to relevant services once the source content is approved.</p><h2>What this means in practice</h2><p>Good safety information should help people see the issue, understand their responsibility and decide what to do next. The final article will be specific to the relevant workplace context and will avoid unsupported claims.</p><h2>Keep the conversation moving</h2><p>When the answer needs more than an article, NexHSE can help you explore the right service or training route for your organisation.</p></div><Link href="/request-a-quote" className="focus-ring mt-10 inline-flex min-h-12 items-center gap-2 rounded-full bg-[hsl(var(--primary))] px-5 text-sm font-bold text-white" data-testid="link-article-quote">Talk to NexHSE <ArrowUpRight size={16} /></Link></article></main></Shell>; }

function Contact() { const [sent, setSent] = useState(false); return <Shell><Seo page="contact" /><main><PageIntro eyebrow="Contact NexHSE Africa" title="Let’s talk about the work that matters." text="Tell us what you are working through. We will help you find the right next conversation." image={fieldImage} /><section className="mx-auto max-w-7xl px-5 py-20 lg:px-8"><Breadcrumbs items={[['Contact', '/contact']]} /><div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr]"><div><p className="mono-label text-[10px] text-[hsl(var(--accent))]">Find us</p><div className="mt-6 space-y-5"><ContactDetail icon={MapPin} label="Address" value="Rock Centre, Outer Ring Road" href="https://maps.google.com/?q=Rock+Centre+Outer+Ring+Road" /><ContactDetail icon={Phone} label="Phone" value={phone} href={`tel:${phone.replaceAll(' ', '')}`} /><ContactDetail icon={Mail} label="Email" value={email} href={`mailto:${email}`} /></div><div className="mt-10 h-52 overflow-hidden rounded-2xl bg-[hsl(var(--secondary))]"><div className="grid h-full place-items-center bg-[radial-gradient(circle_at_center,hsl(var(--accent)/.2)_1px,transparent_1px)] [background-size:18px_18px]"><div className="rounded-full bg-[hsl(var(--primary))] p-3 text-white"><MapPin size={22} /></div></div></div></div><div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 sm:p-8"><p className="mono-label text-[10px] text-[hsl(var(--accent))]">Send an enquiry</p>{sent ? <div className="flex min-h-72 flex-col items-center justify-center text-center"><span className="grid h-12 w-12 place-items-center rounded-full bg-[hsl(var(--secondary))] text-[hsl(var(--accent))]"><Check /></span><h2 className="mt-5 text-2xl font-bold text-[hsl(var(--primary))]">Thank you. Your enquiry is ready for follow-up.</h2><p className="mt-3 text-sm text-[hsl(var(--muted-foreground))]">A member of the NexHSE team can contact you at the details provided.</p><button onClick={() => setSent(false)} className="focus-ring mt-6 text-sm font-bold text-[hsl(var(--accent))]" data-testid="button-send-another">Send another enquiry</button></div> : <form onSubmit={e => { e.preventDefault(); setSent(true); }} className="mt-6 space-y-5"><div className="grid gap-5 sm:grid-cols-2"><Field label="Your name" name="name" required /><Field label="Work email" name="email" type="email" required /></div><Field label="Organisation" name="organisation" /><label className="block text-sm font-semibold text-[hsl(var(--primary))]">How can we help?<textarea required name="message" rows={5} className="focus-ring mt-2 w-full resize-none rounded-xl border border-[hsl(var(--input))] bg-transparent p-3 text-sm outline-none" data-testid="textarea-contact-message" /></label><button className="focus-ring flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[hsl(var(--primary))] text-sm font-bold text-white" data-testid="button-submit-contact">Send enquiry <ArrowUpRight size={16} /></button></form>}</div></div></section><QuoteCTA /></main></Shell>; }

function ContactDetail({ icon: Icon, label, value, href }: { icon: IconType; label: string; value: string; href: string }) { return <a href={href} className="focus-ring flex items-start gap-4" data-testid={`link-contact-${label.toLowerCase()}`}><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[hsl(var(--secondary))] text-[hsl(var(--accent))]"><Icon size={18} /></span><span><span className="mono-label block text-[9px] text-[hsl(var(--muted-foreground))]">{label}</span><span className="mt-1 block text-sm font-bold text-[hsl(var(--primary))]">{value}</span></span></a>; }
function Field({ label, name, type = 'text', required = false }: { label: string; name: string; type?: string; required?: boolean }) { return <label className="block text-sm font-semibold text-[hsl(var(--primary))]">{label}{required && <span className="ml-1 text-[hsl(var(--destructive))]">*</span>}<input name={name} type={type} required={required} className="focus-ring mt-2 min-h-12 w-full rounded-xl border border-[hsl(var(--input))] bg-transparent px-3 text-sm outline-none" data-testid={`input-contact-${name}`} /></label>; }

function LegacyQuote() {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [quoteNumber, setQuoteNumber] = useState('');
  const [form, setForm] = useState({
    need: '',
    organisation: '',
    industry: '',
    location: '',
    timeline: '',
    contactName: '',
    email: '',
    phone: '',
  });

  const steps = ['Need', 'Organisation', 'Contact'];

  const updateField = (field: keyof typeof form, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const canContinue = step === 1
    ? !!form.need
    : step === 2
      ? !!form.organisation && !!form.industry && !!form.location && !!form.timeline
      : !!form.contactName && !!form.email && !!form.phone;

  const submitRequest = async () => {
    setSubmitting(true);
    setSubmitError('');
    try {
      const response = await fetch('/api/quotes', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(form),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok) throw new Error(result?.error ?? 'Your quote request could not be submitted.');
      setQuoteNumber(result?.quoteNumber ?? '');
      setSubmitted(true);
    } catch (issue) {
      setSubmitError(issue instanceof Error ? issue.message : 'Your quote request could not be submitted.');
    } finally {
      setSubmitting(false);
    }
  };

  return <Shell><Seo page="contact" title="Request a Quote | NexHSE Africa" description="Tell NexHSE Africa what your organisation needs and start a practical conversation about workplace safety, training and environmental support." /><main><section className="bg-[hsl(var(--primary))] text-white"><div className="mx-auto max-w-7xl px-5 pb-16 pt-14 lg:px-8 lg:pb-20"><Breadcrumbs items={[['Request a quote', '/request-a-quote']]} /><p className="mono-label text-[10px] text-[hsl(var(--secondary))]">Three-step workflow</p><h1 className="display mt-5 max-w-3xl text-5xl leading-[1.02] tracking-[-.045em] sm:text-7xl">Start with the situation.<br /><em className="font-medium text-[hsl(var(--secondary))]">We’ll find the route.</em></h1><p className="mt-6 max-w-xl text-base leading-7 text-white/70">A concise qualification flow helps us understand your risk, service need and timing without the overload of a long enquiry form.</p></div></section><section className="mx-auto max-w-7xl px-5 py-16 lg:px-8">{submitted ? <div className="mx-auto max-w-xl rounded-2xl bg-[hsl(var(--secondary))] p-10 text-center"><span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[hsl(var(--accent))] text-white"><Check /></span><h2 className="display mt-6 text-4xl text-[hsl(var(--primary))]">Your request is ready for review.</h2><p className="mt-4 text-sm leading-6 text-[hsl(var(--muted-foreground))]">Thank you, {form.contactName || 'there'}. A NexHSE team member will follow up on the {form.need || 'service'} enquiry using the contact details provided.</p><Link href="/contact" className="focus-ring mt-7 inline-flex min-h-11 items-center gap-2 rounded-full bg-[hsl(var(--primary))] px-5 text-xs font-bold text-white" data-testid="link-quote-done-contact">Back to contact <ArrowUpRight size={15} /></Link></div> : <div className="mx-auto max-w-3xl rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 sm:p-10"><div className="mb-12 grid grid-cols-3 gap-2 sm:grid-cols-3">{steps.map((s, i) => <div key={s} className={`${i + 1 <= step ? 'text-[hsl(var(--accent))]' : 'text-[hsl(var(--muted-foreground))]'}`}><div className={`h-1 rounded-full ${i + 1 <= step ? 'bg-[hsl(var(--accent))]' : 'bg-[hsl(var(--border))]'}`} /><span className="mt-3 block text-[10px] font-bold leading-4">{i + 1}. {s}</span></div>)}</div><p className="mono-label text-[10px] text-[hsl(var(--accent))]">Step {step} of 3</p>{step === 1 && <div><h2 className="display mt-4 text-4xl text-[hsl(var(--primary))]">What do you need?</h2><p className="mt-3 text-sm text-[hsl(var(--muted-foreground))]">Choose the service area or safety risk you want NexHSE to help with.</p><div className="mt-8 grid gap-3 sm:grid-cols-2">{services.slice(0, 8).map(service => <button key={service.slug} type="button" onClick={() => updateField('need', service.title)} className={`focus-ring min-h-16 rounded-xl border p-4 text-left text-sm font-bold ${form.need === service.title ? 'border-[hsl(var(--accent))] bg-[hsl(var(--secondary))] text-[hsl(var(--primary))]' : 'border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))]'}`} data-testid={`button-quote-need-${service.slug}`}>{service.title}</button>)}</div></div>}{step === 2 && <div><h2 className="display mt-4 text-4xl text-[hsl(var(--primary))]">Tell us about your organisation.</h2><div className="mt-8 space-y-5">{[
          ['Organisation name', 'organisation'],
          ['Industry or operating context', 'industry'],
          ['Site location', 'location'],
          ['Preferred timeline', 'timeline'],
        ].map(([label, field]) => <label key={label} className="block text-sm font-semibold text-[hsl(var(--primary))]">{label}<input value={form[field as keyof typeof form]} onChange={event => updateField(field as keyof typeof form, event.target.value)} className="focus-ring mt-2 min-h-12 w-full rounded-xl border border-[hsl(var(--input))] bg-transparent px-3 text-sm outline-none" data-testid={`input-quote-${label.toLowerCase().replaceAll(' ', '-')}`} /></label>)}</div></div>}{step === 3 && <div><h2 className="display mt-4 text-4xl text-[hsl(var(--primary))]">Send your contact details.</h2><div className="mt-8 space-y-5">{[
          ['Your name', 'contactName'],
          ['Work email', 'email'],
          ['Phone number', 'phone'],
        ].map(([label, field]) => <label key={label} className="block text-sm font-semibold text-[hsl(var(--primary))]">{label}<input value={form[field as keyof typeof form]} onChange={event => updateField(field as keyof typeof form, event.target.value)} className="focus-ring mt-2 min-h-12 w-full rounded-xl border border-[hsl(var(--input))] bg-transparent px-3 text-sm outline-none" data-testid={`input-quote-${label.toLowerCase().replaceAll(' ', '-')}`} /></label>)}</div><div className="mt-8 rounded-xl bg-[hsl(var(--secondary)/.7)] p-4 text-sm text-[hsl(var(--primary))]"><p><strong>Need:</strong> {form.need || 'Not specified yet'}</p><p className="mt-2"><strong>Organisation:</strong> {form.organisation || 'Not provided yet'}</p><p className="mt-2"><strong>Location:</strong> {form.location || 'Not provided yet'}</p></div></div>}<div className="mt-10 flex justify-between gap-3 border-t border-[hsl(var(--border))] pt-6"><button type="button" onClick={() => setStep(prev => Math.max(1, prev - 1))} className={`focus-ring min-h-11 rounded-full border border-[hsl(var(--border))] px-5 text-xs font-bold text-[hsl(var(--primary))] ${step === 1 ? 'invisible' : ''}`} data-testid="button-quote-back">Back</button>{step < 3 ? <button type="button" onClick={() => setStep(prev => Math.min(3, prev + 1))} disabled={!canContinue} className="focus-ring min-h-11 rounded-full bg-[hsl(var(--primary))] px-6 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-40" data-testid="button-quote-next">Continue <ChevronRight size={14} className="ml-1 inline" /></button> : <button type="button" onClick={() => setSubmitted(true)} disabled={!canContinue} className="focus-ring min-h-11 rounded-full bg-[hsl(var(--accent))] px-6 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-40" data-testid="button-quote-submit">Submit request <ArrowUpRight size={15} className="ml-1 inline" /></button>}</div></div>}</section></main></Shell>;
}

function Quote() {
  return <Shell><Seo page="contact" title="Request a Quote | NexHSE Africa" description="Tell NexHSE Africa what your organisation needs and start a practical conversation about workplace safety, training and environmental support." /><Suspense fallback={<main className="mx-auto max-w-5xl px-5 py-14 text-sm text-[hsl(var(--muted-foreground))]">Loading quote form…</main>}><QuoteRequestForm /></Suspense></Shell>;
}

const baseShopProducts = [
  { name: 'Industrial Safety Helmet', category: 'PPE', price: 1450, image: '/assets/shop/helmet.jpg', description: 'Certified head protection with comfortable fit for on-site teams and contractors.' },
  { name: 'Safety Helmet - White', category: 'PPE', price: 1450, image: '/assets/shop/helemt.jpg', description: 'A lightweight hard hat for everyday site protection and supervised work.' },
  { name: 'Safety Boots', category: 'PPE', price: 2200, image: '/assets/shop/boots.jpg', description: 'Heavy-duty, slip-resistant footwear built for long shifts on active job sites.' },
  { name: 'Safety Boots - Field', category: 'PPE', price: 2350, image: '/assets/shop/boots-02.jpg', description: 'Durable protective boots for field teams working across varied terrain.' },
  { name: 'Safety Boots - Industrial', category: 'PPE', price: 2500, image: '/assets/shop/boots-03.jpg', description: 'Industrial footwear suited to demanding work areas and maintenance environments.' },
  { name: 'High-Vis Vest', category: 'PPE', price: 1250, image: '/assets/shop/vest.jpg', description: 'Bright visibility wear for construction, logistics and operational teams.' },
  { name: 'Protective Work Gloves', category: 'PPE', price: 750, image: '/assets/shop/glove.jpg', description: 'Grip-focused hand protection for handling, maintenance and general site work.' },
  { name: 'Eye Protection', category: 'PPE', price: 650, image: '/assets/shop/eye-protection.jpg', description: 'Clear protective eyewear for dust, debris and routine workplace hazards.' },
  { name: 'Protective Coverall', category: 'PPE', price: 3200, image: '/assets/shop/suit.jpg', description: 'Full-body workwear for teams requiring practical clothing protection on site.' },
  { name: 'PPE Starter Kit', category: 'PPE', price: 4200, image: '/assets/shop/PPE-01.jpg', description: 'A practical combination of essential personal protective equipment for new teams.' },
  { name: 'Reflective Safety Strip', category: 'PPE', price: 580, image: '/assets/shop/Reflector.jpg', description: 'Portable visibility and hazard marking support for outdoor work areas.' },
  { name: '9kg Fire Extinguisher', category: 'Fire Equipment', price: 8900, image: '/assets/shop/6kg.jpg', description: 'A dependable multipurpose extinguisher for facilities and mobile teams.' },
  { name: '12kg Fire Extinguisher', category: 'Fire Equipment', price: 11900, image: '/assets/shop/12kg.jpg', description: 'Higher-capacity fire protection for larger operational and storage areas.' },
  { name: 'Fire Extinguisher', category: 'Fire Equipment', price: 7600, image: '/assets/shop/extinguishern-01.jpg', description: 'Accessible fire response equipment for workplace readiness and preparedness.' },
  { name: 'Fire Blanket', category: 'Fire Equipment', price: 4800, image: '/assets/shop/fire-blanket.jpg', description: 'Fast protection for kitchen, workshop and emergency response scenarios.' },
  { name: 'Foam Fire Suppression Agent', category: 'Fire Equipment', price: 6300, image: '/assets/shop/foam.jpg', description: 'Fire response support for practical workplace readiness and emergency preparation.' },
  { name: 'Fire Powder', category: 'Fire Equipment', price: 5800, image: '/assets/shop/powder.jpg', description: 'Dry powder fire suppression support for common workplace fire risks.' },
  { name: 'Fire Safety Cabinet', category: 'Fire Equipment', price: 14800, image: '/assets/shop/c02.jpg', description: 'Protective storage and access support for fire response equipment.' },
  { name: 'Fire Safety Drill Kit', category: 'Fire Equipment', price: 5200, image: '/assets/shop/drilll.jpg', description: 'Practical equipment support for fire drills and response training.' },
  { name: 'Safety Ladder', category: 'Fire Equipment', price: 18500, image: '/assets/shop/ladder.jpg', description: 'Access equipment for planned maintenance and emergency preparedness.' },
  { name: 'Workplace Safety Kit', category: 'PPE', price: 5600, image: '/assets/shop/03.jpg', description: 'General safety equipment for facilities, teams and operational readiness.' },
];

export const shopProducts: ShopProduct[] = baseShopProducts.map((product, index) => ({
  ...product,
  imageBackground: product.image.includes('fire-blanket') ? '#f3f0e9' : '#ffffff',
  longDescription: `${product.description} Designed for organisations in Kenya and Africa that need dependable workplace protection, practical readiness and equipment selected for real operating conditions.`,
  seoTitle: `${product.name} | ${product.category} | NexHSE Africa`,
  seoDescription: `${product.description} Shop ${product.name.toLowerCase()} from NexHSE Africa for workplace safety, PPE and fire equipment supply in Kenya.`,
  keywords: [product.name, product.category, 'workplace safety Kenya', 'NexHSE Africa', 'safety equipment'],
  features: ['Workplace-ready protection', 'Practical fit for operational teams', 'Suitable for routine inspection and replacement programmes'],
  useCases: ['Construction and site operations', 'Facilities and maintenance teams', 'Workplace safety readiness'],
  brand: 'NexHSE Africa',
  condition: 'New',
  stock: [18, 22, 14, 11, 9, 28, 36, 31, 16, 12, 40, 8, 6, 13, 19, 24, 17, 5, 21, 7, 15][index] ?? 0,
}));

function productSlug(product: (typeof shopProducts)[number]) {
  return product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function shopHomeHref() {
  const hostname = window.location.hostname.toLowerCase();
  if (hostname === 'shop.nexhse.co.ke') return '/';
  if (hostname === 'admin.nexhse.co.ke') return 'https://shop.nexhse.co.ke';
  return '/shop';
}

function productDetailHref(product: ShopProduct) {
  const hostname = window.location.hostname.toLowerCase();
  const slug = productSlug(product);
  if (hostname === 'shop.nexhse.co.ke') return `/${slug}`;
  if (hostname === 'admin.nexhse.co.ke') return `https://shop.nexhse.co.ke/${slug}`;
  return `/shop/${slug}`;
}

function cartHref() {
  const hostname = window.location.hostname.toLowerCase();
  if (hostname === 'shop.nexhse.co.ke') return '/cart';
  if (hostname === 'admin.nexhse.co.ke') return 'https://shop.nexhse.co.ke/cart';
  return '/shop/cart';
}

function checkoutHref() {
  const hostname = window.location.hostname.toLowerCase();
  if (hostname === 'shop.nexhse.co.ke') return '/checkout';
  if (hostname === 'admin.nexhse.co.ke') return 'https://shop.nexhse.co.ke/checkout';
  return '/shop/checkout';
}

function useShopCart() {
  const [cart, setCart] = useSiteStore<Record<string, number>>('nexhse-shop-cart', emptyCart);

  const addToCart = (productName: string, quantity = 1) => setCart(prev => ({ ...prev, [productName]: (prev[productName] ?? 0) + quantity }));
  const removeFromCart = (productName: string) => setCart(prev => {
    const next = { ...prev, [productName]: Math.max(0, (prev[productName] ?? 0) - 1) };
    if (!next[productName]) delete next[productName];
    return next;
  });
  const clearCart = () => setCart({});
  return { cart, addToCart, removeFromCart, clearCart };
}

function useShopOrders() {
  const [orders, setOrders] = useSiteStore<ShopOrder[]>('nexhse-shop-orders', emptyOrders);
  const store = useContext(SiteStoreContext);

  useEffect(() => {
    const isAdmin = window.location.hostname === 'admin.nexhse.co.ke' || window.location.pathname.startsWith('/admin');
    if (!isAdmin) return;
    void fetch('/api/admin-data?resource=orders', { credentials: 'same-origin', cache: 'no-store' }).then(response => response.ok ? response.json() : null).then(result => {
      if (Array.isArray(result?.items)) setOrders(result.items);
    }).catch(() => undefined);
  }, [setOrders]);

  const createOrder = async (order: Omit<ShopOrder, 'id' | 'createdAt'>) => {
    const created: ShopOrder = { ...order, id: `NX-${Date.now().toString(36).toUpperCase()}`, createdAt: new Date().toISOString() };
    const stored = store ? await store.appendOrder(order, created) : created;
    setOrders(current => [stored, ...current.filter(item => item.id !== stored.id)]);
    return stored;
  };
  const updateOrder = (id: string, changes: Partial<ShopOrder> & { note?: string }) => {
    setOrders(current => current.map(order => order.id === id ? { ...order, ...changes } : order));
    void fetch(`/api/admin-data?resource=orders&id=${encodeURIComponent(id)}`, { method: 'PATCH', credentials: 'same-origin', headers: { 'content-type': 'application/json' }, body: JSON.stringify(changes) }).then(async response => {
      if (!response.ok) throw new Error('Order update failed');
      const result = await response.json();
      if (result.item) setOrders(current => current.map(order => order.id === id ? { ...order, ...result.item } : order));
    }).catch(() => undefined);
  };
  return { orders, createOrder, updateOrder };
}

function useServiceTickets() {
  const [tickets, setTickets] = useSiteStore<ServiceTicket[]>('nexhse-service-tickets', emptyTickets);
  useEffect(() => {
    void fetch('/api/admin-data?resource=tickets', { credentials: 'same-origin', cache: 'no-store' }).then(response => response.ok ? response.json() : null).then(result => {
      if (Array.isArray(result?.items) && result.items.length) setTickets(result.items);
    }).catch(() => undefined);
  }, [setTickets]);
  const updateTicket = (id: string, status: ServiceTicket['status']) => {
    setTickets(current => current.map(ticket => ticket.id === id ? { ...ticket, status } : ticket));
    void fetch(`/api/admin-data?resource=tickets&id=${encodeURIComponent(id)}`, { method: 'PATCH', credentials: 'same-origin', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ status }) }).catch(() => undefined);
  };
  const addTicket = (ticket: Omit<ServiceTicket, 'id' | 'createdAt' | 'status'>) => {
    const created = { ...ticket, id: `CS-${Date.now().toString(36).toUpperCase()}`, createdAt: new Date().toISOString(), status: 'open' as const };
    setTickets(current => [created, ...current]);
    void fetch('/api/admin-data?resource=tickets', { method: 'POST', credentials: 'same-origin', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ticket: created }) }).catch(() => undefined);
  };
  const recordFollowup = (id: string, followup: string) => fetch(`/api/admin-data?resource=tickets&id=${encodeURIComponent(id)}`, { method: 'PATCH', credentials: 'same-origin', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ followup }) });
  return { tickets, updateTicket, addTicket, recordFollowup };
}

function useShopProducts() {
  const [storedProducts, setStoredProducts] = useState<Partial<ShopProduct>[]>(shopProducts);
  const [hiddenProductIds, setHiddenProductIds] = useState<string[]>([]);
  useEffect(() => {
    let active = true;
    const refresh = () => void fetch('/api/admin-data?resource=products', { cache: 'no-store' }).then(response => response.ok ? response.json() : null).then(result => {
      if (active && Array.isArray(result?.items)) {
        const isAdmin = window.location.hostname === 'admin.nexhse.co.ke' || window.location.pathname.startsWith('/admin');
        setStoredProducts(result.items.map((product: ShopProduct) => isAdmin ? { ...product, price: product.basePrice ?? product.price } : product));
        setHiddenProductIds(Array.isArray(result.hiddenIds) ? result.hiddenIds : []);
      }
    }).catch(() => undefined);
    refresh();
    const timer = window.setInterval(() => { if (document.visibilityState === 'visible') refresh(); }, 60_000);
    window.addEventListener('focus', refresh);
    return () => { active = false; window.clearInterval(timer); window.removeEventListener('focus', refresh); };
  }, []);
  const products = useMemo(() => {
    const merged = shopProducts.map(defaultProduct => ({ ...defaultProduct, ...(storedProducts.find(product => (product.id && product.id === defaultProduct.id) || product.name === defaultProduct.name) ?? {}) }));
    const knownNames = new Set(shopProducts.map(product => product.name));
    const hiddenIds = new Set(hiddenProductIds);
    return [...merged, ...storedProducts.filter(product => typeof product.name === 'string' && !knownNames.has(product.name)) as ShopProduct[]]
      .filter(product => product.active !== false && !hiddenIds.has(product.id ?? productSlug(product)));
  }, [storedProducts, hiddenProductIds]);
  const saveProduct = async (product: ShopProduct) => {
    const normalized = { ...product, id: product.id ?? product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''), sku: product.sku?.trim() || `NX-${product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').toUpperCase()}` };
    const response = await fetch('/api/admin-data?resource=products', { method: 'PUT', credentials: 'same-origin', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ product: normalized }) });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error ?? 'Unable to save product');
    const saved = result.item ?? normalized;
    setStoredProducts(current => [...current.filter(item => item.id !== saved.id && item.name !== saved.name), saved]);
    setHiddenProductIds(current => current.filter(id => id !== saved.id));
  };
  const updateProduct = async (name: string, changes: Partial<ShopProduct>) => {
    const current = products.find(product => product.name === name);
    if (current) await saveProduct({ ...current, ...changes });
  };
  const createProduct = (product: ShopProduct) => saveProduct(product);
  const deleteProduct = async (product: ShopProduct) => {
    const id = product.id ?? productSlug(product);
    const response = await fetch(`/api/admin-data?resource=products&id=${encodeURIComponent(id)}`, { method: 'DELETE', credentials: 'same-origin', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ product }) });
    const result = await response.json().catch(() => null);
    if (!response.ok) throw new Error(result?.error ?? 'Unable to remove product');
    setStoredProducts(current => [...current.filter(item => item.id !== id && item.name !== product.name), { ...product, id, active: false }]);
    setHiddenProductIds(current => current.includes(id) ? current : [...current, id]);
  };
  return { products, updateProduct, createProduct, deleteProduct };
}

function useServices() {
  const [records, setRecords] = useState<Service[]>(services);
  useEffect(() => {
    let active = true;
    void fetch('/api/admin-data?resource=services', { cache: 'no-store' }).then(response => response.ok ? response.json() : null).then(result => {
      if (!active || !Array.isArray(result?.items) || !result.items.length) return;
      const bySlug = new Map<string, Partial<Service>>(result.items.map((item: Partial<Service>) => [item.slug, item]));
      const merged = [...services.map(service => ({ ...service, ...bySlug.get(service.slug), icon: service.icon })), ...result.items.filter((item: Service) => !services.some(service => service.slug === item.slug)).map((item: Service) => ({ ...item, icon: ShieldCheck }))];
      const isAdmin = window.location.hostname === 'admin.nexhse.co.ke' || window.location.pathname.startsWith('/admin');
      setRecords(isAdmin ? merged : merged.filter(service => service.active !== false));
    }).catch(() => undefined);
    return () => { active = false; };
  }, []);
  return records;
}

function useProductSeo(product?: ShopProduct) {
  useEffect(() => {
    if (!product) return;
    const productOrigin = window.location.hostname.toLowerCase() === 'shop.nexhse.co.ke' ? 'https://shop.nexhse.co.ke' : siteUrl;
    const canonicalUrl = `${productOrigin}${window.location.hostname.toLowerCase() === 'shop.nexhse.co.ke' ? `/${productSlug(product)}` : `/shop/${productSlug(product)}`}`;
    document.title = product.seoTitle;
    const setMeta = (name: string, content: string) => {
      let element = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
      if (!element) { element = document.createElement('meta'); element.name = name; document.head.appendChild(element); }
      element.content = content;
    };
    const setProperty = (property: string, content: string) => {
      let element = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement | null;
      if (!element) { element = document.createElement('meta'); element.setAttribute('property', property); document.head.appendChild(element); }
      element.content = content;
    };
    setMeta('description', product.seoDescription); setMeta('keywords', product.keywords.join(', ')); setMeta('robots', 'index, follow'); setMeta('googlebot', 'index, follow'); setMeta('bingbot', 'index, follow'); setMeta('twitter:title', product.seoTitle); setMeta('twitter:description', product.seoDescription); setMeta('twitter:image', `${siteUrl}${product.image}`);
    setProperty('og:title', product.seoTitle); setProperty('og:description', product.seoDescription); setProperty('og:type', 'product'); setProperty('og:url', canonicalUrl); setProperty('og:image', `${siteUrl}${product.image}`);
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.appendChild(canonical); }
    canonical.href = canonicalUrl;
    let structuredData = document.querySelector('#nexhse-product-structured-data') as HTMLScriptElement | null;
    if (!structuredData) { structuredData = document.createElement('script'); structuredData.id = 'nexhse-product-structured-data'; structuredData.type = 'application/ld+json'; document.head.appendChild(structuredData); }
    structuredData.textContent = JSON.stringify({ '@context': 'https://schema.org', '@type': 'Product', name: product.name, description: product.seoDescription, image: [`${siteUrl}${product.image}`], sku: productSlug(product), brand: { '@type': 'Brand', name: product.brand }, category: product.category, keywords: product.keywords.join(', '), offers: { '@type': 'Offer', url: canonicalUrl, priceCurrency: 'KES', price: product.price, availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock', itemCondition: 'https://schema.org/NewCondition' } });
  }, [product]);
}

function Shop() {
  const [category, setCategory] = useState('All');
  const [, navigate] = useLocation();
  const { cart, addToCart, removeFromCart, clearCart } = useShopCart();
  const { products } = useShopProducts();
  const visibleProducts = category === 'All' ? products : products.filter(product => product.category === category);
  const cartCount = Object.values(cart).reduce((sum, quantity) => sum + quantity, 0);
  const cartTotal = products.reduce((sum, product) => sum + product.price * (cart[product.name] ?? 0), 0);

  return <Shell><Seo page="home" title="Shop | NexHSE Africa" description="Purchase workplace PPE and fire equipment for safer, better-prepared operations." /><main><ShopHero /><section id="shop-catalogue" className="mx-auto max-w-7xl scroll-mt-8 px-5 py-20 lg:px-8"><Breadcrumbs items={[['Shop', '/shop']]} /><div className="mb-8 flex flex-col gap-4 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="mono-label text-[10px] text-[hsl(var(--accent))]">Your basket</p><p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">{cartCount ? `${cartCount} item${cartCount === 1 ? '' : 's'} selected` : 'No products selected yet.'}</p></div><div className="flex items-center gap-3"><span className="text-lg font-bold text-[hsl(var(--primary))]">KSh {cartTotal.toLocaleString()}</span>{cartCount > 0 && <button type="button" onClick={clearCart} className="focus-ring min-h-10 rounded-full border border-[hsl(var(--border))] px-4 text-xs font-bold text-[hsl(var(--primary))]" data-testid="button-shop-clear-cart">Clear cart</button>}</div></div><div className="mb-10 flex flex-wrap gap-2">{['All', 'PPE', 'Fire Equipment'].map(option => <button key={option} onClick={() => setCategory(option)} className={`focus-ring min-h-11 rounded-full border px-4 text-xs font-bold ${category === option ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))] text-white' : 'border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))]'}`} data-testid={`button-shop-filter-${option.toLowerCase().replaceAll(' ', '-')}`}>{option}</button>)}</div><div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">{visibleProducts.map(product => <div key={product.name} role="link" tabIndex={0} onClick={() => navigate(productDetailHref(product))} onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') navigate(productDetailHref(product)); }} style={{ backgroundColor: product.imageBackground }} className="cursor-pointer overflow-hidden rounded-2xl border border-[hsl(var(--border))] transition-transform hover:-translate-y-1" data-testid={`card-shop-${product.name.toLowerCase().replaceAll(' ', '-')}`}><div className="shop-product-image-frame flex h-72 items-center justify-center" style={{ backgroundColor: product.imageBackground }}><img src={product.image} alt={product.name} className="h-full w-full object-contain p-1" /></div><div className="p-5"><div className="flex items-center justify-between"><span className="mono-label text-[9px] text-[hsl(var(--accent))]">{product.category}</span><span className="text-sm font-bold text-[hsl(var(--primary))]">KSh {product.price.toLocaleString()}</span></div><h3 className="mt-4 text-xl font-bold text-[hsl(var(--primary))]">{product.name}</h3><p className="mt-2 text-sm leading-6 text-[hsl(var(--muted-foreground))]">{product.description}</p><p className="mt-3 text-[10px] font-bold uppercase tracking-widest text-[hsl(var(--muted-foreground))]">{product.stock} available · View product</p><div className="mt-5 flex items-center gap-2">{cart[product.name] ? <><button type="button" onClick={event => { event.stopPropagation(); removeFromCart(product.name); }} className="focus-ring grid h-10 w-10 place-items-center rounded-full border border-[hsl(var(--border))] text-sm font-bold text-[hsl(var(--primary))]" aria-label={`Remove one ${product.name}`} data-testid={`button-shop-remove-${product.name.toLowerCase().replaceAll(' ', '-')}`}>-</button><span className="min-w-6 text-center text-sm font-bold text-[hsl(var(--primary))]">{cart[product.name]}</span></> : null}<button type="button" onClick={event => { event.stopPropagation(); addToCart(product.name); }} className="focus-ring inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full bg-[hsl(var(--primary))] px-4 text-xs font-bold text-white" data-testid={`button-shop-buy-${product.name.toLowerCase().replaceAll(' ', '-')}`}>{cart[product.name] ? 'Add another' : 'Add to cart'} <ArrowUpRight size={14} /></button></div></div></div>)}</div></section><section className="bg-[hsl(var(--secondary)/.5)] px-5 py-20 lg:px-8"><div className="mx-auto max-w-7xl rounded-2xl bg-[hsl(var(--primary))] p-8 text-white"><p className="mono-label text-[10px] text-[hsl(var(--secondary))]">Storefront groundwork</p><h2 className="display mt-4 text-4xl leading-tight">Built for future stock, orders and customer operations.</h2><p className="mt-4 max-w-2xl text-sm leading-7 text-white/70">This is the initial storefront layer for PPE and fire equipment procurement, ready to connect to a proper admin workflow for customer data, stock visibility and order operations.</p><Link href="/request-a-quote" className="focus-ring mt-8 inline-flex items-center gap-2 rounded-full bg-[hsl(var(--accent))] px-5 py-3 text-sm font-bold" data-testid="link-shop-quote">Request a wholesale quote <ArrowUpRight size={16} /></Link></div></section><QuoteCTA /></main></Shell>;
}

function CartPage() {
  const { cart, addToCart, removeFromCart, clearCart } = useShopCart();
  const { products } = useShopProducts();
  const items = products.filter(product => cart[product.name]).map(product => ({
    ...product,
    quantity: cart[product.name] ?? 0,
    lineTotal: product.price * (cart[product.name] ?? 0),
  }));
  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const deliveryFee = subtotal > 0 ? 300 : 0;
  const total = subtotal + deliveryFee;

  if (!items.length) {
    return <Shell><Seo page="home" title="Your cart | NexHSE Africa" description="Your NexHSE Africa cart is currently empty." /><main className="mx-auto max-w-3xl px-5 py-24 text-center"><p className="mono-label text-[10px] text-[hsl(var(--accent))]">Cart is empty</p><h1 className="display mt-4 text-5xl text-[hsl(var(--primary))]">Choose something for your team.</h1><Link href={shopHomeHref()} className="focus-ring mt-8 inline-flex min-h-11 items-center gap-2 rounded-full bg-[hsl(var(--primary))] px-5 text-xs font-bold text-white">Browse shop <ArrowUpRight size={15} /></Link></main></Shell>;
  }

  return <Shell><Seo page="home" title="Your cart | NexHSE Africa" description="Review your NexHSE Africa order before checkout." /><main className="mx-auto max-w-6xl px-5 py-16 lg:px-8"><Breadcrumbs items={[['Shop', '/shop'], ['Cart', '/shop/cart']]} /><div className="grid gap-8 lg:grid-cols-[1.2fr_.8fr]">
    <section className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 sm:p-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="mono-label text-[10px] text-[hsl(var(--accent))]">Your basket</p>
          <h1 className="display mt-3 text-4xl text-[hsl(var(--primary))]">Order summary</h1>
        </div>
        <button type="button" onClick={clearCart} className="focus-ring min-h-10 rounded-full border border-[hsl(var(--border))] px-4 text-xs font-bold text-[hsl(var(--primary))]">Clear cart</button>
      </div>
      <div className="mt-8 space-y-5">
        {items.map(item => <div key={item.name} className="flex flex-col gap-4 rounded-2xl border border-[hsl(var(--border))] p-4 sm:flex-row sm:items-center">
          <img src={item.image} alt={item.name} className="h-20 w-20 rounded-xl object-cover" />
          <div className="flex-1">
            <p className="text-lg font-bold text-[hsl(var(--primary))]">{item.name}</p>
            <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">KSh {item.price.toLocaleString()} each</p>
          </div>
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => removeFromCart(item.name)} className="focus-ring grid h-10 w-10 place-items-center rounded-full border border-[hsl(var(--border))] text-lg text-[hsl(var(--primary))]" aria-label={`Remove one ${item.name}`}>−</button>
            <span className="min-w-8 text-center text-sm font-bold text-[hsl(var(--primary))]">{item.quantity}</span>
            <button type="button" onClick={() => addToCart(item.name)} className="focus-ring grid h-10 w-10 place-items-center rounded-full border border-[hsl(var(--border))] text-lg text-[hsl(var(--primary))]" aria-label={`Add one ${item.name}`}>+</button>
          </div>
          <p className="text-lg font-bold text-[hsl(var(--primary))]">KSh {item.lineTotal.toLocaleString()}</p>
        </div>)}
      </div>
    </section>
    <aside className="h-fit rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
      <p className="mono-label text-[10px] text-[hsl(var(--accent))]">Summary</p>
      <div className="mt-6 space-y-3 text-sm">
        <div className="flex items-center justify-between"><span className="text-[hsl(var(--muted-foreground))]">Subtotal</span><span className="font-bold text-[hsl(var(--primary))]">KSh {subtotal.toLocaleString()}</span></div>
        <div className="flex items-center justify-between"><span className="text-[hsl(var(--muted-foreground))]">Delivery</span><span className="font-bold text-[hsl(var(--primary))]">KSh {deliveryFee.toLocaleString()}</span></div>
        <div className="flex items-center justify-between border-t border-[hsl(var(--border))] pt-3"><span className="text-base font-bold text-[hsl(var(--primary))]">Total</span><span className="text-xl font-bold text-[hsl(var(--primary))]">KSh {total.toLocaleString()}</span></div>
      </div>
      <Link href={checkoutHref()} className="focus-ring mt-8 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[hsl(var(--primary))] px-5 text-sm font-bold text-white">Proceed to checkout <ArrowUpRight size={16} /></Link>
      <Link href={shopHomeHref()} className="focus-ring mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-[hsl(var(--border))] px-5 text-xs font-bold text-[hsl(var(--primary))]">Continue shopping</Link>
    </aside>
  </div></main></Shell>;
}

type PaymentGatewayStatus = {
  stripeEnabled: boolean;
  stripeReady: boolean;
  mpesaEnabled: boolean;
  mpesaReady: boolean;
  requiresConfiguration: boolean;
  mode: 'live' | 'sandbox' | 'unconfigured';
};

async function getPaymentGatewayStatus(): Promise<PaymentGatewayStatus> {
  try {
    const response = await fetch('/api/payments/config', { credentials: 'same-origin', cache: 'no-store' });
    if (!response.ok) throw new Error('Payment config unavailable');
    const result = (await response.json()) as Partial<PaymentGatewayStatus> & { mode?: string; stripeEnabled?: boolean; mpesaEnabled?: boolean };
    return {
      stripeEnabled: Boolean(result.stripeEnabled),
      stripeReady: Boolean(result.stripeReady),
      mpesaEnabled: Boolean(result.mpesaEnabled),
      mpesaReady: Boolean(result.mpesaReady),
      requiresConfiguration: Boolean(result.requiresConfiguration),
      mode: result.mode === 'live' ? 'live' : result.mode === 'sandbox' ? 'sandbox' : 'unconfigured',
    };
  } catch {
    return { stripeEnabled: false, stripeReady: false, mpesaEnabled: false, mpesaReady: false, requiresConfiguration: true, mode: 'unconfigured' };
  }
}

async function startGatewayCheckout(paymentMethod: ShopOrder['paymentMethod'], orderId: string, paymentStatusToken?: string) {
  const endpoint = paymentMethod === 'Card' ? '/api/payments/stripe/create-checkout-session' : '/api/payments/mpesa/stk-push';
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ orderId, paymentStatusToken }),
    });
    const result = await response.json();
    if (!response.ok || result?.ok !== true) {
      return { ok: false, message: result?.message ?? 'The selected payment gateway is not ready yet.' } as const;
    }
    return { ok: true, redirectUrl: result.redirectUrl ?? null, message: result.message ?? 'Payment request started.' } as const;
  } catch {
    return { ok: false, message: 'Payment gateway could not be reached. Order remains pending for manual confirmation.' } as const;
  }
}

function ShopCheckout() {
  const params = new URLSearchParams(window.location.search);
  const returnOrderId = params.get('order');
  const returnToken = params.get('token');
  const returnPayment = params.get('payment');
  const returnProvider = params.get('provider');
  if (returnOrderId && returnPayment === 'failed') {
    return <GatewayOrderConfirmation orderId={returnOrderId} message={params.get('message') ?? 'Payment could not be started. Contact NexHSE to arrange payment.'} />;
  }
  if (returnOrderId && returnToken && (returnPayment === 'success' || returnPayment === 'cancelled')) {
    return <PaymentReturnStatus orderId={returnOrderId} token={returnToken} payment={returnPayment} provider={returnProvider} />;
  }
  return <ShopCheckoutOrderForm />;
}

function PaymentReturnStatus({ orderId, token, payment, provider }: { orderId: string; token: string; payment: 'success' | 'cancelled'; provider: string | null }) {
  const [status, setStatus] = useState<ShopOrder['paymentStatus'] | 'checking'>('checking');

  useEffect(() => {
    let active = true;
    let timer = 0;
    let attempts = 0;
    const refresh = async () => {
      try {
        const response = await fetch(`/api/payments/order-status?orderId=${encodeURIComponent(orderId)}&token=${encodeURIComponent(token)}`, { credentials: 'same-origin', cache: 'no-store' });
        if (!response.ok) throw new Error('Payment status unavailable');
        const result = await response.json() as { paymentStatus: ShopOrder['paymentStatus'] };
        if (!active) return;
        setStatus(result.paymentStatus);
        if (result.paymentStatus !== 'paid' && result.paymentStatus !== 'failed' && attempts++ < 20) timer = window.setTimeout(refresh, 3000);
      } catch {
        if (active && attempts++ < 20) timer = window.setTimeout(refresh, 3000);
      }
    };
    void refresh();
    return () => { active = false; window.clearTimeout(timer); };
  }, [orderId, token]);

  const message = status === 'paid'
    ? 'Payment confirmed. Your order is now being prepared.'
    : status === 'failed'
      ? 'Payment was not completed. Contact NexHSE with your order number to arrange another payment.'
      : payment === 'cancelled'
        ? 'Checkout was cancelled. Your order remains unpaid.'
        : provider === 'mpesa'
          ? 'A payment prompt has been sent to your phone. Approve it to complete the order.'
          : 'Waiting for the payment provider to confirm your transaction.';

  return <Shell><Seo page="home" title={`Payment status | ${orderId}`} description="NexHSE Africa payment status." /><main className="mx-auto max-w-3xl px-5 py-20 lg:px-8"><Breadcrumbs items={[[ 'Shop', shopHomeHref() ], [ 'Payment status', checkoutHref() ]]} /><section className="border-t border-[hsl(var(--border))] pt-8"><p className="mono-label text-[10px] text-[hsl(var(--accent))]">Order {orderId}</p><h1 className="display mt-3 text-4xl text-[hsl(var(--primary))]">{status === 'paid' ? 'Payment received.' : status === 'failed' ? 'Payment not completed.' : 'Checking payment.'}</h1><p className="mt-4 text-sm leading-7 text-[hsl(var(--muted-foreground))]">{message}</p><p className="mt-5 text-sm font-semibold text-[hsl(var(--primary))]">Payment status: {status === 'checking' ? 'awaiting confirmation' : status}</p><Link href={shopHomeHref()} className="focus-ring mt-8 inline-flex min-h-11 items-center gap-2 rounded-full bg-[hsl(var(--primary))] px-5 text-xs font-bold text-white">Continue shopping <ArrowUpRight size={15} /></Link></section></main></Shell>;
}

function GatewayOrderConfirmation({ orderId, message }: { orderId: string; message: string }) {
  return <Shell><Seo page="home" title={`Order ${orderId} | NexHSE Africa`} description="NexHSE Africa order confirmation." /><main className="mx-auto max-w-3xl px-5 py-20 lg:px-8"><Breadcrumbs items={[[ 'Shop', shopHomeHref() ], [ 'Order confirmation', checkoutHref() ]]} /><section className="border-t border-[hsl(var(--border))] pt-8"><p className="mono-label text-[10px] text-[hsl(var(--accent))]">Order {orderId}</p><h1 className="display mt-3 text-4xl text-[hsl(var(--primary))]">Order received.</h1><p className="mt-4 text-sm leading-7 text-[hsl(var(--muted-foreground))]">{message}</p><p className="mt-5 text-sm font-semibold text-[hsl(var(--primary))]">Payment status: awaiting confirmation</p><Link href={shopHomeHref()} className="focus-ring mt-8 inline-flex min-h-11 items-center gap-2 rounded-full bg-[hsl(var(--primary))] px-5 text-xs font-bold text-white">Continue shopping <ArrowUpRight size={15} /></Link></section></main></Shell>;
}

function ShopCheckoutOrderForm() {
  const { cart, clearCart } = useShopCart();
  const { products } = useShopProducts();
  const { createOrder } = useShopOrders();
  const [step, setStep] = useState(1);
  const [complete, setComplete] = useState<ShopOrder | null>(null);
  const [gatewayStatus, setGatewayStatus] = useState<PaymentGatewayStatus>({ stripeEnabled: false, stripeReady: false, mpesaEnabled: false, mpesaReady: false, requiresConfiguration: true, mode: 'unconfigured' });
  const [gatewayMessage, setGatewayMessage] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState<DeliveryDetails>({ name: '', email: '', phone: '', address: '', county: 'Nairobi', notes: '' });
  const [paymentMethod, setPaymentMethod] = useState<ShopOrder['paymentMethod']>('M-Pesa');
  const items = products.filter(product => cart[product.name]).map(product => ({ name: product.name, quantity: cart[product.name], price: product.price, image: product.image }));
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = form.county.toLowerCase().includes('nairobi') ? 300 : 600;
  const total = subtotal + deliveryFee;
  const update = (field: keyof DeliveryDetails, value: string) => setForm(current => ({ ...current, [field]: value }));
  const canContinue = step === 1
    ? !!form.name && !!form.email && !!form.phone && !!form.address && !!form.county
    : step === 2
      ? (paymentMethod !== 'Card' || gatewayStatus.stripeReady) && (paymentMethod !== 'M-Pesa' || gatewayStatus.mpesaReady)
      : true;

  useEffect(() => {
    void getPaymentGatewayStatus().then(status => {
      setGatewayStatus(status);
      setPaymentMethod(status.mpesaReady ? 'M-Pesa' : status.stripeReady ? 'Card' : 'Bank transfer');
    }).catch(() => setPaymentMethod('Bank transfer'));
  }, []);

  const submitOrder = async () => {
    setGatewayMessage('');
    setSubmitError('');
    setIsSubmitting(true);
    try {
      const order = await createOrder({ items, subtotal, deliveryFee, total, delivery: form, paymentMethod, paymentStatus: paymentMethod === 'Pay on delivery' ? 'pending' : 'awaiting confirmation', orderStatus: 'received' });

      if (paymentMethod === 'Card' || paymentMethod === 'M-Pesa') {
        const gatewayResult = await startGatewayCheckout(paymentMethod, order.id, order.paymentStatusToken);
        if (!gatewayResult.ok) {
          clearCart();
          const returnUrl = new URL(window.location.href);
          returnUrl.searchParams.set('payment', 'failed');
          returnUrl.searchParams.set('order', order.id);
          returnUrl.searchParams.set('message', gatewayResult.message);
          window.location.assign(returnUrl.toString());
          return;
        }
        if (paymentMethod === 'Card' && gatewayResult.redirectUrl) {
          clearCart();
          window.location.assign(gatewayResult.redirectUrl);
          return;
        }
        if (paymentMethod === 'M-Pesa' && order.paymentStatusToken) {
          clearCart();
          const returnUrl = new URL(window.location.href);
          returnUrl.searchParams.set('payment', 'success');
          returnUrl.searchParams.set('provider', 'mpesa');
          returnUrl.searchParams.set('order', order.id);
          returnUrl.searchParams.set('token', order.paymentStatusToken);
          window.location.assign(returnUrl.toString());
          return;
        }
        setGatewayMessage(gatewayResult.message);
      }

      clearCart();
      setComplete(order);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'We could not save your order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitError) return <Shell><Seo page="home" title="Order not placed | NexHSE Africa" description="Your order was not saved." /><main className="mx-auto max-w-3xl px-5 py-20 lg:px-8"><Breadcrumbs items={[[ 'Shop', shopHomeHref() ], [ 'Checkout', checkoutHref() ]]} /><section role="alert" className="border-t border-[hsl(var(--border))] pt-8"><p className="mono-label text-[10px] text-[hsl(var(--accent))]">Order not placed</p><h1 className="display mt-3 text-4xl text-[hsl(var(--primary))]">Your cart is still here.</h1><p className="mt-4 text-sm leading-7 text-[hsl(var(--muted-foreground))]">{submitError}</p><Link href={checkoutHref()} className="focus-ring mt-8 inline-flex min-h-11 items-center gap-2 rounded-full bg-[hsl(var(--primary))] px-5 text-xs font-bold text-white">Return to checkout <ArrowUpRight size={15} /></Link></section></main></Shell>;
  if (complete && gatewayMessage) return <GatewayOrderConfirmation orderId={complete.id} message={gatewayMessage} />;
  if (complete) return <Shell><Seo page="home" title={`Order ${complete.id} | NexHSE Africa`} description="NexHSE Africa order confirmation." /><main className="mx-auto max-w-4xl px-5 py-20 lg:px-8"><Breadcrumbs items={[['Shop', '/shop'], ['Order confirmation', '/shop/checkout']]} /><div className="rounded-2xl bg-[hsl(var(--secondary))] p-8 sm:p-12"><span className="grid h-14 w-14 place-items-center rounded-full bg-[hsl(var(--accent))] text-white"><Check /></span><p className="mono-label mt-7 text-[10px] text-[hsl(var(--accent))]">Order received</p><h1 className="display mt-3 text-5xl text-[hsl(var(--primary))]">Thank you, {complete.delivery.name}.</h1><p className="mt-5 text-sm leading-7 text-[hsl(var(--muted-foreground))]">Order <strong>{complete.id}</strong> is recorded. Payment is currently <strong>{complete.paymentStatus}</strong>; the NexHSE team will confirm the next step using {complete.delivery.phone}.</p><div className="mt-8 grid gap-3 sm:grid-cols-3">{[['01', 'Received'], ['02', complete.paymentStatus === 'pending' ? 'Payment on delivery' : 'Payment confirmation'], ['03', 'Dispatch coordination']].map(([number, label]) => <div key={number} className="rounded-xl bg-white p-4"><p className="mono-label text-[9px] text-[hsl(var(--accent))]">{number}</p><p className="mt-2 text-sm font-bold text-[hsl(var(--primary))]">{label}</p></div>)}</div><Link href={shopHomeHref()} className="focus-ring mt-8 inline-flex min-h-11 items-center gap-2 rounded-full bg-[hsl(var(--primary))] px-5 text-xs font-bold text-white">Continue shopping <ArrowUpRight size={15} /></Link></div></main></Shell>;
  if (!items.length) return <Shell><main className="mx-auto max-w-3xl px-5 py-24 text-center"><p className="mono-label text-[10px] text-[hsl(var(--accent))]">Cart is empty</p><h1 className="display mt-4 text-5xl text-[hsl(var(--primary))]">Choose something for your team.</h1><Link href={shopHomeHref()} className="focus-ring mt-8 inline-flex min-h-11 items-center gap-2 rounded-full bg-[hsl(var(--primary))] px-5 text-xs font-bold text-white">Browse shop <ArrowUpRight size={15} /></Link></main></Shell>;

  return <Shell><Seo page="home" title="Checkout | NexHSE Africa" description="Securely prepare your NexHSE Africa PPE and fire equipment order." /><main className="mx-auto max-w-7xl px-5 py-14 lg:px-8"><Breadcrumbs items={[['Shop', '/shop'], ['Checkout', '/shop/checkout']]} /><div className="grid gap-10 lg:grid-cols-[1.1fr_.9fr]"><section><p className="mono-label text-[10px] text-[hsl(var(--accent))]">Checkout / Step {step} of 3</p><div className="mt-5 flex gap-2">{['Delivery', 'Payment', 'Review'].map((label, index) => <div key={label} className="flex-1"><div className={`h-1 rounded-full ${index + 1 <= step ? 'bg-[hsl(var(--accent))]' : 'bg-[hsl(var(--border))]'}`} /><span className="mt-2 block text-[10px] font-bold text-[hsl(var(--muted-foreground))]">{index + 1}. {label}</span></div>)}</div><div className="mt-10 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 sm:p-8">{step === 1 && <div><h1 className="display text-4xl text-[hsl(var(--primary))]">Where should we deliver?</h1><div className="mt-7 grid gap-4 sm:grid-cols-2">{[['name', 'Full name'], ['email', 'Email address'], ['phone', 'Phone number'], ['county', 'County'], ['address', 'Delivery address'], ['notes', 'Delivery notes']].map(([field, label]) => <label key={field} className={`block text-sm font-semibold text-[hsl(var(--primary))] ${field === 'address' || field === 'notes' ? 'sm:col-span-2' : ''}`}>{label}{field === 'notes' ? <textarea value={form[field as keyof DeliveryDetails]} onChange={event => update(field as keyof DeliveryDetails, event.target.value)} className="focus-ring mt-2 min-h-20 w-full rounded-xl border border-[hsl(var(--input))] bg-transparent p-3 text-sm outline-none" data-testid={`input-checkout-${field}`} /> : <input value={form[field as keyof DeliveryDetails]} onChange={event => update(field as keyof DeliveryDetails, event.target.value)} type={field === 'email' ? 'email' : 'text'} className="focus-ring mt-2 min-h-11 w-full rounded-xl border border-[hsl(var(--input))] bg-transparent px-3 text-sm outline-none" data-testid={`input-checkout-${field}`} />}</label>)}</div></div>}{step === 2 && <div><h1 className="display text-4xl text-[hsl(var(--primary))]">Choose a payment rail.</h1><p className="mt-3 text-sm leading-6 text-[hsl(var(--muted-foreground))]">Payment infrastructure is prepared around a provider-ready status flow. Select how you want the NexHSE team to confirm settlement.</p><div className="mt-7 space-y-3">{[['M-Pesa', 'Mobile money confirmation will be attached to the order.'], ['Card', 'Card gateway placeholder ready for provider credentials.'], ['Bank transfer', 'Invoice and bank instructions will be issued by the team.'], ['Pay on delivery', 'Payment is collected according to the confirmed delivery arrangement.']].map(([method, text]) => <button key={method} type="button" onClick={() => setPaymentMethod(method as ShopOrder['paymentMethod'])} className={`focus-ring flex w-full items-start gap-4 rounded-xl border p-4 text-left ${paymentMethod === method ? 'border-[hsl(var(--accent))] bg-[hsl(var(--secondary))]' : 'border-[hsl(var(--border))]'}`}><span className="mt-1 grid h-5 w-5 place-items-center rounded-full border border-[hsl(var(--accent))]">{paymentMethod === method && <span className="h-2.5 w-2.5 rounded-full bg-[hsl(var(--accent))]" />}</span><span><strong className="block text-sm text-[hsl(var(--primary))]">{method}</strong><span className="mt-1 block text-xs leading-5 text-[hsl(var(--muted-foreground))]">{text}</span></span></button>)}</div></div>}{step === 3 && <div><h1 className="display text-4xl text-[hsl(var(--primary))]">Review your order.</h1><div className="mt-7 space-y-3">{items.map(item => <div key={item.name} className="flex items-center justify-between gap-4 border-b border-[hsl(var(--border))] pb-3 text-sm"><span className="font-semibold text-[hsl(var(--primary))]">{item.name} x{item.quantity}</span><span className="font-bold text-[hsl(var(--primary))]">KSh {(item.price * item.quantity).toLocaleString()}</span></div>)}</div><div className="mt-7 space-y-2 text-sm text-[hsl(var(--muted-foreground))]"><p>Deliver to: <strong className="text-[hsl(var(--primary))]">{form.name}, {form.county}</strong></p><p>Payment: <strong className="text-[hsl(var(--primary))]">{paymentMethod}</strong></p><p>Payment status: <strong className="text-[hsl(var(--primary))]">{paymentMethod === 'Pay on delivery' ? 'pending' : 'awaiting confirmation'}</strong></p></div></div>}<div className="mt-10 flex justify-between gap-3 border-t border-[hsl(var(--border))] pt-6"><button type="button" onClick={() => setStep(value => Math.max(1, value - 1))} className={`focus-ring min-h-11 rounded-full border border-[hsl(var(--border))] px-5 text-xs font-bold text-[hsl(var(--primary))] ${step === 1 ? 'invisible' : ''}`}>Back</button>{step < 3 ? <button type="button" onClick={() => setStep(value => value + 1)} disabled={!canContinue} className="focus-ring min-h-11 rounded-full bg-[hsl(var(--primary))] px-6 text-xs font-bold text-white disabled:opacity-40">Continue <ChevronRight size={14} className="ml-1 inline" /></button> : <button type="button" onClick={submitOrder} className="focus-ring min-h-11 rounded-full bg-[hsl(var(--accent))] px-6 text-xs font-bold text-white">Place order <ArrowUpRight size={15} className="ml-1 inline" /></button>}</div></div></section><aside className="h-fit rounded-2xl bg-[hsl(var(--primary))] p-6 text-white lg:sticky lg:top-24"><p className="mono-label text-[10px] text-[hsl(var(--secondary))]">Order summary</p><div className="mt-6 space-y-3">{items.map(item => <div key={item.name} className="flex justify-between gap-3 text-sm text-white/75"><span>{item.name} x{item.quantity}</span><span>KSh {(item.price * item.quantity).toLocaleString()}</span></div>)}</div><div className="mt-6 space-y-2 border-t border-white/15 pt-4 text-sm"><p className="flex justify-between text-white/70"><span>Subtotal</span><span>KSh {subtotal.toLocaleString()}</span></p><p className="flex justify-between text-white/70"><span>Delivery</span><span>KSh {deliveryFee.toLocaleString()}</span></p><p className="flex justify-between pt-2 text-lg font-bold"><span>Total</span><span>KSh {total.toLocaleString()}</span></p></div><p className="mt-6 text-xs leading-5 text-white/55">Your order and payment state will appear in the private admin order queue after submission.</p></aside></div></main></Shell>;
}

function ProductDetail() {
  const { slug = '' } = useParams<{ slug: string }>();
  const { products } = useShopProducts();
  const product = products.find(item => productSlug(item) === slug);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useShopCart();

  useProductSeo(product);

  if (!product) return <NotFound />;

  return <Shell><Seo page="home" title={`${product.name} | NexHSE Africa Shop`} description={product.description} /><main><section className="bg-[hsl(var(--primary))] text-white"><div className="mx-auto max-w-7xl px-5 pb-14 pt-12 lg:px-8 lg:pb-20 lg:pt-16"><Breadcrumbs items={[['Shop', '/shop'], [product.name, `/shop/${productSlug(product)}`]]} /><div className="mt-10 grid items-center gap-10 lg:grid-cols-[.9fr_1.1fr]"><div><p className="mono-label text-[10px] text-[hsl(var(--secondary))]">{product.category}</p><h1 className="display mt-5 max-w-3xl text-5xl leading-[1.02] sm:text-7xl">{product.name}</h1><p className="mt-6 max-w-xl text-base leading-7 text-white/70">{product.description}</p><p className="mt-5 text-sm font-bold text-[hsl(var(--secondary))]">{product.stock} available</p></div><div className="overflow-hidden rounded-[42%_58%_52%_48%/48%_42%_58%_52%] border border-[hsl(var(--secondary)/.45)] bg-[hsl(var(--secondary)/.15)] p-2"><img src={product.image} alt={product.name} className="aspect-[4/3] w-full object-cover" /></div></div></div></section><section className="mx-auto max-w-7xl px-5 py-16 lg:px-8"><div className="grid gap-10 lg:grid-cols-[1.1fr_.9fr]"><div><p className="mono-label text-[10px] text-[hsl(var(--accent))]">Product details</p><h2 className="display mt-3 text-4xl text-[hsl(var(--primary))]">Prepare your order.</h2><p className="mt-5 max-w-xl text-sm leading-7 text-[hsl(var(--muted-foreground))]">Choose the quantity your team needs, then add it to your basket. Your basket stays available as you move between the catalogue and product pages.</p></div><div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6"><p className="text-3xl font-bold text-[hsl(var(--primary))]">KSh {(product.price * quantity).toLocaleString()}</p><p className="mt-2 text-xs text-[hsl(var(--muted-foreground))]">KSh {product.price.toLocaleString()} each</p><div className="mt-7 flex items-center gap-3"><button type="button" onClick={() => setQuantity(value => Math.max(1, value - 1))} className="focus-ring grid h-11 w-11 place-items-center rounded-full border border-[hsl(var(--border))] text-lg font-bold text-[hsl(var(--primary))]" aria-label="Decrease quantity" data-testid="button-product-decrease">-</button><span className="min-w-8 text-center font-bold text-[hsl(var(--primary))]">{quantity}</span><button type="button" onClick={() => setQuantity(value => Math.min(product.stock, value + 1))} className="focus-ring grid h-11 w-11 place-items-center rounded-full border border-[hsl(var(--border))] text-lg font-bold text-[hsl(var(--primary))]" aria-label="Increase quantity" data-testid="button-product-increase">+</button><button type="button" onClick={() => addToCart(product.name, quantity)} className="focus-ring ml-auto inline-flex min-h-11 items-center gap-2 rounded-full bg-[hsl(var(--primary))] px-5 text-xs font-bold text-white" data-testid="button-product-add-to-cart">Add to cart <ArrowUpRight size={15} /></button></div><Link href={shopHomeHref()} className="focus-ring mt-5 inline-flex text-xs font-bold text-[hsl(var(--primary))]">Back to shop <ArrowUpRight size={14} className="ml-1" /></Link></div></div></section></main></Shell>;
}

function AdminProductEditorPage({ products, updateProduct }: { products: ShopProduct[]; updateProduct: (name: string, changes: Partial<ShopProduct>) => void }) {
  const [selectedName, setSelectedName] = useState(products[0]?.name ?? '');
  const product = products.find(item => item.name === selectedName) ?? products[0];
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState<ShopProduct | undefined>(product);

  useEffect(() => { setForm(product); }, [product]);
  if (!form) return null;

  const update = (field: keyof ShopProduct, value: string | number | string[]) => {
    const normalized = typeof value === 'string' && field === 'keywords' ? value.split(',').map(item => item.trim()).filter(Boolean)
      : typeof value === 'string' && ['features', 'useCases'].includes(field) ? value.split('\n').map(item => item.trim()).filter(Boolean)
        : value;
    setForm(current => current ? { ...current, [field]: normalized } : current);
  };
  const save = () => {
    updateProduct(product.name, { ...form, price: Number(form.price), stock: Number(form.stock), keywords: form.keywords, features: form.features, useCases: form.useCases });
    setSaved(true);
  };
  const inputFields: [keyof ShopProduct, string][] = [['name', 'Product name'], ['price', 'Price (KES)'], ['stock', 'Stock quantity'], ['image', 'Image path'], ['imageBackground', 'Image/tile background color'], ['seoTitle', 'SEO title'], ['seoDescription', 'SEO description']];
  return <Shell><Seo page="home" title="Product SEO Manager | NexHSE Africa" description="Private shop product and SEO management workspace." /><main><PageIntro eyebrow="Private admin / shop SEO" title="Edit product data for search and customers." text="Every saved field below feeds the public product page, structured Product data, social metadata and the AI-readable shop catalogue." image={form.image} /><section className="mx-auto max-w-7xl px-5 py-16 lg:px-8"><Breadcrumbs items={[['Admin', '/admin'], ['Products', '/admin/products']]} /><div className="grid gap-10 lg:grid-cols-[.7fr_1.3fr]"><aside><p className="mono-label text-[10px] text-[hsl(var(--accent))]">Catalogue products</p><div className="mt-5 space-y-2">{products.map(item => <button key={item.name} type="button" onClick={() => setSelectedName(item.name)} className={`focus-ring flex min-h-12 w-full items-center gap-3 rounded-xl border px-3 text-left text-xs font-bold ${item.name === product.name ? 'border-[hsl(var(--accent))] bg-[hsl(var(--secondary))] text-[hsl(var(--primary))]' : 'border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))]'}`}><img src={item.image} alt="" className="h-9 w-9 rounded-lg object-cover" />{item.name}</button>)}</div></aside><div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 sm:p-8"><div className="flex items-start justify-between gap-4"><div><p className="mono-label text-[10px] text-[hsl(var(--accent))]">{form.category} / {form.brand}</p><h2 className="display mt-3 text-4xl text-[hsl(var(--primary))]">Product and search fields.</h2></div><Link href={productDetailHref(product)} className="focus-ring text-xs font-bold text-[hsl(var(--primary))]">View public page <ArrowUpRight size={14} className="ml-1 inline" /></Link></div><div className="mt-8 grid gap-5 sm:grid-cols-2">{inputFields.map(([field, label]) => <label key={field} className="block text-sm font-semibold text-[hsl(var(--primary))]">{label}<input value={form[field] as string | number} onChange={event => update(field, field === 'price' || field === 'stock' ? Number(event.target.value) : event.target.value)} className="focus-ring mt-2 min-h-11 w-full rounded-xl border border-[hsl(var(--input))] bg-transparent px-3 text-sm outline-none" data-testid={`input-admin-product-${field}`} /></label>)}</div><div className="mt-5 space-y-5">{[['longDescription', 'Detailed product description'], ['keywords', 'Keywords, comma separated'], ['features', 'Features, comma separated'], ['useCases', 'Use cases, comma separated']].map(([field, label]) => <label key={field} className="block text-sm font-semibold text-[hsl(var(--primary))]">{label}<textarea value={Array.isArray(form[field as keyof ShopProduct]) ? (form[field as keyof ShopProduct] as string[]).join(', ') : form[field as keyof ShopProduct] as string} onChange={event => update(field as keyof ShopProduct, ['keywords', 'features', 'useCases'].includes(field) ? event.target.value.split(',').map(value => value.trim()).filter(Boolean) : event.target.value)} className="focus-ring mt-2 min-h-24 w-full rounded-xl border border-[hsl(var(--input))] bg-transparent p-3 text-sm outline-none" data-testid={`textarea-admin-product-${field}`} /></label>)}</div><div className="mt-7 flex items-center gap-4"><button type="button" onClick={save} className="focus-ring min-h-12 rounded-full bg-[hsl(var(--primary))] px-5 text-sm font-bold text-white" data-testid="button-admin-product-save">Save product data <Check size={15} className="ml-1 inline" /></button>{saved && <span className="text-xs font-bold text-[hsl(var(--accent))]">Saved to the shared catalogue.</span>}</div></div></div></section></main></Shell>;
}

function AdminProductCatalogue() {
  const [category, setCategory] = useState('All');
  const { products: allProducts, updateProduct, createProduct, deleteProduct } = useShopProducts();
  const products = category === 'All' ? allProducts : allProducts.filter(product => product.category === category);

  return <AdminProductCrudPage products={products} updateProduct={updateProduct} createProduct={createProduct} deleteProduct={deleteProduct} />;

  return <Shell><Seo page="home" title="Product Catalogue Admin | NexHSE Africa" description="Private product catalogue management view for the NexHSE Africa shop." /><main><PageIntro eyebrow="Private admin / shop" title="The live product catalogue." text="This view reads the same product records used by the public shop, keeping names, prices, images, categories and stock visibility aligned." image="/assets/shop/helmet.jpg" /><section className="mx-auto max-w-7xl px-5 py-16 lg:px-8"><Breadcrumbs items={[['Admin', '/admin'], ['Products', '/admin/products']]} /><div className="mb-8 flex flex-wrap gap-2">{['All', 'PPE', 'Fire Equipment'].map(option => <button key={option} type="button" onClick={() => setCategory(option)} className={`focus-ring min-h-11 rounded-full border px-4 text-xs font-bold ${category === option ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))] text-white' : 'border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))]'}`} data-testid={`button-admin-product-filter-${option.toLowerCase().replaceAll(' ', '-')}`}>{option}</button>)}</div><div className="overflow-x-auto rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]"><table className="w-full min-w-[720px] text-left text-sm"><thead className="bg-[hsl(var(--secondary))] text-[hsl(var(--primary))]"><tr><th className="p-4 font-bold">Product</th><th className="p-4 font-bold">Category</th><th className="p-4 font-bold">Price</th><th className="p-4 font-bold">Stock</th><th className="p-4 font-bold">Public page</th></tr></thead><tbody>{products.map(product => <tr key={product.name} className="border-t border-[hsl(var(--border))]"><td className="flex items-center gap-3 p-4 font-semibold text-[hsl(var(--primary))]"><img src={product.image} alt="" className="h-12 w-12 rounded-lg object-cover" />{product.name}</td><td className="p-4 text-[hsl(var(--muted-foreground))]">{product.category}</td><td className="p-4 font-semibold text-[hsl(var(--primary))]">KSh {product.price.toLocaleString()}</td><td className="p-4 text-[hsl(var(--muted-foreground))]">{product.stock}</td><td className="p-4"><Link href={productDetailHref(product)} className="focus-ring text-xs font-bold text-[hsl(var(--primary))]">View product <ArrowUpRight size={14} className="ml-1 inline" /></Link></td></tr>)}</tbody></table></div></section></main></Shell>;
}

function AdminImageField({ label, value, scope, onChange, allowVideo = false }: { label: string; value: string; scope: 'products' | 'services'; onChange: (value: string) => void; allowVideo?: boolean }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const video = /\.mp4(?:$|[?#])/i.test(value);
  const uploadImage = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = '';
    if (!file) return;
    const acceptedType = file.type.startsWith('image/') || (allowVideo && file.type === 'video/mp4');
    if (!acceptedType) {
      setError(allowVideo ? 'Choose an image or MP4 video.' : 'Choose a supported image file.');
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setError('Files must be 20 MB or smaller.');
      return;
    }
    setUploading(true);
    setError('');
    try {
      const { upload: uploadBlob } = await import('@vercel/blob/client');
      const safeName = file.name.normalize('NFKD').replace(/[^a-zA-Z0-9._-]/g, '-').slice(-100);
      const blob = await uploadBlob(`nexhse/catalog/${scope}/${Date.now()}-${safeName}`, file, {
        access: 'public',
        handleUploadUrl: '/api/admin-upload',
        clientPayload: scope,
        multipart: file.size > 5 * 1024 * 1024,
      });
      onChange(blob.url);
    } catch (issue) {
      setError(issue instanceof Error ? issue.message : 'Unable to upload this file.');
    } finally {
      setUploading(false);
    }
  };
  return <div className="block text-sm font-semibold text-[hsl(var(--primary))]">
    <label className="block" htmlFor={`image-path-${scope}-${label.toLowerCase().replaceAll(' ', '-')}`}>{label}<input id={`image-path-${scope}-${label.toLowerCase().replaceAll(' ', '-')}`} value={value} onChange={event => onChange(event.target.value)} className="focus-ring mt-2 min-h-11 w-full rounded-lg border border-[hsl(var(--input))] bg-transparent px-3 text-sm font-normal" placeholder="/assets/... or https://..." /></label>
    <div className="mt-3 flex flex-wrap items-center gap-3">
      <label className={`focus-ring inline-flex min-h-10 cursor-pointer items-center rounded-lg border border-[hsl(var(--border))] px-3 text-xs font-bold ${uploading ? 'pointer-events-none opacity-50' : ''}`}>
        {uploading ? 'Uploading to Blob…' : 'Upload to Blob'}
        <input type="file" accept={allowVideo ? 'image/avif,image/gif,image/jpeg,image/png,image/webp,video/mp4' : 'image/avif,image/gif,image/jpeg,image/png,image/webp'} onChange={event => void uploadImage(event)} disabled={uploading} className="sr-only" />
      </label>
      {value && (video
        ? <video src={value} muted playsInline preload="metadata" className="h-14 w-20 rounded-md border border-[hsl(var(--border))] object-cover" />
        : <img src={value} alt={`${label} preview`} loading="lazy" decoding="async" className="h-14 w-20 rounded-md border border-[hsl(var(--border))] object-cover" />)}
    </div>
    <p className="mt-2 text-xs font-normal text-[hsl(var(--muted-foreground))]">Uploaded media is stored in Blob and its URL is shared by the admin, shop and public service pages.</p>
    {error && <p role="alert" className="mt-2 text-xs font-semibold text-[hsl(var(--destructive))]">{error}</p>}
  </div>;
}

function AdminProductCrudPage({
  products,
  updateProduct,
  createProduct,
  deleteProduct,
}: {
  products: ShopProduct[];
  updateProduct: (name: string, changes: Partial<ShopProduct>) => Promise<void>;
  createProduct: (product: ShopProduct) => Promise<void>;
  deleteProduct: (product: ShopProduct) => Promise<void>;
}) {
  const [selectedName, setSelectedName] = useState(products[0]?.name ?? "");
  const [form, setForm] = useState<ShopProduct | null>(products[0] ?? null);
  const [isNew, setIsNew] = useState(false);
  const [notice, setNotice] = useState("");
  useEffect(() => {
    if (!isNew)
      setForm(
        products.find((item) => item.name === selectedName) ??
          products[0] ??
          null,
      );
  }, [products, selectedName, isNew]);
  const update = (
    field: keyof ShopProduct,
    value: string | number | string[],
  ) => {
    const normalized =
      typeof value === "string" && field === "keywords"
        ? value
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean)
        : typeof value === "string" && ["features", "useCases"].includes(field)
          ? value
              .split("\n")
              .map((item) => item.trim())
              .filter(Boolean)
          : value;
    setForm((current) =>
      current ? { ...current, [field]: normalized } : current,
    );
  };
  const add = () => {
    setIsNew(true);
    setForm({
      name: "",
      sku: "",
      category: "PPE",
      price: 0,
      stock: 0,
      image: "",
      imageBackground: "#ffffff",
      description: "",
      longDescription: "",
      seoTitle: "",
      seoDescription: "",
      keywords: [],
      features: [],
      useCases: [],
      brand: "NexHSE Africa",
      condition: "New",
      active: true,
    });
    setNotice("");
  };
  const save = async () => {
    if (!form) return;
    const clean = {
      ...form,
      price: Number(form.price),
      stock: Number(form.stock),
    };
    setNotice("Saving product…");
    try {
      if (isNew) await createProduct(clean);
      else await updateProduct(selectedName, clean);
      setSelectedName(clean.name);
      setIsNew(false);
      setNotice("Product saved to the live shop catalogue.");
    } catch (issue) {
      setNotice(
        issue instanceof Error ? issue.message : "Unable to save product",
      );
    }
  };
  const remove = async () => {
    if (!form) return;
    setNotice("Removing product…");
    try {
      await deleteProduct(form);
      const nextProduct = products.find((product) => product.name !== form.name);
      if (nextProduct) {
        setIsNew(false);
        setSelectedName(nextProduct.name);
        setForm(nextProduct);
      } else {
        setIsNew(true);
        setForm({
          name: "",
          sku: "",
          category: "PPE",
          price: 0,
          stock: 0,
          image: "",
          imageBackground: "#ffffff",
          description: "",
          longDescription: "",
          seoTitle: "",
          seoDescription: "",
          keywords: [],
          features: [],
          useCases: [],
          brand: "NexHSE Africa",
          condition: "New",
          active: true,
        });
      }
      setNotice("Product removed from the live shop catalogue.");
    } catch (issue) {
      setNotice(issue instanceof Error ? issue.message : "Unable to remove product");
    }
  };
  const fields: [keyof ShopProduct, string][] = [
    ["name", "Product name"],
    ["sku", "SKU"],
    ["category", "Category"],
    ["price", "Price (KES)"],
    ["stock", "Stock quantity"],
    ["image", "Image URL"],
    ["imageBackground", "Tile background"],
    ["brand", "Brand"],
    ["condition", "Condition"],
    ["seoTitle", "SEO title"],
    ["seoDescription", "SEO description"],
  ];
  if (!form) return null;
  return (
    <Shell>
      <Seo
        page="home"
        title="Product catalogue | NexHSE Africa"
        description="Manage products, stock, merchandising and search metadata."
      />
      <main>
        <PageIntro
          eyebrow="Private admin / shop"
          title="Maintain the live product catalogue."
          text="Manage product records, availability, merchandising copy and search metadata used by the public shop."
          image={form.image || "/assets/shop/helmet.jpg"}
        />
        <section className="mx-auto max-w-7xl px-5 py-14 lg:px-8">
          <Breadcrumbs
            items={[
              ["Admin", "/admin"],
              ["Products", "/admin/products"],
            ]}
          />
          <div className="grid gap-8 lg:grid-cols-[.65fr_1.35fr]">
            <aside>
              <button
                type="button"
                onClick={add}
                className="focus-ring min-h-11 rounded-lg bg-[hsl(var(--primary))] px-4 text-sm font-bold text-white"
              >
                Add product
              </button>
              <div className="mt-5 divide-y divide-[hsl(var(--border))]">
                {products.map((product) => (
                  <button
                    key={product.id ?? product.name}
                    type="button"
                    onClick={() => {
                      setIsNew(false);
                      setSelectedName(product.name);
                      setNotice("");
                    }}
                    className={`focus-ring block w-full py-3 text-left ${selectedName === product.name && !isNew ? "font-bold text-[hsl(var(--primary))]" : "text-[hsl(var(--muted-foreground))]"}`}
                  >
                    <span className="block text-sm">{product.name}</span>
                    <span className="mt-1 block text-xs">
                      {product.category} · KSh {product.price.toLocaleString()}{" "}
                      · {product.stock} in stock
                    </span>
                  </button>
                ))}
              </div>
            </aside>
            <section className="border-t border-[hsl(var(--border))] pt-5">
              <div className="grid gap-4 sm:grid-cols-2">
                {fields.map(([field, label]) => field === "image" ? (
                  <AdminImageField key={field} label={label} value={form.image} scope="products" onChange={value => update(field, value)} />
                ) : (
                  <label
                    key={field}
                    className="block text-sm font-semibold text-[hsl(var(--primary))]"
                  >
                    {label}
                    <input
                      type={
                        field === "price" || field === "stock"
                          ? "number"
                          : "text"
                      }
                      min={
                        field === "price" || field === "stock" ? 0 : undefined
                      }
                      value={String(form[field] ?? "")}
                      onChange={(event) =>
                        update(
                          field,
                          field === "price" || field === "stock"
                            ? Number(event.target.value)
                            : event.target.value,
                        )
                      }
                      className="focus-ring mt-2 min-h-11 w-full rounded-lg border border-[hsl(var(--input))] bg-transparent px-3 text-sm"
                    />
                  </label>
                ))}
                {[
                  ["description", "Short description"],
                  ["longDescription", "Product details"],
                  ["keywords", "Search keywords (comma separated)"],
                  ["features", "Features (one per line)"],
                  ["useCases", "Use cases (one per line)"],
                ].map(([field, label]) => (
                  <label
                    key={field}
                    className="block text-sm font-semibold text-[hsl(var(--primary))] sm:col-span-2"
                  >
                    {label}
                    <textarea
                      value={
                        Array.isArray(form[field as keyof ShopProduct])
                          ? (form[field as keyof ShopProduct] as string[]).join(
                              field === "keywords" ? ", " : "\n",
                            )
                          : String(form[field as keyof ShopProduct] ?? "")
                      }
                      onChange={(event) =>
                        update(field as keyof ShopProduct, event.target.value)
                      }
                      className="focus-ring mt-2 min-h-20 w-full rounded-lg border border-[hsl(var(--input))] bg-transparent p-3 text-sm"
                    />
                  </label>
                ))}
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={save}
                  disabled={!form.name.trim() || !form.category.trim()}
                  className="focus-ring min-h-11 rounded-lg bg-[hsl(var(--primary))] px-4 text-sm font-bold text-white disabled:opacity-40"
                >
                  Save product
                </button>
                {!isNew && (
                  <button
                    type="button"
                    onClick={() => void remove()}
                    className="focus-ring min-h-11 rounded-lg border border-[hsl(var(--border))] px-4 text-sm font-bold"
                  >
                    Delete product
                  </button>
                )}
              </div>
              {notice && (
                <p
                  role="status"
                  className="mt-4 text-sm font-semibold text-[hsl(var(--accent))]"
                >
                  {notice}
                </p>
              )}
            </section>
          </div>
        </section>
      </main>
    </Shell>
  );
}

function LegacyAdminDashboard() {
  const metrics = [
    { label: 'Customers', value: '248', change: '+12%', detail: 'new this month' },
    { label: 'Open orders', value: '34', change: '+6%', detail: 'awaiting dispatch' },
    { label: 'Stock health', value: '86%', change: '+9%', detail: 'items in good range' },
    { label: 'Quotes issued', value: '19', change: '+4%', detail: 'last 30 days' },
  ];

  const maintenance = [
    { name: 'Blog posting', owner: 'Marketing', status: 'Ready' },
    { name: 'Content updates', owner: 'Operations', status: 'Reviewing' },
    { name: 'Stock review', owner: 'Procurement', status: 'Live' },
    { name: 'Customer follow-up', owner: 'Sales', status: 'Pending' },
  ];

  const orders = [
    { id: '#ORD-1048', item: 'Industrial Safety Helmet', status: 'Packed', total: 'KSh 1,450' },
    { id: '#ORD-1049', item: '9kg Fire Extinguisher', status: 'Awaiting stock', total: 'KSh 8,900' },
    { id: '#ORD-1050', item: 'Protective Work Gloves', status: 'Ready to ship', total: 'KSh 750' },
  ];

  return <Shell><Seo page="home" title="Operations Dashboard | NexHSE Africa" description="Private operational dashboard for storefront management, content updates, inventory oversight and operational analytics." /><main><PageIntro eyebrow="Private admin" title="NexHSE operations control centre." text="This private dashboard supports the shop, content workflow, stock visibility and operational reporting for the NexHSE Africa business." image={fireImage} /><section className="mx-auto max-w-7xl px-5 py-20 lg:px-8"><Breadcrumbs items={[['Shop', '/shop'], ['Admin', '/admin']]} /><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{metrics.map(metric => <div key={metric.label} className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5"><p className="mono-label text-[10px] text-[hsl(var(--accent))]">{metric.label}</p><div className="mt-6 flex items-end justify-between"><span className="display text-4xl text-[hsl(var(--primary))]">{metric.value}</span><span className="rounded-full bg-[hsl(var(--secondary))] px-2 py-1 text-[10px] font-bold text-[hsl(var(--primary))]">{metric.change}</span></div><p className="mt-3 text-xs text-[hsl(var(--muted-foreground))]">{metric.detail}</p></div>)}</div><div className="mt-14 grid gap-6 xl:grid-cols-[1.1fr_.9fr]"><div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6"><div className="flex items-center justify-between"><div><p className="mono-label text-[10px] text-[hsl(var(--accent))]">Operational tasks</p><h3 className="mt-2 text-2xl font-bold text-[hsl(var(--primary))]">Site management queue</h3></div><button className="focus-ring min-h-10 rounded-full border border-[hsl(var(--border))] px-3 text-[10px] font-bold text-[hsl(var(--primary))]">Export tasks</button></div><div className="mt-6 space-y-4">{maintenance.map(item => <div key={item.name} className="flex items-center justify-between rounded-xl border border-[hsl(var(--border))] p-4"><div><p className="font-bold text-[hsl(var(--primary))]">{item.name}</p><p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">Owner: {item.owner}</p></div><span className="rounded-full bg-[hsl(var(--secondary))] px-2 py-1 text-[9px] font-bold text-[hsl(var(--primary))]">{item.status}</span></div>)}</div></div><div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--primary))] p-6 text-white"><p className="mono-label text-[10px] text-[hsl(var(--secondary))]">Operations summary</p><h3 className="mt-2 text-2xl font-bold">Procurement funnel</h3><div className="mt-6 space-y-4">{[['Leads', '48'], ['Quoted', '19'], ['Orders', '34'], ['Ready to ship', '12']].map(([label, value]) => <div key={label} className="flex items-center justify-between border-b border-white/10 pb-3"><span className="text-sm text-white/70">{label}</span><span className="text-lg font-bold">{value}</span></div>)}</div></div></div><div className="mt-14 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6"><div className="flex items-center justify-between"><div><p className="mono-label text-[10px] text-[hsl(var(--accent))]">Storefront</p><h3 className="mt-2 text-2xl font-bold text-[hsl(var(--primary))]">Recent orders</h3></div><Link href={shopHomeHref()} className="focus-ring text-xs font-bold text-[hsl(var(--primary))]">View shop</Link></div><div className="mt-6 overflow-hidden rounded-xl border border-[hsl(var(--border))]"><table className="w-full text-left text-sm"><thead className="bg-[hsl(var(--secondary))] text-[hsl(var(--primary))]"><tr><th className="p-3 font-bold">Order</th><th className="p-3 font-bold">Item</th><th className="p-3 font-bold">Status</th><th className="p-3 font-bold">Total</th></tr></thead><tbody>{orders.map(order => <tr key={order.id} className="border-t border-[hsl(var(--border))]"><td className="p-3 text-[hsl(var(--primary))] font-semibold">{order.id}</td><td className="p-3 text-[hsl(var(--muted-foreground))]">{order.item}</td><td className="p-3"><span className="rounded-full bg-[hsl(var(--secondary))] px-2 py-1 text-[9px] font-bold text-[hsl(var(--primary))]">{order.status}</span></td><td className="p-3 text-[hsl(var(--primary))] font-semibold">{order.total}</td></tr>)}</tbody></table></div></div></section></main></Shell>;
}

function AdminDashboard() {
  const { products } = useShopProducts();
  const { posts } = useBlogPosts();
  const { orders } = useShopOrders();
  const stockUnits = products.reduce((sum, product) => sum + product.stock, 0);
  const lowStock = products.filter(product => product.stock <= 8).length;
  const recentPosts = posts.slice(0, 4);
  const [clientCount, setClientCount] = useState(0);
  const [promotionCount, setPromotionCount] = useState(0);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  useEffect(() => {
    let active = true;
    const refresh = () => {
      if (document.visibilityState !== 'visible') return;
      void Promise.all([
        fetch('/api/admin-data?resource=clients', { credentials: 'same-origin', cache: 'no-store' }).then(response => response.ok ? response.json() : null),
        fetch('/api/admin-data?resource=promotions', { credentials: 'same-origin', cache: 'no-store' }).then(response => response.ok ? response.json() : null),
      ]).then(([clients, promotions]) => {
        if (!active) return;
        if (Array.isArray(clients?.items)) setClientCount(clients.items.length);
        if (Array.isArray(promotions?.items)) setPromotionCount(promotions.items.length);
        setLastRefresh(new Date());
      }).catch(() => undefined);
    };
    refresh();
    const timer = window.setInterval(refresh, 60_000);
    window.addEventListener('focus', refresh);
    return () => { active = false; window.clearInterval(timer); window.removeEventListener('focus', refresh); };
  }, []);

  const metrics = [
    { label: 'Catalogue products', value: products.length, detail: 'shared with public shop' },
    { label: 'Available stock', value: stockUnits, detail: `${lowStock} low-stock items` },
    { label: 'Published articles', value: posts.length, detail: 'available on public blog' },
    { label: 'Client accounts', value: clientCount, detail: 'onboarded and order-linked' },
    { label: 'Orders', value: orders.length, detail: 'live Neon order queue' },
    { label: 'Promotions', value: promotionCount, detail: 'configured offers' },
  ];

  return <Shell><Seo page="home" title="Live Operations Dashboard | NexHSE Africa" description="Live NexHSE Africa operations dashboard for products, stock, blog content and storefront activity." /><main><PageIntro eyebrow="Private admin / live data" title="A clearer view of what is moving." text="This dashboard reads the same product, blog and cart state used across the site. Changes made in the admin tools are reflected in the public catalogue immediately." image={fireImage} /><section className="mx-auto max-w-7xl px-5 py-16 lg:px-8"><Breadcrumbs items={[['Admin', '/admin']]} /><div className="mb-8 flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-[hsl(var(--muted-foreground))]">Last checked {lastRefresh.toLocaleTimeString()}</p><div className="flex gap-2"><Link href="/admin/products" className="focus-ring inline-flex min-h-10 items-center gap-2 rounded-full border border-[hsl(var(--border))] px-4 text-xs font-bold text-[hsl(var(--primary))]">Manage products <ArrowUpRight size={14} /></Link><Link href="/admin/blog" className="focus-ring inline-flex min-h-10 items-center gap-2 rounded-full bg-[hsl(var(--primary))] px-4 text-xs font-bold text-white">Publish blog <ArrowUpRight size={14} /></Link></div></div><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{metrics.map(metric => <div key={metric.label} className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5"><p className="mono-label text-[10px] text-[hsl(var(--accent))]">{metric.label}</p><p className="display mt-5 text-4xl text-[hsl(var(--primary))]">{metric.value}</p><p className="mt-2 text-xs text-[hsl(var(--muted-foreground))]">{metric.detail}</p></div>)}</div><div className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_.9fr]"><div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6"><div className="flex items-center justify-between"><div><p className="mono-label text-[10px] text-[hsl(var(--accent))]">Stock watch</p><h2 className="mt-2 text-2xl font-bold text-[hsl(var(--primary))]">Catalogue health</h2></div><Link href="/admin/products" className="focus-ring text-xs font-bold text-[hsl(var(--primary))]">Edit data <ArrowUpRight size={14} className="ml-1 inline" /></Link></div><div className="mt-6 space-y-3">{products.slice(0, 6).map(product => <div key={product.name} className="flex items-center justify-between gap-4 border-b border-[hsl(var(--border))] pb-3"><div className="flex min-w-0 items-center gap-3"><img src={product.image} alt="" className="h-10 w-10 shrink-0 rounded-lg object-cover" /><span className="truncate text-sm font-semibold text-[hsl(var(--primary))]">{product.name}</span></div><span className={`shrink-0 text-xs font-bold ${product.stock <= 8 ? 'text-[hsl(var(--destructive))]' : 'text-[hsl(var(--accent))]'}`}>{product.stock} units</span></div>)}</div></div><div className="rounded-2xl bg-[hsl(var(--primary))] p-6 text-white"><p className="mono-label text-[10px] text-[hsl(var(--secondary))]">Content activity</p><h2 className="mt-2 text-2xl font-bold">Recent blog posts</h2><div className="mt-6 space-y-4">{recentPosts.map(post => <Link key={post.slug} href={`/blog/${post.slug}`} className="focus-ring block border-b border-white/15 pb-3"><p className="text-sm font-bold">{post.title}</p><p className="mt-1 text-[10px] text-white/60">{post.category} · {post.date}</p></Link>)}</div><Link href="/admin/blog" className="focus-ring mt-6 inline-flex items-center gap-2 text-xs font-bold text-[hsl(var(--secondary))]">Manage blog <ArrowUpRight size={14} /></Link></div></div></section></main></Shell>;
}

function DynamicBlog() {
  const { posts } = useBlogPosts();
  return <Shell><Seo page="blog" /><main><PageIntro eyebrow="NexHSE Africa blog" title="Practical HSE thinking for better work." text="Workplace safety, fire, training, risk and environmental insights for organisations building stronger systems." image={fieldImage} /><section className="mx-auto max-w-7xl px-5 py-20 lg:px-8"><Breadcrumbs items={[['Blog', '/blog']]} /><SectionHeader eyebrow="Latest insights" title="Useful context for the decisions in front of you." text={`${posts.length} practical articles from the NexHSE content catalogue.`} /><div className="grid gap-5 md:grid-cols-2">{posts.map(post => <Link key={post.slug} href={`/blog/${post.slug}`} className="group focus-ring overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]" data-testid={`card-blog-${post.slug}`}><div className="relative h-56 overflow-hidden"><img src={post.image} alt={post.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" /><div className="absolute inset-0 bg-gradient-to-t from-[hsl(var(--primary)/.78)] to-transparent" /><span className="absolute bottom-4 left-5 mono-label text-[10px] text-white">{post.category}</span></div><div className="p-6"><div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-[hsl(var(--muted-foreground))]"> <span>{post.date}</span><span>{post.read}</span></div><h2 className="mt-4 text-2xl font-bold text-[hsl(var(--primary))]">{post.title}</h2><p className="mt-3 text-sm leading-6 text-[hsl(var(--muted-foreground))]">{post.excerpt}</p><span className="mt-6 inline-flex items-center gap-2 text-xs font-bold text-[hsl(var(--primary))]">Read article <ArrowUpRight size={15} /></span></div></Link>)}</div></section></main></Shell>;
}

function DynamicBlogDetail() {
  const { slug = '' } = useParams<{ slug: string }>();
  const { posts } = useBlogPosts();
  const post = posts.find(item => item.slug === slug) ?? posts[0];
  return <Shell><Seo page="blog" title={`${post.title} | NexHSE Africa`} description={post.excerpt} /><main><PageIntro eyebrow={`${post.category} · NexHSE blog`} title={post.title} text={post.excerpt} image={post.image} /><article className="mx-auto max-w-4xl px-5 py-20 lg:px-8"><Breadcrumbs items={[['Blog', '/blog'], [post.title, `/blog/${post.slug}`]]} /><div className="mb-10 flex flex-wrap gap-5 border-b border-[hsl(var(--border))] pb-6 text-[10px] font-bold uppercase tracking-widest text-[hsl(var(--muted-foreground))]"><span>{post.date}</span><span>{post.read}</span><span>{post.category}</span></div><div className="prose prose-lg max-w-none prose-headings:font-serif prose-headings:text-[hsl(var(--primary))] prose-p:text-[hsl(var(--muted-foreground))]">{post.body.map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div><Link href="/request-a-quote" className="focus-ring mt-10 inline-flex min-h-12 items-center gap-2 rounded-full bg-[hsl(var(--primary))] px-5 text-sm font-bold text-white" data-testid="link-blog-quote">Discuss your HSE needs <ArrowUpRight size={16} /></Link></article></main></Shell>;
}

function AdminBlogManager() {
  const { posts, addPost } = useBlogPosts();
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({ title: '', category: 'HSE practice', excerpt: '', image: '/assets/image-01.jpeg', date: new Date().toISOString().slice(0, 10), read: '5 min read', body: '' });
  const update = (field: keyof typeof form, value: string) => setForm(current => ({ ...current, [field]: value }));
  const publish = () => {
    if (!form.title || !form.excerpt || !form.body) return;
    const slug = form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    addPost({ ...form, slug, body: form.body.split('\n').map(paragraph => paragraph.trim()).filter(Boolean) });
    setForm(current => ({ ...current, title: '', excerpt: '', body: '' }));
    setSaved(true);
  };
  const fields: [keyof typeof form, string][] = [['title', 'Title'], ['category', 'Category'], ['excerpt', 'Excerpt'], ['image', 'Photo URL'], ['date', 'Publish date'], ['read', 'Reading time']];
  return <Shell><Seo page="blog" title="Blog Manager | NexHSE Africa" description="Private NexHSE Africa blog publishing workspace." /><main><PageIntro eyebrow="Private admin / blog" title="Publish useful HSE knowledge." text="Add a title, photo, excerpt and full article copy. New posts are written to the shared blog catalogue used by the public site." image={fieldImage} /><section className="mx-auto max-w-7xl px-5 py-16 lg:px-8"><Breadcrumbs items={[['Admin', '/admin'], ['Blog', '/admin/blog']]} /><div className="grid gap-10 lg:grid-cols-[.85fr_1.15fr]"><div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6"><p className="mono-label text-[10px] text-[hsl(var(--accent))]">New article</p><h2 className="display mt-3 text-4xl text-[hsl(var(--primary))]">Compose and publish.</h2><div className="mt-7 space-y-4">{fields.map(([field, label]) => <label key={field} className="block text-sm font-semibold text-[hsl(var(--primary))]">{label}<input value={form[field]} onChange={event => update(field, event.target.value)} className="focus-ring mt-2 min-h-11 w-full rounded-xl border border-[hsl(var(--input))] bg-transparent px-3 text-sm outline-none" data-testid={`input-admin-blog-${field}`} /></label>)}<label className="block text-sm font-semibold text-[hsl(var(--primary))]">Article body<textarea value={form.body} onChange={event => update('body', event.target.value)} placeholder="Write one paragraph per line" className="focus-ring mt-2 min-h-40 w-full rounded-xl border border-[hsl(var(--input))] bg-transparent p-3 text-sm outline-none" data-testid="textarea-admin-blog-body" /></label><button type="button" onClick={publish} className="focus-ring min-h-12 rounded-full bg-[hsl(var(--primary))] px-5 text-sm font-bold text-white" data-testid="button-admin-blog-publish">Publish article <ArrowUpRight size={15} className="ml-1 inline" /></button>{saved && <p className="text-xs font-bold text-[hsl(var(--accent))]">Published to the shared blog catalogue.</p>}</div></div><div><div className="mb-5 flex items-end justify-between"><div><p className="mono-label text-[10px] text-[hsl(var(--accent))]">Live catalogue</p><h2 className="display mt-3 text-4xl text-[hsl(var(--primary))]">{posts.length} articles</h2></div><Link href="/blog" className="focus-ring text-xs font-bold text-[hsl(var(--primary))]">View public blog <ArrowUpRight size={14} className="ml-1 inline" /></Link></div><div className="space-y-3">{posts.map(post => <div key={post.slug} className="flex gap-4 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4"><img src={post.image} alt="" className="h-20 w-24 rounded-xl object-cover" /><div><p className="mono-label text-[9px] text-[hsl(var(--accent))]">{post.category} · {post.date}</p><h3 className="mt-2 font-bold text-[hsl(var(--primary))]">{post.title}</h3><p className="mt-1 text-xs leading-5 text-[hsl(var(--muted-foreground))]">{post.excerpt}</p></div></div>)}</div></div></div></section></main></Shell>;
}

function ShopEntry() {
  useEffect(() => {
    if (['nexhse.co.ke', 'www.nexhse.co.ke'].includes(window.location.hostname)) window.location.replace('https://shop.nexhse.co.ke');
  }, []);
  return <Shop />;
}

function PublicSiteRedirect() {
  const pathname = window.location.pathname;
  useEffect(() => { window.location.replace(`${siteUrl}${pathname}`); }, [pathname]);
  return <main className="grid min-h-[60vh] place-items-center px-5 text-sm text-[hsl(var(--muted-foreground))]">Opening NexHSE Africa…</main>;
}

function AdminOrdersPage() {
  return <Shell><Seo page="home" title="Order Management | NexHSE Africa" description="Private order fulfilment, customer delivery and payment operations." /><main className="mx-auto max-w-7xl px-5 py-16 lg:px-8"><Breadcrumbs items={[['Admin', '/admin'], ['Orders', '/admin/orders']]} /><SectionHeader eyebrow="Commerce operations" title="Order fulfilment and payment tracking." text="Review delivery details, payment rails, amounts and update fulfilment status." /><AdminOrderPanel /></main></Shell>;
}

function LegacyAdminCustomersPage() {
  const { orders } = useShopOrders();
  const customers = Array.from(orders.reduce((records, order) => {
    const key = order.delivery.email.trim().toLowerCase();
    const current = records.get(key) ?? { ...order.delivery, orders: 0, spend: 0, lastOrder: order.createdAt };
    current.orders += 1;
    current.spend += order.total;
    if (order.createdAt > current.lastOrder) current.lastOrder = order.createdAt;
    records.set(key, current);
    return records;
  }, new Map<string, DeliveryDetails & { orders: number; spend: number; lastOrder: string }>()).values());

  return <Shell><Seo page="home" title="Customer CRM | NexHSE Africa" description="Private NexHSE customer relationship management and order history." /><main className="mx-auto max-w-7xl px-5 py-16 lg:px-8"><Breadcrumbs items={[['Admin', '/admin'], ['Customers', '/admin/customers']]} /><SectionHeader eyebrow="CRM / customer accounts" title="Customer directory and order history." text="Customer records are assembled from submitted shop orders and stay synchronized with the order queue." /><div className="mb-6 grid gap-4 sm:grid-cols-3">{[{ label: 'Customers', value: customers.length }, { label: 'Orders', value: orders.length }, { label: 'Customer spend', value: `KSh ${customers.reduce((sum, customer) => sum + customer.spend, 0).toLocaleString()}` }].map(metric => <div key={metric.label} className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5"><p className="mono-label text-[10px] text-[hsl(var(--accent))]">{metric.label}</p><p className="display mt-4 text-3xl text-[hsl(var(--primary))]">{metric.value}</p></div>)}</div>{customers.length ? <div className="overflow-x-auto rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-[hsl(var(--secondary))] text-[hsl(var(--primary))]"><tr>{['Customer', 'Phone', 'Delivery location', 'Orders', 'Lifetime spend', 'Last order'].map(label => <th key={label} className="p-4 font-bold">{label}</th>)}</tr></thead><tbody>{customers.map(customer => <tr key={customer.email} className="border-t border-[hsl(var(--border))]"><td className="p-4"><p className="font-bold text-[hsl(var(--primary))]">{customer.name}</p><p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">{customer.email}</p></td><td className="p-4">{customer.phone}</td><td className="p-4">{customer.address}, {customer.county}</td><td className="p-4">{customer.orders}</td><td className="p-4 font-bold">KSh {customer.spend.toLocaleString()}</td><td className="p-4">{new Date(customer.lastOrder).toLocaleDateString()}</td></tr>)}</tbody></table></div> : <EmptyState title="No customer orders yet." text="Customers are added to the CRM automatically when they complete shop checkout." href="https://shop.nexhse.co.ke" actionLabel="Open shop" />}</main></Shell>;
}

function AdminCustomersPage() {
  type Client = { id: string; name: string; email: string; phone: string; company: string; industry: string; location: string; notes: string; createdBy: string; orders: number; spend: number; lastOrder: string | null };
  const [clients, setClients] = useState<Client[]>([]);
  const [form, setForm] = useState({ id: '', name: '', email: '', phone: '', company: '', industry: '', location: '', notes: '' });
  const [error, setError] = useState('');
  const refresh = async () => {
    const response = await fetch('/api/admin-data?resource=clients', { credentials: 'same-origin', cache: 'no-store' });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error ?? 'Unable to load client records');
    setClients(result.items);
  };
  useEffect(() => { void refresh().catch(issue => setError(issue instanceof Error ? issue.message : 'Unable to load clients')); }, []);
  const update = (field: keyof typeof form, value: string) => setForm(current => ({ ...current, [field]: value }));
  const save = async () => {
    setError('');
    const { id, ...client } = form;
    const response = await fetch(id ? `/api/admin-data?resource=clients&id=${encodeURIComponent(id)}` : '/api/admin-data?resource=clients', { method: id ? 'PATCH' : 'POST', credentials: 'same-origin', headers: { 'content-type': 'application/json' }, body: JSON.stringify(id ? client : { client }) });
    const result = await response.json();
    if (!response.ok) { setError(result.error ?? 'Unable to save client'); return; }
    setForm({ id: '', name: '', email: '', phone: '', company: '', industry: '', location: '', notes: '' });
    await refresh();
  };
  const fields: [keyof typeof form, string][] = [['name', 'Contact name'], ['email', 'Email address'], ['phone', 'Phone'], ['company', 'Organisation'], ['industry', 'Industry'], ['location', 'Location']];
  return <Shell><Seo page="home" title="Client CRM | NexHSE Africa" description="Manage onboarded clients and order history." /><main className="mx-auto max-w-7xl px-5 py-16 lg:px-8"><Breadcrumbs items={[[ 'Admin', '/admin' ], [ 'Clients', '/admin/customers' ]]} /><SectionHeader eyebrow="Client CRM / ownership" title="Clients and the orders connected to them." text="Team members see clients they onboard. The super admin sees the full client book and order history." /><div className="grid gap-8 lg:grid-cols-[.75fr_1.25fr]"><section className="border-b border-[hsl(var(--border))] pb-8"><h2 className="text-lg font-bold text-[hsl(var(--primary))]">{form.id ? 'Edit client' : 'Onboard a client'}</h2><div className="mt-5 space-y-4">{fields.map(([field, label]) => <label key={field} className="block text-sm font-semibold text-[hsl(var(--primary))]">{label}<input type={field === 'email' ? 'email' : 'text'} value={form[field]} onChange={event => update(field, event.target.value)} className="focus-ring mt-2 min-h-11 w-full rounded-lg border border-[hsl(var(--input))] bg-transparent px-3" /></label>)}<label className="block text-sm font-semibold text-[hsl(var(--primary))]">Client notes<textarea value={form.notes} onChange={event => update('notes', event.target.value)} className="focus-ring mt-2 min-h-24 w-full rounded-lg border border-[hsl(var(--input))] p-3" /></label><div className="flex gap-2"><button type="button" onClick={() => void save()} disabled={!form.name.trim() || !form.email.trim()} className="focus-ring min-h-11 rounded-lg bg-[hsl(var(--primary))] px-4 text-sm font-bold text-white disabled:opacity-40">{form.id ? 'Save client' : 'Add client'}</button>{form.id && <button type="button" onClick={() => setForm({ id: '', name: '', email: '', phone: '', company: '', industry: '', location: '', notes: '' })} className="focus-ring min-h-11 rounded-lg border border-[hsl(var(--border))] px-4 text-sm font-bold">Cancel</button>}</div></div></section><section><div className="flex items-center justify-between"><h2 className="text-lg font-bold text-[hsl(var(--primary))]">Client book</h2><span className="text-xs text-[hsl(var(--muted-foreground))]">{clients.length} records</span></div><div className="mt-4 divide-y divide-[hsl(var(--border))]">{clients.map(client => <article key={client.id} className="py-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-bold text-[hsl(var(--primary))]">{client.name}</p><p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">{client.company || 'Organisation not set'} · {client.email} · {client.phone}</p><p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">{client.location} {client.industry ? `· ${client.industry}` : ''} · {client.orders} orders · KSh {client.spend.toLocaleString()}</p>{client.lastOrder && <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">Last order {new Date(client.lastOrder).toLocaleDateString()}</p>}</div><button type="button" onClick={() => setForm({ id: client.id, name: client.name, email: client.email, phone: client.phone, company: client.company, industry: client.industry, location: client.location, notes: client.notes })} className="focus-ring min-h-9 rounded-md border border-[hsl(var(--border))] px-3 text-xs font-bold">Edit</button></div>{client.notes && <p className="mt-2 text-xs leading-5 text-[hsl(var(--muted-foreground))]">{client.notes}</p>}</article>)}</div></section></div>{error && <p role="alert" className="mt-5 text-sm font-semibold text-[hsl(var(--destructive))]">{error}</p>}</main></Shell>;
}

function LegacyAdminServiceDeskPage() {
  const { tickets, addTicket, updateTicket } = useServiceTickets();
  const [form, setForm] = useState({ name: '', email: '', subject: '', priority: 'normal' as ServiceTicket['priority'], details: '' });
  const [saved, setSaved] = useState(false);
  const update = (field: keyof typeof form, value: string) => setForm(current => ({ ...current, [field]: value }));
  const create = () => {
    if (!form.name.trim() || !form.email.trim() || !form.subject.trim() || !form.details.trim()) return;
    addTicket(form);
    setForm({ name: '', email: '', subject: '', priority: 'normal', details: '' });
    setSaved(true);
  };
  return <Shell><Seo page="home" title="Customer Service Desk | NexHSE Africa" description="Private customer support and service request management workspace." /><main className="mx-auto max-w-7xl px-5 py-16 lg:px-8"><Breadcrumbs items={[['Admin', '/admin'], ['Service desk', '/admin/service']]} /><SectionHeader eyebrow="Customer service / case management" title="Track customer follow-up from one desk." text="Log support requests, assign urgency and move each case through open, in progress and resolved states." /><div className="grid gap-8 lg:grid-cols-[.8fr_1.2fr]"><section className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6"><p className="mono-label text-[10px] text-[hsl(var(--accent))]">Log support case</p><div className="mt-5 space-y-4">{[['name', 'Customer name'], ['email', 'Customer email'], ['subject', 'Subject']].map(([field, label]) => <label key={field} className="block text-sm font-semibold text-[hsl(var(--primary))]">{label}<input value={form[field as keyof typeof form]} onChange={event => update(field as keyof typeof form, event.target.value)} className="focus-ring mt-2 min-h-11 w-full rounded-xl border border-[hsl(var(--input))] bg-transparent px-3 text-sm outline-none" /></label>)}<label className="block text-sm font-semibold text-[hsl(var(--primary))]">Priority<select value={form.priority} onChange={event => update('priority', event.target.value)} className="focus-ring mt-2 min-h-11 w-full rounded-xl border border-[hsl(var(--input))] bg-white px-3 text-sm"><option value="normal">Normal</option><option value="urgent">Urgent</option></select></label><label className="block text-sm font-semibold text-[hsl(var(--primary))]">Request details<textarea value={form.details} onChange={event => update('details', event.target.value)} className="focus-ring mt-2 min-h-28 w-full rounded-xl border border-[hsl(var(--input))] bg-transparent p-3 text-sm outline-none" /></label><button type="button" onClick={create} className="focus-ring min-h-11 rounded-full bg-[hsl(var(--primary))] px-5 text-xs font-bold text-white">Create case <ArrowUpRight size={14} className="ml-1 inline" /></button>{saved && <p className="text-xs font-bold text-[hsl(var(--accent))]">Case logged and saved in this browser.</p>}</div></section><section><div className="flex items-center justify-between"><div><p className="mono-label text-[10px] text-[hsl(var(--accent))]">Support inbox</p><h2 className="display mt-2 text-3xl text-[hsl(var(--primary))]">{tickets.length} cases</h2></div><span className="text-xs text-[hsl(var(--muted-foreground))]">{tickets.filter(ticket => ticket.status !== 'resolved').length} need attention</span></div><div className="mt-5 space-y-3">{tickets.map(ticket => <article key={ticket.id} className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="mono-label text-[9px] text-[hsl(var(--accent))]">{ticket.id} · {ticket.priority}</p><h3 className="mt-2 font-bold text-[hsl(var(--primary))]">{ticket.subject}</h3><p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">{ticket.name} · {ticket.email}</p><p className="mt-3 text-sm leading-6 text-[hsl(var(--muted-foreground))]">{ticket.details}</p></div><select value={ticket.status} onChange={event => updateTicket(ticket.id, event.target.value as ServiceTicket['status'])} className="focus-ring min-h-10 rounded-xl border border-[hsl(var(--border))] bg-white px-3 text-xs font-bold" aria-label={`Update ${ticket.id} status`}><option>open</option><option>in progress</option><option>resolved</option></select></div></article>)}</div>{tickets.length === 0 && <EmptyState title="Your support inbox is clear." text="Create a case when a customer needs follow-up. Cases and status changes persist in this browser." />}</section></div></main></Shell>;
}

function AdminServiceDeskPage() {
  const { tickets, addTicket, updateTicket, recordFollowup } = useServiceTickets();
  const [form, setForm] = useState({ name: '', email: '', subject: '', priority: 'normal' as ServiceTicket['priority'], details: '' });
  const [followupText, setFollowupText] = useState<Record<string, string>>({});
  const [followups, setFollowups] = useState<Record<string, { id: string; message: string; createdAt: string }[]>>({});
  const [selectedId, setSelectedId] = useState('');
  const [error, setError] = useState('');
  const update = (field: keyof typeof form, value: string) => setForm(current => ({ ...current, [field]: value }));
  const create = () => {
    if (!form.name.trim() || !form.email.trim() || !form.subject.trim() || !form.details.trim()) return;
    addTicket(form);
    setForm({ name: '', email: '', subject: '', priority: 'normal', details: '' });
  };
  const loadFollowups = async (id: string) => {
    setSelectedId(id);
    const response = await fetch(`/api/admin-data?resource=tickets&id=${encodeURIComponent(id)}`, { credentials: 'same-origin', cache: 'no-store' });
    const result = await response.json();
    if (response.ok) setFollowups(current => ({ ...current, [id]: result.followups ?? [] }));
  };
  const submitFollowup = async (ticket: ServiceTicket) => {
    const message = followupText[ticket.id]?.trim();
    if (!message) return;
    const response = await recordFollowup(ticket.id, message);
    if (!response.ok) { setError('Unable to save follow-up.'); return; }
    setFollowupText(current => ({ ...current, [ticket.id]: '' }));
    await loadFollowups(ticket.id);
  };
  return <Shell><Seo page="home" title="Service desk | NexHSE Africa" description="Manage customer service cases and follow-up history." /><main className="mx-auto max-w-7xl px-5 py-16 lg:px-8"><Breadcrumbs items={[[ 'Admin', '/admin' ], [ 'Service desk', '/admin/service' ]]} /><SectionHeader eyebrow="Customer service / case management" title="Track service requests through resolution." text="Create cases, assign urgency, update status and keep a dated record of customer follow-up." /><div className="grid gap-10 lg:grid-cols-[.7fr_1.3fr]"><section className="border-b border-[hsl(var(--border))] pb-8"><h2 className="text-lg font-bold text-[hsl(var(--primary))]">Log support case</h2><div className="mt-5 space-y-4">{[['name', 'Customer name'], ['email', 'Customer email'], ['subject', 'Subject']].map(([field, label]) => <label key={field} className="block text-sm font-semibold">{label}<input value={form[field as keyof typeof form]} onChange={event => update(field as keyof typeof form, event.target.value)} className="focus-ring mt-2 min-h-11 w-full rounded-lg border border-[hsl(var(--input))] bg-transparent px-3" /></label>)}<label className="block text-sm font-semibold">Priority<select value={form.priority} onChange={event => update('priority', event.target.value)} className="focus-ring mt-2 min-h-11 w-full rounded-lg border border-[hsl(var(--input))] bg-white px-3"><option value="normal">Normal</option><option value="urgent">Urgent</option></select></label><label className="block text-sm font-semibold">Details<textarea value={form.details} onChange={event => update('details', event.target.value)} className="focus-ring mt-2 min-h-28 w-full rounded-lg border border-[hsl(var(--input))] bg-transparent p-3" /></label><button type="button" onClick={create} disabled={!form.name.trim() || !form.email.trim() || !form.subject.trim() || !form.details.trim()} className="focus-ring min-h-11 rounded-lg bg-[hsl(var(--primary))] px-4 text-sm font-bold text-white disabled:opacity-40">Create case</button></div></section><section><div className="flex items-center justify-between"><h2 className="text-lg font-bold text-[hsl(var(--primary))]">Open and recent cases</h2><span className="text-xs text-[hsl(var(--muted-foreground))]">{tickets.length} total</span></div><div className="mt-4 divide-y divide-[hsl(var(--border))]">{tickets.map(ticket => <article key={ticket.id} className="py-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-bold text-[hsl(var(--primary))]">{ticket.subject}</p><p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">{ticket.name} · <a href={`mailto:${ticket.email}`} className="underline">{ticket.email}</a> · {ticket.priority}</p><p className="mt-2 text-sm leading-6">{ticket.details}</p></div><label className="text-xs font-bold">Status<select value={ticket.status} onChange={event => updateTicket(ticket.id, event.target.value as ServiceTicket['status'])} className="focus-ring mt-1 min-h-9 rounded-lg border border-[hsl(var(--border))] bg-white px-2"><option value="open">Open</option><option value="in progress">In progress</option><option value="resolved">Resolved</option></select></label></div><button type="button" onClick={() => void loadFollowups(ticket.id)} className="focus-ring mt-3 text-xs font-bold text-[hsl(var(--accent))]">{selectedId === ticket.id ? 'Refresh follow-up history' : 'View follow-up history'}</button>{selectedId === ticket.id && <div className="mt-3 border-l border-[hsl(var(--border))] pl-3">{(followups[ticket.id] ?? []).map(item => <p key={item.id} className="mb-2 text-xs text-[hsl(var(--muted-foreground))]">{new Date(item.createdAt).toLocaleString()} · {item.message}</p>)}</div>}<div className="mt-3 flex gap-2"><textarea value={followupText[ticket.id] ?? ''} onChange={event => setFollowupText(current => ({ ...current, [ticket.id]: event.target.value }))} aria-label={`Follow-up note for ${ticket.subject}`} placeholder="Add an internal follow-up note" className="focus-ring min-h-10 flex-1 rounded-lg border border-[hsl(var(--border))] p-2 text-xs" /><button type="button" onClick={() => void submitFollowup(ticket)} className="focus-ring min-h-10 rounded-lg border border-[hsl(var(--border))] px-3 text-xs font-bold">Record note</button></div></article>)}</div></section></div>{error && <p role="alert" className="mt-4 text-sm text-[hsl(var(--destructive))]">{error}</p>}</main></Shell>;
}

function AdminAccessGate({ children, ownerOnly = false }: { children: ReactNode; ownerOnly?: boolean }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [role, setRole] = useState('');
  const [credential, setCredential] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    document.title = 'Admin sign in | NexHSE Africa';
    for (const name of ['robots', 'googlebot', 'bingbot']) {
      let meta = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
      if (!meta) { meta = document.createElement('meta'); meta.name = name; document.head.appendChild(meta); }
      meta.content = 'noindex, nofollow';
    }
    let active = true;
    void fetch('/api/admin-session', { credentials: 'same-origin', cache: 'no-store' }).then(response => response.json()).then(result => {
      if (active) { setAuthenticated(Boolean(result.authenticated)); setRole(result.user?.role ?? ''); }
    }).catch(() => undefined).finally(() => { if (active) setChecking(false); });
    return () => { active = false; };
  }, []);

  const signIn = async () => {
    setError('');
    try {
      const response = await fetch('/api/admin-session', { method: 'POST', credentials: 'same-origin', headers: { 'content-type': 'application/json' }, body: JSON.stringify(emailAddress.trim() ? { email: emailAddress, password: credential } : { key: credential }) });
      const result = await response.json().catch(() => null);
      if (!result || typeof result !== 'object') {
        throw new Error(`Admin sign-in service returned an unexpected response (HTTP ${response.status}). Check Vercel function logs and environment configuration.`);
      }
      if (!response.ok) throw new Error(result.error ?? 'Unable to sign in');
      if (result.supabaseSession?.access_token && result.supabaseSession?.refresh_token) {
        try {
          const supabase = await getSupabaseBrowserClient();
          await supabase.auth.setSession(result.supabaseSession);
        } catch {
          setError('Signed in to the admin workspace, but Supabase session setup failed. Edge features may be unavailable.');
        }
      }
      setAuthenticated(true);
      setRole(result.user?.role ?? '');
      setCredential('');
    } catch (issue) { setError(issue instanceof Error ? issue.message : 'Unable to sign in'); }
  };

  if (authenticated && (!ownerOnly || role === 'owner')) return <>{children}</>;
  if (authenticated && ownerOnly) return <main className="grid min-h-[70vh] place-items-center px-5"><p className="text-sm font-semibold text-[hsl(var(--muted-foreground))]">This workspace area is restricted to the super admin account.</p></main>;
  return <main className="grid min-h-[100dvh] place-items-center bg-[hsl(var(--primary))] px-5 py-12"><div className="w-full max-w-md rounded-2xl border border-white/15 bg-white p-7 shadow-2xl sm:p-9"><p className="mono-label text-[10px] text-[hsl(var(--accent))]">NexHSE / operations</p><h1 className="display mt-4 text-4xl text-[hsl(var(--primary))]">Admin sign in.</h1><p className="mt-3 text-sm leading-6 text-[hsl(var(--muted-foreground))]">Use your admin account credentials.</p>{checking ? <p className="mt-7 text-sm text-[hsl(var(--muted-foreground))]">Checking session…</p> : <div className="mt-7">{emailAddress !== null && <label className="mb-4 block text-sm font-semibold text-[hsl(var(--primary))]">Email address <span className="font-normal text-[hsl(var(--muted-foreground))]">(team accounts)</span><input type="email" value={emailAddress} onChange={event => setEmailAddress(event.target.value)} onKeyDown={event => { if (event.key === 'Enter') void signIn(); }} autoComplete="username" className="focus-ring mt-2 min-h-12 w-full rounded-xl border border-[hsl(var(--input))] px-3 text-sm outline-none" data-testid="input-admin-email" /></label>}<label className="block text-sm font-semibold text-[hsl(var(--primary))]">Password or owner API key<input type="password" value={credential} onChange={event => setCredential(event.target.value)} onKeyDown={event => { if (event.key === 'Enter') void signIn(); }} autoComplete="current-password" className="focus-ring mt-2 min-h-12 w-full rounded-xl border border-[hsl(var(--input))] px-3 text-sm outline-none" data-testid="input-admin-credential" /></label><button type="button" onClick={() => void signIn()} disabled={!credential} className="focus-ring mt-5 min-h-12 w-full rounded-full bg-[hsl(var(--primary))] text-sm font-bold text-white disabled:opacity-40" data-testid="button-admin-sign-in">Sign in</button>{error && <p role="alert" className="mt-4 text-sm font-semibold text-[hsl(var(--destructive))]">{error}</p>}</div>}</div></main>;
}

function AdminInviteAcceptance() {
  const token = new URLSearchParams(window.location.search).get('token') ?? '';
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const accept = async () => {
    setSubmitting(true);
    setError('');
    try {
      const response = await fetch('/api/admin-invitations/accept', { method: 'POST', credentials: 'same-origin', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ token, password }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? 'Unable to accept invitation');
      window.location.replace('/');
    } catch (issue) {
      setError(issue instanceof Error ? issue.message : 'Unable to accept invitation');
    } finally {
      setSubmitting(false);
    }
  };
  return <main className="grid min-h-[100dvh] place-items-center bg-[hsl(var(--primary))] px-5 py-12"><section className="w-full max-w-md rounded-2xl bg-white p-8"><p className="mono-label text-[10px] text-[hsl(var(--accent))]">NexHSE / team access</p><h1 className="display mt-4 text-4xl text-[hsl(var(--primary))]">Create your account.</h1><p className="mt-3 text-sm text-[hsl(var(--muted-foreground))]">Choose a password with at least 12 characters to activate this invitation.</p><label className="mt-7 block text-sm font-semibold text-[hsl(var(--primary))]">New password<input type="password" value={password} onChange={event => setPassword(event.target.value)} autoComplete="new-password" minLength={12} className="focus-ring mt-2 min-h-12 w-full rounded-xl border border-[hsl(var(--input))] px-3 text-sm outline-none" /></label><button type="button" onClick={() => void accept()} disabled={!token || password.length < 12 || submitting} className="focus-ring mt-5 min-h-12 w-full rounded-full bg-[hsl(var(--primary))] text-sm font-bold text-white disabled:opacity-40">{submitting ? 'Activating…' : 'Activate account'}</button>{error && <p role="alert" className="mt-4 text-sm font-semibold text-[hsl(var(--destructive))]">{error}</p>}</section></main>;
}

function AdminServicesPage() {
  const publicServices = useServices();
  const [rows, setRows] = useState<Service[]>(services);
  const [selectedSlug, setSelectedSlug] = useState(services[0].slug);
  const [form, setForm] = useState<Service>(services[0]);
  const [isNew, setIsNew] = useState(false);
  const [notice, setNotice] = useState('');
  useEffect(() => { setRows(publicServices); }, [publicServices]);
  useEffect(() => {
    void fetch('/api/admin-data?resource=services', { credentials: 'same-origin', cache: 'no-store' }).then(response => response.json()).then(async result => {
      if (Array.isArray(result.items) && result.items.length === 0) {
        const initialServices = services.map(service => ({ ...service, id: service.slug, active: true }));
        await fetch('/api/admin-data?resource=services', { method: 'POST', credentials: 'same-origin', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ services: initialServices }) });
      }
    }).catch(() => undefined);
  }, []);
  useEffect(() => { if (!isNew) setForm(rows.find(service => service.slug === selectedSlug) ?? rows[0]); }, [rows, selectedSlug, isNew]);
  const update = (field: keyof Service, value: string) => setForm(current => ({ ...current, [field]: value }));
  const create = () => {
    const blank: Service = { slug: '', number: String(rows.length + 1).padStart(2, '0'), title: '', short: '', outcome: '', type: 'OSH — TRAINING & CAPACITY BUILDING', icon: ShieldCheck, image: trainingImage, group: 'Training', active: true };
    setIsNew(true);
    setForm(blank);
    setNotice('');
  };
  const save = async () => {
    const slug = form.slug.trim() || form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const service = { ...form, slug, id: form.id ?? slug, active: true };
    const response = await fetch('/api/admin-data?resource=services', { method: 'PUT', credentials: 'same-origin', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ service }) });
    if (!response.ok) { setNotice('Unable to save service. Check your admin access and required fields.'); return; }
    setRows(current => [...current.filter(item => item.slug !== slug), service]);
    setSelectedSlug(slug);
    setIsNew(false);
    setNotice('Service saved to the live catalogue.');
  };
  const remove = async () => {
    const response = await fetch(`/api/admin-data?resource=services&id=${encodeURIComponent(form.id ?? form.slug)}`, { method: 'DELETE', credentials: 'same-origin', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ service: form }) });
    if (!response.ok) { setNotice('Unable to remove service.'); return; }
    setRows(current => current.filter(item => item.slug !== form.slug));
    setSelectedSlug(rows.find(item => item.slug !== form.slug)?.slug ?? '');
    setIsNew(false);
    setNotice('Service archived from the public catalogue.');
  };
  const fields: [keyof Service, string][] = [['title', 'Service title'], ['slug', 'URL slug'], ['number', 'Catalogue number'], ['type', 'Service category'], ['group', 'Short label'], ['image', 'Image URL or asset path']];
  return <Shell><Seo page="home" title="Service catalogue | NexHSE Africa" description="Manage public service catalogue records." /><main className="mx-auto max-w-7xl px-5 py-16 lg:px-8"><Breadcrumbs items={[[ 'Admin', '/admin' ], [ 'Services', '/admin/services' ]]} /><SectionHeader eyebrow="Service catalogue / CRUD" title="Keep the public service portfolio current." text="Create, edit, publish or archive service records used by the public catalogue." /><div className="grid gap-8 lg:grid-cols-[.7fr_1.3fr]"><aside><button type="button" onClick={create} className="focus-ring min-h-11 rounded-lg bg-[hsl(var(--primary))] px-4 text-sm font-bold text-white">Add service</button><div className="mt-5 divide-y divide-[hsl(var(--border))]">{rows.map(service => <button key={service.slug} type="button" onClick={() => { setIsNew(false); setSelectedSlug(service.slug); }} className={`focus-ring block w-full py-3 text-left ${selectedSlug === service.slug && !isNew ? 'font-bold text-[hsl(var(--primary))]' : 'text-[hsl(var(--muted-foreground))]'}`}><span className="block text-sm">{service.title}</span><span className="mt-1 block text-xs">{service.type}</span></button>)}</div></aside><section className="border-t border-[hsl(var(--border))] pt-5"><div className="grid gap-4 sm:grid-cols-2">{fields.map(([field, label]) => field === 'image' ? <AdminImageField key={field} label={label} value={form.image} scope="services" allowVideo onChange={value => update(field, value)} /> : <label key={field} className="block text-sm font-semibold text-[hsl(var(--primary))]">{label}<input value={String(form[field] ?? '')} onChange={event => update(field, event.target.value)} className="focus-ring mt-2 min-h-11 w-full rounded-lg border border-[hsl(var(--input))] bg-transparent px-3 text-sm" /></label>)}<label className="block text-sm font-semibold text-[hsl(var(--primary))] sm:col-span-2">Short description<textarea value={form.short} onChange={event => update('short', event.target.value)} className="focus-ring mt-2 min-h-20 w-full rounded-lg border border-[hsl(var(--input))] bg-transparent p-3 text-sm" /></label><label className="block text-sm font-semibold text-[hsl(var(--primary))] sm:col-span-2">Customer outcome<textarea value={form.outcome} onChange={event => update('outcome', event.target.value)} className="focus-ring mt-2 min-h-20 w-full rounded-lg border border-[hsl(var(--input))] bg-transparent p-3 text-sm" /></label></div><div className="mt-5 flex flex-wrap gap-3"><button type="button" onClick={() => void save()} disabled={!form.title.trim() || !form.short.trim() || !form.type.trim()} className="focus-ring min-h-11 rounded-lg bg-[hsl(var(--primary))] px-4 text-sm font-bold text-white disabled:opacity-40">Save service</button>{!isNew && <button type="button" onClick={() => void remove()} className="focus-ring min-h-11 rounded-lg border border-[hsl(var(--border))] px-4 text-sm font-bold">Archive service</button>}</div>{notice && <p role="status" className="mt-4 text-sm font-semibold text-[hsl(var(--accent))]">{notice}</p>}</section></div></main></Shell>;
}

function AdminPromotionsPage() {
  const { products } = useShopProducts();
  const [promotions, setPromotions] = useState<ShopPromotion[]>([]);
  const [form, setForm] = useState<Omit<ShopPromotion, 'id' | 'usageCount'> & { id?: string; usageCount?: number }>({ code: '', name: '', description: '', discountType: 'percentage', discountValue: 10, productIds: [], startsAt: null, endsAt: null, usageLimit: null, usageCount: 0, active: true });
  const [error, setError] = useState('');
  const refresh = async () => {
    const response = await fetch('/api/admin-data?resource=promotions', { credentials: 'same-origin', cache: 'no-store' });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error ?? 'Unable to load promotions');
    setPromotions(result.items);
  };
  useEffect(() => { void refresh().catch(issue => setError(issue instanceof Error ? issue.message : 'Unable to load promotions')); }, []);
  const update = (field: keyof typeof form, value: string | number | boolean | string[] | null) => setForm(current => ({ ...current, [field]: value }));
  const save = async () => {
    setError('');
    const payload = { ...form, code: form.code.trim().toUpperCase(), startsAt: form.startsAt ? new Date(form.startsAt).toISOString() : null, endsAt: form.endsAt ? new Date(form.endsAt).toISOString() : null, usageLimit: form.usageLimit ? Number(form.usageLimit) : null };
    const response = await fetch('/api/admin-data?resource=promotions', { method: 'PUT', credentials: 'same-origin', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ promotion: payload }) });
    const result = await response.json();
    if (!response.ok) { setError(result.error ?? 'Unable to save promotion'); return; }
    await refresh();
    setForm({ code: '', name: '', description: '', discountType: 'percentage', discountValue: 10, productIds: [], startsAt: null, endsAt: null, usageLimit: null, usageCount: 0, active: true });
  };
  const edit = (promotion: ShopPromotion) => setForm({ ...promotion, startsAt: promotion.startsAt ? new Date(promotion.startsAt).toISOString().slice(0, 16) : null, endsAt: promotion.endsAt ? new Date(promotion.endsAt).toISOString().slice(0, 16) : null });
  const remove = async (id: string) => {
    const response = await fetch(`/api/admin-data?resource=promotions&id=${encodeURIComponent(id)}`, { method: 'DELETE', credentials: 'same-origin' });
    if (!response.ok) { setError('Unable to remove promotion'); return; }
    await refresh();
  };
  return <Shell><Seo page="home" title="Promotions | NexHSE Africa" description="Create and schedule shop promotions." /><main className="mx-auto max-w-7xl px-5 py-16 lg:px-8"><Breadcrumbs items={[[ 'Admin', '/admin' ], [ 'Promotions', '/admin/promotions' ]]} /><SectionHeader eyebrow="Shop / promotions" title="Schedule live product offers." text="Active promotions are applied to eligible products and recalculated by the checkout API. Usage caps are enforced in Neon." /><div className="grid gap-8 lg:grid-cols-[.8fr_1.2fr]"><section className="border-b border-[hsl(var(--border))] pb-8"><h2 className="text-lg font-bold text-[hsl(var(--primary))]">{form.id ? 'Edit promotion' : 'Create promotion'}</h2><div className="mt-5 grid gap-4 sm:grid-cols-2"><label className="text-sm font-semibold">Promotion code<input value={form.code} onChange={event => update('code', event.target.value.toUpperCase())} className="focus-ring mt-2 min-h-11 w-full rounded-lg border border-[hsl(var(--input))] px-3" /></label><label className="text-sm font-semibold">Name<input value={form.name} onChange={event => update('name', event.target.value)} className="focus-ring mt-2 min-h-11 w-full rounded-lg border border-[hsl(var(--input))] px-3" /></label><label className="text-sm font-semibold">Discount<select value={form.discountType} onChange={event => update('discountType', event.target.value)} className="focus-ring mt-2 min-h-11 w-full rounded-lg border border-[hsl(var(--input))] bg-white px-3"><option value="percentage">Percentage</option><option value="fixed">Fixed KES</option></select></label><label className="text-sm font-semibold">Value<input type="number" min="1" max={form.discountType === 'percentage' ? 100 : undefined} value={form.discountValue} onChange={event => update('discountValue', Number(event.target.value))} className="focus-ring mt-2 min-h-11 w-full rounded-lg border border-[hsl(var(--input))] px-3" /></label><label className="text-sm font-semibold">Starts at<input type="datetime-local" value={form.startsAt?.slice(0, 16) ?? ''} onChange={event => update('startsAt', event.target.value || null)} className="focus-ring mt-2 min-h-11 w-full rounded-lg border border-[hsl(var(--input))] px-3" /></label><label className="text-sm font-semibold">Ends at<input type="datetime-local" value={form.endsAt?.slice(0, 16) ?? ''} onChange={event => update('endsAt', event.target.value || null)} className="focus-ring mt-2 min-h-11 w-full rounded-lg border border-[hsl(var(--input))] px-3" /></label><label className="text-sm font-semibold">Redemption limit<input type="number" min="1" value={form.usageLimit ?? ''} onChange={event => update('usageLimit', event.target.value ? Number(event.target.value) : null)} className="focus-ring mt-2 min-h-11 w-full rounded-lg border border-[hsl(var(--input))] px-3" /></label><label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={form.active} onChange={event => update('active', event.target.checked)} />Active</label><label className="text-sm font-semibold sm:col-span-2">Products <span className="font-normal text-[hsl(var(--muted-foreground))]">(leave empty to include all)</span><select multiple value={form.productIds} onChange={event => update('productIds', Array.from(event.currentTarget.selectedOptions, option => option.value))} className="focus-ring mt-2 min-h-36 w-full rounded-lg border border-[hsl(var(--input))] bg-white p-2 text-sm">{products.map(product => <option key={product.id ?? product.name} value={product.id ?? product.name}>{product.name} · {product.sku}</option>)}</select></label><label className="text-sm font-semibold sm:col-span-2">Description<textarea value={form.description} onChange={event => update('description', event.target.value)} className="focus-ring mt-2 min-h-16 w-full rounded-lg border border-[hsl(var(--input))] p-3" /></label></div><div className="mt-4 flex gap-3"><button type="button" onClick={() => void save()} disabled={!form.code.trim() || !form.name.trim()} className="focus-ring min-h-11 rounded-lg bg-[hsl(var(--primary))] px-4 text-sm font-bold text-white disabled:opacity-40">Save promotion</button>{form.id && <button type="button" onClick={() => setForm({ code: '', name: '', description: '', discountType: 'percentage', discountValue: 10, productIds: [], startsAt: null, endsAt: null, usageLimit: null, usageCount: 0, active: true })} className="focus-ring min-h-11 rounded-lg border border-[hsl(var(--border))] px-4 text-sm font-bold">New</button>}</div></section><section><h2 className="text-lg font-bold text-[hsl(var(--primary))]">Current promotions</h2><div className="mt-4 divide-y divide-[hsl(var(--border))]">{promotions.map(promotion => <article key={promotion.id} className="flex flex-wrap items-center justify-between gap-3 py-4"><button type="button" onClick={() => edit(promotion)} className="focus-ring text-left"><span className="block font-bold text-[hsl(var(--primary))]">{promotion.name} · {promotion.code}</span><span className="mt-1 block text-xs text-[hsl(var(--muted-foreground))]">{promotion.discountType === 'percentage' ? `${promotion.discountValue}%` : `KSh ${promotion.discountValue}`} · {promotion.usageCount}{promotion.usageLimit ? ` / ${promotion.usageLimit}` : ''} uses · {promotion.active ? 'Active' : 'Paused'}</span></button><button type="button" onClick={() => void remove(promotion.id)} className="focus-ring min-h-9 rounded-md border border-[hsl(var(--border))] px-3 text-xs font-bold">Delete</button></article>)}</div></section></div>{error && <p role="alert" className="mt-5 text-sm font-semibold text-[hsl(var(--destructive))]">{error}</p>}</main></Shell>;
}

function AdminUsersPage() {
  const [users, setUsers] = useState<{ id: string; email: string; name: string; role: string; active: boolean }[]>([]);
  const [invitations, setInvitations] = useState<{ id: string; email: string; role: string; expiresAt: string; acceptedAt: string | null }[]>([]);
  const [form, setForm] = useState({ name: '', email: '', role: 'staff' });
  const [inviteUrl, setInviteUrl] = useState('');
  const [error, setError] = useState('');
  const refresh = async () => {
    const response = await fetch('/api/admin-invitations', { credentials: 'same-origin', cache: 'no-store' });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error ?? 'Unable to load accounts');
    setUsers(result.users);
    setInvitations(result.invitations);
  };
  useEffect(() => { void refresh().catch(issue => setError(issue instanceof Error ? issue.message : 'Unable to load accounts')); }, []);
  const invite = async () => {
    setError('');
    try {
      const response = await fetch('/api/admin-invitations', { method: 'POST', credentials: 'same-origin', headers: { 'content-type': 'application/json' }, body: JSON.stringify(form) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? 'Unable to create invitation');
      const basePath = window.location.hostname === 'admin.nexhse.co.ke' ? '/accept-invite' : '/admin/accept-invite';
      setInviteUrl(`${window.location.origin}${basePath}?token=${encodeURIComponent(result.invitation.token)}`);
      setForm({ name: '', email: '', role: 'staff' });
      await refresh();
    } catch (issue) { setError(issue instanceof Error ? issue.message : 'Unable to create invitation'); }
  };
  const updateUser = async (id: string, changes: { active?: boolean; role?: string }) => {
    const response = await fetch('/api/admin-invitations', { method: 'PATCH', credentials: 'same-origin', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id, ...changes }) });
    if (!response.ok) { const result = await response.json(); setError(result.error ?? 'Unable to update account'); return; }
    await refresh();
  };
  return <Shell><Seo page="home" title="Team access | NexHSE Africa" description="Manage administrator accounts and invitations." /><main className="mx-auto max-w-7xl px-5 py-16 lg:px-8"><Breadcrumbs items={[[ 'Admin', '/admin' ], [ 'Team access', '/admin/users' ]]} /><SectionHeader eyebrow="Access management" title="People who can operate the workspace." text="Invite secondary users, assign access roles, and suspend accounts when access should end." /><div className="grid gap-8 lg:grid-cols-[.8fr_1.2fr]"><section className="border-b border-[hsl(var(--border))] pb-8"><h2 className="text-lg font-bold text-[hsl(var(--primary))]">Invite a teammate</h2><div className="mt-5 space-y-4"><label className="block text-sm font-semibold">Full name<input value={form.name} onChange={event => setForm(current => ({ ...current, name: event.target.value }))} className="focus-ring mt-2 min-h-11 w-full rounded-lg border border-[hsl(var(--input))] px-3" /></label><label className="block text-sm font-semibold">Email address<input type="email" value={form.email} onChange={event => setForm(current => ({ ...current, email: event.target.value }))} className="focus-ring mt-2 min-h-11 w-full rounded-lg border border-[hsl(var(--input))] px-3" /></label><label className="block text-sm font-semibold">Role<select value={form.role} onChange={event => setForm(current => ({ ...current, role: event.target.value }))} className="focus-ring mt-2 min-h-11 w-full rounded-lg border border-[hsl(var(--input))] bg-white px-3"><option value="staff">Staff</option><option value="admin">Admin</option></select></label><button type="button" onClick={() => void invite()} disabled={!form.name.trim() || !form.email.trim()} className="focus-ring min-h-11 rounded-lg bg-[hsl(var(--primary))] px-4 text-sm font-bold text-white disabled:opacity-40">Create invitation</button>{inviteUrl && <div className="border-l-2 border-[hsl(var(--accent))] pl-4"><p className="text-xs font-bold">One-time invite link. Copy it now; it expires in 72 hours.</p><input readOnly value={inviteUrl} className="mt-2 min-h-10 w-full border-b border-[hsl(var(--border))] text-xs" /><button type="button" onClick={() => void navigator.clipboard?.writeText(inviteUrl)} className="focus-ring mt-2 text-xs font-bold text-[hsl(var(--primary))]">Copy invite link</button></div>}</div></section><section><h2 className="text-lg font-bold text-[hsl(var(--primary))]">Accounts</h2><div className="mt-4 divide-y divide-[hsl(var(--border))]">{users.map(user => <div key={user.id} className="flex flex-wrap items-center justify-between gap-3 py-4"><div><p className="font-bold text-[hsl(var(--primary))]">{user.name}</p><p className="text-xs text-[hsl(var(--muted-foreground))]">{user.email} · {user.role} · {user.active ? 'Active' : 'Suspended'}</p></div><div className="flex gap-2"><select aria-label={`Role for ${user.email}`} value={user.role} onChange={event => void updateUser(user.id, { role: event.target.value })} className="min-h-9 rounded-md border border-[hsl(var(--border))] bg-white px-2 text-xs"><option value="staff">Staff</option><option value="admin">Admin</option></select><button type="button" onClick={() => void updateUser(user.id, { active: !user.active })} className="focus-ring min-h-9 rounded-md border border-[hsl(var(--border))] px-3 text-xs font-bold">{user.active ? 'Suspend' : 'Reactivate'}</button></div></div>)}</div><h2 className="mt-8 text-lg font-bold text-[hsl(var(--primary))]">Invitations</h2><div className="mt-3 divide-y divide-[hsl(var(--border))]">{invitations.map(invitation => <div key={invitation.id} className="py-3 text-sm"><p className="font-semibold">{invitation.email} · {invitation.role}</p><p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">{invitation.acceptedAt ? 'Accepted' : new Date(invitation.expiresAt) < new Date() ? 'Expired' : `Expires ${new Date(invitation.expiresAt).toLocaleString()}`}</p></div>)}</div></section></div>{error && <p role="alert" className="mt-5 text-sm font-semibold text-[hsl(var(--destructive))]">{error}</p>}</main></Shell>;
}

function AdminWorkspaceRoute() {
  const [location] = useLocation();
  const path = location.split(/[?#]/, 1)[0].replace(/\/+$/, '').replace(/^\/admin(?=\/|$)/, '') || '/';
  const page = path === '/' ? <AdminDashboard /> : path === '/quotes' ? <Shell><AdminQuotesPage /></Shell> : path === '/invoices' ? <Shell><AdminInvoicesPage /></Shell> : path === '/products' ? <AdminProductCatalogue /> : path === '/promotions' ? <AdminPromotionsPage /> : path === '/services' ? <AdminServicesPage /> : path === '/blog' ? <AdminBlogManager /> : path === '/orders' ? <AdminOrdersPage /> : path === '/customers' ? <AdminCustomersPage /> : path === '/service' ? <AdminServiceDeskPage /> : path === '/users' ? <AdminUsersPage /> : <NotFound />;
  const ownerOnly = ['/quotes', '/invoices', '/products', '/promotions', '/services', '/blog', '/users'].includes(path);
  return <AdminAccessGate ownerOnly={ownerOnly}><Suspense fallback={<main className="mx-auto max-w-7xl px-5 py-12 text-sm text-[hsl(var(--muted-foreground))]">Loading workspace…</main>}>{page}</Suspense></AdminAccessGate>;
}

function AppRouter() {
  const hostname = window.location.hostname.toLowerCase();

  if (hostname !== 'admin.nexhse.co.ke' && window.location.pathname.startsWith('/admin/') && window.location.pathname !== '/admin/accept-invite') return <AdminWorkspaceRoute />;

  if (hostname === 'shop.nexhse.co.ke') {
    return <Switch><Route path="/" component={Shop} /><Route path="/cart" component={CartPage} /><Route path="/checkout" component={ShopCheckout} /><Route path="/contact" component={PublicSiteRedirect} /><Route path="/request-a-quote" component={PublicSiteRedirect} /><Route path="/shop" component={Shop} /><Route path="/shop/cart" component={CartPage} /><Route path="/shop/checkout" component={ShopCheckout} /><Route path="/shop/:slug" component={ProductDetail} /><Route path="/:slug" component={ProductDetail} /><Route component={NotFound} /></Switch>;
  }

  if (hostname === 'admin.nexhse.co.ke') {
    return <Switch><Route path="/accept-invite" component={AdminInviteAcceptance} /><Route component={AdminWorkspaceRoute} /></Switch>;
  }

  return <Switch><Route path="/" component={Home} /><Route path="/about" component={About} /><Route path="/services" component={Services} /><Route path="/services/:slug" component={ServiceDetail} /><Route path="/shop" component={ShopEntry} /><Route path="/shop/cart" component={CartPage} /><Route path="/shop/checkout" component={ShopCheckout} /><Route path="/shop/:slug" component={ProductDetail} /><Route path="/cart" component={CartPage} /><Route path="/checkout" component={ShopCheckout} /><Route path="/admin/accept-invite" component={AdminInviteAcceptance} /><Route path="/admin" component={AdminWorkspaceRoute} /><Route path="/admin/products" component={AdminWorkspaceRoute} /><Route path="/admin/promotions" component={AdminWorkspaceRoute} /><Route path="/admin/services" component={AdminWorkspaceRoute} /><Route path="/admin/blog" component={AdminWorkspaceRoute} /><Route path="/admin/orders" component={AdminWorkspaceRoute} /><Route path="/admin/customers" component={AdminWorkspaceRoute} /><Route path="/admin/service" component={AdminWorkspaceRoute} /><Route path="/admin/users" component={AdminWorkspaceRoute} /><Route path="/training" component={Training} /><Route path="/training/:course" component={CourseDetail} /><Route path="/projects" component={Projects} /><Route path="/projects/:project" component={ProjectDetail} /><Route path="/accreditations" component={Accreditations} /><Route path="/testimonials" component={Testimonials} /><Route path="/knowledge" component={Knowledge} /><Route path="/knowledge/:article" component={ArticleDetail} /><Route path="/faqs" component={HseFaqs} /><Route path="/blog" component={DynamicBlog} /><Route path="/blog/:slug" component={DynamicBlogDetail} /><Route path="/contact" component={Contact} /><Route path="/request-a-quote" component={Quote} /><Route component={NotFound} /></Switch>;
}
function NotFound() { return <Shell><main className="mx-auto flex min-h-[65vh] max-w-3xl flex-col items-center justify-center px-5 text-center"><p className="mono-label text-[10px] text-[hsl(var(--accent))]">404 / PAGE NOT FOUND</p><h1 className="display mt-5 text-6xl text-[hsl(var(--primary))]">That route is out of scope.</h1><p className="mt-5 text-sm text-[hsl(var(--muted-foreground))]">The page you’re looking for may be coming soon.</p><Link href="/" className="focus-ring mt-8 rounded-full bg-[hsl(var(--primary))] px-6 py-3 text-sm font-bold text-white" data-testid="link-not-found-home">Return home</Link></main></Shell>; }
function Router() { const [location] = useLocation(); return <ErrorBoundary resetKey={location}><AppRouter /></ErrorBoundary>; }
export default function App() { return <QueryClientProvider client={queryClient}><TooltipProvider><SiteStoreProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><Router /></WouterRouter><Toaster /></SiteStoreProvider></TooltipProvider></QueryClientProvider>; }