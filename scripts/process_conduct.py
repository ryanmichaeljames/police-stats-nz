#!/usr/bin/env python3
"""
process_conduct.py - Extract NZ Police Professional Conduct Statistics from PDFs → JSON.

Reads PDFs from scripts/raw/conduct/ (produced by download_conduct.py) and
extracts structured data using pdfplumber, writing JSON to public/data/conduct/.

Output files:
  public/data/conduct/summary.json       — YTD totals per release period
  public/data/conduct/by_district.json   — incidents & involved staff by district per period
  public/data/conduct/by_allegation.json — incidents by allegation category per period

PDF Table reference:
  Table 1: YTD incidents & employees by district, cross-tabbed by 11 allegation categories
  Table 2: Top 5 national allegations by type
  Table 3: Monthly incident count per district
  Table 4: Monthly involved staff count per district
  Table 5: Top 10 allegations nationally by month + YTD
  Table 6: 5-year incident totals + YoY % change (published inconsistently)

Data source: NZ Police — IAPro professional standards system
License: Creative Commons Attribution 4.0 International
"""

import json
import logging
import re
from collections import defaultdict
from pathlib import Path
from typing import Any

try:
    import pdfplumber
except ImportError:
    print("ERROR: pdfplumber is required. Install with: pip install pdfplumber")
    raise

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
log = logging.getLogger(__name__)

REPO_ROOT = Path(__file__).parent.parent
RAW_DIR = Path(__file__).parent / "raw" / "conduct"
DATA_DIR = REPO_ROOT / "public" / "data" / "conduct"
DATA_DIR.mkdir(parents=True, exist_ok=True)

# Known release metadata: (pdf_suffix, year, quarter, period_label, quarter_label)
RELEASES = [
    ("dec-2018",      2018, 4, "Dec 2018", "Q4"),
    ("dec-2019",      2019, 4, "Dec 2019", "Q4"),
    ("dec-2020",      2020, 4, "Dec 2020", "Q4"),
    ("june-2021",     2021, 2, "Jun 2021", "Q2"),
    ("december-2021", 2021, 4, "Dec 2021", "Q4"),
    ("dec-2022",      2022, 4, "Dec 2022", "Q4"),
    ("dec-2023",      2023, 4, "Dec 2023", "Q4"),
    ("mar-2024",      2024, 1, "Mar 2024", "Q1"),
    ("jun-2024",      2024, 2, "Jun 2024", "Q2"),
    ("sep-2024",      2024, 3, "Sep 2024", "Q3"),
    ("dec-2024",      2024, 4, "Dec 2024", "Q4"),
    ("mar-2025",      2025, 1, "Mar 2025", "Q1"),
    ("jun-2025",      2025, 2, "Jun 2025", "Q2"),
]

NZ_DISTRICTS = [
    "Auckland City", "Bay Of Plenty", "Canterbury", "Central",
    "Counties/Manukau", "Eastern", "Northland", "Southern",
    "Tasman", "Waikato", "Waitematā", "Wellington", "Service Centres",
]

ALLEGATION_CATEGORIES = [
    "Use of Force on Duty",
    "Arrest/Custodial",
    "Searches",
    "Significant Event",
    "Traffic Offences",
    "Service Failure",
    "Unprofessional Behaviour",
    "Breach of Official Conduct",
    "Workplace Behaviour",
    "Use of Police Resources",
    "Off Duty Behaviour",
]


def safe_int(value: str) -> int:
    if value is None:
        return 0
    try:
        return int(re.sub(r"[^0-9]", "", str(value)))
    except (ValueError, TypeError):
        return 0


def normalise(text: str) -> str:
    """Lowercase and strip whitespace for fuzzy matching."""
    return re.sub(r"\s+", " ", text.strip().lower())


def find_district(text: str) -> str | None:
    """Return a canonical district name if text matches any known district."""
    t = normalise(text)
    for d in NZ_DISTRICTS:
        if normalise(d) in t or t in normalise(d):
            return d
    return None


def find_allegation(text: str) -> str | None:
    """Return canonical allegation category if text matches."""
    t = normalise(text)
    for a in ALLEGATION_CATEGORIES:
        if normalise(a) in t or t in normalise(a):
            return a
    return None


def extract_pdf_tables(pdf_path: Path) -> list[list[list[str | None]]]:
    """Extract all tables from a PDF file. Returns list of tables, each a list of rows."""
    tables = []
    try:
        with pdfplumber.open(str(pdf_path)) as pdf:
            for page in pdf.pages:
                page_tables = page.extract_tables()
                if page_tables:
                    tables.extend(page_tables)
    except Exception as e:
        log.warning("  Failed to read %s: %s", pdf_path.name, e)
    return tables


