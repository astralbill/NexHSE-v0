import { boolean, index, integer, jsonb, pgTable, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';

export const siteStoreTable = pgTable('nexhse_site_store', {
  key: text('key').primaryKey(),
  value: jsonb('value').notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const shopProductsTable = pgTable('nexhse_shop_products', {
  id: text('id').primaryKey(),
  sku: text('sku').unique(),
  name: text('name').notNull(),
  category: text('category').notNull(),
  price: integer('price').notNull(),
  stock: integer('stock').notNull().default(0),
  image: text('image').notNull(),
  imageBackground: text('image_background').notNull(),
  description: text('description').notNull(),
  longDescription: text('long_description').notNull(),
  seoTitle: text('seo_title').notNull(),
  seoDescription: text('seo_description').notNull(),
  keywords: text('keywords').array().notNull().default([]),
  features: text('features').array().notNull().default([]),
  useCases: text('use_cases').array().notNull().default([]),
  brand: text('brand').notNull(),
  condition: text('condition').notNull().default('new'),
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, table => [index('nexhse_shop_products_active_category_idx').on(table.active, table.category)]);

export const shopOrdersTable = pgTable('nexhse_shop_orders', {
  id: text('id').primaryKey(),
  customerName: text('customer_name').notNull(),
  email: text('email').notNull(),
  phone: text('phone').notNull(),
  address: text('address').notNull(),
  county: text('county').notNull(),
  notes: text('notes'),
  paymentMethod: text('payment_method').notNull(),
  paymentStatus: text('payment_status').notNull(),
  stripeSessionId: text('stripe_session_id'),
  stripeCheckoutUrl: text('stripe_checkout_url'),
  mpesaCheckoutRequestId: text('mpesa_checkout_request_id'),
  paymentReference: text('payment_reference'),
  paymentStatusTokenHash: text('payment_status_token_hash'),
  orderStatus: text('order_status').notNull(),
  promotionCode: text('promotion_code'),
  discount: integer('discount').notNull().default(0),
  trackingNumber: text('tracking_number'),
  carrier: text('carrier'),
  expectedDeliveryAt: timestamp('expected_delivery_at', { withTimezone: true }),
  lastContactAt: timestamp('last_contact_at', { withTimezone: true }),
  subtotal: integer('subtotal').notNull(),
  deliveryFee: integer('delivery_fee').notNull(),
  total: integer('total').notNull(),
  items: jsonb('items').notNull().default([]),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, table => [
  index('nexhse_shop_orders_created_at_idx').on(table.createdAt),
  index('nexhse_shop_orders_status_idx').on(table.orderStatus),
  index('nexhse_shop_orders_email_created_idx').on(table.email, table.createdAt),
  uniqueIndex('nexhse_shop_orders_stripe_session_idx').on(table.stripeSessionId),
  uniqueIndex('nexhse_shop_orders_mpesa_request_idx').on(table.mpesaCheckoutRequestId),
]);

export const shopPromotionsTable = pgTable('nexhse_shop_promotions', {
  id: text('id').primaryKey(),
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
  description: text('description').notNull().default(''),
  discountType: text('discount_type').notNull(),
  discountValue: integer('discount_value').notNull(),
  productIds: text('product_ids').array().notNull().default([]),
  startsAt: timestamp('starts_at', { withTimezone: true }),
  endsAt: timestamp('ends_at', { withTimezone: true }),
  usageLimit: integer('usage_limit'),
  usageCount: integer('usage_count').notNull().default(0),
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, table => [index('nexhse_shop_promotions_active_idx').on(table.active, table.startsAt, table.endsAt)]);

export const clientsTable = pgTable('nexhse_clients', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  phone: text('phone').notNull().default(''),
  company: text('company').notNull().default(''),
  industry: text('industry').notNull().default(''),
  location: text('location').notNull().default(''),
  notes: text('notes').notNull().default(''),
  createdBy: text('created_by').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, table => [index('nexhse_clients_created_by_idx').on(table.createdBy, table.createdAt)]);

export const quotesTable = pgTable('nexhse_quotes', {
  id: text('id').primaryKey(),
  quoteNumber: text('quote_number').notNull().unique(),
  clientId: text('client_id'),
  clientName: text('client_name').notNull(),
  company: text('company').notNull().default(''),
  email: text('email').notNull(),
  phone: text('phone').notNull().default(''),
  need: text('need').notNull(),
  location: text('location').notNull().default(''),
  timeline: text('timeline').notNull().default(''),
  amount: integer('amount').notNull().default(0),
  currency: text('currency').notNull().default('KES'),
  status: text('status').notNull().default('requested'),
  validUntil: timestamp('valid_until', { withTimezone: true }),
  createdBy: text('created_by').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, table => [
  index('nexhse_quotes_status_created_idx').on(table.status, table.createdAt),
  index('nexhse_quotes_client_idx').on(table.clientId, table.createdAt),
]);

export const invoicesTable = pgTable('nexhse_invoices', {
  id: text('id').primaryKey(),
  invoiceNumber: text('invoice_number').notNull().unique(),
  quoteId: text('quote_id').notNull(),
  quoteNumber: text('quote_number').notNull(),
  clientId: text('client_id'),
  clientName: text('client_name').notNull(),
  company: text('company').notNull().default(''),
  email: text('email').notNull(),
  phone: text('phone').notNull().default(''),
  description: text('description').notNull(),
  amount: integer('amount').notNull(),
  currency: text('currency').notNull().default('KES'),
  status: text('status').notNull().default('issued'),
  dueAt: timestamp('due_at', { withTimezone: true }),
  createdBy: text('created_by').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, table => [
  uniqueIndex('nexhse_invoices_quote_idx').on(table.quoteId),
  index('nexhse_invoices_status_due_idx').on(table.status, table.dueAt),
  index('nexhse_invoices_client_idx').on(table.clientId, table.createdAt),
]);

export const serviceTicketsTable = pgTable('nexhse_service_tickets', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  subject: text('subject').notNull(),
  priority: text('priority').notNull().default('normal'),
  details: text('details').notNull(),
  status: text('status').notNull().default('open'),
  assignedTo: text('assigned_to'),
  dueAt: timestamp('due_at', { withTimezone: true }),
  lastFollowupAt: timestamp('last_followup_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, table => [index('nexhse_service_tickets_status_idx').on(table.status, table.createdAt)]);

export const blogPostsTable = pgTable('nexhse_blog_posts', {
  id: text('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  category: text('category').notNull(),
  excerpt: text('excerpt').notNull(),
  body: text('body').notNull(),
  image: text('image').notNull(),
  date: text('date').notNull(),
  readTime: text('read_time').notNull(),
  published: boolean('published').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const servicesTable = pgTable('nexhse_services', {
  id: text('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  number: text('number').notNull(),
  title: text('title').notNull(),
  short: text('short').notNull(),
  outcome: text('outcome').notNull(),
  type: text('type').notNull(),
  image: text('image').notNull(),
  group: text('group').notNull(),
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const adminUsersTable = pgTable('nexhse_admin_users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  passwordHash: text('password_hash').notNull(),
  role: text('role').notNull().default('staff'),
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const adminInvitationsTable = pgTable('nexhse_admin_invitations', {
  id: text('id').primaryKey(),
  email: text('email').notNull(),
  name: text('name').notNull(),
  role: text('role').notNull().default('staff'),
  tokenHash: text('token_hash').notNull().unique(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  acceptedAt: timestamp('accepted_at', { withTimezone: true }),
  createdBy: text('created_by').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const orderEventsTable = pgTable('nexhse_order_events', {
  id: text('id').primaryKey(),
  orderId: text('order_id').notNull(),
  eventType: text('event_type').notNull(),
  status: text('status').notNull(),
  note: text('note').notNull().default(''),
  trackingNumber: text('tracking_number'),
  carrier: text('carrier'),
  createdBy: text('created_by').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const serviceTicketFollowupsTable = pgTable('nexhse_service_ticket_followups', {
  id: text('id').primaryKey(),
  ticketId: text('ticket_id').notNull(),
  message: text('message').notNull(),
  createdBy: text('created_by').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
