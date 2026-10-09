import { neon } from '@neondatabase/serverless';
import { desc, eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema/index.js';

function getEdgeDatabase(connectionString: string) {
  if (!connectionString) throw new Error('DATABASE_URL or POSTGRES_URL must be set for Neon Edge access');
  return drizzle(neon(connectionString), { schema });
}

export async function listShopOrdersForEmailEdge(email: string, connectionString: string) {
  const database = getEdgeDatabase(connectionString);
  return database.select({
    id: schema.shopOrdersTable.id,
    createdAt: schema.shopOrdersTable.createdAt,
    items: schema.shopOrdersTable.items,
    subtotal: schema.shopOrdersTable.subtotal,
    deliveryFee: schema.shopOrdersTable.deliveryFee,
    total: schema.shopOrdersTable.total,
    paymentMethod: schema.shopOrdersTable.paymentMethod,
    paymentStatus: schema.shopOrdersTable.paymentStatus,
    orderStatus: schema.shopOrdersTable.orderStatus,
    trackingNumber: schema.shopOrdersTable.trackingNumber,
    carrier: schema.shopOrdersTable.carrier,
    expectedDeliveryAt: schema.shopOrdersTable.expectedDeliveryAt,
  }).from(schema.shopOrdersTable)
    .where(eq(schema.shopOrdersTable.email, email.trim().toLowerCase()))
    .orderBy(desc(schema.shopOrdersTable.createdAt))
    .limit(50);
}