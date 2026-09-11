/**
 * Payments fixture. Deterministic — no `Math.random()`, so Chromatic and the
 * layout tests get stable output.
 *
 * Ids are full UUIDs rather than the short `usr_*` form the users fixture
 * uses. A payment id is the thing you paste into a provider's dashboard, so it
 * is shown truncated in the table with a copy button and in full on the record
 * — which is also what makes the truncate-and-copy pattern worth demonstrating.
 */

export type PaymentType = "cashout" | "deposit";
export type PaymentStatus = "completed" | "failed" | "in-progress";
export type Currency = "BTC" | "ETH" | "EUR" | "USDT";
export type Provider = "Banxa" | "Coinspaid" | "MoonPay" | "Stripe";

export interface Payment {
  amount: string;
  createdAt: string;
  currency: Currency;
  /** Null while the payment is still in progress, or after it failed. */
  finishedAt: string | null;
  id: string;
  playerEmail: string;
  provider: Provider;
  status: PaymentStatus;
  type: PaymentType;
}

export const paymentStatusLabels: Record<PaymentStatus, string> = {
  completed: "Completed",
  failed: "Failed",
  "in-progress": "In progress",
};

export const paymentTypeLabels: Record<PaymentType, string> = {
  cashout: "Cashout",
  deposit: "Deposit",
};

/**
 * Status carries the only semantic colour on the row: a failed payment is the
 * one a reader is scanning for. Type and currency stay neutral so they do not
 * compete with it.
 */
export const PAYMENT_STATUS_VARIANT: Record<
  PaymentStatus,
  "destructive" | "outline" | "secondary"
> = {
  completed: "secondary",
  failed: "destructive",
  "in-progress": "outline",
};

export const CURRENCIES: readonly Currency[] = ["USDT", "BTC", "ETH", "EUR"];
export const PROVIDERS: readonly Provider[] = [
  "Coinspaid",
  "Banxa",
  "Stripe",
  "MoonPay",
];

/** Middle-truncates an id so the distinctive head and tail both survive. */
export function truncateId(id: string, head = 3, tail = 3): string {
  return `${id.slice(0, head)}...${id.slice(-tail)}`;
}

