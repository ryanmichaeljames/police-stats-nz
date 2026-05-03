"""
Placeholder script to download NZ Police statistics data from official sources.

In production this would fetch from the policedata.nz Tableau Public API
or download CSV exports. For now it falls through to process_data.py which
uses the pre-generated sample data.
"""
import os

print("download_data.py: No external download configured — using existing public/data/ files.")
print("To implement: fetch from https://www.police.govt.nz/about-us/publications-statistics/data-and-statistics/policedatanz")
