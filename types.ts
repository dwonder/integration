
export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  NEW_MANIFEST = 'NEW_MANIFEST',
  ADD_MANIFEST = 'ADD_MANIFEST',
  AMEND_MANIFEST = 'AMEND_MANIFEST',
  CANCEL_MANIFEST = 'CANCEL_MANIFEST',
  TRACK_TRACE = 'TRACK_TRACE',
  SETTINGS = 'SETTINGS',
  ACTIVITY_LOG = 'ACTIVITY_LOG',
  XML_CONVERTER = 'XML_CONVERTER'
}

export interface ManifestFormData {
  messageId: string;
  flightNumber: string;
  date: string;
  departurePort: string;
  arrivalPort: string;
  departureDate: string;
  arrivalDate: string;
  totalPieces: number;
  totalWeight: number;
}

export interface WaybillData {
  awbNumber: string;
  consignorName: string;
  consigneeName: string;
  weight: number;
  pieces: number;
  origin: string;
  destination: string;
}

// NSW API Response Structures
export interface NSWStatus {
  faultcode: string;
  message: string;
  detail?: string;
}

export interface ReferenceResponse {
  status: NSWStatus;
  rotationNumber: string;
  amendmentRequestNumber: string;
  additionalRequestNumber: string;
  cancellationRequestNumber: string;
}

// Log types
export interface TransactionLog {
  id: string;
  timestamp: string;
  operation: string;
  reference?: string;
  status: 'SUCCESS' | 'FAILURE' | 'WARNING';
  code: string;
  details: string;
}

// Chat types
export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}