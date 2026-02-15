import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from "./avatar";

// =============================================================================
// Avatar (Root)
// =============================================================================
describe("Avatar", () => {
  it("renders with children content", () => {
    render(
      <Avatar>
        <AvatarFallback>AB</AvatarFallback>
      </Avatar>
    );
    expect(screen.getByText("AB")).toBeInTheDocument();
  });

  it("has data-slot attribute", () => {
    render(
      <Avatar data-testid="avatar">
        <AvatarFallback>AB</AvatarFallback>
      </Avatar>
    );
    expect(screen.getByTestId("avatar")).toHaveAttribute("data-slot", "avatar");
  });

  it("forwards className", () => {
    render(
      <Avatar className="custom-avatar" data-testid="avatar">
        <AvatarFallback>AB</AvatarFallback>
      </Avatar>
    );
    expect(screen.getByTestId("avatar")).toHaveClass("custom-avatar");
  });

  it("defaults to size 'default'", () => {
    render(
      <Avatar data-testid="avatar">
        <AvatarFallback>AB</AvatarFallback>
      </Avatar>
    );
    expect(screen.getByTestId("avatar")).toHaveAttribute(
      "data-size",
      "default"
    );
  });

  it("applies size 'xs' via data-size attribute", () => {
    render(
      <Avatar data-testid="avatar" size="xs">
        <AvatarFallback>AB</AvatarFallback>
      </Avatar>
    );
    expect(screen.getByTestId("avatar")).toHaveAttribute("data-size", "xs");
  });

  it("applies size 'sm' via data-size attribute", () => {
    render(
      <Avatar data-testid="avatar" size="sm">
        <AvatarFallback>AB</AvatarFallback>
      </Avatar>
    );
    expect(screen.getByTestId("avatar")).toHaveAttribute("data-size", "sm");
  });

  it("applies size 'lg' via data-size attribute", () => {
    render(
      <Avatar data-testid="avatar" size="lg">
        <AvatarFallback>AB</AvatarFallback>
      </Avatar>
    );
    expect(screen.getByTestId("avatar")).toHaveAttribute("data-size", "lg");
  });
});

// =============================================================================
// AvatarImage
// =============================================================================
describe("AvatarImage", () => {
  it("renders an img element", () => {
    render(
      <Avatar>
        <AvatarImage alt="User avatar" src="https://example.com/photo.jpg" />
        <AvatarFallback>AB</AvatarFallback>
      </Avatar>
    );
    expect(
      screen.getByRole("img", { name: "User avatar" })
    ).toBeInTheDocument();
  });

  it("has data-slot attribute", () => {
    render(
      <Avatar>
        <AvatarImage
          alt="User avatar"
          data-testid="avatar-image"
          src="https://example.com/photo.jpg"
        />
        <AvatarFallback>AB</AvatarFallback>
      </Avatar>
    );
    expect(screen.getByTestId("avatar-image")).toHaveAttribute(
      "data-slot",
      "avatar-image"
    );
  });

  it("forwards className", () => {
    render(
      <Avatar>
        <AvatarImage
          alt="User avatar"
          className="custom-image"
          data-testid="avatar-image"
          src="https://example.com/photo.jpg"
        />
        <AvatarFallback>AB</AvatarFallback>
      </Avatar>
    );
    expect(screen.getByTestId("avatar-image")).toHaveClass("custom-image");
  });
});

// =============================================================================
// AvatarFallback
// =============================================================================
describe("AvatarFallback", () => {
  it("renders fallback content", () => {
    render(
      <Avatar>
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
    );
    expect(screen.getByText("JD")).toBeInTheDocument();
  });

  it("has data-slot attribute", () => {
    render(
      <Avatar>
        <AvatarFallback data-testid="avatar-fallback">JD</AvatarFallback>
      </Avatar>
    );
    expect(screen.getByTestId("avatar-fallback")).toHaveAttribute(
      "data-slot",
      "avatar-fallback"
    );
  });

  it("forwards className", () => {
    render(
      <Avatar>
        <AvatarFallback
          className="custom-fallback"
          data-testid="avatar-fallback"
        >
          JD
        </AvatarFallback>
      </Avatar>
    );
    expect(screen.getByTestId("avatar-fallback")).toHaveClass(
      "custom-fallback"
    );
  });
});

// =============================================================================
// AvatarBadge
// =============================================================================
describe("AvatarBadge", () => {
  it("renders with children content", () => {
    render(
      <Avatar>
        <AvatarFallback>AB</AvatarFallback>
        <AvatarBadge data-testid="avatar-badge" />
      </Avatar>
    );
    expect(screen.getByTestId("avatar-badge")).toBeInTheDocument();
  });

  it("has data-slot attribute", () => {
    render(
      <Avatar>
        <AvatarFallback>AB</AvatarFallback>
        <AvatarBadge data-testid="avatar-badge" />
      </Avatar>
    );
    expect(screen.getByTestId("avatar-badge")).toHaveAttribute(
      "data-slot",
      "avatar-badge"
    );
  });

  it("forwards className", () => {
    render(
      <Avatar>
        <AvatarFallback>AB</AvatarFallback>
        <AvatarBadge className="custom-badge" data-testid="avatar-badge" />
      </Avatar>
    );
    expect(screen.getByTestId("avatar-badge")).toHaveClass("custom-badge");
  });
});

// =============================================================================
// AvatarGroup
// =============================================================================
describe("AvatarGroup", () => {
  it("renders multiple avatars", () => {
    render(
      <AvatarGroup data-testid="avatar-group">
        <Avatar data-testid="a1">
          <AvatarFallback>A</AvatarFallback>
        </Avatar>
        <Avatar data-testid="a2">
          <AvatarFallback>B</AvatarFallback>
        </Avatar>
      </AvatarGroup>
    );
    expect(screen.getByTestId("avatar-group")).toBeInTheDocument();
    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.getByText("B")).toBeInTheDocument();
  });

  it("has data-slot attribute", () => {
    render(
      <AvatarGroup data-testid="avatar-group">
        <Avatar>
          <AvatarFallback>A</AvatarFallback>
        </Avatar>
      </AvatarGroup>
    );
    expect(screen.getByTestId("avatar-group")).toHaveAttribute(
      "data-slot",
      "avatar-group"
    );
  });

  it("forwards className", () => {
    render(
      <AvatarGroup className="custom-group" data-testid="avatar-group">
        <Avatar>
          <AvatarFallback>A</AvatarFallback>
        </Avatar>
      </AvatarGroup>
    );
    expect(screen.getByTestId("avatar-group")).toHaveClass("custom-group");
  });
});

// =============================================================================
// AvatarGroupCount
// =============================================================================
describe("AvatarGroupCount", () => {
  it("renders with children content", () => {
    render(<AvatarGroupCount>+3</AvatarGroupCount>);
    expect(screen.getByText("+3")).toBeInTheDocument();
  });

  it("has data-slot attribute", () => {
    render(
      <AvatarGroupCount data-testid="avatar-group-count">+3</AvatarGroupCount>
    );
    expect(screen.getByTestId("avatar-group-count")).toHaveAttribute(
      "data-slot",
      "avatar-group-count"
    );
  });

  it("forwards className", () => {
    render(
      <AvatarGroupCount
        className="custom-count"
        data-testid="avatar-group-count"
      >
        +3
      </AvatarGroupCount>
    );
    expect(screen.getByTestId("avatar-group-count")).toHaveClass(
      "custom-count"
    );
  });
});
