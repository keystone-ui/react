"use client";

import { Checkbox } from "@keystoneui/react/checkbox";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@keystoneui/react/field";

export default function FieldWithCheckbox() {
  return (
    <FieldGroup className="w-full max-w-xs">
      <FieldSet>
        <FieldLegend variant="label">
          Show these items on the desktop
        </FieldLegend>
        <FieldDescription>
          Select the items you want to show on the desktop.
        </FieldDescription>
        <FieldGroup className="gap-3">
          <Field orientation="horizontal">
            <Checkbox defaultChecked id="hard-disks" />
            <FieldLabel className="font-normal" htmlFor="hard-disks">
              Hard disks
            </FieldLabel>
          </Field>
          <Field orientation="horizontal">
            <Checkbox id="external-disks" />
            <FieldLabel className="font-normal" htmlFor="external-disks">
              External disks
            </FieldLabel>
          </Field>
          <Field orientation="horizontal">
            <Checkbox id="cds-dvds" />
            <FieldLabel className="font-normal" htmlFor="cds-dvds">
              CDs, DVDs, and iPods
            </FieldLabel>
          </Field>
          <Field orientation="horizontal">
            <Checkbox id="connected-servers" />
            <FieldLabel className="font-normal" htmlFor="connected-servers">
              Connected servers
            </FieldLabel>
          </Field>
        </FieldGroup>
      </FieldSet>
    </FieldGroup>
  );
}
