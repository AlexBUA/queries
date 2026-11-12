import { open } from "sqlite";
import sqlite3 from "sqlite3";

import { createSchema } from "./schema";
import { getStalePendingOrders } from "./queries/stale_order_queries";
import { sendSlackMessage, buildOrderAlertMessage } from "./slack";

async function main() {
  const db = await open({
    filename: "ecommerce.db",
    driver: sqlite3.Database,
  });

  await createSchema(db, true);

  const staleOrders = await getStalePendingOrders(db);
  const message = buildOrderAlertMessage(staleOrders);
  await sendSlackMessage(message);
  console.log(`Sent alert for ${staleOrders.length} stale pending order(s).`);
}

main();
