import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { ArrowUpRight, Check, Download, FileText, Plus, RefreshCw, Send } from 'lucide-react';
import { Link } from 'wouter';

type Quote = {
  id: string;
  quoteNumber: string;
  clientName: string;
  company: string;
  email: string;
  phone: string;
  need: string;
  location: string;
  timeline: string;
  amount: number;
  currency: string;
  status: 'requested' | 'draft' | 'sent' | 'accepted' | 'declined' | 'expired';
  validUntil: string | null;
  createdAt: string;
};

type Invoice = {
  id: string;
  invoiceNumber: string;
  quoteId: string;
  quoteNumber: string;
  clientName: string;
  company: string;
  email: string;
  phone: string;
  description: string;
  amount: number;
  currency: string;
  status: 'issued' | 'paid' | 'overdue' | 'void';
  dueAt: string | null;
  createdAt: string;
};

type Client = { id: string; name: string; company: string; email: string; phone: string };
type QuoteDraft = { amount: string; status: Quote['status']; validUntil: string };

async function apiRequest<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { credentials: 'same-origin', cache: 'no-store', ...init });
  const result = await response.json().catch(() => null);
  if (!response.ok) throw new Error(result?.error ?? `Request failed (HTTP ${response.status})`);
  return result as T;
}

const money = (amount: number, currency = 'KES') => `${currency} ${Number(amount || 0).toLocaleString()}`;
const dateValue = (value: string | null | undefined) => value ? new Date(value).toISOString().slice(0, 10) : '';
const fieldClass = 'focus-ring mt-1 min-h-11 w-full rounded-md border border-[hsl(var(--input))] bg-white px-3 text-sm outline-none';
const statusClass = 'focus-ring min-h-10 rounded-md border border-[hsl(var(--border))] bg-white px-2 text-xs font-semibold';

function SalesPageHeader({ eyebrow, title, text, action }: { eyebrow: string; title: string; text: string; action?: ReactNode }) {
  return <header className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-[hsl(var(--border))] pb-6">
    <div><p className="mono-label text-[10px] text-[hsl(var(--accent))]">{eyebrow}</p><h1 className="mt-2 text-3xl font-bold text-[hsl(var(--primary))]">{title}</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-[hsl(var(--muted-foreground))]">{text}</p></div>
    {action}
  </header>;
}

