#!/usr/bin/env python3
"""
download_data.py - Download NZ Police statistics from policedata.nz (Tableau Public)

NZ Police publishes all crime statistics via Tableau Public dashboards at:
  https://public.tableau.com/app/profile/policedata.nz

There is no official REST API or direct CSV download URL. This script uses
Tableau Public's internal vizql session endpoint to export data as CSV.

Strategy:
  1. Bootstrap a Tableau vizql session for each workbook/view
  2. Use the session to export raw CSV data
  3. Save to scripts/raw/ for processing by process_data.py
  4. If session export fails, log a warning and preserve existing data files

Data source:
  NZ Police — policedata.nz
  https://www.police.govt.nz/about-us/publications-statistics/data-and-statistics/policedatanz

License:
  Creative Commons Attribution 4.0 International
  https://creativecommons.org/licenses/by/4.0/
"""

import json
import logging
import re
import sys
import time
from pathlib import Path
from typing import Optional

import requests

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
log = logging.getLogger(__name__)

RAW_DIR = Path(__file__).parent / "raw"
RAW_DIR.mkdir(exist_ok=True)

TABLEAU_BASE = "https://public.tableau.com"

# Confirmed workbook names from policedata.nz Tableau Public profile
# Source: https://public.tableau.com/app/profile/policedata.nz
WORKBOOKS = [
    {
        "workbook": "Victimisations",
        "view": "Summary",
        "dataset": "victimisations",
        "description": "RCVS — Victimisations by demographics",
    },
    {
        "workbook": "VictimisationsPoliceStations",
        "view": "Summary",
        "dataset": "victimisations_stations",
        "description": "RCVS — Victimisations by police station",
    },
    {
        "workbook": "UniqueVictims",
        "view": "Summary",
        "dataset": "unique_victims",
        "description": "RCVS — Unique victims (deduplicated)",
    },
    {
        "workbook": "VictimisationsTimeandPlace",
        "view": "Summary",
        "dataset": "victimisations_time_place",
        "description": "RCVS — Victimisations by time and place",
    },
    {
        "workbook": "OffenderProceedings",
        "view": "Summary",
        "dataset": "offenders",
        "description": "RCOS — Proceedings by offender demographics",
    },
    {
        "workbook": "OffenderProceedingsPoliceStations",
        "view": "Summary",
        "dataset": "offenders_stations",
        "description": "RCOS — Proceedings by police station",
    },
    {
        "workbook": "UniqueOffenders",
        "view": "Summary",
        "dataset": "unique_offenders",
        "description": "RCOS — Unique offenders (deduplicated)",
    },
    {
        "workbook": "DemandandActivity",
        "view": "Summary",
        "dataset": "demand",
        "description": "Demand and Activity — crime and non-crime demand",
    },
    {
        "workbook": "MODAReport",
        "view": "Summary",
        "dataset": "drugs",
        "description": "Drug policing — MODA actions pre/post 2019 amendment",
    },
]

REQUEST_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-NZ,en;q=0.9",
}


def bootstrap_session(
    http: requests.Session, workbook: str, view: str
) -> Optional[str]:
    """
    Bootstrap a Tableau Public vizql session.
    Returns the session ID string, or None on failure.
    """
    url = f"{TABLEAU_BASE}/vizql/w/{workbook}/v/{view}/bootstrapSession"
    try:
        resp = http.post(
            url,
            headers={**REQUEST_HEADERS, "Content-Type": "application/x-www-form-urlencoded"},
            data={"sheet_id": view},
            timeout=30,
        )
        if resp.status_code != 200:
            log.warning("  Bootstrap HTTP %s for %s/%s", resp.status_code, workbook, view)
            return None

        text = resp.text

        # Response is often a mixed content type — JSON embedded after a length prefix.
        # Try to find and parse the JSON portion.
        json_start = text.find("{")
        if json_start != -1:
            try:
                data = json.loads(text[json_start:])
                session_id = data.get("sessionid")
                if session_id:
                    return str(session_id)
            except json.JSONDecodeError:
                pass

        # Fallback: regex extraction
        match = re.search(r'"sessionid"\s*:\s*"([^"]+)"', text)
        if match:
            return match.group(1)

        log.warning("  Could not extract session ID from bootstrap response")
        return None

    except requests.RequestException as exc:
        log.warning("  Bootstrap request error: %s", exc)
        return None


def export_csv_via_session(
    http: requests.Session, workbook: str, view: str, session_id: str
) -> Optional[str]:
    """
    Export data from an active Tableau vizql session as CSV.
    Returns CSV text, or None on failure.
    """
    url = (
        f"{TABLEAU_BASE}/vizql/w/{workbook}/v/{view}"
        f"/vud/sessions/{session_id}/views/{view}/exportData"
        "?format=csv&maxRows=-1"
    )
    try:
        resp = http.get(url, headers=REQUEST_HEADERS, timeout=120)
        if resp.status_code == 200 and resp.text.strip():
            return resp.text
        log.warning("  Export HTTP %s", resp.status_code)
        return None
    except requests.RequestException as exc:
        log.warning("  Export request error: %s", exc)
        return None


def download_workbook_entry(workbook_cfg: dict) -> bool:
    """
    Attempt to download a single workbook's data.
    Returns True if data was successfully saved, False otherwise.
    """
    workbook = workbook_cfg["workbook"]
    view = workbook_cfg["view"]
    dataset = workbook_cfg["dataset"]
    description = workbook_cfg["description"]
    output_path = RAW_DIR / f"{dataset}.csv"

    log.info("Fetching: %s (%s)", description, workbook)

    http = requests.Session()
    csv_data = None

    # First, visit the public viz page to get cookies/tokens
    viz_url = f"{TABLEAU_BASE}/views/{workbook}/{view}"
    try:
        http.get(viz_url, headers=REQUEST_HEADERS, timeout=15)
    except requests.RequestException:
        pass  # Cookie prefetch is best-effort

    # Bootstrap session
    session_id = bootstrap_session(http, workbook, view)
    if session_id:
        log.info("  Session: %s...", session_id[:24])
        csv_data = export_csv_via_session(http, workbook, view, session_id)

    if csv_data:
        output_path.write_text(csv_data, encoding="utf-8")
        row_count = csv_data.count("\n")
        log.info("  ✓ Saved %s (%d rows)", output_path.name, row_count)
        return True

    log.warning("  ✗ Could not download %s — existing data will be preserved", dataset)
    return False


def main() -> None:
    log.info("=" * 60)
    log.info("NZ Police Statistics — Data Download")
    log.info("Source: policedata.nz (Tableau Public)")
    log.info("License: Creative Commons Attribution 4.0")
    log.info("=" * 60)

    success = 0
    failed = 0

    for wb in WORKBOOKS:
        ok = download_workbook_entry(wb)
        if ok:
            success += 1
        else:
            failed += 1
        # Respectful rate limiting — avoid hammering the server
        time.sleep(3)

    log.info("=" * 60)
    log.info("Complete: %d downloaded, %d skipped/failed", success, failed)

    if failed > 0:
        log.info(
            "Note: Skipped datasets will retain their last known values in public/data/. "
            "The app will continue to work with existing data."
        )

    # Exit 0 even if some failed — preserve existing data rather than breaking the workflow
    sys.exit(0)


if __name__ == "__main__":
    main()
