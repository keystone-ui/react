"use client";

import { Badge } from "keystoneui/badge";
import {
  DescriptionList,
  DescriptionListDetails,
  DescriptionListItem,
  DescriptionListTerm,
} from "keystoneui/description-list";

export default function DescriptionListDefault() {
  return (
    <DescriptionList>
      <DescriptionListItem>
        <DescriptionListTerm>Provider</DescriptionListTerm>
        <DescriptionListDetails>Netent</DescriptionListDetails>
      </DescriptionListItem>
      <DescriptionListItem>
        <DescriptionListTerm>Game</DescriptionListTerm>
        <DescriptionListDetails>Fruit Ninja</DescriptionListDetails>
      </DescriptionListItem>
      <DescriptionListItem>
        <DescriptionListTerm>Current Players</DescriptionListTerm>
        <DescriptionListDetails>24</DescriptionListDetails>
      </DescriptionListItem>
      <DescriptionListItem>
        <DescriptionListTerm>Genre</DescriptionListTerm>
        <DescriptionListDetails>
          <Badge variant="default">Action</Badge>
        </DescriptionListDetails>
      </DescriptionListItem>
    </DescriptionList>
  );
}
