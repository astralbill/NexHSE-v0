import { drizzle } from 'drizzle-orm/node-postgres';
import { and, desc, eq, gte, inArray, max, sql } from 'drizzle-orm';
import { createHash, randomUUID } from 'node:crypto';
import pg from 'pg';
import * as schema from './schema/index.js';

const { Pool } = pg;

let database: ReturnType<typeof drizzle> | undefined;

function resolveDatabaseUrl() {
  return process.env.DATABASE_URL ?? process.env.v0_DATABASE_URL ?? process.env.nexhsevo_DATABASE_URL ?? process.env.POSTGRES_URL ?? process.env.v0_POSTGRES_URL ?? process.env.POSTGRES_URL_NON_POOLING ?? null;
}

export function getDatabase() {
  const connectionString = resolveDatabaseUrl();
  if (!connectionString) throw new Error('DATABASE_URL or POSTGRES_URL must be set to enable shared persistence');

  if (!database) {
    database = drizzle(new Pool({
      connectionString,
      max: 5,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 10_000,
    }), { schema });
  }

  return database;
}

export * from './schema/index.js';

export async function readSiteStoreValue(key: string) {
  const db = getDatabase();
  const [row] = await db
    .select({ value: schema.siteStoreTable.value })
    .from(schema.siteStoreTable)
    .where(eq(schema.siteStoreTable.key, key))
    .limit(1);

  return row?.value ?? null;
}

export async function writeSiteStoreValue(key: string, value: unknown) {
  const db = getDatabase();
  const updatedAt = new Date();

  await db.insert(schema.siteStoreTable).values({ key, value, updatedAt }).onConflictDoUpdate({
    target: schema.siteStoreTable.key,
    set: { value, updatedAt },
  });
}

export async function appendSiteStoreValue(key: string, value: unknown) {
  const db = getDatabase();
  const updatedAt = new Date();

  await db.insert(schema.siteStoreTable).values({ key, value: [value], updatedAt }).onConflictDoUpdate({
    target: schema.siteStoreTable.key,
    set: { value: sql`${schema.siteStoreTable.value} || ${JSON.stringify(value)}::jsonb`, updatedAt },
  });
}

export async function listShopProducts() {
  const db = getDatabase();
  return db.select().from(schema.shopProductsTable).orderBy(schema.shopProductsTable.name);
}

export async function findShopProductBySku(sku: string, excludeId = '') {
  const products = await getDatabase().select({ id: schema.shopProductsTable.id }).from(schema.shopProductsTable).where(eq(schema.shopProductsTable.sku, sku));
  return products.find(product => product.id !== excludeId) ?? null;
}

export async function upsertShopProduct(product: typeof schema.shopProductsTable.$inferInsert) {
  const db = getDatabase();
  const now = new Date();

  await db.insert(schema.shopProductsTable).values({ ...product, updatedAt: now }).onConflictDoUpdate({
    target: schema.shopProductsTable.id,
    set: { ...product, updatedAt: now },
  });

  return db.select().from(schema.shopProductsTable).where(eq(schema.shopProductsTable.id, product.id ?? ''));
}

export async function deleteShopProduct(id: string) {
  await getDatabase().delete(schema.shopProductsTable).where(eq(schema.shopProductsTable.id, id));
}

export async function fillMissingProductSkus() {
  await getDatabase().update(schema.shopProductsTable).set({ sku: sql`'NX-' || upper(${schema.shopProductsTable.id})` }).where(sql`${schema.shopProductsTable.sku} IS NULL OR ${schema.shopProductsTable.sku} = ''`);
}

export async function listServices(includeInactive = false) {
  const db = getDatabase();
  const query = db.select().from(schema.servicesTable).orderBy(schema.servicesTable.number);
  return includeInactive ? query : query.where(eq(schema.servicesTable.active, true));
}

export async function upsertService(service: typeof schema.servicesTable.$inferInsert) {
  const db = getDatabase();
  const now = new Date();
  await db.insert(schema.servicesTable).values({ ...service, updatedAt: now }).onConflictDoUpdate({
    target: schema.servicesTable.id,
    set: { ...service, updatedAt: now },
  });
}

export async function upsertServices(services: typeof schema.servicesTable.$inferInsert[]) {
  const db = getDatabase();
  await db.transaction(async transaction => {
    for (const service of services) {
      const now = new Date();
      await transaction.insert(schema.servicesTable).values({ ...service, updatedAt: now }).onConflictDoUpdate({ target: schema.servicesTable.id, set: { ...service, updatedAt: now } });
    }
  });
}

