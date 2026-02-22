"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@keystoneui/react/tabs";

export default function TabsLine() {
  return (
    <Tabs defaultValue="overview">
      <TabsList variant="line">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
        <TabsTrigger value="reports">Reports</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">
        <p className="pt-2 text-muted-foreground text-sm">
          Overview content goes here.
        </p>
      </TabsContent>
      <TabsContent value="analytics">
        <p className="pt-2 text-muted-foreground text-sm">
          Analytics content goes here.
        </p>
      </TabsContent>
      <TabsContent value="reports">
        <p className="pt-2 text-muted-foreground text-sm">
          Reports content goes here.
        </p>
      </TabsContent>
    </Tabs>
  );
}
