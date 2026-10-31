import type { Profile, Session } from "./settings-model";

export const SAVED_PROFILE: Profile = {
  email: "ada@keystoneui.io",
  name: "Ada Lovelace",
};

export const SESSIONS: Session[] = [
  {
    current: true,
    device: "Chrome on macOS",
    id: "s1",
    lastActive: "Now",
    location: "London, UK",
  },
  {
    current: false,
    device: "Safari on iPhone",
    id: "s2",
    lastActive: "2 hours ago",
    location: "London, UK",
  },
  {
    current: false,
    device: "Firefox on Windows",
    id: "s3",
    lastActive: "3 days ago",
    location: "Bucharest, RO",
  },
];

export const NOTIFICATIONS = [
  {
    description: "Sign-ins from a new device or location.",
    id: "security",
    label: "Security alerts",
    locked: true,
  },
  {
    description: "A weekly summary of activity across your workspaces.",
    id: "digest",
    label: "Weekly digest",
    locked: false,
  },
  {
    description: "Product updates and the occasional announcement.",
    id: "product",
    label: "Product news",
    locked: false,
  },
] as const;
