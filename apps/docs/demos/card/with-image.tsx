"use client";

import { Badge } from "@keystoneui/react/badge";
import { Button } from "@keystoneui/react/button";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@keystoneui/react/card";

export default function CardWithImage() {
  return (
    <Card className="!pt-0 mx-auto w-full max-w-sm overflow-hidden">
      <div className="flex aspect-video w-full items-center justify-center bg-muted text-muted-foreground">
        Event cover
      </div>
      <CardHeader>
        <CardAction>
          <Badge variant="default">Featured</Badge>
        </CardAction>
        <CardTitle>Design systems meetup</CardTitle>
        <CardDescription>
          A practical talk on component APIs, accessibility, and shipping
          faster.
        </CardDescription>
      </CardHeader>
      <CardFooter>
        <Button className="w-full">View Event</Button>
      </CardFooter>
    </Card>
  );
}
