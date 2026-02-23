"use client";

import { Button } from "@keystoneui/react/button";
import { Description, ErrorMessage, Form, Label } from "@keystoneui/react/form";
import { Input } from "@keystoneui/react/input";

export default function FormWithValidation() {
  return (
    <form onSubmit={(e) => e.preventDefault()}>
      <Form>
        <div className="space-y-1.5">
          <Label htmlFor="validation-email">Email</Label>
          <Input
            aria-invalid
            id="validation-email"
            placeholder="invalid-email"
            type="email"
          />
          <ErrorMessage>Enter a valid email address.</ErrorMessage>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="validation-password">Password</Label>
          <Input
            aria-invalid
            defaultValue="abc"
            id="validation-password"
            type="password"
          />
          <ErrorMessage>Password must be at least 8 characters.</ErrorMessage>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="validation-name">Name</Label>
          <Input id="validation-name" placeholder="Your name" />
          <Description>This field is valid.</Description>
        </div>
        <Button type="submit">Submit</Button>
      </Form>
    </form>
  );
}
