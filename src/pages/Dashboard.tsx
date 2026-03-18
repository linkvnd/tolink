import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link2, Copy, CheckCircle2, Loader2, ShieldCheck, Activity } from 'lucide-react';

export default function Dashboard() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [shortUrl, setShortUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState({ totalLinks: 0, totalSessions: 0, blockedIps: 0 });

  useEffect(() => {
    fetch('/api/stats')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(console.error);
  }, []);

  const handleShorten = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    
    setLoading(true);
    try {
      const res = await fetch('/api/shorten', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (data.shortId) {
        setShortUrl(`${window.location.origin}/s/${data.shortId}`);
        // Refresh stats
        fetch('/api/stats').then(r => r.json()).then(setStats);
      } else {
        alert(data.error || 'Failed to shorten URL');
      }
    } catch (err) {
      alert('Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-4xl mx-auto px-4 py-12"
    >
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl mb-4">
          Rút Gọn Link An Toàn
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Hệ thống rút gọn link bảo mật cao, chống spam, tích hợp cơ chế vượt link an toàn.
        </p>
      </div>

      <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 mb-12 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
        
        <form onSubmit={handleShorten} className="space-y-6">
          <div>
            <label htmlFor="url" className="block text-sm font-medium text-slate-700 mb-2">
              Dán URL dài của bạn vào đây
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Link2 className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="url"
                id="url"
                required
                className="block w-full pl-11 pr-4 py-4 border-slate-200 rounded-2xl focus:ring-indigo-500 focus:border-indigo-500 text-lg bg-slate-50 border transition-colors"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !url}
            className="w-full flex justify-center items-center py-4 px-8 border border-transparent rounded-2xl shadow-sm text-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? (
              <Loader2 className="animate-spin h-6 w-6" />
            ) : (
              'Rút Gọn Ngay'
            )}
          </button>
        </form>

        {shortUrl && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-8 p-6 bg-indigo-50 rounded-2xl border border-indigo-100"
          >
            <p className="text-sm font-medium text-indigo-800 mb-2">Link rút gọn của bạn:</p>
            <div className="flex items-center gap-4">
              <input
                type="text"
                readOnly
                value={shortUrl}
                className="block w-full px-4 py-3 bg-white border-indigo-200 rounded-xl text-indigo-900 font-medium focus:outline-none"
              />
              <button
                onClick={copyToClipboard}
                className="flex-shrink-0 flex items-center justify-center p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
              >
                {copied ? <CheckCircle2 className="h-6 w-6" /> : <Copy className="h-6 w-6" />}
              </button>
            </div>
          </motion.div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Link2 className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Tổng số link</p>
            <p className="text-2xl font-bold text-slate-900">{stats.totalLinks}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <Activity className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Lượt truy cập (Sessions)</p>
            <p className="text-2xl font-bold text-slate-900">{stats.totalSessions}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">IP bị chặn</p>
            <p className="text-2xl font-bold text-slate-900">{stats.blockedIps}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
