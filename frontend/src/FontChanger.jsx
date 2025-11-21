import { useState, useRef, useEffect } from 'react';
import { Upload, FileText, Type, Download, Trash2, Loader } from 'lucide-react';
import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const FontChanger = () => {
  const [fontFile, setFontFile] = useState(null);
  const [fontUrl, setFontUrl] = useState('');
  const [fontName, setFontName] = useState('');
  const [fontLoaded, setFontLoaded] = useState(false);
  const [documentText, setDocumentText] = useState('');
  const [documentLoading, setDocumentLoading] = useState(false);
  const [sampleText, setSampleText] = useState('The quick brown fox jumps over the lazy dog.\nABCDEFGHIJKLMNOPQRSTUVWXYZ\nabcdefghijklmnopqrstuvwxyz\n0123456789\n!@#$%^&*()_+-=[]{}|;:,.<>?');
  const fontInputRef = useRef(null);

  // Load custom font when uploaded
  useEffect(() => {
    if (fontFile) {
      setFontLoaded(false);
      const url = URL.createObjectURL(fontFile);
      setFontUrl(url);

      // Use a consistent font family name
      const customFontFamily = 'CustomUploadedFont';
      const fontFace = new FontFace(customFontFamily, `url(${url})`);

      fontFace.load().then((loadedFont) => {
        document.fonts.add(loadedFont);
        setFontLoaded(true);
        console.log('Font loaded successfully:', customFontFamily);
      }).catch((error) => {
        console.error('Error loading font:', error);
        setFontLoaded(false);
      });

      return () => {
        URL.revokeObjectURL(url);
        // Clean up the font from document.fonts
        document.fonts.forEach((font) => {
          if (font.family === customFontFamily) {
            document.fonts.delete(font);
          }
        });
      };
    } else {
      setFontLoaded(false);
    }
  }, [fontFile]);

  const handleFontUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.name.endsWith('.ttf')) {
      setFontFile(file);
      setFontName(file.name.replace('.ttf', ''));
    } else {
      alert('Please upload a valid .ttf font file');
    }
  };

  const handleDocumentUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setDocumentLoading(true);
    setDocumentText('');

    try {
      const fileExtension = file.name.split('.').pop().toLowerCase();

      if (fileExtension === 'txt' || fileExtension === 'md') {
        // Handle text files
        const reader = new FileReader();
        reader.onload = (event) => {
          setDocumentText(event.target.result);
          setDocumentLoading(false);
        };
        reader.onerror = () => {
          alert('Error reading text file');
          setDocumentLoading(false);
        };
        reader.readAsText(file);
      } else if (fileExtension === 'pdf') {
        // Handle PDF files
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = '';

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map(item => item.str).join(' ');
          fullText += pageText + '\n\n';
        }

        setDocumentText(fullText.trim());
        setDocumentLoading(false);
      } else if (fileExtension === 'docx') {
        // Handle Word documents
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        setDocumentText(result.value);
        setDocumentLoading(false);
      } else {
        alert('Unsupported file format. Please upload .txt, .md, .pdf, or .docx files.');
        setDocumentLoading(false);
      }
    } catch (error) {
      console.error('Error processing document:', error);
      alert('Error processing document. Please try another file.');
      setDocumentLoading(false);
    }
  };

  const clearFont = () => {
    setFontFile(null);
    setFontUrl('');
    setFontName('');
    setFontLoaded(false);
    if (fontInputRef.current) {
      fontInputRef.current.value = '';
    }
  };

  const downloadStyledDocument = () => {
    const content = documentText || sampleText;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `document-${fontName || 'styled'}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-cyan-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-10">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-3 flex items-center justify-center gap-3">
              <Type className="w-10 h-10 text-teal-600" />
              HandwritingBot Printer
            </h1>
            <p className="text-gray-600 text-lg">Upload a .ttf font and preview it on your documents</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Font Upload Section */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Upload className="w-6 h-6 text-teal-600" />
                Upload Font File
              </h2>

              <div className="border-2 border-dashed border-teal-300 rounded-xl p-8 text-center bg-teal-50 hover:bg-teal-100 transition-all cursor-pointer">
                <input
                  type="file"
                  accept=".ttf"
                  onChange={handleFontUpload}
                  ref={fontInputRef}
                  className="hidden"
                  id="fontUpload"
                />
                <label htmlFor="fontUpload" className="cursor-pointer">
                  <Type className="w-16 h-16 mx-auto text-teal-400 mb-3" />
                  <p className="text-lg text-gray-700 font-semibold">Click to upload .ttf font</p>
                  <p className="text-sm text-gray-500 mt-2">TrueType Font files only</p>
                </label>
              </div>

              {fontFile && (
                <div className="bg-teal-50 border-l-4 border-teal-500 p-4 rounded-lg flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-teal-900">Font loaded:</p>
                    <p className="text-sm text-teal-700">{fontFile.name}</p>
                  </div>
                  <button
                    onClick={clearFont}
                    className="text-red-600 hover:text-red-800 transition-colors"
                    title="Remove font"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>

            {/* Document Upload Section */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <FileText className="w-6 h-6 text-teal-600" />
                Your Document
              </h2>

              <div className="space-y-3">
                <div className="border-2 border-dashed border-purple-300 rounded-xl p-8 text-center bg-purple-50 hover:bg-purple-100 transition-all cursor-pointer">
                  <input
                    type="file"
                    accept=".txt,.md,.pdf,.docx"
                    onChange={handleDocumentUpload}
                    className="hidden"
                    id="documentUpload"
                    disabled={documentLoading}
                  />
                  <label htmlFor="documentUpload" className="cursor-pointer">
                    {documentLoading ? (
                      <>
                        <Loader className="w-16 h-16 mx-auto text-purple-400 mb-3 animate-spin" />
                        <p className="text-lg text-gray-700 font-semibold">Processing document...</p>
                      </>
                    ) : (
                      <>
                        <FileText className="w-16 h-16 mx-auto text-purple-400 mb-3" />
                        <p className="text-lg text-gray-700 font-semibold">Upload document</p>
                        <p className="text-sm text-gray-500 mt-2">.txt, .md, .pdf, or .docx files</p>
                      </>
                    )}
                  </label>
                </div>

                <div className="text-center text-gray-500 text-sm font-semibold">OR</div>

                <textarea
                  value={documentText}
                  onChange={(e) => setDocumentText(e.target.value)}
                  placeholder="Type or paste your text here..."
                  className="w-full h-32 text-gray-900 px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-teal-500 focus:outline-none resize-none"
                />
              </div>
            </div>
          </div>

          {/* Notebook Preview Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">Notebook Preview</h2>
              <button
                onClick={downloadStyledDocument}
                disabled={!documentText && !sampleText}
                className="bg-teal-600 text-white py-2 px-4 rounded-lg hover:bg-teal-700 transition-all flex items-center gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm"
              >
                <Download className="w-4 h-4" />
                Download Text
              </button>
            </div>

            {!fontLoaded && (
              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-lg">
                <p className="text-yellow-800 text-sm">
                  {fontFile ? 'Loading font, please wait...' : 'Upload a .ttf font file to see the preview with your custom font'}
                </p>
              </div>
            )}

            {/* Notebook-style preview */}
            <div className="notebook-container">
              <div className="notebook-page">
                <div className="notebook-margin"></div>
                <div className="notebook-content">
                  <pre
                    className="notebook-text"
                    style={{
                      fontFamily: fontLoaded ? 'CustomUploadedFont, monospace' : 'Arial, sans-serif',
                    }}
                  >
                    {documentText || sampleText}
                  </pre>
                </div>
              </div>
            </div>

            {fontFile && (
              <div className={`border-l-4 p-4 rounded-lg ${fontLoaded ? 'bg-blue-50 border-blue-500' : 'bg-yellow-50 border-yellow-500'}`}>
                <h3 className={`font-semibold mb-2 ${fontLoaded ? 'text-blue-900' : 'text-yellow-900'}`}>
                  {fontLoaded ? 'Preview Info:' : 'Loading Font...'}
                </h3>
                <p className={`text-sm ${fontLoaded ? 'text-blue-800' : 'text-yellow-800'}`}>
                  {fontLoaded ? (
                    <>
                      Currently displaying text in <strong>{fontName}</strong> font on a notebook-style page.
                      {!documentText && ' Using sample text - upload or type your own text to see it styled!'}
                    </>
                  ) : (
                    'Font is being loaded, preview will update shortly...'
                  )}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Info Cards */}
        <div className="mt-8 grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
              <Type className="w-5 h-5 text-teal-600" />
              How to Use
            </h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p><strong>1. Upload Font:</strong> Choose a .ttf font file you want to preview</p>
              <p><strong>2. Add Content:</strong> Upload .txt, .md, .pdf, or .docx files, or type directly</p>
              <p><strong>3. Preview:</strong> See your text rendered in the custom font on a notebook page</p>
              <p><strong>4. Download:</strong> Save the plain text content for use elsewhere</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
              <FileText className="w-5 h-5 text-teal-600" />
              Features
            </h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p>✓ Preview any TrueType (.ttf) font instantly</p>
              <p>✓ Supports .txt, .md, .pdf, and .docx documents</p>
              <p>✓ Type or paste text directly into the editor</p>
              <p>✓ Realistic notebook-style preview with lines</p>
              <p>✓ Perfect for previewing handwriting fonts</p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .notebook-container {
          background: linear-gradient(to bottom, #f8f9fa 0%, #e9ecef 100%);
          padding: 2rem;
          border-radius: 1rem;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }

        .notebook-page {
          background: #ffffff;
          background-image:
            repeating-linear-gradient(
              transparent,
              transparent 31px,
              #e3f2fd 31px,
              #e3f2fd 32px
            );
          min-height: 600px;
          padding: 2rem 1rem 2rem 5rem;
          border-radius: 0.5rem;
          box-shadow:
            inset 0 0 0 1px #dee2e6,
            0 2px 8px rgba(0, 0, 0, 0.05);
          position: relative;
          overflow-wrap: break-word;
          word-wrap: break-word;
        }

        .notebook-margin {
          position: absolute;
          left: 4rem;
          top: 0;
          bottom: 0;
          width: 2px;
          background: linear-gradient(to bottom, #ff6b9d 0%, #ffc371 100%);
          opacity: 0.6;
        }

        .notebook-content {
          position: relative;
          z-index: 1;
        }

        .notebook-text {
          font-size: 1.125rem;
          line-height: 2rem;
          color: #1a1a1a;
          white-space: pre-wrap;
          word-wrap: break-word;
          overflow-wrap: break-word;
          font-family: inherit;
          margin: 0;
          padding: 0;
        }

        @media (max-width: 768px) {
          .notebook-page {
            padding: 1.5rem 1rem 1.5rem 3.5rem;
          }

          .notebook-margin {
            left: 3rem;
          }

          .notebook-text {
            font-size: 1rem;
            line-height: 1.75rem;
          }
        }
      `}</style>
    </div>
  );
};

export default FontChanger;