export const payments: readonly Payment[] = [
  {
    amount: "10000.000000",
    createdAt: "2026-08-28 18:07:07",
    currency: "USDT",
    finishedAt: "2026-08-28 18:07:12",
    id: "4b87f2e4-7cf0-4c37-b21f-4dc4d91a7235",
    playerEmail: "aleksalbrecht@outlook.com",
    provider: "Coinspaid",
    status: "completed",
    type: "deposit",
  },
  {
    amount: "1.000000",
    createdAt: "2026-07-24 17:29:52",
    currency: "BTC",
    finishedAt: "2026-07-24 17:30:13",
    id: "f46a91c2-3ed8-4b71-9a05-2c7e18d4bf34",
    playerEmail: "ernestpall@gmail.com",
    provider: "Banxa",
    status: "completed",
    type: "cashout",
  },
  {
    amount: "0.001000",
    createdAt: "2026-07-24 17:27:57",
    currency: "ETH",
    finishedAt: null,
    id: "463bd018-52a7-4c99-8e13-9f4a67c1eb93",
    playerEmail: "kong_sweep@boss.com",
    provider: "Stripe",
    status: "in-progress",
    type: "deposit",
  },
  {
    amount: "600.000000",
    createdAt: "2026-07-24 17:22:13",
    currency: "EUR",
    finishedAt: null,
    id: "61b4e7a9-08cd-4f52-b6a7-3d81c94afff1",
    playerEmail: "konger@kontest.io",
    provider: "MoonPay",
    status: "failed",
    type: "cashout",
  },
  {
    amount: "2.000000",
    createdAt: "2026-07-24 16:59:13",
    currency: "USDT",
    finishedAt: "2026-07-24 16:59:13",
    id: "6cf2a815-9b34-4de6-a017-5e29b7d3cc47",
    playerEmail: "mira.devlin@fastmail.com",
    provider: "Coinspaid",
    status: "completed",
    type: "deposit",
  },
  {
    amount: "0.200000",
    createdAt: "2026-07-22 19:24:03",
    currency: "BTC",
    finishedAt: null,
    id: "631da2f7-4c60-49b8-93e5-8a1f206bda08",
    playerEmail: "t.okafor@proton.me",
    provider: "Banxa",
    status: "failed",
    type: "cashout",
  },
  {
    amount: "0.200000",
    createdAt: "2026-07-22 18:43:54",
    currency: "ETH",
    finishedAt: null,
    id: "ec1907b3-6a25-4f81-bd94-7c3e05a2f5ad",
    playerEmail: "s.lindgren@hey.com",
    provider: "Stripe",
    status: "in-progress",
    type: "deposit",
  },
  {
    amount: "0.200000",
    createdAt: "2026-07-22 18:43:42",
    currency: "EUR",
    finishedAt: null,
    id: "495c3e60-1d7b-42a9-86f3-0b95ce74d3aa",
    playerEmail: "dana@northwind.io",
    provider: "MoonPay",
    status: "failed",
    type: "cashout",
  },
  {
    amount: "0.200000",
    createdAt: "2026-07-22 16:30:17",
    currency: "USDT",
    finishedAt: null,
    id: "a7f81b46-92e0-4c35-af71-6d28e93b50f3",
    playerEmail: "aleksalbrecht@outlook.com",
    provider: "Coinspaid",
    status: "in-progress",
    type: "deposit",
  },
  {
    amount: "2.000000",
    createdAt: "2026-07-22 16:29:58",
    currency: "BTC",
    finishedAt: null,
    id: "962e4c18-73a5-4b02-91d6-4f87ac6e21d8",
    playerEmail: "ernestpall@gmail.com",
    provider: "Banxa",
    status: "failed",
    type: "cashout",
  },
  {
    amount: "125.500000",
    createdAt: "2026-06-30 11:02:40",
    currency: "ETH",
    finishedAt: "2026-06-30 11:03:01",
    id: "0d5a9e37-b184-4c60-ae29-7b41f",
    playerEmail: "kong_sweep@boss.com",
    provider: "Stripe",
    status: "completed",
    type: "deposit",
  },
  {
    amount: "3400.000000",
    createdAt: "2026-06-18 09:14:22",
    currency: "EUR",
    finishedAt: "2026-06-18 09:15:07",
    id: "2b8c5f01-4a93-4e77-b5d2-9c06e83a1f42",
    playerEmail: "konger@kontest.io",
    provider: "MoonPay",
    status: "completed",
    type: "cashout",
  },
  {
    amount: "0.045000",
    createdAt: "2026-06-02 21:47:11",
    currency: "USDT",
    finishedAt: null,
    id: "8e3f07b5-c261-4a98-8d70-1f45b29ce630",
    playerEmail: "mira.devlin@fastmail.com",
    provider: "Coinspaid",
    status: "in-progress",
    type: "deposit",
  },
  {
    amount: "89.900000",
    createdAt: "2026-05-27 14:33:08",
    currency: "BTC",
    finishedAt: "2026-05-27 14:33:45",
    id: "5a1d6c83-0f47-42b1-9e35-7c82a04df916",
    playerEmail: "t.okafor@proton.me",
    provider: "Banxa",
    status: "completed",
    type: "cashout",
  },
  {
    amount: "1250.000000",
    createdAt: "2026-05-11 08:21:56",
    currency: "ETH",
    finishedAt: "2026-05-11 08:22:30",
    id: "c40b8e25-7d13-4f6a-b092-38e5179ca4b7",
    playerEmail: "s.lindgren@hey.com",
    provider: "Stripe",
    status: "completed",
    type: "deposit",
  },
  {
    amount: "0.750000",
    createdAt: "2026-04-29 16:05:19",
    currency: "EUR",
    finishedAt: null,
    id: "17e9d3a6-5b82-4c04-91f7-6a20e48bd35c",
    playerEmail: "dana@northwind.io",
    provider: "MoonPay",
    status: "failed",
    type: "cashout",
  },
  {
    amount: "15.000000",
    createdAt: "2026-04-14 12:58:03",
    currency: "USDT",
    finishedAt: "2026-04-14 12:58:41",
    id: "9f2c6b40-8e15-47d3-a86b-0c73f951e2d4",
    playerEmail: "aleksalbrecht@outlook.com",
    provider: "Coinspaid",
    status: "completed",
    type: "deposit",
  },
  {
    amount: "7300.000000",
    createdAt: "2026-03-30 07:40:27",
    currency: "BTC",
    finishedAt: "2026-03-30 07:41:02",
    id: "3d7a1e58-c904-4b26-85f1-2e6094ab7cd3",
    playerEmail: "ernestpall@gmail.com",
    provider: "Banxa",
    status: "completed",
    type: "cashout",
  },
];
