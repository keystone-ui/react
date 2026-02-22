"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@keystoneui/react/tabs";

export default function TabsPill() {
  return (
    <Tabs defaultValue="all-bonuses">
      <TabsList shape="pill">
        <TabsTrigger value="all-bonuses">All Bonuses</TabsTrigger>
        <TabsTrigger value="bonus-history">Bonus History</TabsTrigger>
      </TabsList>
      <TabsContent value="all-bonuses">
        <p className="pt-2 text-muted-foreground text-sm">
          View all available bonuses.
        </p>
      </TabsContent>
      <TabsContent value="bonus-history">
        <p className="pt-2 text-muted-foreground text-sm">
          View your bonus history.
        </p>
      </TabsContent>
    </Tabs>
  );
}
