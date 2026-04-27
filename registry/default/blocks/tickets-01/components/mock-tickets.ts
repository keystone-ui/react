export type TicketStatus = "open" | "pending" | "resolved" | "closed";
export type TicketPriority = "urgent" | "high" | "medium" | "low" | "todo";
export type TicketHealth = "on-track" | "warning" | "breached";
export type TicketChannel = "email" | "chat" | "slack";
export type TicketCategory =
  | "billing"
  | "technical"
  | "access"
  | "subscription"
  | "other";

export interface TicketAssignee {
  avatarUrl?: string;
  name: string;
}

export interface Ticket {
  assignee?: TicketAssignee;
  category: TicketCategory;
  channel: TicketChannel;
  health: TicketHealth;
  id: string;
  priority: TicketPriority;
  status: TicketStatus;
  subject: string;
  ticketNumber: string;
}

export const ticketAssignees: TicketAssignee[] = [
  { name: "Jason Duong" },
  { name: "Annie Nguyen" },
  { name: "Lam Tran" },
  { name: "Nhi Pham" },
  { name: "Thanh Le" },
  { name: "Minh Ho" },
  { name: "Bao Truong" },
];

export const statusLabels: Record<TicketStatus, string> = {
  open: "Open",
  pending: "Pending",
  resolved: "Resolved",
  closed: "Closed",
};

export const priorityLabels: Record<TicketPriority, string> = {
  urgent: "Urgent",
  high: "High",
  medium: "Medium",
  low: "Low",
  todo: "Todo",
};

export const healthLabels: Record<TicketHealth, string> = {
  "on-track": "On track",
  warning: "Warning",
  breached: "Breached",
};

export const channelLabels: Record<TicketChannel, string> = {
  email: "Email",
  chat: "Chat",
  slack: "Slack",
};

export const categoryLabels: Record<TicketCategory, string> = {
  billing: "Billing",
  technical: "Technical",
  access: "Access",
  subscription: "Subscription",
  other: "Other",
};

export const initialTickets: Ticket[] = [
  {
    id: "t-007",
    ticketNumber: "#-007",
    subject: "Close out unused seats after the regional team restructure",
    status: "closed",
    priority: "todo",
    assignee: { name: "Lam Tran" },
    category: "other",
    channel: "chat",
    health: "on-track",
  },
  {
    id: "t-017",
    ticketNumber: "#-017",
    subject: "Broken help article is slowing onboarding conversion",
    status: "closed",
    priority: "todo",
    assignee: { name: "Nhi Pham" },
    category: "other",
    channel: "chat",
    health: "on-track",
  },
  {
    id: "t-020",
    ticketNumber: "#-020",
    subject: "VAT breakdown per region is needed for the renewal review",
    status: "closed",
    priority: "todo",
    assignee: { name: "Thanh Le" },
    category: "billing",
    channel: "email",
    health: "on-track",
  },
  {
    id: "t-001",
    ticketNumber: "#-001",
    subject: "Low activation in week-one onboarding cohort for Pine & Peak",
    status: "open",
    priority: "high",
    assignee: { name: "Jason Duong" },
    category: "technical",
    channel: "email",
    health: "warning",
  },
  {
    id: "t-002",
    ticketNumber: "#-002",
    subject: "Expansion review blocked by delayed Salesforce health sync",
    status: "open",
    priority: "urgent",
    assignee: { name: "Jason Duong" },
    category: "technical",
    channel: "slack",
    health: "on-track",
  },
  {
    id: "t-004",
    ticketNumber: "#-004",
    subject: "Executive business review needs clearer API export guidance",
    status: "open",
    priority: "medium",
    assignee: { name: "Annie Nguyen" },
    category: "technical",
    channel: "email",
    health: "on-track",
  },
  {
    id: "t-005",
    ticketNumber: "#-005",
    subject: "Renewal prep needs invoice usage breakdown by workspace",
    status: "open",
    priority: "medium",
    category: "billing",
    channel: "chat",
    health: "warning",
  },
  {
    id: "t-008",
    ticketNumber: "#-008",
    subject: "Champion cannot reset admin access before the training session",
    status: "open",
    priority: "urgent",
    category: "access",
    channel: "chat",
    health: "warning",
  },
  {
    id: "t-012",
    ticketNumber: "#-012",
    subject: "Push notification drop is hurting mobile adoption metrics",
    status: "open",
    priority: "urgent",
    assignee: { name: "Jason Duong" },
    category: "technical",
    channel: "slack",
    health: "breached",
  },
  {
    id: "t-014",
    ticketNumber: "#-014",
    subject: "SLA export timezone mismatch is affecting QBR reporting",
    status: "open",
    priority: "high",
    assignee: { name: "Bao Truong" },
    category: "technical",
    channel: "email",
    health: "warning",
  },
  {
    id: "t-016",
    ticketNumber: "#-016",
    subject: "Domain migration left the new workspace owner unverified",
    status: "open",
    priority: "urgent",
    category: "access",
    channel: "slack",
    health: "breached",
  },
  {
    id: "t-003",
    ticketNumber: "#-003",
    subject: "Need admin ownership model before enterprise rollout",
    status: "pending",
    priority: "high",
    assignee: { name: "Jason Duong" },
    category: "access",
    channel: "email",
    health: "breached",
  },
  {
    id: "t-009",
    ticketNumber: "#-009",
    subject:
      "CSV import adoption stalled for the multilingual customer segment",
    status: "pending",
    priority: "high",
    assignee: { name: "Nhi Pham" },
    category: "technical",
    channel: "email",
    health: "warning",
  },
  {
    id: "t-011",
    ticketNumber: "#-011",
    subject: "Finance review asks for invoice split by cost center",
    status: "pending",
    priority: "medium",
    assignee: { name: "Thanh Le" },
    category: "billing",
    channel: "chat",
    health: "warning",
  },
  {
    id: "t-015",
    ticketNumber: "#-015",
    subject: "Plan phased seat expansion for the next quarter launch",
    status: "pending",
    priority: "medium",
    assignee: { name: "Lam Tran" },
    category: "subscription",
    channel: "chat",
    health: "on-track",
  },
  {
    id: "t-018",
    ticketNumber: "#-018",
    subject: "Need audit log retention options for the enterprise rollout",
    status: "pending",
    priority: "high",
    assignee: { name: "Jason Duong" },
    category: "subscription",
    channel: "email",
    health: "warning",
  },
  {
    id: "t-006",
    ticketNumber: "#-006",
    subject: "Customer asks for a rollout plan for conditional workflows",
    status: "resolved",
    priority: "low",
    assignee: { name: "Jason Duong" },
    category: "subscription",
    channel: "chat",
    health: "on-track",
  },
  {
    id: "t-010",
    ticketNumber: "#-010",
    subject: "Need a credit summary for the canceled onboarding add-on",
    status: "resolved",
    priority: "low",
    assignee: { name: "Minh Ho" },
    category: "billing",
    channel: "email",
    health: "on-track",
  },
  {
    id: "t-013",
    ticketNumber: "#-013",
    subject: "Seat transfer request between subsidiaries before renewal",
    status: "resolved",
    priority: "medium",
    assignee: { name: "Annie Nguyen" },
    category: "subscription",
    channel: "email",
    health: "on-track",
  },
  {
    id: "t-019",
    ticketNumber: "#-019",
    subject: "Intercom sync duplicates are skewing lifecycle reporting",
    status: "resolved",
    priority: "low",
    assignee: { name: "Minh Ho" },
    category: "technical",
    channel: "slack",
    health: "on-track",
  },
];
