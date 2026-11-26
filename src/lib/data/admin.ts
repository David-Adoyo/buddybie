// Demo data + state for the host and admin dashboards. The real dashboards read
// Supabase under RLS (staff/host/org-admin roles); this backs the preview.
import { launchCircles } from "@/data/circles";

// ===========================================================================
// ADMIN CONSOLE — Types & Demo Data
// ===========================================================================

export type UserStatus = "active" | "suspended" | "banned" | "pending" | "flagged";
export type RiskLevel = "low" | "medium" | "high" | "critical";
export type LoginFlag = "normal" | "new_device" | "new_location" | "suspicious" | "blocked";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  joinedAt: number;
  lastSeenAt: number;
  status: UserStatus;
  verifiedLevel: 1 | 2 | 3;
  circles: string[];
  planCode: string | null;
  trustScore: number;
  reports: number;
  warnings: number;
  city: string;
  riskLevel: RiskLevel;
  notes?: string;
}

export interface LoginEvent {
  id: string;
  userId: string;
  userName: string;
  at: number;
  ip: string;
  city: string;
  device: string;
  flag: LoginFlag;
  action: "sign_in" | "sign_out" | "otp_fail" | "otp_success" | "blocked";
}

export interface AdminReport {
  id: string;
  reporterId: string;
  reporterName: string;
  targetId: string;
  targetName: string;
  targetType: "user" | "message" | "goal" | "photo" | "event";
  reason: string;
  details: string;
  status: "open" | "reviewing" | "actioned" | "dismissed";
  severity: "low" | "medium" | "high";
  createdAt: number;
}

export interface AdminFlag {
  id: string;
  kind: "message" | "photo" | "goal" | "profile_bio" | "event_description";
  excerpt: string;
  labels: string[];
  severity: "low" | "medium" | "high";
  status: "pending" | "approved" | "removed";
  userId: string;
  userName: string;
  aiScreened: boolean;
  createdAt: number;
}

export interface VerificationRequest {
  id: string;
  userId: string;
  userName: string;
  step: "selfie" | "id";
  submittedAt: number;
  status: "pending" | "approved" | "rejected";
  imageNote: string;
  city: string;
}

export interface AdminSubscription {
  id: string;
  userId: string;
  userName: string;
  planCode: string;
  planName: string;
  interval: "monthly" | "annual";
  amountUsd: number;
  startedAt: number;
  nextBillingAt: number;
  status: "active" | "cancelled" | "past_due" | "refund_requested";
  paymentMethod: string;
  refundReason?: string;
}

export interface PlatformMetrics {
  dau: number;
  mau: number;
  newUsersToday: number;
  newUsersWeek: number;
  mrrUsd: number;
  totalMembers: number;
  suspendedCount: number;
  bannedCount: number;
  reportsOpen: number;
  flagsPending: number;
  verificationsPending: number;
  topCircle: string;
}

export interface AuditEntry {
  id: string;
  at: number;
  action: string;
  target: string;
  by: string;
  note?: string;
}

// ---------------------------------------------------------------------------
// Seed constants
// ---------------------------------------------------------------------------

const _NOW = Date.now();
const _D = (days: number) => _NOW - days * 86_400_000;
const _H = (hours: number) => _NOW - hours * 3_600_000;

