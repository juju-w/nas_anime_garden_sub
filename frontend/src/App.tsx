import { useState, useEffect } from 'react';
import { Plus, Trash2, Loader2, Globe, ExternalLink, CheckCircle2, XCircle, Clock, Save, Monitor, Edit3 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const API_BASE = 'http://localhost:8000/api/v1';

const translations = {
  en: {
    title: "Anime Garden RSS",
    dashboard: "Trackers",
    history: "Download History",
    settings: "Settings",
    addTracker: "New Tracker",
    syncInterval: "Auto-sync every 10m",
    subTarget: "Anime Name",
    mode: "Mode",
    lastSync: "Last Sync",
    actions: "Actions",
    noTrackers: "No trackers yet.",
    archiveMode: "Archive",
    monitorMode: "Monitor",
    autoTracking: "Auto",
    waiting: "Syncing...",
    newSub: "New Tracker",
    editSub: "Edit Tracker",
    configTracker: "Configure your subscription",
    animeTitle: "Anime Title",
    rssUrl: "RSS Feed URL",
    keywords: "Inclusion Keywords",
    downloadHist: "Download matches from feed history",
    histDesc: "Gets all existing episodes",
    monitorDesc: "Tracks future releases only",
    discard: "Cancel",
    activate: "Activate",
    update: "Save Changes",
    ariaStatus: "Aria2 RPC Configuration",
    ariaRpc: "RPC Server Address",
    ariaSecret: "Authentication Token",
    storage: "Downloads are stored in your Aria2 default path.",
    openAriaNg: "Open Monitor Console",
    saveSettings: "Save Config",
    downloadStatus: "Status",
    episodeTitle: "Episode Title",
    timestamp: "Time",
    status_submitted: "Success",
    status_skipped: "Skipped",
    status_failed: "Failed",
    status_pending: "Pending",
    settingsSaved: "Settings saved!",
    connectionTip: "Note: Use your NAS IP if localhost fails in browser."
  },
  cn: {
    title: "动漫花园RSS订阅工具",
    dashboard: "订阅列表",
    history: "下载历史",
    settings: "系统设置",
    addTracker: "添加追踪",
    syncInterval: "每 10 分钟自动检查",
    subTarget: "动画名称",
    mode: "同步模式",
    lastSync: "最后同步",
    actions: "操作",
    noTrackers: "暂无订阅任务。",
    archiveMode: "补完模式",
    monitorMode: "追踪模式",
    autoTracking: "自动",
    waiting: "正在同步...",
    newSub: "添加新订阅",
    editSub: "编辑规则",
    configTracker: "配置订阅与过滤规则",
    animeTitle: "动画名称",
    rssUrl: "RSS 链接",
    keywords: "包含关键字",
    downloadHist: "下载 RSS 中已有的历史集数",
    histDesc: "将获取当前 Feed 中所有匹配项",
    monitorDesc: "仅追踪未来发布的新集数",
    discard: "取消",
    activate: "激活",
    update: "保存修改",
    ariaStatus: "Aria2 RPC 连接配置",
    ariaRpc: "RPC 地址",
    ariaSecret: "RPC 密钥",
    storage: "注：下载保存路径在 Aria2 自身配置中设置。",
    openAriaNg: "打开监控面板",
    saveSettings: "保存配置",
    downloadStatus: "状态",
    episodeTitle: "剧集标题",
    timestamp: "时间",
    status_submitted: "已提交",
    status_skipped: "已跳过",
    status_failed: "失败",
    status_pending: "等待中",
    settingsSaved: "配置已保存！",
    connectionTip: "提示：如果在浏览器中无法连接，请尝试改用 NAS 的实际 IP。"
  },
  jp: {
    title: "アニメガーデンRSS登録",
    dashboard: "トラッカー",
    history: "ダウンロード履歴",
    settings: "システム設定",
    addTracker: "トラッカー追加",
    syncInterval: "10分ごとに自動チェック",
    subTarget: "タイトル",
    mode: "モード",
    lastSync: "最終同期",
    actions: "操作",
    noTrackers: "トラッカーがありません。",
    archiveMode: "アーカイブ",
    monitorMode: "監視のみ",
    autoTracking: "自動",
    waiting: "同期中...",
    newSub: "新規登録",
    editSub: "登録編集",
    configTracker: "購読とフィルタリングの設定",
    animeTitle: "タイトル",
    rssUrl: "RSS URL",
    keywords: "キーワード (含む)",
    downloadHist: "履歴からダウンロード",
    histDesc: "既存のすべてをダウンロード",
    monitorDesc: "今後の更新のみを追跡",
    discard: "キャンセル",
    activate: "有効化",
    update: "変更を保存",
    ariaStatus: "Aria2 接続設定",
    ariaRpc: "RPC アドレス",
    ariaSecret: "RPC トークン",
    storage: "注：保存先はAria2の設定で変更してください。",
    openAriaNg: "モニタ起動",
    saveSettings: "設定を保存",
    downloadStatus: "状態",
    episodeTitle: "エピソード名",
    timestamp: "日時",
    status_submitted: "送信済み",
    status_skipped: "スキップ",
    status_failed: "失敗",
    status_pending: "保留中",
    settingsSaved: "保存しました！",
    connectionTip: "ヒント：接続できない場合は、localhost を実際の IP に変更してください。"
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
    <div className="relative w-10 h-10 group">
      <svg viewBox="0 0 100 100" className="w-full h-full transition-transform duration-300 group-hover:scale-105">
        <defs>
          <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#4F46E5" />
          </linearGradient>
        </defs>
        <rect width="100" height="100" rx="24" fill="url(#logo-gradient)" />
        <path d="M40 35 L70 50 L40 65 Z" fill="white" />
        <circle cx="80" cy="20" r="10" fill="#10B981" />
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
    <div className="min-h-screen bg-[#FDFDFD] text-slate-800 font-sans selection:bg-blue-100 selection:text-blue-700">
      {/* Navbar */}
      <header className="bg-white/70 backdrop-blur-md border-b border-slate-100 px-8 py-4 flex justify-between items-center sticky top-0 z-40 shadow-sm">
        <div onClick={() => setView('dashboard')} className="flex items-center gap-3 cursor-pointer group">
          <Logo />
          <div>
            <h1 className="text-lg font-bold tracking-tight text-slate-900 leading-tight">{t.title}</h1>
            <p className="text-[10px] font-semibold text-blue-500 uppercase tracking-widest leading-none">NAS Edition</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <nav className="flex bg-slate-100 p-1 rounded-xl">
            {(['dashboard', 'history', 'settings'] as View[]).map((v) => (
              <button key={v} onClick={() => setView(v)} className={`px-5 py-1.5 rounded-lg text-xs font-bold transition-all ${view === v ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>{t[v]}</button>
            ))}
          </nav>
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
            {(['en', 'cn', 'jp'] as Lang[]).map((l) => (
              <button key={l} onClick={() => setLang(l)} className={`w-8 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${lang === l ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>{l}</button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto w-full p-10 animate-in fade-in duration-500">
        {view === 'dashboard' && (
          <>
            <div className="flex justify-between items-center mb-10">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{t.dashboard}</h2>
                <div className="flex items-center gap-2 mt-1.5">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">{t.syncInterval}</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-md shadow-blue-100 active:scale-95 text-sm tracking-tight">
                <Plus size={18} strokeWidth={2.5} /> {t.addTracker}
              </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50/50 border-b border-slate-100 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                  <tr><th className="px-8 py-5 font-bold">{t.subTarget}</th><th className="px-8 py-5 font-bold">{t.mode}</th><th className="px-8 py-5 font-bold">{t.lastSync}</th><th className="px-8 py-5 text-right font-bold">{t.actions}</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {subscriptions?.map((sub: any) => (
                    <tr key={sub.id} className={`hover:bg-slate-50/30 transition-all group ${!sub.is_active ? 'opacity-50' : ''}`}>
                      <td className="px-8 py-6">
                        <div className="font-bold text-slate-800 text-base group-hover:text-blue-600 transition-colors leading-snug">{sub.name}</div>
                        <div className="text-[11px] text-slate-400 truncate max-w-sm font-medium mt-1 opacity-70">{sub.url}</div>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`inline-flex items-center px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${sub.download_history ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                          {sub.download_history ? t.archiveMode : t.monitorMode}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-xs font-bold text-slate-400 tabular-nums">
                        {sub.last_checked_at ? new Date(sub.last_checked_at).toLocaleString() : t.waiting}
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex justify-end items-center gap-4">
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" checked={sub.is_active} onChange={() => toggleMutation.mutate({id: sub.id, active: !sub.is_active})} />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-5 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                          <div className="flex items-center gap-1">
                            <button onClick={() => openEdit(sub)} className="p-2 text-slate-300 hover:text-blue-500 transition-all rounded-lg"><Edit3 size={18} /></button>
                            <button onClick={() => deleteMutation.mutate(sub.id)} className="p-2 text-slate-300 hover:text-red-500 transition-all rounded-lg"><Trash2 size={18} /></button>
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
          <>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-8">{t.history}</h2>
            <div className="space-y-4">
              {historyList?.map((item: any) => (
                <div key={item.id} className="bg-white px-8 py-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group flex items-center justify-between gap-6">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${
                        item.status === 'submitted' ? 'bg-green-50 text-green-600 border-green-100' : 
                        item.status === 'skipped' ? 'bg-slate-50 text-slate-400 border-slate-100' : 'bg-red-50 text-red-600 border-red-100'
                      }`}>
                        {item.status === 'submitted' ? <CheckCircle2 size={12}/> : item.status === 'skipped' ? <Clock size={12}/> : <XCircle size={12}/>}
                        {t[`status_${item.status}` as keyof typeof t] || item.status}
                      </span>
                      <span className="text-[10px] font-bold text-slate-300 tabular-nums">{new Date(item.created_at).toLocaleString()}</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 leading-tight group-hover:text-blue-600 transition-colors truncate">{item.title}</h3>
                  </div>
                  <a href={item.magnet_link} className="p-3 bg-slate-50 text-slate-400 hover:bg-blue-600 hover:text-white transition-all rounded-xl shadow-inner flex-shrink-0">
                    <ExternalLink size={20} />
                  </a>
                </div>
              ))}
            </div>
          </>
        )}

        {view === 'settings' && (
          <>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-8">{t.settings}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                <div className="flex items-center gap-3 mb-8"><div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center"><Globe size={20} strokeWidth={2.5} /></div><h3 className="text-lg font-bold tracking-tight">{t.ariaStatus}</h3></div>
                <div className="space-y-6">
                  <div><label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">{t.ariaRpc}</label><input type="text" className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-xl outline-none transition-all font-bold text-slate-700 text-sm" value={editSettings.aria2_rpc_url} onChange={e => setEditSettings({...editSettings, aria2_rpc_url: e.target.value})} /></div>
                  <div><label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">{t.ariaSecret}</label><input type="password" className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-xl outline-none transition-all font-bold text-slate-700 text-sm" value={editSettings.aria2_rpc_secret} onChange={e => setEditSettings({...editSettings, aria2_rpc_secret: e.target.value})} /></div>
                  <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100/50"><p className="text-[10px] font-bold text-blue-600 leading-relaxed italic">{t.connectionTip}</p></div>
                  <div className="flex gap-4 pt-2">
                    <button onClick={() => saveSettingsMutation.mutate(editSettings)} className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 active:scale-95 text-xs transition-all shadow-md shadow-blue-100"><Save size={16} /> {t.saveSettings}</button>
                    <a href={getAriaNgLink()} target="_blank" className="flex-1 flex items-center justify-center gap-2 bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-black active:scale-95 text-xs transition-all shadow-md shadow-slate-200"><Monitor size={16} /> {t.openAriaNg}</a>
                  </div>
                </div>
              </div>
              <div className="bg-slate-900 p-10 rounded-3xl text-white flex flex-col justify-between shadow-2xl relative overflow-hidden group">
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-all duration-700" />
                <div><h3 className="text-xl font-bold mb-4 tracking-tight text-white/90">Node System</h3><p className="text-slate-400 text-sm leading-relaxed font-medium">Automatic RSS Monitoring Engine</p></div>
                <div className="pt-8 border-t border-white/5 flex justify-between items-center"><span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Build 1.5.1</span><span className="font-mono text-[10px] bg-white/10 px-3 py-1 rounded-lg">PROD-ENV</span></div>
              </div>
            </div>
          </>
        )}
      </main>

      {/* Modal - Lean & Elegant */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6 z-50 animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200">
            <div className="px-10 py-8 border-b border-slate-50 flex justify-between items-center bg-white">
              <div><h3 className="font-bold text-xl text-slate-900">{editId ? t.editSub : t.newSub}</h3><p className="text-[10px] text-blue-500 mt-1 uppercase tracking-widest font-bold">{t.configTracker}</p></div>
              <button onClick={closeModal} className="p-2 hover:bg-slate-100 rounded-full text-slate-300 hover:text-slate-900 transition-all text-2xl font-light">×</button>
            </div>
            <div className="p-10 space-y-8">
              <div className="space-y-6">
                <div className="space-y-2"><label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{t.animeTitle}</label><input type="text" className="w-full px-5 py-3.5 bg-slate-50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-xl outline-none transition-all font-bold text-slate-800 text-base" placeholder="Frieren" value={newSub.name} onChange={e => setNewSub({...newSub, name: e.target.value})} /></div>
                <div className="space-y-2"><label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{t.rssUrl}</label><input type="text" className="w-full px-5 py-3.5 bg-slate-50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-xl outline-none transition-all font-bold text-slate-800 text-sm font-mono" placeholder="https://..." value={newSub.url} onChange={e => setNewSub({...newSub, url: e.target.value})} /></div>
                <div className="space-y-2"><label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{t.keywords}</label><input type="text" className="w-full px-5 py-3.5 bg-slate-50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-xl outline-none transition-all font-bold text-slate-800 text-base" placeholder="简繁内封, 1080P" value={newSub.keywords} onChange={e => setNewSub({...newSub, keywords: e.target.value})} /></div>
              </div>
              {!editId && (
                <div className={`flex items-center gap-4 p-6 rounded-2xl border transition-all cursor-pointer ${newSub.download_history ? 'bg-orange-50/50 border-orange-100' : 'bg-blue-50/50 border-blue-100'}`} onClick={() => setNewSub({...newSub, download_history: !newSub.download_history})}>
                  <input type="checkbox" className="w-6 h-6 rounded-lg text-blue-600 pointer-events-none" checked={newSub.download_history} readOnly />
                  <div className="flex-1"><span className={`block text-sm font-bold uppercase tracking-tight ${newSub.download_history ? 'text-orange-900' : 'text-blue-900'}`}>{t.downloadHist}</span><span className={`block text-[10px] font-bold mt-1 opacity-60 ${newSub.download_history ? 'text-orange-600' : 'text-blue-600'}`}>{newSub.download_history ? t.histDesc : t.monitorDesc}</span></div>
                </div>
              )}
            </div>
            <div className="px-10 py-8 bg-slate-50/50 border-t border-slate-50 flex justify-end gap-4">
              <button onClick={closeModal} className="px-6 py-3 text-[11px] font-bold text-slate-400 hover:text-slate-700 uppercase tracking-widest">{t.discard}</button>
              <button onClick={() => upsertMutation.mutate(newSub)} disabled={!newSub.name || !newSub.url || upsertMutation.isPending} className="px-8 py-3.5 bg-blue-600 text-white rounded-xl text-xs font-bold disabled:opacity-30 flex items-center gap-3 shadow-lg shadow-blue-100 uppercase tracking-widest active:scale-95 transition-all hover:bg-blue-700">{upsertMutation.isPending && <Loader2 size={18} className="animate-spin" />} {editId ? t.update : t.activate}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
