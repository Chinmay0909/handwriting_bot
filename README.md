# 🎨 Handwriting Font Creator & AI Assignment Helper

A comprehensive web application that converts your handwriting into a professional custom font and helps generate assignments in your handwriting style using AI.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen)
![React](https://img.shields.io/badge/react-18.2.0-blue)

## ✨ Features

### 🖋️ Font Creator
- **Template Generation**: Download a customizable template grid
- **Handwriting Capture**: Fill in the template with your unique handwriting
- **AI Processing**: Automatic character extraction and vectorization using Potrace
- **Font Generation**: Create professional TTF fonts using FontForge
- **Character Preview**: View all extracted characters before downloading

### 📝 Font Printer
- **Font Preview**: Test your custom font with any text
- **Document Upload**: Support for .txt, .md files
- **Notebook View**: Preview text on realistic lined paper
- **Export Options**: Download your text files

### 📚 AI Assignment Helper
- **AI-Powered Content**: Generate assignment content using OpenRouter's free models
- **Custom Font Display**: View generated content in your handwriting font
- **Smart Fallback**: Automatically tries multiple AI models for reliability
- **Export Options**: Download as Word document or PDF
- **Real-time Preview**: See content as it's generated

## 🚀 Tech Stack

### Frontend
- React 18
- Vite
- TailwindCSS 4
- Lucide React Icons

### Backend
- Node.js & Express
- Sharp (Image Processing)
- Potrace (Vectorization)
- FontForge (Font Generation)
- Multer (File Upload)
- OpenRouter API (AI Integration)

## 📦 Installation

### Prerequisites
- Node.js >= 16.0.0
- FontForge (for font generation)
- Python 3 (for FontForge scripts)

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/cgfont.git
cd cgfont
```

### 2. Install FontForge

**Windows:**
```bash
# Download and install from https://fontforge.org/en-US/downloads/
```

**Mac:**
```bash
brew install fontforge
```

**Linux:**
```bash
sudo apt-get install fontforge python3-fontforge
```

### 3. Backend Setup
```bash
cd backend
npm install

# Create .env file
cp .env.example .env
```

Edit `.env` and add your OpenRouter API key:
```
OPENROUTER_API_KEY=sk-or-v1-your-api-key-here
```

Get a free API key at [OpenRouter.ai](https://openrouter.ai/)

### 4. Frontend Setup
```bash
cd ../frontend
npm install
```

## 🎯 Usage

### Start the Backend Server
```bash
cd backend
npm start
```
Server runs on `http://localhost:3001`

### Start the Frontend
```bash
cd frontend
npm run dev
```
App runs on `http://localhost:5173`

## 📖 How It Works

### Creating a Custom Font

1. **Download Template**: Get the character grid template
2. **Fill Template**: Write each character clearly in its cell
3. **Upload**: Scan/photograph and upload the completed template
4. **Process**: AI extracts and vectorizes each character
5. **Download**: Get your custom TTF font file

### Using AI Assignment Helper

1. **Upload Font**: Add your custom .ttf font file
2. **Enter Prompt**: Describe your assignment requirements
3. **Generate**: AI creates content using free models with automatic fallback
4. **Preview**: View content in your handwriting font
5. **Export**: Download as Word or PDF

## 🤖 AI Models

The system automatically tries multiple free models:
- Qwen 2 7B (Primary)
- Meta Llama 3.2 3B (Fallback)
- Microsoft Phi-3 Mini (Fallback)
- Google Gemma 2 9B (Fallback)

If one model is rate-limited, it automatically switches to the next available model.

## 🛠️ Configuration

### Changing AI Models
Edit `backend/server.js` line 522-528 to customize the model list:
```javascript
const freeModels = [
  'your-preferred-model:free',
  'fallback-model:free'
];
```

### Frontend Configuration
Edit `frontend/vite.config.js` for build settings and API proxy configuration.

## 📂 Project Structure

```
cgfont/
├── backend/
│   ├── server.js          # Express server
│   ├── uploads/           # Temporary uploads (gitignored)
│   ├── downloads/         # Generated fonts (gitignored)
│   └── temp/              # Processing files (gitignored)
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── HandwritingFontCreator.jsx
│   │   │   ├── FontPrinter.jsx
│   │   │   └── AssignmentHelper.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
└── README.md
```

## 🔒 Security Notes

- Never commit your `.env` file
- Keep your OpenRouter API key private
- The API key is only used on the backend (not exposed to frontend)
- All uploaded files are processed locally

## 🐛 Troubleshooting

### Font Generation Issues
- Ensure FontForge is installed and in your PATH
- Check that Python 3 is available
- Verify uploaded image is clear and high contrast

### AI Generation Errors
- Check your OpenRouter API key in `.env`
- Restart backend server after changing `.env`
- Check backend console for detailed error messages
- Free models may have rate limits - system will try alternatives

### Common Errors

**"OpenRouter API key not configured"**
- Create `.env` file in backend directory
- Add your API key
- Restart backend server

**"All models failed"**
- Free models are temporarily rate-limited
- Wait a few minutes and try again
- Consider adding credits to your OpenRouter account

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [FontForge](https://fontforge.org/) - Font editing software
- [Potrace](http://potrace.sourceforge.net/) - Bitmap tracing
- [OpenRouter](https://openrouter.ai/) - AI model API
- [TailwindCSS](https://tailwindcss.com/) - Styling
- [React](https://react.dev/) - UI Framework

## 📞 Support

For issues, questions, or suggestions, please open an issue on GitHub.

---

Made with ❤️ by [Your Name]
