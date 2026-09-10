"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@keystoneui/react/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@keystoneui/react/table";

const rows = [
  { deploys: 42, p50: "1h 12m", squad: "Platform" },
  { deploys: 31, p50: "2h 04m", squad: "Payments" },
  { deploys: 18, p50: "3h 47m", squad: "Growth" },
];

export default function CardTableFlush() {
  return (
    <div className="flex w-full max-w-2xl flex-col gap-6">
      {/* The normal way: CardContent gives the table the same horizontal
          padding as the title, so the title, the row separators and the cell
          text all line up. No spacing tricks. */}
      <Card variant="outline">
        <CardHeader>
          <CardTitle>Delivery by squad</CardTitle>
          <CardDescription>Last 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Squad</TableHead>
                <TableHead numeric>Deploys</TableHead>
                <TableHead numeric>Lead time p50</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.squad}>
                  <TableCell className="font-medium">{row.squad}</TableCell>
                  <TableCell numeric>{row.deploys}</TableCell>
                  <TableCell numeric>{row.p50}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Zeroing the spacing is for a card that is *only* a table — no title,
          no description. The header row then sits against the card's edge and
          `overflow-hidden` clips the table's square corners to the radius. */}
      <Card className="[--card-spacing:0px]" variant="outline">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Squad</TableHead>
              <TableHead numeric>Deploys</TableHead>
              <TableHead numeric>Lead time p50</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.squad}>
                <TableCell className="font-medium">{row.squad}</TableCell>
                <TableCell numeric>{row.deploys}</TableCell>
                <TableCell numeric>{row.p50}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
