import React from 'react';
import { ValidationResult, ValidationStatus } from '../types';

interface ResultCardProps {
  result: ValidationResult | null;
  isLoading: boolean;
}

export const ResultCard: React.FC<ResultCardProps> = ({ result, isLoading }) => {
  if (isLoading) {
    return (
      <div className="w-full bg-white rounded-2xl shadow-lg border border-blue-100 p-8 flex flex-col items-center justify-center min-h-[300px] animate-pulse">
        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-6"></div>
        <h3 className="text-xl font-semibold text-slate-700">Validating Coverage...</h3>
        <p className="text-slate-500 mt-2">Analyzing rules for Cardiology (Echo, Stress, Holter)</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="w-full bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 p-8 flex flex-col items-center justify-center min-h-[300px] text-slate-400">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-16 h-16 mb-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
        <p className="text-lg">Upload documents to see validation results</p>
      </div>
    );
  }

  const getStatusStyles = (status: ValidationStatus) => {
    switch (status) {
      case ValidationStatus.APPROVED:
        return {
          bg: 'bg-emerald-50',
          border: 'border-emerald-200',
          text: 'text-emerald-800',
          iconBg: 'bg-emerald-100',
          iconColor: 'text-emerald-600',
          label: 'APPROVED',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          )
        };
      case ValidationStatus.DENIED:
        return {
          bg: 'bg-rose-50',
          border: 'border-rose-200',
          text: 'text-rose-800',
          iconBg: 'bg-rose-100',
          iconColor: 'text-rose-600',
          label: 'DENIED',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          )
        };
      case ValidationStatus.NEEDS_REVIEW:
        return {
          bg: 'bg-amber-50',
          border: 'border-amber-200',
          text: 'text-amber-800',
          iconBg: 'bg-amber-100',
          iconColor: 'text-amber-600',
          label: 'NEEDS REVIEW',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
               <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
          )
        };
      default:
         return {
          bg: 'bg-slate-50',
          border: 'border-slate-200',
          text: 'text-slate-800',
          iconBg: 'bg-slate-100',
          iconColor: 'text-slate-600',
          label: 'UNKNOWN',
          icon: <div />
        };
    }
  };

  const styles = getStatusStyles(result.status);

  return (
    <div className={`w-full rounded-2xl shadow-sm border p-8 transition-all duration-500 ease-out transform translate-y-0 opacity-100 ${styles.bg} ${styles.border}`}>
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-xl ${styles.iconBg} ${styles.iconColor}`}>
            {styles.icon}
          </div>
          <div>
            <h2 className={`text-2xl font-bold ${styles.text}`}>{styles.label}</h2>
            <p className="text-slate-500 font-medium">Validation Complete</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-slate-700">{result.matchConfidence}</div>
          <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Match Confidence</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="bg-white/60 p-5 rounded-xl backdrop-blur-sm border border-black/5">
          <p className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-1">Patient Name</p>
          <p className="text-lg font-medium text-slate-800">{result.patientName || "Not detected"}</p>
        </div>
        <div className="bg-white/60 p-5 rounded-xl backdrop-blur-sm border border-black/5">
          <p className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-1">Insurance Provider</p>
          <p className="text-lg font-medium text-slate-800">{result.insuranceProvider || "Not detected"}</p>
        </div>
        <div className="md:col-span-2 bg-white/60 p-5 rounded-xl backdrop-blur-sm border border-black/5">
           <p className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-1">Referral Details</p>
           <p className="text-slate-700 leading-relaxed">{result.referralDetails || "No details extracted"}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-4 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-blue-500">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
            </svg>
            Audit Findings
          </h3>
          <ul className="space-y-3">
            {result.reasoningPoints.map((reason, index) => (
              <li key={index} className="flex items-start gap-3 text-slate-600 text-sm">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0"></span>
                <span>{reason}</span>
              </li>
            ))}
            {result.reasoningPoints.length === 0 && <li className="text-slate-400 italic text-sm">No specific findings listed.</li>}
          </ul>
        </div>

        {/* Action Items Column - Only show if not Approved or if there are items */}
        {(result.status !== ValidationStatus.APPROVED || result.actionItems.length > 0) && (
          <div className="bg-blue-50 rounded-xl border border-blue-100 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-blue-900 uppercase tracking-wide mb-4 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-blue-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m4.5 0a12.06 12.06 0 0 0 4.5 0M6 20.25h12m-7.5-7.125A3.375 3.375 0 0 1 13.5 14H15H4.5h1.5a3.375 3.375 0 0 1 3-1.625H9m3.75-4.875c0 .621.504 1.125 1.125 1.125h4.5c.621 0 1.125-.504 1.125-1.125v-4.5c0-.621-.504-1.125-1.125-1.125h-4.5A1.125 1.125 0 0 0 9 4.875v4.5Z" />
              </svg>
              Action Plan
            </h3>
            <ul className="space-y-3">
              {result.actionItems.map((item, index) => (
                <li key={index} className="flex items-start gap-3 text-blue-800 text-sm">
                  <span className="mt-1 shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-blue-600">
                      <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                    </svg>
                  </span>
                  <span className="font-medium">{item}</span>
                </li>
              ))}
              {result.actionItems.length === 0 && <li className="text-blue-400 italic text-sm">No action items required.</li>}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};