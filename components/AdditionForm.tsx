
import React, { useState } from 'react';
import { WaybillData, NSWStatus } from '../types';
import { submitAWBAddition } from '../services/nswApi';
import { Send, Plus, Trash2, Code, FileCheck, AlertCircle, Upload } from 'lucide-react';

const emptyWaybill: WaybillData = {
  awbNumber: '',
  consignorName: '',
  consigneeName: '',
  weight: 0,
  pieces: 0,
  origin: '',
  destination: '',
};

export const AdditionForm: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<NSWStatus | null>(null);
  const [showXml, setShowXml] = useState(false);
  
  const [flightData, setFlightData] = useState({
    messageId: 'FFM25073130',
    originalManifestNumber: 'MAM20082025002498',
    flightNumber: 'SQ-25073126',
    date: new Date().toISOString().split('T')[0],
    departurePort: 'SIN',
    arrivalPort: 'LOS',
    departureDate: new Date().toISOString(),
    arrivalDate: new Date().toISOString()
  });

  const [waybills, setWaybills] = useState<WaybillData[]>([
    {
       awbNumber: '057-225073130',
       origin: 'MA',
       destination: 'SIN',
       pieces: 7,
       weight: 916.0,
       consignorName: 'UNITED CANISTER CORPORATION',
       consigneeName: 'BACHA COFFEE PTE LTD'
    }
  ]);

  const handleFlightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFlightData({ ...flightData, [e.target.name]: e.target.value });
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
    setWaybills(waybills.filter((_, i) => i !== index));
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
          if (waybills.length === 1 && !waybills[0].awbNumber) {
            setWaybills(newWaybills);
          } else {
            setWaybills([...waybills, ...newWaybills]);
          }
        }
      };
      reader.readAsText(file);
      e.target.value = ''; // Reset input
    };

  const generateXML = () => {
    const xffm = `<?xml version="1.0" encoding="UTF-8"?>
<ns0:FlightManifest xmlns:ns0="iata:flightmanifest:1" xmlns:ram="iata:datamodel:3">
   <ns0:MessageHeaderDocument>
      <ram:ID>${flightData.messageId}</ram:ID>
      <ram:TypeCode>785</ram:TypeCode>
      <ram:PurposeCode>2</ram:PurposeCode>
      <ram:VersionID>2</ram:VersionID>
   </ns0:MessageHeaderDocument>
   <ns0:BusinessHeaderDocument>
     <ram:IncludedHeaderNote>
         <ram:ContentCode>MANNO</ram:ContentCode>
         <ram:Content>${flightData.originalManifestNumber}</ram:Content>
      </ram:IncludedHeaderNote>
   </ns0:BusinessHeaderDocument>
   <ns0:LogisticsTransportMovement>
      <ram:ID>${flightData.flightNumber}</ram:ID>
      <ram:DepartureEvent>
         <ram:DepartureOccurrenceDateTime>${flightData.departureDate}</ram:DepartureOccurrenceDateTime>
         <ram:OccurrenceDepartureLocation>
            <ram:ID>${flightData.departurePort}</ram:ID>
            <ram:TypeCode>Airport</ram:TypeCode>
         </ram:OccurrenceDepartureLocation>
      </ram:DepartureEvent>
   </ns0:LogisticsTransportMovement>
   <ns0:ArrivalEvent>
      <ram:OccurrenceArrivalLocation>
         <ram:ID>${flightData.arrivalPort}</ram:ID>
         <ram:TypeCode>Airport</ram:TypeCode>
      </ram:OccurrenceArrivalLocation>
   </ns0:ArrivalEvent>
</ns0:FlightManifest>`;

    const xfwbList = waybills.map(wb => `<?xml version="1.0" encoding="UTF-8"?>
<ns0:Waybill xmlns:ns0="iata:waybill:1" xmlns:ram="iata:datamodel:3">
   <ns0:MessageHeaderDocument>
      <ram:ID>FWB${Math.floor(Math.random()*10000000)}</ram:ID>
      <ram:TypeCode>740</ram:TypeCode>
      <ram:PurposeCode>2</ram:PurposeCode>
      <ram:VersionID>3</ram:VersionID>
   </ns0:MessageHeaderDocument>
   <ns0:BusinessHeaderDocument>
      <ram:ID>${wb.awbNumber}</ram:ID>
   </ns0:BusinessHeaderDocument>
   <ns0:MasterConsignment>
      <ram:ID>${wb.awbNumber}</ram:ID>
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
      const response = await submitAWBAddition(xffm, xfwbList);
      setResult(response);
    } catch (error) {
      setResult({ faultcode: "500", message: "System Error", detail: "Unexpected error occurred" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
          <h2 className="text-2xl font-bold text-slate-800">Add AWB to Manifest</h2>
          <p className="text-slate-500">Append new Air Waybills to an existing Flight Manifest</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Manifest Reference */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b pb-2">Manifest Reference</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Original Manifest Ref (MANNO)</label>
              <input name="originalManifestNumber" value={flightData.originalManifestNumber} onChange={handleFlightChange} className="w-full rounded-md border-slate-600 bg-slate-700 text-white shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500 placeholder-slate-400" required />
            </div>
             <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Message ID</label>
              <input name="messageId" value={flightData.messageId} onChange={handleFlightChange} className="w-full rounded-md border-slate-600 bg-slate-700 text-white shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500 placeholder-slate-400" required />
            </div>
          </div>
        </div>

        {/* Flight Details */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b pb-2">Flight Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Flight Number</label>
              <input name="flightNumber" value={flightData.flightNumber} onChange={handleFlightChange} className="w-full rounded-md border-slate-600 bg-slate-700 text-white shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500 placeholder-slate-400" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Departure Port</label>
              <input name="departurePort" value={flightData.departurePort} onChange={handleFlightChange} className="w-full rounded-md border-slate-600 bg-slate-700 text-white shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500 placeholder-slate-400" required maxLength={3} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Arrival Port</label>
              <input name="arrivalPort" value={flightData.arrivalPort} onChange={handleFlightChange} className="w-full rounded-md border-slate-600 bg-slate-700 text-white shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500 placeholder-slate-400" required maxLength={3} />
            </div>
          </div>
        </div>

        {/* Waybills */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-4 border-b pb-2">
            <h3 className="text-lg font-semibold text-slate-800">Additional Waybills</h3>
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
          
          <div className="space-y-4">
            {waybills.map((wb, idx) => (
              <div key={idx} className="p-4 bg-slate-50 rounded-lg border border-slate-200 relative">
                <button type="button" onClick={() => removeWaybill(idx)} className="absolute top-2 right-2 text-slate-400 hover:text-red-500">
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-500">AWB Number</label>
                    <input name="awbNumber" value={wb.awbNumber} onChange={(e) => handleWaybillChange(idx, e)} className="w-full mt-1 p-1.5 rounded border border-slate-600 bg-slate-700 text-white shadow-sm text-sm placeholder-slate-400" />
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

        <div className="flex items-center gap-4">
          <button type="submit" disabled={loading} className="flex items-center justify-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 font-medium transition-colors disabled:bg-emerald-300 shadow-md">
            {loading ? 'Submitting...' : <><Send className="w-4 h-4" /> Submit Addition</>}
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