import { useState, useEffect } from 'react';
import { Plus, Trash2, Loader2, Globe, ExternalLink, Edit3, Copy, Check, FileText, Download } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const API_BASE = 'http://localhost:8000/api/v1';

const translations = {
  en: {
    title: "Anime Garden",
    dashboard: "Trackers",
    history: "History",
    settings: "Settings",
    addTracker: "New Tracker",
    syncInterval: "Auto-sync active",
    subTarget: "Anime Name",
    mode: "Mode",
    lastSync: "Last Sync",
    actions: "Actions",
    noTrackers: "No trackers.",
    archiveMode: "Archive",
    monitorMode: "Monitor",
    autoTracking: "Auto",
    waiting: "Syncing...",
    newSub: "New Tracker",
    editSub: "Edit Tracker",
    configTracker: "Configure your tracker",
    animeTitle: "Anime Title",
    rssUrl: "RSS URL",
    keywords: "Keywords",
    downloadHist: "Download history",
    histDesc: "All existing items",
    monitorDesc: "Future only",
    discard: "Cancel",
    activate: "Activate",
    update: "Update",
    ariaStatus: "Aria2 RPC",
    ariaRpc: "RPC URL",
    ariaSecret: "Token",
    storage: "Defined in Aria2 config.",
    openAriaNg: "Open Monitor",
    saveSettings: "Save",
    downloadStatus: "Status",
    episodeTitle: "Episode",
    timestamp: "Time",
    status_submitted: "Success",
    status_skipped: "Skipped",
    status_failed: "Failed",
    status_pending: "Wait",
    settingsSaved: "Saved!",
    connectionTip: "Use NAS IP for RPC.",
    copyAll: "Copy All Magnets",
    exportTxt: "Export .txt",
    copied: "All copied!"
  },
  cn: {
    title: "动漫花园",
    dashboard: "订阅列表",
    history: "下载历史",
    settings: "系统设置",
    addTracker: "添加追踪",
    syncInterval: "自动监控已开启",
    subTarget: "动画名称",
    mode: "模式",
    lastSync: "最后同步",
    actions: "操作",
    noTrackers: "暂无订阅。",
    archiveMode: "补完",
    monitorMode: "追踪",
    autoTracking: "自动",
    waiting: "同步中...",
    newSub: "添加订阅",
    editSub: "编辑订阅",
    configTracker: "配置规则",
    animeTitle: "动画名称",
    rssUrl: "RSS 链接",
    keywords: "关键字",
    downloadHist: "下载历史集数",
    histDesc: "下载所有匹配项",
    monitorDesc: "仅追踪新番",
    discard: "取消",
    activate: "激活",
    update: "更新",
    ariaStatus: "Aria2 配置",
    ariaRpc: "RPC 地址",
    ariaSecret: "密钥",
    storage: "路径请在 Aria2 中设置。",
    openAriaNg: "打开监控",
    saveSettings: "保存",
    downloadStatus: "状态",
    episodeTitle: "剧集名称",
    timestamp: "时间",
    status_submitted: "成功",
    status_skipped: "跳过",
    status_failed: "失败",
    status_pending: "等待",
    settingsSaved: "已保存！",
    connectionTip: "提示：无法连接请检查 IP。",
    copyAll: "复制全部磁力链",
    exportTxt: "导出为 .txt",
    copied: "已复制到剪贴板"
  },
  jp: {
    title: "アニメガーデン",
    dashboard: "トラッカー",
    history: "履歴",
    settings: "設定",
    addTracker: "新規追加",
    syncInterval: "自動監視中",
    subTarget: "タイトル",
    mode: "モード",
    lastSync: "最終同期",
    actions: "操作",
    noTrackers: "なし。",
    archiveMode: "アーカイブ",
    monitorMode: "監視",
    autoTracking: "自動",
    waiting: "同期中...",
    newSub: "新規登録",
    editSub: "登録編集",
    configTracker: "設定",
    animeTitle: "タイトル",
    rssUrl: "RSS URL",
    keywords: "キーワード",
    downloadHist: "履歴取得",
    histDesc: "既存分も取得",
    monitorDesc: "今後の分のみ",
    discard: "キャンセル",
    activate: "有効化",
    update: "更新",
    ariaStatus: "Aria2 設定",
    ariaRpc: "RPC URL",
    ariaSecret: "トークン",
    storage: "Aria2で設定してください。",
    openAriaNg: "モニタ",
    saveSettings: "保存",
    downloadStatus: "状態",
    episodeTitle: "タイトル",
    timestamp: "日時",
    status_submitted: "成功",
    status_skipped: "スキップ",
    status_failed: "失敗",
    status_pending: "保留",
    settingsSaved: "保存完了！",
    connectionTip: "IPを確認してください。",
    copyAll: "全コピー",
    exportTxt: ".txt出力",
    copied: "コピーしました"
  }
};

