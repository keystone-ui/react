"use client";

import { Button } from "@keystoneui/react/button";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
  FieldTitle,
} from "@keystoneui/react/field";
import { Input } from "@keystoneui/react/input";
import { RadioGroup, RadioGroupItem } from "@keystoneui/react/radio-group";

export default function FieldPaymentMethod() {
  return (
    <div className="w-full max-w-md">
      <form onSubmit={(e) => e.preventDefault()}>
        <FieldGroup>
          <FieldSet>
            <FieldLegend>Payment Method</FieldLegend>
            <FieldDescription>
              All transactions are secure and encrypted
            </FieldDescription>
            <RadioGroup defaultValue="card">
              <FieldLabel htmlFor="pm-card">
                <Field orientation="horizontal">
                  <FieldContent>
                    <FieldTitle>Credit Card</FieldTitle>
                    <FieldDescription>
                      Pay with Visa, Mastercard, or Amex
                    </FieldDescription>
                  </FieldContent>
                  <RadioGroupItem id="pm-card" value="card" />
                </Field>
              </FieldLabel>
              <FieldLabel htmlFor="pm-paypal">
                <Field orientation="horizontal">
                  <FieldContent>
                    <FieldTitle>PayPal</FieldTitle>
                    <FieldDescription>
                      Pay with your PayPal account
                    </FieldDescription>
                  </FieldContent>
                  <RadioGroupItem id="pm-paypal" value="paypal" />
                </Field>
              </FieldLabel>
              <FieldLabel htmlFor="pm-bank">
                <Field orientation="horizontal">
                  <FieldContent>
                    <FieldTitle>Bank Transfer</FieldTitle>
                    <FieldDescription>
                      Direct transfer from your bank
                    </FieldDescription>
                  </FieldContent>
                  <RadioGroupItem id="pm-bank" value="bank" />
                </Field>
              </FieldLabel>
            </RadioGroup>
          </FieldSet>
          <FieldSet>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="card-name">Name on Card</FieldLabel>
                <Input id="card-name" placeholder="John Doe" required />
              </Field>
              <Field>
                <FieldLabel htmlFor="card-number">Card Number</FieldLabel>
                <Input
                  id="card-number"
                  placeholder="1234 5678 9012 3456"
                  required
                />
              </Field>
              <div className="grid grid-cols-3 gap-4">
                <Field>
                  <FieldLabel htmlFor="exp-month">Month</FieldLabel>
                  <Input id="exp-month" placeholder="MM" required />
                </Field>
                <Field>
                  <FieldLabel htmlFor="exp-year">Year</FieldLabel>
                  <Input id="exp-year" placeholder="YYYY" required />
                </Field>
                <Field>
                  <FieldLabel htmlFor="cvv">CVV</FieldLabel>
                  <Input id="cvv" placeholder="123" required />
                </Field>
              </div>
            </FieldGroup>
          </FieldSet>
          <Button type="submit">Pay Now</Button>
        </FieldGroup>
      </form>
    </div>
  );
}
