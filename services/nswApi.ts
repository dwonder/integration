
import { NSWStatus, ReferenceResponse } from '../types';
import { getConfig } from './configService';
import { addLog } from './logService';

// Simulate network delay for mock functions
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Type for simulation logic function
type SimulationHandler = (payload: any) => NSWStatus;

const handleApiCall = async (
  url: string, 
  payload: any, 
  simulate: SimulationHandler
): Promise<NSWStatus> => {
  const config = getConfig();

  // Validate configuration before attempting call
  if (!config.oauthToken || !config.loginId || !config.password) {
     console.warn("Missing credentials in configuration.");
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
        'Authorization': `Bearer ${config.oauthToken}`, 
        'X-NAME': config.loginId,
        'X-PASSWORD': config.password
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
       try {
         const err = await response.json();
         console.warn("API Error Body:", err);
       } catch (e) { /* ignore */ }
       
       throw new Error(`Server returned ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (data && data.status) {
      return {
        faultcode: data.status.faultcode,
        message: data.status.message,
        detail: data.status.detail
      };
    }

    return {
      faultcode: "99",
      message: "Unknown Response Format",
      detail: "The server response did not match the expected schema."
    };

  } catch (error) {
    // Log as warning instead of error to prevent alarming console messages for expected CORS issues in demo
    console.warn("Network request failed (likely CORS or Offline). Falling back to simulation logic.", error);
    
    await delay(1500);
    return simulate(payload);
  }
};

export const submitAirCargoManifest = async (
  xffmString: string, 
  xfwbStringList: string[]
): Promise<NSWStatus> => {
  const config = getConfig();
  
  // Simulation logic for Manifest Submission
  const simulation = (payload: any): NSWStatus => {
    if (!payload.xffmString || !payload.xfwbStringList || payload.xfwbStringList.length === 0) {
      return {
        faultcode: "4",
        message: "Missing Mandatory Details",
        detail: "xffmString or xfwbStringList"
      };
    }
    return {
      faultcode: "0",
      message: "Success (Simulated)",
      detail: "Manifest submitted successfully (Simulation Mode)"
    };
  };

  const result = await handleApiCall(config.submissionEndpoint, { xffmString, xfwbStringList }, simulation);
  
  // Extract a reference ID from XML if possible
  const match = xffmString.match(/<ram:ID>(.*?)<\/ram:ID>/);
  const ref = match ? match[1] : 'Unknown ID';

  addLog({
    operation: 'Manifest Submission',
    reference: ref,
    status: result.faultcode === '0' ? 'SUCCESS' : 'FAILURE',
    code: result.faultcode,
    details: `${result.message} - ${result.detail || ''}`
  });

  return result;
};

export const submitAWBAddition = async (
  xffmString: string,
  xfwbStringList: string[]
): Promise<NSWStatus> => {
  const config = getConfig();

  // Simulation logic for Addition
  const simulation = (payload: any): NSWStatus => {
    if (!payload.xffmString || !payload.xfwbStringList || payload.xfwbStringList.length === 0) {
       return {
          faultcode: "4",
          message: "Missing Mandatory Details",
          detail: "xffmString or xfwbStringList"
       };
    }
    return {
      faultcode: "0",
      message: "Success (Simulated)",
      detail: "AWB Addition processed (Simulation Mode)"
    };
  };

  const result = await handleApiCall(config.additionEndpoint, { xffmString, xfwbStringList }, simulation);

  const match = xffmString.match(/<ram:ID>(.*?)<\/ram:ID>/);
  const ref = match ? match[1] : 'Unknown ID';

  addLog({
    operation: 'AWB Addition',
    reference: ref,
    status: result.faultcode === '0' ? 'SUCCESS' : 'FAILURE',
    code: result.faultcode,
    details: `${result.message} - ${result.detail || ''}`
  });

  return result;
};

export const submitAWBAmendment = async (
  xffmString: string,
  xfwbString: string,
  reasonCode: string,
  remarks: string
): Promise<NSWStatus> => {
  const config = getConfig();

  // Simulation logic for Amendment
  const simulation = (payload: any): NSWStatus => {
    if (!payload.xffmString || !payload.xfwbString) {
       return {
          faultcode: "4",
          message: "Missing Mandatory Details",
          detail: "xffmString or xfwbString"
       };
    }
    return {
      faultcode: "0",
      message: "Success (Simulated)",
      detail: "Amendment processed (Simulation Mode)"
    };
  };

  const result = await handleApiCall(config.amendmentEndpoint, { xffmString, xfwbString, reasonCode, remarks }, simulation);

  const match = xffmString.match(/<ram:ID>(.*?)<\/ram:ID>/);
  const ref = match ? match[1] : 'Unknown ID';

  addLog({
    operation: 'AWB Amendment',
    reference: ref,
    status: result.faultcode === '0' ? 'SUCCESS' : 'FAILURE',
    code: result.faultcode,
    details: `${result.message} - ${result.detail || ''}`
  });

  return result;
};

export const submitAirCargoManifestCancellation = async (
  tin: string,
  rotationNumber: string,
  reasonCode: string,
  remarks: string
): Promise<NSWStatus> => {
  const config = getConfig();

  // Simulation logic for Cancellation
  const simulation = (payload: any): NSWStatus => {
    if (!payload.tin || !payload.rotationNumber) {
      return {
        faultcode: "4",
        message: "Missing Mandatory Details",
        detail: "tin or rotationNumber"
      };
    }
    return {
      faultcode: "0",
      message: "Success (Simulated)",
      detail: "Cancellation request submitted (Simulation Mode)"
    };
  };

  const result = await handleApiCall(config.cancellationEndpoint, { tin, rotationNumber, reasonCode, remarks }, simulation);

  addLog({
    operation: 'Manifest Cancellation',
    reference: rotationNumber,
    status: result.faultcode === '0' ? 'SUCCESS' : 'FAILURE',
    code: result.faultcode,
    details: `${result.message} - ${result.detail || ''}`
  });

  return result;
};

export const retrieveReferenceNumbers = async (
  messageHeaderDocumentID: string
): Promise<ReferenceResponse> => {
  const config = getConfig();
  let result: ReferenceResponse;

  // 1. Attempt Real API Call
  try {
    const response = await fetch(config.retrieveReferenceNumbersEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
        'Authorization': `Bearer ${config.oauthToken}`, 
        'X-NAME': config.loginId,
        'X-PASSWORD': config.password
      },
      body: JSON.stringify({ messageHeaderDocumentID })
    });

    if (!response.ok) {
       throw new Error(`Server returned ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Normalize status field
    const statusObj = {
        faultcode: data.status?.faultcode || data.status?.faultCode || "99",
        message: data.status?.message || "Unknown",
        detail: data.status?.detail || ""
    };

    result = {
      status: statusObj,
      rotationNumber: data.rotationNumber || "",
      amendmentRequestNumber: data.amendmentRequestNumber || "",
      additionalRequestNumber: data.additionalRequestNumber || "",
      cancellationRequestNumber: data.cancellationRequestNumber || ""
    };

  } catch (error) {
    console.warn("Using simulated response for Retrieval due to error:", error);
    await delay(1000);

    // 2. Simulation Logic based on provided POCs
    if (!messageHeaderDocumentID) {
      result = {
        status: { faultcode: "4", message: "Missing Mandatory Details", detail: "messageHeaderDocumentID missing" },
        rotationNumber: "", amendmentRequestNumber: "", additionalRequestNumber: "", cancellationRequestNumber: ""
      };
    } else if (messageHeaderDocumentID === "FFM5250732") {
      // POC Scenario: Manifest Not Found
      result = {
        status: { faultcode: "WS_15", message: "Manifest Not Found", detail: "No manifest record exists for the provided messageHeaderDocumentID" },
        rotationNumber: "", amendmentRequestNumber: "", additionalRequestNumber: "", cancellationRequestNumber: ""
      };
    } else if (messageHeaderDocumentID === "FFM25073130") {
      // POC Scenario: Success, rotation found
      result = {
        status: { faultcode: "0", message: "Success", detail: "" },
        rotationNumber: "SQ2025003425", amendmentRequestNumber: "", additionalRequestNumber: "", cancellationRequestNumber: ""
      };
    } else if (messageHeaderDocumentID === "FFM25073131") {
      // POC Scenario: Success, but no rotation number yet
      result = {
        status: { faultcode: "0", message: "Success", detail: "" },
        rotationNumber: "", amendmentRequestNumber: "", additionalRequestNumber: "", cancellationRequestNumber: ""
      };
    } else if (messageHeaderDocumentID === "FFM525073128") {
      // POC Scenario: Multiple pending request numbers
      result = {
        status: { faultcode: "0", message: "Success", detail: "" },
        rotationNumber: "4362025003417", 
        amendmentRequestNumber: "", 
        additionalRequestNumber: "PAMA22052025002361", 
        cancellationRequestNumber: "CNCLAIR26082025001339"
      };
    } else {
      // Default Success Simulation
      result = {
        status: { faultcode: "0", message: "Success", detail: "Simulated response" },
        rotationNumber: `ROT-${Math.floor(Math.random() * 100000)}`,
        amendmentRequestNumber: "",
        additionalRequestNumber: "",
        cancellationRequestNumber: ""
      };
    }
  }

  addLog({
    operation: 'Status Retrieval',
    reference: messageHeaderDocumentID || 'N/A',
    status: result.status.faultcode === '0' ? 'SUCCESS' : 'FAILURE',
    code: result.status.faultcode,
    details: `${result.status.message} - ${result.status.detail || ''}`
  });

  return result;
};
