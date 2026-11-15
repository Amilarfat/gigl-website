# GIGL International School — website

Official website for **GIGL International School**, Maharajganj Pokhar, Imambari, Laheriasarai,
Darbhanga – 846001, Bihar. Nursery to Class 6th, CBSE pattern.

Built as a **static site** — no server, no database, no build step. It runs by double-clicking
`index.html` and it is ready for **GitHub Pages**.

---

## 1. What is in the box

| File | What it is |
|---|---|
| `index.html` | Home page — hero, pillars, about, leadership, academics, facilities, gallery preview, admission wizard, notice board, contact |
| `gallery.html` | All 83 photos with filters and a full-screen lightbox |
| `notices.html` | Every notice, with category filters and search |
| `admin.html` | Notice manager (passcode) — add / edit / delete notices |
| `contact.html` | Address, three phone numbers, map, WhatsApp enquiry form |
| `thankyou.html` | Confirmation page after a form submit |
| `404.html` | Friendly "page not found" page |
| `css/style.css` | The whole design system — colours, type, layout, responsive rules |
| `js/main.js` | Navigation, scroll reveals, counters, gallery, lightbox, tabs, forms |
| `js/three-hero.js` | The 3D hero (Three.js) with graceful fallback |
| `js/notices.js` | Notice engine — reads `data/notices.json` |
| `js/admin.js` | Notice manager logic |
| `js/wizard.js` | 5-step admission enquiry + printable acknowledgement slip |
| `data/notices.json` | **The only file you edit to publish a notice** |
| `data/school.json` | Reference sheet of school details (phones, email, leaders) |
| `assets/images/gigl/` | Logo, hero photo, 83 gallery photos |
| `assets/docs/` | `GIGL_International_School_Admission_Form.pdf` |

---

## 2. Host it on GitHub Pages (15 minutes, free)

You need a GitHub account. Create one at <https://github.com/signup>.

### 2.1 Create the repository

1. Sign in → click **+** (top right) → **New repository**.
2. Name: `gigl-website` (or any name).
3. Visibility: **Public** (required for free Pages).
4. Do **not** tick "Add a README". Click **Create repository**.

### 2.2 Upload the files

**Easy way (browser):**

1. On the empty repo page click **uploading an existing file**.
2. Drag the **contents** of this folder into the browser window — `index.html`, `css`, `js`,
   `data`, `assets`, and the rest. Keep folders as folders.
3. Write a message ("GIGL school website") → **Commit changes**.

**Git way (terminal):**

```bash
cd gigl-website
git init
git add .
git commit -m "GIGL International School website"
git branch -M main
git remote add origin https://github.com/USERNAME/gigl-website.git
git push -u origin main
```

### 2.3 Turn on Pages

1. Repo → **Settings** → **Pages**.
2. Source: **Deploy from a branch**.
3. Branch: **main**, folder: **/ (root)** → **Save**.
4. Wait 1–2 minutes. Your site is live at:

```
https://USERNAME.github.io/gigl-website/
```

### 2.4 After the first deploy

- Open the live link, check the home page, gallery, notices and the admission wizard on a phone.
- Replace the placeholder URL in `sitemap.xml` and in `data/school.json` (`siteUrl`).
- Optional: **Settings → Pages → Custom domain** if you buy `giglschool.in` later.

---

## 3. Publish a notice (the everyday job)

### Method A — from a phone, 60 seconds (recommended)

1. Open the repo → `data` folder → `notices.json`.
2. Tap the **pencil** icon.
3. Paste a new block at the top of the list (inside the `[ ]` brackets):

```json
{
  "id": "N-2026-007",
  "title": "Parent-Teacher Meeting on 22 November",
  "body": "Parents are requested to meet the class teacher between 9:00 AM and 12:30 PM.",
  "date": "2026-11-15",
  "category": "Event",
  "pinned": false,
  "active": true,
  "link": ""
},
```

4. **Commit changes**. The notice appears in the ticker, on the home page and on `notices.html`.

Rules: `pinned: true` keeps it at the top. `active: false` hides it without deleting.
Valid categories: `Admission`, `Exam`, `Event`, `Holiday`, `General`.

> Check your JSON at <https://jsonlint.com> if the page looks empty — one missing comma breaks the file.

### Method B — with the notice manager

1. Open `.../admin.html` on the live site.
2. Passcode: **GIGL2026** (change it in `js/admin.js`, line with `PASSCODE`).
3. Add the notice → **Download notices.json**.
4. In GitHub, open `data/notices.json` → pencil → select all → paste → Commit.

### Method C — one-click publish (optional, advanced)

In `admin.html`, fill **Repository** (`USERNAME/gigl-website`) and a **fine-grained GitHub token**
with *Contents: Read and write* on that one repo, then press **Publish to GitHub**.
The token is stored in your browser only — never put it in the code, never share it.

> GitHub's CDN keeps a page for about 10 minutes. If a new notice does not show, press
> **Ctrl + F5**, or wait a few minutes.

---

## 4. Change the content

| What | Where |
|---|---|
| Phone numbers, email, social links | Topbar + footer of `index.html`, `contact.html`, `gallery.html`, `notices.html` — search for `8434459262` |
| School name / tagline | Search for `GIGL International School` and `Shaping Minds` |
| Leader names, titles, quotes | `index.html` → section `id="leadership"` (and the prospectus modal) |
| Logo | Replace `assets/images/gigl/logo.jpeg` (square, at least 400×400) |
| Hero photo | Replace `assets/images/gigl/hero.jpeg` |
| Photos in the gallery | Replace files in `assets/images/gigl/gallery/` (keep names `photo-01.jpeg` … `photo-83.jpeg`) |
| Number of gallery photos | `gallery.html` → `var total = 83;` and the category ranges below it |
| Colours | `css/style.css` → `:root` ( `--navy-900`, `--gold`, … ) |
| Fees / dates / results | Add them as notices instead of editing HTML |

### Leader photos

The three director cards currently show gold initials (MA · EH · EI). To use real photos:

1. Put the photos in `assets/images/gigl/leaders/` as `afzal.jpg`, `hasan.jpg`, `iftekhar.jpg`.
2. In `index.html`, replace
   `<div class="leader__ph leader__ph--ini"><span>MA</span></div>`
   with
   `<div class="leader__ph"><img src="assets/images/gigl/leaders/afzal.jpg" alt="Mohammad Afzal Sir" loading="lazy"></div>`
   and repeat for the other two.

---

## 5. Forms without a server

- The enquiry forms open **WhatsApp** with the message already written — no backend needed.
- The admission wizard builds an **acknowledgement slip** in the browser and can print it
  (`window.print()`), plus a WhatsApp copy.
- Optional email copy: `js/wizard.js` posts to FormSubmit. The first time, FormSubmit sends a
  confirmation link to `giglschool2026@gmail.com` — click it once and email copies start arriving.

---

## 6. Local preview

```bash
cd gigl-website
python -m http.server 8080
```

Then open <http://localhost:8080>. (Opening `index.html` directly also works, but the browser
blocks `data/notices.json`, so the site falls back to three built-in notices.)

---

## 7. Security note

`admin.html`'s passcode and the optional GitHub token are **convenience locks, not security**.
The site is public. Never commit a token, password or private key into this repository.
