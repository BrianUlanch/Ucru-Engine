import { useState, useEffect, useRef } from 'react';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, BarChart, Bar, Legend
} from 'recharts';
import { 
  Cpu, Activity, Globe, Download, Upload, AlertOctagon, FileText, 
  Image as ImageIcon, Search, Target, TrendingUp, Ship, 
  Bot, ChevronDown, CheckCircle2, Loader2, Shield, Database,
  Layers, DollarSign, Send, Award, Scale, Users, RefreshCw,
  Sliders, ChevronRight, AlertTriangle, Play, HelpCircle, ArrowUpRight
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
    shouldCostBase: 680.00,
    globalLocations: [
      { name: 'Taiwan', value: 65, color: '#143272' },
      { name: 'Mexico', value: 25, color: '#ed6f23' },
      { name: 'Germany', value: 10, color: '#2c3d5a' }
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
    shouldCostBase: 88.00,
    globalLocations: [
      { name: 'Vietnam', value: 80, color: '#143272' },
      { name: 'USA', value: 20, color: '#ed6f23' }
    ],
    marketTrend: [
      { month: 'Jan', price: 105 }, { month: 'Feb', price: 108 },
      { month: 'Mar', price: 115 }, { month: 'Apr', price: 118 },
      { month: 'May', price: 114 }, { month: 'Jun', price: 112.50 }
    ]
  },
  {
    id: 'PRT-441-C',
    name: 'Multicore Copper Cable 12AWG',
    category: 'Electrical Connectors',
    specs: {
      conductor: 'Bare Copper',
      cores: '4 Cores',
      jacket: 'PVC Black',
      voltageRating: '600V',
      length: '100m Spool'
    },
    currentBuy: 3200,
    unitPrice: 245.00,
    shouldCostBase: 195.00,
    globalLocations: [
      { name: 'China', value: 70, color: '#143272' },
      { name: 'Mexico', value: 30, color: '#ed6f23' }
    ],
    marketTrend: [
      { month: 'Jan', price: 230 }, { month: 'Feb', price: 232 },
      { month: 'Mar', price: 238 }, { month: 'Apr', price: 245 },
      { month: 'May', price: 248 }, { month: 'Jun', price: 245 }
    ]
  }
];

const MOCK_RAW_ERP_DATA = [
  { id: 1, rawDesc: "IND SERVO MTR 5KW 400V AC IP65", cleanName: "Industrial Servo Motor 5kW", category: "Electromechanical", supplier: "TAIWAN E-MECH", confidence: 0.98, status: "Pending" },
  { id: 2, rawDesc: "AL HOUSING PREC CNC TOL 0.005", cleanName: "Precision Aluminum Housing", category: "Machined Parts", supplier: "SZ PRECISION TECH", confidence: 0.95, status: "Pending" },
  { id: 3, rawDesc: "COPPER CABLE 12AWG MULTICORE 100M", cleanName: "Multicore Copper Cable 12AWG", category: "Electrical Connectors", supplier: "SHENZHEN CABLE CO", confidence: 0.92, status: "Pending" },
  { id: 4, rawDesc: "STEEL BRACKET MOUNT FLANGE V3", cleanName: "Steel Mounting Flange Bracket", category: "Hardware", supplier: "UNKOWN SUPPLIER", confidence: 0.54, status: "Anomaly" }
];

const MOCK_IMPORT_YETI_DATA = [
  { date: '2026-05-12', supplier: 'Shenzhen Precision Tech Co.', buyer: 'Competitor Robotics LLC', portOfLading: 'Yantian, CN', portOfUnlading: 'Long Beach, US', weight: '14,500 kg', hsCode: '8501.52' },
  { date: '2026-05-08', supplier: 'Taiwan Electro-Mech Ltd.', buyer: 'Global Automation Inc', portOfLading: 'Kaohsiung, TW', portOfUnlading: 'Los Angeles, US', weight: '8,200 kg', hsCode: '8501.52' },
  { date: '2026-04-28', supplier: 'Shenzhen Precision Tech Co.', buyer: 'Ucru (Internal)', portOfLading: 'Yantian, CN', portOfUnlading: 'Oakland, US', weight: '12,000 kg', hsCode: '8501.52' },
];

const MOCK_SUPPLIERS = [
  { name: 'Taiwan Electro-Mech Ltd.', quality: 96, delivery: 94, esg: 88, risk: 'Low', status: 'Approved' },
  { name: 'Shenzhen Precision Tech Co.', quality: 92, delivery: 89, esg: 78, risk: 'Medium', status: 'Under Review' },
  { name: 'Vietnam Machining Partners', quality: 88, delivery: 91, esg: 82, risk: 'Low', status: 'Approved' },
  { name: 'Global Automation Inc.', quality: 95, delivery: 97, esg: 90, risk: 'Low', status: 'Strategic Partner' }
];

