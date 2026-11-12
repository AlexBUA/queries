const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;

interface SlackMessage {
  channel?: string;
  text: string;
  blocks?: SlackBlock[];
}

interface SlackBlock {
  type: string;
  text?: { type: string; text: string };
  elements?: { type: string; text: string }[];
}

export async function sendSlackMessage(message: SlackMessage): Promise<void> {
  if (!SLACK_WEBHOOK_URL) {
    throw new Error(
      "SLACK_WEBHOOK_URL environment variable is not set"
    );
  }

  const response = await fetch(SLACK_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(message),
  });

  if (!response.ok) {
    throw new Error(
      `Slack API error: ${response.status} ${await response.text()}`
    );
  }
}

export function buildOrderAlertMessage(
  stalePendingOrders: {
    order_number: string;
    customer_name: string;
    phone: string | null;
    total_amount: number;
    days_pending: number;
  }[]
): SlackMessage {
  if (stalePendingOrders.length === 0) {
    return {
      channel: "#order-alerts",
      text: "No stale pending orders today.",
    };
  }

  const orderLines = stalePendingOrders
    .map(
      (o) =>
        `• *${o.order_number}* — ${o.customer_name}, phone: ${o.phone ?? "N/A"}, $${o.total_amount.toFixed(2)} (pending ${Math.floor(o.days_pending)} days)`
    )
    .join("\n");

  return {
    channel: "#order-alerts",
    text: `⚠️ ${stalePendingOrders.length} order(s) pending for more than 3 days:\n${orderLines}`,
  };
}