export async function disableService(id: string) {
  await getDatabase().update(schema.servicesTable).set({ active: false, updatedAt: new Date() }).where(eq(schema.servicesTable.id, id));
}

export async function listShopOrders() {
  const db = getDatabase();
  return db.select().from(schema.shopOrdersTable).orderBy(desc(schema.shopOrdersTable.createdAt));
}

export async function listShopOrdersForEmails(emails: string[]) {
  if (!emails.length) return [];
  return getDatabase().select().from(schema.shopOrdersTable).where(inArray(schema.shopOrdersTable.email, emails)).orderBy(desc(schema.shopOrdersTable.createdAt));
}

export async function findShopOrder(id: string) {
  const [order] = await getDatabase().select().from(schema.shopOrdersTable).where(eq(schema.shopOrdersTable.id, id)).limit(1);
  return order ?? null;
}

export async function findShopOrderByMpesaRequestId(checkoutRequestId: string) {
  const [order] = await getDatabase().select().from(schema.shopOrdersTable).where(eq(schema.shopOrdersTable.mpesaCheckoutRequestId, checkoutRequestId)).limit(1);
  return order ?? null;
}

export async function findShopOrderPaymentStatus(id: string, token: string) {
  const tokenHash = createHash('sha256').update(token).digest('hex');
  const [order] = await getDatabase().select({ id: schema.shopOrdersTable.id, paymentStatus: schema.shopOrdersTable.paymentStatus })
    .from(schema.shopOrdersTable)
    .where(and(eq(schema.shopOrdersTable.id, id), eq(schema.shopOrdersTable.paymentStatusTokenHash, tokenHash)))
    .limit(1);
  return order ?? null;
}

export async function hasShopOrderPaymentToken(id: string, token: string) {
  const tokenHash = createHash('sha256').update(token).digest('hex');
  const [order] = await getDatabase().select({ id: schema.shopOrdersTable.id })
    .from(schema.shopOrdersTable)
    .where(and(eq(schema.shopOrdersTable.id, id), eq(schema.shopOrdersTable.paymentStatusTokenHash, tokenHash)))
    .limit(1);
  return Boolean(order);
}

export async function saveShopOrderPaymentReference(id: string, reference: { stripeSessionId?: string; stripeCheckoutUrl?: string; mpesaCheckoutRequestId?: string }) {
  const [order] = await getDatabase().update(schema.shopOrdersTable).set({ ...reference, updatedAt: new Date() }).where(eq(schema.shopOrdersTable.id, id)).returning();
  return order ?? null;
}

export async function reserveShopOrderMpesaRequest(id: string) {
  const db = getDatabase();
  return db.transaction(async transaction => {
    const [order] = await transaction.select({ requestId: schema.shopOrdersTable.mpesaCheckoutRequestId })
      .from(schema.shopOrdersTable).where(eq(schema.shopOrdersTable.id, id)).limit(1).for('update');
    if (!order || order.requestId) return null;
    const requestId = `pending-${randomUUID()}`;
    await transaction.update(schema.shopOrdersTable).set({ mpesaCheckoutRequestId: requestId, updatedAt: new Date() }).where(eq(schema.shopOrdersTable.id, id));
    return requestId;
  });
}

export async function completeShopOrderMpesaRequest(id: string, reservationId: string, providerRequestId: string) {
  const [order] = await getDatabase().update(schema.shopOrdersTable).set({ mpesaCheckoutRequestId: providerRequestId, updatedAt: new Date() })
    .where(and(eq(schema.shopOrdersTable.id, id), eq(schema.shopOrdersTable.mpesaCheckoutRequestId, reservationId))).returning();
  return order ?? null;
}

export async function releaseShopOrderMpesaRequest(id: string, reservationId: string) {
  await getDatabase().update(schema.shopOrdersTable).set({ mpesaCheckoutRequestId: null, updatedAt: new Date() })
    .where(and(eq(schema.shopOrdersTable.id, id), eq(schema.shopOrdersTable.mpesaCheckoutRequestId, reservationId)));
}

