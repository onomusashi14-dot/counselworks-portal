// ============================================================
// TYPES
// ============================================================

export type HealthStatus = "on_track" | "needs_attention" | "blocked";
export type HealthConfidence = "verified" | "system_confirmed";

export interface Case {
  id: string;
  matterNumber: string;
  caseName: string;
  clientName: string;
  caseType: string;
  jurisdiction: string;
  phase: string;
  healthStatus: HealthStatus;
  readinessScore: number;
  readinessBasis: string;
  healthSummary: string;
  healthConfidence: HealthConfidence;
  assignedParalegal: string;
  assignedRecordsSpecialist: string;
  nextAction: string;
  nextActionEta: string | null;
  lastUpdated: string;
  assignedAttorney: string;
}

export interface TeamMember {
  name: string;
  role: string;
  activitySummary: string;
  lastActiveMinutes: number;
}

export interface AttentionItem {
  id: string;
  severity: "red" | "amber";
  caseId: string;
  caseName: string;
  matterNumber: string;
  description: string;
}

export type ThreadStatus =
  | "received"
  | "assigned"
  | "in_progress"
  | "waiting_external"
  | "ready_for_review"
  | "completed";

export interface ThreadMessage {
  id: string;
  senderName: string;
  senderRole: string;
  senderType: "attorney" | "counselworks" | "system";
  timestamp: string;
  body: string;
}

export interface RequestThread {
  id: string;
  subject: string;
  caseId: string;
  caseName: string;
  handler: string;
  handlerRole: string;
  status: ThreadStatus;
  statusSentence: string;
  eta: string | null;
  healthStatus: HealthStatus;
  lastUpdate: string;
  createdAt?: string;
  openedAt?: string;
  messages: ThreadMessage[];
}

export interface Draft {
  id: string;
  draftType: string;
  caseName: string;
  caseId: string;
  preparedBy: string;
  reviewedBy: string;
  qaScore: number;
  deliveredDate: string;
  confidence: HealthConfidence;
}

export type DocCategory =
  | "pleading"
  | "medical"
  | "billing"
  | "evidence"
  | "correspondence"
  | "court_order";

export type DocActionState =
  | "received"
  | "pending_review"
  | "used_in_draft"
  | "missing_followup"
  | "missing_escalated"
  | "missing_not_requested";

export interface DocumentItem {
  id: string;
  name: string;
  category: DocCategory;
  caseName: string;
  caseId: string;
  actionState: DocActionState;
  actionDetail: string;
  uploadedBy: string;
  date: string;
  healthStatus: HealthStatus;
}

// ============================================================
// MOCK DATA
// ============================================================

