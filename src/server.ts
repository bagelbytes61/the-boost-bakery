import { AngularAppEngine, createRequestHandler } from '@angular/ssr';
const angularApp = new AngularAppEngine();
const orderRecipient = 'jlyda61@gmail.com';
const orderSender = 'orders@theboostbakery.com';

interface TuneSpecs {
  modelYear: string;
  vin: string;
  mileage: number;
  mods: string;
  notes?: string;
}

interface TuneAddOn {
  id: string;
  name: string;
  price: number;
  description: string;
}

interface TuneOrderItem {
  id: string;
  name: string;
  price: number;
  addOns?: TuneAddOn[];
  specs: TuneSpecs;
}

interface OrderNotification {
  transaction: {
    id: string;
    status: string;
    payerName: string;
    email: string;
    amount: string;
  };
  items: TuneOrderItem[];
}

function isShortString(value: unknown, maximumLength: number): value is string {
  return typeof value === 'string' && value.length > 0 && value.length <= maximumLength;
}

function isValidOrderNotification(value: unknown): value is OrderNotification {
  if (!value || typeof value !== 'object') return false;

  const order = value as Partial<OrderNotification>;
  const transaction = order.transaction;
  if (!transaction || typeof transaction !== 'object') return false;
  if (
    !isShortString(transaction.id, 128) ||
    !isShortString(transaction.status, 32) ||
    !isShortString(transaction.payerName, 200) ||
    !isShortString(transaction.email, 320) ||
    !isShortString(transaction.amount, 32) ||
    !transaction.email.includes('@')
  ) {
    return false;
  }

  if (!Array.isArray(order.items) || order.items.length === 0 || order.items.length > 10) {
    return false;
  }

  return order.items.every((item) => {
    const specs = item?.specs;
    const addOnsAreValid =
      item?.addOns === undefined ||
      (Array.isArray(item.addOns) &&
        item.addOns.length <= 10 &&
        item.addOns.every(
          (addOn) =>
            isShortString(addOn?.id, 128) &&
            isShortString(addOn?.name, 200) &&
            typeof addOn?.price === 'number' &&
            Number.isFinite(addOn.price) &&
            addOn.price >= 0 &&
            isShortString(addOn?.description, 1000),
        ));
    return (
      addOnsAreValid &&
      isShortString(item?.id, 128) &&
      isShortString(item?.name, 200) &&
      typeof item?.price === 'number' &&
      Number.isFinite(item.price) &&
      item.price >= 0 &&
      specs !== undefined &&
      isShortString(specs.modelYear, 4) &&
      isShortString(specs.vin, 17) &&
      specs.vin.length === 17 &&
      typeof specs.mileage === 'number' &&
      Number.isFinite(specs.mileage) &&
      specs.mileage >= 0 &&
      isShortString(specs.mods, 4000) &&
      (specs.notes === undefined ||
        (typeof specs.notes === 'string' && specs.notes.length <= 4000))
    );
  });
}

function headerSafe(value: string): string {
  return value.replace(/[\r\n]+/g, ' ').trim();
}

function createOrderEmail(order: OrderNotification): string {
  const { transaction, items } = order;
  const itemDetails = items
    .map((item, index) => {
      const addOnLines = item.addOns?.length
        ? item.addOns.map((addOn) => `- ${addOn.name} (+$${addOn.price.toFixed(2)})`)
        : ['None'];
      const lines = [
        `Tune ${index + 1}: ${item.name}`,
        `Price: $${item.price.toFixed(2)} USD`,
        `Model year: ${item.specs.modelYear}`,
        `VIN: ${item.specs.vin.toUpperCase()}`,
        `Mileage: ${item.specs.mileage.toLocaleString('en-US')} miles`,
        `Modifications: ${item.specs.mods}`,
        `Customer notes: ${item.specs.notes?.trim() || 'None provided'}`,
        'Add-ons:',
        ...addOnLines,
      ];
      return lines.join('\r\n');
    })
    .join('\r\n\r\n');

  const body = [
    'A customer completed payment for a tune.',
    '',
    'PAYPAL TRANSACTION',
    `Transaction ID: ${transaction.id}`,
    `Status: ${transaction.status}`,
    `Amount: $${transaction.amount} USD`,
    `Customer: ${transaction.payerName}`,
    `Customer email: ${transaction.email}`,
    '',
    'TUNE DETAILS',
    itemDetails,
    '',
    'Before fulfillment, confirm the transaction and amount in PayPal.',
  ].join('\r\n');

  return [
    `From: The Boost Bakery <${orderSender}>`,
    `To: ${orderRecipient}`,
    `Reply-To: ${headerSafe(transaction.email)}`,
    `Subject: New paid tune order - ${headerSafe(transaction.id)}`,
    `Date: ${new Date().toUTCString()}`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
    '',
    body,
  ].join('\r\n');
}

async function handleOrderNotification(request: Request, env: Env): Promise<Response> {
  const requestUrl = new URL(request.url);
  const origin = request.headers.get('Origin');
  if (origin !== requestUrl.origin) {
    return Response.json({ error: 'Invalid request origin.' }, { status: 403 });
  }

  const contentLength = Number(request.headers.get('Content-Length') ?? 0);
  if (contentLength > 32_768) {
    return Response.json({ error: 'Order payload is too large.' }, { status: 413 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON payload.' }, { status: 400 });
  }

  if (!isValidOrderNotification(payload) || payload.transaction.status !== 'COMPLETED') {
    return Response.json({ error: 'Invalid order details.' }, { status: 400 });
  }

  if (!env.ORDER_EMAIL) {
    return Response.json({ error: 'Order email is not configured.' }, { status: 503 });
  }

  const { EmailMessage } = await import('cloudflare:email');
  const message = new EmailMessage(orderSender, orderRecipient, createOrderEmail(payload));
  await env.ORDER_EMAIL.send(message);

  return Response.json({ sent: true });
}

/**
 * This is a request handler used by the Angular CLI (dev-server and during build).
 */
export const reqHandler = createRequestHandler(async (req) => {
  const res = await angularApp.handle(req);

  return res ?? new Response('Page not found.', { status: 404 });
});

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (request.method === 'POST' && url.pathname === '/api/order-notification') {
      try {
        return await handleOrderNotification(request, env);
      } catch (error) {
        console.error('Failed to send order notification:', error);
        return Response.json(
          { error: 'Unable to send the order notification.' },
          { status: 502 },
        );
      }
    }

    return (await reqHandler(request)) ?? new Response('Page not found.', { status: 404 });
  },
};
