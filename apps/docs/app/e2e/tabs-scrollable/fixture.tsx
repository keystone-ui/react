"use client";

import { Tabs, TabsList, TabsTrigger } from "@keystoneui/react/tabs";
import {
  ChartNoAxesColumnIncreasing,
  Globe,
  LayoutDashboard,
  Mail,
  MessageSquare,
  Settings,
  Shield,
  Users,
} from "lucide-react";
import { type CSSProperties, useEffect } from "react";

const TABS = [
  { icon: LayoutDashboard, label: "Dashboard", value: "dashboard" },
  { icon: ChartNoAxesColumnIncreasing, label: "Analytics", value: "analytics" },
  { icon: Users, label: "Users", value: "users" },
  { icon: MessageSquare, label: "Messages", value: "messages" },
  { icon: Mail, label: "Email", value: "email" },
  { icon: Shield, label: "Security", value: "security" },
  { icon: Globe, label: "Domains", value: "domains" },
  { icon: Settings, label: "Settings", value: "settings" },
];

function Row({
  className,
  dir,
  style,
  testId,
  variant,
  width = 480,
}: {
  className?: string;
  dir?: "ltr" | "rtl";
  style?: CSSProperties;
  testId: string;
  variant?: "default" | "line";
  width?: number;
}) {
  return (
    // The margin around the Reel is the page surface the pixel reads compare
    // against.
    <div
      className="p-6"
      data-testid={testId}
      dir={dir}
      style={{ width: width + 48, ...style }}
    >
      <Tabs className={className} defaultValue="dashboard">
        <TabsList scrollable variant={variant}>
          {TABS.map(({ icon: Icon, label, value }) => (
            <TabsTrigger key={value} value={value}>
              {/* High contrast, so any icon pixel under a chevron shows. */}
              <Icon className="text-foreground" strokeWidth={3} />
              {label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
}

export function TabsScrollableFixture() {
  useEffect(() => {
    document.documentElement.dataset.fixtureHydrated = "tabs-scrollable";
  }, []);
  return (
    <main className="flex min-h-screen flex-col bg-background text-foreground">
      <Row testId="default" />
      <Row testId="line" variant="line" />
      <Row className="[--ks-reel-fade-size:6rem]" testId="narrow" width={120} />
      <Row dir="rtl" testId="rtl" />
      <Row style={{ direction: "rtl" }} testId="rdir" />
      <Row className="[--ks-reel-fade-size:0px]" testId="zero" />
      <Row className="[--ks-reel-fade-size:6rem]" testId="deep" />
      <Row testId="phone" width={343} />
    </main>
  );
}
