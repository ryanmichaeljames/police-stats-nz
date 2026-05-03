#!/usr/bin/env python3
"""
process_data.py - Transform raw NZ Police CSV exports into JSON for the React app.

Reads raw CSV files from scripts/raw/ (produced by download_data.py) and
transforms them into the aggregated JSON structure expected by public/data/.

If a raw CSV file is absent (e.g. download was skipped), existing JSON files
in public/data/ are left unchanged so the app continues to serve last-known data.

Output files written to public/data/:
  metadata.json
  victimisations/summary.json          — monthly totals
  victimisations/by_district.json      — yearly totals by district
  victimisations/by_offence.json       — yearly totals by offence category
  victimisations/demographics.json     — { by_age, by_sex, by_ethnicity }
  offenders/summary.json
  offenders/by_district.json
  offenders/by_offence.json
  offenders/demographics.json
  demand/summary.json
  drugs/summary.json
"""

import json
import logging
import re
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
log = logging.getLogger(__name__)

REPO_ROOT = Path(__file__).parent.parent
RAW_DIR = Path(__file__).parent / "raw"
DATA_DIR = REPO_ROOT / "public" / "data"

MONTH_NAMES = [
    "", "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
]

# ---------------------------------------------------------------------------
# Column name normalisation helpers
# ---------------------------------------------------------------------------

def normalise_col(name: str) -> str:
    """Lowercase, strip, replace spaces/hyphens with underscores."""
    return re.sub(r"[\s\-]+", "_", name.strip().lower())


