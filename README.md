# PGR Player Card Widget

A dynamic, glassmorphism-styled profile card widget for Punishing: Gray Raven players.

## Features
* **Dynamic Data:** Fetches real-time player stats, avatar, frame, and signature.
* **Custom UID:** Add `?server=SERVER_CODE&uid=YOUR_UID` to the URL to generate a card for any public player.
* **Glassmorphism UI:** Modern, lightweight, and responsive design.

## How to Use
Just visit the live demo and append your UID:
https://pgr-widget.pages.dev/?server=SERVER_CODE&uid=YOUR_UID <br>
To embed just the widget into your website, use `https://pgr-widget.pages.dev/?server=SERVER_CODE&uid=YOUR_UID&embed=true`

> **SERVER_CODE**:
ap (asia-pacific), na (north-america), eu (europe), cn (china), tw (taiwan), kr (korea), jp (japan)

## Local Development
1. Clone this repository.
2. Run `npm install`.
3. Run `npm run pages:dev` to start both the Vite frontend and Cloudflare worker locally.

## Disclaimer & Credits
* All character images, frames, and assets belong to **Kuro Games**.
* Player data is sourced and proxied from the amazing community tool **[Huaxu.app](https://huaxu.app)**.
* This is a non-commercial, open-source fan project created for learning. I do not claim ownership of any game assets or the API.