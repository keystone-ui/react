"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@keystoneui/react/breadcrumb";

export default function BreadcrumbLinkComponent() {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          {/* biome-ignore lint/a11y/useAnchorContent: content provided by BreadcrumbLink */}
          <BreadcrumbLink render={<a href="/home" />}>Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          {/* biome-ignore lint/a11y/useAnchorContent: content provided by BreadcrumbLink */}
          <BreadcrumbLink render={<a href="/components" />}>
            Components
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
