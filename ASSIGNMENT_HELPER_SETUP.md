# Assignment Helper Setup Guide

## Overview
The Assignment Helper feature allows students to generate assignment content using AI (via OpenRouter) and display it in their custom handwriting font. Students can then export the content to Word or PDF format.

## Setup Instructions

### 1. Get OpenRouter API Key

1. Visit [OpenRouter.ai](https://openrouter.ai/)
2. Sign up for an account
3. Go to your API Keys section
4. Create a new API key
5. Copy the API key (it will look like `sk-or-v1-...`)

### 2. Configure Backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a `.env` file (copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```

   Or on Windows:
   ```bash
   copy .env.example .env
   ```

3. Open the `.env` file and add your OpenRouter API key:
   ```
   OPENROUTER_API_KEY=sk-or-v1-your-actual-api-key-here
   ```

### 3. Start the Backend Server

Make sure the backend server is running:
```bash
cd backend
npm start
```

The server should start on `http://localhost:3001`

### 4. Start the Frontend

In a separate terminal, start the frontend:
```bash
cd frontend
npm run dev
```

The frontend should start on `http://localhost:5173`

## How to Use the Assignment Helper

### Step 1: Create Your Font
1. Go to the **Font Creator** tab
2. Download the template
3. Fill in your handwriting
4. Upload and generate your font
5. Download the `.ttf` font file

### Step 2: Use Assignment Helper
1. Click on the **📚 Assignment Helper** tab
2. Upload your `.ttf` font file
3. Enter your assignment prompt (e.g., "Write a 500-word essay on climate change")
4. Click **Generate Content**
5. Wait for the AI to generate the content
6. The content will appear in your handwriting font

### Step 3: Export Your Assignment
- Click **Word** to download as a Word document (.doc)
- Click **PDF** to download as a PDF (uses browser print)

## Features

- **AI-Powered Content**: Uses OpenRouter's free Llama 3.1 model
- **Custom Font Display**: Shows generated content in your handwriting
- **Multiple Export Options**: Export to Word or PDF
- **Real-time Preview**: See the content as it's being generated

## API Model Used

The backend **automatically tries multiple free models** until one works! It tries them in this order:

1. `qwen/qwen-2-7b-instruct:free` - Alibaba Qwen 2 7B (primary)
2. `meta-llama/llama-3.2-3b-instruct:free` - Meta Llama 3.2 3B (fallback)
3. `microsoft/phi-3-mini-128k-instruct:free` - Microsoft Phi-3 Mini (fallback)
4. `google/gemma-2-9b-it:free` - Google Gemma 2 9B (fallback)

This **automatic fallback system** ensures that even if one model is rate-limited or unavailable, the system will automatically try the next one. You'll see which model was used in the backend console logs.

You can customize the model list in `backend/server.js` line 523-528.

**Note:** Free models may have rate limits. If all models fail, wait a few minutes and try again, or add your own API key with credits to OpenRouter.

## Troubleshooting

### "OpenRouter API key not configured" Error
- Make sure you created the `.env` file in the backend directory
- Check that the API key is properly set
- Restart the backend server after adding the `.env` file

### Font Not Loading
- Make sure you uploaded a valid `.ttf` font file
- Check the browser console for any font loading errors

### Content Not Generating
- Check that the backend server is running
- Verify your OpenRouter API key is valid
- Check the backend console for error messages

### Export Issues
- **Word Export**: Downloads as HTML that Word can open
- **PDF Export**: Uses browser print dialog - make sure to allow pop-ups

## Cost Information

The OpenRouter integration uses **free models** by default, so there's no cost. However:
- Free models may have rate limits
- You can upgrade to paid models for better quality/speed
- Check [OpenRouter Pricing](https://openrouter.ai/docs#pricing) for details

## Security Notes

- **Never commit your `.env` file** to version control
- The `.env` file is already in `.gitignore`
- Keep your API key private
- The API key is only used on the backend server (not exposed to frontend)

## File Structure

```
cgfont/
├── backend/
│   ├── server.js          # Backend with OpenRouter API integration
│   ├── .env               # Your API key (DO NOT COMMIT)
│   └── .env.example       # Template for API key
└── frontend/
    └── src/
        └── components/
            └── AssignmentHelper.jsx  # Assignment Helper component
```

## Next Steps

Want to customize the feature? You can:
- Modify the AI system prompt in `backend/server.js` (line 536)
- Change the model to a different one (line 532)
- Adjust the font size and styling in `AssignmentHelper.jsx`
- Add more export formats