export default function UcruProcurementEngine() {
  const [activePart, setActivePart] = useState(MOCK_PARTS[0]);
  const [simulatedVolume, setSimulatedVolume] = useState(MOCK_PARTS[0].currentBuy);
  const [activeStep, setActiveStep] = useState(2); // Start at Digital Twin (Step 2)
  const [isImporting, setIsImporting] = useState(false);
  const [autoNegotiateEnabled, setAutoNegotiateEnabled] = useState(false);
  
  // Step 1: Data Cleansing State
  const [erpData, setErpData] = useState(MOCK_RAW_ERP_DATA);
  const [isNormalizing, setIsNormalizing] = useState(false);
  const [qualityScore, setQualityScore] = useState(78);

  // Step 3: Should Cost State
  const [materialFactor, setMaterialFactor] = useState(100);
  const [laborFactor, setLaborFactor] = useState(100);
  const [overheadFactor, setOverheadFactor] = useState(100);
  const [logisticsFactor, setLogisticsFactor] = useState(100);

  // Step 4: RFQ State
  const [rfqStatus, setRfqStatus] = useState('idle'); // idle, ready, sending, published
  
  // Step 7: Bot Negotiation Logs State
  const [negotiationLogs, setNegotiationLogs] = useState([]);
  const [isNegotiating, setIsNegotiating] = useState(false);

  const fileInputRef = useRef(null);
  const terminalEndRef = useRef(null);

  // Handle active part switch
  useEffect(() => {
    setSimulatedVolume(activePart.currentBuy);
    setMaterialFactor(100);
    setLaborFactor(100);
    setOverheadFactor(100);
    setLogisticsFactor(100);
    setRfqStatus('idle');
  }, [activePart]);

  // Handle bot negotiation log auto scroll
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [negotiationLogs]);

  // Derived should-cost calculation
  const shouldCostMultiplier = (
    (materialFactor / 100) * 0.45 +
    (laborFactor / 100) * 0.25 +
    (overheadFactor / 100) * 0.15 +
    (logisticsFactor / 100) * 0.15
  );
  
  const currentShouldCost = activePart.shouldCostBase * shouldCostMultiplier;
  const unitSavings = Math.max(0, activePart.unitPrice - currentShouldCost);
  const totalAnnualSavings = unitSavings * simulatedVolume;
  const savingsPercent = ((unitSavings / activePart.unitPrice) * 100);

  // AI Trigger check (derived state)
  const surgeThreshold = activePart.currentBuy * 1.3;
  const showAlert = simulatedVolume > surgeThreshold;

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
      activePart,
      shouldCost: currentShouldCost,
      annualSavings: totalAnnualSavings,
      volume: simulatedVolume
    }, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `ucru_value_report_${activePart.id}.json`);
    document.body.appendChild(downloadAnchorNode);
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
        // Add a new messy ERP record
        const newRecord = {
          id: erpData.length + 1,
          rawDesc: "CNC MACHINED FLANGE AL6061 SHZ",
          cleanName: "Machined Aluminum Flange",
          category: "Machined Parts",
          supplier: "PENDING SUPPLIER",
          confidence: 0.48,
          status: "Pending"
        };
        setErpData([newRecord, ...erpData]);
        setQualityScore(72); // Lower quality score until normalized
        setActiveStep(1); // Jump to Step 1 to show imported data
        alert(`Ingested data from ${e.target.files[0].name}. ERP data added to Step 1 Workbench.`);
      }, 1500);
    }
  };

  // Run Step 1 data normalization
  const runNormalization = () => {
    setIsNormalizing(true);
    setTimeout(() => {
      setIsNormalizing(false);
      setErpData(erpData.map(item => ({
        ...item,
        status: "Cleansed",
        confidence: Math.max(item.confidence, 0.96)
      })));
      setQualityScore(99);
    }, 2000);
  };

  // Step 4: RFQ generation
  const handleRfqGenerate = () => {
    setRfqStatus('sending');
    setTimeout(() => {
      setRfqStatus('ready');
    }, 1500);
  };

  const handleRfqPublish = () => {
    setRfqStatus('sending');
    setTimeout(() => {
      setRfqStatus('published');
    }, 2000);
  };

  // Step 7: Bot Negotiation trigger
  const runBotNegotiation = () => {
    if (isNegotiating) return;
    setIsNegotiating(true);
    setNegotiationLogs([]);
    
    const logs = [
      `[AI BOT] Initiating autonomous negotiation protocol with active suppliers for ${activePart.name}...`,
      `[AI BOT] Base Unit Price: $${activePart.unitPrice.toFixed(2)} | Target Should-Cost: $${currentShouldCost.toFixed(2)}`,
      `[AI BOT] Supplier: Taiwan Electro-Mech Ltd. contacted via API portal.`,
      `[TAIWAN MECH] "Standard unit price for ${simulatedVolume} units is $${activePart.unitPrice.toFixed(2)}. Best rate we can offer is $${(activePart.unitPrice * 0.96).toFixed(2)}."`,
      `[AI BOT] Counter-proposal: Forecast volume indicates surge of ${(simulatedVolume).toLocaleString()} units. Targeting should-cost benchmark. Committing to full allocation if unit price is $${(currentShouldCost * 1.05).toFixed(2)}.`,
      `[TAIWAN MECH] "Analyzing capacity... We can support contract discount. Best adjusted unit price is $${(currentShouldCost * 1.07).toFixed(2)} based on volume commitment."`,
      `[AI BOT] Proposal ACCEPTED: Settled price at $${(currentShouldCost * 1.07).toFixed(2)} (Savings of $${(activePart.unitPrice - (currentShouldCost * 1.07)).toFixed(2)} per unit).`,
      `[AI BOT] Contract draft generated. Sending to legal router. Sourcing cycle reduced by 92%.`
    ];

    let currentLogIndex = 0;
    const interval = setInterval(() => {
      if (currentLogIndex < logs.length) {
        setNegotiationLogs(prev => [...prev, logs[currentLogIndex]]);
        currentLogIndex++;
      } else {
        clearInterval(interval);
        setIsNegotiating(false);
        setAutoNegotiateEnabled(true);
      }
    }, 1200);
  };

  const stepsList = [
    { num: 1, name: 'Data Cleansing & Normalization', desc: 'Dedupe, taxonomy & quality', icon: Database, bgClass: 'bg-indigo-600', color: '#6366f1' },
    { num: 2, name: 'Digital Twin (Part Intelligence)', desc: 'Specs, cost, demand & design twin', icon: Layers, bgClass: 'bg-ucru-blue', color: '#143272' },
    { num: 3, name: 'Should-Cost Modeling', desc: 'AI benchmarks vs market actuals', icon: DollarSign, bgClass: 'bg-violet-600', color: '#8b5cf6' },
    { num: 4, name: 'One-Click RFQ Execution', desc: 'Auto supplier matching & RFQ package', icon: Send, bgClass: 'bg-ucru-orange', color: '#ed6f23' },
    { num: 5, name: 'Supplier Assessment & Mining', desc: 'Quality, risk, ESG & global search', icon: Award, bgClass: 'bg-amber-600', color: '#d97706' },
    { num: 6, name: 'Market Intelligence', desc: 'ImportYeti shipping stream & trends', icon: Globe, bgClass: 'bg-emerald-600', color: '#059669' },
    { num: 7, name: 'Opportunity Assessment', desc: 'Volume scenario simulator & bot negotiate', icon: Target, bgClass: 'bg-cyan-600', color: '#0891b2' }
  ];

  return (
    <div className="min-h-screen bg-ucru-dark text-slate-200 font-sans selection:bg-ucru-orange/30">
      
      {/* Hidden File Input for ERP Import */}
      <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} accept=".csv, .xlsx, .json" />

      {/* HEADER SECTION */}
      <header className="sticky top-0 z-50 bg-ucru-dark/95 backdrop-blur-md border-b border-ucru-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <img src="/ucru-logo.jpg" alt="UCRU Logo" className="w-12 h-12 rounded-lg border border-ucru-border object-cover" />
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-black text-ucru-orange tracking-tight">U</span>
                <span className="text-2xl font-black text-slate-100 tracking-tight">CRU</span>
                <span className="text-lg font-semibold text-slate-400 pl-1 border-l border-slate-700">ENGINE</span>
              </div>
              <p className="text-xs text-slate-400 font-medium tracking-wider uppercase">AI-Powered Procurement Value System</p>
            </div>
          </div>

          {/* ERP Dropdowns and Actions */}
          <div className="flex items-center space-x-3">
            <div className="relative">
              <select 
                className="appearance-none bg-slate-900/80 border border-ucru-border text-slate-200 py-2 pl-4 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-ucru-orange cursor-pointer font-medium text-sm"
                value={activePart.id}
                onChange={(e) => {
                  const part = MOCK_PARTS.find(p => p.id === e.target.value);
                  setActivePart(part);
                }}
              >
                {MOCK_PARTS.map(part => (
                  <option key={part.id} value={part.id}>{part.id} - {part.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>

            <button onClick={handleImportClick} className="flex items-center space-x-2 px-4 py-2 bg-slate-900 border border-ucru-border hover:bg-slate-800 rounded-lg transition-colors text-sm font-medium">
              {isImporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4 text-ucru-orange" />}
              <span>Import ERP</span>
            </button>
            <button onClick={handleExport} className="flex items-center space-x-2 px-4 py-2 bg-slate-900 border border-ucru-border hover:bg-slate-800 rounded-lg transition-colors text-sm font-medium">
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Export Report</span>
            </button>
          </div>
        </div>

        {/* 5 Core Principles Sub-Header Banner */}
        <div className="bg-slate-950/70 border-t border-ucru-border py-2 text-xs font-semibold text-slate-400 tracking-wider">
          <div className="max-w-7xl mx-auto px-4 flex flex-wrap justify-between items-center gap-2">
            <div className="flex items-center space-x-1.5"><Bot className="w-3.5 h-3.5 text-ucru-orange" /> <span>AI-DRIVEN INTELLIGENCE</span></div>
            <div className="flex items-center space-x-1.5"><Activity className="w-3.5 h-3.5 text-indigo-400" /> <span>AUTOMATED EXECUTION</span></div>
            <div className="flex items-center space-x-1.5"><Scale className="w-3.5 h-3.5 text-violet-400" /> <span>FACT-BASED DECISIONS</span></div>
            <div className="flex items-center space-x-1.5"><RefreshCw className="w-3.5 h-3.5 text-emerald-400" /> <span>CONTINUOUS IMPROVEMENT</span></div>
            <div className="flex items-center space-x-1.5"><Shield className="w-3.5 h-3.5 text-cyan-400" /> <span>RISK-AWARE SOURCING</span></div>
          </div>
        </div>
      </header>

      {/* OPPORTUNITY DETECTED ALERT BANNER */}
      {showAlert && (
        <div className="bg-ucru-orange/10 border-b border-ucru-orange/30 animate-in slide-in-from-top-4 duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-ucru-orange/20 rounded-full animate-pulse">
                <AlertOctagon className="w-5 h-5 text-ucru-orange" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-ucru-orange uppercase tracking-wider">AI SOURCING ALERT: Volume Surge Detected</h3>
                <p className="text-slate-300 text-sm mt-0.5">
                  Volume surge detected ({simulatedVolume.toLocaleString()} units vs normal buy of {activePart.currentBuy.toLocaleString()}).
                  <span className="font-semibold text-white"> Recommended Action: Activate Auto-Negotiator to secure tiered unit discounts.</span>
                </p>
              </div>
            </div>
            <button 
              onClick={() => {
                setActiveStep(7);
                runBotNegotiation();
              }}
              className={`px-4 py-2 rounded-lg text-sm font-bold shadow-lg transition-all flex items-center space-x-2 ${
                autoNegotiateEnabled 
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 cursor-default'
                : 'bg-gradient-to-r from-ucru-orange to-amber-500 hover:brightness-110 text-white'
              }`}
            >
              {autoNegotiateEnabled ? (
                <><CheckCircle2 className="w-4 h-4" /> <span>Bot Settled Deal!</span></>
              ) : (
                <><Bot className="w-4 h-4" /> <span>Trigger Negotiate Bot</span></>
              )}
            </button>
          </div>
        </div>
      )}

      {/* MAIN LAYOUT CONTAINER */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* TOP SYSTEM OVERVIEW HEADER */}
        <div className="text-center mb-8">
          <h2 className="text-xl font-bold tracking-tight text-white uppercase sm:text-2xl">
            AI-Powered Procurement Value Engine
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            A closed-loop system that turns data into continuous, measurable value
          </p>
        </div>

        {/* THREE COLUMN DASHBOARD GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* COLUMN 1: INTERACTIVE CLOSED-LOOP DIAL (3 Columns) */}
          <div className="lg:col-span-4 flex flex-col items-center">
            <div className="bg-slate-900/60 border border-ucru-border rounded-2xl p-6 shadow-xl w-full flex flex-col items-center relative overflow-hidden">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Value Loop Navigator</h3>
              
              {/* Circular Dial Layout */}
              <div className="relative w-[340px] h-[340px] flex items-center justify-center">
                
                {/* Dashed SVG Ring connecting steps */}
                <svg className="absolute w-full h-full animate-spin-slow pointer-events-none" viewBox="0 0 100 100">
                  <defs>
                    <linearGradient id="gradient-loop" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#143272" />
                      <stop offset="50%" stopColor="#ed6f23" />
                      <stop offset="100%" stopColor="#10b981" />
                    </linearGradient>
                  </defs>
                  <circle cx="50" cy="50" r="41" fill="none" stroke="url(#gradient-loop)" strokeWidth="1" strokeDasharray="4 2" />
                </svg>

                {/* Central "Continuous Value Creation" Dial */}
                <div className="absolute w-[160px] h-[160px] rounded-full bg-slate-950 border border-ucru-border/80 flex flex-col items-center justify-center p-3 text-center z-20 shadow-inner group hover:border-ucru-orange/50 transition-colors">
                  <span className="text-[10px] font-black text-ucru-orange uppercase tracking-wider">Continuous Value</span>
                  <div className="text-xl font-black text-white mt-1">
                    ${(totalAnnualSavings / 1000).toFixed(0)}k
                  </div>
                  <span className="text-[9px] text-slate-400 uppercase tracking-wide">Est. Savings</span>
                  <div className="w-full border-t border-slate-800 my-1"></div>
                  <span className="text-[8px] text-slate-500 leading-tight">Measure • Learn • Improve</span>
                </div>

                {/* 7 Circle Nodes positioned via trig formulas */}
                {stepsList.map((step, idx) => {
                  const angle = idx * (2 * Math.PI / 7) - Math.PI / 2;
                  const radius = 115; // Positioning radius
                  const x = Math.cos(angle) * radius;
                  const y = Math.sin(angle) * radius;
                  const StepIcon = step.icon;
                  const isActive = activeStep === step.num;

                  return (
                    <button
                      key={step.num}
                      onClick={() => setActiveStep(step.num)}
                      style={{ 
                        left: `calc(50% + ${x}px)`, 
                        top: `calc(50% + ${y}px)`,
                        transform: 'translate(-50%, -50%)'
                      }}
                      className={`absolute w-12 h-12 rounded-full flex items-center justify-center transition-all z-30 shadow-md ${
                        isActive 
                        ? `${step.bgClass} text-white scale-125 ring-4 ring-offset-2 ring-offset-slate-950 ring-ucru-orange/50 shadow-ucru-orange/20`
                        : 'bg-slate-900 border border-slate-700 hover:border-slate-400 text-slate-400 hover:text-slate-100 hover:scale-115'
                      }`}
                      title={step.name}
                    >
                      <StepIcon className="w-5 h-5" />
                      <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-slate-950 text-[9px] font-bold rounded-full border border-slate-700 text-slate-300 flex items-center justify-center">
                        {step.num}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Active Step Quick Info Block */}
              <div className="mt-4 w-full bg-slate-950/60 p-4 rounded-xl border border-ucru-border/60 text-center">
                <p className="text-[10px] font-bold text-ucru-orange uppercase tracking-widest">Active Step {activeStep}</p>
                <h4 className="text-sm font-bold text-white mt-1">{stepsList[activeStep - 1].name}</h4>
                <p className="text-xs text-slate-400 mt-1 leading-snug">{stepsList[activeStep - 1].desc}</p>
              </div>
            </div>
          </div>

          {/* COLUMN 2: ACTIVE WORKBENCH SCREEN (5 Columns) */}
          <div className="lg:col-span-5 flex flex-col h-full">
            <div className="bg-slate-900 border border-ucru-border rounded-2xl shadow-xl flex-grow overflow-hidden flex flex-col min-h-[500px]">
              
              {/* Workbench Header */}
              <div className="bg-slate-950/80 px-6 py-4 border-b border-ucru-border flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Cpu className="w-5 h-5 text-ucru-orange" />
                  <span className="font-bold text-white text-sm uppercase tracking-wider">Step {activeStep} Workbench</span>
                </div>
                <span className="px-2.5 py-0.5 text-[10px] font-bold bg-ucru-blue/40 text-ucru-orange border border-ucru-border rounded-full">
                  LIVE WORKSPACE
                </span>
              </div>

              {/* Workbench Active Content Panel */}
              <div className="p-6 flex-grow flex flex-col justify-between">
                
                {/* STEP 1 WORKSPACE: DATA CLEANSING */}
                {activeStep === 1 && (
                  <div className="space-y-4 animate-in fade-in duration-300 flex-grow flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="text-sm font-bold text-white uppercase tracking-wider">ERP Ingestion Stream</h4>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${qualityScore > 90 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                          Data Quality: {qualityScore}%
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mb-4">
                        AI-powered taxonomy mapping. Cleanse, dedupe & map standard part names and attributes automatically.
                      </p>

                      <div className="overflow-x-auto rounded-lg border border-ucru-border bg-slate-950/60 text-xs">
                        <table className="w-full text-left text-slate-300">
                          <thead className="bg-slate-950 text-slate-400 uppercase text-[10px]">
                            <tr>
                              <th className="px-3 py-2">Raw ERP Name</th>
                              <th className="px-3 py-2">Clean Category</th>
                              <th className="px-3 py-2 text-right">Confidence</th>
                              <th className="px-3 py-2 text-center">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {erpData.map(item => (
                              <tr key={item.id} className="border-b border-ucru-border/30 hover:bg-slate-900/50">
                                <td className="px-3 py-2.5 font-mono max-w-[140px] truncate" title={item.rawDesc}>{item.rawDesc}</td>
                                <td className="px-3 py-2.5 font-medium">{item.status === 'Cleansed' ? item.cleanName : 'Unclassified'}</td>
                                <td className="px-3 py-2.5 text-right font-mono font-medium">{(item.confidence * 100).toFixed(0)}%</td>
                                <td className="px-3 py-2.5 text-center">
                                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                    item.status === 'Cleansed' 
                                    ? 'bg-emerald-500/20 text-emerald-400' 
                                    : item.status === 'Anomaly' 
                                    ? 'bg-red-500/20 text-red-400' 
                                    : 'bg-amber-500/20 text-amber-400'
                                  }`}>
                                    {item.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-ucru-border mt-4 flex items-center justify-between">
                      <div className="text-xs text-slate-400">
                        {qualityScore === 99 ? '✓ Taxonomy normalized' : '⚠️ Anomalies / Unclassified records found'}
                      </div>
                      <button 
                        onClick={runNormalization}
                        disabled={isNormalizing || qualityScore === 99}
                        className="px-4 py-2 bg-ucru-orange hover:bg-ucru-orange/90 disabled:bg-slate-800 disabled:text-slate-500 font-bold rounded-lg text-xs text-white flex items-center space-x-2 transition-all"
                      >
                        {isNormalizing ? (
                          <><Loader2 className="w-3.5 h-3.5 animate-spin" /> <span>AI Normalizing...</span></>
                        ) : (
                          <><Database className="w-3.5 h-3.5" /> <span>Normalize Taxonomy</span></>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 2 WORKSPACE: DIGITAL TWIN */}
                {activeStep === 2 && (
                  <div className="space-y-4 animate-in fade-in duration-300">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-sm font-bold text-white uppercase tracking-wider">{activePart.id} Twin Profile</h4>
                        <p className="text-xs text-slate-400">{activePart.name}</p>
                      </div>
                      <span className="px-2.5 py-0.5 text-[10px] font-bold bg-ucru-orange/10 text-ucru-orange border border-ucru-orange/20 rounded-full">
                        {activePart.category}
                      </span>
                    </div>

                    {/* Isometric Blueprint CAD Renderer */}
                    <div className="relative h-44 w-full rounded-xl overflow-hidden border border-ucru-border bg-slate-950 p-4"
                         style={{
                           backgroundImage: `linear-gradient(rgba(20, 50, 114, 0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(20, 50, 114, 0.15) 1px, transparent 1px)`,
                           backgroundSize: '15px 15px'
                         }}>
                      <div className="absolute inset-4 border border-ucru-blue/20 rounded p-2 flex flex-col justify-between pointer-events-none">
                        <div className="flex justify-between text-[9px] font-mono text-ucru-blue/60">
                          <span>UCRU TWIN SCHEMA</span>
                          <span>REV: B</span>
                        </div>
                        
                        <div className="flex-grow flex items-center justify-center">
                          <div className="w-24 h-24 border border-dashed border-ucru-orange/30 rounded-full flex items-center justify-center relative animate-pulse">
                            <div className="absolute w-full h-[1px] bg-ucru-blue/20"></div>
                            <div className="absolute h-full w-[1px] bg-ucru-blue/20"></div>
                            <Activity className="w-8 h-8 text-ucru-orange/50 animate-spin-slow" />
                          </div>
                        </div>

                        <div className="flex justify-between text-[9px] font-mono text-ucru-blue/60">
                          <span>SCALE: 1:1</span>
                          <span>DWG REF: {activePart.id}</span>
                        </div>
                      </div>
                    </div>

                    {/* Specifications List */}
                    <div>
                      <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Technical Specs</h5>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(activePart.specs).map(([key, value]) => (
                          <div key={key} className="bg-slate-950/40 p-2 rounded border border-ucru-border/30 text-xs">
                            <p className="text-[9px] text-slate-500 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                            <p className="font-semibold text-slate-300 mt-0.5">{value}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 3 WORKSPACE: SHOULD-COST MODELING */}
                {activeStep === 3 && (
                  <div className="space-y-4 animate-in fade-in duration-300">
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider">AI Should-Cost Breakdown</h4>
                    <p className="text-xs text-slate-400">
                      Drag factor sliders to model changes in raw material, labor, overhead, or tariff rates.
                    </p>

                    {/* Interactive Sliders */}
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-slate-400">Raw Material Benchmark</span>
                          <span className="text-ucru-orange font-mono">{materialFactor}%</span>
                        </div>
                        <input 
                          type="range" min="50" max="150" value={materialFactor}
                          onChange={(e) => setMaterialFactor(Number(e.target.value))}
                          className="w-full h-1 bg-slate-800 rounded appearance-none cursor-pointer accent-ucru-orange"
                        />
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-slate-400">Manufacturing Labor Rate</span>
                          <span className="text-ucru-orange font-mono">{laborFactor}%</span>
                        </div>
                        <input 
                          type="range" min="50" max="150" value={laborFactor}
                          onChange={(e) => setLaborFactor(Number(e.target.value))}
                          className="w-full h-1 bg-slate-800 rounded appearance-none cursor-pointer accent-ucru-orange"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-slate-400">Supplier Overhead Margin</span>
                          <span className="text-ucru-orange font-mono">{overheadFactor}%</span>
                        </div>
                        <input 
                          type="range" min="50" max="150" value={overheadFactor}
                          onChange={(e) => setOverheadFactor(Number(e.target.value))}
                          className="w-full h-1 bg-slate-800 rounded appearance-none cursor-pointer accent-ucru-orange"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-slate-400">Logistics & Tariffs</span>
                          <span className="text-ucru-orange font-mono">{logisticsFactor}%</span>
                        </div>
                        <input 
                          type="range" min="50" max="150" value={logisticsFactor}
                          onChange={(e) => setLogisticsFactor(Number(e.target.value))}
                          className="w-full h-1 bg-slate-800 rounded appearance-none cursor-pointer accent-ucru-orange"
                        />
                      </div>
                    </div>

                    {/* Real-time Calculation Panel */}
                    <div className="bg-slate-950 p-4 rounded-xl border border-ucru-border/80 grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[10px] text-slate-500 uppercase font-bold">Standard Actual Price</p>
                        <p className="text-lg font-black text-slate-300 font-mono">${activePart.unitPrice.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-ucru-orange uppercase font-bold">AI Should-Cost Target</p>
                        <p className="text-lg font-black text-emerald-400 font-mono">${currentShouldCost.toFixed(2)}</p>
                      </div>
                      <div className="col-span-2 pt-2 border-t border-slate-800 flex justify-between items-center text-xs">
                        <span className="text-slate-400">Negotiation Savings Buffer:</span>
                        <span className="font-bold text-emerald-400">+ {savingsPercent.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 4 WORKSPACE: RFQ EXECUTION */}
                {activeStep === 4 && (
                  <div className="space-y-4 animate-in fade-in duration-300 flex-grow flex flex-col justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white uppercase tracking-wider">One-Click RFQ Workspace</h4>
                      <p className="text-xs text-slate-400 mb-4">
                        Consolidate twin specifications, should-cost benchmarks, and quality requirements into a verified RFQ package.
                      </p>

                      {rfqStatus === 'idle' && (
                        <div className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-ucru-border/60 text-xs">
                          <h5 className="font-bold text-white">RFQ Payload Package Checklist:</h5>
                          <label className="flex items-center space-x-2 text-slate-300">
                            <input type="checkbox" defaultChecked disabled className="rounded border-slate-700 text-ucru-orange focus:ring-ucru-orange" />
                            <span>Digital Twin CAD specifications linked ({activePart.id})</span>
                          </label>
                          <label className="flex items-center space-x-2 text-slate-300">
                            <input type="checkbox" defaultChecked disabled className="rounded border-slate-700 text-ucru-orange focus:ring-ucru-orange" />
                            <span>Should-Cost target benchmark linked (${currentShouldCost.toFixed(2)})</span>
                          </label>
                          <label className="flex items-center space-x-2 text-slate-300">
                            <input type="checkbox" defaultChecked className="rounded border-slate-700 text-ucru-orange focus:ring-ucru-orange" />
                            <span>Include dynamic volume breaks (5k, 10k, 25k)</span>
                          </label>
                        </div>
                      )}

                      {rfqStatus === 'ready' && (
                        <div className="bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/30 text-xs space-y-2">
                          <h5 className="font-bold text-emerald-400 flex items-center">
                            <CheckCircle2 className="w-4 h-4 mr-1.5" /> RFQ Package Compiled Successfully
                          </h5>
                          <p className="text-slate-300">
                            Matched with <span className="font-bold text-white">3 qualified global suppliers</span>. AI score recommends Taiwanese portal dispatch first.
                          </p>
                          <div className="text-[10px] text-slate-400 mt-2 font-mono">
                            FILE: UCRU_RFQ_PACK_{activePart.id}_V1.zip
                          </div>
                        </div>
                      )}

                      {rfqStatus === 'published' && (
                        <div className="bg-ucru-blue/20 p-4 rounded-xl border border-ucru-border text-xs space-y-2">
                          <h5 className="font-bold text-ucru-orange flex items-center">
                            <Send className="w-4 h-4 mr-1.5 animate-pulse" /> RFQ Dispatched & Published
                          </h5>
                          <p className="text-slate-300">
                            RFQ packet broadcasted to shortlist. Tracking live responses.
                          </p>
                          <div className="bg-slate-950 p-2 rounded font-mono text-[10px] text-slate-400 flex justify-between mt-2">
                            <span>TRACKING ID: RFQ-2026-992A</span>
                            <span className="text-emerald-400">STATUS: OPEN (0/3 QUOTES)</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="pt-4 border-t border-ucru-border flex justify-end">
                      {rfqStatus === 'idle' && (
                        <button 
                          onClick={handleRfqGenerate}
                          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg text-xs flex items-center space-x-2 transition-all"
                        >
                          <span>Compile RFQ Package</span>
                        </button>
                      )}
                      
                      {rfqStatus === 'sending' && (
                        <button disabled className="px-4 py-2 bg-slate-800 text-slate-500 font-bold rounded-lg text-xs flex items-center space-x-2">
                          <Loader2 className="w-4 h-4 animate-spin text-ucru-orange" />
                          <span>Generating RFQ...</span>
                        </button>
                      )}

                      {rfqStatus === 'ready' && (
                        <button 
                          onClick={handleRfqPublish}
                          className="px-4 py-2 bg-ucru-orange hover:bg-ucru-orange/90 text-white font-bold rounded-lg text-xs flex items-center space-x-2 transition-all shadow-lg"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>One-Click Publish RFQ</span>
                        </button>
                      )}

                      {rfqStatus === 'published' && (
                        <button 
                          onClick={() => setRfqStatus('idle')}
                          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-lg text-xs flex items-center space-x-2 transition-all"
                        >
                          <span>Generate New RFQ</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* STEP 5 WORKSPACE: SUPPLIER ASSESSMENT */}
                {activeStep === 5 && (
                  <div className="space-y-4 animate-in fade-in duration-300 flex-grow flex flex-col justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white uppercase tracking-wider">Supplier Performance & Mining</h4>
                      <p className="text-xs text-slate-400 mb-4">
                        Evaluate supplier quality, ESG rating, and risk. Mine alternative suppliers in global logistics networks.
                      </p>

                      <div className="space-y-3">
                        <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Suppliers Scorecard</h5>
                        
                        <div className="space-y-2 text-xs">
                          {MOCK_SUPPLIERS.map((s, idx) => (
                            <div key={idx} className="bg-slate-950/60 p-3 rounded-lg border border-ucru-border/30 flex justify-between items-center">
                              <div>
                                <p className="font-bold text-slate-200">{s.name}</p>
                                <div className="flex space-x-2 text-[10px] text-slate-500 mt-0.5">
                                  <span>Quality: <strong className="text-slate-300">{s.quality}%</strong></span>
                                  <span>•</span>
                                  <span>Delivery: <strong className="text-slate-300">{s.delivery}%</strong></span>
                                </div>
                              </div>
                              <div className="text-right">
                                <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                  s.risk === 'Low' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                }`}>
                                  {s.risk} Risk
                                </span>
                                <p className="text-[9px] text-slate-500 mt-1">ESG Rating: {s.esg}/100</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 6 WORKSPACE: MARKET INTELLIGENCE */}
                {activeStep === 6 && (
                  <div className="space-y-4 animate-in fade-in duration-300 flex-grow flex flex-col justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white uppercase tracking-wider">Market Intelligence (ImportYeti Stream)</h4>
                      <p className="text-xs text-slate-400 mb-3">
                        Live shipping records mapped from Bill of Lading datasets. Discover what your competitors are importing and who they buy from.
                      </p>

                      <div className="bg-[#0e1628] rounded-xl border border-ucru-border overflow-hidden">
                        <div className="bg-slate-950 px-4 py-2 border-b border-ucru-border text-[10px] font-bold text-slate-400 flex justify-between">
                          <span>Live Custom Shipping Logs</span>
                          <span className="text-ucru-orange font-mono">IMPORTYETI DISPATCH</span>
                        </div>
                        
                        <div className="p-3 overflow-x-auto text-[11px]">
                          <table className="w-full text-left text-slate-300">
                            <thead>
                              <tr className="border-b border-slate-800 text-[10px] text-slate-500 uppercase">
                                <th className="pb-1.5">Supplier</th>
                                <th className="pb-1.5">Buyer</th>
                                <th className="pb-1.5 text-right">Weight</th>
                                <th className="pb-1.5 text-right">Route</th>
                              </tr>
                            </thead>
                            <tbody>
                              {MOCK_IMPORT_YETI_DATA.map((row, idx) => (
                                <tr key={idx} className="border-b border-slate-800/40 hover:bg-slate-900/40">
                                  <td className="py-2 font-medium">{row.supplier}</td>
                                  <td className="py-2 truncate max-w-[80px]">
                                    {row.buyer.includes('Internal') 
                                      ? <span className="text-emerald-400 font-semibold">{row.buyer}</span>
                                      : <span className="text-ucru-orange">{row.buyer}</span>
                                    }
                                  </td>
                                  <td className="py-2 text-right font-mono">{row.weight}</td>
                                  <td className="py-2 text-right text-[10px] text-slate-500">{row.portOfLading.split(',')[0]} ➔ {row.portOfUnlading.split(',')[0]}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 7 WORKSPACE: OPPORTUNITY ASSESSMENT & SOURCING */}
                {activeStep === 7 && (
                  <div className="space-y-4 animate-in fade-in duration-300 flex-grow flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-sm font-bold text-white uppercase tracking-wider">Opportunity Sourcing & Auto-Bot</h4>
                          <p className="text-xs text-slate-400">Launch autonomous sourcing projects to capture volume discounts.</p>
                        </div>
                      </div>

                      {/* Demand Simulation Tool */}
                      <div className="bg-slate-950 p-4 rounded-xl border border-ucru-border/80 space-y-3 mt-2">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-slate-400">Demand Simulation Tool</span>
                          <span className="text-ucru-orange font-mono">{(simulatedVolume).toLocaleString()} Units</span>
                        </div>
                        <input 
                          type="range" min="0" max="10000" step="100" value={simulatedVolume}
                          onChange={(e) => setSimulatedVolume(Number(e.target.value))}
                          className="w-full h-1.5 bg-slate-800 rounded appearance-none cursor-pointer accent-ucru-orange"
                        />
                        <p className="text-[10px] text-slate-500 italic flex items-center leading-tight">
                          <Bot className="w-3.5 h-3.5 text-ucru-orange mr-1 flex-shrink-0" />
                          <span>Simulate volume spikes. Ucru Engine detects anomalies and triggers counter negotiations.</span>
                        </p>
                      </div>

                      {/* AI Autonomous Negotiation Terminal Console */}
                      <div className="mt-4">
                        <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">AI Negotiation Bot Terminal</h5>
                        <div className="h-32 bg-slate-950 rounded-lg p-3 font-mono text-[10px] text-emerald-400 overflow-y-auto border border-ucru-border leading-snug space-y-1.5">
                          {negotiationLogs.length === 0 ? (
                            <div className="text-slate-500 flex items-center justify-center h-full flex-col">
                              <Bot className="w-6 h-6 mb-1 text-slate-600" />
                              <span>Bot Idle. Trigger negotiation to begin.</span>
                            </div>
                          ) : (
                            negotiationLogs.map((log, index) => (
                              <div key={index} className="border-l border-emerald-500/30 pl-2">
                                {log}
                              </div>
                            ))
                          )}
                          <div ref={terminalEndRef}></div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-ucru-border flex justify-between items-center mt-3">
                      <span className="text-[10px] text-slate-500 uppercase font-bold font-mono">STATUS: {isNegotiating ? 'NEGOTIATING' : 'IDLE'}</span>
                      <button 
                        onClick={runBotNegotiation}
                        disabled={isNegotiating}
                        className="px-4 py-2 bg-ucru-orange hover:bg-ucru-orange/90 disabled:bg-slate-800 disabled:text-slate-500 font-bold rounded-lg text-xs text-white flex items-center space-x-2 transition-all shadow-md"
                      >
                        {isNegotiating ? (
                          <><Loader2 className="w-3.5 h-3.5 animate-spin" /> <span>Negotiating...</span></>
                        ) : (
                          <><Bot className="w-3.5 h-3.5" /> <span>Run Bot Negotiation</span></>
                        )}
                      </button>
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>

          {/* COLUMN 3: VALUE OUTCOMES SIDEBAR (5 Outcomes + Feedback Loop) (5 Columns) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-slate-900 border border-ucru-border rounded-2xl p-6 shadow-xl space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-ucru-border pb-3 flex justify-between items-center">
                <span>Value Outcomes</span>
                <span className="text-[9px] text-ucru-orange font-bold uppercase">KPI Mapped</span>
              </h3>

              {/* Outcomes List */}
              <div className="space-y-4">
                
                {/* 1. Financial Impact */}
                <div className="flex items-start space-x-3 bg-slate-950/40 p-3 rounded-lg border border-ucru-border/50 hover:border-ucru-orange/30 transition-all">
                  <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wide">Financial Impact</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">Higher savings & cost avoidance.</p>
                    <div className="text-xs font-bold text-emerald-400 font-mono mt-1">
                      ${(totalAnnualSavings / 1000).toFixed(0)}k savings forecasted
                    </div>
                  </div>
                </div>

                {/* 2. Faster Cycles */}
                <div className="flex items-start space-x-3 bg-slate-950/40 p-3 rounded-lg border border-ucru-border/50 hover:border-ucru-orange/30 transition-all">
                  <div className="p-2 bg-ucru-orange/10 text-ucru-orange rounded-lg">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wide">Faster Cycles</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">Reduced cycle time from weeks to days.</p>
                    <div className="text-xs font-bold text-ucru-orange font-mono mt-1">
                      {rfqStatus === 'published' ? '0.8 Days (Cycle Time)' : '2.4 Days average speed'}
                    </div>
                  </div>
                </div>

                {/* 3. Margin Uplift */}
                <div className="flex items-start space-x-3 bg-slate-950/40 p-3 rounded-lg border border-ucru-border/50 hover:border-ucru-orange/30 transition-all">
                  <div className="p-2 bg-violet-500/10 text-violet-400 rounded-lg">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wide">Margin Uplift</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">Better pricing, mix & performance.</p>
                    <div className="text-xs font-bold text-violet-400 font-mono mt-1">
                      +{(savingsPercent * 0.8).toFixed(1)}% margin improvement
                    </div>
                  </div>
                </div>

                {/* 4. Risk Reduction */}
                <div className="flex items-start space-x-3 bg-slate-950/40 p-3 rounded-lg border border-ucru-border/50 hover:border-ucru-orange/30 transition-all">
                  <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-lg">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wide">Risk Reduction</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">Stronger supplier compliance & continuity.</p>
                    <div className="text-xs font-bold text-cyan-400 font-mono mt-1">
                      94% Supply Continuity
                    </div>
                  </div>
                </div>

                {/* 5. Sustainability */}
                <div className="flex items-start space-x-3 bg-slate-950/40 p-3 rounded-lg border border-ucru-border/50 hover:border-ucru-orange/30 transition-all">
                  <div className="p-2 bg-teal-500/10 text-teal-400 rounded-lg">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wide">Sustainability</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">Responsible sourcing & ESG alignment.</p>
                    <div className="text-xs font-bold text-teal-400 font-mono mt-1">
                      84 ESG Composite Rating
                    </div>
                  </div>
                </div>

              </div>

              {/* Realized Feedback Loop Graphic */}
              <div className="bg-slate-950 p-4 rounded-xl border border-ucru-border/80 text-center relative overflow-hidden flex flex-col items-center justify-center">
                <RefreshCw className="w-6 h-6 text-ucru-orange animate-spin-slow mb-2" />
                <h4 className="text-[10px] font-bold text-white uppercase tracking-wider">Closed-Loop Feedback System</h4>
                <p className="text-[9px] text-slate-400 mt-1 leading-snug">
                  Realized outcomes are continuously fed back to refine AI data models, should-cost benchmarks, and negotiations.
                </p>
              </div>
            </div>
          </div>

        </div>

      </main>

      {/* FOOTER: ENABLING FOUNDATIONS */}
      <footer className="bg-slate-950 border-t border-ucru-border py-6 mt-12 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 space-y-4">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Enabling Foundations</div>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-slate-900/60 p-3 rounded-lg border border-ucru-border/50 flex flex-col items-center">
              <Database className="w-4 h-4 text-ucru-orange mb-1" />
              <span className="font-bold text-slate-200">Cloud & Data</span>
              <span className="text-[9px] text-slate-500 mt-0.5">Scalable • Secure • Integrated</span>
            </div>

            <div className="bg-slate-900/60 p-3 rounded-lg border border-ucru-border/50 flex flex-col items-center">
              <Bot className="w-4 h-4 text-indigo-400 mb-1" />
              <span className="font-bold text-slate-200">AI / ML Models</span>
              <span className="text-[9px] text-slate-500 mt-0.5">Advanced • Adaptive • Trusted</span>
            </div>

            <div className="bg-slate-900/60 p-3 rounded-lg border border-ucru-border/50 flex flex-col items-center">
              <Shield className="w-4 h-4 text-violet-400 mb-1" />
              <span className="font-bold text-slate-200">Security & Gov</span>
              <span className="text-[9px] text-slate-500 mt-0.5">Protect • Comply • Govern</span>
            </div>

            <div className="bg-slate-900/60 p-3 rounded-lg border border-ucru-border/50 flex flex-col items-center col-span-2 md:col-span-1">
              <Users className="w-4 h-4 text-emerald-400 mb-1" />
              <span className="font-bold text-slate-200">Collaboration</span>
              <span className="text-[9px] text-slate-500 mt-0.5">Aligned • Enabled • Accountable</span>
            </div>

            <div className="bg-slate-900/60 p-3 rounded-lg border border-ucru-border/50 flex flex-col items-center col-span-2 md:col-span-1">
              <TrendingUp className="w-4 h-4 text-cyan-400 mb-1" />
              <span className="font-bold text-slate-200">Value Management</span>
              <span className="text-[9px] text-slate-500 mt-0.5">Track • Measure • Realize</span>
            </div>
          </div>

          <div className="border-t border-slate-900 pt-4 text-[10px] text-slate-500">
            &copy; {new Date().getFullYear()} UCRU Engine. All rights reserved. Mapped with TheUcru Brand Colors and Assets.
          </div>
        </div>
      </footer>

    </div>
  );
}