const SEED_USERS: AdminUser[] = [
  { id: "u1",  name: "Amara Osei",       email: "amara.osei@email.com",   phone: "+1 555-0101", joinedAt: _D(90),  lastSeenAt: _H(2),  status: "active",    verifiedLevel: 3, circles: ["friends","fitness","goals"],            planCode: "friends-monthly",  trustScore: 92, reports: 0, warnings: 0, city: "London",        riskLevel: "low" },
  { id: "u2",  name: "Diego Herrera",    email: "diego.h@email.com",      phone: "+1 555-0102", joinedAt: _D(60),  lastSeenAt: _H(5),  status: "active",    verifiedLevel: 2, circles: ["work","business"],                      planCode: "all-access",       trustScore: 78, reports: 1, warnings: 0, city: "New York",      riskLevel: "low" },
  { id: "u3",  name: "Nadia Petrov",     email: "nadia.p@email.com",      phone: "+1 555-0103", joinedAt: _D(45),  lastSeenAt: _D(3),  status: "flagged",   verifiedLevel: 1, circles: ["spark","friends"],                      planCode: null,               trustScore: 44, reports: 3, warnings: 2, city: "Dubai",         riskLevel: "high",    notes: "Multiple location-hop logins (Moscow → Dubai → HK in 48 h). Possibly sharing credentials." },
  { id: "u4",  name: "James Okonkwo",    email: "james.ok@email.com",     phone: "+1 555-0104", joinedAt: _D(120), lastSeenAt: _H(1),  status: "active",    verifiedLevel: 3, circles: ["faith","goals","volunteering"],         planCode: "faith-annual",     trustScore: 96, reports: 0, warnings: 0, city: "Lagos",         riskLevel: "low" },
  { id: "u5",  name: "Sofia Andersson",  email: "sofia.a@email.com",      phone: "+1 555-0105", joinedAt: _D(30),  lastSeenAt: _H(8),  status: "suspended", verifiedLevel: 2, circles: ["spark","friends"],                      planCode: null,               trustScore: 22, reports: 5, warnings: 3, city: "Stockholm",     riskLevel: "critical", notes: "Suspended 2026-10-20 — strike 3 for repeated solicitation in Spark." },
  { id: "u6",  name: "Marcus Webb",      email: "marcus.w@email.com",     phone: "+1 555-0106", joinedAt: _D(75),  lastSeenAt: _H(12), status: "active",    verifiedLevel: 2, circles: ["fitness","goals"],                      planCode: "fitness-monthly",  trustScore: 81, reports: 0, warnings: 0, city: "Atlanta",       riskLevel: "low" },
  { id: "u7",  name: "Priya Nair",       email: "priya.n@email.com",      phone: "+1 555-0107", joinedAt: _D(15),  lastSeenAt: _H(3),  status: "pending",   verifiedLevel: 1, circles: ["students"],                             planCode: null,               trustScore: 55, reports: 0, warnings: 0, city: "Dubai",         riskLevel: "low" },
  { id: "u8",  name: "Chen Wei",         email: "chen.w@email.com",       phone: "+1 555-0108", joinedAt: _D(200), lastSeenAt: _H(6),  status: "active",    verifiedLevel: 3, circles: ["work","gaming","business"],             planCode: "all-access-gold",  trustScore: 89, reports: 0, warnings: 0, city: "Singapore",     riskLevel: "low" },
  { id: "u9",  name: "Fatima Al-Hassan", email: "fatima.ah@email.com",    phone: "+1 555-0109", joinedAt: _D(50),  lastSeenAt: _D(1),  status: "flagged",   verifiedLevel: 1, circles: ["spark"],                                planCode: null,               trustScore: 31, reports: 4, warnings: 2, city: "Dubai",         riskLevel: "high",    notes: "3× OTP failures + blocked. Money-request language detected by AI screen." },
  { id: "u10", name: "Kwame Asante",     email: "kwame.a@email.com",      phone: "+1 555-0110", joinedAt: _D(95),  lastSeenAt: _H(24), status: "active",    verifiedLevel: 3, circles: ["friends","arts","diaspora"],            planCode: "friends-monthly",  trustScore: 87, reports: 1, warnings: 0, city: "Accra",         riskLevel: "low" },
  { id: "u11", name: "Lena Schmidt",     email: "lena.s@email.com",       phone: "+1 555-0111", joinedAt: _D(22),  lastSeenAt: _H(4),  status: "active",    verifiedLevel: 2, circles: ["fitness","travel"],                     planCode: null,               trustScore: 74, reports: 0, warnings: 0, city: "Berlin",        riskLevel: "low" },
  { id: "u12", name: "Omar Idrissi",     email: "omar.i@email.com",       phone: "+1 555-0112", joinedAt: _D(8),   lastSeenAt: _H(2),  status: "banned",    verifiedLevel: 1, circles: ["spark"],                                planCode: null,               trustScore: 5,  reports: 9, warnings: 3, city: "Casablanca",    riskLevel: "critical", notes: "Permanent ban 2026-10-25 — confirmed scammer, impersonation + money-request pattern." },
  { id: "u13", name: "Zara Patel",       email: "zara.p@email.com",       phone: "+1 555-0113", joinedAt: _D(40),  lastSeenAt: _H(10), status: "active",    verifiedLevel: 2, circles: ["parents","friends"],                    planCode: "friends-monthly",  trustScore: 83, reports: 0, warnings: 0, city: "Toronto",       riskLevel: "low" },
  { id: "u14", name: "Ethan Cole",       email: "ethan.c@email.com",      phone: "+1 555-0114", joinedAt: _D(5),   lastSeenAt: _H(1),  status: "active",    verifiedLevel: 1, circles: ["work"],                                 planCode: null,               trustScore: 60, reports: 0, warnings: 0, city: "Chicago",       riskLevel: "low" },
  { id: "u15", name: "Aisha Kamara",     email: "aisha.k@email.com",      phone: "+1 555-0115", joinedAt: _D(180), lastSeenAt: _H(3),  status: "active",    verifiedLevel: 3, circles: ["faith","support","friends"],            planCode: "all-access",       trustScore: 98, reports: 0, warnings: 0, city: "Freetown",      riskLevel: "low" },
  { id: "u16", name: "Tomas Novak",      email: "tomas.n@email.com",      phone: "+1 555-0116", joinedAt: _D(12),  lastSeenAt: _D(2),  status: "flagged",   verifiedLevel: 1, circles: ["spark","friends"],                      planCode: null,               trustScore: 38, reports: 2, warnings: 1, city: "Prague",        riskLevel: "medium" },
  { id: "u17", name: "Grace Ochieng",    email: "grace.o@email.com",      phone: "+1 555-0117", joinedAt: _D(65),  lastSeenAt: _H(7),  status: "active",    verifiedLevel: 2, circles: ["goals","fitness","students"],           planCode: "goals-monthly",    trustScore: 79, reports: 0, warnings: 0, city: "Nairobi",       riskLevel: "low" },
  { id: "u18", name: "Ryan Cho",         email: "ryan.c@email.com",       phone: "+1 555-0118", joinedAt: _D(28),  lastSeenAt: _H(15), status: "active",    verifiedLevel: 2, circles: ["gaming","work"],                        planCode: null,               trustScore: 71, reports: 0, warnings: 0, city: "Seoul",         riskLevel: "low" },
  { id: "u19", name: "Blessing Eze",     email: "blessing.e@email.com",   phone: "+1 555-0119", joinedAt: _D(55),  lastSeenAt: _H(9),  status: "suspended", verifiedLevel: 2, circles: ["buddy-table","friends"],               planCode: null,               trustScore: 29, reports: 4, warnings: 3, city: "Abuja",         riskLevel: "high",    notes: "Suspended for no-show abuse — 4 events in 2 weeks with zero check-ins." },
  { id: "u20", name: "Isla MacLeod",     email: "isla.m@email.com",       phone: "+1 555-0120", joinedAt: _D(110), lastSeenAt: _H(6),  status: "active",    verifiedLevel: 3, circles: ["arts","friends","travel"],             planCode: "all-access",       trustScore: 91, reports: 0, warnings: 0, city: "Edinburgh",     riskLevel: "low" },
  { id: "u21", name: "Victor Adeyemi",   email: "victor.a@email.com",     phone: "+1 555-0121", joinedAt: _D(3),   lastSeenAt: _H(1),  status: "pending",   verifiedLevel: 1, circles: ["work","friends"],                       planCode: null,               trustScore: 50, reports: 0, warnings: 0, city: "Lagos",         riskLevel: "low" },
  { id: "u22", name: "Mei Lin",          email: "mei.l@email.com",        phone: "+1 555-0122", joinedAt: _D(85),  lastSeenAt: _H(11), status: "active",    verifiedLevel: 3, circles: ["fitness","goals","diaspora"],           planCode: "fitness-annual",   trustScore: 88, reports: 0, warnings: 0, city: "Sydney",        riskLevel: "low" },
  { id: "u23", name: "Ahmed Saleh",      email: "ahmed.s@email.com",      phone: "+1 555-0123", joinedAt: _D(18),  lastSeenAt: _D(1),  status: "flagged",   verifiedLevel: 1, circles: ["spark","friends"],                      planCode: null,               trustScore: 27, reports: 3, warnings: 2, city: "Cairo",         riskLevel: "high",    notes: "Urgency-pattern messages flagged 3× in 48 h. Two users reported identical script." },
  { id: "u24", name: "Isabella Cruz",    email: "isabella.c@email.com",   phone: "+1 555-0124", joinedAt: _D(42),  lastSeenAt: _H(4),  status: "active",    verifiedLevel: 2, circles: ["parents","arts"],                       planCode: null,               trustScore: 76, reports: 0, warnings: 0, city: "Mexico City",   riskLevel: "low" },
];

