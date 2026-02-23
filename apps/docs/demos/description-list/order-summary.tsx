"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@keystoneui/react/card";
import {
  DescriptionList,
  DescriptionListDetails,
  DescriptionListItem,
  DescriptionListTerm,
} from "@keystoneui/react/description-list";

const orderItems = [
  { label: "Subtotal", value: "$1,250.00" },
  { label: "Shipping", value: "$12.50" },
  { label: "Tax", value: "$125.00" },
];

export default function DescriptionListOrderSummary() {
  return (
    <Card className="max-w-sm">
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <DescriptionList>
          {orderItems.map((item) => (
            <DescriptionListItem key={item.label}>
              <DescriptionListTerm>{item.label}</DescriptionListTerm>
              <DescriptionListDetails>{item.value}</DescriptionListDetails>
            </DescriptionListItem>
          ))}
          <DescriptionListItem className="font-medium">
            <DescriptionListTerm className="text-foreground">
              Total
            </DescriptionListTerm>
            <DescriptionListDetails>$1,387.50</DescriptionListDetails>
          </DescriptionListItem>
        </DescriptionList>
      </CardContent>
    </Card>
  );
}
