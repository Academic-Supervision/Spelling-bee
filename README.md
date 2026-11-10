# 🏆 Spelling Bee Championship 2026 - Stage Presentation System

An interactive, broadcast-quality web application designed for the **Spelling Bee Competition**.

---

## 🚀 How to Launch the Application

### Option 1: One-Click Quick Launch (Recommended)
Double-click **`Launch_Spelling_Bee.bat`**.
* Automatically starts the local server.
* Activates hardware-accelerated 60FPS WebGL green screen chroma-keying.
* Opens your default web browser directly to the dashboard.

### Option 2: Direct Browser Launch
Double-click **`index.html`** in your file explorer.
* Works directly without requiring any background processes.
* Automatically uses high-precision CSS frame compositing.

---

## ✨ Features & Functionality

1. **Official Live Competition Mode & Round Tracking**:
   * **Start Competition (`▶ Start Live Competition`)**: Activates official competition mode with persistent state (`localStorage`), tracking rounds and winners automatically.
   * **Automatic Winner Recording**: Triggering `WINNER` on stage or clicking the star icon (★) on any speller card instantly records the contestant as a qualified winner for the current round.
   * **Visual Qualification Marks**: Qualified spellers feature an emerald glowing border, a golden star, and an animated `⭐ QUALIFIED` badge on their photo.
   * **Advance Round (`➕ Add Round`)**: Automatically filters the contestants and advances to the next round with **ONLY the qualified winners from the current round**.
   * **Rounds Complete & Grand Award Ceremony (`🏆 Rounds Complete`)**: Concludes the competition and opens the **Grand Ceremony Stage / Hall of Champions** featuring regal portraits, crowns, golden baroque frames, celebratory fanfare, and confetti showers.
   * **Safe Reset (`🔄 Reset`)**: Resets all competition progress and restores the full 68-contestant roster with a secure bilingual confirmation dialog.

2. **Alphabetical & Grade Grouping**:
   * All **68 contestants** are organized by Grade (Grades 1 through 6).
   * Contestants within each grade are sorted **alphabetically from A to Z**.
   * Includes both English and Arabic names where applicable.

2. **Championship Dashboard**:
   * Real-time search bar (search by contestant name, Arabic name, class, or grade).
   * Grade filter tabs: *All Spellers (68)*, *Grade 1 (6)*, *Grade 2 (8)*, *Grade 3 (7)*, *Grade 4 (12)*, *Grade 5 (21)*, *Grade 6 (14)*.
   * High-definition portrait thumbnails, rank tags, and grade badges.

3. **Contestant Stage & Green Screen Replacement**:
   * Clicking any contestant's card launches them onto the **Grand Stage**.
   * The **`frame video.mp4`** plays continuously in the background (vintage microphone, animated gold letters, navy honeycomb background, ambient lighting).
   * The contestant's photo dynamically **replaces the green area** inside the ornate baroque gold frame with despill and anti-aliased edge feathering.

4. **"WINNER" Celebration Effect**:
   * Located right beside the stage video on the control panel: `🏆 WINNER`.
   * When clicked:
     * Plays **`winner effect.mp4`** on top of the frame video using screen blending (golden confetti, exploding stars, ribbons).
     * Plays triumphant fanfare celebration audio.
     * Reveals the glowing golden **WINNER / CHAMPION** celebration banner.
     * Triggers a live confetti particle shower across the stage viewport.

5. **"END" Return Button**:
   * Located directly beneath the Winner button: `⏹ END`.
   * When clicked:
     * Instantly stops and clears the winner effect video.
     * Resets celebration banners and confetti.
     * Pauses the frame video and stops audio.
     * Smoothly returns to the main dashboard.

6. **Live Stage Controls & Keyboard Shortcuts**:
   * `W` : Trigger Winner celebration effect.
   * `Esc` or `E` : End stage session & return cleanly to dashboard.
   * `◄` / `►` : Switch immediately to Previous / Next contestant on stage.
   * `F` : Toggle Fullscreen (ideal for auditoriums and stage projectors).
   * `M` : Toggle Sound (Mute / Unmute).

---

## 📁 File Structure

* `index.html` — Main championship dashboard and stage application.
* `styles.css` — Championship styling, gold gradients, glassmorphism, responsive 16:9 stage layout.
* `app.js` — WebGL chroma-key shader engine, winner effect controller, sound, confetti, and navigation.
* `students_data.js` / `students_data.json` — Catalog of all 68 contestants sorted alphabetically within Grades 1–6.
* `server.py` — Python streaming server for WebGL GPU acceleration.
* `Launch_Spelling_Bee.bat` — One-click Windows desktop launcher.
* `background.mp4` — Animated starfield background video for the main dashboard.
* `frame video.mp4` — Master stage background video with green screen frame (muted during speller presentation).
* `winner effect.mp4` — Master winner celebration video with audio fanfare.