const SEED_LOGINS: LoginEvent[] = [
  { id: "l1",  userId: "u1",  userName: "Amara Osei",       at: _H(2),              ip: "82.45.112.34",   city: "London",      device: "iPhone 15 · Safari",      flag: "normal",       action: "sign_in" },
  { id: "l2",  userId: "u3",  userName: "Nadia Petrov",     at: _H(3),              ip: "91.108.4.198",   city: "Moscow",      device: "Android · Chrome",         flag: "new_location", action: "sign_in" },
  { id: "l3",  userId: "u9",  userName: "Fatima Al-Hassan", at: _H(4),              ip: "5.21.78.90",     city: "Dubai",       device: "Unknown Device",                flag: "suspicious",   action: "otp_fail" },
  { id: "l4",  userId: "u9",  userName: "Fatima Al-Hassan", at: _H(4) + 300_000,    ip: "5.21.78.90",     city: "Dubai",       device: "Unknown Device",                flag: "suspicious",   action: "otp_fail" },
  { id: "l5",  userId: "u9",  userName: "Fatima Al-Hassan", at: _H(4) + 600_000,    ip: "5.21.78.90",     city: "Dubai",       device: "Unknown Device",                flag: "blocked",      action: "blocked" },
  { id: "l6",  userId: "u12", userName: "Omar Idrissi",     at: _H(6),              ip: "197.32.56.77",   city: "Casablanca",  device: "Android · Firefox",        flag: "suspicious",   action: "sign_in" },
  { id: "l7",  userId: "u4",  userName: "James Okonkwo",    at: _H(1),              ip: "154.72.8.210",   city: "Lagos",       device: "iPhone 14 · Safari",       flag: "normal",       action: "sign_in" },
  { id: "l8",  userId: "u5",  userName: "Sofia Andersson",  at: _H(8),              ip: "46.227.68.33",   city: "Stockholm",   device: "MacBook · Chrome",         flag: "new_device",   action: "sign_in" },
  { id: "l9",  userId: "u16", userName: "Tomas Novak",      at: _H(5),              ip: "88.102.14.22",   city: "Prague",      device: "Unknown Device",                flag: "suspicious",   action: "otp_fail" },
  { id: "l10", userId: "u16", userName: "Tomas Novak",      at: _H(5) + 120_000,    ip: "88.102.14.22",   city: "Prague",      device: "Unknown Device",                flag: "suspicious",   action: "otp_success" },
  { id: "l11", userId: "u2",  userName: "Diego Herrera",    at: _H(5),              ip: "68.90.214.55",   city: "New York",    device: "Windows · Chrome",         flag: "normal",       action: "sign_in" },
  { id: "l12", userId: "u8",  userName: "Chen Wei",         at: _H(6),              ip: "175.41.220.14",  city: "Singapore",   device: "MacBook Pro · Safari",     flag: "normal",       action: "sign_in" },
  { id: "l13", userId: "u23", userName: "Ahmed Saleh",      at: _H(24),             ip: "196.220.108.55", city: "Cairo",       device: "Android · Chrome",         flag: "new_device",   action: "sign_in" },
  { id: "l14", userId: "u23", userName: "Ahmed Saleh",      at: _H(20),             ip: "41.33.198.77",   city: "Alexandria",  device: "Android · Chrome",         flag: "new_location", action: "sign_in" },
  { id: "l15", userId: "u15", userName: "Aisha Kamara",     at: _H(3),              ip: "197.149.96.44",  city: "Freetown",    device: "iPhone 13 · Safari",       flag: "normal",       action: "sign_in" },
  { id: "l16", userId: "u20", userName: "Isla MacLeod",     at: _H(6),              ip: "86.178.220.33",  city: "Edinburgh",   device: "MacBook · Chrome",         flag: "normal",       action: "sign_in" },
  { id: "l17", userId: "u19", userName: "Blessing Eze",     at: _D(2),              ip: "105.112.88.44",  city: "Abuja",       device: "Android · Chrome",         flag: "new_device",   action: "sign_in" },
  { id: "l18", userId: "u3",  userName: "Nadia Petrov",     at: _D(1),              ip: "103.77.12.200",  city: "Hong Kong",   device: "iPhone · Safari",          flag: "suspicious",   action: "sign_in" },
  { id: "l19", userId: "u3",  userName: "Nadia Petrov",     at: _D(1) + 1_800_000,  ip: "91.108.4.198",   city: "Dubai",       device: "Android · Chrome",         flag: "suspicious",   action: "sign_in" },
  { id: "l20", userId: "u6",  userName: "Marcus Webb",      at: _H(12),             ip: "72.21.198.66",   city: "Atlanta",     device: "iPhone 15 · Safari",       flag: "normal",       action: "sign_in" },
];

