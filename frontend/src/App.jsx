import { useState } from 'react';
import HandwritingFontCreator from './components/HandwritingFontCreator';
import FontPrinter from './components/FontPrinter';
import AssignmentHelper from './components/AssignmentHelper';

function App() {
  const [currentPage, setCurrentPage] = useState('creator'); // 'creator', 'printer', or 'assignment'

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden">
      {/* Navigation Bar - Fixed at top */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm shadow-md">
        <div className="w-full px-4 md:px-8 py-3 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800">Handwriting Font App</h1>
          <div className="flex gap-3">
            <button
              onClick={() => setCurrentPage('creator')}
              className={`px-6 py-2.5 rounded-xl font-semibold transition-all shadow-md ${
                currentPage === 'creator'
                  ? 'bg-indigo-600 text-white shadow-indigo-200'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200'
              }`}
            >
              🎨 Font Creator
            </button>
            <button
              onClick={() => setCurrentPage('printer')}
              className={`px-6 py-2.5 rounded-xl font-semibold transition-all shadow-md ${
                currentPage === 'printer'
                  ? 'bg-teal-600 text-white shadow-teal-200'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200'
              }`}
            >
              📝 Font Printer
            </button>
            <button
              onClick={() => setCurrentPage('assignment')}
              className={`px-6 py-2.5 rounded-xl font-semibold transition-all shadow-md ${
                currentPage === 'assignment'
                  ? 'bg-orange-600 text-white shadow-orange-200'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200'
              }`}
            >
              📚 Assignment Helper
            </button>
          </div>
        </div>
      </div>

      {/* Page Content - Properly centered */}
      <div className="pt-20 w-full">
        {currentPage === 'creator' && <HandwritingFontCreator />}
        {currentPage === 'printer' && <FontPrinter />}
        {currentPage === 'assignment' && <AssignmentHelper />}
      </div>
    </div>
  );
}

export default App;