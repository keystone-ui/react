"use client";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@keystoneui/react/tabs";

export default function TabsDefault() {
  return (
    <Tabs className="w-[400px]" defaultValue="overview">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
        <TabsTrigger value="reports">Reports</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">
        <p className="pt-2 text-muted-foreground text-sm">
          View your key metrics and recent project activity. Track progress
          across all your active projects.
        </p>
      </TabsContent>
      <TabsContent value="analytics">
        <p className="pt-2 text-muted-foreground text-sm">
          Track performance and user engagement metrics. Monitor trends and
          identify growth opportunities.
        </p>
      </TabsContent>
      <TabsContent value="reports">
        <p className="pt-2 text-muted-foreground text-sm">
          Generate and download your detailed reports. Export data in multiple
          formats for analysis.
        </p>
      </TabsContent>
      <TabsContent value="settings">
        <p className="pt-2 text-muted-foreground text-sm">
          Manage your account preferences and options. Customize your experience
          to fit your needs.
        </p>
      </TabsContent>
    </Tabs>
  );
}