const SEED_REPORTS: AdminReport[] = [
  { id: "r1",  reporterId: "u1",  reporterName: "Amara Osei",    targetId: "u3",  targetName: "Nadia Petrov",     targetType: "user",    reason: "Requesting money",          details: "Sent multiple messages asking me to wire money for an emergency — classic scam pattern.",                           status: "reviewing", severity: "high",   createdAt: _H(6) },
  { id: "r2",  reporterId: "u7",  reporterName: "Priya Nair",    targetId: "u9",  targetName: "Fatima Al-Hassan", targetType: "message", reason: "Scam / money request",      details: "User asked me to send Bitcoin within 30 minutes citing a ‘stranded’ emergency.",                                    status: "open",      severity: "high",   createdAt: _H(4) },
  { id: "r3",  reporterId: "u10", reporterName: "Kwame Asante",  targetId: "u5",  targetName: "Sofia Andersson",  targetType: "user",    reason: "Harassment",                details: "Repeated unwanted messages after I asked them to stop contacting me.",                                             status: "actioned",  severity: "medium", createdAt: _D(5) },
  { id: "r4",  reporterId: "u13", reporterName: "Zara Patel",    targetId: "u16", targetName: "Tomas Novak",      targetType: "message", reason: "Inappropriate content",     details: "Sent a sexually explicit message in the Friends circle chat.",                                                    status: "open",      severity: "high",   createdAt: _H(8) },
  { id: "r5",  reporterId: "u2",  reporterName: "Diego Herrera", targetId: "u19", targetName: "Blessing Eze",     targetType: "event",   reason: "No-show abuse",             details: "RSVPd to our dinner event and did not attend — third time this month.",                                            status: "actioned",  severity: "low",    createdAt: _D(3) },
  { id: "r6",  reporterId: "u15", reporterName: "Aisha Kamara",  targetId: "u23", targetName: "Ahmed Saleh",      targetType: "user",    reason: "Urgency pressure / scam",   details: "Messaged me within minutes of matching, claimed urgent financial need and asked for my mobile banking number.", status: "reviewing", severity: "high",   createdAt: _H(10) },
  { id: "r7",  reporterId: "u4",  reporterName: "James Okonkwo", targetId: "u12", targetName: "Omar Idrissi",     targetType: "user",    reason: "Fake identity",             details: "Profile photos appear to be stolen from a public Instagram account.",                                             status: "actioned",  severity: "high",   createdAt: _D(7) },
  { id: "r8",  reporterId: "u11", reporterName: "Lena Schmidt",  targetId: "u3",  targetName: "Nadia Petrov",     targetType: "goal",    reason: "Spam / promotional",        details: "Posted a goal that was entirely an advert for an MLM scheme.",                                                    status: "dismissed", severity: "medium", createdAt: _D(2) },
  { id: "r9",  reporterId: "u22", reporterName: "Mei Lin",       targetId: "u18", targetName: "Ryan Cho",         targetType: "message", reason: "Off-app solicitation",      details: "Immediately asked me to switch to WhatsApp and share my phone number.",                                            status: "open",      severity: "medium", createdAt: _H(14) },
  { id: "r10", reporterId: "u8",  reporterName: "Chen Wei",      targetId: "u23", targetName: "Ahmed Saleh",      targetType: "user",    reason: "Multiple scam flags",       details: "Two other members reported the same user today for identical money-request messages.",                               status: "reviewing", severity: "high",   createdAt: _H(18) },
  { id: "r11", reporterId: "u17", reporterName: "Grace Ochieng", targetId: "u9",  targetName: "Fatima Al-Hassan", targetType: "message", reason: "Suspicious behaviour",      details: "Asked for my mobile banking number to ‘send me a gift’.",                                                        status: "open",      severity: "high",   createdAt: _H(2) },
  { id: "r12", reporterId: "u24", reporterName: "Isabella Cruz", targetId: "u16", targetName: "Tomas Novak",      targetType: "photo",   reason: "Inappropriate photo",       details: "Profile photo contains nudity not suitable for a community platform.",                                             status: "open",      severity: "high",   createdAt: _H(5) },
];

