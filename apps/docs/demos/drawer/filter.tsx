"use client";

import { Button } from "keystoneui/button";
import { Checkbox } from "keystoneui/checkbox";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "keystoneui/drawer";
import { FilterIcon } from "lucide-react";
import { useState } from "react";

const CATEGORIES = [
  { label: "Electronics", value: "electronics" },
  { label: "Clothing", value: "clothing" },
  { label: "Books", value: "books" },
  { label: "Home & Garden", value: "home" },
  { label: "Sports", value: "sports" },
  { label: "Toys", value: "toys" },
];

export default function DrawerFilter() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>(["electronics"]);

  const toggleCategory = (value: string) => {
    setSelected((prev) =>
      prev.includes(value) ? prev.filter((c) => c !== value) : [...prev, value]
    );
  };

  return (
    <Drawer onOpenChange={setOpen} open={open}>
      <DrawerTrigger render={<Button variant="outline" />}>
        <FilterIcon className="size-4" />
        Filters
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle className="text-center">
              Filter by Category
            </DrawerTitle>
          </DrawerHeader>
          <div className="divide-y divide-border-muted">
            {CATEGORIES.map((category) => (
              <label
                className="flex h-12 cursor-pointer items-center gap-3 px-4"
                htmlFor={`filter-${category.value}`}
                key={category.value}
              >
                <Checkbox
                  checked={selected.includes(category.value)}
                  id={`filter-${category.value}`}
                  onCheckedChange={() => toggleCategory(category.value)}
                />
                <span className="text-sm">{category.label}</span>
              </label>
            ))}
          </div>
          <DrawerFooter>
            <Button className="w-full" onClick={() => setOpen(false)}>
              Apply Filters
            </Button>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
