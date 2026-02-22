"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@keystoneui/react/tabs";
import { AppWindowIcon, CodeIcon } from "lucide-react";

export default function TabsWithIcons() {
  return (
    <Tabs defaultValue="preview">
      <TabsList>
        <TabsTrigger value="preview">
          <AppWindowIcon />
          Preview
        </TabsTrigger>
        <TabsTrigger value="code">
          <CodeIcon />
          Code
        </TabsTrigger>
      </TabsList>
      <TabsContent value="preview">
        <p className="pt-2 text-muted-foreground text-sm">
          Preview content goes here.
        </p>
      </TabsContent>
      <TabsContent value="code">
        <p className="pt-2 text-muted-foreground text-sm">
          Code content goes here.
        </p>
      </TabsContent>
    </Tabs>
  );
}