const SEED_FLAGS: AdminFlag[] = [
  { id: "f1",  userId: "u9",  userName: "Fatima Al-Hassan", kind: "message",           excerpt: "I'm stranded at the airport — please send $200 on Zelle, I'll pay back tomorrow.",  labels: ["scam","money","urgency"],    severity: "high",   status: "pending",  aiScreened: true,  createdAt: _H(4) },
  { id: "f2",  userId: "u3",  userName: "Nadia Petrov",     kind: "message",           excerpt: "Hey babe, text me on WhatsApp at +1 555-…, my account is being watched.",             labels: ["off-app","suspicious"],      severity: "medium", status: "pending",  aiScreened: true,  createdAt: _H(7) },
  { id: "f3",  userId: "u23", userName: "Ahmed Saleh",      kind: "message",           excerpt: "I urgently need help — send Bitcoin to this address: 1A1zP1eP5QGefi2…",          labels: ["scam","money","urgency"],    severity: "high",   status: "pending",  aiScreened: true,  createdAt: _H(3) },
  { id: "f4",  userId: "u16", userName: "Tomas Novak",      kind: "profile_bio",       excerpt: "Looking for women to spoil with gifts. Available any time. DM me on Telegram.",            labels: ["off-app","solicitation"],    severity: "medium", status: "pending",  aiScreened: true,  createdAt: _H(6) },
  { id: "f5",  userId: "u5",  userName: "Sofia Andersson",  kind: "message",           excerpt: "Why won't you talk to me? I know where you live near King's Cross.",                        labels: ["harassment","threat"],       severity: "high",   status: "removed",  aiScreened: true,  createdAt: _D(5) },
  { id: "f6",  userId: "u12", userName: "Omar Idrissi",     kind: "goal",              excerpt: "Goal: Make $5,000/week from home. Contact me on CashApp.",                                 labels: ["scam","spam","off-app"],     severity: "high",   status: "removed",  aiScreened: true,  createdAt: _D(7) },
  { id: "f7",  userId: "u19", userName: "Blessing Eze",     kind: "event_description", excerpt: "Exclusive dinner party — entry $50 payable via Western Union only.",                   labels: ["money","suspicious"],        severity: "medium", status: "pending",  aiScreened: true,  createdAt: _D(3) },
  { id: "f8",  userId: "u2",  userName: "Diego Herrera",    kind: "goal",              excerpt: "Hiring 3 junior devs — send your CV and $10 background-check fee to Cash App.",       labels: ["scam","money"],              severity: "medium", status: "pending",  aiScreened: true,  createdAt: _H(20) },
  { id: "f9",  userId: "u14", userName: "Ethan Cole",       kind: "message",           excerpt: "Hey, also on Telegram at @ethancole_official if you want to chat faster.",                labels: ["off-app"],                   severity: "low",    status: "approved", aiScreened: false, createdAt: _D(1) },
  { id: "f10", userId: "u18", userName: "Ryan Cho",         kind: "message",           excerpt: "Let me know if you want my WhatsApp — easier to send you the event details there.",  labels: ["off-app"],                   severity: "low",    status: "pending",  aiScreened: false, createdAt: _H(14) },
];

const SEED_VERIFICATIONS: VerificationRequest[] = [
  { id: "v1", userId: "u7",  userName: "Priya Nair",     step: "selfie", submittedAt: _H(5),  status: "pending",  imageNote: "Clear frontal selfie, matches profile photo. Good lighting.",                            city: "Dubai" },
  { id: "v2", userId: "u14", userName: "Ethan Cole",     step: "id",     submittedAt: _H(8),  status: "pending",  imageNote: "US Driver’s Licence — legible, DOB confirms 24 y/o. No tampering visible.",    city: "Chicago" },
  { id: "v3", userId: "u21", userName: "Victor Adeyemi", step: "selfie", submittedAt: _H(3),  status: "pending",  imageNote: "Blurred submission — face partially obscured. May need re-upload.",                 city: "Lagos" },
  { id: "v4", userId: "u16", userName: "Tomas Novak",    step: "id",     submittedAt: _H(12), status: "pending",  imageNote: "Czech national ID — expired 2023. Requires a valid, in-date document.",             city: "Prague" },
  { id: "v5", userId: "u3",  userName: "Nadia Petrov",   step: "id",     submittedAt: _D(2),  status: "rejected", imageNote: "Photo appears to be a stock image of a passport, not a genuine document.",             city: "Dubai" },
  { id: "v6", userId: "u10", userName: "Kwame Asante",   step: "selfie", submittedAt: _D(1),  status: "approved", imageNote: "Clear match with profile. Selfie with code sign confirmed. Level 2 granted.",         city: "Accra" },
];

