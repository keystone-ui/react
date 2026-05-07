"use client";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  TabsTriggerLabel,
} from "@keystoneui/react/tabs";
import {
  House as HomeIcon,
  Inbox as InboxIcon,
  MessageSquare as MessageSquareIcon,
  Mic as MicIcon,
  Search as SearchIcon,
} from "lucide-react";

export default function TabsMorphing() {
  return (
    <Tabs defaultValue="meetings">
      <TabsList morphing>
        <TabsTrigger value="home">
          <HomeIcon />
          <TabsTriggerLabel>Home</TabsTriggerLabel>
        </TabsTrigger>
        <TabsTrigger value="chat">
          <MessageSquareIcon />
          <TabsTriggerLabel>Chat</TabsTriggerLabel>
        </TabsTrigger>
        <TabsTrigger value="meetings">
          <MicIcon />
          <TabsTriggerLabel>Meetings</TabsTriggerLabel>
        </TabsTrigger>
        <TabsTrigger value="inbox">
          <InboxIcon />
          <TabsTriggerLabel>Inbox</TabsTriggerLabel>
        </TabsTrigger>
        <TabsTrigger value="search">
          <SearchIcon />
          <TabsTriggerLabel>Search</TabsTriggerLabel>
        </TabsTrigger>
      </TabsList>
      <TabsContent value="home">
        <p className="pt-2 text-muted-foreground text-sm">
          Home content goes here.
        </p>
      </TabsContent>
      <TabsContent value="chat">
        <p className="pt-2 text-muted-foreground text-sm">
          Chat content goes here.
        </p>
      </TabsContent>
      <TabsContent value="meetings">
        <p className="pt-2 text-muted-foreground text-sm">
          Meetings content goes here.
        </p>
      </TabsContent>
      <TabsContent value="inbox">
        <p className="pt-2 text-muted-foreground text-sm">
          Inbox content goes here.
        </p>
      </TabsContent>
      <TabsContent value="search">
        <p className="pt-2 text-muted-foreground text-sm">
          Search content goes here.
        </p>
      </TabsContent>
    </Tabs>
  );
}
