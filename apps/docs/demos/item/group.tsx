"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@keystoneui/react/avatar";
import { Button } from "@keystoneui/react/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
} from "@keystoneui/react/item";
import { PlusIcon } from "lucide-react";
import { Fragment } from "react";

const people = [
  {
    username: "alice",
    avatar: "https://i.pravatar.cc/150?u=alice",
    email: "alice@example.com",
  },
  {
    username: "bob",
    avatar: "https://i.pravatar.cc/150?u=bob",
    email: "bob@example.com",
  },
  {
    username: "carol",
    avatar: "https://i.pravatar.cc/150?u=carol",
    email: "carol@example.com",
  },
];

export default function ItemGroupDemo() {
  return (
    <ItemGroup className="max-w-sm">
      {people.map((person, index) => (
        <Fragment key={person.username}>
          {index > 0 && <ItemSeparator />}
          <Item>
            <ItemMedia>
              <Avatar>
                <AvatarImage src={person.avatar} />
                <AvatarFallback>
                  {person.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </ItemMedia>
            <ItemContent>
              <ItemTitle>{person.username}</ItemTitle>
              <ItemDescription>{person.email}</ItemDescription>
            </ItemContent>
            <ItemActions>
              <Button className="rounded-full" size="icon" variant="ghost">
                <PlusIcon />
              </Button>
            </ItemActions>
          </Item>
        </Fragment>
      ))}
    </ItemGroup>
  );
}
