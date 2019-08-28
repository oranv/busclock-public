# busclock-public
hacked together page to display bus arrival times from the SBMTD/Clever Devices API

You will need:
- a web host that supports PHP (for the proxy)
- an API key from SBMTD (create an account on BusTracker and request one) or similar agency
- API PATH for SBMTD or other agency

What it does:
- busclock.js grabs predictions for one or more stops via API as JSON, formats them, and inserts then into the page
  - dictionary defines text replacement
  - STOPS defines default stop ids to display
  - PRESETS defines sets of stops that can be passed as a parameter like "busclock.html?preset=cremona"
- busclock.html is where formatted predictions are displayed
- busclock.css defines basic styling and colors for routes
- API requests and responses are proxied to get around browser cross domain restrictions
