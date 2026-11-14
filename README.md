# Outpost Horizons: Junior Astronaut Mission Trainer

An open-world 2.5D survival and colony management web game built for the **2026 NASA Space Apps Challenge** (*Build a Junior Astronaut Mission Trainer* track).

## Core Concept
**Outpost Horizons** puts players in direct control of an outpost commander on the Moon or Mars. Combining the strategic resource trade-offs of *RimWorld* with the stylized 2.5D hand-drawn aesthetic of *Don't Starve Together*, players must keep their base operational, complete dynamic mission objectives, and freely explore a procedurally generated alien landscape.

## Key Features
* **Real Engineering Trade-offs:** Every decision carries a cost. Diverting power to electromagnetic shielding during a solar storm might freeze your greenhouse or drain life support reserves.
* **Adaptive Difficulty:**
  * **Cadet Mode (Standard):** Focuses on three core pillars—**Oxygen**, **Power**, and **Radiation Shielding**.
  * **Commander Mode (Hardcore):** Introduces deep survival mechanics including **Mental Sanity**, **Hunger**, and **Hydroponic Food Production**.
* **Dynamic Mission System:** Complete varied objectives assigned by Mission Control, from rescuing stranded crew pods and surviving crash-landed scenarios to deploying radiation sensors and mining regolith.
* **Open-World Exploration & Space Archaeology:** Wander freely across a procedural map to discover hidden historical Easter eggs (such as Apollo-era mementos and lost rovers) and potential signs of extraterrestrial life, presented with bite-sized educational lore.
* **Powered by NASA Open Data:** Space weather events and environmental hazards are driven by real solar activity data from NASA's **DONKI** (Space Weather Database) and biological insights from **OSDR**.

## Tech Stack & Architecture
* **Engine:** Phaser 3 (HTML5 / JavaScript ES6 Modules)
* **Architecture:** Strictly modular, object-oriented design following DRY principles.
* **Deployment:** Zero-install, browser-playable via GitHub Pages.

## Quick Start
1. Clone the repository.
2. Serve the root directory using any local web server (e.g., VS Code Live Server or `npx serve`).
3. Open `http://localhost:3000` in your browser.