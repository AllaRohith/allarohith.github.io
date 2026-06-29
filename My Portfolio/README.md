# Rohith Naidu Alla - Portfolio

A high-end 3D portfolio website with scroll animations, built with Three.js and GSAP.

🔗 **Live Site:** https://allarohith.github.io

## ✨ Features

- 🌐 **3D WebGL Background** - Interactive particles and floating geometric shapes
- 🎭 **Scroll Animations** - Smooth reveal effects powered by GSAP ScrollTrigger
- 🖱️ **Mouse Parallax** - Subtle camera movement following mouse
- 📱 **Fully Responsive** - Works on all devices
- ⚡ **Lightweight & Fast** - No heavy frameworks
- 🎨 **Modern Design** - Dark theme with gradient accents

## 🚀 Deploy to GitHub Pages

### Option 1: Quick Deploy

1. Create a new repo on GitHub named: `allarohith.github.io`
2. Push these files to the `main` branch:
   ```bash
   git init
   git add .
   git commit -m "Initial portfolio commit"
   git branch -M main
   git remote add origin https://github.com/allarohith/allarohith.github.io.git
   git push -u origin main
   ```
3. Go to **Settings → Pages → Source** and select `main` branch
4. Your site will be live at `https://allarohith.github.io`

### Option 2: Custom Domain (rohithnaidualla.info)

1. Push to GitHub Pages first (above)
2. Go to your domain registrar (where you bought rohithnaidualla.info)
3. Add these DNS records:
   - **A Record:** `185.199.108.153` (points to GitHub)
   - **A Record:** `185.199.109.153`
   - **A Record:** `185.199.110.153`
   - **A Record:** `185.199.111.153`
   - **CNAME:** `allarohith.github.io` (for www subdomain)
4. In GitHub repo Settings → Pages → Custom domain: `rohithnaidualla.info`
5. Enable **HTTPS** after DNS propagates

## 📁 Project Structure

```
├── index.html      # Main HTML
├── styles.css      # All styling
├── app.js          # Three.js + GSAP animations
└── README.md       # This file
```

## 🎨 Customization

### Update Personal Info

Edit these files to personalize:

- **Name/Bio:** `index.html` - Search for "Rohith Naidu Alla"
- **Projects:** Update the project cards in `index.html`
- **Skills:** Update the skills section in `index.html`
- **Contact:** Update email/links in `index.html`

### Change Colors

In `styles.css`, modify the CSS variables at the top:

```css
:root {
    --primary: #6366f1;      /* Main accent color */
    --secondary: #0ea5e9;    /* Secondary color */
    --accent: #f59e0b;       /* Highlight color */
    --dark: #0f0f0f;        /* Background */
}
```

## 🛠️ Tech Stack

- **Three.js** - 3D WebGL rendering
- **GSAP** - High-performance animations
- **GSAP ScrollTrigger** - Scroll-based animations
- **Google Fonts** - Inter & Space Grotesk

## 📈 Performance

- Lighthouse Performance: 95+
- First Contentful Paint: <1s
- Fully Interactive: <2s

---

Built with ❤️ using pure HTML, CSS, and JavaScript.
