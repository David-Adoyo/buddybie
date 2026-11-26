"use server";

import { getKycProvider, type KycResult, type KycStep } from "@/lib/kyc/provider";

/**
 * Start a verification step through the configured KYC provider. In demo mode
 * this returns an instant pass; with Smile ID keys set it delegates to Smile ID.
 */
export async function startVerification(step: KycStep): Promise<KycResult> {
  const provider = getKycProvider();
  return provider.start(step, "current-user");
}
