import React, { useState, useEffect } from 'react';
import { ManifestFormData, WaybillData, NSWStatus } from '../types';
import { submitAirCargoManifest } from '../services/nswApi';
import { generateSampleManifestData } from '../services/geminiService';
import { Save, Send, Sparkles, Plus, Trash2, Code, FileCheck, AlertCircle, Upload, Database } from 'lucide-react';

const emptyManifest: ManifestFormData = {
  messageId: '',
  flightNumber: '',
  date: '',
  departurePort: '',
  arrivalPort: '',
  departureDate: '',
  arrivalDate: '',
  totalPieces: 0,
  totalWeight: 0,
};

const emptyWaybill: WaybillData = {
  awbNumber: '',
  consignorName: '',
  consigneeName: '',
  weight: 0,
  pieces: 0,
  origin: '',
  destination: '',
};

export const ManifestForm: React.FC = () => {
  const [formData, setFormData] = useState<ManifestFormData>(emptyManifest);
  const [waybills, setWaybills] = useState<WaybillData[]>([emptyWaybill]);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [result, setResult] = useState<NSWStatus | null>(null);
  const [showXml, setShowXml] = useState(false);

  const handleManifestChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleWaybillChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const newWaybills = [...waybills];
    newWaybills[index] = { ...newWaybills[index], [e.target.name]: e.target.value };
    setWaybills(newWaybills);
  };

  const addWaybill = () => {
    setWaybills([...waybills, emptyWaybill]);
  };

  const removeWaybill = (index: number) => {
    const newWaybills = waybills.filter((_, i) => i !== index);
    setWaybills(newWaybills);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n');
      const newWaybills: WaybillData[] = [];

      // Check if first line is header
      const startIndex = lines[0].toLowerCase().includes('awb') ? 1 : 0;

      for (let i = startIndex; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Expected CSV format: AWB, Origin, Destination, Pieces, Weight
        const parts = line.split(',').map(p => p.trim());
        if (parts.length >= 5) {
          newWaybills.push({
            awbNumber: parts[0],
            origin: parts[1],
            destination: parts[2],
            pieces: Number(parts[3]) || 0,
            weight: Number(parts[4]) || 0,
            consignorName: parts[5] || '',
            consigneeName: parts[6] || ''
          });
        }
      }

      if (newWaybills.length > 0) {
        // If the list is currently empty or has just one empty row, replace it
        if (waybills.length === 1 && !waybills[0].awbNumber) {
          setWaybills(newWaybills);
        } else {
          setWaybills([...waybills, ...newWaybills]);
        }
        
        // Update total pieces/weight summary automatically
        const totalP = newWaybills.reduce((sum, wb) => sum + wb.pieces, formData.totalPieces);
        const totalW = newWaybills.reduce((sum, wb) => sum + wb.weight, formData.totalWeight);
        setFormData(prev => ({ ...prev, totalPieces: totalP, totalWeight: totalW }));
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input
  };

  const generateXML = () => {
    // Simplified XFFM generation based on IATA spec snippet
    const xffm = `<?xml version="1.0" encoding="UTF-8"?>
<ns0:FlightManifest xmlns:ram="iata:datamodel:3" xmlns:ns0="iata:flightmanifest:1">
  <ns0:MessageHeaderDocument>
    <ram:ID>${formData.messageId}</ram:ID>
    <ram:TypeCode>785</ram:TypeCode>
    <ram:IssueDateTime>${new Date().toISOString()}</ram:IssueDateTime>
  </ns0:MessageHeaderDocument>
  <ns0:LogisticsTransportMovement>
    <ram:ID>${formData.flightNumber}</ram:ID>
    <ram:DepartureEvent>
        <ram:DepartureOccurrenceDateTime>${formData.departureDate}</ram:DepartureOccurrenceDateTime>
        <ram:OccurrenceDepartureLocation>
            <ram:ID>${formData.departurePort}</ram:ID>
        </ram:OccurrenceDepartureLocation>
    </ram:DepartureEvent>
  </ns0:LogisticsTransportMovement>
  <ns0:ArrivalEvent>
     <ram:OccurrenceArrivalLocation>
         <ram:ID>${formData.arrivalPort}</ram:ID>
     </ram:OccurrenceArrivalLocation>
  </ns0:ArrivalEvent>
</ns0:FlightManifest>`;

    const xfwbList = waybills.map(wb => `<?xml version="1.0" encoding="utf-8"?>
<ns0:Waybill xmlns:ns0="iata:waybill:1" xmlns:ram="iata:datamodel:3">
   <ns0:BusinessHeaderDocument>
      <ram:ID>${wb.awbNumber}</ram:ID>
   </ns0:BusinessHeaderDocument>
   <ns0:MasterConsignment>
       <ram:TotalPieceQuantity>${wb.pieces}</ram:TotalPieceQuantity>
       <ram:IncludedTareGrossWeightMeasure unitCode="KGM">${wb.weight}</ram:IncludedTareGrossWeightMeasure>
       <ram:OriginLocation><ram:ID>${wb.origin}</ram:ID></ram:OriginLocation>
       <ram:FinalDestinationLocation><ram:ID>${wb.destination}</ram:ID></ram:FinalDestinationLocation>
   </ns0:MasterConsignment>
</ns0:Waybill>`);

    return { xffm, xfwbList };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    const { xffm, xfwbList } = generateXML();

    try {
      const response = await submitAirCargoManifest(xffm, xfwbList);
      setResult(response);
    } catch (error) {
      setResult({ faultcode: "500", message: "Network Error", detail: "Failed to connect" });
    } finally {
      setLoading(false);
    }
  };

  const handleAiPrefill = async () => {
    setAiLoading(true);
    try {
      const dataStr = await generateSampleManifestData();
      const parsed = JSON.parse(dataStr);
      setFormData({
        ...formData,
        ...parsed,
        totalPieces: Number(parsed.totalPieces),
        totalWeight: Number(parsed.totalWeight)
      });
      setWaybills([{
        awbNumber: "057-" + Math.floor(Math.random() * 10000000),
        consignorName: "Global Trade Co",
        consigneeName: "Local Importers Ltd",
        weight: Number(parsed.totalWeight),
        pieces: Number(parsed.totalPieces),
        origin: parsed.departurePort,
        destination: parsed.arrivalPort
      }]);
    } catch (e) {
      console.error("AI Parse Error");
    } finally {
      setAiLoading(false);
    }
  };

  const generateLargeManifest = () => {
    // Generate flight header
    const flightData: ManifestFormData = {
      messageId: `FFM${Date.now()}`,
      flightNumber: `SQ-${Math.floor(Math.random() * 900) + 100}`,
      date: new Date().toISOString().split('T')[0],
      departurePort: 'SIN',
      arrivalPort: 'LOS',
      departureDate: new Date().toISOString(),
      arrivalDate: new Date().toISOString(),
      totalPieces: 0,
      totalWeight: 0,
    };

    // Generate 100 random waybills
    const newWaybills: WaybillData[] = [];
    for (let i = 0; i < 100; i++) {
        newWaybills.push({
            awbNumber: `057-${Math.floor(Math.random() * 10000000).toString().padStart(8, '0')}`,
            origin: 'SIN',
            destination: 'LOS',
            pieces: Math.floor(Math.random() * 10) + 1,
            weight: parseFloat((Math.random() * 100).toFixed(2)),
            consignorName: `Test Consignor ${i+1}`,
            consigneeName: `Test Consignee ${i+1}`
        });
    }

    // Calculate totals
    const totalP = newWaybills.reduce((sum, wb) => sum + wb.pieces, 0);
    const totalW = newWaybills.reduce((sum, wb) => sum + wb.weight, 0);

    setFormData({ 
      ...flightData, 
      totalPieces: totalP, 
      totalWeight: parseFloat(totalW.toFixed(2)) 
    });
    setWaybills(newWaybills);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">New Cargo Manifest</h2>
          <p className="text-slate-500">Create and submit XFFM/XFWB data to NSW</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={generateLargeManifest}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 hover:shadow-lg transition-all"
            title="Generates a manifest with 100 random items for stress testing"
          >
            <Database className="w-4 h-4" />
            Load 100 Test Items
          </button>
          <button 
            onClick={handleAiPrefill}
            disabled={aiLoading}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-70"
          >
            {aiLoading ? (
               <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            AI Auto-Fill
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Flight Header */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b pb-2">Flight Manifest Details (XFFM)</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Message ID</label>
              <input name="messageId" value={formData.messageId} onChange={handleManifestChange} className="w-full rounded-md border-slate-600 bg-slate-700 text-white shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500 placeholder-slate-400" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Flight Number</label>
              <input name="flightNumber" value={formData.flightNumber} onChange={handleManifestChange} className="w-full rounded-md border-slate-600 bg-slate-700 text-white shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500 placeholder-slate-400" required placeholder="SQ-123" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Flight Date</label>
              <input type="date" name="date" value={formData.date} onChange={handleManifestChange} className="w-full rounded-md border-slate-600 bg-slate-700 text-white shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500 placeholder-slate-400" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Departure Port</label>
              <input name="departurePort" value={formData.departurePort} onChange={handleManifestChange} className="w-full rounded-md border-slate-600 bg-slate-700 text-white shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500 placeholder-slate-400" required maxLength={3} placeholder="SIN" />
            </div>
             <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Arrival Port</label>
              <input name="arrivalPort" value={formData.arrivalPort} onChange={handleManifestChange} className="w-full rounded-md border-slate-600 bg-slate-700 text-white shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500 placeholder-slate-400" required maxLength={3} placeholder="LOS" />
            </div>
             <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Total Weight (KGM)</label>
              <input type="number" name="totalWeight" value={formData.totalWeight} onChange={handleManifestChange} className="w-full rounded-md border-slate-600 bg-slate-700 text-white shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500 placeholder-slate-400" />
            </div>
          </div>
        </div>

        {/* Waybills */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-4 border-b pb-2">
            <div className="flex items-baseline gap-2">
               <h3 className="text-lg font-semibold text-slate-800">Waybills (XFWB)</h3>
               <span className="text-sm text-slate-500">Count: {waybills.length}</span>
            </div>
            <div className="flex gap-4">
              <label className="cursor-pointer text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1">
                <Upload className="w-4 h-4" /> Import CSV
                <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
              </label>
              <button type="button" onClick={addWaybill} className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1">
                <Plus className="w-4 h-4" /> Add AWB
              </button>
            </div>
          </div>
          
          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
            {waybills.map((wb, idx) => (
              <div key={idx} className="p-4 bg-slate-50 rounded-lg border border-slate-200 relative">
                <button type="button" onClick={() => removeWaybill(idx)} className="absolute top-2 right-2 text-slate-400 hover:text-red-500">
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-500">AWB Number</label>
                    <input name="awbNumber" value={wb.awbNumber} onChange={(e) => handleWaybillChange(idx, e)} className="w-full mt-1 p-1.5 rounded border border-slate-600 bg-slate-700 text-white shadow-sm text-sm placeholder-slate-400" placeholder="000-00000000" />
                  </div>
                   <div>
                    <label className="block text-xs font-medium text-slate-500">Origin</label>
                    <input name="origin" value={wb.origin} onChange={(e) => handleWaybillChange(idx, e)} className="w-full mt-1 p-1.5 rounded border border-slate-600 bg-slate-700 text-white shadow-sm text-sm placeholder-slate-400" />
                  </div>
                   <div>
                    <label className="block text-xs font-medium text-slate-500">Destination</label>
                    <input name="destination" value={wb.destination} onChange={(e) => handleWaybillChange(idx, e)} className="w-full mt-1 p-1.5 rounded border border-slate-600 bg-slate-700 text-white shadow-sm text-sm placeholder-slate-400" />
                  </div>
                   <div>
                    <label className="block text-xs font-medium text-slate-500">Pieces</label>
                    <input type="number" name="pieces" value={wb.pieces} onChange={(e) => handleWaybillChange(idx, e)} className="w-full mt-1 p-1.5 rounded border border-slate-600 bg-slate-700 text-white shadow-sm text-sm placeholder-slate-400" />
                  </div>
                   <div>
                    <label className="block text-xs font-medium text-slate-500">Weight</label>
                    <input type="number" name="weight" value={wb.weight} onChange={(e) => handleWaybillChange(idx, e)} className="w-full mt-1 p-1.5 rounded border border-slate-600 bg-slate-700 text-white shadow-sm text-sm placeholder-slate-400" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <button type="submit" disabled={loading} className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:bg-blue-300 shadow-md">
            {loading ? 'Submitting...' : <><Send className="w-4 h-4" /> Submit Manifest</>}
          </button>
          
          <button type="button" onClick={() => setShowXml(!showXml)} className="flex items-center justify-center gap-2 bg-slate-200 text-slate-700 px-6 py-3 rounded-lg hover:bg-slate-300 font-medium transition-colors">
            <Code className="w-4 h-4" /> {showXml ? 'Hide XML' : 'View XML'}
          </button>
        </div>

        {result && (
          <div className={`p-4 rounded-lg border ${result.faultcode === '0' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
            <div className="flex items-start gap-2">
              {result.faultcode === '0' ? <FileCheck className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              <div>
                <p className="font-bold">{result.message}</p>
                {result.detail && <p className="text-sm mt-1 opacity-90">{result.detail}</p>}
                {result.faultcode === '0' && <p className="text-xs mt-2">Ready for NSW processing.</p>}
              </div>
            </div>
          </div>
        )}

        {showXml && (
          <div className="bg-slate-900 text-slate-100 p-4 rounded-lg font-mono text-xs overflow-x-auto">
            <pre>{generateXML().xffm}</pre>
            <div className="my-4 border-t border-slate-700"></div>
            {generateXML().xfwbList.map((x, i) => <pre key={i} className="mb-2">{x}</pre>)}
          </div>
        )}
      </form>
    </div>
  );
};