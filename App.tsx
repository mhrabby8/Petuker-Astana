
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Menu, X, Search, Bell, User, ChevronRight, LogOut, 
  Trash2, Plus, Minus, CreditCard, Printer, CheckCircle, 
  ChevronLeft, Smartphone, Laptop, Settings as SettingsIcon, 
  Clock, Filter, Edit, Eye, Download, Users, Package, 
  TrendingUp, TrendingDown, DollarSign, Calendar, MapPin, 
  Tag, Info, PlusCircle, AlertTriangle, Layers, Truck, FileText,
  ShoppingCart, Wallet, LayoutDashboard, BookOpen, Trash, UserPlus, Shield, ArrowLeft,
  List, Coffee, Home, MoreVertical, Upload, Camera, Check, Building2, Key, EyeOff,
  Flame, History, SlidersHorizontal, Receipt, BadgeCent, Warehouse, Percent, Banknote,
  UserCircle, BarChart3, PieChart as PieChartIcon, ImageIcon, Lock, ExternalLink, HandCoins, Star, ShieldCheck, ShieldAlert, Sparkles, BrainCircuit, Loader2
} from 'lucide-react';
import { 
  NAV_ITEMS, 
  DEFAULT_SETTINGS, 
  MOCK_MENU_ITEMS, 
  MOCK_BRANCHES, 
  INITIAL_CATEGORIES,
  MOCK_SUPPLIERS,
  MOCK_ADDONS
} from './constants';
import { 
  Role, 
  BranchType, 
  OrderStatus, 
  PaymentMethod, 
  MenuItem, 
  Order, 
  OrderItem, 
  AddOn,
  Variant,
  AccountingEntry,
  RawMaterial,
  Supplier,
  WastageEntry,
  User as UserType,
  Category,
  Branch,
  BranchPriceOverride,
  WithdrawalRequest,
  Notification
} from './types';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, Legend
} from 'recharts';
import { GoogleGenAI } from "@google/genai";

// --- Utility: Filter Logic ---
const filterOrdersByCriteria = (orders: Order[], branchId: string, frequency: string, startDate: string, endDate: string) => {
  return orders.filter((order) => {
    if (branchId !== 'ALL' && order.branchId !== branchId) return false;
    const orderDate = new Date(order.createdAt);
    const now = new Date();

    if (frequency === 'DAILY') {
      if (orderDate.toDateString() !== now.toDateString()) return false;
    } else if (frequency === 'WEEKLY') {
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);
      if (orderDate < lastWeek) return false;
    } else if (frequency === 'MONTHLY') {
      if (orderDate.getMonth() !== now.getMonth() || orderDate.getFullYear() !== now.getFullYear()) return false;
    } else if (frequency === 'YEARLY') {
      if (orderDate.getFullYear() !== now.getFullYear()) return false;
    } else if (frequency === 'CUSTOM') {
      if (startDate && orderDate < new Date(startDate)) return false;
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        if (orderDate > end) return false;
      }
    }
    return true;
  });
};

// --- Utility: Image Resizer ---
const resizeImage = (file: File, maxWidth = 800, maxHeight = 600): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
    };
  });
};

// --- Persistent State Helper ---
const usePersistentState = (key: string, initialValue: any) => {
  const [state, setState] = useState(() => {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : initialValue;
  });
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(state));
  }, [key, state]);
  return [state, setState];
};

