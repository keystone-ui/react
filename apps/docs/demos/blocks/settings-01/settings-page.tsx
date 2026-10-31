"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@keystoneui/react/alert-dialog";
import { Avatar, AvatarFallback } from "@keystoneui/react/avatar";
import { Badge } from "@keystoneui/react/badge";
import { Button } from "@keystoneui/react/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@keystoneui/react/card";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
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
import { useState } from "react";

import { NOTIFICATIONS, SAVED_PROFILE, SESSIONS } from "./mock-account";
import {
  changedFields,
  confirmsDeletion,
  otherSessions,
  type Profile,
  validateProfile,
} from "./settings-model";

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function ProfileCard() {
  const [saved, setSaved] = useState(SAVED_PROFILE);
  const [draft, setDraft] = useState(SAVED_PROFILE);
  const [submitted, setSubmitted] = useState(false);

  const errors = validateProfile(draft);
  const dirty = changedFields(saved, draft).length > 0;
  const showErrors = submitted;

  const update = (key: keyof Profile) => (value: string) =>
    setDraft((prev) => ({ ...prev, [key]: value }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>How you appear to your team.</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          id="profile-form"
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            setSubmitted(true);
            if (Object.keys(errors).length === 0) {
              const clean = {
                email: draft.email.trim(),
                name: draft.name.trim(),
              };
              setSaved(clean);
              setDraft(clean);
              setSubmitted(false);
            }
          }}
        >
          <FieldGroup>
            <div className="flex items-center gap-3">
              <Avatar className="size-12">
                <AvatarFallback>{initials(saved.name)}</AvatarFallback>
              </Avatar>
              <div className="text-sm">
                <p className="font-medium">{saved.name}</p>
                <p className="text-muted-foreground">{saved.email}</p>
              </div>
            </div>
            <Field data-invalid={showErrors && errors.name ? true : undefined}>
              <FieldLabel htmlFor="settings-name">Name</FieldLabel>
              <Input
                aria-invalid={showErrors && Boolean(errors.name)}
                id="settings-name"
                onChange={(event) => update("name")(event.target.value)}
                value={draft.name}
              />
              {showErrors && errors.name ? (
                <FieldError>{errors.name}</FieldError>
              ) : null}
            </Field>
            <Field data-invalid={showErrors && errors.email ? true : undefined}>
              <FieldLabel htmlFor="settings-email">Email</FieldLabel>
              <Input
                aria-invalid={showErrors && Boolean(errors.email)}
                id="settings-email"
                onChange={(event) => update("email")(event.target.value)}
                type="email"
                value={draft.email}
              />
              {showErrors && errors.email ? (
                <FieldError>{errors.email}</FieldError>
              ) : null}
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter className="justify-end gap-2 border-t">
        <Button
          disabled={!dirty}
          onClick={() => {
            setDraft(saved);
            setSubmitted(false);
          }}
          size="sm"
          variant="ghost"
        >
          Cancel
        </Button>
        <Button disabled={!dirty} form="profile-form" size="sm" type="submit">
          Save changes
        </Button>
      </CardFooter>
    </Card>
  );
}

function NotificationsCard() {
  const [enabled, setEnabled] = useState<Record<string, boolean>>({
    digest: true,
    product: false,
    security: true,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>Email we send you, and when.</CardDescription>
      </CardHeader>
      <CardContent>
        <FieldGroup>
          {NOTIFICATIONS.map((n) => (
            <Field key={n.id} orientation="horizontal">
              <FieldContent>
                <FieldLabel htmlFor={`notify-${n.id}`}>{n.label}</FieldLabel>
                <FieldDescription>
                  {n.description}
                  {n.locked ? " Always on for your account's safety." : null}
                </FieldDescription>
              </FieldContent>
              <Switch
                checked={enabled[n.id]}
                disabled={n.locked}
                id={`notify-${n.id}`}
                onCheckedChange={(checked) =>
                  setEnabled((prev) => ({ ...prev, [n.id]: checked }))
                }
              />
            </Field>
          ))}
        </FieldGroup>
      </CardContent>
    </Card>
  );
}

function SignedInSessionsCard() {
  const [sessions, setSessions] = useState(SESSIONS);
  const others = otherSessions(sessions);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sessions</CardTitle>
        <CardDescription>
          Devices signed in to your account. Sign out any you do not recognise.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table size="sm">
          <TableHeader>
            <TableRow>
              <TableHead>Device</TableHead>
              <TableHead className="hidden sm:table-cell">Location</TableHead>
              <TableHead>Last active</TableHead>
              <TableHead className="w-0">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sessions.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="font-medium">
                  {s.device}
                  {s.current ? (
                    <Badge className="ms-2" variant="secondary">
                      This device
                    </Badge>
                  ) : null}
                </TableCell>
                <TableCell className="hidden text-muted-foreground sm:table-cell">
                  {s.location}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {s.lastActive}
                </TableCell>
                <TableCell className="text-end">
                  {s.current ? null : (
                    <Button
                      aria-label={`Sign out ${s.device}`}
                      onClick={() =>
                        setSessions((prev) => prev.filter((x) => x.id !== s.id))
                      }
                      size="sm"
                      variant="ghost"
                    >
                      Sign out
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter className="justify-end border-t">
        <Button
          disabled={others.length === 0}
          onClick={() => setSessions((prev) => prev.filter((s) => s.current))}
          size="sm"
          variant="outline"
        >
          Sign out other sessions
        </Button>
      </CardFooter>
    </Card>
  );
}

function DangerZoneCard() {
  const [typed, setTyped] = useState("");
  const [deleted, setDeleted] = useState(false);
  const email = SAVED_PROFILE.email;

  return (
    <Card className="ring-destructive/30">
      <CardHeader>
        <CardTitle>Delete account</CardTitle>
        <CardDescription>
          {deleted
            ? "Account scheduled for deletion. You have 30 days to change your mind."
            : "Permanently remove your account and everything in it."}
        </CardDescription>
      </CardHeader>
      <CardFooter className="justify-end border-t">
        <AlertDialog onOpenChange={(open) => (open ? null : setTyped(""))}>
          <AlertDialogTrigger
            disabled={deleted}
            render={<Button size="sm" variant="destructive" />}
          >
            Delete account
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete your account?</AlertDialogTitle>
              <AlertDialogDescription>
                This removes your profile, sessions and workspaces after 30
                days. Type <strong>{email}</strong> to confirm.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <Input
              aria-label="Type your email to confirm"
              autoComplete="off"
              onChange={(event) => setTyped(event.target.value)}
              value={typed}
            />
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                disabled={!confirmsDeletion(email, typed)}
                onClick={() => setDeleted(true)}
                variant="destructive"
              >
                Delete account
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
}

export function SettingsPage() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 p-6">
      <div>
        <h1 className="font-semibold text-2xl tracking-tight">Settings</h1>
        <p className="text-muted-foreground text-sm">
          Manage your profile, notifications and sessions.
        </p>
      </div>
      <ProfileCard />
      <NotificationsCard />
      <SignedInSessionsCard />
      <DangerZoneCard />
    </div>
  );
}
