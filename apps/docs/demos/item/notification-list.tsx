"use client";

import { Badge } from "@keystoneui/react/badge";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
} from "@keystoneui/react/item";
import {
  BellIcon,
  CheckCircle2Icon,
  MessageSquareIcon,
  PackageIcon,
} from "lucide-react";

const notifications = [
  {
    icon: MessageSquareIcon,
    title: "New comment on your post",
    description: 'Alice commented: "Great work on the new feature!"',
    time: "2m ago",
    unread: true,
  },
  {
    icon: PackageIcon,
    title: "Deployment successful",
    description: "v2.4.0 deployed to production with 0 errors.",
    time: "1h ago",
    unread: true,
  },
  {
    icon: CheckCircle2Icon,
    title: "Review approved",
    description: "Bob approved your pull request #142.",
    time: "3h ago",
    unread: false,
  },
  {
    icon: BellIcon,
    title: "Reminder",
    description: "Team standup meeting in 15 minutes.",
    time: "5h ago",
    unread: false,
  },
];

export default function ItemNotificationList() {
  return (
    <ItemGroup className="max-w-md">
      {notifications.map((notification, index) => (
        <div key={notification.title}>
          {index > 0 && <ItemSeparator />}
          <Item>
            <ItemMedia variant="icon">
              <notification.icon />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>{notification.title}</ItemTitle>
              <ItemDescription>{notification.description}</ItemDescription>
            </ItemContent>
            <ItemActions>
              {notification.unread ? (
                <Badge variant="default">New</Badge>
              ) : (
                <span className="text-muted-foreground text-xs">
                  {notification.time}
                </span>
              )}
            </ItemActions>
          </Item>
        </div>
      ))}
    </ItemGroup>
  );
}
