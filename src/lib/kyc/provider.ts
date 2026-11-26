// KYC behind a provider interface. Smile ID is the launch provider (ID + selfie
// liveness for Kenya); a demo provider stands in until {{SMILE_ID_*}} keys are
// set. Swapping providers is a single factory change.
export type KycStep = "selfie" | "id";

export interface KycResult {
  status: "pending" | "verified" | "rejected";
  providerRef?: string;
  message?: string;
}

export interface KycProvider {
  readonly name: string;
  readonly configured: boolean;
  start(step: KycStep, userId: string): Promise<KycResult>;
}

/** Demo provider: simulates an instant pass so onboarding is previewable. */
class DemoKycProvider implements KycProvider {
  readonly name = "demo";
  readonly configured = true;
  async start(step: KycStep): Promise<KycResult> {
    return {
      status: "verified",
      providerRef: `demo-${step}`,
      message: "Demo verification — no real check performed.",
    };
  }
}

/** Smile ID provider. Wire the real SDK/API here once keys are configured. */
class SmileIdProvider implements KycProvider {
  readonly name = "smile-id";
  readonly configured: boolean;
  constructor(
    private partnerId: string,
    private apiKey: string,
  ) {
    this.configured = partnerId.length > 0 && apiKey.length > 0;
  }
  async start(step: KycStep): Promise<KycResult> {
    // TODO(stage-3+): call Smile ID (job types 1/4/5) with this.partnerId/apiKey
    // and return the real job status. Kept as a stub so no keys are invented.
    return {
      status: "pending",
      message: `Smile ID ${step} check queued (provider wiring pending).`,
    };
  }
}

export function getKycProvider(): KycProvider {
  const partnerId = process.env.SMILE_ID_PARTNER_ID ?? "";
  const apiKey = process.env.SMILE_ID_API_KEY ?? "";
  if (partnerId && apiKey) return new SmileIdProvider(partnerId, apiKey);
  return new DemoKycProvider();
}
