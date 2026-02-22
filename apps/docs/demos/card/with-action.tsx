"use client";

import { Button } from "@keystoneui/react/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@keystoneui/react/card";

export default function CardWithAction() {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>Manage your notification settings.</CardDescription>
        <CardAction>
          <Button size="sm" variant="outline">
            Settings
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <p>
          Configure how you receive notifications. You can enable or disable
          different types of alerts.
        </p>
      </CardContent>
    </Card>
  );
}
