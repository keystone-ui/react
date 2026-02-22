"use client";

import { Badge } from "@keystoneui/react/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@keystoneui/react/card";
import {
  DescriptionList,
  DescriptionListDetails,
  DescriptionListItem,
  DescriptionListTerm,
} from "@keystoneui/react/description-list";

export default function DescriptionListInCard() {
  return (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle>Game Description</CardTitle>
      </CardHeader>
      <CardContent>
        <DescriptionList variant="card">
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
      </CardContent>
    </Card>
  );
}
