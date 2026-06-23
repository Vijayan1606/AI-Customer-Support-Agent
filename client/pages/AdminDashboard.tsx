import { useEffect, useState } from "react";
import {
  CheckCircle,
  XCircle,
  TrendingUp,
  Clock,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import type { AdminLogEntry } from "@shared/api";
import { Link } from "react-router-dom";

export default function AdminDashboard() {
  const [logs, setLogs] = useState<AdminLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchLogs = async () => {
    try {
      const response = await fetch("/api/logs");
      const data = await response.json();
      setLogs(data);
    } catch (error) {
      console.error("Error fetching logs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 2000);
    return () => clearInterval(interval);
  }, []);

  const approvedCount = logs.filter((l) => l.decision === "approved").length;
  const deniedCount = logs.filter((l) => l.decision === "denied").length;
  const approvalRate =
    logs.length > 0 ? ((approvedCount / logs.length) * 100).toFixed(1) : "0";
  const totalAmount = logs.reduce((sum, l) => sum + l.amount, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-3 md:py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 md:gap-4">
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 truncate">
                Admin Dashboard
              </h1>
              <p className="text-xs sm:text-sm md:text-sm text-slate-600 mt-0.5 sm:mt-1 hidden sm:block">
                Real-time refund decision logs and analytics
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 md:gap-4">
              <button
                onClick={fetchLogs}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors flex-shrink-0"
                title="Refresh logs"
              >
                <RefreshCw className="w-5 h-5 text-slate-600" />
              </button>
              <Link
                to="/support"
                className="text-xs sm:text-sm md:text-sm font-medium text-primary hover:text-primary/80 transition-colors whitespace-nowrap"
              >
                Support ←
              </Link>
              <Link
                to="/"
                className="text-xs sm:text-sm md:text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors whitespace-nowrap"
              >
                ← Home
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        {/* Stats Grid - Responsive across all devices */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4 mb-6 md:mb-8">
          {/* Total Requests Card */}
          <div className="bg-white rounded-lg sm:rounded-lg md:rounded-xl border border-slate-200 shadow-sm p-3 sm:p-4 md:p-6">
            <div className="flex items-center justify-between mb-2 md:mb-3">
              <span className="text-xs sm:text-sm md:text-sm font-medium text-slate-600 line-clamp-2">
                Total Requests
              </span>
              <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-slate-400 flex-shrink-0 ml-1" />
            </div>
            <p className="text-2xl sm:text-2xl md:text-3xl font-bold text-slate-900">{logs.length}</p>
            <p className="text-xs md:text-xs text-slate-500 mt-1 md:mt-2 line-clamp-2">
              {logs.length > 0
                ? `$${totalAmount.toFixed(2)} total`
                : "No requests"}
            </p>
          </div>

          {/* Approved Card */}
          <div className="bg-white rounded-lg sm:rounded-lg md:rounded-xl border border-slate-200 shadow-sm p-3 sm:p-4 md:p-6">
            <div className="flex items-center justify-between mb-2 md:mb-3">
              <span className="text-xs sm:text-sm md:text-sm font-medium text-slate-600">
                Approved
              </span>
              <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-green-600 flex-shrink-0" />
            </div>
            <p className="text-2xl sm:text-2xl md:text-3xl font-bold text-green-600">{approvedCount}</p>
            <p className="text-xs md:text-xs text-slate-500 mt-1 md:mt-2">
              {approvalRate}%
            </p>
          </div>

          {/* Denied Card */}
          <div className="bg-white rounded-lg sm:rounded-lg md:rounded-xl border border-slate-200 shadow-sm p-3 sm:p-4 md:p-6">
            <div className="flex items-center justify-between mb-2 md:mb-3">
              <span className="text-xs sm:text-sm md:text-sm font-medium text-slate-600">
                Denied
              </span>
              <XCircle className="w-4 h-4 md:w-5 md:h-5 text-red-600 flex-shrink-0" />
            </div>
            <p className="text-2xl sm:text-2xl md:text-3xl font-bold text-red-600">{deniedCount}</p>
            <p className="text-xs md:text-xs text-slate-500 mt-1 md:mt-2">
              {deniedCount > 0 ? "Declined" : "None"}
            </p>
          </div>

          {/* Average Amount Card */}
          <div className="bg-white rounded-lg sm:rounded-lg md:rounded-xl border border-slate-200 shadow-sm p-3 sm:p-4 md:p-6">
            <div className="flex items-center justify-between mb-2 md:mb-3">
              <span className="text-xs sm:text-sm md:text-sm font-medium text-slate-600">
                Avg Amount
              </span>
              <Clock className="w-4 h-4 md:w-5 md:h-5 text-slate-400 flex-shrink-0" />
            </div>
            <p className="text-2xl sm:text-2xl md:text-3xl font-bold text-slate-900">
              ${logs.length > 0 ? (totalAmount / logs.length).toFixed(2) : "0"}
            </p>
            <p className="text-xs md:text-xs text-slate-500 mt-1 md:mt-2">
              Per request
            </p>
          </div>
        </div>

        {/* Logs Table */}
        <div className="bg-white rounded-lg sm:rounded-lg md:rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-3 sm:p-4 md:p-6 border-b border-slate-200">
            <h2 className="text-base sm:text-lg md:text-xl font-semibold text-slate-900">
              Decision Logs
            </h2>
            <p className="text-xs sm:text-sm md:text-sm text-slate-600 mt-1 hidden sm:block">
              Real-time refund processing decisions
            </p>
          </div>

          {logs.length === 0 ? (
            <div className="p-8 sm:p-10 md:p-12 text-center">
              <AlertCircle className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-xs sm:text-sm md:text-sm text-slate-600 px-2 sm:px-4">
                No refund requests processed yet. Submit a request in the
                support chat to see logs appear here.
              </p>
            </div>
          ) : (
            <>
              {/* Desktop/Tablet Table View */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/50">
                      <th className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-left text-xs md:text-sm font-semibold text-slate-700">
                        Time
                      </th>
                      <th className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-left text-xs md:text-sm font-semibold text-slate-700">
                        Customer
                      </th>
                      <th className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-left text-xs md:text-sm font-semibold text-slate-700 hidden md:table-cell">
                        Order ID
                      </th>
                      <th className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-left text-xs md:text-sm font-semibold text-slate-700">
                        Amount
                      </th>
                      <th className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-left text-xs md:text-sm font-semibold text-slate-700">
                        Decision
                      </th>
                      <th className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-left text-xs md:text-sm font-semibold text-slate-700 hidden lg:table-cell">
                        Reason
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr
                        key={log.id}
                        className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors"
                      >
                        <td className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-xs sm:text-sm md:text-sm text-slate-900">
                          <div className="flex flex-col gap-0.5">
                            <span className="font-medium">
                              {new Date(log.timestamp).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                            <span className="text-xs text-slate-500">
                              {new Date(log.timestamp).toLocaleDateString()}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-xs sm:text-sm md:text-sm text-slate-900">
                          <div className="min-w-0">
                            <p className="font-medium truncate">{log.customerName}</p>
                            <p className="text-xs text-slate-500 truncate">
                              {log.customerId}
                            </p>
                          </div>
                        </td>
                        <td className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-xs sm:text-sm md:text-sm text-slate-600 truncate hidden md:table-cell">
                          {log.orderId}
                        </td>
                        <td className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-xs sm:text-sm md:text-sm font-semibold text-slate-900 whitespace-nowrap">
                          ${log.amount.toFixed(2)}
                        </td>
                        <td className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4">
                          <div className="flex items-center gap-1 md:gap-2">
                            {log.decision === "approved" ? (
                              <>
                                <CheckCircle className="w-4 h-4 md:w-4 md:h-4 text-green-600 flex-shrink-0" />
                                <span className="text-xs md:text-sm font-semibold text-green-700">
                                  Approved
                                </span>
                              </>
                            ) : (
                              <>
                                <XCircle className="w-4 h-4 md:w-4 md:h-4 text-red-600 flex-shrink-0" />
                                <span className="text-xs md:text-sm font-semibold text-red-700">
                                  Denied
                                </span>
                              </>
                            )}
                          </div>
                        </td>
                        <td className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-xs md:text-sm text-slate-600 max-w-xs hidden lg:table-cell">
                          <details className="cursor-pointer">
                            <summary className="text-slate-700 hover:text-slate-900 truncate">
                              {log.reason.substring(0, 30)}
                              {log.reason.length > 30 ? "..." : ""}
                            </summary>
                            <div className="mt-2 pt-2 border-t border-slate-200 text-xs space-y-1">
                              <p className="font-semibold">{log.reason}</p>
                              {log.reasoning.length > 0 && (
                                <div className="mt-2">
                                  <p className="font-semibold text-slate-700">
                                    Reasoning:
                                  </p>
                                  <ul className="space-y-1 mt-1">
                                    {log.reasoning.map((r, i) => (
                                      <li key={i} className="text-slate-600">
                                        • {r}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </details>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="sm:hidden divide-y divide-slate-200">
                {logs.map((log) => (
                  <div key={log.id} className="p-3 hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-slate-900 truncate">
                          {log.customerName}
                        </p>
                        <p className="text-xs text-slate-500">
                          {new Date(log.timestamp).toLocaleDateString()} {" "}
                          {new Date(log.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {log.decision === "approved" ? (
                          <>
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="text-xs font-semibold text-green-700">
                              OK
                            </span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4 text-red-600" />
                            <span className="text-xs font-semibold text-red-700">
                              Denied
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Order ID:</span>
                        <span className="font-medium text-slate-900">{log.orderId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Amount:</span>
                        <span className="font-semibold text-slate-900">
                          ${log.amount.toFixed(2)}
                        </span>
                      </div>
                      <details className="cursor-pointer pt-2 border-t border-slate-200">
                        <summary className="text-slate-700 font-medium">
                          Reason
                        </summary>
                        <div className="mt-2 space-y-1 text-slate-600">
                          <p>{log.reason}</p>
                          {log.reasoning.length > 0 && (
                            <div className="mt-2">
                              <p className="font-semibold text-slate-700">
                                Reasoning:
                              </p>
                              <ul className="space-y-0.5 mt-1 ml-3">
                                {log.reasoning.map((r, i) => (
                                  <li key={i}>• {r}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </details>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
