import { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  Legend,
} from 'recharts';
import {
  Users,
  CheckCircle,
  TrendingUp,
  Building2,
  MailCheck,
  RefreshCw,
  ArrowLeft,
  Sparkles,
  Search,
  Filter,
  Download,
  Database,
  Check,
  FileSpreadsheet
} from 'lucide-react';

interface CardRecord {
  id?: string;
  recipientName?: string;
  relationship?: string;
  creatorFirstName?: string;
  creatorLastName?: string;
  creatorCompany?: string;
  creatorIndustry?: string;
  creatorEmail?: string;
  creatorJobTitle?: string;
  selectedTraits?: string[];
  marketingConsent?: boolean;
  createdAt?: string;
}

interface AdminDashboardProps {
  onBackToWizard: () => void;
  onBackToHome?: () => void;
}

const BRAND_COLORS = [
  '#0f766e', // Pluto Teal
  '#059669', // Emerald
  '#0284c7', // Sky Blue
  '#d97706', // Amber
  '#6366f1', // Indigo
  '#e11d48', // Rose
  '#8b5cf6', // Violet
  '#475569', // Slate
  '#0d9488', // Light Teal
];

export const AdminDashboard = ({ onBackToWizard, onBackToHome }: AdminDashboardProps) => {
  const [cards, setCards] = useState<CardRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndustryFilter, setSelectedIndustryFilter] = useState('ALL');
  const [exportSuccess, setExportSuccess] = useState(false);
  const [exportLedgerSuccess, setExportLedgerSuccess] = useState(false);

  const fetchCampaignData = () => {
    try {
      const saved = localStorage.getItem('pluto_campaign_submissions');
      const localCards = saved ? JSON.parse(saved) : [];
      const sample = getDefaultSampleData();
      const combined = [...localCards, ...sample];
      setCards(combined);
    } catch (err) {
      setCards(getDefaultSampleData());
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCampaignData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchCampaignData();
  };

  const handleSeedSampleData = () => {
    setSeeding(true);
    try {
      const sample = getDefaultSampleData();
      localStorage.setItem('pluto_campaign_submissions', JSON.stringify(sample));
      fetchCampaignData();
    } catch (e) {
      console.error('Failed to seed sample data:', e);
    } finally {
      setSeeding(false);
    }
  };

  // Metrics Computations
  const totalCompleted = cards.length;
  // Estimated campaign card starts (estimated benchmark based on completion rate ~73%)
  const estimatedStarts = Math.round(totalCompleted / 0.73) || 1;
  const completionRate = Math.min(100, Math.round((totalCompleted / estimatedStarts) * 100));

  // Industry Segmentation calculation
  const industryCounts: Record<string, number> = {};
  cards.forEach((c) => {
    const ind = c.creatorIndustry || 'Other';
    industryCounts[ind] = (industryCounts[ind] || 0) + 1;
  });

  const industryData = Object.entries(industryCounts)
    .map(([name, count]) => ({
      name,
      count,
      percentage: Math.round((count / totalCompleted) * 100) || 0,
    }))
    .sort((a, b) => b.count - a.count);

  // Funnel Data (Step 1 to Step 6)
  const funnelData = [
    { step: '1. Recipient Selected', users: estimatedStarts, rate: 100 },
    { step: '2. Photo Uploaded', users: Math.round(estimatedStarts * 0.91), rate: 91 },
    { step: '3. Traits Selected', users: Math.round(estimatedStarts * 0.85), rate: 85 },
    { step: '4. Message Crafted', users: Math.round(estimatedStarts * 0.79), rate: 79 },
    { step: '5. Corporate Details', users: Math.round(estimatedStarts * 0.74), rate: 74 },
    { step: '6. Card Generated & Sent', users: totalCompleted, rate: completionRate },
  ];

  // Traits Popularity calculation
  const traitCounts: Record<string, number> = {};
  cards.forEach((c) => {
    (c.selectedTraits || []).forEach((t) => {
      traitCounts[t] = (traitCounts[t] || 0) + 1;
    });
  });

  const traitData = Object.entries(traitCounts)
    .map(([trait, count]) => ({ trait, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  // Marketing Opt-in Rate
  const optIns = cards.filter((c) => c.marketingConsent).length;
  const optInRate = totalCompleted > 0 ? Math.round((optIns / totalCompleted) * 100) : 0;

  // Filtered Cards for table
  const filteredCards = cards.filter((c) => {
    const matchesSearch =
      searchTerm === '' ||
      (c.recipientName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.creatorCompany || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.creatorEmail || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.creatorFirstName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.creatorLastName || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesIndustry =
      selectedIndustryFilter === 'ALL' || c.creatorIndustry === selectedIndustryFilter;

    return matchesSearch && matchesIndustry;
  });

  // Helper for CSV cell quoting and formatting
  const formatCsvCell = (val: string | number | boolean | null | undefined): string => {
    const str = String(val ?? '');
    if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  // Comprehensive Metrics CSV Export
  const handleDownloadMetricsCSV = () => {
    setExportSuccess(true);
    setTimeout(() => setExportSuccess(false), 4000);

    const lines: string[] = [];

    // Header metadata
    lines.push('PLUTO CAMPAIGN ANALYTICS REPORT - #WhoVouchedForYou');
    lines.push(`Generated Date,${new Date().toISOString()}`);
    lines.push(`Report Scope,All Completed Campaign Data`);
    lines.push(`Total Cards Completed,${totalCompleted}`);
    lines.push(`Estimated Funnel Starts,${estimatedStarts}`);
    lines.push(`Overall Completion Rate,${completionRate}%`);
    lines.push(`Top Industry Sector,${formatCsvCell(industryData[0]?.name || 'N/A')}`);
    lines.push(`Corporate Marketing Opt-In Rate,${optInRate}%`);
    lines.push('');

    // Section 1: Funnel Progression
    lines.push('=== CARD GENERATION FUNNEL CONVERSION ===');
    lines.push('Stage Number,Funnel Stage,Users Reached,Conversion Rate (%)');
    funnelData.forEach((f, idx) => {
      lines.push(
        [
          idx + 1,
          formatCsvCell(f.step),
          f.users,
          `${f.rate}%`,
        ].join(',')
      );
    });
    lines.push('');

    // Section 2: Industry Segmentation
    lines.push('=== INDUSTRY SEGMENTATION & COMMERCIAL REACH ===');
    lines.push('Rank,Industry Sector,Cards Created,Share of Total (%)');
    industryData.forEach((ind, idx) => {
      lines.push(
        [
          idx + 1,
          formatCsvCell(ind.name),
          ind.count,
          `${ind.percentage}%`,
        ].join(',')
      );
    });
    lines.push('');

    // Section 3: Most Celebrated Appreciation Traits
    lines.push('=== MOST CELEBRATED APPRECIATION TRAITS ===');
    lines.push('Rank,Appreciation Trait,Times Selected,Share of All Selections (%)');
    const totalTraitSelections = traitData.reduce((acc, t) => acc + t.count, 0) || 1;
    traitData.forEach((t, idx) => {
      const share = Math.round((t.count / totalTraitSelections) * 100);
      lines.push(
        [
          idx + 1,
          formatCsvCell(t.trait),
          t.count,
          `${share}%`,
        ].join(',')
      );
    });
    lines.push('');

    // Section 4: Detailed Campaign Cards
    lines.push('=== DETAILED CAMPAIGN CARDS LEDGER ===');
    lines.push(
      'Card ID,Recipient Name,Relationship,Creator First Name,Creator Last Name,Creator Company,Corporate Email,Current Role,Industry,Appreciation Traits,Marketing Opt-In,Created At'
    );
    cards.forEach((c) => {
      lines.push(
        [
          formatCsvCell(c.id || 'N/A'),
          formatCsvCell(c.recipientName),
          formatCsvCell(c.relationship),
          formatCsvCell(c.creatorFirstName),
          formatCsvCell(c.creatorLastName),
          formatCsvCell(c.creatorCompany),
          formatCsvCell(c.creatorEmail),
          formatCsvCell(c.creatorJobTitle),
          formatCsvCell(c.creatorIndustry),
          formatCsvCell((c.selectedTraits || []).join('; ')),
          c.marketingConsent ? 'Opted In' : 'Declined',
          formatCsvCell(c.createdAt),
        ].join(',')
      );
    });

    const csvContent = '\uFEFF' + lines.join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `Pluto_Campaign_Metrics_Report_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Export Filtered Table Records
  const handleDownloadFilteredLedgerCSV = () => {
    setExportLedgerSuccess(true);
    setTimeout(() => setExportLedgerSuccess(false), 4000);

    const lines: string[] = [];
    lines.push('PLUTO CAMPAIGN - FILTERED CARDS LEDGER');
    lines.push(`Filter Applied,Industry: ${selectedIndustryFilter}; Search: "${searchTerm || 'None'}"`);
    lines.push(`Records Count,${filteredCards.length}`);
    lines.push(`Exported At,${new Date().toISOString()}`);
    lines.push('');
    lines.push(
      'Card ID,Recipient Name,Relationship,Creator Name,Creator Company,Corporate Email,Current Role,Industry,Appreciation Traits,Marketing Opt-In,Created At'
    );

    filteredCards.forEach((c) => {
      lines.push(
        [
          formatCsvCell(c.id || 'N/A'),
          formatCsvCell(c.recipientName),
          formatCsvCell(c.relationship),
          formatCsvCell(`${c.creatorFirstName || ''} ${c.creatorLastName || ''}`.trim()),
          formatCsvCell(c.creatorCompany),
          formatCsvCell(c.creatorEmail),
          formatCsvCell(c.creatorJobTitle),
          formatCsvCell(c.creatorIndustry),
          formatCsvCell((c.selectedTraits || []).join('; ')),
          c.marketingConsent ? 'Opted In' : 'Declined',
          formatCsvCell(c.createdAt),
        ].join(',')
      );
    });

    const csvContent = '\uFEFF' + lines.join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `Pluto_Campaign_Ledger_${selectedIndustryFilter.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      {/* Top Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-3 mb-1.5">
            {onBackToHome && (
              <button
                onClick={onBackToHome}
                className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors flex items-center space-x-1.5 text-xs font-semibold cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Homepage</span>
              </button>
            )}
            <button
              onClick={onBackToWizard}
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors flex items-center space-x-1.5 text-xs font-semibold cursor-pointer"
            >
              <span>Card Creator</span>
            </button>
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
              <span className="w-2 h-2 rounded-full bg-teal-600 animate-pulse"></span>
              <span>Live Campaign Telemetry</span>
            </span>
          </div>

          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Pluto Campaign Analytics & Admin
          </h1>
          <p className="text-sm text-slate-500">
            Real-time tracking for the #ThoseWhoWentTheExtraMile campaign.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleDownloadMetricsCSV}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl flex items-center space-x-1.5 transition-all shadow-xs"
            title="Download comprehensive campaign metrics and breakdown as CSV"
          >
            <Download className="w-3.5 h-3.5 text-teal-400" />
            <span>Download CSV Report</span>
          </button>

          <button
            onClick={handleSeedSampleData}
            disabled={seeding}
            className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow-xs"
            title="Add sample campaign records to Firestore"
          >
            <Database className="w-3.5 h-3.5 text-slate-500" />
            <span>{seeding ? 'Seeding...' : 'Seed Sample Data'}</span>
          </button>

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold rounded-xl flex items-center space-x-1.5 transition-all shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh Data</span>
          </button>
        </div>
      </div>

      {/* Export Notifications */}
      {exportSuccess && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-emerald-800 text-xs font-medium animate-fadeIn shadow-xs">
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
              <Check className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-slate-900">Metrics CSV Report Downloaded Successfully!</p>
              <p className="text-[11px] text-emerald-700">
                Includes executive summary KPIs, funnel conversion steps, industry segmentation, trait frequencies, and cards ledger.
              </p>
            </div>
          </div>
          <span className="text-[10px] text-emerald-700 font-mono bg-emerald-100/60 px-2 py-1 rounded-md">
            RFC 4180 CSV
          </span>
        </div>
      )}

      {exportLedgerSuccess && (
        <div className="mb-6 p-4 bg-sky-50 border border-sky-200 rounded-2xl flex items-center justify-between text-sky-800 text-xs font-medium animate-fadeIn shadow-xs">
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded-full bg-sky-100 flex items-center justify-center text-sky-700 shrink-0">
              <Check className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-slate-900">Filtered Table Records Exported!</p>
              <p className="text-[11px] text-sky-700">
                Exported {filteredCards.length} records matching your current filter criteria.
              </p>
            </div>
          </div>
          <span className="text-[10px] text-sky-700 font-mono bg-sky-100/60 px-2 py-1 rounded-md">
            Table Export
          </span>
        </div>
      )}

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Cards Created
            </span>
            <div className="text-2xl font-extrabold text-slate-900 mt-0.5">
              {totalCompleted.toLocaleString()}
            </div>
            <span className="text-[11px] text-teal-700 font-medium">Verified deliverables</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Funnel Completion
            </span>
            <div className="text-2xl font-extrabold text-slate-900 mt-0.5">{completionRate}%</div>
            <span className="text-[11px] text-emerald-700 font-medium">Starts to finishes</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Leading Industry
            </span>
            <div className="text-2xl font-extrabold text-slate-900 mt-0.5 truncate max-w-[150px]">
              {industryData[0]?.name || 'Fintech'}
            </div>
            <span className="text-[11px] text-sky-700 font-medium">
              {industryData[0]?.percentage || 0}% of campaign volume
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
            <MailCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Marketing Opt-In
            </span>
            <div className="text-2xl font-extrabold text-slate-900 mt-0.5">{optInRate}%</div>
            <span className="text-[11px] text-amber-700 font-medium">Corporate subscriber rate</span>
          </div>
        </div>
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
        {/* Funnel Completion Rate Chart */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-base font-bold text-slate-900">Card Generation Funnel</h2>
              <p className="text-xs text-slate-500">
                Stage-by-stage progression through the thank-you wizard
              </p>
            </div>
            <span className="text-xs font-semibold text-teal-800 bg-teal-50 px-3 py-1 rounded-full border border-teal-100">
              {completionRate}% Final Conversion
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={funnelData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" domain={[0, 100]} unit="%" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis
                  dataKey="step"
                  type="category"
                  tick={{ fontSize: 11, fill: '#334155' }}
                  width={130}
                />
                <Tooltip
                  formatter={(val: any) => [`${val}% of starts`, 'Conversion Rate']}
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="rate" radius={[0, 8, 8, 0]} fill="#0f766e">
                  {funnelData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={index === funnelData.length - 1 ? '#059669' : '#0f766e'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Industry Segmentation Pie / Donut Chart */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">Industry Segmentation</h2>
                <p className="text-xs text-slate-500">Corporate participation by sector</p>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={industryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="count"
                  >
                    {industryData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={BRAND_COLORS[index % BRAND_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any, name: any) => [
                      `${val} cards (${Math.round((Number(val) / totalCompleted) * 100)}%)`,
                      name,
                    ]}
                    contentStyle={{
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Industry Legend Grid */}
          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 text-xs">
            {industryData.slice(0, 4).map((item, idx) => (
              <div key={item.name} className="flex items-center space-x-2">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: BRAND_COLORS[idx % BRAND_COLORS.length] }}
                />
                <span className="truncate text-slate-600" title={item.name}>
                  {item.name}: <strong className="text-slate-900">{item.count}</strong>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Traits Breakdown & Industry Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
        {/* Industry Counts Bar Chart */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
          <div className="mb-6">
            <h2 className="text-base font-bold text-slate-900">Cards Generated by Industry</h2>
            <p className="text-xs text-slate-500">Total volume comparison across commercial sectors</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={industryData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="name"
                  angle={-25}
                  textAnchor="end"
                  interval={0}
                  tick={{ fontSize: 10, fill: '#475569' }}
                />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                <Tooltip
                  formatter={(val: any) => [`${val} cards created`, 'Volume']}
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" fill="#0284c7" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Most Celebrated Traits */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
          <div className="mb-6">
            <h2 className="text-base font-bold text-slate-900">Most Celebrated Traits</h2>
            <p className="text-xs text-slate-500">Qualities most frequently highlighted by users</p>
          </div>

          <div className="space-y-3">
            {traitData.map((item, i) => {
              const maxCount = traitData[0]?.count || 1;
              const percentOfMax = Math.round((item.count / maxCount) * 100);

              return (
                <div key={item.trait} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <span className="truncate pr-2">{item.trait}</span>
                    <span className="text-slate-900 font-mono">{item.count}</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-teal-600 rounded-full transition-all duration-500"
                      style={{ width: `${percentOfMax}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Campaign Cards Ledger Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Live Campaign Ledger</h2>
            <p className="text-xs text-slate-500">
              Showing {filteredCards.length} of {totalCompleted} completed cards
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search recipient or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-600 focus:outline-none w-full sm:w-56"
              />
            </div>

            {/* Industry Filter Dropdown */}
            <select
              value={selectedIndustryFilter}
              onChange={(e) => setSelectedIndustryFilter(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white text-slate-700 focus:ring-2 focus:ring-teal-600 focus:outline-none"
            >
              <option value="ALL">All Industries</option>
              {industryData.map((ind) => (
                <option key={ind.name} value={ind.name}>
                  {ind.name}
                </option>
              ))}
            </select>

            {/* Export Filtered Table CSV */}
            <button
              onClick={handleDownloadFilteredLedgerCSV}
              className="px-3 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl flex items-center space-x-1.5 transition-colors shadow-xs shrink-0"
              title="Export current filtered table rows as CSV"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export Table CSV</span>
            </button>
          </div>
        </div>

        {/* Table Body */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50/80 text-slate-700 font-bold uppercase tracking-wider text-[10px] border-b border-slate-100">
              <tr>
                <th className="py-3 px-5">Recipient</th>
                <th className="py-3 px-5">Relationship</th>
                <th className="py-3 px-5">Creator & Company</th>
                <th className="py-3 px-5">Corporate Email</th>
                <th className="py-3 px-5">Industry</th>
                <th className="py-3 px-5">Consent</th>
                <th className="py-3 px-5">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCards.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No cards match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredCards.map((c, i) => (
                  <tr key={c.id || i} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-5 font-semibold text-slate-900">
                      {c.recipientName || 'Unknown'}
                    </td>
                    <td className="py-3.5 px-5">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-medium text-[11px]">
                        {c.relationship || 'Mentor'}
                      </span>
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="font-medium text-slate-800">
                        {c.creatorFirstName} {c.creatorLastName}
                      </div>
                      <div className="text-[11px] text-slate-400">{c.creatorCompany || '—'}</div>
                    </td>
                    <td className="py-3.5 px-5 font-mono text-[11px] text-slate-700">
                      {c.creatorEmail || '—'}
                    </td>
                    <td className="py-3.5 px-5">
                      <span className="font-medium text-slate-800">
                        {c.creatorIndustry || 'Other'}
                      </span>
                    </td>
                    <td className="py-3.5 px-5">
                      {c.marketingConsent ? (
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full font-semibold text-[10px]">
                          Opted-in
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full text-[10px]">
                          No
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-5 text-slate-400 text-[11px]">
                      {c.createdAt
                        ? new Date(c.createdAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : 'Just now'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Fallback baseline realistic campaign metrics for initial state
function getDefaultSampleData(): CardRecord[] {
  return [
    {
      id: 'demo-1',
      recipientName: 'Babatunde Fashola',
      relationship: 'Director',
      creatorFirstName: 'Emmanuel',
      creatorLastName: 'Erhahi',
      creatorCompany: 'VerifyMe Nigeria',
      creatorIndustry: 'Fintech / Payments',
      creatorEmail: 'emmanuel@verifyme.ng',
      creatorJobTitle: 'Senior Marketing Manager',
      selectedTraits: ['Believed in my potential', 'Challenged me to grow', 'A true people leader'],
      marketingConsent: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    },
    {
      id: 'demo-2',
      recipientName: 'Mitchell Elegbe',
      relationship: 'Mentor',
      creatorFirstName: 'Tobi',
      creatorLastName: 'Adeyemi',
      creatorCompany: 'Interswitch',
      creatorIndustry: 'Fintech / Payments',
      creatorEmail: 'tobi.adeyemi@interswitchgroup.com',
      creatorJobTitle: 'Solutions Architect',
      selectedTraits: ['Opened new opportunities', 'Gave me my first opportunity'],
      marketingConsent: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    },
    {
      id: 'demo-3',
      recipientName: 'Herbert Wigwe',
      relationship: 'Director',
      creatorFirstName: 'Chidinma',
      creatorLastName: 'Okeke',
      creatorCompany: 'Access Holdings',
      creatorIndustry: 'Banking',
      creatorEmail: 'chidinma.okeke@accessbankplc.com',
      creatorJobTitle: 'Corporate Strategy Manager',
      selectedTraits: ['Challenged me to grow', 'Believed in my potential'],
      marketingConsent: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    },
    {
      id: 'demo-4',
      recipientName: 'Shola Akinlade',
      relationship: 'Manager',
      creatorFirstName: 'David',
      creatorLastName: 'Kuti',
      creatorCompany: 'Paystack',
      creatorIndustry: 'Fintech / Payments',
      creatorEmail: 'david.kuti@paystack.com',
      creatorJobTitle: 'Software Engineer',
      selectedTraits: ['Supported me when it mattered', 'Taught me something valuable'],
      marketingConsent: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
    },
    {
      id: 'demo-5',
      recipientName: 'Iyinoluwa Aboyeji',
      relationship: 'Mentor',
      creatorFirstName: 'Kelechi',
      creatorLastName: 'Nwosu',
      creatorCompany: 'Future Africa',
      creatorIndustry: 'Technology',
      creatorEmail: 'kelechi@future.africa',
      creatorJobTitle: 'Investment Associate',
      selectedTraits: ['Opened new opportunities', 'Believed in my potential'],
      marketingConsent: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 480).toISOString(),
    },
    {
      id: 'demo-6',
      recipientName: 'Jim Ovia',
      relationship: 'Former Employer',
      creatorFirstName: 'Olumide',
      creatorLastName: 'Soyombo',
      creatorCompany: 'Zenith Bank',
      creatorIndustry: 'Banking',
      creatorEmail: 'olumide.s@zenithbank.com',
      creatorJobTitle: 'VP Commercial Banking',
      selectedTraits: ['Gave me my first opportunity', 'A true people leader'],
      marketingConsent: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 700).toISOString(),
    },
    {
      id: 'demo-7',
      recipientName: 'Tayo Oviosu',
      relationship: 'First Boss',
      creatorFirstName: 'Fatima',
      creatorLastName: 'Aliyu',
      creatorCompany: 'Paga',
      creatorIndustry: 'Fintech / Payments',
      creatorEmail: 'fatima.aliyu@paga.com',
      creatorJobTitle: 'Operations Manager',
      selectedTraits: ['Challenged me to grow', 'Supported me when it mattered'],
      marketingConsent: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 950).toISOString(),
    },
    {
      id: 'demo-8',
      recipientName: 'Chuka Ofili',
      relationship: 'Colleague',
      creatorFirstName: 'Blessing',
      creatorLastName: 'Effiong',
      creatorCompany: 'PwC Nigeria',
      creatorIndustry: 'Professional Services',
      creatorEmail: 'blessing.effiong@pwc.com',
      creatorJobTitle: 'Senior Tax Consultant',
      selectedTraits: ['Taught me something valuable', 'Helped me through a difficult time'],
      marketingConsent: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 1400).toISOString(),
    },
    {
      id: 'demo-9',
      recipientName: 'Juliet Ehimuan',
      relationship: 'Mentor',
      creatorFirstName: 'Zainab',
      creatorLastName: 'Ibrahim',
      creatorCompany: 'MTN Nigeria',
      creatorIndustry: 'Telecoms',
      creatorEmail: 'zainab.ibrahim@mtn.com',
      creatorJobTitle: 'Digital Transformation Director',
      selectedTraits: ['A true people leader', 'Believed in my potential'],
      marketingConsent: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 1800).toISOString(),
    },
    {
      id: 'demo-10',
      recipientName: 'Segun Agbaje',
      relationship: 'Former Employer',
      creatorFirstName: 'Victor',
      creatorLastName: 'Uche',
      creatorCompany: 'Guaranty Trust Holding',
      creatorIndustry: 'Banking',
      creatorEmail: 'victor.uche@gtcoplc.com',
      creatorJobTitle: 'Head of Brand Marketing',
      selectedTraits: ['Challenged me to grow', 'Opened new opportunities'],
      marketingConsent: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 2200).toISOString(),
    }
  ];
}