export async function updateShopOrderPaymentStatus(id: string, status: 'paid' | 'failed', note: string, paymentReference?: string | null) {
  const db = getDatabase();
  return db.transaction(async transaction => {
    const [order] = await transaction.select().from(schema.shopOrdersTable).where(eq(schema.shopOrdersTable.id, id)).limit(1).for('update');
    if (!order) return null;
    if (order.paymentStatus === 'paid' || order.paymentStatus === status) return order;

    const [updated] = await transaction.update(schema.shopOrdersTable).set({
      paymentStatus: status,
      ...(paymentReference ? { paymentReference } : {}),
      updatedAt: new Date(),
    }).where(eq(schema.shopOrdersTable.id, id)).returning();
    await transaction.insert(schema.orderEventsTable).values({
      id: randomUUID(),
      orderId: id,
      eventType: 'payment-update',
      status,
      note: note.slice(0, 2000),
      createdBy: 'payment-provider',
    });
    return updated ?? null;
  });
}

export async function upsertShopOrder(order: typeof schema.shopOrdersTable.$inferInsert) {
  const db = getDatabase();
  const now = new Date();

  await db.insert(schema.shopOrdersTable).values({ ...order, updatedAt: now }).onConflictDoUpdate({
    target: schema.shopOrdersTable.id,
    set: { ...order, updatedAt: now },
  });
}

export async function createShopOrderWithStock(order: typeof schema.shopOrdersTable.$inferInsert, quantities: { productId: string; quantity: number }[], promotionIds: string[] = []) {
  const db = getDatabase();
  return db.transaction(async transaction => {
    for (const item of quantities) {
      const [reserved] = await transaction.update(schema.shopProductsTable).set({
        stock: sql`${schema.shopProductsTable.stock} - ${item.quantity}`,
        updatedAt: new Date(),
      }).where(and(eq(schema.shopProductsTable.id, item.productId), gte(schema.shopProductsTable.stock, item.quantity), eq(schema.shopProductsTable.active, true))).returning({ id: schema.shopProductsTable.id });
      if (!reserved) throw new Error('INSUFFICIENT_STOCK');
    }

    for (const promotionId of new Set(promotionIds)) {
      const [usedPromotion] = await transaction.update(schema.shopPromotionsTable).set({ usageCount: sql`${schema.shopPromotionsTable.usageCount} + 1`, updatedAt: new Date() }).where(and(
        eq(schema.shopPromotionsTable.id, promotionId),
        eq(schema.shopPromotionsTable.active, true),
        sql`(${schema.shopPromotionsTable.usageLimit} IS NULL OR ${schema.shopPromotionsTable.usageCount} < ${schema.shopPromotionsTable.usageLimit})`,
      )).returning({ id: schema.shopPromotionsTable.id });
      if (!usedPromotion) throw new Error('PROMOTION_UNAVAILABLE');
    }

    await transaction.insert(schema.shopOrdersTable).values(order);
    await transaction.insert(schema.orderEventsTable).values({ id: randomUUID(), orderId: order.id, eventType: 'created', status: order.orderStatus, note: 'Order placed', createdBy: 'customer' });
    await transaction.insert(schema.clientsTable).values({ id: randomUUID(), email: order.email.trim().toLowerCase(), name: order.customerName, phone: order.phone, createdBy: 'owner' }).onConflictDoUpdate({
      target: schema.clientsTable.email,
      set: { name: order.customerName, phone: order.phone, updatedAt: new Date() },
    });
  });
}

export async function listClientsForUser(userId: string, isOwner = false) {
  const db = getDatabase();
  const query = db.select().from(schema.clientsTable).orderBy(desc(schema.clientsTable.createdAt));
  return isOwner ? query : query.where(eq(schema.clientsTable.createdBy, userId));
}

export async function listClientsWithOrderSummary(userId: string, isOwner = false) {
  const db = getDatabase();
  const query = db.select({
    id: schema.clientsTable.id,
    email: schema.clientsTable.email,
    name: schema.clientsTable.name,
    phone: schema.clientsTable.phone,
    company: schema.clientsTable.company,
    industry: schema.clientsTable.industry,
    location: schema.clientsTable.location,
    notes: schema.clientsTable.notes,
    createdBy: schema.clientsTable.createdBy,
    createdAt: schema.clientsTable.createdAt,
    orderCount: sql<number>`count(${schema.shopOrdersTable.id})::int`,
    spend: sql<number>`coalesce(sum(${schema.shopOrdersTable.total}), 0)::int`,
    lastOrder: max(schema.shopOrdersTable.createdAt),
  }).from(schema.clientsTable)
    .leftJoin(schema.shopOrdersTable, sql`lower(${schema.shopOrdersTable.email}) = lower(${schema.clientsTable.email})`);

  return isOwner
    ? query.groupBy(schema.clientsTable.id).orderBy(desc(schema.clientsTable.createdAt))
    : query.where(eq(schema.clientsTable.createdBy, userId)).groupBy(schema.clientsTable.id).orderBy(desc(schema.clientsTable.createdAt));
}

