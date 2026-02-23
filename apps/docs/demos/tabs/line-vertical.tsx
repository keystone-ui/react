"use client";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@keystoneui/react/tabs";
import { BarChartIcon, FileTextIcon, SettingsIcon } from "lucide-react";

export default function TabsLineVertical() {
  return (
    <Tabs className="w-[400px]" defaultValue="general" orientation="vertical">
      <TabsList variant="line">
        <TabsTrigger value="general">
          <SettingsIcon />
          General
        </TabsTrigger>
        <TabsTrigger value="analytics">
          <BarChartIcon />
          Analytics
        </TabsTrigger>
        <TabsTrigger value="reports">
          <FileTextIcon />
          Reports
        </TabsTrigger>
      </TabsList>
      <TabsContent value="general">
        <p className="text-muted-foreground text-sm">
          Configure your general application preferences.
        </p>
      </TabsContent>
      <TabsContent value="analytics">
        <p className="text-muted-foreground text-sm">
          View your usage analytics and statistics.
        </p>
      </TabsContent>
      <TabsContent value="reports">
        <p className="text-muted-foreground text-sm">
          Generate and export detailed reports.
        </p>
      </TabsContent>
    </Tabs>
  );
}