export const MOCK_CASES: Case[] = [
  {
    id: "c1",
    matterNumber: "CW-2026-0142",
    caseName: "Martinez v. Pacific Holdings LLC",
    clientName: "Elena Martinez",
    caseType: "Employment",
    jurisdiction: "California",
    phase: "Discovery",
    healthStatus: "on_track",
    readinessScore: 78,
    readinessBasis:
      "Based on 11 of 14 required items completed. Outstanding: expert report, witness statements, final interrogatory responses.",
    healthSummary:
      "Discovery is proceeding on schedule. Maria Santos has gathered the employment records and the deposition of the HR director is scheduled for April 22. Outstanding items include the expert economist report, which is expected from Dr. Patel by April 18, and two witness statements currently being coordinated. No blockers.",
    healthConfidence: "verified",
    assignedParalegal: "Maria Santos",
    assignedRecordsSpecialist: "David Reyes",
    nextAction: "Prep HR director deposition outline — in progress",
    nextActionEta: "Apr 18",
    lastUpdated: "2 hours ago",
    assignedAttorney: "James Mitchell",
  },
  {
    id: "c2",
    matterNumber: "CW-2026-0198",
    caseName: "Thompson v. Riverside Medical Group",
    clientName: "David Thompson",
    caseType: "Medical Malpractice",
    jurisdiction: "California",
    phase: "Active",
    healthStatus: "needs_attention",
    readinessScore: 45,
    readinessBasis:
      "Based on 9 of 20 required items completed. Outstanding: complete medical records, expert review, billing records.",
    healthSummary:
      "Case advancement is constrained by outstanding medical records from Riverside Medical Group. Authorization form requires attorney signature before we can re-request. Draft uploaded to Drafts Inbox on April 9 for review. David Reyes is holding the billing records request until authorization is in hand.",
    healthConfidence: "system_confirmed",
    assignedParalegal: "Maria Santos",
    assignedRecordsSpecialist: "David Reyes",
    nextAction: "Attorney authorization signature required",
    nextActionEta: "Apr 11",
    lastUpdated: "yesterday",
    assignedAttorney: "James Mitchell",
  },
  {
    id: "c3",
    matterNumber: "CW-2026-0056",
    caseName: "Garcia v. Metro Transit Authority",
    clientName: "Rosa Garcia",
    caseType: "Personal Injury",
    jurisdiction: "California",
    phase: "Negotiation",
    healthStatus: "blocked",
    readinessScore: 62,
    readinessBasis:
      "Based on 12 of 19 required items completed. Outstanding: police report, final medical narrative, wage loss documentation.",
    healthSummary:
      "Demand preparation is paused pending the police report from Metro Transit. David Reyes escalated the request to the provider office manager on April 8 after two unanswered follow-ups. Next outreach scheduled April 11. All other demand components are ready; once the report is received, the demand package can be assembled within 48 hours.",
    healthConfidence: "verified",
    assignedParalegal: "Maria Santos",
    assignedRecordsSpecialist: "David Reyes",
    nextAction: "Follow up with Metro Transit records custodian",
    nextActionEta: "Apr 11",
    lastUpdated: "3 hours ago",
    assignedAttorney: "James Mitchell",
  },
  {
    id: "c4",
    matterNumber: "CW-2026-0210",
    caseName: "Baker Estate v. National Insurance Co.",
    clientName: "Baker Estate",
    caseType: "Insurance",
    jurisdiction: "California",
    phase: "Intake",
    healthStatus: "on_track",
    readinessScore: 30,
    readinessBasis:
      "Based on 4 of 13 required items completed. Intake phase — this readiness level is expected.",
    healthSummary:
      "Intake is on track. Sarah Chen completed the initial client interview and collected the policy documents. The claim denial letter is in hand. Next step is ordering the full claims file from National Insurance under the Insurance Code §2071 request.",
    healthConfidence: "verified",
    assignedParalegal: "Sarah Chen",
    assignedRecordsSpecialist: "David Reyes",
    nextAction: "Submit §2071 claims file request",
    nextActionEta: "Apr 14",
    lastUpdated: "1 day ago",
    assignedAttorney: "James Mitchell",
  },
  {
    id: "c5",
    matterNumber: "CW-2025-0891",
    caseName: "Williams v. Apex Construction",
    clientName: "Mark Williams",
    caseType: "Construction Defect",
    jurisdiction: "California",
    phase: "Litigation",
    healthStatus: "on_track",
    readinessScore: 85,
    readinessBasis:
      "Based on 17 of 20 required items completed. Outstanding: final expert rebuttal, trial brief, exhibit binders.",
    healthSummary:
      "Trial preparation is advancing well. Maria Santos has assembled the exhibit list and witness outlines. Ana Cruz QA-reviewed the motion in limine package on April 7. Final rebuttal expert report is expected April 15. No blockers anticipated before the trial readiness conference on April 30.",
    healthConfidence: "verified",
    assignedParalegal: "Maria Santos",
    assignedRecordsSpecialist: "David Reyes",
    nextAction: "Finalize trial exhibit binders",
    nextActionEta: "Apr 22",
    lastUpdated: "4 hours ago",
    assignedAttorney: "James Mitchell",
  },
  {
    id: "c6",
    matterNumber: "CW-2026-0175",
    caseName: "Nguyen v. TechStart Inc.",
    clientName: "Linh Nguyen",
    caseType: "Wrongful Termination",
    jurisdiction: "California",
    phase: "Active",
    healthStatus: "on_track",
    readinessScore: 52,
    readinessBasis:
      "Based on 8 of 15 required items completed. Employment records request not yet initiated.",
    healthSummary:
      "Case is progressing on schedule. Maria Santos has completed the client intake memo and identified three key witnesses. The employment records request to TechStart Inc. is queued and will go out April 11 once the authorization form is countersigned by the client.",
    healthConfidence: "system_confirmed",
    assignedParalegal: "Maria Santos",
    assignedRecordsSpecialist: "David Reyes",
    nextAction: "Send employment records request",
    nextActionEta: "Apr 11",
    lastUpdated: "6 hours ago",
    assignedAttorney: "James Mitchell",
  },
];

