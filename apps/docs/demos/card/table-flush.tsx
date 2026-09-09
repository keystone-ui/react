"use client";

import { Card, CardHeader, CardTitle } from "@keystoneui/react/card";
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
      {/* Padding zeroed, so the header row sits against the card's edge and
          `overflow-hidden` clips the table's square corners to the radius. */}
      <Card className="[--card-spacing:0px]" variant="outline">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Squad</TableHead>
              <TableHead className="text-end">Deploys</TableHead>
              <TableHead className="text-end">Lead time p50</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.squad}>
                <TableCell className="font-medium">{row.squad}</TableCell>
                <TableCell className="text-end tabular-nums">
                  {row.deploys}
                </TableCell>
                <TableCell className="text-end tabular-nums">
                  {row.p50}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* A titled panel keeps its normal spacing and puts the table in a bare
          sibling instead of CardContent, so the header stays padded while the
          table still runs edge to edge. */}
      <Card variant="outline">
        <CardHeader>
          <CardTitle>Delivery by squad</CardTitle>
        </CardHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Squad</TableHead>
              <TableHead className="text-end">Deploys</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.squad}>
                <TableCell className="font-medium">{row.squad}</TableCell>
                <TableCell className="text-end tabular-nums">
                  {row.deploys}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
