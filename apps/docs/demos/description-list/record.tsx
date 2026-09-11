"use client";

import { Badge } from "@keystoneui/react/badge";
import { CopyButton } from "@keystoneui/react/copy-button";
import {
  DescriptionList,
  DescriptionListDetails,
  DescriptionListItem,
  DescriptionListTerm,
} from "@keystoneui/react/description-list";

export default function DescriptionListRecord() {
  return (
    <div className="w-full max-w-2xl">
      <DescriptionList
        className="grid grid-cols-1 gap-x-8 sm:grid-cols-2"
        orientation="stacked"
      >
        <DescriptionListItem>
          <DescriptionListTerm>Payment ID</DescriptionListTerm>
          <DescriptionListDetails className="flex items-center gap-1 font-mono">
            4b87f2e4-7cf0
            <CopyButton value="4b87f2e4-7cf0" />
          </DescriptionListDetails>
        </DescriptionListItem>

        <DescriptionListItem>
          <DescriptionListTerm>User ID</DescriptionListTerm>
          <DescriptionListDetails className="flex items-center gap-1 font-mono">
            01a048da-02dd
            <CopyButton value="01a048da-02dd" />
          </DescriptionListDetails>
        </DescriptionListItem>

        <DescriptionListItem>
          <DescriptionListTerm>Status</DescriptionListTerm>
          <DescriptionListDetails>
            <Badge variant="secondary">Completed</Badge>
          </DescriptionListDetails>
        </DescriptionListItem>

        <DescriptionListItem>
          <DescriptionListTerm>Type</DescriptionListTerm>
          <DescriptionListDetails>
            <Badge variant="outline">Deposit</Badge>
          </DescriptionListDetails>
        </DescriptionListItem>

        <DescriptionListItem>
          <DescriptionListTerm>Created at</DescriptionListTerm>
          <DescriptionListDetails>2026-08-28 18:07:07</DescriptionListDetails>
        </DescriptionListItem>

        <DescriptionListItem>
          <DescriptionListTerm>Updated at</DescriptionListTerm>
          <DescriptionListDetails className="text-muted-foreground">
            -
          </DescriptionListDetails>
        </DescriptionListItem>
      </DescriptionList>
    </div>
  );
}
