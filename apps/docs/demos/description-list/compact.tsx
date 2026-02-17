"use client";

import { Badge } from "keystoneui/badge";
import {
  DescriptionList,
  DescriptionListDetails,
  DescriptionListItem,
  DescriptionListTerm,
} from "keystoneui/description-list";

export default function DescriptionListCompact() {
  return (
    <div className="flex flex-col gap-8">
      <div className="space-y-2">
        <p className="font-medium text-muted-foreground text-xs uppercase tracking-wider">
          Default variant, small size
        </p>
        <DescriptionList size="sm">
          <DescriptionListItem>
            <DescriptionListTerm>Provider</DescriptionListTerm>
            <DescriptionListDetails>Netent</DescriptionListDetails>
          </DescriptionListItem>
          <DescriptionListItem>
            <DescriptionListTerm>Game</DescriptionListTerm>
            <DescriptionListDetails>Fruit Ninja</DescriptionListDetails>
          </DescriptionListItem>
          <DescriptionListItem>
            <DescriptionListTerm>Genre</DescriptionListTerm>
            <DescriptionListDetails>
              <Badge size="sm" variant="default">
                Action
              </Badge>
            </DescriptionListDetails>
          </DescriptionListItem>
        </DescriptionList>
      </div>
      <div className="space-y-2">
        <p className="font-medium text-muted-foreground text-xs uppercase tracking-wider">
          Card variant, small size
        </p>
        <DescriptionList size="sm" variant="card">
          <DescriptionListItem>
            <DescriptionListTerm>Provider</DescriptionListTerm>
            <DescriptionListDetails>Netent</DescriptionListDetails>
          </DescriptionListItem>
          <DescriptionListItem>
            <DescriptionListTerm>Game</DescriptionListTerm>
            <DescriptionListDetails>Fruit Ninja</DescriptionListDetails>
          </DescriptionListItem>
          <DescriptionListItem>
            <DescriptionListTerm>Genre</DescriptionListTerm>
            <DescriptionListDetails>
              <Badge size="sm" variant="default">
                Action
              </Badge>
            </DescriptionListDetails>
          </DescriptionListItem>
        </DescriptionList>
      </div>
    </div>
  );
}
