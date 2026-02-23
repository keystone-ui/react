"use client";

import { Button } from "@keystoneui/react/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@keystoneui/react/drawer";
import { ArrowUpDown, Check } from "lucide-react";
import { useState } from "react";

const SORT_OPTIONS = [
  { label: "Newest", value: "newest" },
  { label: "Oldest", value: "oldest" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Price: Low to High", value: "price-asc" },
];

export default function DrawerSortBy() {
  const [selected, setSelected] = useState("newest");

  return (
    <Drawer>
      <DrawerTrigger render={<Button variant="outline" />}>
        <ArrowUpDown className="size-4" />
        Sort By
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle className="text-center">Sort By</DrawerTitle>
          </DrawerHeader>
          <div className="divide-y divide-border-muted">
            {SORT_OPTIONS.map((option) => {
              const isSelected = selected === option.value;
              return (
                <button
                  className={`flex h-12 w-full cursor-pointer items-center justify-between px-4 active:text-muted-foreground ${
                    isSelected
                      ? "font-medium text-primary"
                      : "text-muted-foreground"
                  }`}
                  key={option.value}
                  onClick={() => setSelected(option.value)}
                  type="button"
                >
                  <span className="text-sm">{option.label}</span>
                  {isSelected && <Check className="size-4 text-primary" />}
                </button>
              );
            })}
          </div>
          <div className="p-4" />
        </div>
      </DrawerContent>
    </Drawer>
  );
}