def parse_table1(pdf_suffix: str, year: int, quarter: int, period: str) -> dict:
    """
    Table 1: YTD incidents and involved employees by district, cross-tabbed by allegation.
    Returns { incidents, involved_staff, district_rows, allegation_rows }
    """
    pdf_path = RAW_DIR / f"professional-conduct-statistics-table1-{pdf_suffix}.pdf"
    if not pdf_path.exists():
        log.warning("  table1 not found: %s", pdf_path.name)
        return {}

    tables = extract_pdf_tables(pdf_path)
    district_incidents: dict[str, int] = defaultdict(int)
    district_staff: dict[str, int] = defaultdict(int)
    allegation_incidents: dict[str, int] = defaultdict(int)
    total_incidents = 0
    total_staff = 0

    for table in tables:
        for row in table:
            if not row:
                continue
            cells = [str(c).strip() if c else "" for c in row]
            # Try to identify district rows — first cell matches a district name
            dist = find_district(cells[0])
            if dist and len(cells) >= 3:
                # Typically: District | Total Incidents | Constabulary | Other | Unidentified | ...
                inc = safe_int(cells[1]) if len(cells) > 1 else 0
                staff = safe_int(cells[2]) if len(cells) > 2 else 0
                district_incidents[dist] += inc
                district_staff[dist] += staff
                total_incidents += inc
                total_staff += staff

            # Try to identify allegation rows
            alleg = find_allegation(cells[0])
            if alleg and len(cells) >= 2:
                inc = safe_int(cells[1])
                allegation_incidents[alleg] += inc

    return {
        "total_incidents": total_incidents,
        "total_staff": total_staff,
        "district_incidents": dict(district_incidents),
        "district_staff": dict(district_staff),
        "allegation_incidents": dict(allegation_incidents),
    }


def parse_table3(pdf_suffix: str) -> dict[str, dict[int, int]]:
    """
    Table 3: Monthly incident count per district.
    Returns { district: { month: count } }
    """
    pdf_path = RAW_DIR / f"professional-conduct-statistics-table3-{pdf_suffix}.pdf"
    if not pdf_path.exists():
        return {}

    tables = extract_pdf_tables(pdf_path)
    result: dict[str, dict[int, int]] = defaultdict(lambda: defaultdict(int))

    for table in tables:
        # Find header row to map column index → month number
        month_cols: dict[int, int] = {}
        for row in table:
            if not row:
                continue
            cells = [str(c).strip() if c else "" for c in row]
            # Header detection: look for month names
            for col_idx, cell in enumerate(cells):
                for m_num, m_name in enumerate(
                    ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                     "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"], start=1
                ):
                    if m_name.lower() in cell.lower():
                        month_cols[col_idx] = m_num

            if month_cols:
                dist = find_district(cells[0])
                if dist:
                    for col_idx, m_num in month_cols.items():
                        if col_idx < len(cells):
                            result[dist][m_num] += safe_int(cells[col_idx])

    return {d: dict(months) for d, months in result.items()}


def write_json(path: Path, data: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    log.info("  Wrote %s (%d bytes)", path.name, path.stat().st_size)


def main() -> None:
    log.info("=" * 60)
    log.info("NZ Police Professional Conduct — PDF Data Extractor")
    log.info("=" * 60)

    summary_rows = []
    district_rows = []
    allegation_rows = []
    processed = 0
    skipped = 0

    for pdf_suffix, year, quarter, period, quarter_label in RELEASES:
        t1_path = RAW_DIR / f"professional-conduct-statistics-table1-{pdf_suffix}.pdf"
        if not t1_path.exists():
            log.info("Skipping %s — PDFs not downloaded", period)
            skipped += 1
            continue

        log.info("Processing: %s", period)
        result = parse_table1(pdf_suffix, year, quarter, period)

        if not result:
            log.warning("  No data extracted from %s", period)
            skipped += 1
            continue

        total_inc = result.get("total_incidents", 0)
        total_staff = result.get("total_staff", 0)

        # Summary row (resolved/ongoing not in Table 1 — would need IPCA reports)
        summary_rows.append({
            "period": period,
            "year": year,
            "quarter": quarter,
            "quarter_label": quarter_label,
            "incidents": total_inc,
            "involved_staff": total_staff,
            "resolved": 0,
            "ongoing": 0,
        })

        # District rows
        for dist in NZ_DISTRICTS:
            inc = result["district_incidents"].get(dist, 0)
            staff = result["district_staff"].get(dist, 0)
            if inc > 0 or staff > 0:
                district_rows.append({
                    "period": period,
                    "year": year,
                    "quarter": quarter,
                    "district": dist,
                    "incidents": inc,
                    "involved_staff": staff,
                })

        # Allegation rows
        for alleg in ALLEGATION_CATEGORIES:
            inc = result["allegation_incidents"].get(alleg, 0)
            if inc > 0:
                allegation_rows.append({
                    "period": period,
                    "year": year,
                    "quarter": quarter,
                    "allegation_category": alleg,
                    "incidents": inc,
                })

        processed += 1

    if processed == 0:
        log.warning("No PDFs were processed — existing JSON files retained")
        return

    write_json(DATA_DIR / "summary.json", {
        "_note": (
            "Extracted from NZ Police Professional Conduct Statistics PDFs. "
            "Source: https://www.police.govt.nz/about-us/about-new-zealand-police/"
            "police-professional-conduct/professional-conduct-statistics"
        ),
        "data": summary_rows,
    })
    write_json(DATA_DIR / "by_district.json", {
        "_note": "YTD incidents by district. Source: Table 1.",
        "data": district_rows,
    })
    write_json(DATA_DIR / "by_allegation.json", {
        "_note": "YTD incidents by allegation category. Source: Table 1.",
        "data": allegation_rows,
    })

    log.info("=" * 60)
    log.info("Complete: %d releases processed, %d skipped", processed, skipped)


if __name__ == "__main__":
    main()
