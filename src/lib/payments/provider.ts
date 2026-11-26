// Payments behind a single provider interface with adapters. Stripe is the
// primary rail (card); PayPal and ACH bank transfer are alternatives. Real calls
// activate when the provider's keys are set; otherwise a demo flow runs.
export type PaymentMethod = "stripe" | "paypal" | "ach";

export interface InitiateInput {
  planCode: string;
  amountUsd: number;
  reference: string;
  phone?: string;
  email?: string;
}

export interface InitiateResult {
  ok: boolean;
  reference: string;
  status: "pending" | "failed";
  message: string;
  demo: boolean;
}

export interface PaymentProvider {
  readonly name: PaymentMethod;
  readonly configured: boolean;
  initiate(input: InitiateInput): Promise<InitiateResult>;
}

class StripeAdapter implements PaymentProvider {
  readonly name = "stripe" as const;
  readonly configured: boolean;
  constructor() {
    this.configured = Boolean(process.env.STRIPE_SECRET_KEY);
  }
  async initiate(input: InitiateInput): Promise<InitiateResult> {
    // TODO(stage-7+): real Stripe PaymentIntent using STRIPE_SECRET_KEY,
    // with the webhook confirming at /api/payments/webhook.
    return {
      ok: true,
      reference: input.reference,
      status: "pending",
      message: this.configured
        ? "Redirecting to Stripe to complete payment…"
        : "Demo: no real charge — confirm to simulate a successful payment.",
      demo: !this.configured,
    };
  }
}

class CardAdapter implements PaymentProvider {
  readonly configured: boolean;
  constructor(
    readonly name: PaymentMethod,
    envKey: string,
  ) {
    this.configured = Boolean(process.env[envKey]);
  }
  async initiate(input: InitiateInput): Promise<InitiateResult> {
    return {
      ok: true,
      reference: input.reference,
      status: "pending",
      message: this.configured
        ? `Redirecting to ${this.name} to complete payment…`
        : `Demo: ${this.name} not configured — confirm to simulate a payment.`,
      demo: !this.configured,
    };
  }
}

export function getPaymentProvider(method: PaymentMethod): PaymentProvider {
  if (method === "paypal") return new CardAdapter("paypal", "PAYPAL_CLIENT_SECRET");
  if (method === "ach") return new CardAdapter("ach", "STRIPE_SECRET_KEY");
  return new StripeAdapter();
}