const SEED_SUBSCRIPTIONS: AdminSubscription[] = [
  { id: "s1",  userId: "u1",  userName: "Amara Osei",    planCode: "friends-monthly",  planName: "Friends & Social",       interval: "monthly", amountUsd: 9.99,   startedAt: _D(30),  nextBillingAt: _D(-1),   status: "active",           paymentMethod: "Visa ····4242" },
  { id: "s2",  userId: "u2",  userName: "Diego Herrera", planCode: "all-access",        planName: "All-Access",             interval: "monthly", amountUsd: 24.99,  startedAt: _D(45),  nextBillingAt: _D(-15),  status: "active",           paymentMethod: "Stripe · PayPal" },
  { id: "s3",  userId: "u4",  userName: "James Okonkwo", planCode: "faith-annual",      planName: "Faith & Fellowship",     interval: "annual",  amountUsd: 79.99,  startedAt: _D(90),  nextBillingAt: _D(-275), status: "active",           paymentMethod: "Mastercard ····9988" },
  { id: "s4",  userId: "u5",  userName: "Sofia Andersson", planCode: "friends-monthly", planName: "Friends & Social",       interval: "monthly", amountUsd: 9.99,   startedAt: _D(25),  nextBillingAt: _D(-5),   status: "cancelled",        paymentMethod: "Visa ····1111" },
  { id: "s5",  userId: "u6",  userName: "Marcus Webb",   planCode: "fitness-monthly",   planName: "Fitness & Outdoors",     interval: "monthly", amountUsd: 9.99,   startedAt: _D(20),  nextBillingAt: _D(-10),  status: "active",           paymentMethod: "Visa ····5588" },
  { id: "s6",  userId: "u8",  userName: "Chen Wei",      planCode: "all-access-gold",   planName: "All-Access Gold",        interval: "annual",  amountUsd: 199.99, startedAt: _D(100), nextBillingAt: _D(-265), status: "active",           paymentMethod: "Amex ····0005" },
  { id: "s7",  userId: "u10", userName: "Kwame Asante",  planCode: "friends-monthly",   planName: "Friends & Social",       interval: "monthly", amountUsd: 9.99,   startedAt: _D(15),  nextBillingAt: _D(-5),   status: "past_due",         paymentMethod: "Visa ····3322" },
  { id: "s8",  userId: "u13", userName: "Zara Patel",    planCode: "friends-monthly",   planName: "Friends & Social",       interval: "monthly", amountUsd: 9.99,   startedAt: _D(28),  nextBillingAt: _D(-2),   status: "active",           paymentMethod: "Mastercard ····6677" },
  { id: "s9",  userId: "u15", userName: "Aisha Kamara",  planCode: "all-access",        planName: "All-Access",             interval: "annual",  amountUsd: 199.99, startedAt: _D(180), nextBillingAt: _D(-185), status: "active",           paymentMethod: "Visa ····4455" },
  { id: "s10", userId: "u17", userName: "Grace Ochieng", planCode: "goals-monthly",     planName: "Goals & Accountability", interval: "monthly", amountUsd: 9.99,   startedAt: _D(40),  nextBillingAt: _D(-10),  status: "refund_requested", paymentMethod: "M-Pesa ····7733", refundReason: "Accidentally signed up for Goals instead of All-Access. Please refund." },
  { id: "s11", userId: "u20", userName: "Isla MacLeod",  planCode: "all-access",        planName: "All-Access",             interval: "monthly", amountUsd: 24.99,  startedAt: _D(60),  nextBillingAt: _D(-30),  status: "active",           paymentMethod: "Stripe · PayPal" },
  { id: "s12", userId: "u22", userName: "Mei Lin",       planCode: "fitness-annual",    planName: "Fitness & Outdoors",     interval: "annual",  amountUsd: 79.99,  startedAt: _D(85),  nextBillingAt: _D(-280), status: "active",           paymentMethod: "Visa ····9901" },
  { id: "s13", userId: "u19", userName: "Blessing Eze",  planCode: "friends-monthly",   planName: "Friends & Social",       interval: "monthly", amountUsd: 9.99,   startedAt: _D(50),  nextBillingAt: _D(-20),  status: "refund_requested", paymentMethod: "Mastercard ····8844", refundReason: "Account was suspended before my billing period ended. Want a pro-rata refund." },
  { id: "s14", userId: "u2",  userName: "Diego Herrera", planCode: "work-monthly",      planName: "Work & Corporate",       interval: "monthly", amountUsd: 9.99,   startedAt: _D(10),  nextBillingAt: _D(-20),  status: "active",           paymentMethod: "Stripe · PayPal" },
  { id: "s15", userId: "u11", userName: "Lena Schmidt",  planCode: "travel-monthly",    planName: "Travel & Explorers",     interval: "monthly", amountUsd: 9.99,   startedAt: _D(8),   nextBillingAt: _D(-22),  status: "past_due",         paymentMethod: "Visa ····2200" },
];

// ---------------------------------------------------------------------------
// Admin state keys
// ---------------------------------------------------------------------------