export const MOCK_TEAM: TeamMember[] = [
  {
    name: "Maria Santos",
    role: "Lead Case Coordinator",
    activitySummary: "Handling 18 active cases",
    lastActiveMinutes: 12,
  },
  {
    name: "David Reyes",
    role: "Records Specialist",
    activitySummary: "14 document requests in progress, 3 escalated",
    lastActiveMinutes: 120,
  },
  {
    name: "Ana Cruz",
    role: "QA Supervisor",
    activitySummary: "4 drafts reviewed this week, avg QA score 94",
    lastActiveMinutes: 45,
  },
];

export const MOCK_ATTENTION_ITEMS: AttentionItem[] = [
  {
    id: "a1",
    severity: "red",
    caseId: "c3",
    caseName: "Garcia v. Metro Transit Authority",
    matterNumber: "CW-2026-0056",
    description:
      "Medical records from Riverside Medical have been overdue since March 27 (14 days). David Reyes escalated to the provider office manager on April 8. Next update expected: April 11.",
  },
  {
    id: "a2",
    severity: "amber",
    caseId: "c2",
    caseName: "Thompson v. Riverside Medical Group",
    matterNumber: "CW-2026-0198",
    description:
      "Authorization form requires attorney signature. Uploaded to Drafts Inbox April 9 by Maria Santos. Awaiting attorney action to unblock records request.",
  },
];

