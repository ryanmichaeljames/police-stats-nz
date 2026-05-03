#!/usr/bin/env python3
"""
download_conduct.py - Download NZ Police Professional Conduct Statistics PDFs.

NZ Police publishes conduct statistics as quarterly PDF tables at:
  https://www.police.govt.nz/about-us/about-new-zealand-police/police-professional-conduct/professional-conduct-statistics

This script:
  1. Scrapes the landing page to discover current PDF links
  2. Probes known historical URL patterns for past releases
  3. Downloads all available PDFs (T1–T6) to scripts/raw/conduct/
  4. Preserves existing files to avoid unnecessary re-downloads

PDF naming convention (recent):
  professional-conduct-statistics-table{N}-{mmm}-{yyyy}.pdf
  e.g. table1-dec-2024.pdf, table3-mar-2025.pdf

PDF naming convention (older):
  professional-conduct-statistics-table{N}-{month}-{yyyy}.pdf
  e.g. table1-december-2021.pdf

Table 6 (5-year trend, published inconsistently):
  professional-conduct-statistics-table6-{yyyy}.pdf
"""

import logging
import re
import sys
import time
from pathlib import Path

import requests
from bs4 import BeautifulSoup

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
log = logging.getLogger(__name__)

RAW_DIR = Path(__file__).parent / "raw" / "conduct"
RAW_DIR.mkdir(parents=True, exist_ok=True)

BASE_URL = "https://www.police.govt.nz"
LANDING_PAGE = f"{BASE_URL}/about-us/about-new-zealand-police/police-professional-conduct/professional-conduct-statistics"
PDF_BASE = f"{BASE_URL}/sites/default/files/publications"

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,*/*;q=0.8",
    "Accept-Language": "en-NZ,en;q=0.9",
}

# Known quarterly releases — URL slugs (month-year)
# Pattern: https://www.police.govt.nz/about-us/publication/professional-conduct-statistics-{slug}
KNOWN_RELEASES = [
    ("december-2018", 2018, 4, "dec-2018"),
    ("december-2019", 2019, 4, "dec-2019"),
    ("december-2020", 2020, 4, "dec-2020"),
    ("june-2021",     2021, 2, "june-2021"),
    ("december-2021", 2021, 4, "december-2021"),
    ("december-2022", 2022, 4, "dec-2022"),
    ("december-2023", 2023, 4, "dec-2023"),
    ("march-2024",    2024, 1, "mar-2024"),
    ("june-2024",     2024, 2, "jun-2024"),
    ("september-2024",2024, 3, "sep-2024"),
    ("december-2024", 2024, 4, "dec-2024"),
    ("march-2025",    2025, 1, "mar-2025"),
    ("june-2025",     2025, 2, "jun-2025"),
]

# Table 6 uses year only — check for these years
TABLE6_YEARS = [2018, 2019, 2023, 2025]


def scrape_landing_page(http: requests.Session) -> list[str]:
    """Fetch the landing page and extract all .pdf href values."""
    try:
        resp = http.get(LANDING_PAGE, headers=HEADERS, timeout=20)
        resp.raise_for_status()
        soup = BeautifulSoup(resp.text, "html.parser")
        links = []
        for a in soup.find_all("a", href=True):
            href = a["href"]
            if ".pdf" in href.lower() and "professional-conduct" in href.lower():
                if href.startswith("/"):
                    href = BASE_URL + href
                links.append(href)
        log.info("Landing page scraped — found %d PDF links", len(links))
        return links
    except Exception as e:
        log.warning("Landing page scrape failed: %s", e)
        return []


def build_pdf_urls(pdf_suffix: str) -> list[tuple[int, str]]:
    """Return (table_number, url) pairs for tables 1-5 for a given date suffix."""
    urls = []
    for n in range(1, 6):
        filename = f"professional-conduct-statistics-table{n}-{pdf_suffix}.pdf"
        urls.append((n, f"{PDF_BASE}/{filename}"))
    return urls


def download_pdf(http: requests.Session, url: str, dest: Path) -> bool:
    """Download a PDF if it doesn't already exist. Returns True on success."""
    if dest.exists():
        log.info("  ✓ Already exists: %s", dest.name)
        return True
    try:
        resp = http.get(url, headers=HEADERS, timeout=30, stream=True)
        if resp.status_code == 404:
            return False
        resp.raise_for_status()
        content = resp.content
        if len(content) < 1000:
            log.warning("  ⚠ Too small (%d bytes), skipping: %s", len(content), dest.name)
            return False
        dest.write_bytes(content)
        log.info("  ↓ Downloaded (%d KB): %s", len(content) // 1024, dest.name)
        time.sleep(0.5)
        return True
    except requests.RequestException as e:
        log.warning("  ✗ Failed %s: %s", url, e)
        return False


def main() -> None:
    http = requests.Session()
    http.headers.update(HEADERS)

    log.info("=" * 60)
    log.info("NZ Police Professional Conduct — PDF Downloader")
    log.info("=" * 60)

    # Scrape landing page for any URLs we might have missed
    landing_pdfs = scrape_landing_page(http)

    downloaded = 0
    skipped = 0

    # Download from known releases
    for slug, year, quarter, pdf_suffix in KNOWN_RELEASES:
        log.info("Release: %s (Q%d %d)", slug, quarter, year)
        for table_num, url in build_pdf_urls(pdf_suffix):
            filename = Path(url).name
            dest = RAW_DIR / filename
            ok = download_pdf(http, url, dest)
            if ok:
                downloaded += 1
            else:
                skipped += 1

    # Table 6 (5-year trend, year-only naming)
    for yr in TABLE6_YEARS:
        filename = f"professional-conduct-statistics-table6-{yr}.pdf"
        url = f"{PDF_BASE}/{filename}"
        dest = RAW_DIR / filename
        ok = download_pdf(http, url, dest)
        if ok:
            downloaded += 1
        else:
            skipped += 1

    # Also grab any additional PDFs found on the landing page
    for url in landing_pdfs:
        filename = Path(url.split("?")[0]).name
        dest = RAW_DIR / filename
        if not dest.exists() and filename.endswith(".pdf"):
            ok = download_pdf(http, url, dest)
            if ok:
                downloaded += 1

    log.info("=" * 60)
    log.info("Complete: %d downloaded/cached, %d not found (404)", downloaded, skipped)
    log.info("PDFs saved to: %s", RAW_DIR)


if __name__ == "__main__":
    main()
