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
