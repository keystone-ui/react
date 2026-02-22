"use client";

import { Alert, AlertDescription, AlertTitle } from "@keystoneui/react/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@keystoneui/react/avatar";
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
import { Checkbox } from "@keystoneui/react/checkbox";
import { Field, FieldLabel } from "@keystoneui/react/field";
import { Input } from "@keystoneui/react/input";
import { Label } from "@keystoneui/react/label";
import { Progress } from "@keystoneui/react/progress";
import { RadioGroup, RadioGroupItem } from "@keystoneui/react/radio-group";
import { Separator } from "@keystoneui/react/separator";
import {
  Slider,
  SliderControl,
  SliderIndicator,
  SliderThumb,
  SliderTrack,
} from "@keystoneui/react/slider";
import { Switch } from "@keystoneui/react/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@keystoneui/react/tabs";
import { InfoIcon, MailIcon, UserIcon } from "lucide-react";

/**
 * Curated showcase of Keystone UI components for the theme builder preview.
 * Layout mirrors the HeroUI themes page with a 3-column grid.
 */
export function DemoComponents() {
  return (
    <div className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-8 p-6 md:grid-cols-2 lg:grid-cols-3">
      {/* Column 1 — Form controls */}
      <div className="flex flex-col gap-6">
        <Field>
          <FieldLabel>Email</FieldLabel>
          <Input placeholder="you@example.com" type="email" />
        </Field>

        <Field>
          <FieldLabel>Password</FieldLabel>
          <Input placeholder="••••••••" type="password" />
        </Field>

        <div className="flex items-center gap-4">
          <Field className="w-fit" orientation="horizontal">
            <Checkbox defaultChecked id="demo-terms" name="terms" />
            <FieldLabel htmlFor="demo-terms">Remember me</FieldLabel>
          </Field>
        </div>

        <Field className="w-fit" orientation="horizontal">
          <Switch defaultChecked id="demo-notifications" />
          <FieldLabel htmlFor="demo-notifications">Notifications</FieldLabel>
        </Field>

        <Separator />

        <RadioGroup defaultValue="comfortable">
          <Label className="mb-1 font-medium text-sm">Density</Label>
          <div className="flex items-center gap-3">
            <RadioGroupItem id="demo-r1" value="default" />
            <Label htmlFor="demo-r1">Default</Label>
          </div>
          <div className="flex items-center gap-3">
            <RadioGroupItem id="demo-r2" value="comfortable" />
            <Label htmlFor="demo-r2">Comfortable</Label>
          </div>
          <div className="flex items-center gap-3">
            <RadioGroupItem id="demo-r3" value="compact" />
            <Label htmlFor="demo-r3">Compact</Label>
          </div>
        </RadioGroup>

        <div>
          <Label className="mb-2 block font-medium text-sm">Volume</Label>
          <Slider defaultValue={60}>
            <SliderControl>
              <SliderTrack>
                <SliderIndicator />
                <SliderThumb aria-label="Volume" />
              </SliderTrack>
            </SliderControl>
          </Slider>
        </div>

        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          <TabsContent value="overview">
            <p className="pt-2 text-muted-foreground text-sm">
              Track progress across all your active projects.
            </p>
          </TabsContent>
          <TabsContent value="analytics">
            <p className="pt-2 text-muted-foreground text-sm">
              Monitor trends and identify growth opportunities.
            </p>
          </TabsContent>
          <TabsContent value="settings">
            <p className="pt-2 text-muted-foreground text-sm">
              Customize your experience to fit your needs.
            </p>
          </TabsContent>
        </Tabs>
      </div>

      {/* Column 2 — Buttons, badges, progress */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center gap-2">
          <Avatar>
            <AvatarImage
              alt="User"
              src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop&crop=face"
            />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <Avatar>
            <AvatarFallback>AB</AvatarFallback>
          </Avatar>
          <Avatar>
            <AvatarFallback>CD</AvatarFallback>
          </Avatar>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="destructive">Destructive</Badge>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="destructive">Delete</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Team Chat</CardTitle>
            <CardDescription>
              Stay connected with your team members.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <Avatar className="size-8">
                <AvatarFallback className="text-xs">JD</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-sm">Jane Doe</p>
                <p className="text-muted-foreground text-xs">
                  Working on the new design system
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Avatar className="size-8">
                <AvatarFallback className="text-xs">AS</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-sm">Alex Smith</p>
                <p className="text-muted-foreground text-xs">
                  Reviewing pull requests
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" variant="secondary">
              <MailIcon className="mr-2 size-4" />
              Send Message
            </Button>
          </CardFooter>
        </Card>

        <div>
          <Label className="mb-2 block font-medium text-sm">
            Upload Progress
          </Label>
          <Progress value={72} />
          <p className="mt-1 text-muted-foreground text-xs">72% complete</p>
        </div>
      </div>

      {/* Column 3 — Cards, alerts */}
      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-2 flex size-10 items-center justify-center rounded-full bg-muted">
              <UserIcon className="size-5 text-muted-foreground" />
            </div>
            <CardTitle>Create an account</CardTitle>
            <CardDescription>
              Start your free trial. No credit card required.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full">Get Started</Button>
            <div className="flex items-center gap-2">
              <Separator className="flex-1" />
              <span className="font-medium text-muted-foreground text-xs uppercase">
                Or
              </span>
              <Separator className="flex-1" />
            </div>
            <Button className="w-full" variant="outline">
              Continue with Google
            </Button>
            <Button className="w-full" variant="outline">
              Continue with GitHub
            </Button>
          </CardContent>
        </Card>

        <Alert>
          <InfoIcon />
          <AlertTitle>New Feature</AlertTitle>
          <AlertDescription>
            Check out the latest tools and analytics dashboard.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle>Unsaved changes</CardTitle>
            <CardDescription>
              Do you want to save or discard changes?
            </CardDescription>
          </CardHeader>
          <CardFooter className="gap-2">
            <Button className="flex-1" variant="outline">
              Discard
            </Button>
            <Button className="flex-1">Save changes</Button>
          </CardFooter>
        </Card>

        <Field className="w-fit" orientation="horizontal">
          <Switch id="demo-dark-mode" />
          <div>
            <FieldLabel htmlFor="demo-dark-mode">Dark Mode</FieldLabel>
            <p className="text-muted-foreground text-xs">
              Toggle dark mode for the application
            </p>
          </div>
        </Field>
      </div>
    </div>
  );
}