const KA = {
  userOverrides:   "bab_admin_user_overrides",
  reportOverrides: "bab_admin_report_overrides",
  flagOverrides:   "bab_admin_flag_overrides",
  verOverrides:    "bab_admin_ver_overrides",
  subOverrides:    "bab_admin_sub_overrides",
  auditLog:        "bab_admin_audit",
};

type UserOverride = Partial<Pick<AdminUser, "status" | "riskLevel" | "notes" | "warnings">>;

function _read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch { return fallback; }
}
function _write(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* ignore */ }
}

// --- Audit log ---------------------------------------------------------------

function _logAudit(action: string, target: string, note?: string) {
  const log = _read<AuditEntry[]>(KA.auditLog, []);
  log.unshift({ id: `al-${Date.now().toString(36)}`, at: Date.now(), action, target, by: "Admin (Demo)", note });
  _write(KA.auditLog, log.slice(0, 100));
}

export function getAuditLog(): AuditEntry[] {
  return _read<AuditEntry[]>(KA.auditLog, []);
}

// --- Users -------------------------------------------------------------------

export function getAdminUsers(): AdminUser[] {
  const overrides = _read<Record<string, UserOverride>>(KA.userOverrides, {});
  return SEED_USERS.map((u) => ({ ...u, ...(overrides[u.id] ?? {}) }));
}

export function updateUserStatus(userId: string, status: UserStatus, note?: string) {
  const overrides = _read<Record<string, UserOverride>>(KA.userOverrides, {});
  overrides[userId] = { ...(overrides[userId] ?? {}), status, ...(note ? { notes: note } : {}) };
  _write(KA.userOverrides, overrides);
  const user = SEED_USERS.find((u) => u.id === userId);
  _logAudit(`User status → ${status}`, user?.name ?? userId, note);
}

export function addUserWarning(userId: string) {
  const overrides = _read<Record<string, UserOverride>>(KA.userOverrides, {});
  const user = getAdminUsers().find((u) => u.id === userId);
  const current = user?.warnings ?? 0;
  overrides[userId] = { ...(overrides[userId] ?? {}), warnings: current + 1 };
  _write(KA.userOverrides, overrides);
  _logAudit("Warning issued", user?.name ?? userId);
}

// --- Reports -----------------------------------------------------------------

export function getAdminReports(): AdminReport[] {
  const overrides = _read<Record<string, AdminReport["status"]>>(KA.reportOverrides, {});
  return SEED_REPORTS.map((r) => ({ ...r, status: overrides[r.id] ?? r.status }));
}

export function setReportStatus(reportId: string, status: AdminReport["status"]) {
  const overrides = _read<Record<string, AdminReport["status"]>>(KA.reportOverrides, {});
  overrides[reportId] = status;
  _write(KA.reportOverrides, overrides);
  const r = SEED_REPORTS.find((x) => x.id === reportId);
  _logAudit(`Report → ${status}`, `Report on ${r?.targetName ?? reportId}`);
}

// --- AI Flags ----------------------------------------------------------------

export function getAdminFlags(): AdminFlag[] {
  const overrides = _read<Record<string, AdminFlag["status"]>>(KA.flagOverrides, {});
  return SEED_FLAGS.map((f) => ({ ...f, status: overrides[f.id] ?? f.status }));
}

export function setFlagStatus(flagId: string, status: AdminFlag["status"]) {
  const overrides = _read<Record<string, AdminFlag["status"]>>(KA.flagOverrides, {});
  overrides[flagId] = status;
  _write(KA.flagOverrides, overrides);
  const f = SEED_FLAGS.find((x) => x.id === flagId);
  _logAudit(`Flag → ${status}`, f?.userName ?? flagId);
}

// --- Verifications -----------------------------------------------------------

export function getAdminVerifications(): VerificationRequest[] {
  const overrides = _read<Record<string, VerificationRequest["status"]>>(KA.verOverrides, {});
  return SEED_VERIFICATIONS.map((v) => ({ ...v, status: overrides[v.id] ?? v.status }));
}

export function setVerificationStatus(verId: string, status: "approved" | "rejected") {
  const overrides = _read<Record<string, VerificationRequest["status"]>>(KA.verOverrides, {});
  overrides[verId] = status;
  _write(KA.verOverrides, overrides);
  const v = SEED_VERIFICATIONS.find((x) => x.id === verId);
  _logAudit(`KYC ${status}`, `${v?.userName ?? verId} (${v?.step})`);
}

// --- Admin subscriptions -----------------------------------------------------

export function getAdminSubscriptions(): AdminSubscription[] {
  const overrides = _read<Record<string, AdminSubscription["status"]>>(KA.subOverrides, {});
  return SEED_SUBSCRIPTIONS.map((s) => ({ ...s, status: overrides[s.id] ?? s.status }));
}

export function setAdminSubscriptionStatus(subId: string, status: AdminSubscription["status"]) {
  const overrides = _read<Record<string, AdminSubscription["status"]>>(KA.subOverrides, {});
  overrides[subId] = status;
  _write(KA.subOverrides, overrides);
  const s = SEED_SUBSCRIPTIONS.find((x) => x.id === subId);
  _logAudit(`Subscription → ${status}`, s?.userName ?? subId);
}

// --- Login events ------------------------------------------------------------

export function getLoginEvents(): LoginEvent[] {
  return [...SEED_LOGINS].sort((a, b) => b.at - a.at);
}

