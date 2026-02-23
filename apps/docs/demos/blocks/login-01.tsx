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
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@keystoneui/react/field";
import { Input } from "@keystoneui/react/input";

function LoginForm({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={className} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  placeholder="m@example.com"
                  required
                  type="email"
                />
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <a
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                    // biome-ignore lint/a11y/useValidAnchor: demo placeholder link
                    href="#"
                  >
                    Forgot your password?
                  </a>
                </div>
                <Input id="password" required type="password" />
              </Field>
              <Field className="gap-3">
                <Button type="submit">Login</Button>
                <Button type="button" variant="outline">
                  Login with Google
                </Button>
                <FieldDescription className="text-center">
                  Don&apos;t have an account?{" "}
                  {/* biome-ignore lint/a11y/useValidAnchor: demo placeholder link */}
                  <a className="underline underline-offset-4" href="#">
                    Sign up
                  </a>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function Login01() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  );
}
