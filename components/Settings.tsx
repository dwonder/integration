
import React, { useState, useEffect } from 'react';
import { getConfig, saveConfig, NSWConfig, clearConfig } from '../services/configService';
import { Save, Trash2, Shield, Eye, EyeOff } from 'lucide-react';

export const Settings: React.FC = () => {
  const [config, setConfig] = useState<NSWConfig>(getConfig());
  const [showPassword, setShowPassword] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Load config on mount
    setConfig(getConfig());
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfig({ ...config, [e.target.name]: e.target.value });
    setSaved(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveConfig(config);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleClear = () => {
    if (window.confirm("Are you sure you want to clear all saved credentials?")) {
      clearConfig();
      setConfig(getConfig());
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-slate-800 rounded-lg">
          <Shield className="w-8 h-8 text-blue-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">API Configuration</h2>
          <p className="text-slate-500">Manage credentials for NSW Integration</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b pb-2">Authentication</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Login ID (X-NAME)</label>
              <input 
                name="loginId" 
                value={config.loginId} 
                onChange={handleChange} 
                className="w-full rounded-md border-slate-600 bg-slate-700 text-white shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500 placeholder-slate-400"
                placeholder="Enter NSW Login ID"
              />
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-slate-700 mb-1">Password (X-PASSWORD)</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"}
                  name="password" 
                  value={config.password} 
                  onChange={handleChange} 
                  className="w-full rounded-md border-slate-600 bg-slate-700 text-white shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500 placeholder-slate-400 pr-10"
                  placeholder="Enter NSW Password"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-2.5 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-slate-700 mb-1">OAuth Token (Bearer)</label>
              <div className="relative">
                <input 
                  type={showToken ? "text" : "password"}
                  name="oauthToken" 
                  value={config.oauthToken} 
                  onChange={handleChange} 
                  className="w-full rounded-md border-slate-600 bg-slate-700 text-white shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500 placeholder-slate-400 pr-10"
                  placeholder="Enter Bearer Token"
                />
                 <button 
                  type="button"
                  onClick={() => setShowToken(!showToken)}
                  className="absolute right-2 top-2.5 text-slate-400 hover:text-white"
                >
                  {showToken ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b pb-2">Endpoints</h3>
          <div className="space-y-4">
             <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Submission URL</label>
              <input 
                name="submissionEndpoint" 
                value={config.submissionEndpoint} 
                onChange={handleChange} 
                className="w-full rounded-md border-slate-600 bg-slate-700 text-white shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500 placeholder-slate-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Addition URL</label>
              <input 
                name="additionEndpoint" 
                value={config.additionEndpoint} 
                onChange={handleChange} 
                className="w-full rounded-md border-slate-600 bg-slate-700 text-white shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500 placeholder-slate-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Amendment URL</label>
              <input 
                name="amendmentEndpoint" 
                value={config.amendmentEndpoint} 
                onChange={handleChange} 
                className="w-full rounded-md border-slate-600 bg-slate-700 text-white shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500 placeholder-slate-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Cancellation URL</label>
              <input 
                name="cancellationEndpoint" 
                value={config.cancellationEndpoint} 
                onChange={handleChange} 
                className="w-full rounded-md border-slate-600 bg-slate-700 text-white shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500 placeholder-slate-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Retrieval URL</label>
              <input 
                name="retrieveReferenceNumbersEndpoint" 
                value={config.retrieveReferenceNumbersEndpoint} 
                onChange={handleChange} 
                className="w-full rounded-md border-slate-600 bg-slate-700 text-white shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500 placeholder-slate-400"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center pt-4">
          <button 
            type="button" 
            onClick={handleClear}
            className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-200"
          >
            <Trash2 className="w-4 h-4" /> Clear Credentials
          </button>

          <button 
            type="submit" 
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md transition-colors font-medium"
          >
            <Save className="w-4 h-4" /> {saved ? 'Settings Saved!' : 'Save Configuration'}
          </button>
        </div>
        
        <div className="text-xs text-slate-400 text-center">
          Note: Credentials are stored locally in your browser for demonstration purposes. 
        </div>
      </form>
    </div>
  );
};