"use client";

import { XIcon } from "lucide-react";
import { useState } from "react";
import { Mono, Pair } from "@/components/admin-user-detail";
import {
  formatAmount,
  PAYMENT_STATUS_VARIANT,
  type Payment,
  paymentStatusLabels,
  paymentTypeLabels,
} from "@/components/mock-payments";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DescriptionList } from "@/components/ui/description-list";
import {
  Drawer,
  DrawerBody,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

interface PaymentDetailDrawerProps {
  onClose: () => void;
  payment: Payment | null;
}

/**
 * One payment's record, in a side panel over the ledger.
 *
 * A panel rather than the full page the users table opens: a payment is
 * looked at and left — you check a status or copy an id and go back to the
 * row you were on — so the table, its filters and its scroll position stay
 * behind it. A user is a record you work in, which is why that one gets a page.
 *
 * Read-only, and only the fields the payment has. A refund or retry action
 * belongs here in a real app, but a button that does nothing is worse than
 * none.
 */
export function PaymentDetailDrawer({
  onClose,
  payment,
}: PaymentDetailDrawerProps) {
  // The last payment shown, held through the close so the panel slides out
  // with its content rather than going blank first.
  const [shown, setShown] = useState(payment);
  if (payment && payment !== shown) {
    setShown(payment);
  }

  return (
    <Drawer
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
      open={payment !== null}
      swipeDirection="right"
    >
      <DrawerContent variant="floating">
        {shown ? (
          <>
            <DrawerHeader className="flex flex-row items-start gap-2 border-b">
              <div className="min-w-0 flex-1">
                <DrawerTitle className="text-base tabular-nums">
                  {formatAmount(shown.amount, shown.currency)} {shown.currency}
                </DrawerTitle>
                <DrawerDescription>
                  {paymentTypeLabels[shown.type]} · {shown.playerEmail}
                </DrawerDescription>
              </div>
              <Badge variant={PAYMENT_STATUS_VARIANT[shown.status]}>
                {paymentStatusLabels[shown.status]}
              </Badge>
              <DrawerClose
                aria-label="Close"
                render={
                  <Button size="icon-sm" variant="ghost">
                    <XIcon />
                  </Button>
                }
              />
            </DrawerHeader>

            <DrawerBody className="flex flex-col gap-6 py-4">
              <DescriptionList className="gap-4" orientation="stacked">
                {/* In full here, because the table shows it cut down. This is
                    the value someone pastes into the provider's dashboard. */}
                <Pair term="Payment ID">
                  <Mono value={shown.id} />
                </Pair>
                <Pair term="Player">
                  <Mono value={shown.playerEmail} />
                </Pair>
                <Pair term="Provider">{shown.provider}</Pair>
                <Pair term="Created">
                  <span className="tabular-nums">{shown.createdAt}</span>
                </Pair>
                {/* A dash rather than a missing row: "not finished" is a fact
                    about the payment, and the gap would read as a rendering
                    fault. */}
                <Pair term="Finished">
                  {shown.finishedAt ? (
                    <span className="tabular-nums">{shown.finishedAt}</span>
                  ) : (
                    <span className="text-muted-foreground">
                      {shown.status === "failed" ? "Never" : "Not yet"}
                    </span>
                  )}
                </Pair>
              </DescriptionList>
            </DrawerBody>
          </>
        ) : null}
      </DrawerContent>
    </Drawer>
  );
}
