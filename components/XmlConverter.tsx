import React, { useState } from 'react';
import { FileJson, ArrowRight, Copy, Trash2, Code, FileCode, Check, AlertCircle, RefreshCw, Upload } from 'lucide-react';

export const XmlConverter: React.FC = () => {
  const [xmlInput, setXmlInput] = useState('');
  const [jsonOutput, setJsonOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Recursive function to convert DOM node to JSON
  const xmlNodeToJson = (node: Node): any => {
    // 1. Handle Text Nodes
    if (node.nodeType === Node.TEXT_NODE) {
      return node.nodeValue?.trim() || '';
    }

    // 2. Handle Elements
    if (node.nodeType === Node.ELEMENT_NODE) {
      const obj: any = {};
      const element = node as Element;

      // Attributes
      if (element.attributes.length > 0) {
        obj["@attributes"] = {};
        for (let i = 0; i < element.attributes.length; i++) {
          const attr = element.attributes[i];
          obj["@attributes"][attr.name] = attr.value;
        }
      }

      // Children
      if (element.hasChildNodes()) {
        const childNodes = Array.from(element.childNodes);
        
        // Check if it's just a single text node inside
        if (childNodes.length === 1 && childNodes[0].nodeType === Node.TEXT_NODE) {
           const textVal = childNodes[0].nodeValue?.trim();
           // If we have attributes, we can't just return the string, we need a value key
           if (Object.keys(obj).length > 0) {
             if (textVal) obj["#text"] = textVal;
           } else {
             return textVal;
           }
        } else {
          // Process children
          childNodes.forEach((child) => {
            if (child.nodeType === Node.TEXT_NODE && !child.nodeValue?.trim()) return; // Skip whitespace

            const childName = child.nodeName;
            const childValue = xmlNodeToJson(child);

            if (Object.prototype.hasOwnProperty.call(obj, childName)) {
              // Convert to array if key exists
              if (!Array.isArray(obj[childName])) {
                obj[childName] = [obj[childName]];
              }
              obj[childName].push(childValue);
            } else {
              obj[childName] = childValue;
            }
          });
        }
      }
      return obj;
    }
  };

  const handleConvert = () => {
    setError(null);
    if (!xmlInput.trim()) {
      setJsonOutput('');
      return;
    }

    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlInput, "text/xml");
      
      // Check for parser errors
      const parserError = xmlDoc.getElementsByTagName("parsererror");
      if (parserError.length > 0) {
        throw new Error("Invalid XML Syntax");
      }

      const jsonResult = xmlNodeToJson(xmlDoc.documentElement);
      // Wrap in root element name
      const rootName = xmlDoc.documentElement.nodeName;
      const finalJson = { [rootName]: jsonResult };

      setJsonOutput(JSON.stringify(finalJson, null, 2));
    } catch (err: any) {
      setError(err.message || "Failed to parse XML");
      setJsonOutput('');
    }
  };

  const handleCopy = () => {
    if (!jsonOutput) return;
    navigator.clipboard.writeText(jsonOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setXmlInput('');
    setJsonOutput('');
    setError(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setXmlInput(text);
      setError(null);
      setJsonOutput(''); // Clear previous output
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input
  };

  const loadSample = () => {
    const sample = `<?xml version="1.0" encoding="UTF-8"?>
<ns0:FlightManifest xmlns:ram="iata:datamodel:3" xmlns:ns0="iata:flightmanifest:1">
  <ns0:MessageHeaderDocument>
    <ram:ID>FFM25092201</ram:ID>
    <ram:TypeCode>785</ram:TypeCode>
    <ram:IssueDateTime>2024-03-20T10:00:00</ram:IssueDateTime>
  </ns0:MessageHeaderDocument>
  <ns0:LogisticsTransportMovement>
    <ram:ID>SQ-123</ram:ID>
    <ram:DepartureEvent>
        <ram:OccurrenceDepartureLocation>
            <ram:ID>SIN</ram:ID>
        </ram:OccurrenceDepartureLocation>
    </ram:DepartureEvent>
  </ns0:LogisticsTransportMovement>
  <ns0:MasterConsignment>
     <ram:ID>057-12345678</ram:ID>
     <ram:TotalPieceQuantity>10</ram:TotalPieceQuantity>
     <ram:IncludedTareGrossWeightMeasure unitCode="KGM">150.5</ram:IncludedTareGrossWeightMeasure>
  </ns0:MasterConsignment>
  <ns0:MasterConsignment>
     <ram:ID>057-87654321</ram:ID>
     <ram:TotalPieceQuantity>5</ram:TotalPieceQuantity>
     <ram:IncludedTareGrossWeightMeasure unitCode="KGM">45.0</ram:IncludedTareGrossWeightMeasure>
  </ns0:MasterConsignment>
</ns0:FlightManifest>`;
    setXmlInput(sample);
    setError(null);
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
           <h2 className="text-2xl font-bold text-slate-800">XML Converter</h2>
           <p className="text-slate-500">Convert IATA Cargo XML to JSON format</p>
        </div>
        <div className="flex gap-2">
           <label className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer">
             <Upload className="w-4 h-4" />
             Upload File
             <input type="file" accept=".xml" className="hidden" onChange={handleFileUpload} />
           </label>
           <button 
             onClick={loadSample}
             className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
           >
             <Code className="w-4 h-4" /> Load Sample XML
           </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
        {/* Input Panel */}
        <div className="flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-3 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <FileCode className="w-4 h-4 text-blue-500" />
              XML Input
            </div>
            <button 
              onClick={handleClear}
              className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
              title="Clear All"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 relative">
            <textarea
              value={xmlInput}
              onChange={(e) => setXmlInput(e.target.value)}
              placeholder="Paste your XML code here..."
              className="absolute inset-0 w-full h-full p-4 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500/50 bg-slate-50/50"
              spellCheck={false}
            />
          </div>
          {error && (
             <div className="p-3 bg-red-50 border-t border-red-100 flex items-center gap-2 text-red-700 text-sm">
                <AlertCircle className="w-4 h-4" />
                {error}
             </div>
          )}
        </div>

        {/* Actions (Mobile Only - Hidden on Desktop usually but displayed inline here for simplicity) */}
        <div className="lg:hidden flex justify-center">
           <button 
              onClick={handleConvert}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium shadow-md active:scale-95 transition-transform"
            >
              Convert <ArrowRight className="w-4 h-4" />
            </button>
        </div>

        {/* Output Panel */}
        <div className="flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden relative">
          
          <div className="p-3 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
             <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <FileJson className="w-4 h-4 text-green-500" />
              JSON Output
            </div>
            <div className="flex gap-2">
               <button 
                onClick={handleConvert}
                className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 transition-colors shadow-sm"
              >
                <RefreshCw className="w-3 h-3" /> Convert
              </button>
              <button 
                onClick={handleCopy}
                disabled={!jsonOutput}
                className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-300 text-slate-700 text-xs font-medium rounded hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                {copied ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>

          <div className="flex-1 relative bg-slate-900">
            <textarea
              readOnly
              value={jsonOutput}
              placeholder="JSON result will appear here..."
              className="absolute inset-0 w-full h-full p-4 font-mono text-sm resize-none focus:outline-none bg-transparent text-slate-300"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
