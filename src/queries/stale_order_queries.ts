import { Database } from "sqlite";

export async function getStalePendingOrders(
  db: Database,
  daysThreshold: number = 3
): Promise<
  {
    order_number: string;
    customer_name: string;
    phone: string | null;
    total_amount: number;
    days_pending: number;
  }[]
> {
  const query = `
    SELECT
        o.order_number,
        c.first_name || ' ' || c.last_name AS customer_name,
        c.phone,
        o.total_amount,
        julianday('now') - julianday(o.created_at) AS days_pending
    FROM orders o
    JOIN customers c ON o.customer_id = c.id
    WHERE o.status = 'pending'
      AND julianday('now') - julianday(o.created_at) > ?
    ORDER BY o.created_at ASC
  `;

  return db.all(query, [daysThreshold]);
}
