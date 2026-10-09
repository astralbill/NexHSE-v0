import { randomUUID } from 'node:crypto';
import { addOrderEvent, addServiceTicketFollowup, cancelShopOrderAndRestock, createInvoice, createQuote, deleteShopProduct, deleteShopPromotion, disableService, findClientByEmail, findClientById, findInvoiceById, findInvoiceByQuoteId, findQuoteById, findShopOrder, findShopProductBySku, findShopPromotionByCode, listBlogPosts, listClientsForUser, listClientsWithOrderSummary, listInvoicesForUser, listOrderEvents, listQuotesForUser, listServices, listServiceTicketFollowups, listServiceTickets, listShopOrders, listShopOrdersForEmails, listShopProducts, listShopPromotions, readSiteStoreValue, seedClientsFromOrders, updateClient, updateInvoice, updateQuote, updateServiceTicketWorkflow, updateShopOrderWorkflow, upsertBlogPost, upsertClient, upsertService, upsertServices, upsertServiceTicket, upsertShopOrder, upsertShopProduct, upsertShopPromotion, writeSiteStoreValue } from '@workspace/db';
import * as schema from '@workspace/db/schema';
import { getActiveAdminSession, isTrustedOrigin } from '../lib/api/admin-session.js';

const slugify = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
const stringArray = (value: unknown) => Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string').slice(0, 100) : [];
const validText = (value: unknown, max = 1000) => typeof value === 'string' && value.trim().length > 0 && value.length <= max;
const promotionIsActive = (promotion: typeof schema.shopPromotionsTable.$inferSelect, now = new Date()) => promotion.active && (!promotion.startsAt || promotion.startsAt <= now) && (!promotion.endsAt || promotion.endsAt > now) && (promotion.usageLimit === null || promotion.usageCount < promotion.usageLimit);
const discountFor = (amount: number, promotion: typeof schema.shopPromotionsTable.$inferSelect) => promotion.discountType === 'percentage' ? Math.floor(amount * promotion.discountValue / 100) : Math.min(amount, promotion.discountValue);

function toOrder(row: typeof schema.shopOrdersTable.$inferSelect) {
  return {
    ...row,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    expectedDeliveryAt: row.expectedDeliveryAt?.toISOString() ?? null,
    lastContactAt: row.lastContactAt?.toISOString() ?? null,
    delivery: { name: row.customerName, email: row.email, phone: row.phone, address: row.address, county: row.county, notes: row.notes ?? '' },
  };
}

async function canAccessOrder(session: { userId: string; role: string }, order: typeof schema.shopOrdersTable.$inferSelect) {
  if (session.role === 'owner') return true;
  const client = await findClientByEmail(order.email);
  return client?.createdBy === session.userId;
}

