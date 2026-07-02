# Interactive 3D Personal Portfolio Website

A stunning, responsive, and highly interactive 3D personal portfolio website built with modern frontend technologies and smooth scroll-linked WebGL animations.

Live URL: [https://pratik-shekhar45.github.io/portfolio/](https://pratik-shekhar45.github.io/portfolio/)

---

## 🚀 Key Features

*   **Interactive 3D WebGL Background**: A floating, undulating particle wave field built in **Three.js** that reacts to cursor movements (parallax tilting and movement interpolation).
*   **3D Card Tilt Effect**: Smooth 3D perspective rotation on hover for skills cards and project cards, reacting to cursor coordinates.
*   **Scroll-Driven Animations**: Integrated **GSAP (GreenSock)** and **ScrollTrigger** to orchestrate smooth, elegant entry transitions for sections and synchronize page scroll depth with Three.js camera movement.
*   **Fully Responsive Layout**: Built with a custom vanilla CSS grid and flexbox token design, supporting desktop, tablet, and mobile screens.
*   **Modern Theme**: A deep slate charcoal background (`#16181e`) accented with a vibrant amber (`#ffb320`) color palette.

---

## 🛠️ Tech Stack & Resources

*   **Core**: HTML5, Vanilla CSS, JavaScript (ES6+)
*   **3D Graphics**: [Three.js](https://threejs.org/) (via CDN)
*   **Animations**: [GSAP (GreenSock)](https://greensock.com/) & [ScrollTrigger](https://greensock.com/scrolltrigger/) (via CDN)
*   **Icons**: [FontAwesome v6](https://fontawesome.com/) (via CDN)
*   **Typography**: [Outfit](https://fonts.google.com/specimen/Outfit) & [Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans) (Google Fonts)

---

## 📂 Project Structure

```text
├── index.html          # Semantic page structure & CDN links
├── style.css           # Custom variables, animations, and responsive grids
├── script.js           # Three.js canvas loop, tilt calculations, and GSAP scroll timelines
├── pratik_shekhar.jpg  # Optimized custom profile portrait
├── resume pratik.pdf   # Resume file
├── start_server.ps1    # Custom PowerShell script for local deployment
└── README.md           # Project documentation
```

---

## 💻 Running the Project Locally

### 1. Direct File Access
Simply open [index.html](index.html) in your browser. *(Note: Since resources are loaded from CDNs, some browsers may restrict canvas image rendering or scripting under the `file://` protocol due to CORS policies. Using a local server is recommended).*

### 2. Run via Local Server

#### Windows PowerShell (Included)
Right-click on [start_server.ps1](start_server.ps1) and choose **Run with PowerShell** (or run `powershell -ExecutionPolicy Bypass -File start_server.ps1` in your console). Then visit:
👉 `http://localhost:8000/`

#### Python
Run the built-in HTTP server command in the root folder:
```bash
python -m http.server 8000
```
Then visit `http://localhost:8000/`.