def read_csv(path: Path) -> list[dict[str, str]]:
    """Read a CSV file into a list of dicts using stdlib csv."""
    import csv
    if not path.exists():
        return []
    with path.open(encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        return [{normalise_col(k): v.strip() for k, v in row.items()} for row in reader]


def safe_int(value: str) -> int:
    try:
        return int(str(value).replace(",", "").strip())
    except (ValueError, TypeError):
        return 0


def parse_year_month(row: dict) -> tuple[int, int]:
    """
    Attempt to extract year and month from a row.
    Tableau exports typically have a 'year' and 'month' column, or a 'date' column.
    """
    year = safe_int(row.get("year", 0))
    month = safe_int(row.get("month", 0))

    if year == 0 and "date" in row:
        date_str = row["date"]
        for fmt in ("%Y-%m-%d", "%d/%m/%Y", "%m/%Y", "%Y-%m"):
            try:
                dt = datetime.strptime(date_str, fmt)
                year, month = dt.year, dt.month
                break
            except ValueError:
                continue

    return year, month


def month_label(year: int, month: int) -> str:
    m = MONTH_NAMES[month] if 1 <= month <= 12 else f"M{month}"
    return f"{m} {year}"


def write_json(path: Path, data: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, separators=(",", ":"))
    log.info("  Written: %s", path.relative_to(REPO_ROOT))


# ---------------------------------------------------------------------------
# Victimisations processing
# ---------------------------------------------------------------------------

def find_col(row: dict, *candidates: str) -> str:
    """Return the first candidate key present in the row, or empty string."""
    for c in candidates:
        if c in row:
            return row[c]
    return ""


def process_victimisations() -> bool:
    """
    Process victimisations raw CSV into the four JSON files.
    Returns True if raw data was present and processed.
    """
    path = RAW_DIR / "victimisations.csv"
    rows = read_csv(path)
    if not rows:
        log.warning("  victimisations.csv not found — skipping")
        return False

    # Detect count column (Tableau may name it differently)
    sample = rows[0] if rows else {}
    count_col = next(
        (c for c in ["victimisations", "count", "number_of_victimisations", "total"] if c in sample),
        list(sample.keys())[-1] if sample else "victimisations",
    )
    unique_col = next(
        (c for c in ["unique_victims", "unique"] if c in sample),
        None,
    )

    monthly_agg: dict[tuple, dict] = defaultdict(lambda: {"v": 0, "uv": 0})
    district_agg: dict[tuple, dict] = defaultdict(lambda: {"v": 0, "uv": 0})
    offence_agg: dict[tuple, int] = defaultdict(int)
    age_agg: dict[tuple, int] = defaultdict(int)
    sex_agg: dict[tuple, int] = defaultdict(int)
    eth_agg: dict[tuple, int] = defaultdict(int)

    for row in rows:
        year, month = parse_year_month(row)
        if year == 0:
            continue
        v = safe_int(find_col(row, count_col))
        uv = safe_int(find_col(row, unique_col or "")) if unique_col else 0

        monthly_agg[(year, month)]["v"] += v
        monthly_agg[(year, month)]["uv"] += uv

        district = find_col(row, "district", "police_district", "area")
        if district:
            district_agg[(year, district)]["v"] += v
            district_agg[(year, district)]["uv"] += uv

        offence = find_col(row, "offence_category", "offence_type", "anzsoc_group", "crime_type")
        if offence:
            offence_agg[(year, offence)] += v

        age = find_col(row, "age_group", "victim_age", "age")
        if age:
            age_agg[(year, age)] += v

        sex = find_col(row, "sex", "victim_sex", "gender")
        if sex:
            sex_agg[(year, sex)] += v

        eth = find_col(row, "ethnicity", "victim_ethnicity")
        if eth:
            eth_agg[(year, eth)] += v

    # Write summary.json
    summary = [
        {
            "year": y, "month": m, "month_label": month_label(y, m),
            "victimisations": d["v"], "unique_victims": d["uv"],
        }
        for (y, m), d in sorted(monthly_agg.items())
    ]
    write_json(DATA_DIR / "victimisations" / "summary.json", {"data": summary})

    # Write by_district.json
    by_district = [
        {"year": y, "district": dist, "victimisations": d["v"], "unique_victims": d["uv"]}
        for (y, dist), d in sorted(district_agg.items())
    ]
    write_json(DATA_DIR / "victimisations" / "by_district.json", {"data": by_district})

    # Write by_offence.json
    by_offence = [
        {"year": y, "offence_category": oc, "victimisations": v}
        for (y, oc), v in sorted(offence_agg.items())
    ]
    write_json(DATA_DIR / "victimisations" / "by_offence.json", {"data": by_offence})

    # Write demographics.json
    demographics = {
        "by_age": [{"year": y, "age_group": ag, "victimisations": v} for (y, ag), v in sorted(age_agg.items())],
        "by_sex": [{"year": y, "sex": s, "victimisations": v} for (y, s), v in sorted(sex_agg.items())],
        "by_ethnicity": [{"year": y, "ethnicity": e, "victimisations": v} for (y, e), v in sorted(eth_agg.items())],
    }
    write_json(DATA_DIR / "victimisations" / "demographics.json", demographics)
    return True


# ---------------------------------------------------------------------------
# Offenders processing
# ---------------------------------------------------------------------------

def process_offenders() -> bool:
    path = RAW_DIR / "offenders.csv"
    rows = read_csv(path)
    if not rows:
        log.warning("  offenders.csv not found — skipping")
        return False

    sample = rows[0] if rows else {}
    count_col = next(
        (c for c in ["proceedings", "count", "number_of_proceedings", "total"] if c in sample),
        list(sample.keys())[-1] if sample else "proceedings",
    )
    unique_col = next((c for c in ["unique_offenders", "unique"] if c in sample), None)

    monthly_agg: dict[tuple, dict] = defaultdict(lambda: {"p": 0, "uo": 0})
    district_agg: dict[tuple, dict] = defaultdict(lambda: {"p": 0, "uo": 0})
    offence_agg: dict[tuple, int] = defaultdict(int)
    age_agg: dict[tuple, int] = defaultdict(int)
    sex_agg: dict[tuple, int] = defaultdict(int)
    eth_agg: dict[tuple, int] = defaultdict(int)

    for row in rows:
        year, month = parse_year_month(row)
        if year == 0:
            continue
        p = safe_int(find_col(row, count_col))
        uo = safe_int(find_col(row, unique_col or "")) if unique_col else 0

        monthly_agg[(year, month)]["p"] += p
        monthly_agg[(year, month)]["uo"] += uo

        district = find_col(row, "district", "police_district")
        if district:
            district_agg[(year, district)]["p"] += p
            district_agg[(year, district)]["uo"] += uo

        offence = find_col(row, "offence_category", "offence_type", "anzsoc_group")
        if offence:
            offence_agg[(year, offence)] += p

        age = find_col(row, "age_group", "offender_age", "age")
        if age:
            age_agg[(year, age)] += p

        sex = find_col(row, "sex", "offender_sex", "gender")
        if sex:
            sex_agg[(year, sex)] += p

        eth = find_col(row, "ethnicity", "offender_ethnicity")
        if eth:
            eth_agg[(year, eth)] += p

    write_json(DATA_DIR / "offenders" / "summary.json", {"data": [
        {"year": y, "month": m, "month_label": month_label(y, m), "proceedings": d["p"], "unique_offenders": d["uo"]}
        for (y, m), d in sorted(monthly_agg.items())
    ]})
    write_json(DATA_DIR / "offenders" / "by_district.json", {"data": [
        {"year": y, "district": dist, "proceedings": d["p"], "unique_offenders": d["uo"]}
        for (y, dist), d in sorted(district_agg.items())
    ]})
    write_json(DATA_DIR / "offenders" / "by_offence.json", {"data": [
        {"year": y, "offence_category": oc, "proceedings": p}
        for (y, oc), p in sorted(offence_agg.items())
    ]})
    write_json(DATA_DIR / "offenders" / "demographics.json", {
        "by_age": [{"year": y, "age_group": ag, "proceedings": p} for (y, ag), p in sorted(age_agg.items())],
        "by_sex": [{"year": y, "sex": s, "proceedings": p} for (y, s), p in sorted(sex_agg.items())],
        "by_ethnicity": [{"year": y, "ethnicity": e, "proceedings": p} for (y, e), p in sorted(eth_agg.items())],
    })
    return True


# ---------------------------------------------------------------------------
# Demand processing
# ---------------------------------------------------------------------------

def process_demand() -> bool:
    path = RAW_DIR / "demand.csv"
    rows = read_csv(path)
    if not rows:
        log.warning("  demand.csv not found — skipping")
        return False

    agg: dict[tuple, dict] = defaultdict(lambda: {"total": 0, "crime": 0, "non_crime": 0, "proactive": 0})

    for row in rows:
        year, month = parse_year_month(row)
        if year == 0:
            continue
        agg[(year, month)]["total"] += safe_int(find_col(row, "total_demand", "demand", "total"))
        agg[(year, month)]["crime"] += safe_int(find_col(row, "crime_demand", "crime"))
        agg[(year, month)]["non_crime"] += safe_int(find_col(row, "non_crime_demand", "non_crime"))
        agg[(year, month)]["proactive"] += safe_int(find_col(row, "proactive", "proactive_activities"))

    write_json(DATA_DIR / "demand" / "summary.json", {"data": [
        {
            "year": y, "month": m, "month_label": month_label(y, m),
            "total_demand": d["total"], "crime_demand": d["crime"],
            "non_crime_demand": d["non_crime"], "proactive": d["proactive"],
        }
        for (y, m), d in sorted(agg.items())
    ]})
    return True


# ---------------------------------------------------------------------------
# Metadata update
# ---------------------------------------------------------------------------

def update_metadata() -> None:
    metadata_path = DATA_DIR / "metadata.json"
    now = datetime.now(timezone.utc)

    # Try to read existing metadata to preserve data_from
    existing: dict = {}
    if metadata_path.exists():
        try:
            with metadata_path.open() as f:
                existing = json.load(f)
        except json.JSONDecodeError:
            pass

    metadata = {
        "last_updated": now.strftime("%Y-%m-%d"),
        "last_updated_utc": now.isoformat(),
        "data_from": existing.get("data_from", "2015-01"),
        "data_to": now.strftime("%Y-%m"),
        "source": "NZ Police — policedata.nz",
        "source_url": "https://www.police.govt.nz/about-us/publications-statistics/data-and-statistics/policedatanz",
        "license": "Creative Commons Attribution 4.0 International",
        "license_url": "https://creativecommons.org/licenses/by/4.0/",
        "update_frequency": "Monthly (last working day)",
        "note": "Data sourced from NZ Police Tableau Public dashboards. This site is not affiliated with NZ Police.",
    }
    write_json(metadata_path, metadata)


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

def process_deportees() -> bool:
    """Process deportees from Australia CSV."""
    raw_path = RAW_DIR / "deportees.csv"
    rows = read_csv(raw_path)
    if not rows:
        log.warning("  deportees.csv not found — skipping")
        return False

    deportee_agg: dict[int, dict] = defaultdict(lambda: {
        "total": 0, "male": 0, "female": 0,
        "under_25": 0, "25_34": 0, "35_44": 0, "45_plus": 0,
    })

    for row in rows:
        year_str = find_col(row, "year", "calendar_year")
        year = safe_int(year_str)
        if year == 0:
            continue

        total = safe_int(find_col(row, "total", "total_deportees", "deportees", "count"))
        male = safe_int(find_col(row, "male"))
        female = safe_int(find_col(row, "female"))
        u25 = safe_int(find_col(row, "under_25", "age_under_25", "0_24"))
        a25_34 = safe_int(find_col(row, "25_34", "age_25_34"))
        a35_44 = safe_int(find_col(row, "35_44", "age_35_44"))
        a45p = safe_int(find_col(row, "45_plus", "age_45_plus", "45"))

        d = deportee_agg[year]
        d["total"] += total
        d["male"] += male
        d["female"] += female
        d["under_25"] += u25
        d["25_34"] += a25_34
        d["35_44"] += a35_44
        d["45_plus"] += a45p

    (DATA_DIR / "deportees").mkdir(parents=True, exist_ok=True)
    write_json(DATA_DIR / "deportees" / "summary.json", {"data": [
        {
            "year": y,
            "total_deportees": d["total"],
            "male": d["male"],
            "female": d["female"],
            "age_under_25": d["under_25"],
            "age_25_34": d["25_34"],
            "age_35_44": d["35_44"],
            "age_45_plus": d["45_plus"],
        }
        for y, d in sorted(deportee_agg.items())
    ]})
    return True


def main() -> None:
    log.info("=" * 60)
    log.info("NZ Police Statistics — Data Processing")
    log.info("=" * 60)

    processed = 0
    skipped = 0

    for label, func in [
        ("Victimisations", process_victimisations),
        ("Offenders", process_offenders),
        ("Demand", process_demand),
        ("Deportees", process_deportees),
    ]:
        log.info("Processing: %s", label)
        if func():
            processed += 1
        else:
            skipped += 1
            log.info("  → Existing data retained")

    update_metadata()

    log.info("=" * 60)
    log.info("Processing complete: %d updated, %d unchanged", processed, skipped)


if __name__ == "__main__":
    main()
