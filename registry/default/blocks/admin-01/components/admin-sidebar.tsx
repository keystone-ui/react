"use client";

import {
  BuildingIcon,
  CreditCardIcon,
  GaugeIcon,
  KeyRoundIcon,
  ReceiptIcon,
  SettingsIcon,
  ShieldCheckIcon,
  UsersIcon,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
} from "@/components/ui/sidebar";

/**
 * The sidebar is **shadcn's**, not keystone's — keystone deliberately ships no
 * app shell. It is imported from `@/components/ui/sidebar` in both this demo
 * and the installable copy, which makes it the one import in the block that
 * needs no rewrite between them. See the Interop guide.
 */

export type AdminSection = "billing" | "overview" | "settings" | "users";

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
