# Police Stats NZ

**Police Stats NZ** is an independent web application for exploring publicly available New Zealand Police statistics. It presents objective charts, summaries, and trends from official NZ Police data so users can examine crime patterns by location, time period, offence type, and demographics.

> ⚠️ This site is **not affiliated with, endorsed by, or connected to the New Zealand Police**. All data is sourced from official NZ Police public publications.

🌐 **Live site:** [ryanmichaeljames.github.io/police-stats-nz](https://ryanmichaeljames.github.io/police-stats-nz/)

---

## Features

- 📊 **Interactive charts** — trend lines, bar charts, demographic breakdowns, year-on-year comparisons
- 🗺️ **Geographic breakdown** — national, police district, and station level
- 📅 **10+ years of data** — monthly data from January 2015
- ⬇️ **Download all data** — every dataset available as CSV and JSON
- 🔍 **Data Explorer** — browse and filter all raw datasets
- 🔄 **Automatically updated** — GitHub Actions downloads fresh data monthly
- 🚫 **No tracking** — zero cookies, zero analytics, zero user data collection
- 📖 **Open source** — fully public repository

---

## Data Sources

All data is published by the New Zealand Police and licensed under [Creative Commons Attribution 4.0 International](https://creativecommons.org/licenses/by/4.0/).

| Dataset | Description | Update Frequency |
|---|---|---|
| **RCVS** — Recorded Crime Victims Statistics | Victim-focused: victimisations and unique victims by district, offence type, demographics | Monthly |
| **RCOS** — Recorded Crime Offenders Statistics | Offender-focused: proceedings and unique offenders by district, offence type, demographics | Monthly |
| **Demand and Activity** | Crime vs non-crime demand, proactive activities by district | Monthly |

**Source:** [policedata.nz](https://www.police.govt.nz/about-us/publications-statistics/data-and-statistics/policedatanz) — NZ Police Tableau Public dashboards

---

## Pages

| Page | Description |
|---|---|
| **Overview** | Dashboard with KPI cards, 12-month trend, top offence categories |
| **Victimisations** | RCVS explorer — trend, district, offence type, victim demographics |
| **Offenders** | RCOS explorer — trend, district, offence type, offender demographics |
| **Family Violence** | Family violence subset — monthly trend, district breakdown |
| **Demand & Activity** | Police demand volume — crime vs non-crime, proactive activities |
| **Data Explorer** | Browse and download all datasets in full |
| **About** | Transparency, methodology, data sources, privacy statement |

---

## Tech Stack

- **Frontend:** React 18 + TypeScript + Vite
- **Charts:** Recharts
- **Routing:** React Router v6
- **Styling:** Tailwind CSS
- **Hosting:** GitHub Pages
- **Data pipeline:** Python 3 + GitHub Actions

---

## Project Structure

```
police-stats-nz/
├── .github/
│   └── workflows/
│       ├── deploy.yml          # Deploy to GitHub Pages on push to main
│       └── update-data.yml     # Monthly data download & processing (CRON)
├── scripts/
│   ├── download_data.py        # Download from Tableau Public
│   ├── process_data.py         # Aggregate CSVs into JSON for the frontend
│   └── requirements.txt
├── public/
│   └── data/
│       ├── metadata.json
│       ├── victimisations/
│       ├── offenders/
│       └── demand/
└── src/
    ├── components/
    ├── hooks/
    ├── pages/
    ├── types/
    └── utils/
```

---

## Local Development

```bash
npm install
npm run dev      # http://localhost:5173/police-stats-nz/
npm run build    # Production build
```

---

## Data Pipeline

Data is automatically refreshed on the **1st of each month** via GitHub Actions.

To run manually:

```bash
cd scripts
pip install -r requirements.txt
python download_data.py   # Downloads raw CSVs from policedata.nz
python process_data.py    # Processes CSVs into public/data/ JSON files
```

If a download fails, existing data is preserved and the workflow continues.

---

## Privacy

- ✅ No cookies of any kind
- ✅ No analytics or tracking scripts
- ✅ No user data collected or stored
- ✅ Static site — no server-side processing

---

## License

Source code: [MIT License](LICENSE)

NZ Police data: Crown copyright © licensed under [Creative Commons Attribution 4.0 International](https://creativecommons.org/licenses/by/4.0/). Source: [NZ Police — policedata.nz](https://www.police.govt.nz/about-us/publications-statistics/data-and-statistics/policedatanz).

---

## Disclaimer

This is an independent, non-commercial website. It is not affiliated with, endorsed by, or connected to the New Zealand Police. Data is presented as-is from official sources without political framing or editorial interpretation.
