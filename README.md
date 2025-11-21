# ✍️ Custom Handwriting Font Generator

Transform your unique handwriting into a professional TrueType font with AI-powered features!

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

---

## 🌟 Features

### 🎨 Font Creator
- Download customizable handwriting template
- Upload filled template (scan/photo)
- Automatic character extraction and cleaning
- Professional TTF font generation with FontForge
- Preview all characters before download

### 📝 Font Printer
- Upload your custom font
- Type or paste text
- Preview on notebook paper with custom font
- Download formatted text

### 🤖 AI Assignment Helper
- Generate content with AI (OpenRouter)
- Display in your handwriting font
- Export to Word or PDF
- Perfect for students

---

## 🚀 Quick Start

### Local Development

1. **Clone repository:**
   ```bash
   git clone https://github.com/your-username/cgfont.git
   cd cgfont
   ```

2. **Install dependencies:**
   ```bash
   # Backend
   cd backend
   npm install

   # Frontend
   cd ../frontend
   npm install
   ```

3. **Setup environment:**
   ```bash
   # Backend - create .env file
   cp backend/.env.example backend/.env
   # Add your OPENROUTER_API_KEY

   # Frontend - already configured for local dev
   ```

4. **Run application:**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm start

   # Terminal 2 - Frontend
   cd frontend
   npm run dev
   ```

5. **Open browser:**
   ```
   http://localhost:5173
   ```

---

## 📦 Deployment

**Backend:** Render.com (Docker with FontForge)
**Frontend:** Vercel (Optimized Vite build)

### Quick Deploy

See [QUICK_DEPLOY.md](QUICK_DEPLOY.md) for one-page guide

### Full Guide

See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for comprehensive instructions

---

## 🛠️ Tech Stack

### Frontend
- React 18
- Vite 7
- Tailwind CSS 4
- Lucide Icons

### Backend
- Node.js + Express
- FontForge + Python 3
- Sharp (image processing)
- Potrace (vectorization)
- OpenRouter API (AI)

---

## 📁 Project Structure

```
cgfont/
├── frontend/                # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── HandwritingFontCreator.jsx
│   │   │   ├── FontPrinter.jsx
│   │   │   └── AssignmentHelper.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── Dockerfile          # Docker config
│   ├── vercel.json         # Vercel settings
│   └── package.json
│
├── backend/                 # Node.js backend
│   ├── server.js           # Express server + FontForge
│   ├── Dockerfile          # Docker config
│   └── package.json
│
├── docker-compose.yml      # Local Docker testing
├── render.yaml             # Render deployment
├── DEPLOYMENT_GUIDE.md     # Full deployment guide
├── QUICK_DEPLOY.md         # Quick reference
└── README.md               # This file
```

---

## 🎯 How It Works

1. **Template Generation**
   - Creates grid with cells for each character
   - Includes labels and guide lines

2. **Character Extraction**
   - Processes uploaded image with Sharp
   - Extracts individual characters
   - Removes borders and noise
   - Detects character bounds

3. **Vectorization**
   - Converts bitmap to SVG with Potrace
   - Optimizes curves for smooth rendering

4. **Font Creation**
   - Generates TTF with FontForge Python API
   - Auto-scales and positions glyphs
   - Optimizes spacing for natural handwriting
   - Exports professional font file

---

## ⚙️ Configuration

### Spacing Customization

Edit `backend/server.js` lines 348-370:

```python
# Letter spacing (tighter = smaller number)
glyph.width = int(char_width * 1.005)  # 0.5% padding

# Word spacing (larger = more space)
if char == ' ':
    glyph.width = 800

# Side bearings (0 = touching)
side_bearing = 0
```

### Character Set

Modify `backend/server.js` lines 40-47 to add/remove characters.

---

## 🔧 Troubleshooting

### FontForge Errors
**Issue:** Font generation fails
**Solution:** Check Docker is running, ensure sufficient memory

### Character Quality
**Issue:** Characters have borders or artifacts
**Solution:** Increase template padding, use high-res scan (300 DPI+)

### Spacing Issues
**Issue:** Letters too far/close
**Solution:** Adjust multipliers in server.js (see Configuration)

### API Errors
**Issue:** OpenRouter API fails
**Solution:** Check API key, verify rate limits

---

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create feature branch
3. Commit your changes
4. Push to branch
5. Open pull request

---

## 📝 License

MIT License - see LICENSE file for details

---

## 🙏 Acknowledgments

- **FontForge** - Font creation engine
- **OpenRouter** - AI API platform
- **Potrace** - Bitmap tracing
- **Sharp** - Image processing

---

## 📞 Support

- **Issues:** [GitHub Issues](https://github.com/your-username/cgfont/issues)
- **Discussions:** [GitHub Discussions](https://github.com/your-username/cgfont/discussions)

---

**Made with ❤️ for handwriting enthusiasts**
