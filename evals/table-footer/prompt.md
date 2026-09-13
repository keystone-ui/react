---
name: table-footer
max_turns: 8
allowed_tools: [Read, Skill, Bash]
---

Using Keystone UI (`@keystoneui/react` installed), build an invoices table:
columns for invoice number, customer, amount and status, sortable by amount
and by date, with pagination underneath. The data is already in memory as an
array; there are no separate URLs per page.