// --- Platform metrics --------------------------------------------------------

export function getPlatformMetrics(): PlatformMetrics {
  const users = getAdminUsers();
  const reports = getAdminReports();
  const flags = getAdminFlags();
  const verifications = getAdminVerifications();
  const subs = getAdminSubscriptions();
  const mrr = subs
    .filter((s) => s.status === "active")
    .reduce((sum, s) => sum + (s.interval === "annual" ? s.amountUsd / 12 : s.amountUsd), 0);

  const circleCount: Record<string, number> = {};
  users.forEach((u) => u.circles.forEach((c) => { circleCount[c] = (circleCount[c] ?? 0) + 1; }));
  const topCircle = Object.entries(circleCount).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "friends";

  return {
    dau: 847,
    mau: 4_213,
    newUsersToday: 18,
    newUsersWeek: 124,
    mrrUsd: Math.round(mrr * 100) / 100,
    totalMembers: users.length,
    suspendedCount: users.filter((u) => u.status === "suspended").length,
    bannedCount: users.filter((u) => u.status === "banned").length,
    reportsOpen: reports.filter((r) => r.status === "open").length,
    flagsPending: flags.filter((f) => f.status === "pending").length,
    verificationsPending: verifications.filter((v) => v.status === "pending").length,
    topCircle,
  };
}

// ===========================================================================
// END ADMIN CONSOLE DATA
// ===========================================================================


export type HostType = "ministry" | "corporate" | "venue";

// --- Seed data (demo) ------------------------------------------------------
export const weeklyMetrics = {
  signupToVerified: 68, // %
  meetupsPerMember: 1.8,
  noShowRate: 18, // %
  retention30: 44, // %
  paidConversion: 7.2, // %
  safetyReportsPer1000: 2.3,
  activeMembers: 1240,
};

export const demoUsers = [
  { name: "Marcus Johnson", area: "Manhattan", level: 3, joined: "3 weeks ago" },
  { name: "Aisha Khalil", area: "Brooklyn", level: 2, joined: "2 weeks ago" },
  { name: "Kevin Williams", area: "Manhattan", level: 3, joined: "1 month ago" },
  { name: "Priya Sharma", area: "Brooklyn", level: 2, joined: "5 days ago" },
  { name: "Jordan Rivera", area: "Manhattan", level: 1, joined: "2 days ago" },
];

export const demoVerifications = [
  { name: "Grace M.", type: "id", submitted: "2h ago" },
  { name: "Alex C.", type: "selfie", submitted: "5h ago" },
  { name: "Trinity Church NYC", type: "organisation", submitted: "1d ago" },
];

export const demoOrgs = [
  { name: "Trinity Church NYC", type: "church", status: "verified" },
  { name: "Acme Corp", type: "company", status: "verified" },
  { name: "The Smith", type: "venue", status: "pending" },
];

export const demoSubGroups = [
  { name: "Youth", members: 120 },
  { name: "Couples", members: 64 },
  { name: "Choir", members: 38 },
  { name: "Outreach", members: 27 },
];

export const demoAttendance = [
  { event: "Sunday Service", present: 312, expected: 360 },
  { event: "Youth Night", present: 88, expected: 100 },
  { event: "Prayer Breakfast", present: 24, expected: 30 },
];

export const demoMentorship = [
  { mentor: "Kevin Williams (Senior PM)", mentee: "Aisha Khalil (Associate)" },
  { mentor: "Marcus Johnson (Eng Lead)", mentee: "Alex Chen (Grad)" },
];

export const demoBookings = [
  { event: "Buddy Table for 6", date: "Fri 7:00 PM", party: 6 },
  { event: "Singles Mixer", date: "Sat 6:30 PM", party: 20 },
];

// --- Demo state ------------------------------------------------------------
const K = {
  host: "bab_host_mode",
  hostType: "bab_host_type",
  cityCircles: "bab_city_circles",
  planActive: "bab_plan_active",
  refunds: "bab_refunds",
};

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

export function isHost(): boolean {
  return read<boolean>(K.host, false);
}
export function setHost(on: boolean) {
  write(K.host, on);
}
export function getHostType(): HostType {
  return read<HostType>(K.hostType, "ministry");
}
export function setHostType(type: HostType) {
  write(K.hostType, type);
}

/** Circles switched on for New York (defaults to all launch Circles on). */
export function cityCircles(): Record<string, boolean> {
  const stored = read<Record<string, boolean>>(K.cityCircles, {});
  const out: Record<string, boolean> = {};
  for (const c of launchCircles) out[c.id] = stored[c.id] ?? true;
  return out;
}
export function toggleCityCircle(id: string) {
  const current = cityCircles();
  current[id] = !current[id];
  write(K.cityCircles, current);
  return current;
}

export function planActive(): Record<string, boolean> {
  return read<Record<string, boolean>>(K.planActive, {});
}
export function togglePlanActive(code: string) {
  const current = planActive();
  current[code] = current[code] === undefined ? false : !current[code];
  write(K.planActive, current);
  return current;
}
export function isPlanActive(code: string): boolean {
  const v = planActive()[code];
  return v === undefined ? true : v;
}

export function getRefunds(): string[] {
  return read<string[]>(K.refunds, []);
}
export function refund(reference: string) {
  write(K.refunds, [...new Set([...getRefunds(), reference])]);
}
