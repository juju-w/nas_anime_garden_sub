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
    episodeTitle: "Episode Name",
    timestamp: "Processed At",
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
    downloadStatus: "处理状态",
    episodeTitle: "剧集名称",
    timestamp: "处理时间",
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
    episodeTitle: "エピソード名",
    timestamp: "処理日時",
    status_submitted: "送信済み",
    status_skipped: "スキップ",
    status_failed: "失敗",
    status_pending: "保留中",
    settingsSaved: "保存しました！",
    connectionTip: "ヒント：接続できない場合は、localhost を实际の IP に変更してください。",
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
        <path d="M50 5 L89 27.5 L89 72.5 L50 95 L11 72.5 L11 27.5 Z" fill="url(#logo-gradient)" />
        <path d="M42 35 L65 50 L42 65 Z" fill="white" />
        <path d="M75 20 Q85 10 95 20 Q85 30 75 20" fill="#34D399" className="animate-pulse" />
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
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200/60 px-10 py-5 flex justify-between items-center sticky top-0 z-40 shadow-sm font-black">
        <div onClick={() => setView('dashboard')} className="flex items-center gap-4 cursor-pointer group">
          <Logo />
          <div><h1 className="text-xl tracking-tight text-slate-800 uppercase italic">{t.title}</h1><p className="text-[10px] text-blue-600 uppercase tracking-[0.3em] leading-none mt-1">Private NAS Node</p></div>
        </div>
        <div className="flex items-center gap-8">
          <nav className="flex bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/50 shadow-inner">
            {(['dashboard', 'history', 'settings'] as View[]).map((v) => (
              <button key={v} onClick={() => setView(v)} className={`px-6 py-2.5 rounded-xl text-[11px] transition-all uppercase tracking-widest ${view === v ? 'bg-white text-blue-600 shadow-md ring-1 ring-black/5' : 'text-slate-400 hover:text-slate-800'}`}>{t[v]}</button>
            ))}
          </nav>
          <div className="flex items-center gap-2 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/50">
            {(['en', 'cn', 'jp'] as Lang[]).map((l) => (
              <button key={l} onClick={() => setLang(l)} className={`w-10 py-2 rounded-xl text-[10px] uppercase transition-all ${lang === l ? 'bg-white text-blue-600 shadow-sm ring-1 ring-black/5' : 'text-slate-400 hover:text-slate-600'}`}>{l}</button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto w-full p-12">
        {view === 'dashboard' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex justify-between items-end mb-12">
              <div>
                <h2 className="text-5xl font-black text-slate-900 tracking-tighter mb-4">{t.dashboard}</h2>
                <div className="flex items-center gap-3 text-slate-500 bg-white w-fit px-5 py-2.5 rounded-full border border-slate-200 shadow-sm ring-1 ring-slate-100">
                  <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-sm shadow-green-300" />
                  <p className="text-[11px] font-black uppercase tracking-[0.2em]">{t.syncInterval}</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-10 py-5 rounded-[1.5rem] font-black shadow-2xl shadow-blue-200 active:scale-95 text-xs uppercase tracking-widest transition-all"><Plus size={20} strokeWidth={4} /> {t.addTracker}</button>
            </div>
            <div className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200/40 border border-slate-200/60 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50/50 border-b border-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-[0.25em]">
                  <tr><th className="px-12 py-8">{t.subTarget}</th><th className="px-12 py-8">{t.mode}</th><th className="px-12 py-8">{t.lastSync}</th><th className="px-12 py-8 text-right">{t.actions}</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-50 font-black">
                  {subscriptions?.map((sub: any) => (
                    <tr key={sub.id} className={`hover:bg-slate-50/40 transition-all group ${!sub.is_active ? 'opacity-40 grayscale-[0.5]' : ''}`}>
                      <td className="px-12 py-10"><div className="text-slate-800 text-2xl tracking-tight group-hover:text-blue-600 transition-colors leading-tight mb-2">{sub.name}</div><div className="text-xs text-slate-400 truncate max-w-sm font-bold opacity-60 font-mono tracking-tighter italic">{sub.url}</div></td>
                      <td className="px-12 py-10"><span className={`inline-flex items-center px-4 py-1.5 rounded-full text-[10px] uppercase tracking-widest border-2 ${sub.download_history ? 'bg-orange-50/50 text-orange-600 border-orange-100' : 'bg-blue-50/50 text-blue-600 border-blue-100'}`}>{sub.download_history ? t.archiveMode : t.monitorMode}</span></td>
                      <td className="px-12 py-10 text-[13px] text-slate-400 tabular-nums uppercase">{sub.last_checked_at ? new Date(sub.last_checked_at).toLocaleString() : t.waiting}</td>
                      <td className="px-12 py-10 text-right">
                        <div className="flex justify-end items-center gap-6">
                          <label className="relative inline-flex items-center cursor-pointer scale-125"><input type="checkbox" className="sr-only peer" checked={sub.is_active} onChange={() => toggleMutation.mutate({id: sub.id, active: !sub.is_active})} /><div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div></label>
                          <div className="flex items-center gap-2"><button onClick={() => openEdit(sub)} className="p-3 text-slate-300 hover:text-blue-600 transition-all rounded-2xl hover:bg-white hover:shadow-lg active:scale-90"><Edit3 size={24} strokeWidth={2.5} /></button><button onClick={() => deleteMutation.mutate(sub.id)} className="p-3 text-slate-300 hover:text-red-500 transition-all rounded-2xl hover:bg-white hover:shadow-lg active:scale-90"><Trash2 size={24} strokeWidth={2.5} /></button></div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {view === 'history' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h2 className="text-5xl font-black text-slate-900 tracking-tighter mb-12 uppercase italic">{t.history}</h2>
            <div className="grid grid-cols-1 gap-6">
              {historyList?.map((item: any) => (
                <div key={item.id} className="bg-white p-10 rounded-[3rem] shadow-2xl shadow-slate-200/20 border border-slate-200/60 hover:border-blue-300 transition-all group relative overflow-hidden">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-10 relative z-10 font-black">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-5 mb-5">
                        <span className={`inline-flex items-center gap-2 px-5 py-2 rounded-full text-[11px] uppercase tracking-[0.2em] border-2 shadow-sm ${
                          item.status === 'submitted' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                          item.status === 'skipped' ? 'bg-slate-50 text-slate-400 border-slate-100' : 'bg-rose-50 text-rose-600 border-rose-100'
                        }`}>
                          {item.status === 'submitted' ? <CheckCircle2 size={16} strokeWidth={4}/> : item.status === 'skipped' ? <Clock size={16} strokeWidth={4}/> : <XCircle size={16} strokeWidth={4}/>}
                          {t[(`status_${item.status}` as keyof typeof t)] || item.status}
                        </span>
                        <span className="text-xs text-slate-300 uppercase tracking-widest tabular-nums opacity-60">
                          {new Date(item.created_at).toLocaleString()}
                        </span>
                      </div>
                      <h3 className="text-3xl text-slate-800 leading-[1.1] tracking-tighter group-hover:text-blue-600 transition-colors">
                        {item.title}
                      </h3>
                      <div className="mt-5 flex items-center gap-3 text-slate-400 font-mono text-[10px] bg-slate-50 w-fit px-4 py-2 rounded-xl border border-slate-100 truncate max-w-full italic opacity-50">
                        {item.magnet_link}
                      </div>
                    </div>
                    <a href={item.magnet_link} className="p-6 bg-slate-50 text-slate-400 hover:bg-blue-600 hover:text-white transition-all rounded-[2rem] shadow-inner group-hover:shadow-blue-100">
                      <ExternalLink size={28} strokeWidth={4} />
                    </a>
                  </div>
                  <div className="absolute -right-6 -bottom-6 text-slate-50 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none italic font-black text-9xl">TRACK</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === 'settings' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h2 className="text-5xl font-black text-slate-900 tracking-tighter mb-12 uppercase italic">{t.settings}</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              <div className="lg:col-span-2 space-y-10">
                <div className="bg-white p-14 rounded-[4rem] shadow-2xl border border-slate-200/60 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-12 opacity-[0.03]"><Layout size={240} /></div>
                  <div className="flex items-center gap-6 mb-14"><div className="w-16 h-16 bg-blue-600 text-white rounded-[1.5rem] flex items-center justify-center shadow-2xl shadow-blue-200"><Globe size={32} strokeWidth={3} /></div><h3 className="text-4xl font-black tracking-tighter">{t.ariaStatus}</h3></div>
                  <div className="space-y-12 relative z-10 font-black uppercase">
                    <div className="grid grid-cols-1 gap-10">
                      <div className="space-y-4"><label className="text-[10px] text-slate-400 tracking-[0.4em] flex items-center gap-2 ml-2"><Database size={12} strokeWidth={4} /> {t.ariaRpc}</label><input type="text" className="w-full px-10 py-7 bg-slate-50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-[2rem] outline-none transition-all text-slate-700 shadow-inner text-xl font-mono" value={editSettings.aria2_rpc_url} onChange={e => setEditSettings({...editSettings, aria2_rpc_url: e.target.value})} /></div>
                      <div className="space-y-4"><label className="text-[10px] text-slate-400 tracking-[0.4em] flex items-center gap-2 ml-2"><ShieldCheck size={12} strokeWidth={4} /> {t.ariaSecret}</label><input type="password" className="w-full px-10 py-7 bg-slate-50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-[2rem] outline-none transition-all text-slate-700 shadow-inner text-xl font-mono" value={editSettings.aria2_rpc_secret} onChange={e => setEditSettings({...editSettings, aria2_rpc_secret: e.target.value})} /></div>
                    </div>
                    <div className="bg-blue-50/50 p-8 rounded-[2rem] border-2 border-blue-100/50"><p className="text-[11px] text-blue-600 leading-relaxed italic tracking-widest">{t.connectionTip}</p></div>
                    <div className="flex flex-col sm:flex-row gap-8 pt-6">
                      <button onClick={() => saveSettingsMutation.mutate(editSettings)} className="flex-1 flex items-center justify-center gap-4 bg-blue-600 text-white py-7 rounded-[2.5rem] hover:bg-blue-700 shadow-2xl shadow-blue-200 active:scale-95 text-xs tracking-[0.2em] transition-all"><Save size={24} strokeWidth={4} /> {t.saveSettings}</button>
                      <a href={getAriaNgLink()} target="_blank" className="flex-1 flex items-center justify-center gap-4 bg-slate-900 text-white py-7 rounded-[2.5rem] hover:bg-black shadow-2xl active:scale-95 text-xs tracking-[0.2em] transition-all"><Monitor size={24} strokeWidth={4} /> {t.openAriaNg} <ExternalLink size={20} strokeWidth={4} className="opacity-30" /></a>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-blue-800 to-indigo-950 p-16 rounded-[4rem] shadow-2xl text-white flex flex-col justify-between border border-white/5 relative overflow-hidden group">
                <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-all duration-1000" />
                <div><h3 className="text-4xl font-black mb-10 tracking-tighter italic underline decoration-white/10 underline-offset-[16px]">Core</h3><p className="text-blue-100 text-xl leading-relaxed font-black opacity-70 italic">V1.5 RELAY</p></div>
                <div className="space-y-10 pt-16 border-t border-white/5"><div className="flex justify-between items-center text-[11px] font-black uppercase tracking-[0.4em] opacity-40"><span>Node Integrity</span><span className="bg-green-400 w-4 h-4 rounded-full animate-ping" /></div><div className="flex justify-between items-center"><span className="text-[11px] font-black uppercase tracking-[0.4em] opacity-40">Build</span><span className="font-mono text-xs bg-white/5 px-6 py-2.5 rounded-2xl border border-white/10 shadow-2xl">2026.02.26</span></div></div>
              </div>
            </div>
          </div>
        )}
      </main>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-3xl flex items-center justify-center p-6 z-50 animate-in fade-in duration-500 font-black uppercase">
          <div className="bg-white rounded-[5rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-white/10 p-2">
            <div className="bg-slate-50/50 rounded-[4.5rem] overflow-hidden">
              <div className="px-16 py-14 flex justify-between items-center bg-white border-b border-slate-100">
                <div><h3 className="text-4xl text-slate-900 leading-none tracking-tighter">{editId ? t.editSub : t.newSub}</h3><p className="text-[11px] text-blue-600 mt-5 tracking-[0.5em]">{t.configTracker}</p></div>
                <button onClick={closeModal} className="p-6 hover:bg-slate-50 rounded-full text-slate-200 hover:text-slate-900 transition-all text-5xl font-thin leading-none">×</button>
              </div>
              <div className="p-16 space-y-12">
                <div className="space-y-10">
                  <div className="space-y-4"><label className="block text-[10px] text-slate-400 tracking-[0.4em] ml-3">{t.animeTitle}</label><input type="text" className="w-full px-10 py-7 bg-white border-2 border-slate-100 focus:border-blue-600 rounded-[2.5rem] outline-none transition-all text-slate-800 shadow-sm text-2xl" placeholder="Frieren" value={newSub.name} onChange={e => setNewSub({...newSub, name: e.target.value})} /></div>
                  <div className="space-y-4"><label className="block text-[10px] text-slate-400 tracking-[0.4em] ml-3">{t.rssUrl}</label><input type="text" className="w-full px-10 py-7 bg-white border-2 border-slate-100 focus:border-blue-600 rounded-[2.5rem] outline-none transition-all text-slate-800 shadow-sm text-2xl font-mono" placeholder="https://..." value={newSub.url} onChange={e => setNewSub({...newSub, url: e.target.value})} /></div>
                  <div className="space-y-4"><label className="block text-[10px] text-slate-400 tracking-[0.4em] ml-3">{t.keywords}</label><input type="text" className="w-full px-10 py-7 bg-white border-2 border-slate-100 focus:border-blue-600 rounded-[2.5rem] outline-none transition-all text-slate-800 shadow-sm text-2xl" placeholder="简繁内封, 1080P" value={newSub.keywords} onChange={e => setNewSub({...newSub, keywords: e.target.value})} /></div>
                </div>
                {!editId && (
                  <div className={`flex items-center gap-8 p-12 rounded-[3.5rem] border-4 transition-all cursor-pointer shadow-xl ${newSub.download_history ? 'bg-orange-50/50 border-orange-200' : 'bg-blue-50/50 border-blue-200'}`} onClick={() => setNewSub({...newSub, download_history: !newSub.download_history})}>
                    <input type="checkbox" className="w-10 h-10 rounded-2xl text-blue-600 pointer-events-none border-4" checked={newSub.download_history} readOnly />
                    <div className="flex-1"><span className={`block text-2xl tracking-tight ${newSub.download_history ? 'text-orange-900' : 'text-blue-900'}`}>{t.downloadHist}</span><span className={`block text-[11px] mt-3 tracking-[0.3em] opacity-50 ${newSub.download_history ? 'text-orange-600' : 'text-blue-600'}`}>{newSub.download_history ? t.histDesc : t.monitorDesc}</span></div>
                  </div>
                )}
              </div>
              <div className="px-16 py-14 bg-white border-t border-slate-100 flex justify-end gap-10">
                <button onClick={closeModal} className="px-12 py-6 text-xs text-slate-400 hover:text-slate-900 tracking-[0.4em] transition-colors">{t.discard}</button>
                <button onClick={() => upsertMutation.mutate(newSub)} disabled={!newSub.name || !newSub.url || upsertMutation.isPending} className="px-16 py-7 bg-blue-600 text-white rounded-[2.5rem] text-sm disabled:opacity-30 flex items-center gap-5 shadow-2xl shadow-blue-200 tracking-[0.4em] active:scale-95 transition-all hover:bg-blue-700">{upsertMutation.isPending && <Loader2 size={28} className="animate-spin" />} {editId ? t.update : t.activate}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
