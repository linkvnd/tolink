import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldAlert, KeyRound, ExternalLink, Loader2, AlertTriangle } from 'lucide-react';

export default function BypassPage() {
  const { shortId } = useParams();
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [captcha, setCaptcha] = useState({ num1: 0, num2: 0, answer: '' });
  const [captchaError, setCaptchaError] = useState(false);

  useEffect(() => {
    // Generate random captcha
    setCaptcha({
      num1: Math.floor(Math.random() * 10) + 1,
      num2: Math.floor(Math.random() * 10) + 1,
      answer: ''
    });
  }, []);

  const handleGetCode = async () => {
    if (parseInt(captcha.answer) !== captcha.num1 + captcha.num2) {
      setCaptchaError(true);
      return;
    }
    setCaptchaError(false);
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/session/${shortId}`, { method: 'POST' });
      const data = await res.json();
      
      if (res.ok) {
        setSessionId(data.sessionId);
        // Open get code page in new tab
        window.open(`/c/${data.sessionId}`, '_blank');
      } else {
        setError(data.error || 'Failed to create session');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !sessionId) return;
    
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shortId, sessionId, code }),
      });
      const data = await res.json();
      
      if (res.ok && data.originalUrl) {
        window.location.href = data.originalUrl;
      } else {
        setError(data.error || 'Mã không hợp lệ');
      }
    } catch (err) {
      setError('Lỗi kết nối');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      className="max-w-2xl mx-auto px-4 py-8 md:py-16"
    >
      <div className="bg-white rounded-[2rem] shadow-2xl shadow-indigo-100/50 border border-slate-100 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-rose-400 via-fuchsia-500 to-indigo-500" />
        
        <div className="p-8 md:p-12">
          <div className="flex items-center justify-center w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl mb-6 mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>
          
          <h1 className="text-2xl md:text-3xl font-bold text-center text-slate-900 mb-4">
            Xác Minh Bảo Mật
          </h1>
          
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-8 text-amber-800 text-sm">
            <h3 className="font-bold flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4" />
              Quy định nghiêm ngặt:
            </h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Không sử dụng VPN, 1.1.1.1 hoặc Proxy.</li>
              <li>Mỗi IP chỉ được nhập sai tối đa 3 lần.</li>
              <li>Vi phạm sẽ bị khóa IP 24 giờ tự động.</li>
              <li>Mã bảo mật chỉ dùng được 1 lần duy nhất.</li>
            </ul>
          </div>

          {!sessionId ? (
            <div className="space-y-6">
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                <h3 className="font-semibold text-slate-900 mb-4">Bước 1: Giải mã Captcha</h3>
                <div className="flex items-center gap-4">
                  <span className="text-xl font-mono font-bold bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
                    {captcha.num1} + {captcha.num2} = ?
                  </span>
                  <input
                    type="number"
                    className={`block w-full px-4 py-3 border rounded-xl text-lg focus:outline-none focus:ring-2 ${captchaError ? 'border-red-300 focus:ring-red-500' : 'border-slate-200 focus:ring-indigo-500'}`}
                    value={captcha.answer}
                    onChange={(e) => setCaptcha({ ...captcha, answer: e.target.value })}
                  />
                </div>
                {captchaError && <p className="text-red-500 text-sm mt-2">Sai kết quả, vui lòng thử lại!</p>}
              </div>

              <button
                onClick={handleGetCode}
                disabled={loading || !captcha.answer}
                className="w-full flex justify-center items-center gap-2 py-4 px-8 rounded-2xl shadow-lg shadow-indigo-200 text-lg font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 focus:outline-none transition-all transform hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 className="animate-spin w-6 h-6" /> : (
                  <>
                    Lấy Mã Xác Nhận <ExternalLink className="w-5 h-5" />
                  </>
                )}
              </button>
              {error && <p className="text-red-500 text-center font-medium">{error}</p>}
            </div>
          ) : (
            <form onSubmit={handleVerify} className="space-y-6">
              <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100">
                <h3 className="font-semibold text-indigo-900 mb-2">Bước 2: Nhập mã xác nhận</h3>
                <p className="text-sm text-indigo-700 mb-4">
                  Vui lòng nhập mã bạn vừa lấy được từ trang mới mở vào ô bên dưới.
                </p>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <KeyRound className="h-5 w-5 text-indigo-400" />
                  </div>
                  <input
                    type="text"
                    required
                    className="block w-full pl-11 pr-4 py-4 border-indigo-200 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 text-xl font-mono font-bold tracking-widest uppercase bg-white border transition-colors"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !code}
                className="w-full flex justify-center items-center gap-2 py-4 px-8 rounded-2xl shadow-lg shadow-emerald-200 text-lg font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 focus:outline-none transition-all transform hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 className="animate-spin w-6 h-6" /> : 'Xác Nhận & Tới Link Gốc'}
              </button>
              
              {error && (
                <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 text-center font-medium">
                  {error}
                </div>
              )}
            </form>
          )}
        </div>
      </div>
    </motion.div>
  );
}
