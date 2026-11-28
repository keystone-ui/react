"use client";

import { Button } from "@keystoneui/react/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@keystoneui/react/card";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@keystoneui/react/field";
import { Input } from "@keystoneui/react/input";
import { Switch } from "@keystoneui/react/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@keystoneui/react/table";

const sessions = [
  { device: "MacBook Pro", location: "Bucharest", lastActive: "Now" },
  { device: "iPhone 16", location: "Bucharest", lastActive: "2 hours ago" },
  { device: "Windows PC", location: "Berlin", lastActive: "3 days ago" },
];

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
        <CardContent>
          <form onSubmit={(event) => event.preventDefault()}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="name">Name</FieldLabel>
                <Input defaultValue="Ada Lovelace" id="name" />
              </Field>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input defaultValue="ada@example.com" id="email" type="email" />
              </Field>
              <Field orientation="horizontal">
                <FieldContent>
                  <FieldLabel htmlFor="notifications">
                    Email notifications
                  </FieldLabel>
                  <FieldDescription>
                    Get an email when a new device signs in.
                  </FieldDescription>
                </FieldContent>
                <Switch defaultChecked id="notifications" />
              </Field>
              <Field orientation="horizontal">
                <Button variant="outline">Cancel</Button>
                <Button type="submit">Save</Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Active sessions</CardTitle>
          <CardDescription>Devices signed in to your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Device</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Last active</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions.map((session) => (
                <TableRow key={session.device}>
                  <TableCell className="font-medium">
                    {session.device}
                  </TableCell>
                  <TableCell>{session.location}</TableCell>
                  <TableCell>{session.lastActive}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
