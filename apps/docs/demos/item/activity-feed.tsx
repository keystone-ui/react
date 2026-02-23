"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@keystoneui/react/avatar";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemGroup,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
} from "@keystoneui/react/item";
import { ClockIcon, FileTextIcon } from "lucide-react";

const activities = [
  {
    name: "Alice",
    avatar: "https://i.pravatar.cc/150?u=alice",
    message: "Refactored the button component for better accessibility.",
    time: "2 hours ago",
    files: "4 files changed",
  },
  {
    name: "Bob",
    avatar: "https://i.pravatar.cc/150?u=bob",
    message: "Updated documentation for the new API endpoints.",
    time: "5 hours ago",
    files: "2 files changed",
  },
  {
    name: "Carol",
    avatar: "https://i.pravatar.cc/150?u=carol",
    message: "Deployed the latest build to production.",
    time: "1 day ago",
    files: "8 files changed",
  },
];

export default function ItemActivityFeed() {
  return (
    <ItemGroup className="max-w-lg">
      {activities.map((activity, index) => (
        <div key={activity.name}>
          {index > 0 && <ItemSeparator />}
          <Item>
            <ItemMedia>
              <Avatar>
                <AvatarImage className="grayscale" src={activity.avatar} />
                <AvatarFallback>{activity.name[0]}</AvatarFallback>
              </Avatar>
            </ItemMedia>
            <ItemContent>
              <ItemTitle>{activity.name}</ItemTitle>
              <ItemDescription>{activity.message}</ItemDescription>
              <ItemFooter>
                <ClockIcon />
                <span>{activity.time}</span>
                <span className="text-border">|</span>
                <FileTextIcon />
                <span>{activity.files}</span>
              </ItemFooter>
            </ItemContent>
          </Item>
        </div>
      ))}
    </ItemGroup>
  );
}
