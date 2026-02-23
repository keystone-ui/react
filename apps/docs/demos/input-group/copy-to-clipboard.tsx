"use client";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@keystoneui/react/input-group";
import { CheckIcon, CopyIcon } from "lucide-react";
import { useState } from "react";

export default function InputGroupCopyToClipboard() {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText("https://example.com/api/key");
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <InputGroup className="max-w-sm">
      <InputGroupInput readOnly value="https://example.com/api/key" />
      <InputGroupAddon align="inline-end">
        <InputGroupButton
          aria-label="Copy to clipboard"
          onClick={handleCopy}
          size="icon-xs"
        >
          {isCopied ? (
            <CheckIcon className="size-4" />
          ) : (
            <CopyIcon className="size-4" />
          )}
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  );
}