export async function seedClientsFromOrders(clients: typeof schema.clientsTable.$inferInsert[]) {
  if (!clients.length) return;
  await getDatabase().insert(schema.clientsTable).values(clients).onConflictDoNothing();
}

export async function findClientById(id: string) {
  const [client] = await getDatabase().select().from(schema.clientsTable).where(eq(schema.clientsTable.id, id)).limit(1);
  return client ?? null;
}

export async function findClientByEmail(email: string) {
  const [client] = await getDatabase().select().from(schema.clientsTable).where(eq(schema.clientsTable.email, email.trim().toLowerCase())).limit(1);
  return client ?? null;
}

export async function upsertClient(client: typeof schema.clientsTable.$inferInsert) {
  const db = getDatabase();
  const now = new Date();
  await db.insert(schema.clientsTable).values({ ...client, updatedAt: now }).onConflictDoUpdate({
    target: schema.clientsTable.email,
    set: { name: client.name, phone: client.phone, company: client.company, industry: client.industry, location: client.location, notes: client.notes, updatedAt: now },
  });
}

export async function updateClient(id: string, changes: Partial<typeof schema.clientsTable.$inferInsert>) {
  await getDatabase().update(schema.clientsTable).set({ ...changes, updatedAt: new Date() }).where(eq(schema.clientsTable.id, id));
}

export async function listQuotesForUser(userId: string, isOwner = false) {
  const db = getDatabase();
  const query = db.select().from(schema.quotesTable).orderBy(desc(schema.quotesTable.createdAt));
  return isOwner ? query : query.where(eq(schema.quotesTable.createdBy, userId));
}

export async function findQuoteById(id: string) {
  const [quote] = await getDatabase().select().from(schema.quotesTable).where(eq(schema.quotesTable.id, id)).limit(1);
  return quote ?? null;
}

export async function createQuote(quote: typeof schema.quotesTable.$inferInsert) {
  await getDatabase().insert(schema.quotesTable).values(quote);
  return findQuoteById(quote.id);
}

export async function updateQuote(id: string, changes: Partial<typeof schema.quotesTable.$inferInsert>) {
  await getDatabase().update(schema.quotesTable).set({ ...changes, updatedAt: new Date() }).where(eq(schema.quotesTable.id, id));
  return findQuoteById(id);
}

export async function listInvoicesForUser(userId: string, isOwner = false) {
  const db = getDatabase();
  const query = db.select().from(schema.invoicesTable).orderBy(desc(schema.invoicesTable.createdAt));
  return isOwner ? query : query.where(eq(schema.invoicesTable.createdBy, userId));
}

export async function findInvoiceById(id: string) {
  const [invoice] = await getDatabase().select().from(schema.invoicesTable).where(eq(schema.invoicesTable.id, id)).limit(1);
  return invoice ?? null;
}

export async function createInvoice(invoice: typeof schema.invoicesTable.$inferInsert) {
  await getDatabase().insert(schema.invoicesTable).values(invoice);
  return findInvoiceById(invoice.id);
}

export async function findInvoiceByQuoteId(quoteId: string) {
  const [invoice] = await getDatabase().select().from(schema.invoicesTable).where(eq(schema.invoicesTable.quoteId, quoteId)).limit(1);
  return invoice ?? null;
}

export async function updateInvoice(id: string, changes: Partial<typeof schema.invoicesTable.$inferInsert>) {
  await getDatabase().update(schema.invoicesTable).set({ ...changes, updatedAt: new Date() }).where(eq(schema.invoicesTable.id, id));
  return findInvoiceById(id);
}

export async function listShopPromotions() {
  return getDatabase().select().from(schema.shopPromotionsTable).orderBy(desc(schema.shopPromotionsTable.createdAt));
}

export async function findShopPromotionByCode(code: string) {
  const [promotion] = await getDatabase().select().from(schema.shopPromotionsTable).where(eq(schema.shopPromotionsTable.code, code.trim().toUpperCase())).limit(1);
  return promotion ?? null;
}