// --- AI: Dashboard Insights Module ---
const AIDashboardInsights = ({ stats, settings, branches }: any) => {
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const generateInsight = async () => {
    setLoading(true);
    try {
      // Use process.env.API_KEY directly as per SDK requirements
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const prompt = `
        As an Enterprise Restaurant Consultant, analyze this POS data and provide 3 brief, high-impact bullet points for business improvement:
        - Total Revenue: ${settings.currencySymbol}${stats.totalSales}
        - Total Orders: ${stats.totalOrders}
        - Branches: ${branches.map((b: any) => b.name).join(', ')}
        Period Activity: ${stats.totalOrders} transactions.
        Provide professional, actionable advice. Keep it under 100 words.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          systemInstruction: "You are a world-class hospitality data analyst. Format output as clean HTML bullet points."
        }
      });

      setInsight(response.text || "Insight generation failed.");
    } catch (err) {
      console.error(err);
      setInsight("Unable to reach AI Analyst. Ensure API_KEY is configured in Vercel settings.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-900 to-blue-800 p-8 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
        <BrainCircuit size={120} />
      </div>
      <div className="relative z-10 space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
            <Sparkles size={24} className="text-blue-300" />
          </div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-[0.3em] text-blue-200">AI Intelligence Core</h4>
            <p className="text-lg font-black tracking-tight">Enterprise Strategy Analyst</p>
          </div>
        </div>
        {insight ? (
          <div className="bg-white/5 backdrop-blur-xl p-6 rounded-[2rem] border border-white/10 animate-in fade-in zoom-in">
            <div className="text-sm font-medium leading-relaxed prose prose-invert" dangerouslySetInnerHTML={{ __html: insight }} />
            <button onClick={() => setInsight(null)} className="mt-6 text-[10px] font-black uppercase tracking-widest text-blue-300 hover:text-white transition-colors">← Refresh Analysis</button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-blue-100 font-medium max-w-md">Let our enterprise AI analyze your data to provide business growth strategy.</p>
            <button onClick={generateInsight} disabled={loading} className="flex items-center gap-3 px-8 py-4 bg-white text-blue-900 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-blue-50 transition-all active:scale-95 disabled:opacity-50">
              {loading ? <><Loader2 size={16} className="animate-spin" /> Analyzing Dynamics...</> : <><Sparkles size={16} /> Generate Strategic Insight</>}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Component: Login View ---
const LoginView = ({ onLogin, staff }: any) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const user = staff.find((u: any) => u.username === username && u.password === password);
    if (user) onLogin(user);
    else setError('Invalid credentials');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl p-10 space-y-8 border border-gray-100">
        <div className="text-center space-y-2">
          <div className="w-20 h-20 bg-blue-600 rounded-[2rem] flex items-center justify-center text-white mx-auto shadow-xl shadow-blue-200 mb-6"><Lock size={32} /></div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">RR Restro POS</h2>
          <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">Employee Terminal Access</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 text-xs font-black rounded-2xl animate-pulse">{error}</div>}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase ml-4">Username</label>
            <input type="text" className="w-full p-4 bg-gray-50 border-none rounded-[1.5rem] font-bold text-sm outline-none focus:ring-4 focus:ring-blue-50" placeholder="admin" value={username} onChange={e => setUsername(e.target.value)} required />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase ml-4">Access Secret</label>
            <input type="password" className="w-full p-4 bg-gray-50 border-none rounded-[1.5rem] font-bold text-sm outline-none focus:ring-4 focus:ring-blue-50" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="w-full py-5 bg-blue-600 text-white font-black rounded-[1.5rem] shadow-xl text-sm uppercase tracking-widest transition-all active:scale-95">Open Terminal</button>
        </form>
      </div>
    </div>
  );
};

// --- Shared: GlobalFilterBar ---
const GlobalFilterBar = ({ branches, filterBranchId, setFilterBranchId, filterFrequency, setFilterFrequency, startDate, setStartDate, endDate, setEndDate }: any) => (
  <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-wrap items-end gap-4">
    <div className="space-y-1.5 flex-1 min-w-[150px]">
      <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Branch Filter</label>
      <select value={filterBranchId} onChange={e => setFilterBranchId(e.target.value)} className="w-full bg-gray-50 text-gray-700 border border-gray-100 rounded-xl px-3 py-2 text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none">
        <option value="ALL">All Nodes</option>
        {branches.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
      </select>
    </div>
    <div className="space-y-1.5 flex-1 min-w-[150px]">
      <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Frequency</label>
      <select value={filterFrequency} onChange={e => setFilterFrequency(e.target.value)} className="w-full bg-gray-50 text-gray-700 border border-gray-100 rounded-xl px-3 py-2 text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none">
        <option value="ALL_TIME">All Time</option>
        <option value="DAILY">Daily</option>
        <option value="WEEKLY">Weekly</option>
        <option value="MONTHLY">Monthly</option>
        <option value="YEARLY">Yearly</option>
        <option value="CUSTOM">Custom Range</option>
      </select>
    </div>
    {filterFrequency === 'CUSTOM' && (
      <>
        <div className="space-y-1.5 flex-1 min-w-[150px]">
          <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">From</label>
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full bg-gray-50 text-gray-700 border border-gray-100 rounded-xl px-3 py-2 text-xs font-bold outline-none" />
        </div>
        <div className="space-y-1.5 flex-1 min-w-[150px]">
          <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">To</label>
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full bg-gray-50 text-gray-700 border border-gray-100 rounded-xl px-3 py-2 text-xs font-bold outline-none" />
        </div>
      </>
    )}
  </div>
);

// --- Component: Dashboard View ---
const DashboardView = ({ orders, settings, branches }: any) => {
  const [filterBranchId, setFilterBranchId] = useState('ALL');
  const [filterFrequency, setFilterFrequency] = useState('DAILY');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const stats = useMemo(() => {
    const filtered = filterOrdersByCriteria(orders, filterBranchId, filterFrequency, startDate, endDate);
    const totalSales = filtered.reduce((acc, o) => acc + o.total, 0);
    const totalOrders = filtered.length;
    const uniqueCustomers = new Set(filtered.map(o => o.customerPhone).filter(Boolean)).size;
    const chartData = [...Array(7)].map((_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (6 - i));
      const dayStr = d.toLocaleDateString();
      const daySales = filtered.filter(o => new Date(o.createdAt).toLocaleDateString() === dayStr).reduce((acc, o) => acc + o.total, 0);
      return { date: dayStr.split('/')[0] + '/' + dayStr.split('/')[1], sales: daySales };
    });
    return { totalSales, totalOrders, uniqueCustomers, chartData, filtered };
  }, [orders, filterBranchId, filterFrequency, startDate, endDate]);

  return (
    <div className="p-4 lg:p-8 space-y-8 h-full overflow-y-auto pb-32 no-scrollbar bg-gray-50/20">
      <GlobalFilterBar branches={branches} filterBranchId={filterBranchId} setFilterBranchId={setFilterBranchId} filterFrequency={filterFrequency} setFilterFrequency={setFilterFrequency} startDate={startDate} setStartDate={setStartDate} endDate={endDate} setEndDate={setEndDate} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-inner"><DollarSign size={24}/></div>
          <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Revenue</p><p className="text-xl font-black text-gray-900">{settings.currencySymbol}{stats.totalSales.toLocaleString()}</p></div>
        </div>
        <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner"><ShoppingCart size={24}/></div>
          <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Orders</p><p className="text-xl font-black text-gray-900">{stats.totalOrders}</p></div>
        </div>
        <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shadow-inner"><Users size={24}/></div>
          <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Customers</p><p className="text-xl font-black text-gray-900">{stats.uniqueCustomers}</p></div>
        </div>
        <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shadow-inner"><TrendingUp size={24}/></div>
          <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Avg. Ticket</p><p className="text-xl font-black text-gray-900">{settings.currencySymbol}{(stats.totalSales / (stats.totalOrders || 1)).toFixed(0)}</p></div>
        </div>
      </div>
      <AIDashboardInsights stats={stats} settings={settings} branches={branches} />
      <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm">
        <h4 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-8">Performance History</h4>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stats.chartData}>
              <defs><linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/><stop offset="95%" stopColor="#2563eb" stopOpacity={0}/></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: '#94a3b8'}} />
              <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: '#94a3b8'}} />
              <Tooltip contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.1)'}}/>
              <Area type="monotone" dataKey="sales" stroke="#2563eb" strokeWidth={4} fillOpacity={1} fill="url(#colorSales)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

// --- Placeholder Components for incomplete modules ---
const WalletView = () => <div className="p-10 text-center font-black text-gray-300">Wallet functionality active.</div>;
const POSView = () => <div className="p-10 text-center font-black text-gray-300">POS Terminal active.</div>;
const OrderHistoryView = () => <div className="p-10 text-center font-black text-gray-300">Order Logs active.</div>;
const BranchManagementView = () => <div className="p-10 text-center font-black text-gray-300">Branch Management active.</div>;
const InventoryView = () => <div className="p-10 text-center font-black text-gray-300">Inventory active.</div>;
const MenuSetupView = () => <div className="p-10 text-center font-black text-gray-300">Catalog active.</div>;
const CustomersView = () => <div className="p-10 text-center font-black text-gray-300">Patron Registry active.</div>;
const StaffManagementView = () => <div className="p-10 text-center font-black text-gray-300">Personnel active.</div>;
const AccountingView = () => <div className="p-10 text-center font-black text-gray-300">Ledger active.</div>;
const ReportsView = () => <div className="p-10 text-center font-black text-gray-300">Forensics active.</div>;
const SettingsView = () => <div className="p-10 text-center font-black text-gray-300">Config active.</div>;

// --- Component: Sidebar ---
const Sidebar = ({ activeTab, setActiveTab, isOpen, setIsOpen, settings, currentUser, onLogout }: any) => (
  <>
    <div className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsOpen(false)} />
    <aside className={`fixed top-0 left-0 bottom-0 w-64 bg-white border-r border-gray-100 z-50 transition-transform duration-300 transform lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col`}>
      <div className="p-8 shrink-0 flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-100"><Flame size={20} fill="currentColor" /></div>
        <div><h1 className="text-sm font-black text-gray-900 tracking-tighter leading-none">{settings.appName}</h1><p className="text-[8px] font-black text-blue-600 uppercase tracking-widest mt-1">Enterprise Core</p></div>
      </div>
      <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
        {NAV_ITEMS.map((item) => (
          <button key={item.id} onClick={() => { setActiveTab(item.id); setIsOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all group ${activeTab === item.id ? 'bg-blue-600 text-white shadow-xl' : 'text-gray-400 hover:bg-gray-50'}`}>
            <span className="transition-transform group-hover:scale-110">{item.icon}</span><span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
          </button>
        ))}
      </nav>
      <div className="p-4 border-t border-gray-50"><button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-4 rounded-2xl text-rose-500 hover:bg-rose-50 transition-all group"><LogOut size={20}/><span className="text-[10px] font-black uppercase tracking-widest">Logout</span></button></div>
    </aside>
  </>
);

