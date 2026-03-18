import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, EyeOff, CheckCircle2, Copy } from 'lucide-react';

export default function GetCodePage() {
  const { sessionId } = useParams();
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [code, setCode] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(true);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Random time between 60 and 120 seconds
    const initialTime = Math.floor(Math.random() * 61) + 60;
    setTimeLeft(initialTime);

    const handleVisibilityChange = () => {
      setIsActive(!document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    if (timeLeft === null || code || isFetching) return;

    if (isActive && timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft(prev => (prev !== null ? prev - 1 : null));
      }, 1000);
    } else if (timeLeft === 0 && !isFetching) {
      setIsFetching(true);
      fetchCode();
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [timeLeft, isActive, code, isFetching]);

  const fetchCode = async () => {
    try {
      const res = await fetch(`/api/generate-code/${sessionId}`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setCode(data.code);
      } else {
        setError(data.error || 'Lỗi lấy mã');
      }
    } catch (err) {
      setError('Lỗi kết nối');
    }
  };

  const copyCode = () => {
    if (code) {
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Generate random dummy content
  const dummyParagraphs = Array.from({ length: 15 }).map((_, i) => (
    <p key={i} className="text-slate-600 leading-relaxed mb-6 text-justify">
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
    </p>
  ));

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-md mx-auto px-4 py-8 bg-white min-h-screen shadow-2xl relative"
    >
      <div className="sticky top-0 bg-white/80 backdrop-blur-md z-20 py-4 border-b border-slate-100 mb-8">
        <h1 className="text-xl font-bold text-center text-slate-800">
          Hướng dẫn lấy mã
        </h1>
        <p className="text-xs text-center text-slate-500 mt-1">
          Vui lòng cuộn xuống cuối trang để nhận mã
        </p>
      </div>

      <div className="prose prose-slate prose-sm max-w-none">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Nội dung ngẫu nhiên</h2>
        {dummyParagraphs.slice(0, 5)}
        
        <div className="my-8 p-6 bg-indigo-50 rounded-2xl border border-indigo-100">
          <h3 className="text-lg font-bold text-indigo-900 mb-2">Lưu ý quan trọng:</h3>
          <ul className="list-disc pl-5 space-y-2 text-indigo-800 text-sm">
            <li>Bạn phải giữ tab này luôn mở (không chuyển tab).</li>
            <li>Thời gian sẽ dừng lại nếu bạn rời khỏi trang.</li>
            <li>Mã chỉ có hiệu lực cho 1 lần sử dụng duy nhất.</li>
          </ul>
        </div>

        {dummyParagraphs.slice(5, 10)}
        
        <div className="my-12 flex justify-center">
          <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-teal-500" />
            
            {error ? (
              <div className="text-red-500 font-bold">{error}</div>
            ) : code ? (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="space-y-4"
              >
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Mã của bạn là:</h3>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-3xl font-mono font-bold tracking-widest text-emerald-600 bg-emerald-50 px-6 py-3 rounded-2xl border border-emerald-100">
                    {code}
                  </span>
                </div>
                <button
                  onClick={copyCode}
                  className="mt-4 w-full flex items-center justify-center gap-2 py-3 px-6 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors"
                >
                  {copied ? 'Đã sao chép!' : <><Copy className="w-4 h-4" /> Sao chép mã</>}
                </button>
              </motion.div>
            ) : (
              <div className="space-y-6">
                {!isActive && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-center gap-2 text-rose-500 bg-rose-50 py-2 px-4 rounded-lg text-sm font-medium"
                  >
                    <EyeOff className="w-4 h-4" />
                    Thời gian đang tạm dừng vì bạn rời tab
                  </motion.div>
                )}
                
                <div className="relative w-32 h-32 mx-auto">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="#f1f5f9"
                      strokeWidth="8"
                    />
                    <motion.circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="#6366f1"
                      strokeWidth="8"
                      strokeLinecap="round"
                      initial={{ pathLength: 1 }}
                      animate={{ pathLength: timeLeft ? timeLeft / 120 : 0 }}
                      transition={{ duration: 1, ease: "linear" }}
                      className="drop-shadow-md"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <Clock className="w-6 h-6 text-indigo-500 mb-1" />
                    <span className="text-3xl font-bold text-slate-900 font-mono">
                      {timeLeft}
                    </span>
                  </div>
                </div>
                <p className="text-sm font-medium text-slate-500">
                  Vui lòng đợi để nhận mã...
                </p>
              </div>
            )}
          </div>
        </div>

        {dummyParagraphs.slice(10, 15)}
      </div>
    </motion.div>
  );
}