export function QuoteRequestForm() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ need: '', organisation: '', industry: '', location: '', timeline: '', contactName: '', email: '', phone: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [reference, setReference] = useState('');
  const update = (key: keyof typeof form, value: string) => setForm(current => ({ ...current, [key]: value }));
  const valid = step === 0 ? Boolean(form.need.trim()) : step === 1 ? Boolean(form.organisation.trim() && form.industry.trim() && form.location.trim() && form.timeline.trim()) : Boolean(form.contactName.trim() && /^\S+@\S+\.\S+$/.test(form.email.trim()) && form.phone.trim());

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!valid || busy) return;
    setBusy(true);
    setError('');
    try {
      const result = await apiRequest<{ quoteNumber: string }>('/api/quotes', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(form) });
      setReference(result.quoteNumber);
    } catch (issue) {
      setError(issue instanceof Error ? issue.message : 'Unable to send your request. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return <main className="mx-auto max-w-5xl px-5 py-10 lg:px-8 lg:py-14">
    <Link href="/" className="focus-ring text-xs font-semibold text-[hsl(var(--muted-foreground))]">NexHSE Africa</Link>
    <div className="mt-7 grid gap-10 lg:grid-cols-[.8fr_1.2fr]">
      <section><p className="mono-label text-[10px] text-[hsl(var(--accent))]">REQUEST A QUOTE</p><h1 className="display mt-4 text-5xl leading-tight text-[hsl(var(--primary))]">Start with the situation.</h1><p className="mt-4 text-sm leading-6 text-[hsl(var(--muted-foreground))]">Share the need, operating context and timing. Your request will be saved to NexHSE’s quotation pipeline.</p>
        <ol className="mt-8 space-y-3">{['Service need', 'Organisation', 'Contact details'].map((label, index) => <li key={label} className={`flex items-center gap-3 text-sm ${index === step ? 'font-bold text-[hsl(var(--primary))]' : 'text-[hsl(var(--muted-foreground))]'}`}><span className={`grid h-7 w-7 place-items-center rounded-full text-xs ${index <= step ? 'bg-[hsl(var(--primary))] text-white' : 'border border-[hsl(var(--border))]'}`}>{index < step ? <Check size={14} /> : index + 1}</span>{label}</li>)}</ol>
      </section>
      <section className="border-t border-[hsl(var(--border))] pt-6 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
        {reference ? <div className="py-10"><span className="grid h-11 w-11 place-items-center rounded-full bg-[hsl(var(--secondary))] text-[hsl(var(--accent))]"><Check /></span><h2 className="mt-5 text-2xl font-bold text-[hsl(var(--primary))]">Request received</h2><p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">We’ll follow up with {form.contactName} at {form.email}.</p><p className="mt-4 text-sm font-bold text-[hsl(var(--primary))]">Reference {reference}</p></div> : <form onSubmit={submit}>
          {step === 0 && <div className="space-y-5"><h2 className="text-xl font-bold text-[hsl(var(--primary))]">What support do you need?</h2><label className="block text-sm font-semibold">Service or requirement<textarea autoFocus value={form.need} onChange={event => update('need', event.target.value)} className={`${fieldClass} min-h-32 py-3`} maxLength={2000} required /></label></div>}
          {step === 1 && <div className="space-y-5"><h2 className="text-xl font-bold text-[hsl(var(--primary))]">Tell us about the work.</h2>{([['organisation', 'Organisation name'], ['industry', 'Industry or operating context'], ['location', 'Site location'], ['timeline', 'Preferred timeline']] as const).map(([key, label]) => <label key={key} className="block text-sm font-semibold">{label}<input value={form[key]} onChange={event => update(key, event.target.value)} className={fieldClass} required /></label>)}</div>}
          {step === 2 && <div className="space-y-5"><h2 className="text-xl font-bold text-[hsl(var(--primary))]">Where should we reach you?</h2>{([['contactName', 'Your name', 'text'], ['email', 'Work email', 'email'], ['phone', 'Phone number', 'tel']] as const).map(([key, label, type]) => <label key={key} className="block text-sm font-semibold">{label}<input type={type} value={form[key]} onChange={event => update(key, event.target.value)} className={fieldClass} required /></label>)}</div>}
          {error && <p role="alert" className="mt-5 text-sm font-semibold text-[hsl(var(--destructive))]">{error}</p>}
          <div className="mt-8 flex justify-between border-t border-[hsl(var(--border))] pt-5"><button type="button" onClick={() => setStep(current => Math.max(0, current - 1))} disabled={step === 0 || busy} className="focus-ring min-h-10 rounded-md border border-[hsl(var(--border))] px-4 text-sm font-semibold disabled:invisible">Back</button>{step < 2 ? <button type="button" onClick={() => setStep(current => current + 1)} disabled={!valid} className="focus-ring min-h-10 rounded-md bg-[hsl(var(--primary))] px-5 text-sm font-bold text-white disabled:opacity-40">Continue <ArrowUpRight size={15} className="ml-1 inline" /></button> : <button type="submit" disabled={!valid || busy} className="focus-ring min-h-10 rounded-md bg-[hsl(var(--primary))] px-5 text-sm font-bold text-white disabled:opacity-40">{busy ? 'Sending…' : 'Send quote request'} <Send size={14} className="ml-1 inline" /></button>}</div>
        </form>}
      </section>
    </div>
  </main>;
}

export function AdminQuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [drafts, setDrafts] = useState<Record<string, QuoteDraft>>({});
  const [form, setForm] = useState({ clientId: '', clientName: '', company: '', email: '', phone: '', need: '', location: '', timeline: '', amount: '0', validUntil: '' });
  const [search, setSearch] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const refresh = async () => {
    const [quoteResult, clientResult] = await Promise.all([
      apiRequest<{ items: Quote[] }>('/api/admin-data?resource=quotes'),
      apiRequest<{ items: Client[] }>('/api/admin-data?resource=clients'),
    ]);
    setQuotes(quoteResult.items);
    setClients(clientResult.items);
    setDrafts(Object.fromEntries(quoteResult.items.map(quote => [quote.id, { amount: String(quote.amount), status: quote.status, validUntil: dateValue(quote.validUntil) }])));
  };
  useEffect(() => { void refresh().catch(issue => setError(issue instanceof Error ? issue.message : 'Unable to load quotes')); }, []);
  const filtered = useMemo(() => quotes.filter(quote => `${quote.quoteNumber} ${quote.clientName} ${quote.company} ${quote.email} ${quote.need}`.toLowerCase().includes(search.toLowerCase())), [quotes, search]);
  const updateForm = (key: keyof typeof form, value: string) => setForm(current => ({ ...current, [key]: value }));
  const selectClient = (id: string) => {
    const client = clients.find(item => item.id === id);
    if (client) setForm(current => ({ ...current, clientId: client.id, clientName: client.name, company: client.company, email: client.email, phone: client.phone }));
  };
  const create = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      await apiRequest('/api/admin-data?resource=quotes', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ quote: { ...form, amount: Number(form.amount), validUntil: form.validUntil || null } }) });
      setForm({ clientId: '', clientName: '', company: '', email: '', phone: '', need: '', location: '', timeline: '', amount: '0', validUntil: '' });
      await refresh();
    } catch (issue) { setError(issue instanceof Error ? issue.message : 'Unable to create quote'); }
    finally { setBusy(false); }
  };
  const save = async (quote: Quote) => {
    const draft = drafts[quote.id];
    setBusy(true);
    setError('');
    try {
      await apiRequest(`/api/admin-data?resource=quotes&id=${encodeURIComponent(quote.id)}`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ...draft, amount: Number(draft.amount), validUntil: draft.validUntil || null }) });
      await refresh();
    } catch (issue) { setError(issue instanceof Error ? issue.message : 'Unable to save quote'); }
    finally { setBusy(false); }
  };
  const issueInvoice = async (quote: Quote) => {
    setBusy(true);
    setError('');
    try {
      const draft = drafts[quote.id];
      await apiRequest(`/api/admin-data?resource=quotes&id=${encodeURIComponent(quote.id)}`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ...draft, amount: Number(draft.amount), validUntil: draft.validUntil || null }) });
      await apiRequest('/api/admin-data?resource=invoices', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ quoteId: quote.id }) });
      window.location.assign('/admin/invoices');
    } catch (issue) { setError(issue instanceof Error ? issue.message : 'Unable to issue invoice'); }
    finally { setBusy(false); }
  };
  const metrics = [
    { label: 'Requests', value: quotes.filter(item => item.status === 'requested').length },
    { label: 'Draft / sent', value: quotes.filter(item => ['draft', 'sent'].includes(item.status)).length },
    { label: 'Accepted', value: quotes.filter(item => item.status === 'accepted').length },
    { label: 'Pipeline value', value: money(quotes.filter(item => !['declined', 'expired'].includes(item.status)).reduce((sum, item) => sum + item.amount, 0)) },
  ];

  return <main className="mx-auto max-w-7xl px-5 py-9 lg:px-8">
    <SalesPageHeader eyebrow="CRM / SALES PIPELINE" title="Quotations" text="Capture requests, price the work, track decisions and convert accepted quotes into invoices." action={<Link href="/admin/customers" className="focus-ring inline-flex min-h-10 items-center gap-2 rounded-md border border-[hsl(var(--border))] px-3 text-xs font-bold">Client directory <ArrowUpRight size={14} /></Link>} />
    {error && <p role="alert" className="mb-5 text-sm font-semibold text-[hsl(var(--destructive))]">{error}</p>}
    <div className="mb-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{metrics.map(metric => <div key={metric.label} className="border-l-2 border-[hsl(var(--accent))] py-1 pl-4"><p className="mono-label text-[9px] text-[hsl(var(--muted-foreground))]">{metric.label}</p><p className="mt-2 text-2xl font-bold text-[hsl(var(--primary))]">{metric.value}</p></div>)}</div>
    <section className="grid gap-9 xl:grid-cols-[.72fr_1.28fr]">
      <form onSubmit={create} className="h-fit border-t border-[hsl(var(--border))] pt-5">
        <div className="flex items-center gap-2"><Plus size={16} className="text-[hsl(var(--accent))]" /><h2 className="text-lg font-bold text-[hsl(var(--primary))]">New quotation</h2></div>
        {clients.length > 0 && <label className="mt-5 block text-xs font-semibold">Fill from client<select defaultValue="" onChange={event => selectClient(event.target.value)} className={fieldClass}><option value="">Choose a client</option>{clients.map(client => <option key={client.id} value={client.id}>{client.company || client.name} · {client.email}</option>)}</select></label>}
        <div className="mt-4 grid gap-3 sm:grid-cols-2">{([['clientName', 'Contact name'], ['company', 'Organisation'], ['email', 'Email'], ['phone', 'Phone'], ['location', 'Site location'], ['timeline', 'Timeline']] as const).map(([key, label]) => <label key={key} className="block text-xs font-semibold">{label}<input type={key === 'email' ? 'email' : 'text'} value={form[key]} onChange={event => updateForm(key, event.target.value)} className={fieldClass} required={['clientName', 'email'].includes(key)} /></label>)}</div>
        <label className="mt-3 block text-xs font-semibold">Requested service<textarea value={form.need} onChange={event => updateForm('need', event.target.value)} className={`${fieldClass} min-h-24 py-3`} required /></label>
        <div className="mt-3 grid gap-3 sm:grid-cols-2"><label className="block text-xs font-semibold">Quoted amount (KES)<input type="number" min="0" step="1" value={form.amount} onChange={event => updateForm('amount', event.target.value)} className={fieldClass} required /></label><label className="block text-xs font-semibold">Valid until<input type="date" value={form.validUntil} onChange={event => updateForm('validUntil', event.target.value)} className={fieldClass} /></label></div>
        <button type="submit" disabled={busy} className="focus-ring mt-4 inline-flex min-h-10 items-center gap-2 rounded-md bg-[hsl(var(--primary))] px-4 text-xs font-bold text-white disabled:opacity-50">Save draft <Check size={14} /></button>
      </form>
      <section className="min-w-0 border-t border-[hsl(var(--border))] pt-5"><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-lg font-bold text-[hsl(var(--primary))]">Quote register <span className="ml-1 text-xs font-normal text-[hsl(var(--muted-foreground))]">{quotes.length}</span></h2><div className="flex items-center gap-2"><input aria-label="Search quotes" placeholder="Search client or service" value={search} onChange={event => setSearch(event.target.value)} className="focus-ring min-h-10 w-56 max-w-full rounded-md border border-[hsl(var(--input))] bg-white px-3 text-xs" /><button type="button" onClick={() => void refresh().catch(issue => setError(issue.message))} className="focus-ring grid h-10 w-10 place-items-center rounded-md border border-[hsl(var(--border))]" title="Refresh quotes"><RefreshCw size={15} /></button></div></div>
        <div className="mt-4 divide-y divide-[hsl(var(--border))]">{filtered.map(quote => {
          const draft = drafts[quote.id] ?? { amount: String(quote.amount), status: quote.status, validUntil: dateValue(quote.validUntil) };
          return <article key={quote.id} className="grid gap-4 py-5 lg:grid-cols-[minmax(0,1fr)_minmax(15rem,.8fr)]"><div><div className="flex flex-wrap items-center gap-2"><h3 className="font-bold text-[hsl(var(--primary))]">{quote.quoteNumber}</h3><span className="rounded-sm bg-[hsl(var(--secondary))] px-2 py-1 text-[10px] font-bold uppercase">{quote.status}</span></div><p className="mt-2 text-sm font-semibold">{quote.company || quote.clientName}</p><p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">{quote.clientName} · {quote.email}{quote.phone ? ` · ${quote.phone}` : ''}</p><p className="mt-3 text-sm leading-5">{quote.need}</p><p className="mt-2 text-xs text-[hsl(var(--muted-foreground))]">{quote.location} {quote.timeline && `· ${quote.timeline}`}</p><p className="mt-2 text-xs text-[hsl(var(--muted-foreground))]">Received {new Date(quote.createdAt).toLocaleDateString()}</p></div><div className="grid content-start gap-2"><label className="text-xs font-semibold">Amount (KES)<input type="number" min="0" step="1" value={draft.amount} onChange={event => setDrafts(current => ({ ...current, [quote.id]: { ...draft, amount: event.target.value } }))} className={fieldClass} /></label><label className="text-xs font-semibold">Stage<select value={draft.status} onChange={event => setDrafts(current => ({ ...current, [quote.id]: { ...draft, status: event.target.value as Quote['status'] } }))} className={fieldClass}>{['requested', 'draft', 'sent', 'accepted', 'declined', 'expired'].map(status => <option key={status} value={status}>{status[0].toUpperCase() + status.slice(1)}</option>)}</select></label><label className="text-xs font-semibold">Valid until<input type="date" value={draft.validUntil} onChange={event => setDrafts(current => ({ ...current, [quote.id]: { ...draft, validUntil: event.target.value } }))} className={fieldClass} /></label><div className="flex flex-wrap gap-2"><button type="button" onClick={() => void save(quote)} disabled={busy} className="focus-ring min-h-9 rounded-md bg-[hsl(var(--primary))] px-3 text-xs font-bold text-white disabled:opacity-50">Save</button>{draft.status === 'accepted' && Number(draft.amount) > 0 && <button type="button" onClick={() => void issueInvoice({ ...quote, amount: Number(draft.amount) })} disabled={busy} className="focus-ring inline-flex min-h-9 items-center gap-1 rounded-md border border-[hsl(var(--border))] px-3 text-xs font-bold">Invoice <ArrowUpRight size={13} /></button>}</div></div></article>;
        })}{filtered.length === 0 && <p className="py-10 text-sm text-[hsl(var(--muted-foreground))]">No quotations match this search.</p>}</div>
      </section>
    </section>
  </main>;
}

