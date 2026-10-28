# Official income evidence

Public source workbooks retrieved on 2026-10-27. Attribution and download URLs,
SHA-256 hashes, source sheet/row/cell addresses and target population are stored
in `content/occupation-income.json`.

- `wage-2025-table1.xlsx`: MHLW Basic Survey on Wage Structure 2025, general
  workers by occupation, Table 1. Published 2026-03-24, e-Stat statInfId
  000040421116. Use both-sex rows 11–155 and enterprise size 10+ only.
- `occupation-crosswalk-r8-3.xlsx`: official job tag occupation crosswalk,
  workbook update 2026-03-17. Use numeric record IDs and official wage codes.

Reproduce: `python3 scripts/import-occupation-income.py`.
Validate without changing JSON: `npm run income:check`.
Standard-library XLSX parsing requires no external Python packages.

Annualized mean = (June monthly cash earnings × 12 + annual special earnings)
× 1,000 yen. Bonuses are principally from the preceding calendar year. This
is not an observed same-calendar-year individual income, self-employed profit,
net pay, initial salary or annual median. The source table does not publish
annual income medians. Occupation mapping is to statistical groups; groups
can contain several occupations. Missing mappings stay unavailable.

Pinned data does not silently change when an official site changes. The existing
scheduled official-source watcher now detects revisions to the wage workbook,
the crosswalk and the statistical-update notice. The importer fails on changed
headers, years, unmatched names or unexpected precision instead of guessing.
