"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@keystoneui/react/avatar";
import { TagGroup, TagGroupItem } from "@keystoneui/react/tag-group";

const people = [
  {
    id: "fred",
    name: "Fred",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=faces",
  },
  {
    id: "michael",
    name: "Michael",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=64&h=64&fit=crop&crop=faces",
  },
  {
    id: "jane",
    name: "Jane",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=64&h=64&fit=crop&crop=faces",
  },
];

export default function TagGroupWithAvatars() {
  return (
    <TagGroup defaultValue={["jane"]}>
      {people.map((person) => (
        <TagGroupItem key={person.id} value={person.id}>
          <Avatar size="xs">
            <AvatarImage alt={person.name} src={person.avatar} />
            <AvatarFallback>{person.name[0]}</AvatarFallback>
          </Avatar>
          {person.name}
        </TagGroupItem>
      ))}
    </TagGroup>
  );
}
