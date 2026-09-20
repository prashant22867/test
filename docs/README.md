# Sky Check — static weather page

A single-file weather page that runs entirely in the browser. It calls the free
[Open-Meteo](https://open-meteo.com) API, which needs **no API key** and allows
direct browser (CORS) requests — so it works on plain static hosting like GitHub
Pages with no backend.

## Features

- City search + "use my location" (browser geolocation)
- Current conditions: temperature, feels-like, humidity, wind, precipitation, day/night
- 7-day forecast
- Light/dark theme

## APIs used (both free, no key)

- **Geocoding:** `https://geocoding-api.open-meteo.com/v1/search?name=<city>`
- **Forecast:** `https://api.open-meteo.com/v1/forecast?latitude=<lat>&longitude=<lon>&current=...&daily=...`

## Publish on GitHub Pages

1. Push this repo to GitHub (already on your branch).
2. On GitHub: **Settings → Pages**.
3. Under **Build and deployment → Source**, choose **Deploy from a branch**.
4. Pick your branch and set the folder to **`/docs`**, then **Save**.
5. Wait ~1 minute; your page appears at
   `https://<username>.github.io/<repo>/`.

That's it — no build step, no server, no secrets.

## Run locally

Just open `docs/index.html` in a browser, or serve the folder:

```bash
python3 -m http.server -d docs 8080   # → http://localhost:8080
```
