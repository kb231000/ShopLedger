# ShopLedger

## Stack

Node.js 22 for the workshop, Express 4, body-parser, vanilla browser JavaScript,
and a JSON file datastore at data/db.json. server.js mounts the API and serves
the browser UI and printable invoice. config.js contains shop, GST, and coupon settings.

## Module map

- routes/products.js: product, stock availability, and active coupon endpoints.
- routes/orders.js: checkout, order history, order details, and cancellation.
- routes/customers.js: Khata customers and settlement recording.
- routes/reports.js: dashboard, GST reconciliation, preview, and data export.
- lib/coupons.js: coupon normalization, validation, limits, and discounts.
- lib/dates.js: legacy order dates, date keys, and fiscal years.
- lib/inventory.js: stock lookup, availability, adjustments, and summaries.
- lib/invoice.js: calculates invoice figures and renders printable HTML.
- lib/ledger.js: Khata balances, charges, reversals, and settlements.
- lib/orders.js: creates, looks up, lists, and cancels orders.
- lib/pricing.js: checkout subtotal, coupon allocation, line tax, and totals.
- lib/reports.js: dashboard and ledger versus invoice reconciliation.
- lib/store.js: synchronous JSON reads and writes plus audit entries.
- lib/tax.js: HSN GST resolution and the CGST/SGST split.

## Run and verify

- From the repository root, run `node --test`. The invoice suite is
  `node --test test/invoice.test.js`. The npm test script is a placeholder.
- For browser checks, copy package.json, server.js, config.js, routes/, lib/,
  public/, and data/ into a fresh temporary folder. Start from that folder.
- Run `npm install --no-package-lock`, then `npm start`. For an alternate port
  on PowerShell, set `$env:PORT = '3100'` before starting.
- With the seed data, open `/orders/1002/invoice` and the GST Audit tab. Expect
  invoice total INR 963.90, GST INR 45.90, and zero mismatches across eight orders.

## Rules

1. Write characterization tests before changing behaviour.
2. Change only the production modules named in the current ticket.
3. Use in-memory test fixtures. Tests must never read or write data/db.json.
4. Add no dependencies.
5. Make the smallest fix that works.

## Current ticket

Issue #1: Invoice total and GST breakdown do not match what the customer was billed.
Production scope: lib/invoice.js, with lib/tax.js only if required.
