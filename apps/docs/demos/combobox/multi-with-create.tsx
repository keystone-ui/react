"use client";

import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxItem,
  ComboboxList,
  ComboboxSeparator,
  ComboboxValue,
  useComboboxAnchor,
} from "@keystoneui/react/combobox";
import { PlusIcon } from "lucide-react";
import { Fragment, useState } from "react";

const INITIAL_FRAMEWORKS = [
  "Next.js",
  "SvelteKit",
  "Nuxt.js",
  "Remix",
  "Astro",
];

export default function ComboboxMultiWithCreate() {
  const [pool, setPool] = useState<string[]>(INITIAL_FRAMEWORKS);
  const [selected, setSelected] = useState<string[]>(["Next.js"]);
  const [inputValue, setInputValue] = useState("");
  const anchor = useComboboxAnchor();

  const trimmed = inputValue.trim();
  const lower = trimmed.toLowerCase();
  const exactMatch = pool.some((p) => p.toLowerCase() === lower);
  const items = trimmed && !exactMatch ? [...pool, trimmed] : pool;

  return (
    <Combobox
      inputValue={inputValue}
      items={items}
      multiple
      onInputValueChange={setInputValue}
      onValueChange={(next) => {
        const list = next as string[];
        setSelected(list);
        // Persist any newly created values back to the pool so they appear as
        // existing options on subsequent searches.
        const additions = list.filter((tag) => !pool.includes(tag));
        if (additions.length > 0) {
          setPool((prev) => Array.from(new Set([...prev, ...additions])));
        }
        setInputValue("");
      }}
      value={selected}
    >
      <ComboboxChips className="w-full max-w-sm" ref={anchor}>
        <ComboboxValue>
          {(values: string[]) => (
            <>
              {values.map((value) => (
                <ComboboxChip key={value}>{value}</ComboboxChip>
              ))}
              <ComboboxChipsInput
                placeholder={
                  values.length === 0 ? "Select or type to create…" : ""
                }
              />
            </>
          )}
        </ComboboxValue>
      </ComboboxChips>
      <ComboboxContent anchor={anchor}>
        <ComboboxList>
          {(item: string) => {
            const isCreate = !pool.includes(item);
            return (
              <Fragment key={item}>
                {isCreate && <ComboboxSeparator className="first:hidden" />}
                <ComboboxItem value={item}>
                  {isCreate ? (
                    <span className="inline-flex items-center gap-1.5">
                      <PlusIcon className="size-3.5" />
                      Add &quot;{item}&quot;
                    </span>
                  ) : (
                    item
                  )}
                </ComboboxItem>
              </Fragment>
            );
          }}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
