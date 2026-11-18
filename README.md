# Wedding Planner (management site)

A mobile-first website for managing the wedding. It is for the family, not for guests.

- **Landing page:** your video plays on a loop with sound, no controls.
- **Menu (☰, top left):** slides in from the left. Right now it has one item: **Room Planner**.
- **Room Planner:** three tabs at the bottom (Front, Middle, Rear). Rooms appear as square blocks, floor by floor.
  - Green = vacant, red = full, red/green diagonal split = partly filled (fewer people than the room's maximum).
  - Pink border = bride side, blue border = groom side.
  - Tap a room to see the guest, add a guest (if vacant), change the guest, or vacate the room.
- Plain HTML, CSS and JavaScript. No build step, no framework.

## Files

| File | Purpose |
|---|---|
| `index.html` | Page structure |
| `style.css` | Floral theme and layout (colours are at the top, in `:root`) |
| `app.js` | Menu, routing, room popup, saving |
| `rooms.js` | **The list of buildings, floors and rooms. Edit this with your real rooms.** |
| `config.js` | Supabase keys (optional, see below) |
| `supabase.sql` | One-time database setup for shared mode |
| `assets/welcome.mp4` | **Your video. You must add it.** |

## Step 1. Add your video

1. Compress the video first (aim for under 20 MB; use HandBrake or any phone/online compressor, H.264 MP4, 720p is enough).
2. Save it as `assets/welcome.mp4`.

Note: phones block sound that starts on its own. If sound is blocked, a **"Tap to begin"** button appears. One tap starts the video with sound. This is a browser rule and cannot be turned off.

## Step 2. Rooms (already set from your room sheet)

`rooms.js` already holds your real rooms (maximum people per room, taken from the sheet's final totals):

- **Front:** Ground 101-105, 1st 106-110, 2nd 111-115, 3rd 116-120
- **Middle:** 2nd floor 201-208 plus **Dorm** (20 mattresses), 3rd floor 209-220. The ground-floor AC Banquet Hall is not shown.
- **Rear:** Ground 301-306, 1st 307-312

To change a room, edit its entry in `rooms.js`: `[room number, max people]`. Room numbers must be unique.

## Step 3. Choose how data is saved

### Option A: Local mode (default, no setup)
Leave `config.js` empty. Data is saved in the browser of the phone you edit on.
- Works instantly.
- **Other people will not see your changes**, and clearing browser data erases them.

### Option B: Shared mode with Supabase (recommended)
You edit, everyone else sees the same live data and cannot change it.

1. Create a free account and a new project at [supabase.com](https://supabase.com).
2. Open **SQL Editor → New query**, paste the contents of `supabase.sql`, click **Run**.
3. Open **Authentication → Users → Add user → Create new user**. Enter your own email and a strong password. Tick "Auto confirm user".
4. Open **Authentication → Sign In / Providers** (or Settings) and **turn OFF "Allow new users to sign up"**. This is important, otherwise anyone could create an account and edit.
5. Open **Project Settings → API**. Copy the **Project URL** and the **anon public key**.
6. Paste them into `config.js`:
   ```js
   window.APP_CONFIG = { SUPABASE_URL: "https://xxxx.supabase.co", SUPABASE_ANON_KEY: "eyJ..." };
   ```
   The anon key is meant to be public. The database rules (row level security) let everyone read but only your logged-in user write.
7. Open the site, go to Room Planner, tap the 🔒 icon (top right), sign in with the email and password from step 3. The icon changes to 🔓 and you can edit. Others who do not sign in can only view.

Free Supabase projects pause after about a week of no activity. Open the site once a week, or click "Restore" in the Supabase dashboard.

## Step 4. Test on your computer

Double-click `index.html`, or for a better test run in this folder: `python3 -m http.server 8000` and open `http://localhost:8000`. Use your browser's mobile view (F12, then the phone icon).

## Step 5. Put it on GitHub

1. Create a new repository on github.com (for example `wedding-planner`). Choose **Private** if you prefer.
2. In this folder run:
   ```bash
   git init
   git add .
   git commit -m "Wedding planner site"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/wedding-planner.git
   git push -u origin main
   ```
   (Or use "Upload files" on the GitHub page and drag everything in.)
3. GitHub rejects single files over 100 MB, so keep the video small.

## Step 6. Host on Netlify

1. Sign in at [netlify.com](https://netlify.com) with your GitHub account.
2. **Add new site → Import an existing project → GitHub** and select the repository.
3. Build command: **leave empty**. Publish directory: **leave empty** (or `.`). Click **Deploy**.
4. In **Site configuration → Change site name**, pick a short name, e.g. `sisters-wedding.netlify.app`.
5. Every `git push` to `main` redeploys automatically in about a minute.
6. Share the link with family and add it to their phone home screen (browser menu → "Add to Home screen").

## Using the planner

- **Add a guest:** tap a green room, enter name(s) and number of people, pick Bride or Groom side, Save. The name box has no limit and takes a list: write one name or family per line if several share a room (the block shows the first name and "+2" for the rest).
- **Partly filled:** if the people count is lower than the room maximum, the block is split red/green. At or above the maximum it is solid red.
- **Change a guest:** tap a red room, edit, Save.
- **Vacate:** tap a red room, then Vacate.
- A warning appears if the people count is more than the room's maximum.
- In shared mode, other phones refresh every 30 seconds and whenever they reopen the page.

## Backup (Local mode)

Data lives in the browser's localStorage (key `roomPlannerData`). To copy it, open the browser console on the site and run `copy(localStorage.roomPlannerData)`. Supabase mode keeps data in the cloud, so no backup is needed.

## Customising

- Colours: top of `style.css` (`--vacant`, `--booked`, `--bride`, `--groom`, `--rose`, `--gold`).
- To make **occupied rooms green** instead of red, swap the `--vacant` and `--booked` colour values.
- Adding a new page later: add a `<section id="newpage" class="page" hidden>` in `index.html`, a link in the drawer (`<a href="#newpage" data-close>`), and handle the hash in `route()` in `app.js`.

## Troubleshooting

| Problem | Fix |
|---|---|
| Video does not play | Check the file is exactly `assets/welcome.mp4` and is H.264 MP4 |
| No sound | Tap "Tap to begin". Also check the phone is not on silent |
| Rooms not saving in shared mode | Make sure you signed in (🔓), and that `supabase.sql` was run |
| "Could not load data" | Check the URL and anon key in `config.js` |
| Changes not showing after deploy | Hard refresh, or wait a minute for Netlify |
