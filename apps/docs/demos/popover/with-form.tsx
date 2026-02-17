"use client";

import { Button } from "keystoneui/button";
import { Input } from "keystoneui/input";
import { Label } from "keystoneui/label";
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "keystoneui/popover";

export default function PopoverWithForm() {
  return (
    <Popover>
      <PopoverTrigger render={<Button variant="outline" />}>
        Edit Dimensions
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <PopoverHeader>
          <PopoverTitle>Dimensions</PopoverTitle>
        </PopoverHeader>
        <div className="grid gap-3">
          <div className="grid grid-cols-3 items-center gap-4">
            <Label htmlFor="width">Width</Label>
            <Input className="col-span-2" defaultValue="100%" id="width" />
          </div>
          <div className="grid grid-cols-3 items-center gap-4">
            <Label htmlFor="max-width">Max. width</Label>
            <Input className="col-span-2" defaultValue="300px" id="max-width" />
          </div>
          <div className="grid grid-cols-3 items-center gap-4">
            <Label htmlFor="height">Height</Label>
            <Input className="col-span-2" defaultValue="25px" id="height" />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
