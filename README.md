# Rohith Naidu Alla — Creative Portfolio

A **high-end creative portfolio** with stunning visual effects, 3D interactions, and smooth animations.

🔗 **Live Site:** https://allarohith.github.io

---

## ✨ Features

### Visual Effects
- 🎨 **Particle System** — Interactive particles that react to mouse movement
- 🌊 **Magnetic Field Lines** — Animated background visualization
- 📐 **3D Card Tilt** — Work cards that tilt toward your cursor
- 🧲 **Magnetic Buttons** — Buttons that magnetically follow your cursor
- 🖱️ **Custom Cursor** — Smooth dual-tone cursor with follower
- 📜 **Smooth Scroll** — buttery smooth scrolling with GSAP
- 🔄 **Skill Bars** — Animated progress bars on scroll
- 🔢 **Counter Animation** — Numbers that count up on scroll
- 📰 **Marquee** — Infinite scrolling text banner

### Design
- 🌙 **Dark Theme** — Modern dark design with gradient accents
- 🎭 **Syne + Space Grotesk** — Premium typography
- 📱 **Fully Responsive** — Works perfectly on all devices
- ✨ **Noise Overlay** — Subtle texture for depth
- 💫 **Gradient Effects** — Purple/Blue gradient theme

### Sections
- 🏠 **Hero** — Eye-catching intro with animated shapes
- 👤 **About** — Profile with stats and social links
- 💼 **Work** — Project showcase with hover effects
- 🛠️ **Skills** — Animated skill bars with marquee
- 📧 **Contact** — Multiple contact options
- 🦶 **Footer** — Clean footer

---

## 🚀 Deploy to GitHub Pages

### Option 1: Quick Deploy

```bash
cd ~/Desktop/My\ Portfolio
git init
git add .
git commit -m "Creative portfolio"
git branch -M main
git remote add origin https://github.com/allarohith/allarohith.github.io.git
git push -u origin main
```

Then enable GitHub Pages:
→ **Settings → Pages → Source: main branch**

### Option 2: Custom Domain (rohithnaidualla.info)

1. Deploy to GitHub Pages first
2. Add DNS records at your registrar:
   - **A Records:** `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - **CNAME:** `allarohith.github.io`
3. In GitHub Settings → Pages → Custom domain: `rohithnaidualla.info`
4. Enable HTTPS

---

## 📁 Project Structure

```
├── index.html     # Main HTML with all sections
├── styles.css     # Complete styling
├── app.js         # All interactions & animations
└── README.md      # Documentation
```

---

## 🛠️ Tech Stack

- **GSAP** — Animations & ScrollTrigger
- **Canvas API** — Particle system & field lines
- **CSS Variables** — Theming system
- **Google Fonts** — Syne & Space Grotesk

---

## 🎨 Customize

### Update Info

Find and replace in `index.html`:
- Name: "Rohith Naidu Alla"
- Email: "allarohithnaidu@gmail.com"
- GitHub: "allarohith"
- Project details
- Skills & percentages

### Change Colors

In `styles.css`, modify the `:root` section:

```css
:root {
    --primary: #6366f1;      /* Main purple */
    --secondary: #0ea5e9;    /* Blue */
    --accent: #f59e0b;       /* Orange accent */
    --dark: #0a0a0b;         /* Background */
}
```

---

Built with ❤️ — Designed to impress.

---

## 🔒 Security

This site implements **defense-in-depth** security suitable for a public-facing portfolio:

### HTTP / Transport
- ✅ **HTTPS only** — GitHub Pages enforces HTTPS for all resources
- ✅ **HSTS-ready** — `upgrade-insecure-requests` CSP directive forces HTTPS

### Content Security
- ✅ **Content Security Policy (CSP)** — restricts scripts/styles to known origins (`self`, Google Fonts, cdnjs); blocks `frame-src`, `object-src`, unauthorized inline scripts
- ✅ **Subresource Integrity (SRI)** — SHA-384 hashes on all CDN scripts (GSAP, ScrollTrigger); browser refuses tampered content
- ✅ **`X-Content-Type-Options: nosniff`** — prevents MIME-sniffing attacks
- ✅ **`Referrer-Policy: strict-origin-when-cross-origin`** — leaks minimal referrer info to external sites
- ✅ **`Permissions-Policy`** — disables unused browser features (camera, mic, geolocation, payment, USB, sensors)

### Phishing / Scraping Defenses
- ✅ **Email obfuscation** — contact email stored as char codes in `data-*` attributes, decoded by JavaScript on page load; HTML scrapers that grep for `user@domain` patterns won't find it
- ✅ **No forms, no auth, no backend** — no attack surface for credential theft or session hijacking

### Responsible Disclosure
- ✅ **security.txt** at `/.well-known/security.txt` (RFC 9116) — gives security researchers a clear contact for reporting vulnerabilities
- ✅ **robots.txt** — controls crawler access; hides demo/internal files from indexing

### Repository Hardening (recommendations)
- 🔐 Enable **2FA** on the GitHub account that owns this repo
- 🔐 Require **signed commits** for any future contributors
- 🔐 Enable **branch protection** on `main` — require PR reviews before merge
- 🔐 Regularly rotate the SSH key listed at https://github.com/settings/keys

### Reporting a Vulnerability

If you discover a security issue, please email **allarohithnaidu@gmail.com** or open a private advisory at https://github.com/AllaRohith/allarohith.github.io/security/advisories/new. Allow up to 90 days for remediation before public disclosure.

See `/.well-known/security.txt` for the machine-readable version.
