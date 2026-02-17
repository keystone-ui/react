"use client";

import { Button } from "keystoneui/button";
import { Checkbox } from "keystoneui/checkbox";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "keystoneui/field";
import { Input } from "keystoneui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "keystoneui/select";
import { Textarea } from "keystoneui/textarea";

export default function FieldCheckoutForm() {
  return (
    <div className="w-full max-w-md rounded-xl border p-6">
      <form>
        <FieldGroup>
          <FieldSet>
            <FieldLegend>Payment Method</FieldLegend>
            <FieldDescription>
              All transactions are secure and encrypted
            </FieldDescription>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="checkout-card-name">
                  Name on Card
                </FieldLabel>
                <Input
                  id="checkout-card-name"
                  placeholder="John Doe"
                  required
                />
              </Field>
              <div className="grid grid-cols-3 gap-4">
                <Field className="col-span-2">
                  <FieldLabel htmlFor="checkout-card-number">
                    Card Number
                  </FieldLabel>
                  <Input
                    id="checkout-card-number"
                    placeholder="1234 5678 9012 3456"
                    required
                  />
                  <FieldDescription>
                    Enter your 16-digit number.
                  </FieldDescription>
                </Field>
                <Field className="col-span-1">
                  <FieldLabel htmlFor="checkout-cvv">CVV</FieldLabel>
                  <Input id="checkout-cvv" placeholder="123" required />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel htmlFor="checkout-exp-month">Month</FieldLabel>
                  <Select defaultValue="">
                    <SelectTrigger id="checkout-exp-month">
                      <SelectValue placeholder="MM" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {Array.from({ length: 12 }, (_, i) => {
                          const val = String(i + 1).padStart(2, "0");
                          return (
                            <SelectItem key={val} value={val}>
                              {val}
                            </SelectItem>
                          );
                        })}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>
                <Field>
                  <FieldLabel htmlFor="checkout-exp-year">Year</FieldLabel>
                  <Select defaultValue="">
                    <SelectTrigger id="checkout-exp-year">
                      <SelectValue placeholder="YYYY" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {Array.from({ length: 6 }, (_, i) => {
                          const val = String(2024 + i);
                          return (
                            <SelectItem key={val} value={val}>
                              {val}
                            </SelectItem>
                          );
                        })}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>
              </div>
            </FieldGroup>
          </FieldSet>
          <FieldSeparator />
          <FieldSet>
            <FieldLegend>Billing Address</FieldLegend>
            <FieldDescription>
              The billing address associated with your payment method
            </FieldDescription>
            <FieldGroup>
              <Field orientation="horizontal">
                <Checkbox defaultChecked id="checkout-same-as-shipping" />
                <FieldLabel
                  className="font-normal"
                  htmlFor="checkout-same-as-shipping"
                >
                  Same as shipping address
                </FieldLabel>
              </Field>
            </FieldGroup>
          </FieldSet>
          <FieldSeparator />
          <FieldSet>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="checkout-comments">Comments</FieldLabel>
                <Textarea
                  id="checkout-comments"
                  placeholder="Add any additional comments"
                />
              </Field>
            </FieldGroup>
          </FieldSet>
          <Field orientation="horizontal">
            <Button type="submit">Submit</Button>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Field>
        </FieldGroup>
      </form>
    </div>
  );
}
