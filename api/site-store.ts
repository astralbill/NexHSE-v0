import { createHash, randomBytes } from 'node:crypto';
import { createShopOrderWithStock, listClientsForUser, listShopOrders, listShopOrdersForEmails, listShopProducts, listShopPromotions, readSiteStoreValue, upsertShopProduct, writeSiteStoreValue } from '@workspace/db';
import { getActiveAdminSession, isTrustedOrigin } from '../lib/api/admin-session.js';

const keys = new Set(['nexhse-shop-products', 'nexhse-blog-posts', 'nexhse-shop-orders', 'nexhse-service-tickets']);
const publicReadKeys = new Set(['nexhse-shop-products', 'nexhse-blog-posts']);
const privateKeys = new Set(['nexhse-shop-orders', 'nexhse-service-tickets']);

function validNewOrder(order: any) {
  return order && typeof order === 'object'
    && Array.isArray(order.items) && order.items.length > 0 && order.items.length <= 50
    && order.items.every((item: any) => item && typeof item.name === 'string' && Number.isInteger(item.quantity) && item.quantity > 0 && item.quantity <= 100)
    && order.delivery && typeof order.delivery.name === 'string' && order.delivery.name.trim().length > 0
    && typeof order.delivery.email === 'string' && order.delivery.email.includes('@')
    && typeof order.delivery.phone === 'string' && typeof order.delivery.address === 'string' && typeof order.delivery.county === 'string'
    && ['M-Pesa', 'Card', 'Bank transfer', 'Pay on delivery'].includes(order.paymentMethod);
}

function promotionActive(promotion: Awaited<ReturnType<typeof listShopPromotions>>[number], now: Date) {
  return promotion.active && (!promotion.startsAt || promotion.startsAt <= now) && (!promotion.endsAt || promotion.endsAt > now) && (promotion.usageLimit === null || promotion.usageCount < promotion.usageLimit);
}