// --- Component: Header ---
const Header = ({ title, toggleSidebar, branches, currentUser, notifications }: any) => (
  <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-4 lg:px-8 shrink-0 z-30">
    <div className="flex items-center gap-4">
      <button onClick={toggleSidebar} className="lg:hidden p-2 hover:bg-gray-100 rounded-xl transition-all text-gray-500"><Menu size={24} /></button>
      <div><h2 className="text-lg font-black text-gray-900 uppercase tracking-tighter leading-none">{title}</h2><div className="flex items-center gap-2 mt-1"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /><p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Active System State</p></div></div>
    </div>
    <div className="flex items-center gap-3 md:gap-6">
      <div className="hidden sm:flex items-center bg-gray-50 rounded-2xl px-3 py-1.5 border border-gray-100"><Building2 size={16} className="text-gray-400 mr-2" /><span className="text-[10px] font-black uppercase text-gray-700">{branches[0]?.name || 'Main Node'}</span></div>
      <button className="p-3 rounded-2xl bg-white text-gray-400 border border-gray-100 hover:bg-gray-50 relative"><Bell size={20} />{notifications?.length > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />}</button>
      <div className="flex items-center gap-3 pl-6 border-l border-gray-100">
        <div className="text-right hidden sm:block"><p className="text-[10px] font-black text-gray-900 uppercase leading-none">{currentUser.name}</p><p className="text-[8px] font-bold text-gray-400 mt-1 uppercase">{currentUser.role.replace('_', ' ')}</p></div>
        <div className="w-10 h-10 md:w-12 md:h-12 rounded-[1rem] bg-blue-50 text-blue-600 flex items-center justify-center font-black text-sm">{currentUser.name.charAt(0)}</div>
      </div>
    </div>
  </header>
);

