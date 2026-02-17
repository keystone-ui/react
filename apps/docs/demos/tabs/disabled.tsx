"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "keystoneui/tabs";

export default function TabsDisabled() {
  return (
    <Tabs defaultValue="home">
      <TabsList>
        <TabsTrigger value="home">Home</TabsTrigger>
        <TabsTrigger disabled value="settings">
          Disabled
        </TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
      </TabsList>
      <TabsContent value="home">
        <p className="pt-2 text-muted-foreground text-sm">
          Home content goes here.
        </p>
      </TabsContent>
      <TabsContent value="notifications">
        <p className="pt-2 text-muted-foreground text-sm">
          Notifications content goes here.
        </p>
      </TabsContent>
    </Tabs>
  );
}