export default async function handler(req: any, res: any) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'OPTIONS') return res.status(204).end();
  const resource = String(req.query?.resource ?? '');
  const id = String(req.query?.id ?? '');
  const session = await getActiveAdminSession(req);

  try {
    if (req.method === 'GET' && resource === 'products') {
      let [products, allPromotions] = await Promise.all([listShopProducts(), listShopPromotions()]);
      if (!products.length) {
        const legacy = await readSiteStoreValue('nexhse-shop-products');
        if (Array.isArray(legacy)) {
          for (const product of legacy) {
            if (!product || typeof product.name !== 'string') continue;
            const slug = slugify(product.name);
            await upsertShopProduct({
              id: slug,
              sku: typeof product.sku === 'string' && product.sku.trim() ? product.sku.trim().toUpperCase() : `NX-${slug.toUpperCase()}`,
              name: product.name,
              category: product.category ?? 'PPE',
              price: Number(product.price) || 0,
              stock: Number(product.stock) || 0,
              image: product.image ?? '',
              imageBackground: product.imageBackground ?? '#ffffff',
              description: product.description ?? '',
              longDescription: product.longDescription ?? product.description ?? '',
              seoTitle: product.seoTitle ?? product.name,
              seoDescription: product.seoDescription ?? product.description ?? '',
              keywords: stringArray(product.keywords),
              features: stringArray(product.features),
              useCases: stringArray(product.useCases),
              brand: product.brand ?? 'NexHSE Africa',
              condition: product.condition ?? 'New',
              active: true,
            });
          }
          products = await listShopProducts();
        }
      }
      const promotions = allPromotions.filter(promotion => promotionIsActive(promotion));
      const items = products.filter(product => product.active).map(product => {
        const matching = promotions.filter(promotion => !promotion.productIds.length || promotion.productIds.includes(product.id))
          .map(promotion => ({ promotion, discount: discountFor(product.price, promotion) }))
          .sort((left, right) => right.discount - left.discount)[0];
        return { ...product, basePrice: product.price, price: product.price - (matching?.discount ?? 0), promotionName: matching?.promotion.name ?? null, promotionCode: matching?.promotion.code ?? null };
      });
      res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
      return res.status(200).json({ items, hiddenIds: products.filter(product => !product.active).map(product => product.id) });
    }

    if (req.method === 'GET' && resource === 'services') {
      const items = await listServices(Boolean(session));
      if (!session) res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
      return res.status(200).json({ items });
    }

    if (req.method === 'GET' && resource === 'promotions') {
      const promotions = await listShopPromotions();
      const items = session?.role === 'owner' ? promotions : promotions.filter(promotion => promotionIsActive(promotion));
      if (session?.role !== 'owner') res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
      return res.status(200).json({ items });
    }

    if (req.method === 'GET' && resource === 'blog') {
      const posts = await listBlogPosts();
      const items = posts.filter(post => post.published || Boolean(session)).map(post => ({
        ...post,
        body: post.body.split(/\n\n+/).map(paragraph => paragraph.trim()).filter(Boolean),
        read: post.readTime,
      }));
      return res.status(200).json({ items });
    }

    if (req.method === 'GET' && resource === 'orders' && id) {
      if (!session) return res.status(401).json({ error: 'Admin session required' });
      const order = await findShopOrder(id);
      if (!order) return res.status(404).json({ error: 'Order not found' });
      if (!await canAccessOrder(session, order)) return res.status(403).json({ error: 'Client access required' });
      const events = await listOrderEvents(id);
      return res.status(200).json({ events });
    }

    if (req.method === 'GET' && resource === 'tickets' && id) {
      if (!session) return res.status(401).json({ error: 'Admin session required' });
      return res.status(200).json({ followups: await listServiceTicketFollowups(id) });
    }

    if (req.method === 'GET' && resource === 'orders') {
      if (!session) return res.status(401).json({ error: 'Admin session required' });
      const migrated = await readSiteStoreValue('nexhse-orders-normalized-v1');
      if (!migrated) {
        const dbOrders = await listShopOrders();
        const legacyOrders = await readSiteStoreValue('nexhse-shop-orders');
        if (Array.isArray(legacyOrders)) {
          const existingIds = new Set(dbOrders.map(order => order.id));
        for (const order of legacyOrders) {
          if (!order?.id || !order.delivery?.email || existingIds.has(order.id)) continue;
          await upsertShopOrder({ id: order.id, customerName: order.delivery.name ?? '', email: order.delivery.email, phone: order.delivery.phone ?? '', address: order.delivery.address ?? '', county: order.delivery.county ?? '', notes: order.delivery.notes ?? null, paymentMethod: order.paymentMethod ?? 'Pay on delivery', paymentStatus: order.paymentStatus ?? 'pending', orderStatus: order.orderStatus ?? 'received', subtotal: Number(order.subtotal) || 0, deliveryFee: Number(order.deliveryFee) || 0, total: Number(order.total) || 0, items: Array.isArray(order.items) ? order.items : [], createdAt: order.createdAt ? new Date(order.createdAt) : new Date() });
        }
        }
        await writeSiteStoreValue('nexhse-orders-normalized-v1', true);
      }
      let dbOrders = await listShopOrders();
      if (session.role !== 'owner') {
        const ownedClients = await listClientsForUser(session.userId);
        const emails = new Set(ownedClients.map(client => client.email.toLowerCase()));
        dbOrders = await listShopOrdersForEmails([...emails]);
      }
      if (dbOrders.length || session.role !== 'owner') return res.status(200).json({ items: dbOrders.map(toOrder) });
      return res.status(200).json({ items: await readSiteStoreValue('nexhse-shop-orders') ?? [] });
    }

    if (req.method === 'GET' && resource === 'clients') {
      if (!session) return res.status(401).json({ error: 'Admin session required' });
      const migrated = await readSiteStoreValue('nexhse-clients-normalized-v1');
      if (!migrated) {
        const orders = await listShopOrders();
        const historicalClients = new Map(orders.filter(order => order.email.trim()).map(order => [order.email.trim().toLowerCase(), { id: randomUUID(), email: order.email.trim().toLowerCase(), name: order.customerName, phone: order.phone, createdBy: 'owner' }]));
        await seedClientsFromOrders([...historicalClients.values()]);
        await writeSiteStoreValue('nexhse-clients-normalized-v1', true);
      }
      const items = await listClientsWithOrderSummary(session.userId, session.role === 'owner');
      return res.status(200).json({ items });
    }

    if (req.method === 'GET' && resource === 'quotes') {
      if (!session) return res.status(401).json({ error: 'Admin session required' });
      return res.status(200).json({ items: await listQuotesForUser(session.userId, session.role === 'owner') });
    }

    if (req.method === 'GET' && resource === 'invoices') {
      if (!session) return res.status(401).json({ error: 'Admin session required' });
      return res.status(200).json({ items: await listInvoicesForUser(session.userId, session.role === 'owner') });
    }

    if (req.method === 'GET' && resource === 'tickets') {
      if (!session) return res.status(401).json({ error: 'Admin session required' });
      let tickets = await listServiceTickets();
      const legacyTickets = await readSiteStoreValue('nexhse-service-tickets');
      if (Array.isArray(legacyTickets)) {
        const existingIds = new Set(tickets.map(ticket => ticket.id));
        for (const ticket of legacyTickets) {
          if (!ticket?.id || !ticket.email || existingIds.has(ticket.id)) continue;
          await upsertServiceTicket({ id: ticket.id, name: ticket.name ?? '', email: ticket.email, subject: ticket.subject ?? '', details: ticket.details ?? '', priority: ticket.priority === 'urgent' ? 'urgent' : 'normal', status: ticket.status ?? 'open' });
        }
        tickets = await listServiceTickets();
      }
      return res.status(200).json({ items: tickets });
    }

    if (!isTrustedOrigin(req)) return res.status(403).json({ error: 'Untrusted origin' });
    if (!session) return res.status(401).json({ error: 'Admin session required' });
    if (session.role !== 'owner' && ['products', 'services', 'blog', 'promotions'].includes(resource)) return res.status(403).json({ error: 'Super admin role required' });

    if (resource === 'clients' && req.method === 'POST') {
      const client = req.body?.client;
      if (!client || !validText(client.name, 180) || typeof client.email !== 'string' || !/^\S+@\S+\.\S+$/.test(client.email.trim())) return res.status(400).json({ error: 'A valid client name and email are required' });
      const email = client.email.trim().toLowerCase();
      const existing = await findClientByEmail(email);
      if (existing && existing.createdBy !== session.userId && existing.createdBy !== 'owner' && session.role !== 'owner') return res.status(409).json({ error: 'This client already belongs to another account' });
      const id = existing?.id ?? randomUUID();
      await upsertClient({ id, email, name: client.name.trim(), phone: typeof client.phone === 'string' ? client.phone.trim() : '', company: typeof client.company === 'string' ? client.company.trim() : '', industry: typeof client.industry === 'string' ? client.industry.trim() : '', location: typeof client.location === 'string' ? client.location.trim() : '', notes: typeof client.notes === 'string' ? client.notes.trim() : '', createdBy: existing?.createdBy ?? session.userId });
      if (existing?.createdBy === 'owner' && session.role !== 'owner') await updateClient(id, { createdBy: session.userId });
      return res.status(201).json({ id });
    }

    if (resource === 'clients' && req.method === 'PATCH') {
      if (!id) return res.status(400).json({ error: 'Client id is required' });
      const client = await findClientById(id);
      if (!client) return res.status(404).json({ error: 'Client not found' });
      if (client.createdBy !== session.userId && session.role !== 'owner') return res.status(403).json({ error: 'Client access required' });
      const { name, phone, company, industry, location, notes } = req.body ?? {};
      if (name !== undefined && !validText(name, 180)) return res.status(400).json({ error: 'Invalid client name' });
      await updateClient(id, { ...(typeof name === 'string' ? { name: name.trim() } : {}), ...(typeof phone === 'string' ? { phone: phone.trim() } : {}), ...(typeof company === 'string' ? { company: company.trim() } : {}), ...(typeof industry === 'string' ? { industry: industry.trim() } : {}), ...(typeof location === 'string' ? { location: location.trim() } : {}), ...(typeof notes === 'string' ? { notes: notes.trim() } : {}) });
      return res.status(200).json({ updated: true });
    }

    if (resource === 'quotes' && req.method === 'POST') {
      const quote = req.body?.quote;
      if (!quote || !validText(quote.clientName, 180) || typeof quote.email !== 'string' || !/^\S+@\S+\.\S+$/.test(quote.email.trim()) || !validText(quote.need, 2000)) {
        return res.status(400).json({ error: 'A valid client name, email, and requested service are required' });
      }
      const amount = Number(quote.amount ?? 0);
      if (!Number.isSafeInteger(amount) || amount < 0) return res.status(400).json({ error: 'Quote amount must be a non-negative whole KES amount' });
      const quoteId = randomUUID();
      const year = new Date().getFullYear();
      const item = await createQuote({
        id: quoteId,
        quoteNumber: `NQ-${year}-${quoteId.slice(0, 8).toUpperCase()}`,
        clientId: typeof quote.clientId === 'string' ? quote.clientId : null,
        clientName: quote.clientName.trim(),
        company: typeof quote.company === 'string' ? quote.company.trim() : '',
        email: quote.email.trim().toLowerCase(),
        phone: typeof quote.phone === 'string' ? quote.phone.trim() : '',
        need: quote.need.trim(),
        location: typeof quote.location === 'string' ? quote.location.trim() : '',
        timeline: typeof quote.timeline === 'string' ? quote.timeline.trim() : '',
        amount,
        currency: 'KES',
        status: 'draft',
        validUntil: quote.validUntil ? new Date(quote.validUntil) : null,
        createdBy: session.userId,
      });
      return res.status(201).json({ item });
    }

    if (resource === 'quotes' && req.method === 'PATCH') {
      if (!id) return res.status(400).json({ error: 'Quote id is required' });
      const current = await findQuoteById(id);
      if (!current) return res.status(404).json({ error: 'Quote not found' });
      if (current.createdBy !== session.userId && session.role !== 'owner') return res.status(403).json({ error: 'Quote access required' });
      const { amount, status, validUntil } = req.body ?? {};
      const statuses = ['requested', 'draft', 'sent', 'accepted', 'declined', 'expired'];
      if (status !== undefined && !statuses.includes(status)) return res.status(400).json({ error: 'Invalid quote status' });
      if (amount !== undefined && (!Number.isSafeInteger(Number(amount)) || Number(amount) < 0)) return res.status(400).json({ error: 'Quote amount must be a non-negative whole KES amount' });
      const updated = await updateQuote(id, { ...(amount !== undefined ? { amount: Number(amount) } : {}), ...(status ? { status } : {}), ...(validUntil !== undefined ? { validUntil: validUntil ? new Date(validUntil) : null } : {}) });
      return res.status(200).json({ item: updated });
    }

    if (resource === 'invoices' && req.method === 'POST') {
      const { quoteId, dueAt } = req.body ?? {};
      if (typeof quoteId !== 'string' || !quoteId) return res.status(400).json({ error: 'An accepted quote is required to issue an invoice' });
      const quote = await findQuoteById(quoteId);
      if (!quote) return res.status(404).json({ error: 'Quote not found' });
      if (quote.createdBy !== session.userId && session.role !== 'owner') return res.status(403).json({ error: 'Quote access required' });
      if (quote.status !== 'accepted' || quote.amount < 1) return res.status(409).json({ error: 'Only an accepted, priced quote can be invoiced' });
      if (await findInvoiceByQuoteId(quote.id)) return res.status(409).json({ error: 'An invoice already exists for this quote' });
      const invoiceId = randomUUID();
      const now = new Date();
      const dueDate = dueAt ? new Date(dueAt) : new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      if (!Number.isFinite(dueDate.getTime())) return res.status(400).json({ error: 'Invoice due date is invalid' });
      const item = await createInvoice({
        id: invoiceId,
        invoiceNumber: `NXI-${now.getFullYear()}-${invoiceId.slice(0, 8).toUpperCase()}`,
        quoteId: quote.id,
        quoteNumber: quote.quoteNumber,
        clientId: quote.clientId,
        clientName: quote.clientName,
        company: quote.company,
        email: quote.email,
        phone: quote.phone,
        description: quote.need,
        amount: quote.amount,
        currency: quote.currency,
        status: 'issued',
        dueAt: dueDate,
        createdBy: session.userId,
      });
      return res.status(201).json({ item });
    }

    if (resource === 'invoices' && req.method === 'PATCH') {
      if (!id) return res.status(400).json({ error: 'Invoice id is required' });
      const current = await findInvoiceById(id);
      if (!current) return res.status(404).json({ error: 'Invoice not found' });
      if (current.createdBy !== session.userId && session.role !== 'owner') return res.status(403).json({ error: 'Invoice access required' });
      const { status, dueAt } = req.body ?? {};
      if (status !== undefined && !['issued', 'paid', 'overdue', 'void'].includes(status)) return res.status(400).json({ error: 'Invalid invoice status' });
      const updated = await updateInvoice(id, { ...(status ? { status } : {}), ...(dueAt !== undefined ? { dueAt: dueAt ? new Date(dueAt) : null } : {}) });
      return res.status(200).json({ item: updated });
    }

    if (resource === 'products' && ['POST', 'PUT'].includes(req.method)) {
      const product = req.body?.product;
      if (!product || !validText(product.name, 180) || !validText(product.category, 100) || !Number.isInteger(Number(product.price)) || Number(product.price) < 0 || !Number.isInteger(Number(product.stock)) || Number(product.stock) < 0) return res.status(400).json({ error: 'Invalid product fields' });
      const id = typeof product.id === 'string' ? slugify(product.id) : slugify(product.name);
      const sku = typeof product.sku === 'string' && product.sku.trim() ? product.sku.trim().toUpperCase() : `NX-${id.toUpperCase()}`;
      if (!/^[A-Z0-9_-]{2,80}$/.test(sku)) return res.status(400).json({ error: 'SKU must use letters, numbers, dash, or underscore' });
      if (await findShopProductBySku(sku, id)) return res.status(409).json({ error: 'SKU is already assigned to another product' });
      const record = {
        id,
        sku,
        name: product.name.trim(),
        category: product.category.trim(),
        price: Number(product.price),
        stock: Number(product.stock),
        image: typeof product.image === 'string' ? product.image : '',
        imageBackground: typeof product.imageBackground === 'string' ? product.imageBackground : '#ffffff',
        description: typeof product.description === 'string' ? product.description : '',
        longDescription: typeof product.longDescription === 'string' ? product.longDescription : '',
        seoTitle: typeof product.seoTitle === 'string' ? product.seoTitle : product.name,
        seoDescription: typeof product.seoDescription === 'string' ? product.seoDescription : product.description ?? '',
        keywords: stringArray(product.keywords),
        features: stringArray(product.features),
        useCases: stringArray(product.useCases),
        brand: typeof product.brand === 'string' ? product.brand : 'NexHSE Africa',
        condition: typeof product.condition === 'string' ? product.condition : 'New',
        active: product.active !== false,
      };
      await upsertShopProduct(record);
      const legacy = await readSiteStoreValue('nexhse-shop-products');
      const products = Array.isArray(legacy) ? legacy.filter(item => item.name !== record.name && item.id !== id) : [];
      await writeSiteStoreValue('nexhse-shop-products', [...products, record]);
      return res.status(200).json({ item: record });
    }

    if (resource === 'products' && req.method === 'DELETE') {
      if (!id) return res.status(400).json({ error: 'Product id is required' });
      const productId = slugify(id);
      const existing = (await listShopProducts()).find(product => product.id === productId);
      if (existing) {
        await upsertShopProduct({ ...existing, active: false });
      } else {
        const product = req.body?.product;
        if (!product || !validText(product.name, 180) || !validText(product.category, 100)) return res.status(404).json({ error: 'Product not found' });
        await upsertShopProduct({
          id: productId,
          sku: typeof product.sku === 'string' && product.sku.trim() ? product.sku.trim().toUpperCase() : `NX-${productId.toUpperCase()}`,
          name: product.name.trim(),
          category: product.category.trim(),
          price: Number.isInteger(Number(product.price)) && Number(product.price) >= 0 ? Number(product.price) : 0,
          stock: Number.isInteger(Number(product.stock)) && Number(product.stock) >= 0 ? Number(product.stock) : 0,
          image: typeof product.image === 'string' ? product.image : '',
          imageBackground: typeof product.imageBackground === 'string' ? product.imageBackground : '#ffffff',
          description: typeof product.description === 'string' ? product.description : '',
          longDescription: typeof product.longDescription === 'string' ? product.longDescription : '',
          seoTitle: typeof product.seoTitle === 'string' ? product.seoTitle : product.name.trim(),
          seoDescription: typeof product.seoDescription === 'string' ? product.seoDescription : '',
          keywords: stringArray(product.keywords),
          features: stringArray(product.features),
          useCases: stringArray(product.useCases),
          brand: typeof product.brand === 'string' ? product.brand : 'NexHSE Africa',
          condition: typeof product.condition === 'string' ? product.condition : 'New',
          active: false,
        });
      }
      const legacy = await readSiteStoreValue('nexhse-shop-products');
      if (Array.isArray(legacy)) await writeSiteStoreValue('nexhse-shop-products', legacy.filter(item => slugify(item.id ?? item.name ?? '') !== slugify(id)));
      return res.status(200).json({ deleted: true });
    }

    if (resource === 'services' && ['POST', 'PUT'].includes(req.method)) {
      const services = Array.isArray(req.body?.services) ? req.body.services : [req.body?.service];
      if (!services.length || services.length > 100 || services.some((service: any) => !service || !validText(service.title, 180) || !validText(service.short, 2000) || !validText(service.type, 100))) return res.status(400).json({ error: 'Invalid service fields' });
      const records = services.map((service: any) => {
        const slug = slugify(typeof service.slug === 'string' ? service.slug : service.title);
        return { id: typeof service.id === 'string' ? service.id : slug, slug, number: typeof service.number === 'string' ? service.number : '00', title: service.title.trim(), short: service.short.trim(), outcome: typeof service.outcome === 'string' ? service.outcome : '', type: service.type.trim(), image: typeof service.image === 'string' ? service.image : '', group: typeof service.group === 'string' ? service.group : service.type, active: service.active !== false };
      });
      await upsertServices(records);
      return res.status(200).json({ saved: true, count: records.length });
    }

    if (resource === 'promotions' && ['POST', 'PUT'].includes(req.method)) {
      const promotion = req.body?.promotion;
      if (!promotion || !validText(promotion.code, 40) || !validText(promotion.name, 180) || !['percentage', 'fixed'].includes(promotion.discountType) || !Number.isInteger(promotion.discountValue) || promotion.discountValue <= 0 || (promotion.discountType === 'percentage' && promotion.discountValue > 100)) return res.status(400).json({ error: 'Invalid promotion. Use a valid code and a percentage (1-100) or fixed KES discount.' });
      const code = promotion.code.trim().toUpperCase();
      if (!/^[A-Z0-9_-]{3,40}$/.test(code)) return res.status(400).json({ error: 'Promotion code must be 3-40 letters, numbers, dashes, or underscores' });
      const promotionId = typeof promotion.id === 'string' ? promotion.id : randomUUID();
      const existingCode = await findShopPromotionByCode(code);
      if (existingCode && existingCode.id !== promotionId) return res.status(409).json({ error: 'Promotion code is already in use' });
      await upsertShopPromotion({ id: promotionId, code, name: promotion.name.trim(), description: typeof promotion.description === 'string' ? promotion.description.trim() : '', discountType: promotion.discountType, discountValue: promotion.discountValue, productIds: stringArray(promotion.productIds), startsAt: promotion.startsAt ? new Date(promotion.startsAt) : null, endsAt: promotion.endsAt ? new Date(promotion.endsAt) : null, usageLimit: Number.isInteger(promotion.usageLimit) && promotion.usageLimit > 0 ? promotion.usageLimit : null, usageCount: Number.isInteger(promotion.usageCount) ? promotion.usageCount : 0, active: promotion.active !== false });
      return res.status(200).json({ id: promotionId, code });
    }

    if (resource === 'promotions' && req.method === 'DELETE') {
      if (!id) return res.status(400).json({ error: 'Promotion id is required' });
      await deleteShopPromotion(id);
      return res.status(200).json({ deleted: true });
    }

    if (resource === 'blog' && ['POST', 'PUT'].includes(req.method)) {
      const post = req.body?.post;
      if (!post || !validText(post.title, 240) || !validText(post.category, 120) || !validText(post.excerpt, 2000) || !validText(post.image, 2000)) return res.status(400).json({ error: 'Invalid blog post fields' });
      const slug = slugify(typeof post.slug === 'string' ? post.slug : post.title);
      const body = Array.isArray(post.body) ? post.body.filter((paragraph: unknown) => typeof paragraph === 'string' && paragraph.trim()).join('\n\n') : typeof post.body === 'string' ? post.body : '';
      if (!body.trim() || body.length > 100_000) return res.status(400).json({ error: 'Blog post content is required and must be under 100 KB' });
      await upsertBlogPost({ id: typeof post.id === 'string' ? post.id : slug, slug, title: post.title.trim(), category: post.category.trim(), excerpt: post.excerpt.trim(), body, image: post.image, date: typeof post.date === 'string' ? post.date : new Date().toISOString().slice(0, 10), readTime: typeof post.readTime === 'string' ? post.readTime : typeof post.read === 'string' ? post.read : '5 min read', published: post.published !== false });
      return res.status(200).json({ saved: true, slug });
    }

    if (resource === 'services' && req.method === 'DELETE') {
      if (!id) return res.status(400).json({ error: 'Service id is required' });
      const service = req.body?.service;
      if (service && validText(service.title, 180) && validText(service.short, 2000) && validText(service.type, 100)) {
        const slug = slugify(service.slug ?? service.title);
        await upsertService({ id, slug, number: service.number ?? '00', title: service.title.trim(), short: service.short.trim(), outcome: service.outcome ?? '', type: service.type.trim(), image: service.image ?? '', group: service.group ?? service.type, active: false });
      } else {
        await disableService(id);
      }
      return res.status(200).json({ deleted: true });
    }

    if (resource === 'orders' && req.method === 'PATCH') {
      if (!id) return res.status(400).json({ error: 'Order id is required' });
      const { orderStatus, paymentStatus, trackingNumber, carrier, expectedDeliveryAt, note } = req.body ?? {};
      const allowedStatuses = ['received', 'processing', 'ready for dispatch', 'dispatched', 'completed', 'cancelled'];
      const allowedPayments = ['pending', 'awaiting confirmation', 'paid', 'failed', 'refunded'];
      if ((orderStatus !== undefined && !allowedStatuses.includes(orderStatus)) || (paymentStatus !== undefined && !allowedPayments.includes(paymentStatus))) return res.status(400).json({ error: 'Invalid order or payment status' });
      const current = await findShopOrder(id);
      if (!current) return res.status(404).json({ error: 'Order not found' });
      if (!await canAccessOrder(session, current)) return res.status(403).json({ error: 'Client access required' });
      if (current.orderStatus === 'cancelled' && orderStatus && orderStatus !== 'cancelled') return res.status(409).json({ error: 'Cancelled orders cannot be reopened' });
      const update = {
        ...(orderStatus ? { orderStatus } : {}),
        ...(paymentStatus ? { paymentStatus } : {}),
        ...(typeof trackingNumber === 'string' ? { trackingNumber: trackingNumber.trim() || null } : {}),
        ...(typeof carrier === 'string' ? { carrier: carrier.trim() || null } : {}),
        ...(expectedDeliveryAt ? { expectedDeliveryAt: new Date(expectedDeliveryAt) } : {}),
        ...(note ? { lastContactAt: new Date() } : {}),
        updatedAt: new Date(),
      };
      const updated = orderStatus === 'cancelled' ? await cancelShopOrderAndRestock(id, session.userId, typeof note === 'string' ? note : '') : await updateShopOrderWorkflow(id, update);
      if (orderStatus !== 'cancelled' && (orderStatus || paymentStatus || trackingNumber || carrier || note)) {
        await addOrderEvent({ id: randomUUID(), orderId: id, eventType: note ? 'follow-up' : 'status-update', status: orderStatus ?? current.orderStatus, note: typeof note === 'string' ? note.slice(0, 2000) : '', trackingNumber: trackingNumber ?? current.trackingNumber, carrier: carrier ?? current.carrier, createdBy: session.userId });
      }
      const existing = await readSiteStoreValue('nexhse-shop-orders');
      if (Array.isArray(existing)) await writeSiteStoreValue('nexhse-shop-orders', existing.map(order => order.id === id ? { ...order, ...req.body, updatedAt: new Date().toISOString() } : order));
      return res.status(200).json({ item: updated ? toOrder(updated) : null });
    }

    if (resource === 'tickets' && ['POST', 'PUT'].includes(req.method)) {
      const ticket = req.body?.ticket;
      if (!ticket || !validText(ticket.name, 180) || !validText(ticket.email, 320) || !validText(ticket.subject, 300) || !validText(ticket.details, 10000)) return res.status(400).json({ error: 'Invalid service ticket' });
      const ticketId = typeof ticket.id === 'string' ? ticket.id : `CS-${Date.now().toString(36).toUpperCase()}`;
      await upsertServiceTicket({ id: ticketId, name: ticket.name.trim(), email: ticket.email.trim().toLowerCase(), subject: ticket.subject.trim(), details: ticket.details.trim(), priority: ticket.priority === 'urgent' ? 'urgent' : 'normal', status: ticket.status ?? 'open', assignedTo: ticket.assignedTo ?? null });
      return res.status(200).json({ id: ticketId });
    }

    if (resource === 'tickets' && req.method === 'PATCH') {
      if (!id) return res.status(400).json({ error: 'Ticket id is required' });
      const { status, assignedTo, followup } = req.body ?? {};
      if (status !== undefined && !['open', 'in progress', 'resolved'].includes(status)) return res.status(400).json({ error: 'Invalid ticket status' });
      const changes = { ...(typeof status === 'string' ? { status } : {}), ...(typeof assignedTo === 'string' ? { assignedTo: assignedTo || null } : {}), ...(followup ? { lastFollowupAt: new Date() } : {}), updatedAt: new Date() };
      await updateServiceTicketWorkflow(id, changes);
      if (typeof followup === 'string' && followup.trim()) await addServiceTicketFollowup({ id: randomUUID(), ticketId: id, message: followup.trim().slice(0, 5000), createdBy: session.userId });
      return res.status(200).json({ updated: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('admin data API failed', error);
    return res.status(500).json({ error: 'Admin data operation failed' });
  }
}
