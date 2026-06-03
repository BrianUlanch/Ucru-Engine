import { useState, useRef } from 'react';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { 
  Cpu, Activity, Globe, Download, Upload, AlertOctagon, FileText, 
  Image as ImageIcon, Search, Target, TrendingUp, Ship, 
  Bot, ChevronDown, CheckCircle2, Loader2
} from 'lucide-react';

const MOCK_PARTS = [
  {
    id: 'PRT-992-A',
    name: 'Industrial Servo Motor 5kW',
    category: 'Electromechanical',
    specs: {
      power: '5kW',
      voltage: '400V AC',
      torque: '15 Nm Nominal',
      ipRating: 'IP65',
      weight: '12.5 kg'
    },
    currentBuy: 1250,
    unitPrice: 845.00,
    imageUrl: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=400&h=300',
    globalLocations: [
      { name: 'Taiwan', value: 65, color: '#2563eb' },
      { name: 'Mexico', value: 25, color: '#7c3aed' },
      { name: 'Germany', value: 10, color: '#10b981' }
    ],
    marketTrend: [
      { month: 'Jan', price: 820 }, { month: 'Feb', price: 825 },
      { month: 'Mar', price: 835 }, { month: 'Apr', price: 840 },
      { month: 'May', price: 845 }, { month: 'Jun', price: 845 }
    ]
  },
  {
    id: 'PRT-104-B',
    name: 'Precision Aluminum Housing',
    category: 'Machined Parts',
    specs: {
      material: 'AL 6061-T6',
      tolerance: '+/- 0.005mm',
      finish: 'Clear Anodized',
      weight: '2.1 kg'
    },
    currentBuy: 5400,
    unitPrice: 112.50,
    imageUrl: 'https://images.unsplash.com/photo-1537151377170-9c19a791bbea?auto=format&fit=crop&q=80&w=400&h=300',
    globalLocations: [
      { name: 'Vietnam', value: 80, color: '#2563eb' },
      { name: 'USA', value: 20, color: '#10b981' }
    ],
    marketTrend: [
      { month: 'Jan', price: 105 }, { month: 'Feb', price: 108 },
      { month: 'Mar', price: 115 }, { month: 'Apr', price: 118 },
      { month: 'May', price: 114 }, { month: 'Jun', price: 112.50 }
    ]
  }
];

const MOCK_IMPORT_YETI_DATA = [
  { date: '2026-05-12', supplier: 'Shenzhen Precision Tech Co.', buyer: 'Competitor Robotics LLC', portOfLading: 'Yantian, CN', portOfUnlading: 'Long Beach, US', weight: '14,500 kg', hsCode: '8501.52' },
  { date: '2026-05-08', supplier: 'Taiwan Electro-Mech Ltd.', buyer: 'Global Automation Inc', portOfLading: 'Kaohsiung, TW', portOfUnlading: 'Los Angeles, US', weight: '8,200 kg', hsCode: '8501.52' },
  { date: '2026-04-28', supplier: 'Shenzhen Precision Tech Co.', buyer: 'Ucru (Internal)', portOfLading: 'Yantian, CN', portOfUnlading: 'Oakland, US', weight: '12,000 kg', hsCode: '8501.52' },
];

