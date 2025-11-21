import { useState, useRef } from 'react';
import { Upload, FileText, Download, Type, Sparkles, CheckCircle2, BookOpen } from 'lucide-react';

const FontPrinter = () => {
  const [fontFile, setFontFile] = useState(null);
  const [fontUrl, setFontUrl] = useState('');
  const [fontName, setFontName] = useState('');
  const [text, setText] = useState('');
  const [documentFile, setDocumentFile] = useState(null);
  const [fontSize, setFontSize] = useState(18); // Default font size
  const fontInputRef = useRef(null);
  const docInputRef = useRef(null);

  // Handle font upload
  const handleFontUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.name.endsWith('.ttf')) {
      setFontFile(file);
      const url = URL.createObjectURL(file);
      setFontUrl(url);
      const name = file.name.replace('.ttf', '');
      setFontName(name);
      
      // Load the font into the document
      const fontFace = new FontFace(name, `url(${url})`);
      fontFace.load().then((loadedFace) => {
        document.fonts.add(loadedFace);
      }).catch((error) => {
        console.error('Error loading font:', error);
      });
    } else {
      alert('Please upload a valid .ttf font file');
    }
  };

  // Handle document upload
  const handleDocumentUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ['.txt', '.md', '.pdf', '.docx'];
      const fileExt = '.' + file.name.split('.').pop().toLowerCase();
      if (validTypes.includes(fileExt)) {
        setDocumentFile(file);
        // Read text file
        if (fileExt === '.txt' || fileExt === '.md') {
          const reader = new FileReader();
          reader.onload = (event) => {
            setText(event.target.result);
          };
          reader.readAsText(file);
        } else {
          alert('PDF and DOCX files are not fully supported. Please paste your text or upload a .txt file.');
        }
      } else {
        alert('Please upload a valid document (.txt, .md, .pdf, or .docx)');
      }
    }
  };

  // Download text
  const handleDownload = () => {
    if (!text) {
      alert('Please enter some text first');
      return;
    }
    
    const element = document.createElement('a');
    const file = new Blob([text], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'handwritten-text.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 py-12">
      <div className="max-w-7xl w-full mx-auto px-4 md:px-8">
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 border border-gray-100">
          {/* Header with animated gradient */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center p-3 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-2xl shadow-lg mb-4">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent mb-4">
              Font Printer
            </h1>
            <p className="text-gray-600 text-xl max-w-2xl mx-auto">
              Preview and print your documents in your custom handwriting font
            </p>
          </div>

          {/* Main Content - Side by Side Layout */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Left Side - Text Input Area */}
            <div className="space-y-6">
              <div className="flex items-center">
                <div className="p-3 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl mr-3">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-800">Your Text</h2>
                  <p className="text-gray-500 text-sm mt-1">Type or upload your content</p>
                </div>
              </div>

              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type or paste your text here..."
                style={{
                  fontSize: `${fontSize}px`,
                  lineHeight: '2',
                  color: '#1f2937'
                }}
                className="w-full h-[500px] p-6 border-2 border-gray-300 rounded-2xl focus:border-teal-500 focus:ring-4 focus:ring-teal-100 focus:outline-none resize-none shadow-inner transition-all text-gray-800 bg-white"
              />

              {/* Font Size Slider */}
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-indigo-900 font-bold text-base flex items-center">
                    <Type className="w-5 h-5 mr-2" />
                    Font Size
                  </label>
                  <span className="text-indigo-700 font-bold text-lg bg-white px-4 py-1 rounded-xl shadow-sm">
                    {fontSize}px
                  </span>
                </div>
                <input
                  type="range"
                  min="12"
                  max="32"
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-full h-3 bg-indigo-200 rounded-lg appearance-none cursor-pointer slider"
                  style={{
                    background: `linear-gradient(to right, #6366f1 0%, #6366f1 ${((fontSize - 12) / 20) * 100}%, #e0e7ff ${((fontSize - 12) / 20) * 100}%, #e0e7ff 100%)`
                  }}
                />
                <div className="flex justify-between text-xs text-indigo-600 mt-2">
                  <span>Small (12px)</span>
                  <span>Large (32px)</span>
                </div>
              </div>

              {fontFile && text && (
                <div className="bg-green-50 border-2 border-green-300 rounded-2xl p-4 flex items-center">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mr-2" />
                  <p className="text-green-700 font-semibold">
                    Font '{fontName}' will be applied in notebook preview
                  </p>
                </div>
              )}

              {/* Upload Document Option */}
              <div className="space-y-3">
                <p className="text-gray-500 text-center font-semibold">OR</p>
                <div
                  onClick={() => docInputRef.current?.click()}
                  className="border-2 border-dashed border-purple-300 rounded-2xl p-8 text-center bg-purple-50 hover:bg-purple-100 transition-all cursor-pointer hover:border-purple-400"
                >
                  <input
                    ref={docInputRef}
                    type="file"
                    accept=".txt,.md,.pdf,.docx"
                    onChange={handleDocumentUpload}
                    className="hidden"
                  />
                  {documentFile ? (
                    <CheckCircle2 className="w-14 h-14 mx-auto text-green-500 mb-3" />
                  ) : (
                    <FileText className="w-14 h-14 mx-auto text-purple-400 mb-3" />
                  )}
                  <p className="text-base text-gray-700 font-bold mb-1">
                    {documentFile ? documentFile.name : 'Upload document'}
                  </p>
                  <p className="text-sm text-gray-500">.txt, .md, .pdf, or .docx files</p>
                </div>
              </div>
            </div>

            {/* Right Side - Upload Font */}
            <div className="space-y-6">
              <div className="flex items-center">
                <div className="p-3 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl mr-3">
                  <Upload className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-800">Upload Font File</h2>
                  <p className="text-gray-500 text-sm mt-1">Step 1: Add your custom font</p>
                </div>
              </div>

              <div
                onClick={() => fontInputRef.current?.click()}
                className={`border-3 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer ${
                  fontFile
                    ? 'border-green-400 bg-green-50'
                    : 'border-teal-300 bg-teal-50 hover:bg-teal-100 hover:border-teal-400'
                }`}
              >
                <input
                  ref={fontInputRef}
                  type="file"
                  accept=".ttf"
                  onChange={handleFontUpload}
                  className="hidden"
                />
                {fontFile ? (
                  <CheckCircle2 className="w-20 h-20 mx-auto text-green-500 mb-4" />
                ) : (
                  <div className="relative inline-block">
                    <div className="absolute inset-0 bg-teal-400 rounded-full blur-xl opacity-30 animate-pulse"></div>
                    <Type className="relative w-20 h-20 mx-auto text-teal-500 mb-4" />
                  </div>
                )}
                <p className="text-xl text-gray-700 font-bold mb-2">
                  {fontFile ? fontFile.name : 'Click to upload .ttf font'}
                </p>
                <p className="text-base text-gray-500">TrueType Font files only</p>
              </div>

              {fontFile && (
                <div className="p-5 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-2xl flex items-center">
                  <CheckCircle2 className="w-6 h-6 text-green-600 mr-3" />
                  <p className="text-green-800 font-bold text-base">Font loaded: {fontName}</p>
                </div>
              )}

              {/* Info Section */}
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 p-6 rounded-2xl">
                <h3 className="font-bold text-blue-900 mb-4 flex items-center text-lg">
                  <BookOpen className="w-5 h-5 mr-2" />
                  How to use:
                </h3>
                <ol className="space-y-3 text-blue-800 text-base">
                  <li className="flex items-start">
                    <span className="text-blue-500 font-bold mr-3">1.</span>
                    <span>Upload your custom .ttf font file</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 font-bold mr-3">2.</span>
                    <span>Type or paste text in the left area</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 font-bold mr-3">3.</span>
                    <span>Text will display in your custom font</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 font-bold mr-3">4.</span>
                    <span>Preview on notebook paper below</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 font-bold mr-3">5.</span>
                    <span>Download when ready</span>
                  </li>
                </ol>
              </div>
            </div>
          </div>

          {/* Notebook Preview Section */}
          <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-3xl p-8 border-2 border-amber-300 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="p-2 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-xl mr-3">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-800">Notebook Preview</h2>
              </div>
              <button
                onClick={handleDownload}
                disabled={!text}
                className={`py-3 px-6 rounded-2xl transition-all shadow-lg flex items-center gap-3 font-bold transform ${
                  text
                    ? 'bg-gradient-to-r from-gray-700 to-gray-900 text-white hover:from-gray-800 hover:to-black hover:shadow-2xl hover:scale-105'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <Download className="w-5 h-5" />
                Download Text
              </button>
            </div>

            <div className="bg-white rounded-2xl p-10 shadow-2xl min-h-[400px] relative overflow-hidden border-2 border-amber-200">
              {/* Notebook lines background */}
              <div className="absolute inset-0 pointer-events-none px-10">
                {[...Array(12)].map((_, i) => (
                  <div
                    key={i}
                    className="border-b-2 border-blue-200"
                    style={{ marginTop: i === 0 ? '40px' : '40px' }}
                  />
                ))}
              </div>

              {/* Red margin line */}
              <div className="absolute left-16 top-0 bottom-0 w-0.5 bg-red-300 pointer-events-none"></div>

              {/* Text content - Styled with custom font */}
              <div className="relative z-10 pl-8">
                {text ? (
                  <p
                    className="text-gray-800 whitespace-pre-wrap leading-[2.5]"
                    style={{
                      fontFamily: fontName ? `'${fontName}', Arial, sans-serif` : 'Arial, sans-serif',
                      fontSize: `${fontSize}px`
                    }}
                  >
                    {text}
                  </p>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center mt-32">
                    <BookOpen className="w-16 h-16 text-gray-300 mb-4" />
                    <p className="text-gray-400 text-xl font-medium">
                      Your text will appear here on notebook paper...
                    </p>
                    <p className="text-gray-400 text-sm mt-2">
                      Upload a font and type your content to see the preview
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Info Section */}
          <div className="mt-8 bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-300 p-6 rounded-2xl">
            <div className="flex items-start">
              <Sparkles className="w-6 h-6 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
              <p className="text-blue-900 text-base">
                <strong className="font-bold">Note:</strong> The text input area uses normal font for easy typing. Your custom handwriting font will be applied only in the notebook preview below, showing how your text will look on lined paper.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FontPrinter;