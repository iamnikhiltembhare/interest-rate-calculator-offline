# Flat vs Reducing Balance Interest Rate Calculator

A small, dependency-free, fully offline calculator that compares **flat interest rate**
loans against **reducing (diminishing) balance** loans — the same comparison offered by
[cashkumar.com's flat vs reducing balance calculator](https://cashkumar.com/flat-interest-rate-vs-reducing-balance-interest-rate-calculator),
reimplemented as a static page with no build step and no trackers.

The only external reference is the `Inter` font, loaded from Google Fonts for a nicer
look when you're online — if there's no network (or you're opening this straight from
disk with no connection), it just falls back to the system font and everything still
works identically.

## Why this matters

Lenders sometimes quote a "flat rate" that sounds lower than a reducing-balance rate but
actually costs more, because flat interest is charged on the full original principal for
the whole tenure instead of on the shrinking outstanding balance. This tool:

- Takes a loan amount, tenure, a flat rate, and a reducing rate
- Computes EMI, total interest, and total payment for each method
- Shows the **equivalent rate** in the other method (the rate that would produce the same EMI)
- Tells you how much more or less you'd pay under one method vs. the other

## Usage

This is a static site — no build, no server, no dependencies.

```bash
open index.html
```

Or serve it locally:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

Everything runs client-side, inlined in `index.html`; no data ever leaves the browser.
(The calculation logic is a plain inline `<script>`, not an external module file — browsers
block ES module scripts from loading over `file://`, which would break the "just double-click
it" offline use case.)

## How the numbers are calculated

- **Flat rate**: `totalInterest = principal * rate * years`, `EMI = (principal + totalInterest) / months`
- **Reducing balance rate**: standard amortising loan formula,
  `EMI = P * r * (1+r)^n / ((1+r)^n - 1)` where `r` is the monthly rate and `n` the number of months
- **Equivalent reducing rate for a flat rate**: solved numerically (bisection), since the
  amortisation formula has no closed-form inverse for the rate
- **Equivalent flat rate for a reducing rate**: solved directly from the reducing EMI, since
  the flat-rate formula is linear in the rate

## Project structure

```
index.html   – markup / layout, plus all calculation logic and DOM wiring (inline <script>)
style.css    – styling
```

## License

MIT — see [LICENSE](LICENSE).