export default function UcruProcurementEngine() {
  const [activePart, setActivePart] = useState(MOCK_PARTS[0]);
  const [simulatedVolume, setSimulatedVolume] = useState(MOCK_PARTS[0].currentBuy);
  const [activeTab, setActiveTab] = useState('digital-twin');
  const [isImporting, setIsImporting] = useState(false);
  const [autoNegotiateEnabled, setAutoNegotiateEnabled] = useState(false);
  const fileInputRef = useRef(null);

  // AI Trigger: Anomaly & Opportunity Detection (Derived State)
  const surgeThreshold = activePart.currentBuy * 1.3; // 30% increase
  const showAlert = simulatedVolume > surgeThreshold;

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(activePart, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", `ucru_export_${activePart.id}.json`);
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsImporting(true);
      setTimeout(() => {
        setIsImporting(false);
        alert(`Successfully ingested data from ${e.target.files[0].name}. AI normalizing taxonomy...`);
      }, 1500);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-50 font-sans selection:bg-blue-500/30">
      {/* Hidden File Input for Import */}
      <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} accept=".csv, .xlsx, .json" />

      {/* TOP NAVIGATION */}
      <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 tracking-tight">
                UCRU ENGINE
              </h1>
              <p className="text-xs text-slate-400 font-medium tracking-wider uppercase">AI Procurement Value System</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <select 
                className="appearance-none bg-slate-800 border border-slate-600 text-slate-200 py-2 pl-4 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer font-medium"
                value={activePart.id}
                onChange={(e) => {
                  const part = MOCK_PARTS.find(p => p.id === e.target.value);
                  setActivePart(part);
                  setSimulatedVolume(part.currentBuy);
                }}
              >
                {MOCK_PARTS.map(part => (
                  <option key={part.id} value={part.id}>{part.id} - {part.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>

            <button onClick={handleImportClick} className="flex items-center space-x-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg transition-colors text-sm font-medium">
              {isImporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4 text-blue-400" />}
              <span>Import ERP</span>
            </button>
            <button onClick={handleExport} className="flex items-center space-x-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg transition-colors text-sm font-medium">
              <Download className="w-4 h-4 text-green-400" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </header>

      {/* ALERT BANNER - AI TRIGGER */}
      {showAlert && (
        <div className="bg-red-500/10 border-b border-red-500/20 animate-in slide-in-from-top-4 duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-500/20 rounded-full animate-pulse">
                <AlertOctagon className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-red-400 uppercase tracking-wider">AI Trigger: Opportunity Assessment</h3>
                <p className="text-slate-200 text-sm mt-0.5">
                  Volume surge detected ({simulatedVolume} units vs avg {activePart.currentBuy}). 
                  <span className="font-semibold text-white"> Recommended Action: Negotiate with suppliers for tiered pricing discounts.</span>
                </p>
              </div>
            </div>
            <button 
              onClick={() => setAutoNegotiateEnabled(true)}
              className={`px-4 py-2 rounded-lg text-sm font-bold shadow-lg transition-all flex items-center space-x-2 ${
                autoNegotiateEnabled 
                ? 'bg-green-500/20 text-green-400 border border-green-500/50 cursor-default'
                : 'bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white'
              }`}
            >
              {autoNegotiateEnabled ? (
                <><CheckCircle2 className="w-4 h-4" /> <span>Bot Negotiating...</span></>
              ) : (
                <><Bot className="w-4 h-4" /> <span>Auto-Negotiate (Bypass Team)</span></>
              )}
            </button>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* TABS */}
        <div className="flex space-x-1 p-1 bg-slate-800/50 rounded-xl backdrop-blur-sm border border-slate-700/50 w-fit">
          <button 
            onClick={() => setActiveTab('digital-twin')}
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'digital-twin' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'}`}
          >
            <Cpu className="w-4 h-4" />
            <span>2. Digital Twin</span>
          </button>
          <button 
            onClick={() => setActiveTab('market-intel')}
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'market-intel' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'}`}
          >
            <Globe className="w-4 h-4" />
            <span>6. Market Intelligence (ImportYeti)</span>
          </button>
        </div>

        {activeTab === 'digital-twin' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            {/* ROW 1: Part Info & PDF Viewer */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Part Profile */}
              <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-xl flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-white">{activePart.id}</h2>
                    <p className="text-slate-400">{activePart.name}</p>
                  </div>
                  <span className="px-3 py-1 text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full">
                    {activePart.category}
                  </span>
                </div>
                
                <div className="relative h-48 w-full rounded-xl overflow-hidden mb-6 border border-slate-700 bg-slate-900 group">
                  <img src={activePart.imageUrl} alt={activePart.name} className="object-cover w-full h-full opacity-80 group-hover:opacity-100 transition-opacity mix-blend-luminosity hover:mix-blend-normal" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
                  <div className="absolute bottom-3 left-3 flex items-center space-x-2 text-xs font-medium text-slate-300">
                    <ImageIcon className="w-4 h-4" />
                    <span>Reference Image</span>
                  </div>
                </div>

                <div className="flex-grow">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Specifications</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(activePart.specs).map(([key, value]) => (
                      <div key={key} className="bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
                        <p className="text-xs text-slate-500 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                        <p className="text-sm font-medium text-slate-200 mt-1">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* PDF Shop Print Viewer */}
              <div className="lg:col-span-2 bg-slate-800 border border-slate-700 rounded-2xl shadow-xl flex flex-col overflow-hidden relative">
                <div className="bg-slate-900 px-4 py-3 border-b border-slate-700 flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-5 h-5 text-blue-400" />
                    <span className="font-medium text-slate-200">Shop_Print_{activePart.id}_v2.pdf</span>
                  </div>
                  <div className="flex space-x-2">
                    <button className="p-1.5 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-colors">-</button>
                    <span className="p-1.5 text-sm text-slate-400 font-mono">100%</span>
                    <button className="p-1.5 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-colors">+</button>
                  </div>
                </div>
                
                {/* Mock Blueprint Background */}
                <div className="flex-grow bg-[#0a192f] p-8 relative overflow-hidden" 
                     style={{
                       backgroundImage: `linear-gradient(rgba(37, 99, 235, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(37, 99, 235, 0.1) 1px, transparent 1px)`,
                       backgroundSize: '20px 20px'
                     }}>
                  
                  {/* Decorative Blueprint Elements */}
                  <div className="absolute inset-8 border-2 border-blue-500/20 rounded p-4 flex flex-col justify-between">
                    <div className="flex justify-between border-b border-blue-500/20 pb-2">
                      <div className="text-blue-400/50 font-mono text-xs">UCRU ENGINEERING</div>
                      <div className="text-blue-400/50 font-mono text-xs">DWG NO: {activePart.id}</div>
                    </div>
                    
                    <div className="flex-grow flex items-center justify-center">
                      <div className="w-64 h-64 border-2 border-dashed border-blue-400/30 rounded-full flex items-center justify-center relative">
                         <div className="absolute w-full h-[2px] bg-blue-400/20"></div>
                         <div className="absolute h-full w-[2px] bg-blue-400/20"></div>
                         <div className="text-blue-400/40 font-mono text-xl rotate-45">ISOMETRIC VIEW</div>
                      </div>
                    </div>

                    <div className="flex justify-between border-t border-blue-500/20 pt-2">
                      <div className="text-blue-400/50 font-mono text-xs">SCALE: 1:1</div>
                      <div className="text-blue-400/50 font-mono text-xs">REV: B</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ROW 2: Spend & Global Sourcing */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Current Buy & Simulation */}
              <div className="lg:col-span-2 bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-xl">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                    <Target className="w-5 h-5 text-orange-400" />
                    <span>Spend Analytics & Simulation</span>
                  </h3>
                  <div className="text-right">
                    <p className="text-sm text-slate-400">Current Unit Price</p>
                    <p className="text-2xl font-mono text-green-400">${activePart.unitPrice.toFixed(2)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div className="bg-slate-900/50 rounded-xl p-5 border border-slate-700/50">
                    <p className="text-sm text-slate-400 mb-1">Current Annual Volume</p>
                    <p className="text-3xl font-bold text-white">{activePart.currentBuy.toLocaleString()} <span className="text-sm font-normal text-slate-500">units</span></p>
                  </div>
                  <div className="bg-blue-500/10 rounded-xl p-5 border border-blue-500/20">
                    <p className="text-sm text-blue-300 mb-1">Simulated Next Qtr Demand</p>
                    <p className="text-3xl font-bold text-blue-400">{simulatedVolume.toLocaleString()} <span className="text-sm font-normal text-blue-500/50">units</span></p>
                  </div>
                </div>

                {/* The Simulator Slider */}
                <div className="space-y-4">
                  <div className="flex justify-between text-sm font-medium">
                    <span className="text-slate-400">Demand Simulation Tool</span>
                    <span className="text-slate-400">Scale: 0 - 10,000</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="10000" 
                    step="50"
                    value={simulatedVolume}
                    onChange={(e) => setSimulatedVolume(Number(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                  <p className="text-xs text-slate-500 italic flex items-center">
                    <Bot className="w-3 h-3 mr-1" />
                    Drag slider to simulate demand spikes. The engine will automatically detect volume anomalies and propose supplier negotiations.
                  </p>
                </div>
              </div>

              {/* Global Footprint */}
              <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-xl">
                <h3 className="text-lg font-bold text-white mb-2">Global Sourcing</h3>
                <p className="text-sm text-slate-400 mb-6">Am I buying anywhere else in the world?</p>
                
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={activePart.globalLocations}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {activePart.globalLocations.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip 
                        contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                        itemStyle={{ color: '#f8fafc' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="mt-4 space-y-3">
                  {activePart.globalLocations.map(loc => (
                    <div key={loc.name} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: loc.color }}></div>
                        <span className="text-sm font-medium text-slate-300">{loc.name}</span>
                      </div>
                      <span className="text-sm font-bold text-white">{loc.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'market-intel' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            
            {/* Macro Trends */}
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-xl">
               <h3 className="text-lg font-bold text-white flex items-center space-x-2 mb-6">
                <TrendingUp className="w-5 h-5 text-purple-400" />
                <span>Macro Market Cost Index for {activePart.category}</span>
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={activePart.marketTrend}>
                    <defs>
                      <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#7c3aed" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis dataKey="month" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
                    <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8' }} domain={['dataMin - 10', 'dataMax + 10']} />
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                      itemStyle={{ color: '#f8fafc' }}
                      formatter={(value) => [`$${value}`, 'Market Price']}
                    />
                    <Area type="monotone" dataKey="price" stroke="#7c3aed" strokeWidth={3} fillOpacity={1} fill="url(#colorPrice)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                <p className="text-sm text-purple-200">
                  <span className="font-bold">AI Insight:</span> Market prices for {activePart.category} are showing an upward trend due to raw material constraints. 
                  <span className="block mt-1">Strategic Recommendation: Lock in long-term contracts now or utilize the ImportYeti integration below to discover alternative suppliers with better capacity.</span>
                </p>
              </div>
            </div>

            {/* ImportYeti Integration Mockup */}
            <div className="bg-[#121a2f] border border-[#233554] rounded-2xl overflow-hidden shadow-2xl relative">
              
              {/* ImportYeti Header */}
              <div className="bg-[#0b1120] px-6 py-4 border-b border-[#233554] flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">
                    <Ship className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white tracking-wide">ImportYeti <span className="text-blue-400 font-normal">Data Stream</span></h3>
                    <p className="text-xs text-slate-500">Live Bill of Lading & Supplier Discovery</p>
                  </div>
                </div>
                <a href="https://www.importyeti.com/" target="_blank" rel="noreferrer" className="text-xs font-medium text-blue-400 hover:text-blue-300 flex items-center border border-blue-500/30 px-3 py-1.5 rounded bg-blue-500/10 transition-colors">
                  Open Native App <ExternalLinkIcon className="w-3 h-3 ml-1" />
                </a>
              </div>

              {/* Data Table */}
              <div className="p-6">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="relative flex-grow">
                    <Search className="absolute left-3 top-2.5 w-5 h-5 text-slate-500" />
                    <input 
                      type="text" 
                      value={`HS Code: 8501.52 (Motors) OR Category: ${activePart.category}`}
                      readOnly
                      className="w-full bg-[#0b1120] border border-[#233554] rounded-lg py-2.5 pl-10 pr-4 text-sm text-slate-300 focus:outline-none"
                    />
                  </div>
                  <button className="px-4 py-2.5 bg-[#233554] hover:bg-[#2d4263] text-white rounded-lg text-sm font-medium transition-colors">
                    Run Custom Query
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-400">
                    <thead className="text-xs text-slate-300 uppercase bg-[#0b1120]">
                      <tr>
                        <th className="px-4 py-3 rounded-tl-lg">Date</th>
                        <th className="px-4 py-3">Supplier</th>
                        <th className="px-4 py-3">Buyer (Competitor)</th>
                        <th className="px-4 py-3">Weight</th>
                        <th className="px-4 py-3 rounded-tr-lg">Route</th>
                      </tr>
                    </thead>
                    <tbody>
                      {MOCK_IMPORT_YETI_DATA.map((row, idx) => (
                        <tr key={idx} className="border-b border-[#233554] hover:bg-[#1a2642] transition-colors">
                          <td className="px-4 py-4 whitespace-nowrap font-mono">{row.date}</td>
                          <td className="px-4 py-4 font-medium text-slate-200">{row.supplier}</td>
                          <td className="px-4 py-4">
                            {row.buyer.includes('Internal') 
                              ? <span className="px-2 py-1 bg-green-500/10 text-green-400 rounded border border-green-500/20 text-xs">US</span>
                              : <span className="text-orange-400">{row.buyer}</span>
                            }
                          </td>
                          <td className="px-4 py-4">{row.weight}</td>
                          <td className="px-4 py-4 text-xs text-slate-500">{row.portOfLading} ➔ {row.portOfUnlading}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

          </div>
        )}

      </main>
    </div>
  );
}

function ExternalLinkIcon(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
      <polyline points="15 3 21 3 21 9"></polyline>
      <line x1="10" y1="14" x2="21" y2="3"></line>
    </svg>
  );
}