export default async function handler(req: any, res: any) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const key = String(req.query?.key ?? '');
      if (!keys.has(key)) return res.status(400).json({ error: 'Unknown store key' });
      const session = publicReadKeys.has(key) ? null : await getActiveAdminSession(req);
      if (!publicReadKeys.has(key) && !session) return res.status(401).json({ error: 'Admin session required' });
      let orders = key === 'nexhse-shop-orders' && session?.role === 'owner' ? await listShopOrders() : [];
      if (key === 'nexhse-shop-orders' && session?.role !== 'owner') {
        const clients = await listClientsForUser(session!.userId);
        const emails = new Set(clients.map(client => client.email.toLowerCase()));
        orders = await listShopOrdersForEmails([...emails]);
      }
      const value = key === 'nexhse-shop-orders' ? orders.map(order => ({
        id: order.id,
        createdAt: order.createdAt.toISOString(),
        items: order.items,
        subtotal: order.subtotal,
        deliveryFee: order.deliveryFee,
        total: order.total,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        orderStatus: order.orderStatus,
        trackingNumber: order.trackingNumber,
        carrier: order.carrier,
        expectedDeliveryAt: order.expectedDeliveryAt?.toISOString() ?? null,
        delivery: { name: order.customerName, email: order.email, phone: order.phone, address: order.address, county: order.county, notes: order.notes ?? '' },
      })) : await readSiteStoreValue(key);
      return res.status(200).json({ value });
    }

    if (req.method === 'POST') {
      if (!isTrustedOrigin(req)) return res.status(403).json({ error: 'Untrusted origin' });
      if (req.body?.key !== 'nexhse-shop-orders' || !validNewOrder(req.body?.order)) return res.status(400).json({ error: 'Invalid order' });
      let products = await listShopProducts();
      if (!products.length) {
        const legacyProducts = await readSiteStoreValue('nexhse-shop-products');
        if (Array.isArray(legacyProducts)) {
          for (const product of legacyProducts) {
            if (!product || typeof product.name !== 'string') continue;
            const id = product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            await upsertShopProduct({ id, sku: typeof product.sku === 'string' && product.sku.trim() ? product.sku.trim().toUpperCase() : `NX-${id.toUpperCase()}`, name: product.name, category: product.category ?? 'PPE', price: Number(product.price) || 0, stock: Number(product.stock) || 0, image: product.image ?? '', imageBackground: product.imageBackground ?? '#ffffff', description: product.description ?? '', longDescription: product.longDescription ?? product.description ?? '', seoTitle: product.seoTitle ?? product.name, seoDescription: product.seoDescription ?? product.description ?? '', keywords: Array.isArray(product.keywords) ? product.keywords : [], features: Array.isArray(product.features) ? product.features : [], useCases: Array.isArray(product.useCases) ? product.useCases : [], brand: product.brand ?? 'NexHSE Africa', condition: product.condition ?? 'New', active: true });
          }
          products = await listShopProducts();
        }
      }
      const requestedItems = req.body.order.items as { name: string; quantity: number }[];
      const items = requestedItems.map(item => {
        const product = products.find(candidate => candidate.name === item.name && candidate.active);
        if (!product) throw Object.assign(new Error('PRODUCT_UNAVAILABLE'), { statusCode: 409 });
        if (product.stock < item.quantity) throw Object.assign(new Error('INSUFFICIENT_STOCK'), { statusCode: 409 });
        return { productId: product.id, name: product.name, quantity: item.quantity, price: product.price, image: product.image };
      });
      const promotions = (await listShopPromotions()).filter(promotion => promotionActive(promotion, new Date()));
      const baseSubtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const promotionIds = new Set<string>();
      let discount = 0;
      const pricedItems = items.map(item => {
        const matching = promotions.filter(promotion => !promotion.productIds.length || promotion.productIds.includes(item.productId))
          .map(promotion => ({ promotion, savings: promotion.discountType === 'percentage' ? Math.floor(item.price * promotion.discountValue / 100) : Math.min(item.price, promotion.discountValue) }))
          .sort((left, right) => right.savings - left.savings)[0];
        if (!matching || matching.savings <= 0) return item;
        promotionIds.add(matching.promotion.id);
        discount += matching.savings * item.quantity;
        return { ...item, price: item.price - matching.savings, promotionCode: matching.promotion.code };
      });
      const subtotal = baseSubtotal;
      const deliveryFee = req.body.order.delivery.county.toLowerCase().includes('nairobi') ? 300 : 600;
      const now = new Date();
      const promotionCodes = promotions.filter(promotion => promotionIds.has(promotion.id)).map(promotion => promotion.code);
      const paymentStatusToken = randomBytes(32).toString('base64url');
      const order = { ...req.body.order, items: pricedItems, subtotal, discount, promotionCode: promotionCodes.join(', ') || null, deliveryFee, total: subtotal + deliveryFee - discount, id: `NX-${now.getTime().toString(36).toUpperCase()}-${randomBytes(4).toString('hex').toUpperCase()}`, createdAt: now.toISOString(), paymentStatus: req.body.order.paymentMethod === 'Pay on delivery' ? 'pending' : 'awaiting confirmation', orderStatus: 'received', paymentStatusToken };
      await createShopOrderWithStock({
        id: order.id,
        customerName: order.delivery.name,
        email: order.delivery.email.trim().toLowerCase(),
        phone: order.delivery.phone,
        address: order.delivery.address,
        county: order.delivery.county,
        notes: order.delivery.notes ?? null,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        paymentStatusTokenHash: createHash('sha256').update(paymentStatusToken).digest('hex'),
        orderStatus: order.orderStatus,
        promotionCode: order.promotionCode,
        discount: order.discount,
        subtotal,
        deliveryFee,
        total: order.total,
        items: order.items,
        createdAt: now,
      }, items.map(item => ({ productId: item.productId, quantity: item.quantity })), [...promotionIds]);
      return res.status(201).json({ order });
    }

    if (req.method === 'PUT') {
      if (!isTrustedOrigin(req)) return res.status(403).json({ error: 'Untrusted origin' });
      const session = await getActiveAdminSession(req);
      if (!session) return res.status(401).json({ error: 'Admin session required' });
      const { key, value } = req.body ?? {};
      if (!keys.has(key) || value === undefined) return res.status(400).json({ error: 'Invalid store update' });
      if (session.role !== 'owner' && key !== 'nexhse-service-tickets') return res.status(403).json({ error: 'Super admin role required' });
      const serialized = JSON.stringify(value);
      if (serialized.length > 2_000_000) return res.status(413).json({ error: 'Store value is too large' });
      await writeSiteStoreValue(key, value);
      return res.status(200).json({ saved: true, updatedAt: new Date().toISOString() });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('site-store API failed', error);
    if (error && typeof error === 'object' && 'statusCode' in error) return res.status(Number(error.statusCode)).json({ error: error instanceof Error ? error.message : 'Order failed' });
    if (error instanceof Error && error.message === 'PROMOTION_UNAVAILABLE') return res.status(409).json({ error: 'Promotion limit was reached. Please refresh your basket.' });
    return res.status(process.env.DATABASE_URL || process.env.v0_DATABASE_URL || process.env.nexhsevo_DATABASE_URL ? 500 : 503).json({ error: 'Shared persistence is unavailable' });
  }
}
