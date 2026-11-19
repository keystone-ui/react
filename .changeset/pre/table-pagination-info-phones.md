---
"@keystoneui/react": minor
---

TablePagination shows the row count on phones

`TablePaginationInfo` now shows at every width: below `lg` it sits on its own row above the controls instead of being hidden, so a footer that renders a count grows from 32px to 60px on phones, and from `lg` up the default layout does not change. Because the component now sets `lg:` layout classes, an unprefixed layout class of your own, such as `flex-wrap` on `TablePagination` or `flex-none` or a `w-*` width on `TablePaginationInfo`, now loses to them from `lg` up; prefix it with `lg:` to keep it there. A footer with an empty info slot is unchanged at every width; a slot that holds only whitespace or an empty wrapper element is not empty, so that footer keeps the extra row. To keep the old behaviour in a composed footer, pass `className="hidden lg:block"` to `TablePaginationInfo`; a props-driven footer has no info element to take a class, so pass `className="[&_[data-slot=table-pagination-info]]:max-lg:hidden"` to `TablePagination` instead.
