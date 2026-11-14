---
"@keystoneui/react": patch
---

Breadcrumb links, carousel dots, Tabs scroll buttons, Toast action and cancel buttons, and the CodeBlock scroll region show the library's keyboard focus outline

They showed the browser's own 1px focus ring. They now draw the same 2px `ring/50` outline as `Button`, offset 2px. `CodeBlockContent` draws it 2px inside its edge, because the `CodeBlock` root clips anything outside.