export const MOCK_THREADS: RequestThread[] = [
  {
    id: "t1",
    subject: "Please review authorization form for Thompson records",
    caseId: "c2",
    caseName: "Thompson v. Riverside Medical Group",
    handler: "Maria Santos",
    handlerRole: "Lead Case Coordinator",
    status: "ready_for_review",
    statusSentence: "Ready for your review",
    eta: "Apr 11",
    healthStatus: "needs_attention",
    lastUpdate: "yesterday",
    messages: [
      {
        id: "m1",
        senderName: "Maria Santos",
        senderRole: "Lead Case Coordinator",
        senderType: "counselworks",
        timestamp: "April 9, 10:15 AM",
        body: "I've prepared the HIPAA authorization form for Riverside Medical Group. The provider is requiring a fresh signature before they will process our re-request. I've uploaded the form to the Drafts Inbox for your signature. Once signed, David will submit the request same day.",
      },
      {
        id: "m2",
        senderName: "System",
        senderRole: "",
        senderType: "system",
        timestamp: "April 9, 10:16 AM",
        body: "Draft delivered to Drafts Inbox — Thompson Medical Authorization Form.",
      },
    ],
  },
  {
    id: "t2",
    subject: "Escalation update — Metro Transit police report",
    caseId: "c3",
    caseName: "Garcia v. Metro Transit Authority",
    handler: "David Reyes",
    handlerRole: "Records Specialist",
    status: "waiting_external",
    statusSentence: "Waiting on provider response",
    eta: "Apr 11",
    healthStatus: "blocked",
    lastUpdate: "2 days ago",
    messages: [
      {
        id: "m1",
        senderName: "James Mitchell",
        senderRole: "Attorney",
        senderType: "attorney",
        timestamp: "April 6, 9:22 AM",
        body: "Where are we on the Metro Transit police report? We need this to finalize the demand.",
      },
      {
        id: "m2",
        senderName: "System",
        senderRole: "",
        senderType: "system",
        timestamp: "April 6, 9:23 AM",
        body: "Assigned to David Reyes — Records Specialist.",
      },
      {
        id: "m3",
        senderName: "David Reyes",
        senderRole: "Records Specialist",
        senderType: "counselworks",
        timestamp: "April 6, 2:10 PM",
        body: "Initial request was submitted March 28. First follow-up April 3 — no response. Second follow-up April 7 — no response. I've just escalated to the Metro Transit records office manager directly and requested a callback by end of week. Next scheduled touchpoint: April 11.",
      },
      {
        id: "m4",
        senderName: "System",
        senderRole: "",
        senderType: "system",
        timestamp: "April 8, 3:45 PM",
        body: "Escalation logged — Metro Transit records office manager notified. Follow-up Apr 11.",
      },
    ],
  },
  {
    id: "t3",
    subject: "Draft demand package — Williams construction defect",
    caseId: "c5",
    caseName: "Williams v. Apex Construction",
    handler: "Maria Santos",
    handlerRole: "Lead Case Coordinator",
    status: "in_progress",
    statusSentence: "Maria Santos is working on this",
    eta: "Apr 18",
    healthStatus: "on_track",
    lastUpdate: "6 hours ago",
    messages: [
      {
        id: "m1",
        senderName: "James Mitchell",
        senderRole: "Attorney",
        senderType: "attorney",
        timestamp: "April 8, 11:00 AM",
        body: "Start pulling together the trial demand package for Williams. Focus on the water intrusion expert report as the centerpiece.",
      },
      {
        id: "m2",
        senderName: "System",
        senderRole: "",
        senderType: "system",
        timestamp: "April 8, 11:01 AM",
        body: "Instructions received. Assigned to Maria Santos.",
      },
      {
        id: "m3",
        senderName: "Maria Santos",
        senderRole: "Lead Case Coordinator",
        senderType: "counselworks",
        timestamp: "April 9, 4:30 PM",
        body: "Working on the demand package. Expert report is organized and I have the damages schedule 70% assembled. Target completion April 18 ahead of the trial readiness conference.",
      },
    ],
  },
  {
    id: "t4",
    subject: "Questions for Martinez deposition prep",
    caseId: "c1",
    caseName: "Martinez v. Pacific Holdings LLC",
    handler: "Maria Santos",
    handlerRole: "Lead Case Coordinator",
    status: "completed",
    statusSentence: "Completed April 7",
    eta: null,
    healthStatus: "on_track",
    lastUpdate: "3 days ago",
    messages: [
      {
        id: "m1",
        senderName: "James Mitchell",
        senderRole: "Attorney",
        senderType: "attorney",
        timestamp: "April 5, 8:15 AM",
        body: "Please put together a deposition outline for the HR director focusing on the retaliation timeline and internal complaint records.",
      },
      {
        id: "m2",
        senderName: "System",
        senderRole: "",
        senderType: "system",
        timestamp: "April 5, 8:16 AM",
        body: "Instructions received. Assigned to Maria Santos.",
      },
      {
        id: "m3",
        senderName: "Maria Santos",
        senderRole: "Lead Case Coordinator",
        senderType: "counselworks",
        timestamp: "April 7, 1:40 PM",
        body: "Deposition outline is complete and delivered to the Drafts Inbox. 42 questions organized by theme: timeline of complaints, HR investigation procedures, documentation practices, and witness interactions. Ana reviewed — QA score 96.",
      },
      {
        id: "m4",
        senderName: "System",
        senderRole: "",
        senderType: "system",
        timestamp: "April 7, 1:41 PM",
        body: "Completed — deposition outline delivered.",
      },
    ],
  },
];

export const MOCK_DRAFTS: Draft[] = [
  {
    id: "d1",
    draftType: "HIPAA Authorization Form",
    caseName: "Thompson v. Riverside Medical Group",
    caseId: "c2",
    preparedBy: "Maria Santos",
    reviewedBy: "Ana Cruz",
    qaScore: 98,
    deliveredDate: "April 9, 2026",
    confidence: "verified",
  },
  {
    id: "d2",
    draftType: "Deposition Outline — HR Director",
    caseName: "Martinez v. Pacific Holdings LLC",
    caseId: "c1",
    preparedBy: "Maria Santos",
    reviewedBy: "Ana Cruz",
    qaScore: 96,
    deliveredDate: "April 7, 2026",
    confidence: "verified",
  },
  {
    id: "d3",
    draftType: "Motion in Limine — Prior Acts",
    caseName: "Williams v. Apex Construction",
    caseId: "c5",
    preparedBy: "Maria Santos",
    reviewedBy: "Ana Cruz",
    qaScore: 94,
    deliveredDate: "April 7, 2026",
    confidence: "verified",
  },
  {
    id: "d4",
    draftType: "Insurance Code §2071 Request Letter",
    caseName: "Baker Estate v. National Insurance Co.",
    caseId: "c4",
    preparedBy: "Sarah Chen",
    reviewedBy: "Ana Cruz",
    qaScore: 92,
    deliveredDate: "April 6, 2026",
    confidence: "system_confirmed",
  },
  {
    id: "d5",
    draftType: "Employment Records Request",
    caseName: "Nguyen v. TechStart Inc.",
    caseId: "c6",
    preparedBy: "Maria Santos",
    reviewedBy: "Ana Cruz",
    qaScore: 95,
    deliveredDate: "April 4, 2026",
    confidence: "verified",
  },
];

