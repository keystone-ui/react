"use client";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@keystoneui/react/card";

export default function Page() {
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>
            Change your name, email and notifications.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
