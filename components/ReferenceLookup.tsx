import React, { useState } from 'react';
import { retrieveReferenceNumbers } from '../services/nswApi';
import { ReferenceResponse } from '../types';
import { Search, Loader2 } from 'lucide-react';

export const ReferenceLookup: React.FC = () => {
  const [docId, setDocId] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ReferenceResponse | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docId) return;

    setLoading(true);
    try {
      const response = await retrieveReferenceNumbers(docId);
      setData(response);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Track & Trace</h2>
      
      <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
        <form onSubmit={handleSearch} className="flex gap-4 mb-8">
          <input 
            type="text" 
            value={docId}
            onChange={(e) => setDocId(e.target.value)}
            placeholder="Enter Message Header Document ID (e.g. FFM25092201)" 
            className="flex-1 rounded-lg border-slate-600 bg-slate-700 text-white border p-3 focus:ring-2 focus:ring-blue-500 outline-none placeholder-slate-400"
          />
          <button 
            type="submit" 
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium disabled:opacity-70 flex items-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Trace
          </button>
        </form>

        {data && (
           <div className="space-y-4">
             {data.status.faultcode !== "0" ? (
               <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-100 flex items-center gap-2">
                  <div className="font-semibold">Error {data.status.faultcode}:</div>
                  <div>{data.status.message} - {data.status.detail}</div>
               </div>
             ) : (
               <div className="grid grid-cols-1 gap-4">
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold">Rotation Number</p>
                    <p className="text-lg font-mono text-slate-800">{data.rotationNumber || "Pending Assignment"}</p>
                  </div>
                  {data.amendmentRequestNumber && (
                    <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                        <p className="text-xs text-amber-600 uppercase tracking-wide font-semibold">Amendment Req</p>
                        <p className="text-lg font-mono text-slate-800">{data.amendmentRequestNumber}</p>
                    </div>
                  )}
                  {data.cancellationRequestNumber && (
                    <div className="p-4 bg-rose-50 rounded-lg border border-rose-200">
                        <p className="text-xs text-rose-600 uppercase tracking-wide font-semibold">Cancellation Req</p>
                        <p className="text-lg font-mono text-slate-800">{data.cancellationRequestNumber}</p>
                    </div>
                  )}
               </div>
             )}
           </div>
        )}
      </div>
    </div>
  );
};