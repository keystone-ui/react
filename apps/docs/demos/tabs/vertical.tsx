"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@keystoneui/react/tabs";

export default function TabsVertical() {
  return (
    <Tabs className="w-[400px]" defaultValue="overview" orientation="vertical">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
        <TabsTrigger value="reports">Reports</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">
        <p className="text-muted-foreground text-sm">
          View your key metrics and recent project activity.
        </p>
      </TabsContent>
      <TabsContent value="analytics">
        <p className="text-muted-foreground text-sm">
          Track performance and user engagement metrics.
        </p>
      </TabsContent>
      <TabsContent value="reports">
        <p className="text-muted-foreground text-sm">
          Generate and download your detailed reports.
        </p>
      </TabsContent>
      <TabsContent value="settings">
        <p className="text-muted-foreground text-sm">
          Manage your account preferences and options.
        </p>
      </TabsContent>
    </Tabs>
  );
}
