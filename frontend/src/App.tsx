import { useState, useEffect } from 'react';
import { Plus, Trash2, Loader2, Globe, ExternalLink, CheckCircle2, XCircle, Clock, Save, Monitor, ShieldCheck, Database, Layout, Edit3 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const API_BASE = 'http://localhost:8000/api/v1';

const translations = {
  en: {
    title: "Anime Garden Sub",
    dashboard: "Dashboard",
    history: "History",
    settings: "Settings",
    addTracker: "Add Tracker",
    syncInterval: "Auto-monitoring is active (10m)",
    subTarget: "Subscription Target",
    mode: "Mode",
    lastSync: "Last Sync",
    actions: "Actions",
    noTrackers: "No active anime trackers.",
    archiveMode: "Full Archive",
    monitorMode: "Monitor Only",
    autoTracking: "Auto-Tracking",
    waiting: "Waiting for sync...",
    newSub: "New Subscription",
    editSub: "Edit Subscription",
    configTracker: "Configure Anime Tracker",
    animeTitle: "Anime Title",
    rssUrl: "RSS Feed URL",
    keywords: "Keywords (Include)",
    downloadHist: "Download historical episodes from feed",
    histDesc: "Archives existing matches",
    monitorDesc: "Only tracks future releases",
    discard: "Discard",
    activate: "Activate Tracker",
    update: "Update Tracker",
    ariaStatus: "Aria2 Connection",
    ariaRpc: "RPC Endpoint",
    ariaSecret: "RPC Secret Token",
    storage: "The download directory is managed by Aria2's global config.",
    openAriaNg: "Open Monitor Console",
    saveSettings: "Save Configuration",
    downloadStatus: "Status",
    episodeTitle: "Episode",
    timestamp: "Time",
    status_submitted: "Submitted",
    status_skipped: "Skipped",
    status_failed: "Failed",
    status_pending: "Pending",
    settingsSaved: "Settings updated!",
    connectionTip: "Tip: Use 'localhost' or your NAS IP for browser access.",
    taskActive: "Active",
    taskDisabled: "Paused"
  },
  cn: {
    title: "动漫花园订阅器",
    dashboard: "控制面板",
    history: "下载历史",
    settings: "系统设置",
    addTracker: "添加追踪",
    syncInterval: "自动监控已启用 (10分钟间隔)",
    subTarget: "订阅目标",
    mode: "模式",
    lastSync: "最后同步",
    actions: "操作",
    noTrackers: "暂无活跃的订阅。",
    archiveMode: "全量补完",
    monitorMode: "仅增量追踪",
    autoTracking: "自动监控中",
    waiting: "等待同步...",
    newSub: "添加新订阅",
    editSub: "编辑订阅规则",
    configTracker: "配置订阅规则",
    animeTitle: "动画名称",
    rssUrl: "RSS 链接",
    keywords: "包含关键字",
    downloadHist: "下载 RSS 中已有的历史集数",
    histDesc: "将下载所有匹配的历史资源",
    monitorDesc: "仅追踪未来发布的新集数",
    discard: "取消",
    activate: "激活追踪",
    update: "保存修改",
    ariaStatus: "Aria2 连接配置",
    ariaRpc: "RPC 服务地址",
    ariaSecret: "RPC 认证密钥",
    storage: "注：具体的下载保存路径请在 Aria2 的配置文件中修改。",
    openAriaNg: "打开监控面板",
    saveSettings: "保存设置",
    downloadStatus: "状态",
    episodeTitle: "剧集名称",
    timestamp: "时间",
    status_submitted: "已提交",
    status_skipped: "已跳过",
    status_failed: "失败",
    status_pending: "等待中",
    settingsSaved: "配置已保存！",
    connectionTip: "提示：如果在浏览器中无法连接，请将地址改为 NAS 的实际 IP。",
    taskActive: "运行中",
    taskDisabled: "已暂停"
  },
  jp: {
    title: "アニメガーデン登録",
    dashboard: "ダッシュボード",
    history: "履歴",
    settings: "設定",
    addTracker: "トラッカー追加",
    syncInterval: "自動監視中 (10分間隔)",
    subTarget: "購読ターゲット",
    mode: "モード",
    lastSync: "最終同期",
    actions: "操作",
    noTrackers: "有効なトラッカーはありません。",
    archiveMode: "アーカイブ",
    monitorMode: "監視のみ",
    autoTracking: "自動追跡",
    waiting: "同期待ち...",
    newSub: "新規登録",
    editSub: "登録編集",
    configTracker: "トラッカー設定",
    animeTitle: "アニメタイトル",
    rssUrl: "RSS URL",
    keywords: "キーワード (含む)",
    downloadHist: "既存のエピソードをダウンロード",
    histDesc: "既存の履歴をアーカイブする",
    monitorDesc: "今後の更新のみを追跡する",
    discard: "キャンセル",
    activate: "トラッカー有効化",
    update: "変更を保存",
    ariaStatus: "Aria2 接続設定",
    ariaRpc: "RPC アドレス",
    ariaSecret: "RPC トークン",
    storage: "注：保存先はAria2の設定で変更してください。",
    openAriaNg: "モニタ起動",
    saveSettings: "設定を保存",
    downloadStatus: "状態",
    episodeTitle: "エピソード",
    timestamp: "時間",
    status_submitted: "送信済み",
    status_skipped: "スキップ",
    status_failed: "失敗",
    status_pending: "保留中",
    settingsSaved: "保存しました！",
    connectionTip: "ヒント：接続できない場合は、localhost を実際の IP に変更してください。",
    taskActive: "動作中",
    taskDisabled: "停止中"
  }
};

type Lang = 'en' | 'cn' | 'jp';
type View = 'dashboard' | 'history' | 'settings';

interface Subscription {
  id: number;
  name: string;
  url: string;
  is_active: boolean;
  download_history: boolean;
  last_checked_at?: string;
  filters?: { keyword: string, type: string }[];
}

function Logo() {
  return (
    <div className="relative w-12 h-12 group">
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-2xl transition-transform duration-500 group-hover:scale-110">
        <defs>
          <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#4F46E5" />
          </linearGradient>
        </defs>
        {/* Main Hexagon Shape */}
        <path 
          d="M50 5 L89 27.5 L89 72.5 L50 95 L11 72.5 L11 27.5 Z" 
          fill="url(#logo-gradient)"
        />
        {/* Inner Play Symbol */}
        <path d="M42 35 L65 50 L42 65 Z" fill="white" />
        {/* Stylized Leaf/Sprout Accent */}
        <path 
          d="M75 20 Q85 10 95 20 Q85 30 75 20" 
          fill="#34D399" 
          className="animate-pulse"
        />
      </svg>
    </div>
  );
}

function App() {
  const queryClient = useQueryClient();
  const [lang, setLang] = useState<Lang>(() => (localStorage.getItem('lang') as Lang) || 'en');
  const [view, setView] = useState<View>('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [newSub, setNewSub] = useState({ name: '', url: '', download_history: false, keywords: '' });
  const [editSettings, setEditSettings] = useState({ aria2_rpc_url: '', aria2_rpc_secret: '' });

  const t = translations[lang];

  useEffect(() => { localStorage.setItem('lang', lang); }, [lang]);

  const { data: subscriptions } = useQuery({
    queryKey: ['subscriptions'],
    queryFn: async () => (await axios.get(`${API_BASE}/subscriptions/`)).data,
    enabled: view === 'dashboard'
  });

  const { data: historyList } = useQuery({
    queryKey: ['history'],
    queryFn: async () => (await axios.get(`${API_BASE}/history/`)).data,
    enabled: view === 'history'
  });

  const { data: appSettings } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => (await axios.get(`${API_BASE}/settings/`)).data,
    enabled: view === 'settings'
  });

  useEffect(() => { if (appSettings) setEditSettings(appSettings); }, [appSettings]);

  const saveSettingsMutation = useMutation({
    mutationFn: (data: typeof editSettings) => axios.put(`${API_BASE}/settings/`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      alert(t.settingsSaved);
    }
  });

  const upsertMutation = useMutation({
    mutationFn: (sub: typeof newSub) => {
      const filters = sub.keywords ? sub.keywords.split(',').map(kw => ({ keyword: kw.trim(), type: 'include' })) : [];
      const payload = { ...sub, filters };
      if (editId) return axios.patch(`${API_BASE}/subscriptions/${editId}`, payload);
      return axios.post(`${API_BASE}/subscriptions/`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      closeModal();
      // Give it a moment to sync then refresh status
      setTimeout(() => queryClient.invalidateQueries({ queryKey: ['subscriptions'] }), 2000);
    }
  });

  const toggleMutation = useMutation({
    mutationFn: ({id, active}: {id: number, active: boolean}) => 
      axios.patch(`${API_BASE}/subscriptions/${id}`, { is_active: active }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      setTimeout(() => queryClient.invalidateQueries({ queryKey: ['subscriptions'] }), 2000);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => axios.delete(`${API_BASE}/subscriptions/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['subscriptions'] })
  });

  const openEdit = (sub: Subscription) => {
    setEditId(sub.id);
    setNewSub({
      name: sub.name,
      url: sub.url,
      download_history: sub.download_history,
      keywords: sub.filters?.map(f => f.keyword).join(', ') || ''
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditId(null);
    setNewSub({ name: '', url: '', download_history: false, keywords: '' });
  };

  const getAriaNgLink = () => {
    try {
      let rpc = editSettings.aria2_rpc_url || 'http://localhost:6800/jsonrpc';
      if (rpc.includes('//aria2:')) rpc = rpc.replace('//aria2:', `//${window.location.hostname}:`);
      const urlObj = new URL(rpc);
      const protocol = urlObj.protocol.replace(':', '');
      const host = urlObj.hostname;
      const port = urlObj.port || (protocol === 'https' ? '443' : '80');
      const secretBase64 = btoa(editSettings.aria2_rpc_secret || '');
      return `http://${window.location.hostname}:6880/#!/settings/rpc/set/${protocol}/${host}/${port}/jsonrpc/${secretBase64}`;
    } catch (e) { return `http://${window.location.hostname}:6880`; }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans flex flex-col">
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200 px-10 py-5 flex justify-between items-center sticky top-0 z-40 shadow-sm">
        <div onClick={() => setView('dashboard')} className="flex items-center gap-4 cursor-pointer group">
          <Logo />
          <div><h1 className="text-xl font-black tracking-tight text-slate-800">{t.title}</h1><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">NAS EDITION</p></div>
        </div>
        <div className="flex items-center gap-8">
          <nav className="flex bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/50">
            {(['dashboard', 'history', 'settings'] as View[]).map((v) => (
              <button key={v} onClick={() => setView(v)} className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all uppercase tracking-widest ${view === v ? 'bg-white text-blue-600 shadow-md ring-1 ring-black/5' : 'text-slate-500 hover:text-slate-800'}`}>{t[v]}</button>
            ))}
          </nav>
          <div className="flex items-center gap-2 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/50">
            {(['en', 'cn', 'jp'] as Lang[]).map((l) => (
              <button key={l} onClick={() => setLang(l)} className={`w-10 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${lang === l ? 'bg-white text-blue-600 shadow-sm ring-1 ring-black/5' : 'text-slate-400 hover:text-slate-600'}`}>{l}</button>
            ))}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full p-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {view === 'dashboard' && (
          <>
            <div className="flex justify-between items-end mb-12">
              <div>
                <h2 className="text-4xl font-black text-slate-900 tracking-tight">{t.dashboard}</h2>
                <div className="flex items-center gap-3 mt-3 text-slate-500 bg-white w-fit px-4 py-2 rounded-full border border-slate-200 shadow-sm">
                  <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-sm shadow-green-200" />
                  <p className="text-xs font-black uppercase tracking-[0.1em]">{t.syncInterval}</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-10 py-5 rounded-[1.5rem] font-black shadow-2xl shadow-blue-200 active:scale-95 text-sm uppercase tracking-widest">
                <Plus size={22} strokeWidth={3} /> {t.addTracker}
              </button>
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50/50 border-b border-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                  <tr><th className="px-10 py-7">{t.subTarget}</th><th className="px-10 py-7">{t.mode}</th><th className="px-10 py-7">{t.lastSync}</th><th className="px-10 py-7 text-right">{t.actions}</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {subscriptions?.map((sub: any) => (
                    <tr key={sub.id} className={`hover:bg-slate-50/30 transition-colors group ${!sub.is_active ? 'opacity-60' : ''}`}>
                      <td className="px-10 py-8">
                        <div className="font-black text-slate-800 text-xl group-hover:text-blue-600 transition-colors">{sub.name}</div>
                        <div className="text-xs text-slate-400 truncate max-w-sm font-bold mt-2 opacity-60 italic">{sub.url}</div>
                      </td>
                      <td className="px-10 py-8">
                        <span className={`inline-flex items-center w-fit px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${sub.download_history ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                          {sub.download_history ? t.archiveMode : t.monitorMode}
                        </span>
                      </td>
                      <td className="px-10 py-8 text-sm font-black text-slate-400 tabular-nums">
                        {sub.last_checked_at ? new Date(sub.last_checked_at).toLocaleString() : t.waiting}
                      </td>
                      <td className="px-10 py-8 text-right">
                        <div className="flex justify-end items-center gap-6">
                          <label className="relative inline-flex items-center cursor-pointer scale-110">
                            <input type="checkbox" className="sr-only peer" checked={sub.is_active} onChange={() => toggleMutation.mutate({id: sub.id, active: !sub.is_active})} />
                            <div className="w-12 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                          <div className="flex items-center gap-1">
                            <button onClick={() => openEdit(sub)} className="p-3 text-slate-300 hover:text-blue-500 transition-all rounded-xl hover:bg-blue-50"><Edit3 size={22} strokeWidth={2.5} /></button>
                            <button onClick={() => deleteMutation.mutate(sub.id)} className="p-3 text-slate-300 hover:text-red-500 transition-all rounded-xl hover:bg-red-50"><Trash2 size={22} strokeWidth={2.5} /></button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {view === 'history' && (
          <div className="animate-in fade-in duration-500">
            <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-12">{t.history}</h2>
            <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-200 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50/50 border-b border-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                  <tr><th className="px-10 py-7">{t.episodeTitle}</th><th className="px-10 py-7">{t.downloadStatus}</th><th className="px-10 py-7">{t.timestamp}</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {historyList?.map((item: any) => (
                    <tr key={item.id} className="hover:bg-slate-50/30 transition-colors">
                      <td className="px-10 py-6"><div className="font-bold text-slate-800 leading-tight">{item.title}</div><div className="text-[10px] text-slate-400 font-mono mt-2 truncate max-w-2xl opacity-50">{item.magnet_link}</div></td>
                      <td className="px-10 py-6"><span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${item.status === 'submitted' ? 'bg-green-50 text-green-600 border-green-100' : item.status === 'skipped' ? 'bg-slate-50 text-slate-500 border-slate-200' : 'bg-red-50 text-red-600 border-red-100'}`}>{item.status === 'submitted' ? <CheckCircle2 size={14}/> : item.status === 'skipped' ? <Clock size={14}/> : <XCircle size={14}/>}{t[`status_${item.status}` as keyof typeof t] || item.status}</span></td>
                      <td className="px-10 py-6 text-sm font-black text-slate-400 tabular-nums">{new Date(item.created_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {view === 'settings' && (
          <div className="animate-in fade-in duration-500">
            <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-12">{t.settings}</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              <div className="lg:col-span-2 space-y-10">
                <div className="bg-white p-12 rounded-[3rem] shadow-xl border border-slate-200 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-5"><Layout size={120} /></div>
                  <div className="flex items-center gap-4 mb-10"><div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center"><Globe size={24} strokeWidth={3} /></div><h3 className="text-2xl font-black tracking-tight">{t.ariaStatus}</h3></div>
                  <div className="space-y-8 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Database size={12} /> {t.ariaRpc}</label><input type="text" className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-2xl outline-none transition-all font-bold text-slate-700 shadow-inner" value={editSettings.aria2_rpc_url} onChange={e => setEditSettings({...editSettings, aria2_rpc_url: e.target.value})} /></div>
                      <div className="space-y-3"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><ShieldCheck size={12} /> {t.ariaSecret}</label><input type="password" className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-2xl outline-none transition-all font-bold text-slate-700 shadow-inner" value={editSettings.aria2_rpc_secret} onChange={e => setEditSettings({...editSettings, aria2_rpc_secret: e.target.value})} /></div>
                    </div>
                    <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100/50"><p className="text-[11px] font-bold text-blue-600 leading-relaxed italic">{t.connectionTip}</p></div>
                    <div className="flex flex-col sm:flex-row gap-5 pt-4">
                      <button onClick={() => saveSettingsMutation.mutate(editSettings)} className="flex-1 flex items-center justify-center gap-3 bg-blue-600 text-white py-5 rounded-[1.5rem] font-black hover:bg-blue-700 shadow-xl active:scale-95 text-xs uppercase tracking-widest"><Save size={20} /> {t.saveSettings}</button>
                      <a href={getAriaNgLink()} target="_blank" className="flex-1 flex items-center justify-center gap-3 bg-slate-900 text-white py-5 rounded-[1.5rem] font-black hover:bg-black shadow-xl active:scale-95 text-xs uppercase tracking-widest"><Monitor size={20} /> {t.openAriaNg} <ExternalLink size={16} className="opacity-50" /></a>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-12 rounded-[3rem] shadow-2xl text-white flex flex-col justify-between">
                <h3 className="text-2xl font-black mb-6 tracking-tight italic underline decoration-white/20 underline-offset-8">System</h3>
                <div className="space-y-6 pt-8 border-t border-white/10"><div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] opacity-60"><span>Status</span><span className="bg-green-400 w-2 h-2 rounded-full shadow-sm shadow-green-300" /></div><div className="flex justify-between items-center"><span className="text-[10px] font-black uppercase tracking-widest opacity-60 text-white">Version</span><span className="font-mono text-xs font-black bg-white/10 px-4 py-1.5 rounded-xl border border-white/5">v1.5.0</span></div></div>
              </div>
            </div>
          </div>
        )}
      </main>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xl flex items-center justify-center p-6 z-50 animate-in fade-in duration-500">
          <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-200">
            <div className="px-12 py-10 border-b border-slate-100 flex justify-between items-center bg-white">
              <div><h3 className="font-black text-3xl text-slate-900 leading-none tracking-tighter">{editId ? t.editSub : t.newSub}</h3><p className="text-[10px] text-slate-400 mt-3 uppercase tracking-[0.3em] font-black">{t.configTracker}</p></div>
              <button onClick={closeModal} className="p-4 hover:bg-slate-100 rounded-full text-slate-300 hover:text-slate-900 transition-all text-3xl font-light">×</button>
            </div>
            <div className="p-12 space-y-8">
              <div className="space-y-6">
                <div className="space-y-2"><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.animeTitle}</label><input type="text" className="w-full px-7 py-5 bg-slate-50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-[1.5rem] outline-none font-bold text-slate-800 shadow-inner" placeholder="e.g. Frieren" value={newSub.name} onChange={e => setNewSub({...newSub, name: e.target.value})} /></div>
                <div className="space-y-2"><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.rssUrl}</label><input type="text" className="w-full px-7 py-5 bg-slate-50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-[1.5rem] outline-none font-bold text-slate-800 shadow-inner" placeholder="https://..." value={newSub.url} onChange={e => setNewSub({...newSub, url: e.target.value})} /></div>
                <div className="space-y-2"><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.keywords}</label><input type="text" className="w-full px-7 py-5 bg-slate-50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-[1.5rem] outline-none font-bold text-slate-800 shadow-inner" placeholder="简繁内封, 1080P" value={newSub.keywords} onChange={e => setNewSub({...newSub, keywords: e.target.value})} /></div>
              </div>
              {!editId && (
                <div className={`flex items-center gap-5 p-8 rounded-[2rem] border-2 transition-all cursor-pointer group ${newSub.download_history ? 'bg-orange-50 border-orange-200' : 'bg-blue-50 border-blue-200'}`} onClick={() => setNewSub({...newSub, download_history: !newSub.download_history})}>
                  <input type="checkbox" className="w-7 h-7 rounded-lg text-blue-600 cursor-pointer pointer-events-none" checked={newSub.download_history} readOnly />
                  <div className="flex-1"><span className={`block text-md font-black uppercase tracking-tight ${newSub.download_history ? 'text-orange-900' : 'text-blue-900'}`}>{t.downloadHist}</span><span className={`block text-[10px] font-black mt-1 uppercase tracking-widest opacity-60 ${newSub.download_history ? 'text-orange-600' : 'text-blue-600'}`}>{newSub.download_history ? t.histDesc : t.monitorDesc}</span></div>
                </div>
              )}
            </div>
            <div className="px-12 py-10 bg-slate-50/80 border-t border-slate-100 flex justify-end gap-6">
              <button onClick={closeModal} className="px-8 py-4 text-xs font-black text-slate-400 hover:text-slate-900 uppercase tracking-[0.2em]">{t.discard}</button>
              <button onClick={() => upsertMutation.mutate(newSub)} disabled={!newSub.name || !newSub.url || upsertMutation.isPending} className="px-12 py-5 bg-blue-600 text-white rounded-[1.5rem] text-xs font-black disabled:opacity-30 flex items-center gap-3 shadow-2xl shadow-blue-200 uppercase tracking-[0.2em] active:scale-95 transition-all">{upsertMutation.isPending && <Loader2 size={20} className="animate-spin" />} {editId ? t.update : t.activate}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
