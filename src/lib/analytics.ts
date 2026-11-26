// Analytics + error monitoring stubs. No-ops until keys are set; wire PostHog
// and Sentry here at launch. Keeping a single seam avoids sprinkling vendor
// calls through the app. See /docs/PLACEHOLDERS.md.
const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY ?? "";
const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN ?? "";

export const analyticsConfigured = POSTHOG_KEY.length > 0;
export const errorMonitoringConfigured = SENTRY_DSN.length > 0;

/** Track a product event (weekly-metrics funnel). No-op until PostHog is set. */
export function track(event: string, props?: Record<string, unknown>) {
  if (!analyticsConfigured) return;
  // TODO(stage-9+): posthog.capture(event, props) once the SDK is initialised.
  void event;
  void props;
}

/** Report a handled error. No-op until Sentry is set. */
export function captureError(error: unknown) {
  if (!errorMonitoringConfigured) return;
  // TODO(stage-9+): Sentry.captureException(error).
  void error;
}
