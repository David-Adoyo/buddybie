import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AlertTriangle,
  ArrowRight,
  MapPin,
  Phone,
  ShieldAlert,
  ShieldCheck,
  Timer,
  UserCheck,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

// ─── Shared primitives ────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="text-xl font-bold tracking-tight">{title}</h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-muted-foreground">
        {children}
      </div>
    </section>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <p>{children}</p>;
}

function Ul({ items }: { items: string[] }) {
  return (
    <ul className="ml-4 list-disc space-y-1">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

function LegalShell({
  badge,
  badgeColor,
  title,
  updated,
  intro,
  children,
}: {
  badge: string;
  badgeColor: string;
  title: string;
  updated: string;
  intro: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <SiteHeader />
      <main id="main-content" className="mx-auto w-full max-w-2xl flex-1 px-4 py-12">
        <div
          className={`mb-2 inline-block rounded-full border px-3 py-1 text-xs font-semibold ${badgeColor}`}
        >
          {badge}
        </div>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">{title}</h1>
        <p className="mt-1 text-xs text-muted-foreground">Last updated: {updated}</p>
        <p className="mt-4 text-muted-foreground">{intro}</p>
        {children}
        <div className="mt-16 rounded-xl border bg-muted/40 p-5 text-sm text-muted-foreground">
          <p>
            Questions about this document?{" "}
            <a href="mailto:legal@buddybie.app" className="font-medium text-foreground hover:underline">
              legal@buddybie.app
            </a>
          </p>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

// ─── Privacy Policy ───────────────────────────────────────────────────────────

function PrivacyPage() {
  return (
    <LegalShell
      badge="Privacy Policy"
      badgeColor="border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/40 dark:bg-blue-950/30 dark:text-blue-300"
      title="Privacy Policy"
      updated="27 October 2026"
      intro="Buddybie Inc. ('we', 'our', 'Buddybie') operates the Buddybie mobile and web application. This Privacy Policy explains what personal data we collect, why we collect it, how we use and protect it, and your rights under applicable US state privacy laws (including the California Consumer Privacy Act, 'CCPA') and the EU General Data Protection Regulation ('GDPR') where applicable. By creating an account you confirm you have read and understood this policy."
    >
      <Section title="1. Who we are">
        <P>Buddybie Inc. is incorporated in Delaware, United States. Our registered office and Data Protection Officer ('DPO') can be reached at <a href="mailto:dpo@buddybie.app" className="font-medium text-foreground hover:underline">dpo@buddybie.app</a>. We process personal data as a data controller and comply with applicable US federal and state privacy laws and the GDPR where applicable.</P>
      </Section>

      <Section title="2. Data we collect">
        <P><strong className="text-foreground">Account data</strong> — your phone number (used to verify your identity and send you messages), display name, profile photo and city. These are collected at sign-up and are required to use the service.</P>
        <P><strong className="text-foreground">Profile data</strong> — goals, interests, short bio, the Circles you join and your Circle-specific profile content. This content is under your control and can be edited or deleted at any time.</P>
        <P><strong className="text-foreground">Verification data</strong> — selfie images used for liveness checks, and government-issued ID documents submitted for ID verification. These are processed by our KYC provider and are not stored by Buddybie servers beyond the outcome (verified / not verified).</P>
        <P><strong className="text-foreground">Sensitive data</strong> — if you join Spark (dating) or Faith & Fellowship Circles, we process your declared relationship intent and/or faith background. This is special-category data under the DPA and GDPR. We only process it with your explicit consent, which you give when you set up those Circle profiles. You can withdraw consent and delete this data at any time in Settings → Your Data.</P>
        <P><strong className="text-foreground">Location data</strong> — your city or area (set by you during onboarding and editable). Precise GPS is only used during active SOS and check-in-timer events, and only shared with your nominated trusted contacts. We do not record or store GPS coordinates.</P>
        <P><strong className="text-foreground">Payment data</strong> — if you subscribe to a paid plan, your payment is processed by Stripe, PayPal or ACH bank transfer. We do not store full card numbers. We receive a transaction reference, plan name, amount and timestamp to maintain your subscription status.</P>
        <P><strong className="text-foreground">Usage data</strong> — anonymised analytics (pages visited, feature usage, session duration) collected to improve the service. We do not build individual behavioural profiles for advertising.</P>
        <P><strong className="text-foreground">Safety reports</strong> — when you report another member, we store the report details to allow our moderation team to review and act on them. These are kept for 12 months after resolution.</P>
      </Section>

      <Section title="3. How we use your data">
        <Ul items={[
          "To create and maintain your account and Circle memberships.",
          "To run our AI Buddy Matcher, which uses your goals, area, quiz answers and Circle choices to suggest relevant matches. The matcher does not use your photo.",
          "To send you security codes (SMS) and in-app notifications about matches, events and activity in your Circles.",
          "To process payments and maintain your subscription status.",
          "To detect and prevent fraud, scams and policy violations through automated content moderation.",
          "To comply with our legal obligations under applicable US federal and state law, including disclosures to law enforcement when we are legally required to make them.",
          "To improve the service through anonymised, aggregated analytics.",
        ]} />
      </Section>

      <Section title="4. Legal bases for processing">
        <P>We rely on the following legal bases under the DPA and GDPR:</P>
        <Ul items={[
          "Contract performance — processing necessary to provide the service you signed up for (account, matching, messaging).",
          "Explicit consent — for sensitive-category data (faith, relationship intent) and for optional analytics cookies.",
          "Legitimate interests — fraud prevention, safety moderation and service improvement, where our interests do not override your rights.",
          "Legal obligation — disclosures required by US federal or state courts or regulators.",
        ]} />
      </Section>

      <Section title="5. Sharing your data">
        <P>We do not sell your personal data. We share it only with:</P>
        <Ul items={[
          "Our KYC provider (for identity verification) — data is processed under a data-processing agreement and discarded once verification is complete.",
          "Payment processors (Stripe, PayPal) — only what is needed to process your transaction.",
          "Cloud infrastructure providers (hosting, database) — under data-processing agreements with appropriate safeguards.",
          "US federal or state law enforcement or courts — when we receive a valid legal order.",
          "Other members — only what you choose to make visible in your Circle profiles.",
        ]} />
      </Section>

      <Section title="6. Data retention">
        <P>We keep your account data for as long as your account is active. If you delete your account, we delete your personal profile data within 30 days. Anonymised, aggregated data (used for analytics) is not subject to deletion requests. Safety-report records are kept for 12 months after resolution. Payment records are kept for 7 years to meet our obligations under applicable IRS regulations and state tax laws.</P>
      </Section>

      <Section title="7. Your rights">
        <P>Under the DPA and (where applicable) GDPR you have the right to:</P>
        <Ul items={[
          "Access — request a copy of all personal data we hold about you.",
          "Correction — ask us to correct inaccurate data.",
          "Erasure — ask us to delete your data (subject to legal retention obligations).",
          "Portability — receive your data in a machine-readable format (JSON export available in Settings → Your Data).",
          "Restriction — ask us to stop processing your data in certain circumstances.",
          "Objection — object to processing based on legitimate interests.",
          "Withdraw consent — at any time for sensitive-category data, with immediate effect.",
        ]} />
        <P>To exercise these rights, use the self-service tools in Settings → Your Data, or contact our DPO at <a href="mailto:dpo@buddybie.app" className="font-medium text-foreground hover:underline">dpo@buddybie.app</a>. We will respond within 30 days. California residents may also contact the California Privacy Protection Agency; EU residents may lodge a complaint with their local supervisory authority.</P>
      </Section>

      <Section title="8. Cookies">
        <P>We use essential cookies to keep you signed in and to make the app work. We also use optional analytics cookies (only with your consent) to understand how people use Buddybie. You can change your cookie preferences at any time using the cookie banner or the footer toggle.</P>
      </Section>

      <Section title="9. Children">
        <P>Buddybie is not directed at children under 16. Spark (dating) requires users to be 18 or older and to complete ID verification. If you believe a minor has created an account, please report it to <a href="mailto:safety@buddybie.app" className="font-medium text-foreground hover:underline">safety@buddybie.app</a> immediately.</P>
      </Section>

      <Section title="10. Changes to this policy">
        <P>We will notify you by in-app message and email at least 14 days before making any material changes to this policy. Continued use of Buddybie after the effective date constitutes acceptance of the updated policy.</P>
      </Section>
    </LegalShell>
  );
}

// ─── Terms of Service ─────────────────────────────────────────────────────────

function TermsPage() {
  return (
    <LegalShell
      badge="Terms of Service"
      badgeColor="border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-900/40 dark:bg-purple-950/30 dark:text-purple-300"
      title="Terms of Service"
      updated="27 October 2026"
      intro="These Terms of Service ('Terms') govern your use of Buddybie, operated by Buddybie Limited ('Company', 'we', 'us'). By creating an account or using the service you agree to these Terms. If you do not agree, please do not use Buddybie."
    >
      <Section title="1. Eligibility">
        <P>You must be at least 16 years old to create a Buddybie account. To use the Spark (dating) Circle, you must be at least 18 years old and complete our government ID verification. By registering you confirm that you meet the applicable age requirement and that the information you provide is accurate and up to date.</P>
        <P>Buddybie is available globally. Some features (e.g. ACH bank transfers, specific event tickets) may only be available in certain countries. We reserve the right to restrict access in any jurisdiction where providing the service would violate local law.</P>
      </Section>

      <Section title="2. Your account">
        <Ul items={[
          "You are responsible for maintaining the confidentiality of your account and for all activity that occurs under it.",
          "You must not create more than one personal account. Duplicate accounts may be removed without notice.",
          "You must not impersonate any person or entity or create a profile on behalf of someone else without their permission.",
          "You must promptly notify us at safety@buddybie.app if you believe your account has been compromised.",
          "We may suspend or terminate your account if you breach these Terms or our Community Guidelines.",
        ]} />
      </Section>

      <Section title="3. Acceptable use">
        <P>You agree not to use Buddybie to:</P>
        <Ul items={[
          "Harass, threaten, abuse, stalk or intimidate any person.",
          "Solicit money, gifts, loans or financial information from other members.",
          "Post or share content that is defamatory, discriminatory, sexually explicit, violent or otherwise unlawful.",
          "Scrape, crawl or extract data from the platform by automated means.",
          "Interfere with, disable or circumvent any security feature of the service.",
          "Use the service for commercial solicitation or multi-level marketing without our prior written consent.",
          "Violate any applicable law or regulation.",
        ]} />
        <P>Violations may result in immediate account suspension and, where applicable, referral to law enforcement.</P>
      </Section>

      <Section title="4. Content you post">
        <P>You retain ownership of the content you post on Buddybie (photos, goals, messages). By posting content, you grant Buddybie a non-exclusive, royalty-free, worldwide licence to use, display and distribute your content solely to operate and improve the service. We will never sell your content to third parties or use it in external advertising without your explicit consent.</P>
        <P>You are solely responsible for the content you post. Buddybie is not liable for user-generated content, but we actively moderate it and will remove content that violates these Terms or our Community Guidelines.</P>
      </Section>

      <Section title="5. Subscriptions and payments">
        <P><strong className="text-foreground">Free tier</strong> — the core features of Buddybie are free. Paid plans unlock premium features within specific Circles.</P>
        <P><strong className="text-foreground">Billing</strong> — subscriptions are billed monthly or annually in advance. Prices are shown in USD but may be converted to your local currency at checkout. All prices are inclusive of any applicable VAT/taxes unless stated otherwise.</P>
        <P><strong className="text-foreground">Cancellation</strong> — you may cancel your subscription at any time in Settings → Plans. Cancellation takes effect at the end of your current billing period; you retain access to premium features until then.</P>
        <P><strong className="text-foreground">Refunds</strong> — see our separate <Link href="/legal/refunds" className="font-medium text-foreground hover:underline">Refund Policy</Link>.</P>
        <P><strong className="text-foreground">Price changes</strong> — we will give you at least 30 days' notice before increasing the price of an active subscription. If you do not cancel before the increase takes effect, your continued use constitutes acceptance of the new price.</P>
      </Section>

      <Section title="6. Intellectual property">
        <P>All trademarks, logos, software and design elements of Buddybie are owned by or licensed to Buddybie Limited. You must not reproduce, distribute or create derivative works from any part of Buddybie without our prior written consent.</P>
      </Section>

      <Section title="7. Safety and third-party meetups">
        <P>Buddybie facilitates connections between members, but we are not responsible for in-person meetings, events or interactions that take place outside the app. You should always exercise caution and follow the guidance in our <Link href="/legal/safety-centre" className="font-medium text-foreground hover:underline">Safety Centre</Link> before meeting anyone you have connected with online.</P>
      </Section>

      <Section title="8. Disclaimer of warranties">
        <P>Buddybie is provided 'as is' and 'as available' without warranties of any kind. We do not guarantee that the service will be uninterrupted, error-free or that any particular match will be suitable or safe. We disclaim all implied warranties to the fullest extent permitted by law.</P>
      </Section>

      <Section title="9. Limitation of liability">
        <P>To the maximum extent permitted by applicable US law, Buddybie Inc. shall not be liable for any indirect, incidental, special, consequential or punitive damages arising out of your use of the service. Our aggregate liability to you for any claim shall not exceed the amount you paid to Buddybie in the 12 months preceding the claim, or USD 100, whichever is greater.</P>
      </Section>

      <Section title="10. Governing law and disputes">
        <P>These Terms are governed by the laws of the State of Delaware, United States, without regard to conflict-of-law principles. Any dispute that cannot be resolved amicably shall be referred to the courts of Delaware. If you are based in a jurisdiction where mandatory consumer-protection laws provide you with greater rights, those rights are not affected by this clause.</P>
      </Section>

      <Section title="11. Changes to these Terms">
        <P>We may update these Terms from time to time. We will give you at least 14 days' notice of material changes via in-app notification. Your continued use of Buddybie after the effective date constitutes your acceptance of the updated Terms.</P>
      </Section>
    </LegalShell>
  );
}

// ─── Community Guidelines ─────────────────────────────────────────────────────

function CommunityPage() {
  return (
    <LegalShell
      badge="Community Guidelines"
      badgeColor="border-green-200 bg-green-50 text-green-700 dark:border-green-900/40 dark:bg-green-950/30 dark:text-green-300"
      title="Community Guidelines"
      updated="27 October 2026"
      intro="Buddybie works because people show up as their real, respectful selves. These guidelines apply to everyone on the platform — in profiles, chats, events and meetups — and exist to protect the warmth and safety that make our Circles worth joining."
    >
      <Section title="1. Be authentic">
        <P>Use your real name, a real photo and accurate information. Fake profiles harm the trust that every member depends on. Impersonating another person — whether a celebrity, a public figure or another member — is grounds for immediate removal.</P>
        <P>You may use a nickname or first name only, but your underlying identity must match the phone number and (if applicable) government ID you verified with. One account per person. Duplicate accounts will be removed.</P>
      </Section>

      <Section title="2. Be kind and respectful">
        <Ul items={[
          "Treat every member with dignity regardless of their faith, ethnicity, gender, sexual orientation, disability or background.",
          "Keep disagreements respectful. Debate ideas — never attack people.",
          "Unsolicited romantic or sexual messages to someone who has not indicated interest are harassment. Stop if asked.",
          "Hateful language, slurs and dehumanising content are not permitted anywhere on the platform.",
          "Respect that different Circles have different cultures — what is appropriate in a casual Friends Circle may not be in a Faith Circle.",
        ]} />
      </Section>

      <Section title="3. No scams or money requests">
        <P>Do not ask members for money, loans, gift cards, cryptocurrency or any other financial transfer. Do not share links to investment schemes, savings groups run outside the app, or any offer that promises financial returns. These rules apply regardless of the relationship you have built with the other person.</P>
        <P>Buddybie's in-app scam detection will flag and review messages that contain certain patterns. If you receive a money request from another member, please report it immediately using the Report button on their profile. We will freeze the account within 24 hours if the report is substantiated.</P>
      </Section>

      <Section title="4. Circles are separate — respect that">
        <P>A member's Friends Circle profile, Faith profile and Spark profile are strictly separate. You must not share information from one Circle context to another without the member's consent. This is especially important for Spark — a member's dating profile and photos must never be shared or discussed outside of Spark.</P>
        <P>Do not attempt to identify or cross-reference a member across Circles by combining information from different profiles.</P>
      </Section>

      <Section title="5. Content standards">
        <P>The following content is not permitted anywhere on Buddybie:</P>
        <Ul items={[
          "Sexually explicit imagery or descriptions unless in a designated adult context (currently none exist on Buddybie).",
          "Graphic violence or content that glorifies self-harm.",
          "Content that promotes terrorism, extremism or violent crime.",
          "Child sexual abuse material (CSAM) — we report all CSAM immediately to the National Center for Missing and Exploited Children (NCMEC), the Internet Watch Foundation and relevant authorities.",
          "Doxxing — posting another person's home address, phone number or private information without their consent.",
          "Misinformation that could cause real-world harm (e.g. false medical advice, fabricated emergency alerts).",
        ]} />
      </Section>

      <Section title="6. Events and in-person meetups">
        <P>Hosts are responsible for ensuring their events follow these guidelines. Events must be accurately described. Do not charge members for events that were advertised as free. If you host an event, you must remain present and contactable throughout.</P>
        <P>Discrimination in event access — turning away attendees because of their ethnicity, religion, disability or other protected characteristic — is a violation of these guidelines and may violate applicable federal or state civil rights laws.</P>
      </Section>

      <Section title="7. Reporting and our response">
        <P>Every profile has a Report button. We review all reports within 24 hours. If a report relates to an immediate safety risk, we prioritise it and can freeze an account within the hour. When you report someone, the report is confidential — the reported person cannot see who reported them.</P>
        <P>You can also email <a href="mailto:safety@buddybie.app" className="font-medium text-foreground hover:underline">safety@buddybie.app</a> for anything that needs more context than the in-app form allows.</P>
      </Section>

      <Section title="8. Enforcement">
        <P>We use a graduated approach:</P>
        <Ul items={[
          "Warning — for first or minor violations. The content is removed and the member is notified.",
          "Temporary suspension — for repeated violations or more serious single incidents. Duration depends on severity (24 hours to 30 days).",
          "Permanent ban — for the most serious violations (CSAM, repeated harassment after suspension, confirmed scam accounts, doxxing).",
          "Law enforcement referral — where there is evidence of criminal activity.",
        ]} />
        <P>You may appeal a moderation decision by emailing <a href="mailto:appeals@buddybie.app" className="font-medium text-foreground hover:underline">appeals@buddybie.app</a> within 14 days. We aim to respond to appeals within 5 business days.</P>
      </Section>
    </LegalShell>
  );
}

// ─── Refund Policy ────────────────────────────────────────────────────────────

function RefundsPage() {
  return (
    <LegalShell
      badge="Refund Policy"
      badgeColor="border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-900/40 dark:bg-orange-950/30 dark:text-orange-300"
      title="Refund Policy"
      updated="27 October 2026"
      intro="We want you to feel confident paying for Buddybie. This policy sets out when refunds are available, how to request one and how quickly you can expect to receive it."
    >
      <Section title="1. Monthly subscriptions">
        <P>Monthly subscriptions can be cancelled at any time. When you cancel, your access to paid features continues until the end of your current billing period — you will not be charged again after that. We do not offer partial-month refunds for cancellations mid-period.</P>
        <P><strong className="text-foreground">Exception — first-time purchase:</strong> if you purchase a monthly subscription for the first time and cancel within 48 hours, you are entitled to a full refund if you have not used the premium features of that plan. Contact us at <a href="mailto:billing@buddybie.app" className="font-medium text-foreground hover:underline">billing@buddybie.app</a> within the 48-hour window to claim this.</P>
      </Section>

      <Section title="2. Annual subscriptions">
        <P>Annual subscriptions are pre-paid and discounted (~30% off the monthly rate). If you cancel within 14 days of your annual renewal date and have made minimal use of the plan during that period, we will refund the unused portion on a pro-rata basis. After 14 days, annual subscriptions are non-refundable, but you retain access until the end of your subscription year.</P>
      </Section>

      <Section title="3. Event tickets">
        <P>Tickets for Buddybie events are sold with the following refund rules:</P>
        <Ul items={[
          "More than 72 hours before the event — full refund, minus a 5% platform fee + $0.30 processing charge.",
          "24–72 hours before the event — 50% refund.",
          "Less than 24 hours before the event — no refund, but you may transfer your ticket to another verified member by contacting the event host.",
          "Event cancelled by host or Buddybie — full refund including all fees, within 5 business days.",
          "Event rescheduled by host — you may request a full refund within 48 hours of the rescheduling announcement.",
        ]} />
      </Section>

      <Section title="4. Table Pass (Buddy Table subscription)">
        <P>The Table Pass is a monthly rolling subscription for unlimited Buddy Table dinners and coffees. It follows the same cancellation rules as monthly subscriptions. No-show fees (where applicable) are non-refundable.</P>
      </Section>

      <Section title="5. How to request a refund">
        <P>The quickest way is through the in-app Admin console (if you have moderator access) or by emailing <a href="mailto:billing@buddybie.app" className="font-medium text-foreground hover:underline">billing@buddybie.app</a> with:</P>
        <Ul items={[
          "Your registered phone number.",
          "The plan name or event name.",
          "The date of purchase and approximate amount.",
          "A brief reason for your request.",
        ]} />
        <P>We process refund requests within 5 business days. Refunds are returned to the original payment method — Stripe card refund or PayPal refund. Processing times after we approve the refund depend on your payment provider (typically 1–10 business days).</P>
      </Section>

      <Section title="6. Disputes">
        <P>If you disagree with a refund decision, email <a href="mailto:billing@buddybie.app" className="font-medium text-foreground hover:underline">billing@buddybie.app</a> with 'DISPUTE' in the subject line. We will escalate to a senior member of the team and respond within 5 business days. If we cannot resolve the dispute, you retain the right to raise it with your payment provider or the relevant consumer protection authority in your country.</P>
      </Section>

      <Section title="7. Subscriptions obtained fraudulently">
        <P>If we determine that a subscription was obtained through fraud, manipulation of our payment systems or violation of these Terms, we reserve the right to cancel the subscription without a refund and to take further action including account termination.</P>
      </Section>
    </LegalShell>
  );
}

// ─── Safety Centre ────────────────────────────────────────────────────────────

function SafetyCentrePage() {
  const tips = [
    {
      icon: MapPin,
      color: "text-brand-teal",
      bg: "bg-brand-teal/10",
      heading: "Always meet in a busy public place",
      body: "For a first meeting, choose a busy café, restaurant, shopping centre or any well-lit, open public venue with other people around. Avoid private addresses, secluded parks or locations you cannot easily leave. If someone pressures you to meet somewhere isolated, treat that as a serious warning sign.",
    },
    {
      icon: UserCheck,
      color: "text-primary",
      bg: "bg-primary/10",
      heading: "Verify before you meet",
      body: "Check the other person's verification badge in their profile. Selfie-verified members have completed a liveness check; ID-verified members have confirmed their government ID. Higher verification = greater accountability. Consider meeting verified members first — especially for Spark (dating) meetups.",
    },
    {
      icon: Phone,
      color: "text-accent",
      bg: "bg-accent/10",
      heading: "Tell someone trusted where you are going",
      body: 'Before every meetup, let a trusted friend or family member know: who you are meeting, where you are going, and when you expect to be back. Use the "Share my plan" feature in your Safety Kit to copy a message you can send them in seconds. Ask them to check in if they have not heard from you by a set time.',
    },
    {
      icon: Timer,
      color: "text-secondary-foreground",
      bg: "bg-secondary",
      heading: "Set a check-in timer",
      body: 'Start the check-in timer in your Safety Kit before you head out. If you do not tap "I am safe" before the timer runs out, Buddybie will prompt your trusted contacts. It takes 10 seconds to set up and could make a real difference.',
    },
    {
      icon: ArrowRight,
      color: "text-brand-teal",
      bg: "bg-brand-teal/10",
      heading: "Arrive and leave independently",
      body: "On a first meeting, make your own way there and back — do not accept a lift from someone you have just met online, and do not feel obligated to share a taxi home. Keep your initial meetings to public spaces and daytime hours if you can.",
    },
    {
      icon: ShieldAlert,
      color: "text-destructive",
      bg: "bg-destructive/10",
      heading: "Romance-scam and money-request warning signs",
      body: "Be extremely cautious if someone you have met on Buddybie: asks you to send money or gift cards for any reason; claims to be in an emergency (medical bill, stuck abroad, family crisis); wants to move the conversation off-app very quickly; sends unusually flattering messages early on; or avoids video calls. Never send money to someone you have not met in person — no matter how compelling their story sounds.",
    },
    {
      icon: ShieldCheck,
      color: "text-destructive",
      bg: "bg-destructive/10",
      heading: "In-app SOS",
      body: "If you ever feel unsafe during or after a meetup, open the Safety page, go to the Safety Kit tab and press the SOS button. This shares your live location with your trusted contacts immediately. You can also report the person directly from their profile — reports are reviewed by our team within 24 hours and accounts are frozen where there is risk of harm.",
    },
  ];

  return (
    <>
      <SiteHeader />
      <main id="main-content" className="mx-auto w-full max-w-2xl flex-1 px-4 py-12">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-brand-teal/30 bg-brand-teal/10 px-3 py-1 text-sm font-medium text-brand-teal">
          <ShieldCheck className="size-4" aria-hidden />
          Safety Centre
        </div>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">
          Meeting people safely
        </h1>
        <p className="mt-3 text-muted-foreground">
          Buddybie connects you with real people for real meetups — and we take that
          responsibility seriously. Please read these guidelines before attending any
          event, dinner or one-to-one meeting arranged through the app.
        </p>

        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/80 px-4 py-3 dark:border-amber-900/40 dark:bg-amber-950/30">
          <p className="flex items-start gap-2 text-sm font-semibold text-amber-800 dark:text-amber-200">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-500" aria-hidden />
            Important — please read before your first meetup
          </p>
          <p className="mt-1 text-sm text-amber-700 dark:text-amber-300">
            No verification system is perfect. Even among verified members, exercise
            the same caution you would with any new acquaintance. Your instincts are
            your first line of defence.
          </p>
        </div>

        <ol className="mt-10 space-y-8">
          {tips.map((tip, i) => {
            const Icon = tip.icon;
            return (
              <li key={tip.heading} className="flex gap-4">
                <div
                  className={`flex size-10 shrink-0 items-center justify-center rounded-full ${tip.bg} ${tip.color}`}
                  aria-hidden
                >
                  <Icon className="size-5" />
                </div>
                <div>
                  <h2 className="font-semibold">
                    <span className="mr-2 tabular-nums text-muted-foreground">{i + 1}.</span>
                    {tip.heading}
                  </h2>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {tip.body}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>

        <div className="mt-12 rounded-xl border bg-secondary/60 p-6 text-center">
          <ShieldCheck className="mx-auto mb-3 size-8 text-brand-teal" aria-hidden />
          <h2 className="font-bold">Use your Safety Kit</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Share your plan, set a check-in timer and keep trusted contacts one tap away
            — before every meetup, every time.
          </p>
          <Link
            href="/safety"
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-brand-teal px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            Open my Safety Kit
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          If you believe you are in immediate danger, call{" "}
          <a href="tel:911" className="font-medium text-foreground hover:underline">
            911
          </a>{" "}
          (US emergency services) or your local emergency number. Buddybie is not a substitute for emergency services.
        </p>
      </main>
      <SiteFooter />
    </>
  );
}

// ─── Router ───────────────────────────────────────────────────────────────────

const PAGE_MAP: Record<string, () => React.ReactElement> = {
  privacy: () => <PrivacyPage />,
  terms: () => <TermsPage />,
  community: () => <CommunityPage />,
  refunds: () => <RefundsPage />,
  "safety-centre": () => <SafetyCentrePage />,
};

export function generateStaticParams() {
  return Object.keys(PAGE_MAP).map((doc) => ({ doc }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ doc: string }>;
}): Promise<Metadata> {
  const { doc } = await params;
  const titles: Record<string, { title: string; description: string }> = {
    privacy: { title: "Privacy Policy", description: "How Buddybie collects, uses and protects your personal data under US and EU privacy laws." },
    terms: { title: "Terms of Service", description: "The rules and agreements that govern your use of Buddybie." },
    community: { title: "Community Guidelines", description: "How we keep Circles safe, warm and welcoming for everyone." },
    refunds: { title: "Refund Policy", description: "When and how refunds are issued for subscriptions, event tickets and other purchases." },
    "safety-centre": { title: "Safety Centre", description: "How to meet people safely on Buddybie — public spaces, safety tools and what to do if something goes wrong." },
  };
  return titles[doc] ?? { title: "Not found" };
}

export default async function LegalDocPage({
  params,
}: {
  params: Promise<{ doc: string }>;
}) {
  const { doc } = await params;
  const render = PAGE_MAP[doc];
  if (!render) notFound();
  return render();
}
