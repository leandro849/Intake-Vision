import React, { useState } from 'react';
import { ImageUpload } from './components/ImageUpload';
import { ResultCard } from './components/ResultCard';
import { ImageFile, ValidationResult } from './types';
import { validateDocuments } from './services/geminiService';

const App: React.FC = () => {
  const [insuranceImg, setInsuranceImg] = useState<ImageFile | null>(null);
  const [referralImg, setReferralImg] = useState<ImageFile | null>(null);
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleValidate = async () => {
    if (!insuranceImg || !referralImg) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const validationData = await validateDocuments(
        insuranceImg.base64,
        insuranceImg.mimeType,
        referralImg.base64,
        referralImg.mimeType
      );
      setResult(validationData);
    } catch (err) {
      console.error(err);
      setError("Failed to validate documents. Please ensure images are clear and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setInsuranceImg(null);
    setReferralImg(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Main Header - Sticky Top */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center">
            {/* Logo Image */}
            <img 
              src="https://app.iacolabora.com.br/assets/iacolabora-logo-7qCmj4ls.png" 
              alt="IAcolabora" 
              style={{ height: '45px', width: 'auto' }} 
              className="block"
            />
          </div>
          <div className="text-sm font-medium text-slate-500 hidden sm:block">
            Secure Intake Portal
          </div>
        </div>
      </header>

      {/* Demo Warning Banner */}
      <div className="bg-slate-800 text-slate-200 text-xs font-medium py-2 px-6 text-center tracking-wide">
        Demo Version: Loaded Ruleset: AMIL Blue 300 (Cardiology: Echo, Stress Test, Aesthetics only)
      </div>

      <main className="max-w-5xl mx-auto px-6 py-10">
        
        <div className="mb-10 text-center max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 mb-3">Coverage Validation</h2>
          <p className="text-slate-500 text-lg">Upload the patient's insurance card and medical referral to automatically verify coverage eligibility and consistency.</p>
        </div>

        {/* Input Section */}
        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <ImageUpload 
              label="1. Insurance Card" 
              image={insuranceImg} 
              onImageSelect={setInsuranceImg}
              onRemove={() => setInsuranceImg(null)}
              disabled={loading}
            />
            <ImageUpload 
              label="2. Medical Referral" 
              image={referralImg} 
              onImageSelect={setReferralImg}
              onRemove={() => setReferralImg(null)}
              disabled={loading}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
            <button
              onClick={handleValidate}
              disabled={!insuranceImg || !referralImg || loading}
              className={`
                px-8 py-3.5 rounded-xl font-semibold text-white shadow-lg shadow-blue-500/20 text-lg w-full sm:w-auto min-w-[200px] transition-all
                ${!insuranceImg || !referralImg || loading 
                  ? 'bg-slate-300 cursor-not-allowed shadow-none' 
                  : 'bg-blue-600 hover:bg-blue-700 hover:-translate-y-0.5 active:translate-y-0'}
              `}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : 'Validate Coverage'}
            </button>

            {(insuranceImg || referralImg) && !loading && (
              <button 
                onClick={handleClear}
                className="px-6 py-3.5 rounded-xl font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors w-full sm:w-auto"
              >
                Clear All
              </button>
            )}
          </div>
          
          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm text-center">
              {error}
            </div>
          )}
        </div>

        {/* Output Section */}
        <div id="results-area" className="scroll-mt-24">
           <ResultCard result={result} isLoading={loading} />
        </div>

      </main>
    </div>
  );
};

export default App;