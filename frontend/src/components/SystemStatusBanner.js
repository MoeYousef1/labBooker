import { useEffect, useState } from 'react';
import api from "../utils/axiosConfig";
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle,
  History,
  Activity,
  Cloud,
  Mail,
  Server,
  HardDrive
} from 'lucide-react';

const SERVICE_ICONS = {
  database: Server,
  redis: HardDrive,
  cloudinary: Cloud,
  email: Mail,
  server: Activity,
  filesystem: HardDrive
};

const STATUS_LEVELS = {
  operational: {
    color: 'bg-green-100 text-green-800',
    icon: CheckCircle2,
    label: 'All Systems Operational'
  },
  degraded: {
    color: 'bg-yellow-100 text-yellow-800',
    icon: AlertTriangle,
    label: 'Partial Service Degradation'
  },
  outage: {
    color: 'bg-red-100 text-red-800',
    icon: XCircle,
    label: 'Major Service Outage'
  }
};

const SystemStatusBanner = () => {
  const [status, setStatus] = useState({
    status: 'loading',
    services: {},
    timestamp: new Date().toISOString()
  });
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [debugMode] = useState(localStorage.getItem('debugMode') === 'true');


  const fetchStatus = async () => {
    try {
      if (debugMode) console.log('[FRONTEND] Starting health check...');
      
      const [statusRes, historyRes] = await Promise.all([
        api.get('/health/healthy'),
        api.get('/health/healthy/history')
      ]);

      if (debugMode) {
        console.log('[FRONTEND] Health check response:', statusRes.data);
        console.log('[FRONTEND] History response:', historyRes.data);
      }

      setStatus({
        status: statusRes.data.status || 'operational',
        services: statusRes.data.services || {},
        timestamp: statusRes.data.timestamp
      });
      
      setHistory(historyRes.data);
    } catch (error) {
      console.error('[FRONTEND] Health check failed:', error);
      setStatus({
        status: 'outage',
        services: {},
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 300000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return null;

  const statusConfig = STATUS_LEVELS[status.status] || STATUS_LEVELS.outage;
  const lastUpdated = new Date(status.timestamp).toLocaleTimeString();

  return (
    <div className={`${statusConfig.color} rounded-lg p-4 mb-6 shadow-sm mt-4`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <statusConfig.icon className="w-5 h-5" />
          <div>
            <h3 className="font-medium">{statusConfig.label}</h3>
            <p className="text-sm opacity-80 mt-1">
              Last updated: {lastUpdated}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button 
            className="flex items-center gap-2 text-sm hover:opacity-80"
            onClick={fetchStatus}
          >
            <Activity className="w-4 h-4" />
            Refresh
          </button>
          <button
            className="flex items-center gap-2 text-sm hover:opacity-80"
            onClick={() => window.open('/status-page', '_blank')}
          >
            <History className="w-4 h-4" />
            History
          </button>
        </div>
      </div>

      {status.status !== 'operational' && (
        <div className="mt-4 pt-4 border-t border-opacity-20">
          <h4 className="text-sm font-medium mb-2">Affected Services:</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {Object.entries(status.services || {}).map(([service, details]) => {
              const IconComponent = SERVICE_ICONS[service] || Activity;
              return (
                <div key={service} className="flex items-center gap-2 text-sm p-2 bg-white rounded-lg shadow-sm">
                  <IconComponent className="w-4 h-4 shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="capitalize font-medium">{service}</span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        details?.status === 'operational' 
                          ? 'bg-green-200 text-green-800' 
                          : 'bg-red-200 text-red-800'
                      }`}>
                        {details?.status || 'unknown'}
                      </span>
                    </div>
                    {details?.latency && (
                      <div className="text-xs text-gray-600 mt-1">
                        {details.latency}ms
                      </div>
                    )}
                    {details?.details && (
                      <div className="text-xs text-gray-600 mt-1">
                        {Object.entries(details.details).map(([key, value]) => (
                          <div key={key}>{key}: {value}</div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {history && (
        <div className="mt-4 pt-4 border-t border-opacity-20">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="opacity-75">30-day Uptime</p>
              <p className="font-medium">{history.uptime30d || 'N/A'}</p>
            </div>
            <div>
              <p className="opacity-75">Last Incident</p>
              <p className="font-medium">
                {history.lastIncident ? 
                  new Date(history.lastIncident).toLocaleDateString() : 'None'}
              </p>
            </div>
            <div>
              <p className="opacity-75">Incidents (30d)</p>
              <p className="font-medium">{history.incidentsLastMonth || 0}</p>
            </div>
          </div>
        </div>
      )}
      {debugMode && (
        <div className="mt-4 pt-4 border-t border-opacity-20">
          <h4 className="text-sm font-medium mb-2">Debug Information:</h4>
          <pre className="text-xs bg-black bg-opacity-10 p-2 rounded">
            {JSON.stringify({
              status,
              history,
              lastFetched: new Date().toISOString()
            }, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default SystemStatusBanner;