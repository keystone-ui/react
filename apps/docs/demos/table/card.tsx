"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@keystoneui/react/table";

const leaderboard = [
  { rank: 1, name: "Alex Dumitru", role: "UI/UX", company: "Hashgraph" },
  {
    rank: 2,
    name: "Diana Sima",
    role: "Graphic Designer",
    company: "Hashgraph",
  },
  {
    rank: 3,
    name: "Otilia Bejenaru",
    role: "Illustrator",
    company: "Hashgraph",
  },
  {
    rank: 4,
    name: "Mihai Radu",
    role: "Frontend Engineer",
    company: "Hashgraph",
  },
  {
    rank: 5,
    name: "Elena Voicu",
    role: "Product Manager",
    company: "Hashgraph",
  },
];

export default function TableCard() {
  return (
    <Table variant="card">
      <TableHeader>
        <TableRow>
          <TableHead className="w-16">#</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Role</TableHead>
          <TableHead className="text-right">Company</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {leaderboard.map((entry) => (
          <TableRow key={entry.rank}>
            <TableCell>{entry.rank}</TableCell>
            <TableCell className="font-medium">{entry.name}</TableCell>
            <TableCell>{entry.role}</TableCell>
            <TableCell className="text-right">{entry.company}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
