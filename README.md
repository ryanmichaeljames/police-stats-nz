# Police Stats NZ

An independent web application for exploring publicly available New Zealand Police statistics. Charts, summaries, and trends from official NZ Police data — no political framing, no tracking, no paywalls.

> **Disclaimer:** This site is not affiliated with, endorsed by, or connected to the New Zealand Police. All data is sourced from official NZ Police public publications.

**Live site:** https://ryanmichaeljames.github.io/police-stats-nz/

---

## Features

- Interactive charts — trend lines, bar charts, demographic breakdowns, year-on-year comparisons
- Filter by year range, police district, and offence category
- 10+ years of monthly data (January 2015 to present)
- Download any dataset as CSV or JSON directly from the app
- Data Explorer — browse and filter all datasets in full
- Automatically updated monthly via GitHub Actions
- No cookies, no analytics, no user data collected
- Fully open source — public repository, all data files included

---

## Pages

| Page | Description |
|---|---|
| Overview | KPI summary cards, 12-month trend, top offence categories |
| Victimisations | RCVS — trend, district, offence type, victim demographics |
| Offenders | RCOS — trend, district, offence type, offender demographics |
| Family Violence | Family violence trend and district breakdown |
| Demand & Activity | Crime vs non-crime demand, proactive activities |
| Data Explorer | Browse and download all datasets |
| About | Data sources, methodology, privacy, license |

---

## Data Sources

All data is published by the New Zealand Police under [Creative Commons Attribution 4.0 International](https://creativecommons.org/licenses/by/4.0/).

| Dataset | Description |
|---|---|
| **RCVS** — Recorded Crime Victims Statistics | Victimisations and unique victims by district, offence type, and demographics (monthly from Jan 2015) |
| **RCOS** — Recorded Crime Offenders Statistics | Proceedings and unique offenders by district, offence type, and demographics (monthly from Jan 2015) |
| **Demand and Activity** | Crime vs non-crime demand and proactive activities by district (monthly) |

Source: [policedata.nz](https://www.police.govt.nz/about-us/publications-statistics/data-and-statistics/policedatanz)

---

## Tech Stack

| | |
|---|---|
| Frontend | React 19, TypeScript, Vite |
| Charts | Recharts |
| Routing | React Router v7 |
| Styling | Tailwind CSS |
| Hosting | GitHub Pages |
| Data pipeline | Python 3, GitHub Actions |

---

## Project Structure

```
police-stats-nz/
├── .github/workflows/
│   ├── deploy.yml          # Build and deploy to GitHub Pages on push to main
│   └── update-data.yml     # Monthly data refresh (1st of each month, 6am UTC)
├── scripts/
│   ├── download_data.py    # Download raw CSVs from NZ Police Tableau Public
│   ├── process_data.py     # Aggregate raw CSVs into JSON for the frontend
│   └── requirements.txt
├── public/data/
│   ├── victimisations/     # summary, by_district, by_offence, demographics
│   ├── offenders/          # summary, by_district, by_offence, demographics
│   └── demand/             # summary
└── src/
    ├── components/         # Charts, layout, and UI components
    ├── hooks/              # useData, useFilters
    ├── pages/              # One file per page route
    ├── types/              # TypeScript interfaces for all data shapes
    └── utils/              # Formatters, CSV export, constants
```

---

## Local Development

Requires Node.js 18+.

```bash
npm install
npm run dev       # Dev server at http://localhost:5173/police-stats-nz/
npm run build     # Production build to dist/
npm run preview   # Preview production build locally
npm run lint      # Run ESLint
```

---

## Data Pipeline

Data is refreshed automatically on the **1st of each month** via GitHub Actions. To run the pipeline manually:

```bash
cd scripts
pip install -r requirements.txt

# Step 1: download raw CSVs from policedata.nz
python download_data.py

# Step 2: aggregate raw CSVs into public/data/ JSON files
python process_data.py
```

Raw CSV files are saved to `scripts/raw/` (git-ignored). If a download step fails, the existing `public/data/` files are left unchanged so the app continues to serve last-known data.

---

## Privacy

- No cookies of any kind
- No analytics or tracking scripts
- No user data collected or stored
- Static site — all data is served as flat files from this repository

---

## License

**Source code:** [MIT License](LICENSE)

**NZ Police data:** Crown copyright © New Zealand Police, licensed under [Creative Commons Attribution 4.0 International](https://creativecommons.org/licenses/by/4.0/).