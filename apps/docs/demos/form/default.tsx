"use client";

import { Description, Form, Label } from "keystoneui/form";
import { Input } from "keystoneui/input";
import { Textarea } from "keystoneui/textarea";

export default function FormDefault() {
  return (
    <Form>
      <div className="space-y-1.5">
        <Label htmlFor="name">Name</Label>
        <Input id="name" placeholder="Your name" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" placeholder="you@example.com" type="email" />
        <Description>We won't share your email with anyone.</Description>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="message">Message</Label>
        <Textarea id="message" placeholder="Type your message here..." />
      </div>
    </Form>
  );
}
