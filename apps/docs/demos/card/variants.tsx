"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@keystoneui/react/card";

export default function CardVariants() {
  return (
    <div className="grid w-full max-w-3xl gap-4 sm:grid-cols-2 [&>*]:min-w-0">
      <Card>
        <CardHeader>
          <CardTitle>Filled</CardTitle>
          <CardDescription>
            Paints <code>bg-card</code>. The default, and the right tier for a
            card that sits on the page background.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Rings <code>border-muted</code> — the fill already separates it from
            the page, so the edge only has to hint.
          </p>
        </CardContent>
      </Card>

      <Card variant="outline">
        <CardHeader>
          <CardTitle>Outline</CardTitle>
          <CardDescription>
            No fill, so the page shows through. Use it for chart and table
            panels, where a filled card on a filled page reads as two stacked
            surfaces.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Rings <code>border</code> at full strength — with no fill the edge
            is the only thing defining the card.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
