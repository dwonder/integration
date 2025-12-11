import React, { useState } from 'react';
import { submitAWBAmendment } from '../services/nswApi';
import { NSWStatus } from '../types';
import { Send, Code, FileCheck, AlertCircle } from 'lucide-react';

export const AmendmentForm: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<NSWStatus | null>(null);
  const [showXml, setShowXml] = useState(false);

  const [formData, setFormData] = useState({
    messageId: 'FFM25092202',
    originalManifestNumber: 'MAM31102025002524',
    flightNumber: 'ZQ-25092201',
    date: new Date().toISOString().split('T')[0],
    departurePort: 'SIN',
    arrivalPort: 'LOS',
    departureDate: new Date().toISOString(),
    arrivalDate: new Date().toISOString(),
    reasonCode: 'AMEND',
    remarks: 'Correction of AWB details'
  });

  const [waybill, setWaybill] = useState({
    awbNumber: '057-25092201',
    origin: 'SIN',
    destination: 'LOS',
    pieces: '8',
    weight: '1000.0'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleWaybillChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWaybill({ ...waybill, [e.target.name]: e.target.value });
  };

  const generateXML = () => {
    const xffm = `<?xml version="1.0" encoding="UTF-8"?>
<ns0:FlightManifest xmlns:ram="iata:datamodel:3" xmlns:ns0="iata:flightmanifest:1">
  <ns0:MessageHeaderDocument>
    <ram:ID>${formData.messageId}</ram:ID>
    <ram:TypeCode>785</ram:TypeCode>
    <ram:PurposeCode>5</ram:PurposeCode>
    <ram:VersionID>2</ram:VersionID>
  </ns0:MessageHeaderDocument>
  <ns0:BusinessHeaderDocument>
    <ram:IncludedHeaderNote>
      <ram:ContentCode>MANNO</ram:ContentCode>
      <ram:Content>${formData.originalManifestNumber}</ram:Content>
    </ram:IncludedHeaderNote>
  </ns0:BusinessHeaderDocument>
  <ns0:LogisticsTransportMovement>
    <ram:ID>${formData.flightNumber}</ram:ID>
    <ram:DepartureEvent>
        <ram:DepartureOccurrenceDateTime>${formData.departureDate}</ram:DepartureOccurrenceDateTime>
        <ram:OccurrenceDepartureLocation>
            <ram:ID>${formData.departurePort}</ram:ID>
            <ram:TypeCode>Airport</ram:TypeCode>
        </ram:OccurrenceDepartureLocation>
    </ram:DepartureEvent>
  </ns0:LogisticsTransportMovement>
  <ns0:ArrivalEvent>
     <ram:OccurrenceArrivalLocation>
         <ram:ID>${formData.arrivalPort}</ram:ID>
         <ram:TypeCode>Airport</ram:TypeCode>
     </ram:OccurrenceArrivalLocation>
  </ns0:ArrivalEvent>
</ns0:FlightManifest>`;

    const xfwb = `<?xml version="1.0" encoding="utf-8"?>
<ns0:Waybill xmlns:ns0="iata:waybill:1" xmlns:ram="iata:datamodel:3">
   <ns0:BusinessHeaderDocument>
      <ram:ID>${waybill.awbNumber}</ram:ID>
   </ns0:BusinessHeaderDocument>
   <ns0:MasterConsignment>
       <ram:TotalPieceQuantity>${waybill.pieces}</ram:TotalPieceQuantity>
       <ram:IncludedTareGrossWeightMeasure unitCode="KGM">${waybill.weight}</ram:IncludedTareGrossWeightMeasure>
       <ram:OriginLocation><ram:ID>${waybill.origin}</ram:ID></ram:OriginLocation>
       <ram:FinalDestinationLocation><ram:ID>${waybill.destination}</ram:ID></ram:FinalDestinationLocation>
   </ns0:MasterConsignment>
</ns0:Waybill>`;

    return { xffm, xfwb };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    const { xffm, xfwb } = generateXML();

    try {
      const response = await submitAWBAmendment(xffm, xfwb, formData.reasonCode, formData.remarks);
      setResult(response);
    } catch (error) {
      setResult({ faultcode: "500", message: "System Error", detail: "Unexpected error occurred" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Amend Air Waybill</h2>
          <p className="text-slate-500">Submit corrections for existing manifests</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Amendment Details */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b pb-2">Amendment Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Original Manifest Ref (MANNO)</label>
              <input name="originalManifestNumber" value={formData.originalManifestNumber} onChange={handleChange} className="w-full rounded-md border-slate-600 bg-slate-700 text-white shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500 placeholder-slate-400" required />
            </div>
             <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Reason Code</label>
              <select name="reasonCode" value={formData.reasonCode} onChange={handleChange} className="w-full rounded-md border-slate-600 bg-slate-700 text-white shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500">
                <option value="AMEND">AMEND - Correction</option>
                <option value="CANCEL">CANCEL - Cancellation</option>
                <option value="UPDATE">UPDATE - Update Info</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Remarks</label>
              <textarea name="remarks" value={formData.remarks} onChange={handleChange} className="w-full rounded-md border-slate-600 bg-slate-700 text-white shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500 placeholder-slate-400" rows={2} required />
            </div>
          </div>
        </div>

        {/* Flight Details */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b pb-2">Flight Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Message ID</label>
              <input name="messageId" value={formData.messageId} onChange={handleChange} className="w-full rounded-md border-slate-600 bg-slate-700 text-white shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500 placeholder-slate-400" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Flight Number</label>
              <input name="flightNumber" value={formData.flightNumber} onChange={handleChange} className="w-full rounded-md border-slate-600 bg-slate-700 text-white shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500 placeholder-slate-400" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Departure Date</label>
              <input type="datetime-local" name="departureDate" value={formData.departureDate.slice(0, 16)} onChange={handleChange} className="w-full rounded-md border-slate-600 bg-slate-700 text-white shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500 placeholder-slate-400" required />
            </div>
          </div>
        </div>

        {/* Waybill Details */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b pb-2">Waybill To Amend</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
             <div>
               <label className="block text-xs font-medium text-slate-500">AWB Number</label>
               <input name="awbNumber" value={waybill.awbNumber} onChange={handleWaybillChange} className="w-full mt-1 p-1.5 rounded border border-slate-600 bg-slate-700 text-white shadow-sm text-sm placeholder-slate-400" />
             </div>
             <div>
               <label className="block text-xs font-medium text-slate-500">Pieces</label>
               <input type="number" name="pieces" value={waybill.pieces} onChange={handleWaybillChange} className="w-full mt-1 p-1.5 rounded border border-slate-600 bg-slate-700 text-white shadow-sm text-sm placeholder-slate-400" />
             </div>
             <div>
               <label className="block text-xs font-medium text-slate-500">Weight</label>
               <input type="number" name="weight" value={waybill.weight} onChange={handleWaybillChange} className="w-full mt-1 p-1.5 rounded border border-slate-600 bg-slate-700 text-white shadow-sm text-sm placeholder-slate-400" />
             </div>
             <div>
               <label className="block text-xs font-medium text-slate-500">Destination</label>
               <input name="destination" value={waybill.destination} onChange={handleWaybillChange} className="w-full mt-1 p-1.5 rounded border border-slate-600 bg-slate-700 text-white shadow-sm text-sm placeholder-slate-400" />
             </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button type="submit" disabled={loading} className="flex items-center justify-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 font-medium transition-colors disabled:bg-purple-300 shadow-md">
            {loading ? 'Submitting...' : <><Send className="w-4 h-4" /> Submit Amendment</>}
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
            <pre>{generateXML().xfwb}</pre>
          </div>
        )}

      </form>
    </div>
  );
};