import { useState } from 'react';
import { Send, Upload, Download, FileText, Loader2, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';

function AssignmentHelper() {
  const [prompt, setPrompt] = useState('');
  const [fontFile, setFontFile] = useState(null);
  const [generatedContent, setGeneratedContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [fontLoaded, setFontLoaded] = useState(false);

  // Handle font file upload
  const handleFontUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.name.endsWith('.ttf')) {
      setFontFile(file);
      setError('');

      // Load the font dynamically
      const reader = new FileReader();
      reader.onload = (event) => {
        const fontData = event.target.result;
        const fontFace = new FontFace('CustomHandwriting', fontData);

        fontFace.load().then((loadedFont) => {
          document.fonts.add(loadedFont);
          setFontLoaded(true);
        }).catch((err) => {
          console.error('Error loading font:', err);
          setError('Failed to load font file');
        });
      };
      reader.readAsArrayBuffer(file);
    } else {
      setError('Please upload a valid .ttf font file');
    }
  };

  // Generate content using OpenRouter API
  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    if (!fontFile) {
      setError('Please upload a font file');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:3001/api/generate-assignment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate content');
      }

      const data = await response.json();
      setGeneratedContent(data.content);
    } catch (err) {
      console.error('Error generating content:', err);
      setError('Failed to generate content. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Export to Word document
  const handleExportWord = async () => {
    if (!generatedContent) return;

    try {
      const response = await fetch('http://localhost:3001/api/export-word', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: generatedContent,
          fontName: fontFile.name.replace('.ttf', '')
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to export to Word');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'assignment.docx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error exporting to Word:', err);
      setError('Failed to export to Word');
    }
  };

  // Export to PDF
  const handleExportPDF = () => {
    if (!generatedContent) return;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Assignment</title>
          <style>
            @page {
              size: A4;
              margin: 2cm;
            }
            body {
              font-family: 'CustomHandwriting', Arial, sans-serif;
              font-size: 14pt;
              line-height: 2;
              color: #000;
              white-space: pre-wrap;
            }
          </style>
        </head>
        <body>${generatedContent}</body>
      </html>
    `);
    printWindow.document.close();

    // Wait for font to load before printing
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 py-12">
      <div className="container mx-auto px-4 md:px-8 max-w-7xl">
        {/* Header with animated gradient */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-3 bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl shadow-lg mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 bg-clip-text text-transparent mb-4">
            AI Assignment Helper
          </h1>
          <p className="text-gray-600 text-xl max-w-2xl mx-auto">
            Transform your ideas into beautiful assignments with AI-powered content generation in your unique handwriting style
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Panel - Input */}
          <div className="space-y-6">
            {/* Font Upload */}
            <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100 hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="p-3 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl mr-3">
                  <Upload className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">Upload Your Font</h3>
                  <p className="text-sm text-gray-500">Step 1: Add your custom handwriting font</p>
                </div>
              </div>
              <div className={`border-3 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${
                fontLoaded
                  ? 'border-green-400 bg-green-50'
                  : 'border-gray-300 bg-gray-50 hover:border-orange-400 hover:bg-orange-50'
              }`}>
                <input
                  type="file"
                  accept=".ttf"
                  onChange={handleFontUpload}
                  className="hidden"
                  id="font-upload"
                />
                <label
                  htmlFor="font-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  {fontLoaded ? (
                    <CheckCircle2 className="w-16 h-16 text-green-500 mb-3" />
                  ) : (
                    <div className="relative">
                      <div className="absolute inset-0 bg-orange-400 rounded-full blur-xl opacity-30 animate-pulse"></div>
                      <Upload className="relative w-16 h-16 text-orange-500 mb-3" />
                    </div>
                  )}
                  <span className="text-lg font-semibold text-gray-700 mb-1">
                    {fontFile ? fontFile.name : 'Click to upload .ttf font'}
                  </span>
                  {fontLoaded ? (
                    <span className="text-green-600 text-sm font-medium flex items-center mt-2">
                      <CheckCircle2 className="w-4 h-4 mr-1" />
                      Font loaded successfully!
                    </span>
                  ) : (
                    <span className="text-gray-500 text-sm">Drag and drop or click to browse</span>
                  )}
                </label>
              </div>
            </div>

            {/* Prompt Input */}
            <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100 hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="p-3 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl mr-3">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">Assignment Prompt</h3>
                  <p className="text-sm text-gray-500">Step 2: Describe what you need</p>
                </div>
              </div>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="E.g., Write a 500-word essay on the importance of renewable energy and its impact on climate change..."
                className="w-full h-56 px-5 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100 resize-none text-gray-700 text-base transition-all duration-300"
              />
              <button
                onClick={handleGenerate}
                disabled={isLoading || !fontFile || !prompt.trim()}
                className={`mt-6 w-full py-4 px-6 rounded-2xl font-bold text-white text-lg transition-all duration-300 transform ${
                  isLoading || !fontFile || !prompt.trim()
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-lg hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98]'
                }`}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                    Generating Amazing Content...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <Sparkles className="w-6 h-6 mr-3" />
                    Generate with AI
                  </span>
                )}
              </button>
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-5 flex items-start animate-shake">
                <AlertCircle className="w-6 h-6 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
                <p className="text-red-700 font-semibold">{error}</p>
              </div>
            )}
          </div>

          {/* Right Panel - Preview & Export */}
          <div className="space-y-6">
            {/* Preview */}
            <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100 hover:shadow-2xl transition-all duration-300 sticky top-24">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center">
                  <div className="p-2 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg mr-3">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800">Preview</h3>
                </div>
                {generatedContent && (
                  <div className="flex gap-3">
                    <button
                      onClick={handleExportWord}
                      className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all flex items-center text-sm font-bold shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Word
                    </button>
                    <button
                      onClick={handleExportPDF}
                      className="px-5 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all flex items-center text-sm font-bold shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      PDF
                    </button>
                  </div>
                )}
              </div>
              <div
                className={`min-h-[600px] max-h-[700px] overflow-y-auto border-2 rounded-2xl p-8 transition-all duration-300 ${
                  generatedContent
                    ? 'border-orange-200 bg-amber-50/30 shadow-inner'
                    : 'border-gray-200 bg-gray-50'
                }`}
                style={{
                  fontFamily: fontLoaded ? "'CustomHandwriting', Arial, sans-serif" : 'Arial, sans-serif',
                  fontSize: '17px',
                  lineHeight: '2.2',
                  whiteSpace: 'pre-wrap'
                }}
              >
                {generatedContent ? (
                  <div className="text-gray-800">{generatedContent}</div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="relative mb-4">
                      <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-amber-400 rounded-full blur-2xl opacity-20"></div>
                      <FileText className="relative w-20 h-20 text-gray-300" />
                    </div>
                    <p className="text-gray-400 text-lg font-medium mb-2">
                      Your generated content will appear here
                    </p>
                    <p className="text-gray-400 text-sm max-w-md">
                      Upload your font and enter a prompt to get started with AI-powered assignment generation
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AssignmentHelper;