export const MOCK_DOCUMENTS: DocumentItem[] = [
  {
    id: "doc1",
    name: "HR Investigation File — Martinez Internal Complaint",
    category: "evidence",
    caseName: "Martinez v. Pacific Holdings LLC",
    caseId: "c1",
    actionState: "used_in_draft",
    actionDetail: "Used in deposition outline",
    uploadedBy: "Maria Santos",
    date: "April 6, 2026",
    healthStatus: "on_track",
  },
  {
    id: "doc2",
    name: "Pacific Holdings Employment Records (2022–2025)",
    category: "evidence",
    caseName: "Martinez v. Pacific Holdings LLC",
    caseId: "c1",
    actionState: "received",
    actionDetail: "Received",
    uploadedBy: "David Reyes",
    date: "April 5, 2026",
    healthStatus: "on_track",
  },
  {
    id: "doc3",
    name: "Thompson Medical Records — Riverside Medical",
    category: "medical",
    caseName: "Thompson v. Riverside Medical Group",
    caseId: "c2",
    actionState: "missing_followup",
    actionDetail: "Missing — follow-up scheduled Apr 12",
    uploadedBy: "—",
    date: "—",
    healthStatus: "needs_attention",
  },
  {
    id: "doc4",
    name: "Thompson Billing Records — Riverside Medical",
    category: "billing",
    caseName: "Thompson v. Riverside Medical Group",
    caseId: "c2",
    actionState: "missing_escalated",
    actionDetail: "Missing — escalated to provider",
    uploadedBy: "—",
    date: "—",
    healthStatus: "needs_attention",
  },
  {
    id: "doc5",
    name: "Metro Transit Police Report #MT-2025-8842",
    category: "court_order",
    caseName: "Garcia v. Metro Transit Authority",
    caseId: "c3",
    actionState: "missing_escalated",
    actionDetail: "Missing — escalated to provider",
    uploadedBy: "—",
    date: "—",
    healthStatus: "blocked",
  },
  {
    id: "doc6",
    name: "Garcia Medical Narrative — Dr. Hwang",
    category: "medical",
    caseName: "Garcia v. Metro Transit Authority",
    caseId: "c3",
    actionState: "received",
    actionDetail: "Received",
    uploadedBy: "David Reyes",
    date: "April 3, 2026",
    healthStatus: "on_track",
  },
  {
    id: "doc7",
    name: "Baker Policy Documents — National Insurance",
    category: "correspondence",
    caseName: "Baker Estate v. National Insurance Co.",
    caseId: "c4",
    actionState: "received",
    actionDetail: "Received",
    uploadedBy: "Sarah Chen",
    date: "April 4, 2026",
    healthStatus: "on_track",
  },
  {
    id: "doc8",
    name: "Apex Construction Expert Report — Water Intrusion",
    category: "evidence",
    caseName: "Williams v. Apex Construction",
    caseId: "c5",
    actionState: "used_in_draft",
    actionDetail: "Used in trial demand package",
    uploadedBy: "Maria Santos",
    date: "April 2, 2026",
    healthStatus: "on_track",
  },
  {
    id: "doc9",
    name: "Motion in Limine — Williams",
    category: "pleading",
    caseName: "Williams v. Apex Construction",
    caseId: "c5",
    actionState: "used_in_draft",
    actionDetail: "Used in drafted motion",
    uploadedBy: "Maria Santos",
    date: "April 7, 2026",
    healthStatus: "on_track",
  },
  {
    id: "doc10",
    name: "Nguyen Employment Records — TechStart Inc.",
    category: "evidence",
    caseName: "Nguyen v. TechStart Inc.",
    caseId: "c6",
    actionState: "missing_not_requested",
    actionDetail: "Not yet requested — authorization pending",
    uploadedBy: "—",
    date: "—",
    healthStatus: "on_track",
  },
];