export async function upsertShopPromotion(promotion: typeof schema.shopPromotionsTable.$inferInsert) {
  const db = getDatabase();
  const now = new Date();
  await db.insert(schema.shopPromotionsTable).values({ ...promotion, updatedAt: now }).onConflictDoUpdate({
    target: schema.shopPromotionsTable.id,
    set: { ...promotion, updatedAt: now },
  });
}

export async function deleteShopPromotion(id: string) {
  await getDatabase().delete(schema.shopPromotionsTable).where(eq(schema.shopPromotionsTable.id, id));
}

export async function listServiceTickets() {
  const db = getDatabase();
  return db.select().from(schema.serviceTicketsTable).orderBy(schema.serviceTicketsTable.createdAt);
}

export async function upsertServiceTicket(ticket: typeof schema.serviceTicketsTable.$inferInsert) {
  const db = getDatabase();
  const now = new Date();

  await db.insert(schema.serviceTicketsTable).values({ ...ticket, updatedAt: now }).onConflictDoUpdate({
    target: schema.serviceTicketsTable.id,
    set: { ...ticket, updatedAt: now },
  });
}

export async function updateShopOrderWorkflow(id: string, changes: Partial<typeof schema.shopOrdersTable.$inferInsert>) {
  const db = getDatabase();
  await db.update(schema.shopOrdersTable).set({ ...changes, updatedAt: new Date() }).where(eq(schema.shopOrdersTable.id, id));
  const [order] = await db.select().from(schema.shopOrdersTable).where(eq(schema.shopOrdersTable.id, id)).limit(1);
  return order ?? null;
}

export async function cancelShopOrderAndRestock(id: string, createdBy: string, note = '') {
  const db = getDatabase();
  return db.transaction(async transaction => {
    const [order] = await transaction.select().from(schema.shopOrdersTable).where(eq(schema.shopOrdersTable.id, id)).limit(1).for('update');
    if (!order) return null;
    if (order.orderStatus !== 'cancelled') {
      const items = Array.isArray(order.items) ? order.items as { productId?: string; quantity?: number }[] : [];
      for (const item of items) {
        if (!item.productId || !Number.isInteger(item.quantity) || (item.quantity ?? 0) <= 0) continue;
        await transaction.update(schema.shopProductsTable).set({ stock: sql`${schema.shopProductsTable.stock} + ${item.quantity}`, updatedAt: new Date() }).where(eq(schema.shopProductsTable.id, item.productId));
      }
      await transaction.update(schema.shopOrdersTable).set({ orderStatus: 'cancelled', updatedAt: new Date() }).where(eq(schema.shopOrdersTable.id, id));
      await transaction.insert(schema.orderEventsTable).values({ id: randomUUID(), orderId: id, eventType: 'status-update', status: 'cancelled', note: note.slice(0, 2000), createdBy });
    }
    const [updated] = await transaction.select().from(schema.shopOrdersTable).where(eq(schema.shopOrdersTable.id, id)).limit(1);
    return updated ?? null;
  });
}

export async function addOrderEvent(event: typeof schema.orderEventsTable.$inferInsert) {
  await getDatabase().insert(schema.orderEventsTable).values(event);
}

export async function listOrderEvents(orderId: string) {
  return getDatabase().select().from(schema.orderEventsTable).where(eq(schema.orderEventsTable.orderId, orderId)).orderBy(schema.orderEventsTable.createdAt);
}

export async function updateServiceTicketWorkflow(id: string, changes: Partial<typeof schema.serviceTicketsTable.$inferInsert>) {
  await getDatabase().update(schema.serviceTicketsTable).set({ ...changes, updatedAt: new Date() }).where(eq(schema.serviceTicketsTable.id, id));
}

export async function addServiceTicketFollowup(followup: typeof schema.serviceTicketFollowupsTable.$inferInsert) {
  await getDatabase().insert(schema.serviceTicketFollowupsTable).values(followup);
}

export async function listServiceTicketFollowups(ticketId: string) {
  return getDatabase().select().from(schema.serviceTicketFollowupsTable).where(eq(schema.serviceTicketFollowupsTable.ticketId, ticketId)).orderBy(schema.serviceTicketFollowupsTable.createdAt);
}

export async function listBlogPosts() {
  const db = getDatabase();
  return db.select().from(schema.blogPostsTable).orderBy(schema.blogPostsTable.createdAt);
}

