# Active Blockers & Known Limitations (`BLOCKERS.md`)

## Active Blockers
None. All 10 phases and 27 acceptance criteria are fully built, tested, and passing.

## Known Platform Limitations
1. **Free Tier Search Limit**: Tavily free API key has monthly query caps; DuckDuckGo web scraper acts as automatic fallback.
2. **Local Image OCR**: Tesseract JS OCR runs locally in browser worker thread; accuracy depends on document image clarity.
3. **Card-Free Offline Fallback**: When external LLM keys are absent, local AI compiler generates valid responsive static site structures.
