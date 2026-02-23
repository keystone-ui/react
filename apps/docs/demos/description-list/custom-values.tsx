"use client";

import { Badge } from "@keystoneui/react/badge";
import {
  DescriptionList,
  DescriptionListDetails,
  DescriptionListItem,
  DescriptionListTerm,
} from "@keystoneui/react/description-list";
import { CircleCheckIcon, CopyIcon, ExternalLinkIcon } from "lucide-react";

export default function DescriptionListCustomValues() {
  return (
    <DescriptionList variant="card">
      <DescriptionListItem>
        <DescriptionListTerm>Status</DescriptionListTerm>
        <DescriptionListDetails>
          <Badge variant="secondary">
            <CircleCheckIcon className="size-3" />
            Active
          </Badge>
        </DescriptionListDetails>
      </DescriptionListItem>
      <DescriptionListItem>
        <DescriptionListTerm>Contract</DescriptionListTerm>
        <DescriptionListDetails className="flex items-center gap-1.5 font-mono text-xs">
          0x71C...9eF2
          <CopyIcon className="size-3 text-muted-foreground" />
        </DescriptionListDetails>
      </DescriptionListItem>
      <DescriptionListItem>
        <DescriptionListTerm>Documentation</DescriptionListTerm>
        <DescriptionListDetails className="flex items-center gap-1.5">
          <a
            className="text-primary underline underline-offset-4"
            href="https://example.com"
          >
            View docs
          </a>
          <ExternalLinkIcon className="size-3 text-muted-foreground" />
        </DescriptionListDetails>
      </DescriptionListItem>
      <DescriptionListItem>
        <DescriptionListTerm>Tags</DescriptionListTerm>
        <DescriptionListDetails className="flex items-center gap-1.5">
          <Badge size="sm" variant="secondary">
            DeFi
          </Badge>
          <Badge size="sm" variant="outline">
            Staking
          </Badge>
        </DescriptionListDetails>
      </DescriptionListItem>
    </DescriptionList>
  );
}