export async function upsertBlogPost(post: typeof schema.blogPostsTable.$inferInsert) {
  const db = getDatabase();
  const now = new Date();

  await db.insert(schema.blogPostsTable).values({ ...post, updatedAt: now }).onConflictDoUpdate({
    target: schema.blogPostsTable.id,
    set: { ...post, updatedAt: now },
  });
}

export async function seedInitialContent(content: {
  products: (typeof schema.shopProductsTable.$inferInsert)[];
  services: (typeof schema.servicesTable.$inferInsert)[];
  blogPosts: (typeof schema.blogPostsTable.$inferInsert)[];
}) {
  const db = getDatabase();
  return db.transaction(async transaction => {
    const products = content.products.length
      ? await transaction.insert(schema.shopProductsTable).values(content.products).onConflictDoNothing().returning({ id: schema.shopProductsTable.id })
      : [];
    const services = content.services.length
      ? await transaction.insert(schema.servicesTable).values(content.services).onConflictDoNothing().returning({ id: schema.servicesTable.id })
      : [];
    const blogPosts = content.blogPosts.length
      ? await transaction.insert(schema.blogPostsTable).values(content.blogPosts).onConflictDoNothing().returning({ id: schema.blogPostsTable.id })
      : [];
    return { products: products.length, services: services.length, blogPosts: blogPosts.length };
  });
}

export async function findAdminUserByEmail(email: string) {
  const db = getDatabase();
  const [user] = await db.select().from(schema.adminUsersTable).where(eq(schema.adminUsersTable.email, email)).limit(1);
  return user ?? null;
}

export async function isAdminUserActive(id: string) {
  const [user] = await getDatabase().select({ active: schema.adminUsersTable.active }).from(schema.adminUsersTable).where(eq(schema.adminUsersTable.id, id)).limit(1);
  return user?.active === true;
}

export async function listAdminUsers() {
  const db = getDatabase();
  return db.select({ id: schema.adminUsersTable.id, email: schema.adminUsersTable.email, name: schema.adminUsersTable.name, role: schema.adminUsersTable.role, active: schema.adminUsersTable.active, createdAt: schema.adminUsersTable.createdAt }).from(schema.adminUsersTable).orderBy(schema.adminUsersTable.createdAt);
}

export async function updateAdminUser(id: string, changes: Partial<Pick<typeof schema.adminUsersTable.$inferInsert, 'role' | 'active'>>) {
  const db = getDatabase();
  await db.update(schema.adminUsersTable).set({ ...changes, updatedAt: new Date() }).where(eq(schema.adminUsersTable.id, id));
}

export async function createAdminInvitation(invitation: typeof schema.adminInvitationsTable.$inferInsert) {
  const db = getDatabase();
  await db.insert(schema.adminInvitationsTable).values(invitation);
}

export async function listAdminInvitations() {
  const db = getDatabase();
  return db.select({ id: schema.adminInvitationsTable.id, email: schema.adminInvitationsTable.email, name: schema.adminInvitationsTable.name, role: schema.adminInvitationsTable.role, expiresAt: schema.adminInvitationsTable.expiresAt, acceptedAt: schema.adminInvitationsTable.acceptedAt, createdAt: schema.adminInvitationsTable.createdAt }).from(schema.adminInvitationsTable).orderBy(schema.adminInvitationsTable.createdAt);
}

export async function acceptAdminInvitation(tokenHash: string, passwordHash: string) {
  const db = getDatabase();
  return db.transaction(async transaction => {
    const [invitation] = await transaction.select().from(schema.adminInvitationsTable).where(eq(schema.adminInvitationsTable.tokenHash, tokenHash)).limit(1);
    if (!invitation || invitation.acceptedAt || invitation.expiresAt <= new Date()) return null;

    const [user] = await transaction.insert(schema.adminUsersTable).values({
      id: crypto.randomUUID(),
      email: invitation.email,
      name: invitation.name,
      passwordHash,
      role: invitation.role,
    }).returning({ id: schema.adminUsersTable.id, email: schema.adminUsersTable.email, name: schema.adminUsersTable.name, role: schema.adminUsersTable.role });

    await transaction.update(schema.adminInvitationsTable).set({ acceptedAt: new Date() }).where(eq(schema.adminInvitationsTable.id, invitation.id));
    return user;
  });
}
