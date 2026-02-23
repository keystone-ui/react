"use client";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@keystoneui/react/tabs";
import {
  BarChartIcon,
  GlobeIcon,
  LayoutDashboardIcon,
  MailIcon,
  MessageSquareIcon,
  SettingsIcon,
  ShieldIcon,
  UsersIcon,
} from "lucide-react";

export default function TabsScrollable() {
  return (
    <div style={{ maxWidth: 480 }}>
      <Tabs defaultValue="dashboard">
        <TabsList scrollable>
          <TabsTrigger value="dashboard">
            <LayoutDashboardIcon />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChartIcon />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="users">
            <UsersIcon />
            Users
          </TabsTrigger>
          <TabsTrigger value="messages">
            <MessageSquareIcon />
            Messages
          </TabsTrigger>
          <TabsTrigger value="email">
            <MailIcon />
            Email
          </TabsTrigger>
          <TabsTrigger value="security">
            <ShieldIcon />
            Security
          </TabsTrigger>
          <TabsTrigger value="domains">
            <GlobeIcon />
            Domains
          </TabsTrigger>
          <TabsTrigger value="settings">
            <SettingsIcon />
            Settings
          </TabsTrigger>
        </TabsList>
        <TabsContent value="dashboard">
          <p className="pt-2 text-muted-foreground text-sm">
            Your project overview and key metrics at a glance.
          </p>
        </TabsContent>
        <TabsContent value="analytics">
          <p className="pt-2 text-muted-foreground text-sm">
            Track performance and engagement metrics.
          </p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
