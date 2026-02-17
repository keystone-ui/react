"use client";

import { Button } from "keystoneui/button";
import { ButtonGroup } from "keystoneui/button-group";
import {
  BoldIcon,
  ItalicIcon,
  StrikethroughIcon,
  UnderlineIcon,
} from "lucide-react";

export default function ButtonGroupToolbar() {
  return (
    <ButtonGroup aria-label="Text formatting">
      <Button aria-label="Bold" size="icon" variant="outline">
        <BoldIcon />
      </Button>
      <Button aria-label="Italic" size="icon" variant="outline">
        <ItalicIcon />
      </Button>
      <Button aria-label="Underline" size="icon" variant="outline">
        <UnderlineIcon />
      </Button>
      <Button aria-label="Strikethrough" size="icon" variant="outline">
        <StrikethroughIcon />
      </Button>
    </ButtonGroup>
  );
}