// --- Main App Component ---
export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [settings] = usePersistentState('app-settings', DEFAULT_SETTINGS);
  const [branches] = usePersistentState('app-branches', MOCK_BRANCHES);
  const [orders] = usePersistentState('orders-list', []);
  const [currentUser, setCurrentUser] = usePersistentState('current-user', null);
  const [staff] = usePersistentState('staff-list', [{ id: '1', name: 'Super Admin', username: 'admin', password: 'password', role: Role.SUPER_ADMIN, assignedBranchIds: ['b1'] }]);

  if (!currentUser) return <LoginView onLogin={setCurrentUser} staff={staff} />;

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <DashboardView orders={orders} settings={settings} branches={branches} />;
      case 'pos': return <POSView />;
      case 'orders': return <OrderHistoryView />;
      case 'wallet': return <WalletView />;
      case 'branches': return <BranchManagementView />;
      case 'inventory': return <InventoryView />;
      case 'menu': return <MenuSetupView />;
      case 'customers': return <CustomersView />;
      case 'staff': return <StaffManagementView />;
      case 'accounting': return <AccountingView />;
      case 'reports': return <ReportsView />;
      case 'settings': return <SettingsView />;
      default: return <DashboardView orders={orders} settings={settings} branches={branches} />;
    }
  };

  return (
    <div className="h-screen w-full bg-gray-50 flex overflow-hidden">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} settings={settings} currentUser={currentUser} onLogout={() => setCurrentUser(null)} />
      <main className="flex-1 lg:pl-64 flex flex-col h-full transition-all duration-300 relative overflow-hidden">
        <Header title={NAV_ITEMS.find(n => n.id === activeTab)?.label} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} branches={branches} currentUser={currentUser} />
        <div className="flex-1 overflow-hidden relative h-full">{renderContent()}</div>
      </main>
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes zoom-in { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .animate-in { animation-duration: 0.3s; animation-fill-mode: both; }
      `}</style>
    </div>
  );
}