export function AdminInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [selectedQuote, setSelectedQuote] = useState('');
  const [dueAt, setDueAt] = useState(() => new Date(Date.now() + 30 * 86_400_000).toISOString().slice(0, 10));
  const [drafts, setDrafts] = useState<Record<string, { status: Invoice['status']; dueAt: string }>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const refresh = async () => {
    const [invoiceResult, quoteResult] = await Promise.all([
      apiRequest<{ items: Invoice[] }>('/api/admin-data?resource=invoices'),
      apiRequest<{ items: Quote[] }>('/api/admin-data?resource=quotes'),
    ]);
    setInvoices(invoiceResult.items);
    setQuotes(quoteResult.items);
    setDrafts(Object.fromEntries(invoiceResult.items.map(invoice => [invoice.id, { status: invoice.status, dueAt: dateValue(invoice.dueAt) }])));
  };
  useEffect(() => { void refresh().catch(issue => setError(issue instanceof Error ? issue.message : 'Unable to load invoices')); }, []);
  const unbilledQuotes = useMemo(() => quotes.filter(quote => quote.status === 'accepted' && quote.amount > 0 && !invoices.some(invoice => invoice.quoteId === quote.id)), [quotes, invoices]);
  const create = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      await apiRequest('/api/admin-data?resource=invoices', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ quoteId: selectedQuote, dueAt: dueAt || null }) });
      setSelectedQuote('');
      await refresh();
    } catch (issue) { setError(issue instanceof Error ? issue.message : 'Unable to issue invoice'); }
    finally { setBusy(false); }
  };
  const save = async (invoice: Invoice) => {
    const draft = drafts[invoice.id];
    setBusy(true);
    setError('');
    try {
      await apiRequest(`/api/admin-data?resource=invoices&id=${encodeURIComponent(invoice.id)}`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ...draft, dueAt: draft.dueAt || null }) });
      await refresh();
    } catch (issue) { setError(issue instanceof Error ? issue.message : 'Unable to update invoice'); }
    finally { setBusy(false); }
  };
  const print = (id: string) => {
    document.body.classList.add('printing-invoice');
    const invoice = invoices.find(item => item.id === id);
    const target = invoice ? [...document.querySelectorAll('article')].find(article => article.textContent?.includes(invoice.invoiceNumber)) : null;
    target?.classList.add('invoice-print-target');
    const clear = () => { document.body.classList.remove('printing-invoice'); target?.classList.remove('invoice-print-target'); };
    window.addEventListener('afterprint', clear, { once: true });
    window.requestAnimationFrame(() => window.print());
    window.setTimeout(clear, 1500);
  };

  return <main className="mx-auto max-w-7xl px-5 py-9 lg:px-8">
    <SalesPageHeader eyebrow="CRM / ACCOUNTS RECEIVABLE" title="Invoices" text="Issue invoices from accepted quotations, track due dates and payment state, and print a client-ready copy." action={<Link href="/admin/quotes" className="focus-ring inline-flex min-h-10 items-center gap-2 rounded-md border border-[hsl(var(--border))] px-3 text-xs font-bold">Quote pipeline <ArrowUpRight size={14} /></Link>} />
    {error && <p role="alert" className="mb-5 text-sm font-semibold text-[hsl(var(--destructive))]">{error}</p>}
    <form onSubmit={create} className="mb-8 grid gap-3 border-b border-[hsl(var(--border))] pb-7 sm:grid-cols-[minmax(0,1fr)_12rem_auto] sm:items-end"><label className="text-xs font-semibold">Accepted quotation<select value={selectedQuote} onChange={event => setSelectedQuote(event.target.value)} className={fieldClass} required><option value="">Select quote</option>{unbilledQuotes.map(quote => <option key={quote.id} value={quote.id}>{quote.quoteNumber} · {quote.company || quote.clientName} · {money(quote.amount)}</option>)}</select></label><label className="text-xs font-semibold">Due date<input type="date" value={dueAt} onChange={event => setDueAt(event.target.value)} className={fieldClass} /></label><button type="submit" disabled={!selectedQuote || busy} className="focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[hsl(var(--primary))] px-4 text-xs font-bold text-white disabled:opacity-40">Issue invoice <FileText size={14} /></button></form>
    <div className="divide-y divide-[hsl(var(--border))]">{invoices.map(invoice => {
      const draft = drafts[invoice.id] ?? { status: invoice.status, dueAt: dateValue(invoice.dueAt) };
      return <article key={invoice.id} className={`grid gap-6 py-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(14rem,.8fr)] ${document.body.classList.contains('printing-invoice') ? 'invoice-print-target' : ''}`}><div><div className="flex flex-wrap items-center gap-2"><h2 className="text-lg font-bold text-[hsl(var(--primary))]">{invoice.invoiceNumber}</h2><span className="rounded-sm bg-[hsl(var(--secondary))] px-2 py-1 text-[10px] font-bold uppercase">{invoice.status}</span></div><p className="mt-2 text-sm font-semibold">{invoice.company || invoice.clientName}</p><p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">{invoice.clientName} · {invoice.email}{invoice.phone ? ` · ${invoice.phone}` : ''}</p><p className="mt-4 text-sm">{invoice.description}</p><p className="mt-4 text-xs text-[hsl(var(--muted-foreground))]">Quote {invoice.quoteNumber} · Issued {new Date(invoice.createdAt).toLocaleDateString()} · Due {invoice.dueAt ? new Date(invoice.dueAt).toLocaleDateString() : 'Not set'}</p><div className="mt-5 border-t border-[hsl(var(--border))] pt-4"><p className="text-xs font-semibold uppercase text-[hsl(var(--muted-foreground))]">Amount due</p><p className="mt-1 text-2xl font-bold text-[hsl(var(--primary))]">{money(invoice.amount, invoice.currency)}</p></div></div><div className="grid content-start gap-3"><label className="text-xs font-semibold">Payment status<select value={draft.status} onChange={event => setDrafts(current => ({ ...current, [invoice.id]: { ...draft, status: event.target.value as Invoice['status'] } }))} className={fieldClass}>{['issued', 'paid', 'overdue', 'void'].map(status => <option key={status} value={status}>{status[0].toUpperCase() + status.slice(1)}</option>)}</select></label><label className="text-xs font-semibold">Due date<input type="date" value={draft.dueAt} onChange={event => setDrafts(current => ({ ...current, [invoice.id]: { ...draft, dueAt: event.target.value } }))} className={fieldClass} /></label><div className="flex gap-2"><button type="button" onClick={() => void save(invoice)} disabled={busy} className="focus-ring min-h-9 rounded-md bg-[hsl(var(--primary))] px-3 text-xs font-bold text-white disabled:opacity-50">Save</button><button type="button" onClick={() => print(invoice.id)} className="focus-ring inline-flex min-h-9 items-center gap-2 rounded-md border border-[hsl(var(--border))] px-3 text-xs font-bold"><Download size={13} /> Print / PDF</button></div></div></article>;
    })}{invoices.length === 0 && <p className="py-12 text-sm text-[hsl(var(--muted-foreground))]">No invoices yet. Accept a priced quote, then issue an invoice from it.</p>}</div>
  </main>;
}
