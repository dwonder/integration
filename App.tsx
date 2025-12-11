
import React, { useState, useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import { ManifestForm } from './components/ManifestForm';
import { AmendmentForm } from './components/AmendmentForm';
import { AdditionForm } from './components/AdditionForm';
import { CancellationForm } from './components/CancellationForm';
import { ReferenceLookup } from './components/ReferenceLookup';
import { Settings } from './components/Settings';
import { ActivityLog } from './components/ActivityLog';
import { XmlConverter } from './components/XmlConverter';
import { Assistant } from './components/Assistant';
import { Login } from './components/Login';
import { ViewState } from './types';
import { 
  LayoutDashboard, 
  FilePlus, 
  FileEdit, 
  Search, 
  Settings as SettingsIcon, 
  LogOut,
  Plane,
  Menu,
  X,
  PlusCircle,
  XCircle,
  ScrollText,
  FileJson
} from 'lucide-react';

const SidebarItem = ({ icon: Icon, label, active, onClick }: any) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors mb-1 ${
      active 
        ? 'bg-blue-600 text-white shadow-md' 
        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
    }`}
  >
    <Icon className="w-5 h-5" />
    <span className="font-medium text-sm">{label}</span>
  </button>
);

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.DASHBOARD);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Check for existing session (simplified)
  useEffect(() => {
    const session = sessionStorage.getItem('bayward_session');
    if (session) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = () => {
    sessionStorage.setItem('bayward_session', 'active');
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('bayward_session');
    setIsAuthenticated(false);
    setCurrentView(ViewState.DASHBOARD);
  };

  const renderContent = () => {
    switch (currentView) {
      case ViewState.DASHBOARD:
        return <Dashboard />;
      case ViewState.NEW_MANIFEST:
        return <ManifestForm />;
      case ViewState.ADD_MANIFEST:
        return <AdditionForm />;
      case ViewState.AMEND_MANIFEST:
        return <AmendmentForm />;
      case ViewState.CANCEL_MANIFEST:
        return <CancellationForm />;
      case ViewState.TRACK_TRACE:
        return <ReferenceLookup />;
      case ViewState.ACTIVITY_LOG:
        return <ActivityLog />;
      case ViewState.XML_CONVERTER:
        return <XmlConverter />;
      case ViewState.SETTINGS:
        return <Settings />;
      default:
        return (
          <div className="flex items-center justify-center h-full text-slate-400">
            Feature coming soon...
          </div>
        );
    }
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-white transform transition-transform duration-200 ease-in-out lg:relative lg:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-full flex flex-col p-4">
          <div className="flex items-center gap-3 px-4 py-6 mb-4">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Plane className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Bayward</h1>
              <p className="text-xs text-slate-400">Agents Portal</p>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 px-4">Menu</div>
            <SidebarItem 
              icon={LayoutDashboard} 
              label="Dashboard" 
              active={currentView === ViewState.DASHBOARD}
              onClick={() => { setCurrentView(ViewState.DASHBOARD); setIsMobileMenuOpen(false); }}
            />
            <SidebarItem 
              icon={FilePlus} 
              label="New Manifest" 
              active={currentView === ViewState.NEW_MANIFEST}
              onClick={() => { setCurrentView(ViewState.NEW_MANIFEST); setIsMobileMenuOpen(false); }}
            />
             <SidebarItem 
              icon={PlusCircle} 
              label="Add AWB" 
              active={currentView === ViewState.ADD_MANIFEST}
              onClick={() => { setCurrentView(ViewState.ADD_MANIFEST); setIsMobileMenuOpen(false); }}
            />
            <SidebarItem 
              icon={FileEdit} 
              label="Amendments" 
              active={currentView === ViewState.AMEND_MANIFEST}
              onClick={() => { setCurrentView(ViewState.AMEND_MANIFEST); setIsMobileMenuOpen(false); }}
            />
            <SidebarItem 
              icon={XCircle} 
              label="Cancel Manifest" 
              active={currentView === ViewState.CANCEL_MANIFEST}
              onClick={() => { setCurrentView(ViewState.CANCEL_MANIFEST); setIsMobileMenuOpen(false); }}
            />
            <SidebarItem 
              icon={Search} 
              label="Track & Trace" 
              active={currentView === ViewState.TRACK_TRACE}
              onClick={() => { setCurrentView(ViewState.TRACK_TRACE); setIsMobileMenuOpen(false); }}
            />
            <SidebarItem 
              icon={ScrollText} 
              label="Activity Log" 
              active={currentView === ViewState.ACTIVITY_LOG}
              onClick={() => { setCurrentView(ViewState.ACTIVITY_LOG); setIsMobileMenuOpen(false); }}
            />
             <SidebarItem 
              icon={FileJson} 
              label="XML Converter" 
              active={currentView === ViewState.XML_CONVERTER}
              onClick={() => { setCurrentView(ViewState.XML_CONVERTER); setIsMobileMenuOpen(false); }}
            />
          </nav>

          <div className="border-t border-slate-800 pt-4 mt-4">
            <SidebarItem 
              icon={SettingsIcon} 
              label="Settings" 
              active={currentView === ViewState.SETTINGS}
              onClick={() => { setCurrentView(ViewState.SETTINGS); setIsMobileMenuOpen(false); }}
            />
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-slate-800 hover:text-red-300 rounded-lg transition-colors mt-2"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium text-sm">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 lg:px-10">
          <button 
            className="lg:hidden p-2 text-slate-600"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
          
          <h2 className="text-lg font-semibold text-slate-800 hidden lg:block">
            {currentView === ViewState.DASHBOARD ? 'Overview' : 
             currentView === ViewState.NEW_MANIFEST ? 'Submit Air Cargo Manifest' :
             currentView === ViewState.ADD_MANIFEST ? 'Add Waybill to Manifest' :
             currentView === ViewState.AMEND_MANIFEST ? 'Submit Amendment' :
             currentView === ViewState.CANCEL_MANIFEST ? 'Cancel Manifest' :
             currentView === ViewState.TRACK_TRACE ? 'Status Retrieval' : 
             currentView === ViewState.ACTIVITY_LOG ? 'System Activity Log' :
             currentView === ViewState.XML_CONVERTER ? 'XML to JSON Utilities' :
             currentView === ViewState.SETTINGS ? 'System Configuration' : 'System'}
          </h2>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-sm font-semibold text-slate-800">Temi</span>
              <span className="text-xs text-slate-500">Integration Lead</span>
            </div>
            <img 
              src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" 
              alt="Temi" 
              className="w-10 h-10 rounded-full border border-slate-200 object-cover"
            />
          </div>
        </header>

        {/* Scrollable Area */}
        <div className="flex-1 overflow-auto p-6 lg:p-10">
          {renderContent()}
        </div>
      </main>

      <Assistant />
    </div>
  );
};

export default App;
