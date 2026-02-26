import { useState } from 'react';
import { Plus, Trash2, Play, Settings, History, Info, Loader2, Filter as FilterIcon } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const API_BASE = 'http://localhost:8000/api/v1';

interface Subscription {
  id: number;
  name: string;
  url: string;
  is_active: boolean;
  download_history: boolean;
  last_checked_at?: string;
}

function App() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSub, setNewSub] = useState({ 
    name: '', 
    url: '', 
    download_history: false,
    keywords: '' 
  });

  const { data: subscriptions, isLoading } = useQuery({
    queryKey: ['subscriptions'],
    queryFn: async () => {
      const res = await axios.get(`${API_BASE}/subscriptions/`);
      return res.data as Subscription[];
    }
  });

  const createMutation = useMutation({
    mutationFn: (sub: typeof newSub) => {
      const filters = sub.keywords 
        ? sub.keywords.split(',').map(kw => ({ keyword: kw.trim(), type: 'include' }))
        : [];
      return axios.post(`${API_BASE}/subscriptions/`, { 
        name: sub.name, 
        url: sub.url, 
        download_history: sub.download_history,
        filters 
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      setIsModalOpen(false);
      setNewSub({ name: '', url: '', download_history: false, keywords: '' });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => axios.delete(`${API_BASE}/subscriptions/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
    }
  });

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <header className="bg-white border-b px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-blue-200">
            <Play size={24} fill="currentColor" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-gray-800">Anime Garden Sub</h1>
        </div>
        <div className="flex gap-4">
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
            <History size={18} /> History
          </button>
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
            <Settings size={18} /> Settings
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Subscriptions</h2>
            <p className="text-gray-500 text-sm mt-1">Automatic RSS monitoring is active (Interval: 10m).</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-md active:scale-95"
          >
            <Plus size={20} />
            Add Tracker
          </button>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Loader2 className="animate-spin mb-4" size={40} />
            <p className="font-medium">Initializing trackers...</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-50/50 border-b text-gray-400 text-[11px] font-bold uppercase tracking-widest">
                <tr>
                  <th className="px-6 py-4">Subscription Target</th>
                  <th className="px-6 py-4">Mode</th>
                  <th className="px-6 py-4">Last Sync</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {subscriptions?.map((sub) => (
                  <tr key={sub.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="font-bold text-gray-800 group-hover:text-blue-600 transition-colors">{sub.name}</div>
                      <div className="text-xs text-gray-400 truncate max-w-xs font-mono">{sub.url}</div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-1">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-600 uppercase">
                          {sub.download_history ? 'Full Archive' : 'Monitor Only'}
                        </span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-green-50 text-green-600 uppercase">
                          Auto-Tracking
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-sm text-gray-500 tabular-nums">
                      {sub.last_checked_at ? new Date(sub.last_checked_at).toLocaleString() : 'Waiting for sync...'}
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex justify-end gap-1">
                        <button className="p-2 text-gray-300 hover:text-blue-500 transition-colors rounded-lg hover:bg-blue-50">
                          <FilterIcon size={18} />
                        </button>
                        <button 
                          onClick={() => deleteMutation.mutate(sub.id)}
                          className="p-2 text-gray-300 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {subscriptions?.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <div className="p-4 bg-gray-50 rounded-full text-gray-300">
                          <Plus size={32} />
                        </div>
                        <p className="text-gray-400 font-medium">No active anime trackers.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Improved Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-8 py-6 border-b flex justify-between items-center bg-white">
              <div>
                <h3 className="font-black text-xl text-gray-900">New Subscription</h3>
                <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider font-bold">Configure Anime Tracker</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400">×</button>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">Anime Title</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
                    placeholder="e.g. Sousou no Frieren S2"
                    value={newSub.name}
                    onChange={e => setNewSub({...newSub, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">RSS Feed URL</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
                    placeholder="https://api.animes.garden/feed.xml?..."
                    value={newSub.url}
                    onChange={e => setNewSub({...newSub, url: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">Keywords (Include)</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
                    placeholder="e.g. 简繁内封, 1080P (comma separated)"
                    value={newSub.keywords}
                    onChange={e => setNewSub({...newSub, keywords: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                <input 
                  type="checkbox" 
                  id="hist"
                  className="w-5 h-5 rounded border-blue-300 text-blue-600 focus:ring-blue-500"
                  checked={newSub.download_history}
                  onChange={e => setNewSub({...newSub, download_history: e.target.checked})}
                />
                <label htmlFor="hist" className="text-sm font-bold text-blue-900 cursor-pointer">
                  Download historical episodes from feed
                  <span className="block text-[10px] text-blue-600 font-normal mt-0.5 uppercase tracking-wide">
                    {newSub.download_history ? 'Archives existing matches' : 'Only tracks future releases'}
                  </span>
                </label>
              </div>
            </div>

            <div className="px-8 py-6 bg-gray-50 border-t flex justify-end gap-3">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-800"
              >
                Discard
              </button>
              <button 
                onClick={() => createMutation.mutate(newSub)}
                disabled={!newSub.name || !newSub.url || createMutation.isPending}
                className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-black disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-blue-200 active:scale-95 transition-all"
              >
                {createMutation.isPending && <Loader2 size={16} className="animate-spin" />}
                Activate Tracker
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
