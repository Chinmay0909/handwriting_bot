import { useState, useRef, useEffect } from 'react';
import { Download, Upload, Grid, Type, CheckCircle, Loader, AlertCircle, Sparkles, FileImage, Zap } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const HandwritingFontCreator = () => {
  const [step, setStep] = useState(1);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [fontName, setFontName] = useState('MyHandwriting');
  const [previewImages, setPreviewImages] = useState({});
  const [fontUrl, setFontUrl] = useState('');
  const [error, setError] = useState('');
  const templateCanvasRef = useRef(null);

  const charSet = [
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
    'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
    'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
    'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
    '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
    '!', '?', '.', ',', ';', ':', '-', '_', '(', ')', '[', ']', ' '
  ];

  const generateTemplate = () => {
    const canvas = templateCanvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const cols = 13;
    const rows = Math.ceil(charSet.length / cols);
    const cellSize = 100;
    const labelHeight = 20; // Separate label area at top
    
    canvas.width = cols * cellSize;
    canvas.height = rows * cellSize;

    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    charSet.forEach((char, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      const x = col * cellSize;
      const y = row * cellSize;

      // Draw outer cell border
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, cellSize, cellSize);
      
      // Draw separator line between label and writing area
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, y + labelHeight);
      ctx.lineTo(x + cellSize, y + labelHeight);
      ctx.stroke();
      
      // Fill label area with light background
      ctx.fillStyle = '#f5f5f5';
      ctx.fillRect(x + 1, y + 1, cellSize - 2, labelHeight - 1);
      
      // Draw character label in the label area
      ctx.fillStyle = '#333';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(char === ' ' ? 'SPACE' : char, x + cellSize / 2, y + labelHeight / 2);
      
      // Draw guide lines in the writing area only
      const writingAreaTop = y + labelHeight;
      const writingAreaHeight = cellSize - labelHeight;
      
      ctx.strokeStyle = '#ddd';
      ctx.lineWidth = 1;
      ctx.beginPath();
      // Horizontal center line
      ctx.moveTo(x, writingAreaTop + writingAreaHeight / 2);
      ctx.lineTo(x + cellSize, writingAreaTop + writingAreaHeight / 2);
      // Vertical center line
      ctx.moveTo(x + cellSize / 2, writingAreaTop);
      ctx.lineTo(x + cellSize / 2, y + cellSize);
      // Baseline (75% down in writing area)
      ctx.moveTo(x, writingAreaTop + writingAreaHeight * 0.75);
      ctx.lineTo(x + cellSize, writingAreaTop + writingAreaHeight * 0.75);
      ctx.stroke();
      
      // Draw reference character (watermark) in writing area only
      ctx.fillStyle = '#f0f0f0';
      ctx.font = 'bold 40px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(
        char === ' ' ? '' : char, 
        x + cellSize / 2, 
        writingAreaTop + writingAreaHeight / 2
      );
      
      // Reset styles
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
    });
  };

  useEffect(() => {
    if (step === 1) {
      generateTemplate();
    }
  }, [step]);

  const downloadTemplate = () => {
    const canvas = templateCanvasRef.current;
    const link = document.createElement('a');
    link.download = 'handwriting-template.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImage(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const processAndGenerateFont = async () => {
    if (!uploadedFile) {
      setError('Please upload an image first');
      return;
    }

    setProcessing(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('image', uploadedFile);
      formData.append('fontName', fontName);

      const response = await fetch(`${API_URL}/api/process-font`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to process font');
      }

      const data = await response.json();
      
      if (data.success) {
        setPreviewImages(data.previewImages);
        setFontUrl(data.fontUrl);
        setStep(4);
      } else {
        throw new Error(data.error || 'Unknown error occurred');
      }
    } catch (err) {
      console.error('Error:', err);
      setError(err.message || 'Failed to process font. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const downloadFont = () => {
    const link = document.createElement('a');
    link.href = `${API_URL}${fontUrl}`;
    link.download = `${fontName}.ttf`;
    link.click();
  };

  const resetApp = () => {
    setStep(1);
    setUploadedImage(null);
    setUploadedFile(null);
    setPreviewImages({});
    setFontUrl('');
    setError('');
    setFontName('MyHandwriting');
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 py-12">
      <div className="container mx-auto px-4 md:px-8 max-w-7xl">
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 border border-gray-100">
          {/* Header with animated gradient */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center p-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl shadow-lg mb-4">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
              Handwriting Font Creator
            </h1>
            <p className="text-gray-600 text-xl max-w-2xl mx-auto">
              Transform your unique handwriting into a professional custom font in minutes
            </p>
          </div>

          {/* Enhanced Progress Steps */}
          <div className="flex justify-between items-center mb-12 px-4 relative">
            {[
              { num: 1, label: 'Template', icon: Grid },
              { num: 2, label: 'Upload', icon: Upload },
              { num: 3, label: 'Process', icon: Zap },
              { num: 4, label: 'Download', icon: Download }
            ].map((s, idx) => (
              <div key={s.num} className="flex items-center flex-1">
                <div className="flex flex-col items-center relative z-10 flex-1">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-lg transition-all duration-300 ${
                    step >= s.num
                      ? 'bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-xl scale-110'
                      : 'bg-gray-200 text-gray-400'
                  }`}>
                    {step > s.num ? <CheckCircle className="w-8 h-8" /> : <s.icon className="w-7 h-7" />}
                  </div>
                  <span className={`text-sm mt-3 font-semibold hidden md:block transition-colors ${
                    step >= s.num ? 'text-indigo-600' : 'text-gray-500'
                  }`}>{s.label}</span>
                </div>
                {idx < 3 && (
                  <div className="flex-1 mx-4 -mt-8">
                    <div className={`h-2 rounded-full transition-all duration-500 ${
                      step > s.num
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-500'
                        : 'bg-gray-200'
                    }`} />
                  </div>
                )}
              </div>
            ))}
          </div>

          {error && (
            <div className="mb-8 bg-red-50 border-2 border-red-300 rounded-2xl p-5 flex items-start animate-shake">
              <AlertCircle className="w-6 h-6 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 font-semibold">{error}</p>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-8">
              <div className="flex items-center mb-6">
                <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl mr-4">
                  <Grid className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-800">Download Template</h2>
                  <p className="text-gray-500 text-sm mt-1">Get started with your handwriting template</p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 p-6 rounded-2xl">
                <h3 className="font-bold text-blue-900 mb-4 flex items-center text-lg">
                  <FileImage className="w-5 h-5 mr-2" />
                  Instructions:
                </h3>
                <ul className="space-y-3 text-blue-800 text-base">
                  <li className="flex items-start">
                    <span className="text-blue-500 font-bold mr-3">1.</span>
                    <span>Download the template below</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 font-bold mr-3">2.</span>
                    <span>Print it on white A4/Letter paper</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 font-bold mr-3">3.</span>
                    <span>Use a black pen or marker for best results</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 font-bold mr-3">4.</span>
                    <span>Write each character clearly in its designated cell</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 font-bold mr-3">5.</span>
                    <span>Scan or photograph with good lighting</span>
                  </li>
                </ul>
              </div>

              <div className="border-2 border-gray-300 rounded-2xl p-6 bg-gray-50 overflow-auto shadow-inner">
                <canvas ref={templateCanvasRef} className="border-2 border-gray-400 max-w-full mx-auto bg-white rounded-lg" />
              </div>

              <button
                onClick={downloadTemplate}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-5 px-6 rounded-2xl hover:from-indigo-600 hover:to-purple-600 transition-all shadow-lg hover:shadow-2xl flex items-center justify-center gap-3 font-bold text-lg transform hover:scale-[1.02]"
              >
                <Download className="w-6 h-6" />
                Download Template (PNG)
              </button>

              <button
                onClick={() => setStep(2)}
                className="w-full bg-gray-100 text-gray-700 py-4 px-6 rounded-2xl hover:bg-gray-200 transition-all font-semibold text-base border-2 border-gray-200"
              >
                Next: Upload Filled Template →
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8">
              <div className="flex items-center mb-6">
                <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl mr-4">
                  <Upload className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-800">Upload Your Handwriting</h2>
                  <p className="text-gray-500 text-sm mt-1">Share your filled template with us</p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-yellow-200 p-6 rounded-2xl">
                <h3 className="font-bold text-yellow-900 mb-4 flex items-center text-lg">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Tips for best results:
                </h3>
                <ul className="space-y-3 text-yellow-800 text-base">
                  <li className="flex items-start">
                    <span className="text-yellow-500 font-bold mr-3">•</span>
                    <span>Ensure good lighting and minimal shadows</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-yellow-500 font-bold mr-3">•</span>
                    <span>Keep the camera straight above the paper</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-yellow-500 font-bold mr-3">•</span>
                    <span>Make sure all characters are clearly visible</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-yellow-500 font-bold mr-3">•</span>
                    <span>Higher resolution images work better (300 DPI+)</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-6">
                <label className="block">
                  <span className="text-gray-800 font-bold mb-3 block text-lg">Font Name:</span>
                  <input
                    type="text"
                    value={fontName}
                    onChange={(e) => setFontName(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))}
                    className="w-full px-5 py-4 border-2 border-gray-300 rounded-2xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 focus:outline-none text-lg transition-all text-gray-800"
                    placeholder="MyHandwriting"
                  />
                </label>

                <div className={`border-3 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer ${
                  uploadedImage
                    ? 'border-green-400 bg-green-50'
                    : 'border-indigo-300 bg-indigo-50 hover:border-indigo-400 hover:bg-indigo-100'
                }`}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="imageUpload"
                  />
                  <label htmlFor="imageUpload" className="cursor-pointer">
                    {uploadedImage ? (
                      <CheckCircle className="w-20 h-20 mx-auto text-green-500 mb-4" />
                    ) : (
                      <div className="relative inline-block">
                        <div className="absolute inset-0 bg-indigo-400 rounded-full blur-xl opacity-30 animate-pulse"></div>
                        <Upload className="relative w-20 h-20 mx-auto text-indigo-500 mb-4" />
                      </div>
                    )}
                    <p className="text-xl text-gray-700 font-bold">
                      {uploadedImage ? 'Template Uploaded Successfully!' : 'Click to upload your template'}
                    </p>
                    <p className="text-base text-gray-500 mt-2">PNG, JPG, or JPEG (max 10MB)</p>
                  </label>
                </div>

                {uploadedImage && (
                  <div className="border-2 border-gray-300 rounded-2xl p-6 bg-white shadow-xl">
                    <p className="text-base font-bold text-gray-800 mb-4">Preview:</p>
                    <img src={uploadedImage} alt="Uploaded template" className="max-w-full h-auto rounded-lg border-2 border-gray-200" />
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 bg-gray-100 text-gray-700 py-4 px-6 rounded-2xl hover:bg-gray-200 transition-all font-semibold text-base border-2 border-gray-200"
                >
                  ← Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!uploadedImage}
                  className={`flex-1 py-4 px-6 rounded-2xl transition-all font-bold text-base transform ${
                    uploadedImage
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600 shadow-lg hover:shadow-2xl hover:scale-[1.02]'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Next: Process →
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8">
              <div className="flex items-center mb-6">
                <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl mr-4">
                  <Zap className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-800">Generate Your Font</h2>
                  <p className="text-gray-500 text-sm mt-1">Let AI work its magic</p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 p-6 rounded-2xl">
                <h3 className="font-bold text-green-900 mb-4 flex items-center text-lg">
                  <Zap className="w-5 h-5 mr-2" />
                  What happens next:
                </h3>
                <ul className="space-y-3 text-green-800 text-base">
                  <li className="flex items-start">
                    <span className="text-green-500 font-bold mr-3">1.</span>
                    <span>Each character will be extracted from the template</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 font-bold mr-3">2.</span>
                    <span>Images will be converted to vector graphics using Potrace</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 font-bold mr-3">3.</span>
                    <span>A professional TTF font file will be generated using FontForge</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 font-bold mr-3">4.</span>
                    <span>This process may take 30-60 seconds</span>
                  </li>
                </ul>
              </div>

              {uploadedImage && (
                <div className="border-2 border-gray-300 rounded-2xl p-6 bg-gradient-to-br from-gray-50 to-gray-100">
                  <p className="text-base font-bold text-gray-800 mb-4">Your template:</p>
                  <img src={uploadedImage} alt="Template" className="max-w-full h-auto rounded-lg border-2 border-gray-300 shadow-lg" />
                </div>
              )}

              <button
                onClick={processAndGenerateFont}
                disabled={processing}
                className={`w-full py-5 px-6 rounded-2xl transition-all shadow-lg flex items-center justify-center gap-3 font-bold text-lg transform ${
                  processing
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 hover:shadow-2xl hover:scale-[1.02]'
                }`}
              >
                {processing ? (
                  <>
                    <Loader className="w-7 h-7 animate-spin" />
                    Processing Your Font... Please Wait
                  </>
                ) : (
                  <>
                    <Sparkles className="w-7 h-7" />
                    Generate Font
                  </>
                )}
              </button>

              <button
                onClick={() => setStep(2)}
                disabled={processing}
                className="w-full bg-gray-100 text-gray-700 py-4 px-6 rounded-2xl hover:bg-gray-200 transition-all font-semibold disabled:opacity-50 border-2 border-gray-200"
              >
                ← Back to Upload
              </button>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-8">
              <div className="text-center">
                <div className="inline-flex items-center justify-center p-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-3xl shadow-xl mb-6">
                  <CheckCircle className="w-16 h-16 text-white" />
                </div>
                <h2 className="text-4xl md:text-5xl font-extrabold text-gray-800 mb-3">
                  Success! Your Font is Ready
                </h2>
                <p className="text-gray-600 text-lg">Congratulations on creating your custom font!</p>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 p-6 rounded-2xl text-center">
                <p className="text-green-900 text-lg">
                  <strong className="font-bold text-xl">🎉 Amazing!</strong> Your custom font
                  <strong className="font-bold text-indigo-600"> "{fontName}" </strong>
                  has been created successfully and is ready to download!
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-gray-800">Character Preview:</h3>
                  <span className="text-sm text-gray-500">{Object.keys(previewImages).length} characters</span>
                </div>
                <div className="grid grid-cols-6 md:grid-cols-10 lg:grid-cols-12 gap-3 border-2 border-gray-200 rounded-2xl p-6 bg-gradient-to-br from-gray-50 to-gray-100 max-h-96 overflow-auto shadow-inner">
                  {Object.entries(previewImages).slice(0, 60).map(([char, url]) => (
                    <div key={char} className="border-2 border-gray-300 rounded-xl p-2 bg-white hover:shadow-lg hover:scale-105 transition-all duration-200">
                      <div className="text-xs text-gray-600 mb-1 text-center font-bold">
                        {char === ' ' ? 'SPC' : char}
                      </div>
                      <img src={`${API_URL}${url}`} alt={char} className="w-full h-14 object-contain" />
                    </div>
                  ))}
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 p-6 rounded-2xl">
                  <h3 className="font-bold text-blue-900 mb-4 flex items-center text-lg">
                    <Download className="w-5 h-5 mr-2" />
                    How to install your font:
                  </h3>
                  <div className="space-y-3 text-blue-800 text-base">
                    <p className="flex items-start">
                      <span className="font-bold mr-3">💻 Windows:</span>
                      <span>Right-click the downloaded .ttf file and select "Install"</span>
                    </p>
                    <p className="flex items-start">
                      <span className="font-bold mr-3">🍎 Mac:</span>
                      <span>Double-click the .ttf file and click "Install Font"</span>
                    </p>
                    <p className="flex items-start">
                      <span className="font-bold mr-3">🐧 Linux:</span>
                      <span>Copy the .ttf file to ~/.fonts/ directory</span>
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={downloadFont}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-5 px-6 rounded-2xl hover:from-indigo-600 hover:to-purple-600 transition-all shadow-lg hover:shadow-2xl flex items-center justify-center gap-3 font-bold text-xl transform hover:scale-[1.02]"
              >
                <Download className="w-7 h-7" />
                Download Font ({fontName}.ttf)
              </button>

              <button
                onClick={resetApp}
                className="w-full bg-gray-100 text-gray-700 py-4 px-6 rounded-2xl hover:bg-gray-200 transition-all font-semibold border-2 border-gray-200"
              >
                Create Another Font
              </button>
            </div>
          )}
        </div>

        <div className="mt-12 grid md:grid-cols-2 gap-8">
          <div className="bg-gradient-to-br from-white to-indigo-50 rounded-3xl shadow-xl p-8 border border-indigo-100 hover:shadow-2xl transition-all">
            <div className="flex items-center mb-6">
              <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl mr-3">
                <Type className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800">How It Works</h3>
            </div>
            <div className="space-y-4 text-base text-gray-700">
              <div className="flex items-start">
                <span className="text-indigo-600 font-bold mr-3 text-lg">1.</span>
                <p><strong className="text-gray-800">Template Generation:</strong> A grid is created with cells for each character</p>
              </div>
              <div className="flex items-start">
                <span className="text-indigo-600 font-bold mr-3 text-lg">2.</span>
                <p><strong className="text-gray-800">Handwriting Collection:</strong> You fill in the template with your unique handwriting</p>
              </div>
              <div className="flex items-start">
                <span className="text-indigo-600 font-bold mr-3 text-lg">3.</span>
                <p><strong className="text-gray-800">Image Processing:</strong> Sharp extracts each character and cleans the images</p>
              </div>
              <div className="flex items-start">
                <span className="text-indigo-600 font-bold mr-3 text-lg">4.</span>
                <p><strong className="text-gray-800">Vectorization:</strong> Potrace converts bitmaps to smooth vector paths</p>
              </div>
              <div className="flex items-start">
                <span className="text-indigo-600 font-bold mr-3 text-lg">5.</span>
                <p><strong className="text-gray-800">Font Creation:</strong> FontForge generates a professional TTF font file</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white to-purple-50 rounded-3xl shadow-xl p-8 border border-purple-100 hover:shadow-2xl transition-all">
            <div className="flex items-center mb-6">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl mr-3">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800">Tips for Best Results</h3>
            </div>
            <div className="space-y-3 text-base text-gray-700">
              <p className="flex items-center">
                <span className="text-green-500 font-bold mr-3 text-xl">✓</span>
                <span>Use a black pen or marker for clear contrast</span>
              </p>
              <p className="flex items-center">
                <span className="text-green-500 font-bold mr-3 text-xl">✓</span>
                <span>Write consistently across all characters</span>
              </p>
              <p className="flex items-center">
                <span className="text-green-500 font-bold mr-3 text-xl">✓</span>
                <span>Keep your writing centered in each cell</span>
              </p>
              <p className="flex items-center">
                <span className="text-green-500 font-bold mr-3 text-xl">✓</span>
                <span>Scan at high resolution (300 DPI or higher)</span>
              </p>
              <p className="flex items-center">
                <span className="text-green-500 font-bold mr-3 text-xl">✓</span>
                <span>Ensure even lighting with no shadows</span>
              </p>
              <p className="flex items-center">
                <span className="text-green-500 font-bold mr-3 text-xl">✓</span>
                <span>Keep the paper flat when scanning</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HandwritingFontCreator;