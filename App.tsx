import React, { useState, useRef } from 'react';
import { Upload, X, ArrowRight, Download, Eraser, Sparkles, Image as ImageIcon, RotateCcw } from 'lucide-react';
import { AppState, ImageFile } from './types';
import { fileToBase64, downloadImage } from './utils/fileUtils';
import { removeWatermark } from './services/geminiService';
import { Button } from './components/Button';
import { ComparisonSlider } from './components/ComparisonSlider';

function App() {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [imageFile, setImageFile] = useState<ImageFile | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate type
    if (!file.type.startsWith('image/')) {
      setErrorMsg("Please upload a valid image file.");
      return;
    }

    try {
      const base64 = await fileToBase64(file);
      setImageFile({
        file,
        previewUrl: URL.createObjectURL(file),
        base64,
        mimeType: file.type
      });
      setAppState(AppState.PREVIEW);
      setErrorMsg(null);
    } catch (e) {
      console.error(e);
      setErrorMsg("Failed to read file.");
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleProcess = async () => {
    if (!imageFile) return;

    setAppState(AppState.PROCESSING);
    setErrorMsg(null);

    try {
      const processedBase64 = await removeWatermark(imageFile.base64, imageFile.mimeType);
      const processedUrl = `data:${imageFile.mimeType};base64,${processedBase64}`;
      setResultImage(processedUrl);
      setAppState(AppState.RESULT);
    } catch (e: any) {
      console.error("Processing failed", e);
      setErrorMsg(e.message || "Failed to remove watermark. Please try again.");
      setAppState(AppState.PREVIEW);
    }
  };

  const handleReset = () => {
    setAppState(AppState.IDLE);
    setImageFile(null);
    setResultImage(null);
    setErrorMsg(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="min-h-screen bg-[#fbfbfd] text-gray-900 selection:bg-blue-100 selection:text-blue-900">
      
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={handleReset}>
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white">
              <Eraser size={18} />
            </div>
            <span className="font-semibold text-lg tracking-tight">ClearView</span>
          </div>
          {appState !== AppState.IDLE && (
            <button 
              onClick={handleReset}
              className="text-sm font-medium text-gray-500 hover:text-black transition-colors"
            >
              Start Over
            </button>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12 md:py-20 flex flex-col items-center">
        
        {/* State: IDLE (Upload) */}
        {appState === AppState.IDLE && (
          <div className="w-full max-w-2xl text-center space-y-10 animate-fade-in-up">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold tracking-wide uppercase">
                <Sparkles size={12} />
                AI Powered
              </div>
              <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-gray-900">
                Magic eraser for <br/> your photos.
              </h1>
              <p className="text-xl text-gray-500 max-w-lg mx-auto leading-relaxed">
                Instantly remove watermarks, logos, and unwanted text with our advanced AI. Clean, precise, and free.
              </p>
            </div>

            <div 
              className="group relative w-full h-80 border-2 border-dashed border-gray-300 rounded-3xl bg-white hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 flex flex-col items-center justify-center cursor-pointer shadow-sm hover:shadow-md"
              onClick={triggerFileUpload}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files[0];
                if (file) {
                  // Manually create an event to reuse logic (simplified)
                  const dataTransfer = new DataTransfer();
                  dataTransfer.items.add(file);
                  if (fileInputRef.current) {
                    fileInputRef.current.files = dataTransfer.files;
                    const event = { target: fileInputRef.current } as React.ChangeEvent<HTMLInputElement>;
                    handleFileSelect(event);
                  }
                }
              }}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleFileSelect} 
              />
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-6 text-gray-400 group-hover:scale-110 group-hover:bg-white group-hover:text-blue-500 transition-all duration-300">
                <Upload size={32} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Upload an image</h3>
              <p className="text-gray-500 mt-2">or drag and drop here</p>
              <p className="text-xs text-gray-400 mt-8">Supported formats: JPG, PNG, WEBP</p>
            </div>
          </div>
        )}

        {/* State: PREVIEW or PROCESSING */}
        {(appState === AppState.PREVIEW || appState === AppState.PROCESSING) && imageFile && (
          <div className="w-full max-w-4xl space-y-8 animate-fade-in">
            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-2xl font-semibold">Review Image</h2>
                <p className="text-gray-500 mt-1">Ready to remove watermarks?</p>
              </div>
              <Button 
                onClick={handleProcess} 
                isLoading={appState === AppState.PROCESSING}
                className="shadow-xl shadow-blue-500/20"
              >
                Remove Watermark
                {!appState && <ArrowRight size={18} />}
              </Button>
            </div>

            <div className="relative w-full aspect-auto rounded-3xl overflow-hidden shadow-2xl bg-white border border-gray-100">
              <img 
                src={imageFile.previewUrl} 
                alt="Preview" 
                className={`w-full h-full object-contain max-h-[70vh] ${appState === AppState.PROCESSING ? 'blur-sm scale-[1.01] transition-all duration-700' : ''}`} 
              />
              
              {appState === AppState.PROCESSING && (
                <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-white/30 backdrop-blur-sm">
                  <div className="bg-white/80 backdrop-blur-xl px-8 py-6 rounded-2xl shadow-2xl flex flex-col items-center gap-4 border border-white/50">
                    <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
                    <p className="font-medium text-gray-800">Analyzing & Cleaning...</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* State: RESULT */}
        {appState === AppState.RESULT && imageFile && resultImage && (
          <div className="w-full flex flex-col items-center gap-10 animate-fade-in">
             <div className="text-center space-y-2">
                <div className="inline-flex items-center justify-center p-2 bg-green-100 text-green-700 rounded-full mb-2">
                  <Sparkles size={16} />
                </div>
                <h2 className="text-3xl font-bold">Magic Done!</h2>
                <p className="text-gray-500">Drag the slider to compare the results.</p>
             </div>

            <ComparisonSlider 
              beforeImage={imageFile.previewUrl} 
              afterImage={resultImage} 
            />

            <div className="flex gap-4 mt-4">
              <Button 
                variant="secondary" 
                onClick={handleReset}
              >
                <RotateCcw size={18} />
                Try Another
              </Button>
              <Button 
                onClick={() => downloadImage(resultImage, `clearview-edited-${Date.now()}.png`)}
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/30"
              >
                <Download size={18} />
                Download Result
              </Button>
            </div>
          </div>
        )}

        {/* Error Message Toast */}
        {errorMsg && (
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-red-50 text-red-600 px-6 py-4 rounded-xl shadow-lg border border-red-100 flex items-center gap-3 animate-slide-up z-50">
            <X size={20} className="cursor-pointer" onClick={() => setErrorMsg(null)}/>
            <p className="font-medium">{errorMsg}</p>
          </div>
        )}
      </main>

      <footer className="mt-auto py-8 text-center text-gray-400 text-sm">
        <p>&copy; {new Date().getFullYear()} ClearView AI. Designed with Gemini.</p>
      </footer>
      
      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translate(-50%, 20px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
        .animate-fade-in-up { animation: fade-in-up 0.8s ease-out forwards; }
        .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
        .animate-slide-up { animation: slide-up 0.4s ease-out forwards; }
      `}</style>
    </div>
  );
}

export default App;
