
export interface NSWConfig {
  oauthToken: string;
  loginId: string;
  password: string;
  submissionEndpoint: string;
  additionEndpoint: string;
  amendmentEndpoint: string;
  cancellationEndpoint: string;
  retrieveReferenceNumbersEndpoint: string;
}

const STORAGE_KEY = 'bayward_nsw_config';

const defaultConfig: NSWConfig = {
  oauthToken: '',
  loginId: '',
  password: '',
  submissionEndpoint: 'https://uat.nsw.gov.ng/nsw/cusLogin/ws/airManifest/submitAirCargoManifest',
  additionEndpoint: 'https://uat.nsw.gov.ng/nsw/cusLogin/ws/airManifest/submitAWBAddition',
  amendmentEndpoint: 'https://uat.nsw.gov.ng/nsw/cusLogin/ws/airManifest/submitAWBAmendment',
  cancellationEndpoint: 'https://uat.nsw.gov.ng/nsw/cusLogin/ws/airManifest/submitAirCargoManifestCancellation',
  retrieveReferenceNumbersEndpoint: 'https://uat.nsw.gov.ng/nsw/cusLogin/ws/airManifest/retrieveAirCargoManifestReferenceNumbers'
};

export const getConfig = (): NSWConfig => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...defaultConfig, ...JSON.parse(stored) };
    }
  } catch (e) {
    console.error("Failed to load config", e);
  }
  return defaultConfig;
};

export const saveConfig = (config: NSWConfig): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch (e) {
    console.error("Failed to save config", e);
  }
};

export const clearConfig = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};