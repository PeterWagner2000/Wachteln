# Cashflow Wachtelzucht (stabile Website)

Diese Version ist als **statische Website** aufgebaut, damit du sie dauerhaft online hosten kannst (z. B. über Cloudflare Pages, Netlify oder Vercel).

## Lokal starten

```bash
python3 -m http.server 8080
```

Dann öffnen: `http://localhost:8080`

## Inhalte

- `index.html` – Oberfläche
- `styles.css` – Styling
- `app.js` – Logik + automatische Speicherung in `localStorage`

## Deployment (empfohlen: Cloudflare Pages)

1. Repository zu GitHub pushen.
2. In Cloudflare: **Workers & Pages → Create application → Pages → Connect to Git**.
3. Repository wählen.
4. Build-Einstellungen:
   - Framework preset: `None`
   - Build command: *(leer lassen)*
   - Build output directory: `/`
5. Deploy klicken.

Danach bekommst du eine öffentliche URL, die weltweit erreichbar ist.

## Wichtiger Hinweis zur Datenhaltung

Die Einträge werden im Browser gespeichert (`localStorage`).
Das heißt:
- Gerät-/Browser-spezifisch
- Nicht automatisch zwischen Geräten synchronisiert

Für Gerätewechsel kannst du die Export-/Import-Funktion (JSON) verwenden.
