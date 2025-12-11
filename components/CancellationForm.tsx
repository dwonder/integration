
import React, { useState } from 'react';
import { submitAirCargoManifestCancellation } from '../services/nswApi';
import { NSWStatus } from '../types';
import { Trash2, AlertTriangle, FileCheck, AlertCircle } from 'lucide-react';

export const CancellationForm: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<NSWStatus | null>(null);

  const [formData, setFormData] = useState({
    tin: 'CR12121412',
    rotationNumber: 'SQ2025003444',
    reasonCode: 'A01',
    remarks: 'CANCEL Manifest'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!window.confirm("Are you sure you want to request a cancellation for this manifest?")) {
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await submitAirCargoManifestCancellation(
        formData.tin,
        formData.rotationNumber,
        formData.reasonCode,
        formData.remarks
      );
      setResult(response);
    } catch (error) {
      setResult({ faultcode: "500", message: "System Error", detail: "Unexpected error occurred" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-red-100 rounded-lg">
          <AlertTriangle className="w-8 h-8 text-red-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Cancel Manifest</h2>
          <p className="text-slate-500">Submit a request to cancel an existing Air Cargo Manifest</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm border-t-4 border-t-red-500">
          
          <div className="space-y-4">
             <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tax ID / Company Reg (TIN)</label>
              <input name="tin" value={formData.tin} onChange={handleChange} className="w-full rounded-md border-slate-600 bg-slate-700 text-white shadow-sm p-2 border focus:ring-red-500 focus:border-red-500 placeholder-slate-400" required />
            </div>

             <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Rotation Number</label>
              <input name="rotationNumber" value={formData.rotationNumber} onChange={handleChange} className="w-full rounded-md border-slate-600 bg-slate-700 text-white shadow-sm p-2 border focus:ring-red-500 focus:border-red-500 placeholder-slate-400" required />
            </div>

             <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Reason Code</label>
              <select name="reasonCode" value={formData.reasonCode} onChange={handleChange} className="w-full rounded-md border-slate-600 bg-slate-700 text-white shadow-sm p-2 border focus:ring-red-500 focus:border-red-500">
                <option value="A01">A01 - Duplicate Manifest</option>
                <option value="A02">A02 - Incorrect Vessel/Flight</option>
                <option value="A03">A03 - Voyage Cancelled</option>
                <option value="A99">A99 - Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Remarks</label>
              <textarea name="remarks" value={formData.remarks} onChange={handleChange} className="w-full rounded-md border-slate-600 bg-slate-700 text-white shadow-sm p-2 border focus:ring-red-500 focus:border-red-500 placeholder-slate-400" rows={3} required />
            </div>
          </div>

           <div className="mt-8">
            <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 font-medium transition-colors disabled:bg-red-300 shadow-md">
              {loading ? 'Processing...' : <><Trash2 className="w-4 h-4" /> Submit Cancellation Request</>}
            </button>
          </div>
        </div>

        {result && (
          <div className={`p-4 rounded-lg border ${result.faultcode === '0' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
            <div className="flex items-start gap-2">
              {result.faultcode === '0' ? <FileCheck className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              <div>
                <p className="font-bold">{result.message}</p>
                {result.detail && <p className="text-sm mt-1 opacity-90">{result.detail}</p>}
              </div>
            </div>
          </div>
        )}

      </form>
    </div>
  );
};