import { useEffect, useState } from "react";
// import { Link } from 'react-router-dom';
import api from "../utils/axiosConfig";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Server,
  HardDrive,
  Cloud,
  Activity,
} from "lucide-react";

const SERVICE_ICONS = {
  database: Server,
  redis: HardDrive,
  cloudinary: Cloud,
};

const STATUS_LEVELS = {
  operational: {
    color: "bg-green-100 text-green-800",
    icon: CheckCircle2,
    label: "Operational",
  },
  degraded: {
    color: "bg-yellow-100 text-yellow-800",
    icon: AlertTriangle,
    label: "Degraded",
  },
  outage: {
    color: "bg-red-100 text-red-800",
    icon: XCircle,
    label: "Outage",
  },
};

const StatusHistoryPage = () => {
  const [history, setHistory] = useState([]); // Initialize as empty array
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await api.get("/health/healthy/history");
        // Adjust for the backend response structure
        const historyData = response.data.history || [];
        setHistory(historyData);
      } catch (err) {
        setError("Failed to load status history");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center">
        <div className="text-red-500 text-lg">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        {/* <Link to="/" className="text-blue-600 hover:text-blue-800 flex items-center gap-2">
          ← Back to Status
        </Link> */}
        <h1 className="text-3xl font-bold mt-4">System Status History</h1>
        <p className="text-gray-600 mt-2">
          Past system status updates and incidents
        </p>
      </div>
      {history.length > 0 ? (
        <div className="space-y-6">
          {history.map((entry, index) => {
            const statusConfig =
              STATUS_LEVELS[entry.status] || STATUS_LEVELS.outage;
            const date = new Date(entry.timestamp);

            return (
              <div
                key={index}
                className={`${statusConfig.color} rounded-lg p-6 shadow-sm`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <statusConfig.icon className="w-6 h-6" />
                    <h3 className="text-xl font-semibold">
                      {statusConfig.label}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="w-5 h-5" />
                    <span>
                      {date.toLocaleDateString()} {date.toLocaleTimeString()}
                    </span>
                  </div>
                </div>

                {entry.services && Object.keys(entry.services).length > 0 && (
                  <div className="mt-4 pt-4 border-t border-opacity-20">
                    <h4 className="text-sm font-medium mb-2">
                      Service Statuses:
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {Object.entries(entry.services).map(
                        ([service, details]) => {
                          const IconComponent =
                            SERVICE_ICONS[service] || Activity;
                          return (
                            <div
                              key={service}
                              className="flex items-center gap-2 text-sm p-2 bg-white rounded-lg shadow-sm"
                            >
                              <IconComponent className="w-4 h-4 shrink-0" />
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="capitalize font-medium">
                                    {service}
                                  </span>
                                  <span
                                    className={`px-2 py-1 rounded text-xs ${
                                      details?.status === "operational"
                                        ? "bg-green-200 text-green-800"
                                        : "bg-red-200 text-red-800"
                                    }`}
                                  >
                                    {details?.status || "unknown"}
                                  </span>
                                </div>
                                {details?.latency && (
                                  <div className="text-xs text-gray-600 mt-1">
                                    Latency: {details.latency}ms
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        },
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          {loading ? "Loading history..." : "No historical data available"}
        </div>
      )}
    </div>
  );
};

export default StatusHistoryPage;
