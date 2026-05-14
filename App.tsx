/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */


import * as React from 'react';
import { useState, useEffect } from 'react';
import { Menu, X, ChevronRight, LogOut, User, LayoutDashboard, FileText, Users, HardHat, Map as MapIcon, Settings as SettingsIcon, ShieldCheck, ClipboardCheck, Wallet, BarChart2, ShoppingBag } from 'lucide-react';
import { doc, getDoc, setDoc, updateDoc, collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from './lib/firebase';
import { UploadModal } from './components/UploadModal';
import { CCECCProfile } from './components/CCECCProfile';
import { ProjectTimeline } from './components/ProjectTimeline';
import { FinancialReports } from './components/FinancialReports';
import { ProjectManagementStructure } from './components/ProjectManagementStructure';
import { SearchBar } from './components/SearchBar';
import { SearchResults } from './components/SearchResults';
import { ReportsDashboard } from './components/ReportsDashboard'; // New import
import { ReportDetailsModal } from './components/ReportDetailsModal';
import { ManpowerModal } from './components/ManpowerModal';
import { MachineryModal } from './components/MachineryModal';
import { PersonnelView } from './components/PersonnelView';
import { MachineryView } from './components/MachineryView';
import { PasswordModal } from './components/PasswordModal';
import { MapGISView } from './components/MapGISView';
import { EquipmentMaintenanceView } from './components/EquipmentMaintenanceView';
import { SafetyManagementView } from './components/SafetyManagementView';
import { DocumentCenterView } from './components/DocumentCenterView';
import { QualityControlView } from './components/QualityControlView';
import { FinancialSystemView } from './components/FinancialSystemView';
import { AnalyticsDashboardView } from './components/AnalyticsDashboardView';
import { ProcurementView } from './components/ProcurementView';


const ROLES = [
  'Admin',
  'Project Manager',
  'Site Engineer',
  'Office Engineer',
  'Foreman',
  'Finance Officer',
  'Store Keeper',
  'Guest'
];

export default function App() {
  const [modalConfig, setModalConfig] = useState<{ type: string; report?: any; editMode?: boolean; passwordRequested?: boolean } | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [role, setRole] = useState('Admin'); // Default to Admin since auth is removed
  const [user, setUser] = useState<any>({ email: 'admin@dmroad.com', displayName: 'Project Admin' });
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeView, setActiveView] = useState('Dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Auth handled locally now
    setLoading(false);
  }, []);

  const isNavVisible = (v: string) => {
    if (role === 'Admin') return true;
    if (role === 'Project Manager') return true;

    if (role === 'Site Engineer') return ['Dashboard', 'Reports', 'Timeline', 'Personnel', 'Machinery', 'Maintenance', 'Safety', 'GIS', 'Quality', 'Finance', 'Analytics', 'Procurement'].includes(v);
    if (role === 'Foreman') return ['Dashboard', 'Reports', 'Timeline'].includes(v);
    if (role === 'Finance Officer') return ['Dashboard', 'Finance'].includes(v);
    if (role === 'Store Keeper') return ['Dashboard', 'Machinery', 'Maintenance', 'Procurement'].includes(v);
    if (role === 'Guest') return ['Dashboard'].includes(v);

    // Default to Dashboard for unknown or restricted roles
    return ['Dashboard'].includes(v);
  };

  const handleActionClick = (type: string) => {
    setModalConfig({ type, passwordRequested: true });
  };

  const isActionVisible = (action: string) => {
    if (role === 'Admin') return true;
    if (role === 'Project Manager') return true;
    if (role === 'Site Engineer') return ['Site Report', 'Manpower', 'Machinery'].includes(action);
    if (role === 'Foreman') return ['Foreman Log', 'Manpower'].includes(action);
    if (role === 'Finance Officer') return ['Financial Report'].includes(action);
    if (role === 'Store Keeper') return ['Machinery'].includes(action);
    
    return false;
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="w-full min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800 antialiased overflow-x-hidden">
      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] lg:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Mobile Sidebar */}
      <aside className={`fixed top-0 left-0 bottom-0 w-[280px] bg-slate-900 text-white z-[101] flex flex-col transition-transform duration-300 lg:hidden ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-amber-500 rounded-sm flex items-center justify-center font-black text-slate-900 text-lg">DM</div>
            <span className="font-black uppercase tracking-widest text-xs">Menu</span>
          </div>
          <button onClick={() => setMobileMenuOpen(false)} className="p-2 hover:bg-white/10 rounded-sm">
            <X size={20} className="text-amber-500" />
          </button>
        </div>
        
        <nav className="flex-1 p-4 flex flex-col gap-2">
          <MobileNavItem active={activeView === 'Dashboard'} onClick={() => { setActiveView('Dashboard'); setMobileMenuOpen(false); }} icon={<LayoutDashboard size={18} />} label="Dashboard" />
          <MobileNavItem active={activeView === 'Reports'} onClick={() => { setActiveView('Reports'); setMobileMenuOpen(false); }} icon={<FileText size={18} />} label="Reports" />
          <MobileNavItem active={activeView === 'Personnel'} onClick={() => { setActiveView('Personnel'); setMobileMenuOpen(false); }} icon={<Users size={18} />} label="Personnel" />
          <MobileNavItem active={activeView === 'Machinery'} onClick={() => { setActiveView('Machinery'); setMobileMenuOpen(false); }} icon={<HardHat size={18} />} label="Machinery" />
          <MobileNavItem active={activeView === 'Maintenance'} onClick={() => { setActiveView('Maintenance'); setMobileMenuOpen(false); }} icon={<SettingsIcon size={18} />} label="Maintenance" />
          <MobileNavItem active={activeView === 'Safety'} onClick={() => { setActiveView('Safety'); setMobileMenuOpen(false); }} icon={<ShieldCheck size={18} />} label="Safety" />
          <MobileNavItem active={activeView === 'Documents'} onClick={() => { setActiveView('Documents'); setMobileMenuOpen(false); }} icon={<FileText size={18} />} label="Documents" />
          <MobileNavItem active={activeView === 'Quality'} onClick={() => { setActiveView('Quality'); setMobileMenuOpen(false); }} icon={<ClipboardCheck size={18} />} label="Quality Control" />
          <MobileNavItem active={activeView === 'Procurement'} onClick={() => { setActiveView('Procurement'); setMobileMenuOpen(false); }} icon={<ShoppingBag size={18} />} label="Procurement" />
          <MobileNavItem active={activeView === 'Finance'} onClick={() => { setActiveView('Finance'); setMobileMenuOpen(false); }} icon={<Wallet size={18} />} label="Finance" />
          <MobileNavItem active={activeView === 'Analytics'} onClick={() => { setActiveView('Analytics'); setMobileMenuOpen(false); }} icon={<BarChart2 size={18} />} label="Analytics" />
          <MobileNavItem active={activeView === 'GIS'} onClick={() => { setActiveView('GIS'); setMobileMenuOpen(false); }} icon={<MapIcon size={18} />} label="GIS Tracking" />
          {role === 'Admin' && (
            <MobileNavItem active={activeView === 'Users'} onClick={() => { setActiveView('Users'); setMobileMenuOpen(false); }} icon={<Users size={18} />} label="User Management" />
          )}
        </nav>

        <div className="p-6 bg-slate-800/50 border-t border-white/10 overflow-hidden">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center text-slate-900">
                    <User size={16} />
                </div>
                <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase text-amber-500 leading-none mb-1">{role}</p>
                    <p className="text-[10px] text-slate-400 leading-none truncate">{user.email}</p>
                </div>
            </div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center py-2 bg-slate-900/50 rounded">Public Session</div>
        </div>
      </aside>

      <header className="h-20 bg-slate-900 text-white flex items-center justify-between px-4 lg:px-10 border-b-4 border-amber-500 shadow-2xl relative z-20 shrink-0">
        <div className="flex items-center gap-3 lg:gap-4">
          <button onClick={() => setMobileMenuOpen(true)} className="p-2 hover:bg-white/10 rounded-sm lg:hidden">
            <Menu size={24} className="text-amber-500" />
          </button>
          <div className="w-10 h-10 lg:w-12 lg:h-12 bg-amber-500 rounded-sm flex items-center justify-center font-black text-slate-900 text-xl lg:text-2xl shadow-lg ring-2 ring-white/10 shrink-0">DM</div>
          <div className="hidden md:block">
            <h1 className="text-lg lg:text-xl font-bold tracking-tighter uppercase leading-none">DM Road Project</h1>
            <p className="text-[8px] lg:text-[9px] text-slate-400 font-mono font-bold tracking-[0.2em] mt-1 opacity-70 uppercase">Infrastructure Portal</p>
          </div>
        </div>
        
        <div className="hidden lg:flex-1 lg:max-w-md lg:mx-8">
            <SearchBar onSearch={setSearchQuery} />
        </div>
        
        <nav className="hidden lg:flex gap-8 text-sm font-semibold uppercase tracking-widest text-slate-300">
          {isNavVisible('Dashboard') && (
            <span className={`cursor-pointer transition-all ${activeView === 'Dashboard' ? 'text-amber-500 scale-105' : 'hover:text-amber-400'}`} onClick={() => { setActiveView('Dashboard'); setShowProfile(false); setSearchQuery('') }}>Dashboard</span>
          )}
          {isNavVisible('Reports') && (
            <span className={`cursor-pointer transition-all ${activeView === 'Reports' ? 'text-amber-500 scale-105' : 'hover:text-amber-400'}`} onClick={() => { setActiveView('Reports'); setShowProfile(false); }}>Reports</span>
          )}
          {isNavVisible('Personnel') && (
            <span className={`cursor-pointer transition-all ${activeView === 'Personnel' ? 'text-amber-500 scale-105' : 'hover:text-amber-400'}`} onClick={() => { setActiveView('Personnel'); setShowProfile(false); }}>Personnel</span>
          )}
          {isNavVisible('Machinery') && (
            <span className={`cursor-pointer transition-all ${activeView === 'Machinery' ? 'text-amber-500 scale-105' : 'hover:text-amber-400'}`} onClick={() => { setActiveView('Machinery'); setShowProfile(false); }}>Machinery</span>
          )}
          {isNavVisible('Maintenance') && (
            <span className={`cursor-pointer transition-all ${activeView === 'Maintenance' ? 'text-amber-500 scale-105' : 'hover:text-amber-400'}`} onClick={() => { setActiveView('Maintenance'); setShowProfile(false); }}>Maintenance</span>
          )}
          {isNavVisible('Safety') && (
            <span className={`cursor-pointer transition-all ${activeView === 'Safety' ? 'text-amber-500 scale-105' : 'hover:text-amber-400'}`} onClick={() => { setActiveView('Safety'); setShowProfile(false); }}>Safety</span>
          )}
          {isNavVisible('Documents') && (
            <span className={`cursor-pointer transition-all ${activeView === 'Documents' ? 'text-amber-500 scale-105' : 'hover:text-amber-400'}`} onClick={() => { setActiveView('Documents'); setShowProfile(false); }}>Documents</span>
          )}
          {isNavVisible('Quality') && (
            <span className={`cursor-pointer transition-all ${activeView === 'Quality' ? 'text-amber-500 scale-105' : 'hover:text-amber-400'}`} onClick={() => { setActiveView('Quality'); setShowProfile(false); }}>Quality</span>
          )}
          {isNavVisible('Procurement') && (
            <span className={`cursor-pointer transition-all ${activeView === 'Procurement' ? 'text-amber-500 scale-105' : 'hover:text-amber-400'}`} onClick={() => { setActiveView('Procurement'); setShowProfile(false); }}>Procurement</span>
          )}
          {isNavVisible('Finance') && (
            <span className={`cursor-pointer transition-all ${activeView === 'Finance' ? 'text-amber-500 scale-105' : 'hover:text-amber-400'}`} onClick={() => { setActiveView('Finance'); setShowProfile(false); }}>Finance</span>
          )}
          {isNavVisible('Analytics') && (
            <span className={`cursor-pointer transition-all ${activeView === 'Analytics' ? 'text-amber-500 scale-105' : 'hover:text-amber-400'}`} onClick={() => { setActiveView('Analytics'); setShowProfile(false); }}>Analytics</span>
          )}
          {isNavVisible('GIS') && (
            <span className={`cursor-pointer transition-all ${activeView === 'GIS' ? 'text-amber-500 scale-105' : 'hover:text-amber-400'}`} onClick={() => { setActiveView('GIS'); setShowProfile(false); }}>GIS Tracking</span>
          )}
          {role === 'Admin' && (
            <span className={`cursor-pointer transition-all ${activeView === 'Users' ? 'text-amber-500 scale-105' : 'hover:text-amber-400'}`} onClick={() => { setActiveView('Users'); setShowProfile(false); }}>Users</span>
          )}
        </nav>

        <div className="hidden lg:flex items-center gap-4 pl-4 border-l border-slate-700">
            <div className="text-right">
                <p className="text-[10px] font-black uppercase text-amber-500 leading-none">{role}</p>
                <p className="text-[10px] text-slate-400 leading-none mt-1 truncate max-w-[100px]">{user.email}</p>
            </div>
            <button onClick={() => setShowProfile(true)} className="bg-amber-600 text-white text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-sm hover:bg-amber-700">Settings</button>
        </div>
        <div className="flex lg:hidden flex-1 justify-end">
             <SearchBar onSearch={setSearchQuery} />
        </div>
      </header>

      <div className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-10 shadow-sm z-10 shrink-0 overflow-x-auto">
        <div className="hidden lg:flex text-slate-400 text-xs font-black uppercase tracking-widest items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
            Live Project Synchronization
        </div>
        <div className="flex gap-2 lg:gap-4 mx-auto lg:mx-0 py-2" id="actions">
          {isActionVisible('Manpower') && (
            <button onClick={() => handleActionClick('Manpower')} className="px-4 py-2 bg-slate-900 text-white rounded-sm border-b-4 border-emerald-500 text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all hover:-translate-y-0.5 active:translate-y-0">Add Manpower</button>
          )}
          {isActionVisible('Machinery') && (
            <button onClick={() => handleActionClick('Machinery')} className="px-4 py-2 bg-slate-900 text-white rounded-sm border-b-4 border-amber-800 text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all hover:-translate-y-0.5 active:translate-y-0">Add Machinery</button>
          )}
          {isActionVisible('Office Report') && (
            <button onClick={() => handleActionClick('Office Report')} className="px-4 py-2 bg-slate-900 text-white rounded-sm border-b-4 border-indigo-500 text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all hover:-translate-y-0.5 active:translate-y-0">Add Office Report</button>
          )}
          {isActionVisible('Site Report') && (
            <button onClick={() => handleActionClick('Site Report')} className="px-4 py-2 bg-slate-900 text-white rounded-sm border-b-4 border-sky-500 text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all hover:-translate-y-0.5 active:translate-y-0">Add Site Report</button>
          )}
          {isActionVisible('Foreman Log') && (
            <button onClick={() => handleActionClick('Foreman Log')} className="px-4 py-2 bg-slate-900 text-white rounded-sm border-b-4 border-amber-500 text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all hover:-translate-y-0.5 active:translate-y-0">Add Foreman Log</button>
          )}
        </div>
      </div>

      <main className="flex-1 overflow-y-auto p-4 bg-slate-50">
        {searchQuery ? (
          <SearchResults query={searchQuery} />
        ) : activeView === 'Reports' ? (
          <ReportsDashboard role={role} onReportClick={(report, collection, editMode = false) => setModalConfig({ type: collection, report, editMode })} />
        ) : activeView === 'Users' && role === 'Admin' ? (
          <div className="col-span-12">
              <AdminUserManagement />
          </div>
        ) : activeView === 'Timeline' ? (
            <div className="col-span-12">
                <ProjectTimeline />
            </div>
        ) : activeView === 'Personnel' ? (
          <div className="col-span-12">
              <PersonnelView />
          </div>
        ) : activeView === 'Machinery' ? (
          <div className="col-span-12">
              <MachineryView />
          </div>
        ) : activeView === 'GIS' ? (
          <MapGISView />
        ) : activeView === 'Maintenance' ? (
          <EquipmentMaintenanceView />
        ) : activeView === 'Safety' ? (
          <SafetyManagementView />
        ) : activeView === 'Documents' ? (
          <DocumentCenterView />
        ) : activeView === 'Quality' ? (
          <QualityControlView />
        ) : activeView === 'Procurement' ? (
          <ProcurementView />
        ) : activeView === 'Finance' ? (
          <FinancialSystemView />
        ) : activeView === 'Analytics' ? (
          <AnalyticsDashboardView />
        ) : (
          <div className="grid grid-cols-12 gap-4 max-w-7xl mx-auto w-full">
            {/* Row 1: Command Dashboard */}
            <section className="col-span-12 flex flex-col gap-4">
                <div className="bg-white p-8 shadow-xl border border-slate-200 rounded-sm relative">
                    <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
                    <div className="flex justify-between items-start mb-8">
                      <div>
                        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Command Dashboard</h2>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                          </span>
                          <p className="text-[10px] text-slate-500 font-mono uppercase font-black tracking-widest">{role} Operation Mode</p>
                        </div>
                      </div>
                      <div className="text-right p-3 bg-slate-900 text-white rounded-sm shadow-lg">
                        <div className="text-[9px] font-black text-amber-500 uppercase leading-none mb-1 tracking-widest">Sector Focus</div>
                        <div className="text-sm font-black tracking-[0.2em] leading-none text-white">MOTA-SECT</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-slate-50 p-6 border-b-2 border-slate-100 hover:border-amber-500 transition-all cursor-default shadow-sm">
                        <div className="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Progress</div>
                        <div className="text-3xl font-black text-slate-900 leading-none">68%</div>
                        <div className="text-[9px] text-emerald-600 mt-2 uppercase font-black bg-emerald-50 inline-block px-1">+2.4% Δ</div>
                      </div>
                      <div className="bg-slate-50 p-6 border-b-2 border-slate-100 hover:border-emerald-500 transition-all cursor-default shadow-sm">
                        <div className="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Fleets</div>
                        <div className="text-3xl font-black text-slate-900 leading-none">24</div>
                        <div className="text-[9px] text-slate-500 mt-2 uppercase font-black bg-slate-100 inline-block px-1">Active Now</div>
                      </div>
                      <div className="bg-slate-50 p-6 border-b-2 border-slate-100 hover:border-sky-500 transition-all cursor-default shadow-sm">
                        <div className="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Staff</div>
                        <div className="text-3xl font-black text-slate-900 leading-none">186</div>
                        <div className="text-[9px] text-slate-500 mt-2 uppercase font-black bg-slate-100 inline-block px-1">On Rotation</div>
                      </div>
                      <div className="bg-slate-50 p-6 border-b-2 border-slate-100 hover:border-indigo-500 transition-all cursor-default shadow-sm">
                        <div className="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Alerts</div>
                        <div className="text-3xl font-black text-slate-900 leading-none">12</div>
                        <div className="text-[9px] text-amber-600 mt-2 uppercase font-black bg-amber-50 inline-block px-1">Attention</div>
                      </div>
                    </div>
                    
                    <div className="mt-10 p-6 bg-slate-900 rounded-sm border-l-4 border-amber-500 shadow-2xl">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Current Briefing</div>
                        <div className="h-[1px] flex-1 bg-slate-800"></div>
                      </div>
                      <h3 className="text-sm font-black text-white uppercase mb-2">{role} Priority Directives</h3>
                      <p className="text-[11px] leading-relaxed text-slate-400 font-medium">
                        {role === 'Foreman' && "Daily logs and worker safety monitoring mandatory. Verify output quota at 18:00 HRS."}
                        {role === 'Site Engineer' && "Execution quality assurance and machine load balancing. Cross-check foreman logs for discrepancies."}
                        {role === 'Office Engineer' && "Infrastructure documentation and financial synchronization. Monitoring project timeline critical paths."}
                        {role === 'Project Manager' && "Full site oversight and executive decision making. Reviewing all departmental sync logs."}
                        {role === 'Finance Officer' && "Financial auditing and procurement oversight. Monitoring project cost efficiency metrics."}
                        {role === 'Store Keeper' && "Inventory management and machinery parts tracking. Enforce strict check-in/out protocols."}
                        {role === 'Admin' && "Master system administration. Manage user credentials and infrastructure integrity."}
                      </p>
                    </div>
                    
                    <div className="mt-8 flex gap-4">
                        <button onClick={() => setActiveView('Analytics')} className="flex-1 bg-slate-900 border-2 border-slate-900 text-amber-500 py-3 font-black uppercase text-[10px] tracking-widest hover:bg-slate-800 transition-all shadow-[4px_4px_0px_#fff] hover:shadow-none translate-x-[-2px] translate-y-[-2px] hover:translate-x-0 hover:translate-y-0 flex items-center justify-center gap-2">
                           <BarChart2 size={14} />
                           Advanced Intelligence
                        </button>
                        <button onClick={() => setActiveView('Reports')} className="flex-1 bg-white border-2 border-slate-900 text-slate-900 py-3 font-black uppercase text-[10px] tracking-widest hover:bg-slate-900 hover:text-white transition-all shadow-[4px_4px_0px_#f59e0b] hover:shadow-none translate-x-[-2px] translate-y-[-2px] hover:translate-x-0 hover:translate-y-0">View All Logs</button>
                        <button onClick={() => setActiveView('Personnel')} className="flex-1 bg-white border-2 border-slate-900 text-slate-900 py-3 font-black uppercase text-[10px] tracking-widest hover:bg-slate-900 hover:text-white transition-all shadow-[4px_4px_0px_#0ea5e9] hover:shadow-none translate-x-[-2px] translate-y-[-2px] hover:translate-x-0 hover:translate-y-0">Personnel Status</button>
                    </div>
                </div>
            </section>

            {/* Row 2: Secondary Content */}
            <section className="col-span-12 lg:col-span-8 flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-5 border-l-4 border-slate-900 shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-slate-50 rotate-45 translate-x-8 -translate-y-8 group-hover:bg-amber-100 transition-colors"></div>
                  <h2 className="text-[10px] font-black text-slate-400 uppercase mb-3 tracking-widest">Main Contractor</h2>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-red-700 text-white text-xs flex items-center justify-center font-black rounded-sm shadow-md">CCECC</div>
                    <span className="font-bold text-sm tracking-tight">China Civil Engineering</span>
                  </div>
                  <p className="text-[11px] leading-snug text-slate-600 font-medium opacity-80">Infrastructure excellence across Ethiopia since 1979.</p>
                </div>
                <ProjectManagementStructure />
              </div>
              <ProjectTimeline />
            </section>

            <section className="col-span-12 lg:col-span-4 flex flex-col gap-4">
              <FinancialReports />
            </section>
          </div>
        )}
      </main>

      {modalConfig && (
        modalConfig.passwordRequested ? (
          <PasswordModal onConfirm={() => setModalConfig(prev => {
            if (!prev) return null;
            const next = { ...prev };
            delete next.passwordRequested;
            return next;
          })} onCancel={() => setModalConfig(null)} />
        ) : modalConfig.report ? (
          <ReportDetailsModal initialIsEditing={modalConfig.editMode} user={user} report={modalConfig.report} collectionName={modalConfig.type} onClose={() => setModalConfig(null)} />
        ) : modalConfig.type === 'Manpower' ? (
          <ManpowerModal onClose={() => setModalConfig(null)} />
        ) : modalConfig.type === 'Machinery' ? (
          <MachineryModal onClose={() => setModalConfig(null)} />
        ) : (
          <UploadModal type={modalConfig.type} onClose={() => setModalConfig(null)} />
        )
      )}
      {showProfile && <CCECCProfile onClose={() => setShowProfile(false)} />}
    </div>
  );
}

function MobileNavItem({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-4 p-4 rounded-sm transition-all w-full text-left font-black uppercase text-[10px] tracking-[0.2em] ${active ? 'bg-amber-500 text-slate-900 shadow-lg' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
    >
      <span className={active ? 'text-slate-900' : 'text-amber-500'}>{icon}</span>
      {label}
      {active && <ChevronRight size={14} className="ml-auto" />}
    </button>
  );
}

function AdminUserManagement() {
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
  }, []);

  const updateRole = async (userId: string, newRole: string) => {
    try {
      await updateDoc(doc(db, 'users', userId), { role: newRole });
      alert('Role updated');
    } catch (err) {
      console.error(err);
      alert('Permission denied or error updating role');
    }
  };

  return (
    <div className="bg-white p-8 rounded-sm shadow-xl border border-slate-200">
      <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter mb-6 border-b-4 border-amber-500 inline-block">System User Management</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-900 text-white font-black uppercase tracking-widest">
              <th className="p-4 border-r border-slate-800">Email</th>
              <th className="p-4 border-r border-slate-800">Display Name</th>
              <th className="p-4 border-r border-slate-800">Current Role</th>
              <th className="p-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                <td className="p-4 font-bold text-slate-600">{u.email}</td>
                <td className="p-4 font-bold text-slate-900">{u.displayName}</td>
                <td className="p-4">
                    <span className={`px-2 py-1 rounded-sm font-black uppercase text-[9px] tracking-widest ${u.role === 'Admin' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                        {u.role}
                    </span>
                </td>
                <td className="p-4">
                  <select 
                    value={u.role} 
                    onChange={(e) => updateRole(u.id, e.target.value)}
                    className="p-1 border border-slate-200 text-[10px] font-bold uppercase rounded-sm bg-white"
                  >
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

