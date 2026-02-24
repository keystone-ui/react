"use client";

import { Button } from "@keystoneui/react/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@keystoneui/react/card";
import { Input } from "@keystoneui/react/input";
import { Label } from "@keystoneui/react/label";

export default function CardLoginForm() {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Sign in to your account</CardTitle>
        <CardDescription>
          Enter your email below to sign in to your account
        </CardDescription>
        <CardAction>
          <Button variant="link">Sign Up</Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <form>
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                placeholder="m@example.com"
                required
                type="email"
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <a
                  className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  href="/forgot-password"
                >
                  Forgot your password?
                </a>
              </div>
              <Input id="password" required type="password" />
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex-col gap-2">
        <Button className="w-full" type="submit">
          Sign in
        </Button>
        <Button className="w-full" variant="outline">
          Sign in with Google
        </Button>
      </CardFooter>
    </Card>
  );
}
