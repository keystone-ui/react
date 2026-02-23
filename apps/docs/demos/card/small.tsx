"use client";

import { Button } from "@keystoneui/react/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@keystoneui/react/card";

export default function CardSmall() {
  return (
    <Card className="w-full max-w-sm" size="sm">
      <CardHeader>
        <CardTitle>Small Card</CardTitle>
        <CardDescription>
          This card uses the small size variant with 16px padding.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p>Card content goes here. You can put any content inside the card.</p>
      </CardContent>
      <CardFooter>
        <Button className="w-full" size="sm" variant="outline">
          Action
        </Button>
      </CardFooter>
    </Card>
  );
}
