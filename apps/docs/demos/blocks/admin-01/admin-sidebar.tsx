"use client";

import { Avatar, AvatarFallback } from "@keystoneui/react/avatar";
import {
  ArrowLeftRight as ArrowLeftRightIcon,
  Building2 as BuildingIcon,
  CreditCard as CreditCardIcon,
  Gauge as GaugeIcon,
  KeyRound as KeyRoundIcon,
  Receipt as ReceiptIcon,
  Settings as SettingsIcon,
  ShieldCheck as ShieldCheckIcon,
  Users as UsersIcon,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "./sidebar";

/**
 * The sidebar is **shadcn's**, adapted onto keystone primitives and shipped
 * with the block as `./sidebar` — keystone deliberately ships no app shell.
 * See the note at the top of sidebar.tsx for why it is not a dependency on
 * shadcn's `sidebar` item.
 */

export type AdminSection =
  | "billing"
  | "overview"
  | "payments"
  | "settings"
  | "users";

interface NavItem {
  badge?: string;
  icon: typeof GaugeIcon;
  key: AdminSection;
  label: string;
}

const NAV: readonly { items: readonly NavItem[]; label: string }[] = [
  {
    items: [
      { icon: GaugeIcon, key: "overview" as const, label: "Overview" },
      { badge: "10", icon: UsersIcon, key: "users" as const, label: "Users" },
      {
        icon: ArrowLeftRightIcon,
        key: "payments" as const,
        label: "Payments",
      },
    ],
    label: "Workspace",
  },
  {
    items: [
      { icon: CreditCardIcon, key: "billing" as const, label: "Billing" },
      { icon: SettingsIcon, key: "settings" as const, label: "Settings" },
    ],
    label: "Account",
  },
];

const SECONDARY = [
  { icon: ShieldCheckIcon, label: "Audit log" },
  { icon: KeyRoundIcon, label: "API keys" },
  { icon: ReceiptIcon, label: "Invoices" },
];

interface AdminSidebarProps {
  onSectionChange: (section: AdminSection) => void;
  section: AdminSection;
}

export function AdminSidebar({ onSectionChange, section }: AdminSidebarProps) {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg">
              <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <BuildingIcon className="size-4" />
              </div>
              <div className="grid flex-1 text-left leading-tight">
                <span className="truncate font-semibold">Northwind</span>
                <span className="truncate text-muted-foreground text-xs">
                  Team plan
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {NAV.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.key}>
                    <SidebarMenuButton
                      isActive={section === item.key}
                      onClick={() => onSectionChange(item.key)}
                      tooltip={item.label}
                    >
                      <item.icon />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                    {item.badge ? (
                      <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>
                    ) : null}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}

        <SidebarGroup>
          <SidebarGroupLabel>Security</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {SECONDARY.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton tooltip={item.label}>
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg">
              <Avatar className="size-8 rounded-md">
                <AvatarFallback className="rounded-md">AO</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left leading-tight">
                <span className="truncate font-medium">Ada Okonkwo</span>
                <span className="truncate text-muted-foreground text-xs">
                  ada@northwind.io
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
