"use client";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@keystoneui/react/input-group";
import { CheckIcon, CopyIcon } from "lucide-react";
import { useState } from "react";

export default function InputGroupWithButton() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText("https://example.com/api/key");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <InputGroup>
      <InputGroupInput readOnly value="https://example.com/api/key" />
      <InputGroupAddon align="inline-end">
        <InputGroupButton
          aria-label="Copy to clipboard"
          onClick={handleCopy}
          size="icon-xs"
        >
          {copied ? (
            <CheckIcon className="size-4" />
          ) : (
            <CopyIcon className="size-4" />
          )}
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  );
}
