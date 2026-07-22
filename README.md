# Suno Architect - Auto Generate Suno Prompts
- Various free and paid Gemini models available
- Gemini Flash 3, 3.1-lite, 3.5-lite, 3.5 and 3.6 have generous free limits.
  - Flash-lite models have 20/min and 500/day limits
  - Non-lite Flash models have 5/min and 20/day limits
  - [Full Rate Limits](https://aistudio.google.com/rate-limit) - _Paid is required for Pro models._
  - Create a key in [aistudio](https://aistudio.google.com/api-keys) with billing disabled for free flash model access.

## Featues

### Generation
- Generates
  - Song title
  - Suno style settings (weirdness %, style %, exclude, and male/female/none)
  - Lyrics including Suno style tags
  - Lyrics without tags, copy pastable for elsewhere. Togglable for use via the API to remove tags in displayed lyrics after generation.
- **OPTIONAL:** Utilises Suno API
  - Requires an easily obtainable token (which may expire at times)
  - Adds a button to send directly to the Suno API
  - Saves ID in 'history' tab to display image(s), links to suno tracks, download buttons, song metadata (BPM, explicit, prompt details), etc
  - Support for pulling the timed lyrics from Suno
  - Support for conversion of timed lyrics JSON to LRC or SRT
  - NOTE: _For some reason the main generation API is cors locked, requiring the worker. The rest is direct via browser)_
- **OPTIONAL:** Use of files for prompts
  - Audio files for style influencing
  - Image files to influence lyrics vibe
  - PDF or text files to influence lore (background)
 
### LRC and SRT File Generation
- Pulls JSON word-by-word lyrics from Suno API
- Pulls lyrics from Suno API
- Times word-timed lyrics line-by-line based on original prompt / listed lyrics, exportable as SRT or LRC

### Lyric Video Generation
- Pulls JSON word-by-word lyrics from Suno API for highlighting active word
- Pulls lyrics (prompt) from Suni API for line generation
- Live preview available with various settings
- Exportable to webm

## Deploy with Cloudflare
[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/Lumi-Script/suno-architect/)
- Requires the worker to forward Suno generation requests and avoid cors issues, ~~all other API end points seem to work fine.~~ - Suno has updated almost all endpoints to be cors locked, requiring the worker for forwarding. The CDN (for images and mp3 downloads) still works directly.

## Credits
- [https://github.com/gcui-art/suno-api/](https://github.com/gcui-art/suno-api/) has reverse engineered most of the API already, so I didn't need to do it myself. _None of the code is directly used but it helped speeding up understanding the API. Also has interfaces and types to know what response to expect from the API._
