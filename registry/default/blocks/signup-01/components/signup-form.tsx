"use client";

import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Progress,
  ProgressIndicator,
  ProgressLabel,
  ProgressTrack,
} from "@/components/ui/progress";

export type PasswordStrength = Readonly<{
  color: "destructive" | "warning" | "success";
  label: "Weak" | "Fair" | "Good" | "Strong";
  level: 1 | 2 | 3 | 4;
}>;

const STRENGTHS = [
  { color: "destructive", label: "Weak", level: 1 },
  { color: "warning", label: "Fair", level: 2 },
  { color: "success", label: "Good", level: 3 },
  { color: "success", label: "Strong", level: 4 },
] as const;

const CHARACTER_CLASSES = [
  // Lowercase, and letters with no case (most of the world's scripts).
  /[\p{Ll}\p{Lo}\p{Lm}]/u,
  /[\p{Lu}\p{Lt}]/u,
  /\p{Nd}/u,
  /[^\p{L}\p{Nd}]/u,
];

/**
 * A rough guide from length and character variety, or `null` for an empty
 * field. It cannot tell a common password from a rare one: check passwords
 * on the server.
 */
export function passwordStrength(password: string): PasswordStrength | null {
  // Count characters, not UTF-16 units, with accents composed onto letters.
  const normalized = password.normalize("NFC");
  const characters = Array.from(normalized);
  const length = characters.length;
  if (length === 0) {
    return null;
  }
  // Shorter than the field asks for, or three or fewer distinct characters.
  if (length < 8 || new Set(characters).size < 4) {
    return { ...STRENGTHS[0] };
  }
  const classes = CHARACTER_CLASSES.filter((pattern) =>
    pattern.test(normalized)
  ).length;
  const points = classes + (length >= 12 ? 1 : 0) + (length >= 16 ? 1 : 0);
  // 8 to 11 characters stop at Good: Strong needs 12 or more.
  const level = Math.min(points, length >= 12 ? 4 : 3);
  return { ...STRENGTHS[level - 1] };
}

function PasswordInput(
  props: Omit<React.ComponentProps<typeof InputGroupInput>, "ref" | "type">
) {
  const [showPassword, setShowPassword] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <InputGroup>
      <InputGroupInput
        {...props}
        ref={inputRef}
        type={showPassword ? "text" : "password"}
      />
      <InputGroupAddon align="inline-end">
        <InputGroupButton
          aria-label={showPassword ? "Hide password" : "Show password"}
          onClick={(event) => {
            setShowPassword(!showPassword);
            // A pointer press types into this field next; a key press
            // (detail 0) leaves focus on the button.
            if (event.detail > 0) {
              inputRef.current?.focus();
            }
          }}
          onMouseDown={(event) => {
            // Already typing here: keep focus, and the caret, in the field.
            if (
              event.button === 0 &&
              document.activeElement === inputRef.current
            ) {
              event.preventDefault();
            }
          }}
        >
          {showPassword ? (
            <EyeOffIcon className="size-4" />
          ) : (
            <EyeIcon className="size-4" />
          )}
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  );
}

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<typeof Card>) {
  const [password, setPassword] = useState("");
  const strength = passwordStrength(password);

  return (
    <Card className={className} {...props}>
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>
          Enter your information below to create your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="name">Full Name</FieldLabel>
              <Input
                autoComplete="name"
                enterKeyHint="next"
                id="name"
                placeholder="John Doe"
                required
                type="text"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                autoComplete="email"
                enterKeyHint="next"
                id="email"
                placeholder="m@example.com"
                required
                type="email"
              />
              <FieldDescription>
                We&apos;ll use this to contact you. We will not share your email
                with anyone else.
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <PasswordInput
                aria-describedby={
                  strength ? "password-hint password-strength" : "password-hint"
                }
                autoComplete="new-password"
                enterKeyHint="next"
                id="password"
                onChange={(event) => setPassword(event.target.value)}
                required
                value={password}
              />
              {strength && (
                <Progress
                  color={strength.color}
                  getAriaValueText={() => strength.label}
                  value={strength.level * 25}
                >
                  <div
                    className="flex items-center justify-between"
                    id="password-strength"
                  >
                    <ProgressLabel className="font-normal text-muted-foreground">
                      Password strength
                    </ProgressLabel>
                    <span className="font-medium text-sm leading-none">
                      {strength.label}
                    </span>
                  </div>
                  <ProgressTrack>
                    <ProgressIndicator />
                  </ProgressTrack>
                </Progress>
              )}
              <FieldDescription id="password-hint">
                Must be at least 8 characters long.
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="confirm-password">
                Confirm Password
              </FieldLabel>
              <PasswordInput
                aria-describedby="confirm-password-hint"
                autoComplete="new-password"
                enterKeyHint="done"
                id="confirm-password"
                required
              />
              <FieldDescription id="confirm-password-hint">
                Please confirm your password.
              </FieldDescription>
            </Field>
            <Field className="gap-3">
              <Button type="submit">Create Account</Button>
              <Button type="button" variant="outline">
                Sign up with Google
              </Button>
              <FieldDescription className="text-center">
                Already have an account?{" "}
                {/* biome-ignore lint/a11y/useValidAnchor: demo placeholder link */}
                <a className="underline underline-offset-4" href="#">
                  Sign in
                </a>
              </FieldDescription>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