type Lang = 'en' | 'cn' | 'jp';
type View = 'dashboard' | 'history' | 'settings';

function Logo() {
  return (
    <div className="relative w-8 h-8 group">
      <svg viewBox="0 0 100 100" className="w-full h-full transition-transform duration-300 group-hover:scale-105">
        <defs><linearGradient id="lg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#2563EB" /><stop offset="100%" stopColor="#4F46E5" /></linearGradient></defs>
        <rect width="100" height="100" rx="24" fill="url(#lg)" />
        <path d="M40 35 L70 50 L40 65 Z" fill="white" />
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
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [isBatchCopied, setIsBatchCopied] = useState(false);

  const t = translations[lang];
  useEffect(() => { localStorage.setItem('lang', lang); }, [lang]);

  const { data: subscriptions } = useQuery({ queryKey: ['subscriptions'], queryFn: async () => (await axios.get(`${API_BASE}/subscriptions/`)).data, enabled: view === 'dashboard' });
  const { data: historyList } = useQuery({ queryKey: ['history'], queryFn: async () => (await axios.get(`${API_BASE}/history/`)).data, enabled: view === 'history' });
  const { data: appSettings } = useQuery({ queryKey: ['settings'], queryFn: async () => (await axios.get(`${API_BASE}/settings/`)).data, enabled: view === 'settings' });

  useEffect(() => { if (appSettings) setEditSettings(appSettings); }, [appSettings]);

  const saveSettingsMutation = useMutation({ mutationFn: (data: typeof editSettings) => axios.put(`${API_BASE}/settings/`, data), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['settings'] }); alert(t.settingsSaved); } });
  const upsertMutation = useMutation({ mutationFn: (sub: typeof newSub) => { const filters = sub.keywords ? sub.keywords.split(',').map(kw => ({ keyword: kw.trim(), type: 'include' })) : []; const payload = { ...sub, filters }; if (editId) return axios.patch(`${API_BASE}/subscriptions/${editId}`, payload); return axios.post(`${API_BASE}/subscriptions/`, payload); }, onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['subscriptions'] }); closeModal(); setTimeout(() => queryClient.invalidateQueries({ queryKey: ['subscriptions'] }), 2000); } });
  const toggleMutation = useMutation({ mutationFn: ({id, active}: {id: number, active: boolean}) => axios.patch(`${API_BASE}/subscriptions/${id}`, { is_active: active }), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['subscriptions'] }); setTimeout(() => queryClient.invalidateQueries({ queryKey: ['subscriptions'] }), 2000); } });
  const deleteMutation = useMutation({ mutationFn: (id: number) => axios.delete(`${API_BASE}/subscriptions/${id}`), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['subscriptions'] }) });

  const openEdit = (sub: any) => { setEditId(sub.id); setNewSub({ name: sub.name, url: sub.url, download_history: sub.download_history, keywords: sub.filters?.map((f:any) => f.keyword).join(', ') || '' }); setIsModalOpen(true); };
  const closeModal = () => { setIsModalOpen(false); setEditId(null); setNewSub({ name: '', url: '', download_history: false, keywords: '' }); };

  const getAriaNgLink = () => {
    try {
      let rpc = editSettings.aria2_rpc_url || 'http://localhost:6800/jsonrpc';
      if (rpc.includes('//aria2:')) rpc = rpc.replace('//aria2:', `//${window.location.hostname}:`);
      const urlObj = new URL(rpc);
      const secretBase64 = btoa(editSettings.aria2_rpc_secret || '');
      return `http://${window.location.hostname}:6880/#!/settings/rpc/set/${urlObj.protocol.replace(':','')}/${urlObj.hostname}/${urlObj.port || (urlObj.protocol === 'https:' ? '443' : '80')}/jsonrpc/${secretBase64}`;
    } catch (e) { return `http://${window.location.hostname}:6880`; }
  };

  const copyToClipboard = (text: string, id: number | string) => {
    navigator.clipboard.writeText(text);
    if (typeof id === 'number') {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } else {
      setIsBatchCopied(true);
      setTimeout(() => setIsBatchCopied(false), 2000);
    }
  };

  const exportAsTxt = () => {
    if (!historyList) return;
    const content = historyList.map((item: any) => item.magnet_link).join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `anime_magnets_${new Date().toISOString().split('T')[0]}.txt`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-slate-700 font-sans antialiased selection:bg-blue-100">
      <header className="bg-white border-b border-slate-200 px-6 py-3 flex justify-between items-center sticky top-0 z-40 shadow-sm">
        <div onClick={() => setView('dashboard')} className="flex items-center gap-2.5 cursor-pointer group">
          <Logo />
          <div>
            <h1 className="text-sm font-bold tracking-tight text-slate-900">{lang === 'cn' ? '动漫花园RSS订阅工具' : t.title}</h1>
            <p className="text-[9px] font-bold text-blue-500 uppercase tracking-widest leading-none">Powered by NAS</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <nav className="flex bg-slate-100 p-0.5 rounded-lg">
            {(['dashboard', 'history', 'settings'] as View[]).map((v) => (
              <button key={v} onClick={() => setView(v)} className={`px-4 py-1.5 rounded-md text-[11px] font-bold transition-all ${view === v ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>{t[v]}</button>
            ))}
          </nav>
          <div className="flex bg-slate-100 p-0.5 rounded-lg">
            {(['en', 'cn', 'jp'] as Lang[]).map((l) => (
              <button key={l} onClick={() => setLang(l)} className={`w-7 py-1.5 rounded-md text-[9px] font-bold uppercase transition-all ${lang === l ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>{l}</button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto w-full p-8 animate-in fade-in duration-300">
        {view === 'dashboard' && (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">{t.dashboard}</h2>
              <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold transition-all shadow-sm active:scale-95 text-[12px]"><Plus size={16} strokeWidth={3} /> {t.addTracker}</button>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50/50 border-b border-slate-200 text-slate-400 text-[9px] font-bold uppercase tracking-wider">
                  <tr><th className="px-6 py-3">{t.subTarget}</th><th className="px-6 py-3">{t.mode}</th><th className="px-6 py-3">{t.lastSync}</th><th className="px-6 py-3 text-right">{t.actions}</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[13px]">
                  {subscriptions?.map((sub: any) => (
                    <tr key={sub.id} className={`hover:bg-slate-50/50 transition-colors group ${!sub.is_active ? 'opacity-50' : ''}`}>
                      <td className="px-6 py-4 font-semibold text-slate-800">{sub.name}<div className="text-[10px] text-slate-400 truncate max-w-xs font-normal mt-0.5">{sub.url}</div></td>
                      <td className="px-6 py-4"><span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${sub.download_history ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>{sub.download_history ? t.archiveMode : t.monitorMode}</span></td>
                      <td className="px-6 py-4 text-[11px] text-slate-400 tabular-nums">{sub.last_checked_at ? new Date(sub.last_checked_at).toLocaleString() : t.waiting}</td>
                      <td className="px-6 py-4 text-right"><div className="flex justify-end items-center gap-3">
                        <label className="relative inline-flex items-center cursor-pointer scale-90"><input type="checkbox" className="sr-only peer" checked={sub.is_active} onChange={() => toggleMutation.mutate({id: sub.id, active: !sub.is_active})} /><div className="w-9 h-5 bg-slate-200 rounded-full peer peer-checked:after:translate-x-4 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div></label>
                        <button onClick={() => openEdit(sub)} className="p-1.5 text-slate-300 hover:text-blue-500 transition-all"><Edit3 size={16} /></button>
                        <button onClick={() => deleteMutation.mutate(sub.id)} className="p-1.5 text-slate-300 hover:text-red-500 transition-all"><Trash2 size={16} /></button>
                      </div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {view === 'history' && (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">{t.history}</h2>
              <div className="flex gap-2">
                <button 
                  onClick={() => copyToClipboard(historyList?.map((i:any) => i.magnet_link).join('\n') || '', 'batch')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-[11px] transition-all shadow-sm ${isBatchCopied ? 'bg-green-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                >
                  {isBatchCopied ? <Check size={14}/> : <Copy size={14}/>} {isBatchCopied ? t.copied : t.copyAll}
                </button>
                <button 
                  onClick={exportAsTxt}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-[11px] shadow-sm transition-all"
                >
                  <FileText size={14}/> {t.exportTxt}
                </button>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="divide-y divide-slate-100">
                {historyList?.map((item: any) => (
                  <div key={item.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between gap-4 group">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider border ${
                          item.status === 'submitted' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                          item.status === 'skipped' ? 'bg-slate-50 text-slate-400 border-slate-100' : 'bg-rose-50 text-rose-600 border-rose-100'
                        }`}>{t[`status_${item.status}` as keyof typeof t] || item.status}</span>
                        <span className="text-[10px] text-slate-300 tabular-nums">{new Date(item.created_at).toLocaleString()}</span>
                      </div>
                      <h3 className="text-[13px] font-semibold text-slate-700 leading-snug truncate pr-4">{item.title}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => copyToClipboard(item.magnet_link, item.id)}
                        className={`p-2 rounded-lg transition-all ${copiedId === item.id ? 'bg-green-50 text-green-600' : 'text-slate-300 hover:bg-slate-100 hover:text-slate-600'}`}
                        title="Copy Magnet Link"
                      >
                        {copiedId === item.id ? <Check size={14}/> : <Copy size={14}/>}
                      </button>
                      <a href={item.magnet_link} className="p-2 text-slate-300 hover:bg-slate-100 hover:text-blue-600 rounded-lg transition-all"><ExternalLink size={14} /></a>
                    </div>
                  </div>
                ))}
                {(!historyList || historyList.length === 0) && (
                  <div className="py-20 text-center text-slate-300 text-sm italic">{t.noTrackers}</div>
                )}
              </div>
            </div>
          </>
        )}

        {view === 'settings' && (
          <>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight mb-6">{t.settings}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 mb-6 text-slate-900 font-bold text-sm"><Globe size={16} className="text-blue-600" /> {t.ariaStatus}</div>
                <div className="space-y-4">
                  <div><label className="text-[10px] font-bold text-slate-400 uppercase mb-1.5 block tracking-wider">{t.ariaRpc}</label><input type="text" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none text-xs font-mono" value={editSettings.aria2_rpc_url} onChange={e => setEditSettings({...editSettings, aria2_rpc_url: e.target.value})} /></div>
                  <div><label className="text-[10px] font-bold text-slate-400 uppercase mb-1.5 block tracking-wider">{t.ariaSecret}</label><input type="password" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none text-xs" value={editSettings.aria2_rpc_secret} onChange={e => setEditSettings({...editSettings, aria2_rpc_secret: e.target.value})} /></div>
                  <div className="flex gap-3 pt-2">
                    <button onClick={() => saveSettingsMutation.mutate(editSettings)} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-bold text-[11px] shadow-sm transition-all">{t.saveSettings}</button>
                    <a href={getAriaNgLink()} target="_blank" className="flex-1 bg-slate-800 hover:bg-black text-white py-2 rounded-lg font-bold text-[11px] flex justify-center items-center gap-1.5">{t.openAriaNg} <ExternalLink size={12}/></a>
                  </div>
                </div>
              </div>
              <div className="bg-slate-100 p-6 rounded-xl border border-slate-200 flex flex-col justify-between">
                <div><h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">System</h3><p className="text-slate-600 text-xs leading-relaxed font-medium italic">RSS Monitoring Engine</p></div>
                <div className="pt-4 border-t border-slate-200/50 flex justify-between items-center font-mono text-[9px] text-slate-400 uppercase tracking-widest"><span>Node Status</span><span className="text-green-500 font-bold">Online</span></div>
              </div>
            </div>
          </>
        )}
      </main>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <div><h3 className="font-bold text-base text-slate-900">{editId ? t.editSub : t.newSub}</h3><p className="text-[9px] text-blue-500 font-bold uppercase tracking-wider">{t.configTracker}</p></div>
              <button onClick={closeModal} className="text-slate-300 hover:text-slate-900 transition-all text-xl font-light">×</button>
            </div>
            <div className="p-6 space-y-5">
              <div className="space-y-4">
                <div className="space-y-1.5"><label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t.animeTitle}</label><input type="text" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-lg outline-none font-semibold text-slate-800 text-sm" placeholder="Frieren" value={newSub.name} onChange={e => setNewSub({...newSub, name: e.target.value})} /></div>
                <div className="space-y-1.5"><label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t.rssUrl}</label><input type="text" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-lg outline-none font-semibold text-slate-800 text-[11px] font-mono" placeholder="https://..." value={newSub.url} onChange={e => setNewSub({...newSub, url: e.target.value})} /></div>
                <div className="space-y-1.5"><label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t.keywords}</label><input type="text" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-lg outline-none font-semibold text-slate-800 text-sm" placeholder="简繁内封, 1080P" value={newSub.keywords} onChange={e => setNewSub({...newSub, keywords: e.target.value})} /></div>
              </div>
              {!editId && (
                <div className={`flex items-center gap-3 p-4 rounded-xl border transition-all cursor-pointer ${newSub.download_history ? 'bg-orange-50/50 border-orange-100' : 'bg-blue-50/50 border-blue-100'}`} onClick={() => setNewSub({...newSub, download_history: !newSub.download_history})}>
                  <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-600" checked={newSub.download_history} readOnly />
                  <div className="flex-1"><span className={`block text-xs font-bold uppercase ${newSub.download_history ? 'text-orange-900' : 'text-blue-900'}`}>{t.downloadHist}</span><p className="text-[9px] font-medium opacity-60 leading-none mt-0.5">{newSub.download_history ? t.histDesc : t.monitorDesc}</p></div>
                </div>
              )}
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t flex justify-end gap-3">
              <button onClick={closeModal} className="px-4 py-2 text-[10px] font-bold text-slate-400 hover:text-slate-700 uppercase tracking-widest">{t.discard}</button>
              <button onClick={() => upsertMutation.mutate(newSub)} disabled={!newSub.name || !newSub.url || upsertMutation.isPending} className="px-6 py-2 bg-blue-600 text-white rounded-lg text-[11px] font-bold disabled:opacity-30 flex items-center gap-2 shadow-sm transition-all hover:bg-blue-700">{upsertMutation.isPending && <Loader2 size={14} className="animate-spin" />} {editId ? t.update : t.activate}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
