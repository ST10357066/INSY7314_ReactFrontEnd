import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import {
  CreditCard, Plus, Clock, CheckCircle, XCircle, AlertCircle, BarChart3, FileText, Download, Zap, TrendingUp, Activity, List, BookOpen
} from "lucide-react";
import Layout from "@/components/Layout";
import LoadingSpinner from "@/components/LoadingSpinner";
import {
  Transaction,
  UserProfile,
  AccountBalance,
  TransactionAnalytics,
  ActivityItem,
  MonthlyReport,
  TaxReport,
  CustomReport,
  AuditLogEntry
} from "@/shared/types";

export default function Dashboard() {
  const { i18n } = useTranslation();
  const { user, isPending } = useAuth();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [balance, setBalance] = useState<AccountBalance | null>(null);
  const [analytics, setAnalytics] = useState<TransactionAnalytics | null>(null);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [monthlyReport, setMonthlyReport] = useState<MonthlyReport | null>(null);
  const [taxReport, setTaxReport] = useState<TaxReport | null>(null);
  const [customReport, setCustomReport] = useState<CustomReport | null>(null);
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([]);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [transactionsRes, profileRes, balanceRes, analyticsRes, activityRes, monthlyRes, taxRes, customRes, auditRes] = await Promise.all([
        fetch("/api/transactions"),
        fetch("/api/profile"),
        fetch("/api/account/balance"),
        fetch("/api/transactions/analytics"),
        fetch("/api/activity"),
        fetch("/api/reports/monthly"),
        fetch("/api/reports/tax"),
        fetch("/api/reports/custom"),
        fetch("/api/audit-log"),
      ]);
      
      if (transactionsRes.ok) setTransactions(await transactionsRes.json());
      if (profileRes.ok) setProfile(await profileRes.json());
      if (balanceRes.ok) setBalance(await balanceRes.json());
      if (analyticsRes.ok) setAnalytics(await analyticsRes.json());
      if (activityRes.ok) setActivity(await activityRes.json());
      if (monthlyRes.ok) setMonthlyReport(await monthlyRes.json());
      if (taxRes.ok) setTaxReport(await taxRes.json());
      if (customRes.ok) setCustomReport(await customRes.json());
      if (auditRes.ok) setAuditLog(await auditRes.json());
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
      setError("Failed to load dashboard data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isPending && !user) {
      navigate("/login");
      return;
    }
    if (user) {
      fetchData();
    }
  }, [user, isPending, navigate, fetchData]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Pending": return <Clock className="w-4 h-4 text-yellow-500" />;
      case "Verified": return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case "Sent": return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "Failed": return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending": return "bg-yellow-100 text-yellow-800";
      case "Verified": return "bg-blue-100 text-blue-800";
      case "Sent": return "bg-green-100 text-green-800";
      case "Failed": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat(i18n.language, { 
      style: 'currency', 
      currency: currency || 'USD' 
    }).format(amount);
  };
  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat(i18n.language, { dateStyle: 'medium', timeStyle: undefined }).format(new Date(date));
  };
  const maskAccountNumber = (accountNumber: string) => {
    if (accountNumber.length <= 4) return accountNumber;
    return `****${accountNumber.slice(-4)}`;
  };

  // Simple SVG bar chart for monthly analytics with proper error handling
  const renderMonthlyChart = () => {
    if (!analytics || analytics.monthly.length === 0) {
      return <p className="text-slate-500 text-center py-4">No chart data available</p>;
    }
    
    const max = Math.max(...analytics.monthly.map(m => m.sent));
    if (max === 0) {
      return <p className="text-slate-500 text-center py-4">No transaction data to display</p>;
    }
    
    return (
      <svg width="100%" height="80" viewBox="0 0 320 80">
        {analytics.monthly.map((m, i) => (
          <rect
            key={m.month}
            x={i * 70 + 10}
            y={80 - (m.sent / max) * 60 - 10}
            width={40}
            height={(m.sent / max) * 60}
            fill="#2563eb"
            rx={6}
          />
        ))}
        {analytics.monthly.map((m, i) => (
          <text
            key={m.month + "-label"}
            x={i * 70 + 30}
            y={75}
            textAnchor="middle"
            fontSize={12}
            fill="#64748b"
          >
            {m.month.slice(5)}
          </text>
        ))}
      </svg>
    );
  };

  if (isPending || isLoading) {
    return (
      <Layout showSidebar>
        <div className="flex items-center justify-center min-h-[60vh]">
          <LoadingSpinner size="lg" />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout showSidebar>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Error Loading Dashboard</h2>
            <p className="text-slate-600 mb-4">{error}</p>
            <button
              onClick={fetchData}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  if (!user) return null;
  if (!profile) {
    navigate("/register");
    return null;
  }

  return (
    <Layout showSidebar>
      <div className="p-6 space-y-8">
        {/* Header & Quick Actions */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Welcome back, {profile.full_name || user.google_user_data?.given_name}
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Link to="/payment" className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center space-x-2">
              <Plus className="w-5 h-5" /> <span>New Payment</span>
            </Link>
            <Link to="/profile" className="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 px-6 py-3 rounded-lg font-semibold hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors flex items-center space-x-2">
              <Activity className="w-5 h-5" /> <span>Profile</span>
            </Link>
            <a href="#monthly-report" className="bg-green-100 text-green-800 px-6 py-3 rounded-lg font-semibold hover:bg-green-200 transition-colors flex items-center space-x-2">
              <Download className="w-5 h-5" /> <span>Monthly Report</span>
            </a>
            <a href="#tax-report" className="bg-yellow-100 text-yellow-800 px-6 py-3 rounded-lg font-semibold hover:bg-yellow-200 transition-colors flex items-center space-x-2">
              <FileText className="w-5 h-5" /> <span>Tax Report</span>
            </a>
          </div>
        </div>

        {/* Financial Summary */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 flex flex-col items-center">
            <span className="text-slate-500 dark:text-slate-400 text-sm mb-2">Available Balance</span>
            <span className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">{balance ? formatCurrency(balance.available, balance.currency) : "-"}</span>
            <span className="text-slate-400 text-xs">Pending: {balance ? formatCurrency(balance.pending, balance.currency) : "-"}</span>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 flex flex-col items-center">
            <span className="text-slate-500 dark:text-slate-400 text-sm mb-2">Total Sent (YTD)</span>
            <span className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{analytics ? formatCurrency(analytics.total_sent, balance?.currency || "USD") : "-"}</span>
            <TrendingUp className="w-6 h-6 text-green-500" />
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 flex flex-col items-center">
            <span className="text-slate-500 dark:text-slate-400 text-sm mb-2">Total Received (YTD)</span>
            <span className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{analytics ? formatCurrency(analytics.total_received, balance?.currency || "USD") : "-"}</span>
            <BarChart3 className="w-6 h-6 text-blue-500" />
          </div>
        </div>

        {/* Analytics & Insights */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-4">
              <BarChart3 className="w-5 h-5 text-blue-600 mr-2" />
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Monthly Transaction Analytics</h2>
            </div>
            {renderMonthlyChart()}
            <div className="mt-4 grid grid-cols-2 gap-4">
              {analytics && analytics.monthly.map((m) => (
                <div key={m.month} className="text-xs text-slate-600 dark:text-slate-400">
                  <span className="font-semibold">{m.month}:</span> Sent {formatCurrency(m.sent, balance?.currency || "USD")}, Received {formatCurrency(m.received, balance?.currency || "USD")}
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-4">
              <Zap className="w-5 h-5 text-green-600 mr-2" />
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Spending Analytics</h2>
            </div>
            {analytics && analytics.categories.length > 0 ? (
              <ul className="space-y-2">
                {analytics.categories.map((cat) => (
                  <li key={cat.category} className="flex justify-between text-slate-700 dark:text-slate-200">
                    <span>{cat.category}</span>
                    <span>{formatCurrency(cat.amount, balance?.currency || "USD")}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-slate-500">No spending data available.</p>
            )}
          </div>
        </div>

        {/* Monthly Report & Tax Report */}
        <div className="grid md:grid-cols-2 gap-6" id="monthly-report">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-4">
              <FileText className="w-5 h-5 text-blue-600 mr-2" />
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Monthly Report</h2>
            </div>
            {monthlyReport ? (
              <div className="space-y-2">
                <div>Month: <span className="font-semibold">{monthlyReport.month}</span></div>
                <div>Total Sent: {formatCurrency(monthlyReport.total_sent, balance?.currency || "USD")}</div>
                <div>Total Received: {formatCurrency(monthlyReport.total_received, balance?.currency || "USD")}</div>
                <div>Transactions: {monthlyReport.transactions}</div>
                <div>Tax Paid: {formatCurrency(monthlyReport.tax_paid, balance?.currency || "USD")}</div>
                <button className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center space-x-2">
                  <Download className="w-4 h-4" /> <span>Download PDF</span>
                </button>
              </div>
            ) : <p className="text-slate-500">No report available.</p>}
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6" id="tax-report">
            <div className="flex items-center mb-4">
              <BookOpen className="w-5 h-5 text-yellow-600 mr-2" />
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Tax Report</h2>
            </div>
            {taxReport ? (
              <div className="space-y-2">
                <div>Year: <span className="font-semibold">{taxReport.year}</span></div>
                <div>Total Taxable: {formatCurrency(taxReport.total_taxable, balance?.currency || "USD")}</div>
                <div>Total Tax Paid: {formatCurrency(taxReport.total_tax_paid, balance?.currency || "USD")}</div>
                <div className="mt-2">
                  <span className="font-semibold">Monthly Details:</span>
                  <ul className="ml-4 list-disc">
                    {taxReport.details.map((d) => (
                      <li key={d.month}>{d.month}: Taxable {formatCurrency(d.taxable, balance?.currency || "USD")}, Tax Paid {formatCurrency(d.tax_paid, balance?.currency || "USD")}</li>
                    ))}
                  </ul>
                </div>
                <button className="mt-2 bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 flex items-center space-x-2">
                  <Download className="w-4 h-4" /> <span>Download PDF</span>
                </button>
              </div>
            ) : <p className="text-slate-500">No tax report available.</p>}
          </div>
        </div>

        {/* Custom Report & Audit Log */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-4">
              <List className="w-5 h-5 text-purple-600 mr-2" />
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Custom Report</h2>
            </div>
            {customReport ? (
              <div className="space-y-2">
                <div>Name: <span className="font-semibold">{customReport.name}</span></div>
                <div>Generated: {formatDate(customReport.generated_at)}</div>
                <pre className="bg-slate-100 dark:bg-slate-700 rounded p-2 text-xs overflow-x-auto">{JSON.stringify(customReport.data, null, 2)}</pre>
                <button className="mt-2 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 flex items-center space-x-2">
                  <Download className="w-4 h-4" /> <span>Download</span>
                </button>
              </div>
            ) : <p className="text-slate-500">No custom report available.</p>}
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-4">
              <FileText className="w-5 h-5 text-slate-600 mr-2" />
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Audit Log</h2>
            </div>
            {auditLog.length > 0 ? (
              <ul className="space-y-2 text-xs">
                {auditLog.map((entry) => (
                  <li key={entry.id} className="flex justify-between border-b border-slate-100 dark:border-slate-700 py-1">
                    <span>{entry.action}</span>
                    <span className="text-slate-500">{formatDate(entry.created_at)}</span>
                  </li>
                ))}
              </ul>
            ) : <p className="text-slate-500">No audit log entries.</p>}
          </div>
        </div>

        {/* Recent Activity Feed & Transaction History */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-4">
              <Activity className="w-5 h-5 text-blue-600 mr-2" />
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Recent Activity</h2>
            </div>
            {activity.length > 0 ? (
              <ul className="space-y-2 text-sm">
                {activity.map((item) => (
                  <li key={item.id} className="flex justify-between border-b border-slate-100 dark:border-slate-700 py-1">
                    <span>{item.description}</span>
                    <span className="text-slate-500">{formatDate(item.created_at)}</span>
                  </li>
                ))}
              </ul>
            ) : <p className="text-slate-500">No recent activity.</p>}
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-4">
              <CreditCard className="w-5 h-5 text-blue-600 mr-2" />
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Recent Transactions</h2>
            </div>
            {transactions.length === 0 ? (
              <div className="text-center py-12">
                <CreditCard className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">No transactions yet</h3>
                <p className="text-slate-600 mb-6">Start by creating your first international payment.</p>
                <Link to="/payment" className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors inline-flex items-center space-x-2">
                  <Plus className="w-5 h-5" /> <span>Create Payment</span>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700">
                      <th className="text-left py-3 px-4 font-medium text-slate-500">Transaction ID</th>
                      <th className="text-left py-3 px-4 font-medium text-slate-500">Amount</th>
                      <th className="text-left py-3 px-4 font-medium text-slate-500">Recipient</th>
                      <th className="text-left py-3 px-4 font-medium text-slate-500">SWIFT Code</th>
                      <th className="text-left py-3 px-4 font-medium text-slate-500">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-slate-500">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((transaction) => (
                      <tr key={transaction.id} className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700">
                        <td className="py-4 px-4">
                          <span className="font-mono text-sm text-slate-900 dark:text-white">{transaction.transaction_id}</span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="font-semibold text-slate-900 dark:text-white">{formatCurrency(transaction.amount, transaction.currency)}</span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-slate-900 dark:text-white">{maskAccountNumber(transaction.recipient_account)}</span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="font-mono text-sm text-slate-900 dark:text-white">{transaction.swift_code}</span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(transaction.status)}
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>{transaction.status}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-sm text-slate-600 dark:text-slate-400">{formatDate(transaction.created_at)}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
