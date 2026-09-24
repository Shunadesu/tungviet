import { useState, useEffect, useCallback, useRef } from 'react';
import { FiRefreshCw } from 'react-icons/fi';

const HealthBadge = ({ url, label, interval = 30000 }) => {
  const [status, setStatus] = useState('checking'); // 'checking' | 'online' | 'offline'
  const [latency, setLatency] = useState(null);
  const [lastChecked, setLastChecked] = useState(null);
  const timerRef = useRef(null);

  const check = useCallback(async () => {
    setStatus('checking');
    const start = Date.now();
    try {
      const res = await fetch(url);
      const latencyMs = Date.now() - start;
      setStatus(res.ok ? 'online' : 'offline');
      setLatency(latencyMs);
    } catch {
      setStatus('offline');
      setLatency(null);
    }
    setLastChecked(new Date());
  }, [url]);

  useEffect(() => {
    check();
    timerRef.current = setInterval(check, interval);
    return () => clearInterval(timerRef.current);
  }, [check, interval]);

  const dotColor =
    status === 'online' ? 'bg-green-500' :
    status === 'offline' ? 'bg-red-500' :
    'bg-yellow-400';

  const textColor =
    status === 'online' ? 'text-green-600' :
    status === 'offline' ? 'text-red-600' :
    'text-yellow-600';

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-gray-100 shadow-sm">
      <span className={`relative flex h-2.5 w-2.5`}>
        {status === 'online' && (
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${dotColor} opacity-75`} />
        )}
        <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${dotColor}`} />
      </span>
      <div className="flex flex-col">
        <span className="text-xs font-medium text-gray-700">{label}</span>
        <span className={`text-[10px] ${textColor}`}>
          {status === 'checking' && 'Đang kiểm tra...'}
          {status === 'online' && (latency != null ? `${latency}ms` : 'Online')}
          {status === 'offline' && 'Offline'}
        </span>
      </div>
      <button
        onClick={check}
        className="ml-auto p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
        title="Kiểm tra lại"
      >
        <FiRefreshCw size={12} />
      </button>
    </div>
  );
};

export default HealthBadge;
