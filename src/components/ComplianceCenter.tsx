import { useState, useEffect, useCallback } from 'react';
import { Shield, FileText, Download, CheckCircle, Clock, XCircle, AlertTriangle, UserCheck, BarChart3, Database } from 'lucide-react';
import type { 
  IdentityVerification, 
  RiskAssessment, 
  ComplianceReport, 
  TermsAcceptance, 
  PrivacyConsent, 
  DataExport 
} from '@/shared/types';
import Dialog from './Dialog';
import ErrorBoundary from './ErrorBoundary';

interface ComplianceCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

function ComplianceCenterContent({ isOpen, onClose }: ComplianceCenterProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'verification' | 'risk' | 'reports' | 'legal' | 'data'>('overview');
  const [isLoading, setIsLoading] = useState(false);
  const [verification, setVerification] = useState<IdentityVerification | null>(null);
  const [riskAssessment, setRiskAssessment] = useState<RiskAssessment | null>(null);
  const [complianceReports, setComplianceReports] = useState<ComplianceReport[]>([]);
  const [termsAcceptance, setTermsAcceptance] = useState<TermsAcceptance | null>(null);
  const [privacyConsents, setPrivacyConsents] = useState<PrivacyConsent[]>([]);
  const [dataExports, setDataExports] = useState<DataExport[]>([]);

  const fetchComplianceData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [verificationRes, riskRes, reportsRes, termsRes, consentsRes, exportsRes] = await Promise.all([
        fetch('/api/verification/status'),
        fetch('/api/risk/assessment'),
        fetch('/api/compliance/reports'),
        fetch('/api/legal/terms/status'),
        fetch('/api/legal/privacy/consents'),
        fetch('/api/data/export'),
      ]);

      if (verificationRes.ok) setVerification(await verificationRes.json());
      if (riskRes.ok) setRiskAssessment(await riskRes.json());
      if (reportsRes.ok) setComplianceReports(await reportsRes.json());
      if (termsRes.ok) setTermsAcceptance(await termsRes.json());
      if (consentsRes.ok) setPrivacyConsents(await consentsRes.json());
      if (exportsRes.ok) setDataExports(await exportsRes.json());
    } catch (error) {
      console.error('Failed to fetch compliance data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchComplianceData();
    }
  }, [isOpen, fetchComplianceData]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'rejected':
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-slate-500" />;
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'low':
        return 'text-green-600 bg-green-50';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50';
      case 'high':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-slate-600 bg-slate-50';
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Compliance & Legal Center">
      <div className="space-y-6">
        {/* Navigation Tabs */}
        <div className="flex space-x-1 border-b border-slate-200">
          {[
            { id: 'overview', label: 'Overview', icon: Shield },
            { id: 'verification', label: 'Identity Verification', icon: UserCheck },
            { id: 'risk', label: 'Risk Assessment', icon: AlertTriangle },
            { id: 'reports', label: 'Compliance Reports', icon: BarChart3 },
            { id: 'legal', label: 'Legal & Privacy', icon: FileText },
            { id: 'data', label: 'Data Export', icon: Database },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-slate-600 mt-2">Loading compliance data...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-slate-50 rounded-lg p-4">
                  <h3 className="font-medium text-slate-900 mb-3">Identity Verification</h3>
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(verification?.status || 'pending')}
                    <span className="capitalize">{verification?.status || 'Not started'}</span>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-lg p-4">
                  <h3 className="font-medium text-slate-900 mb-3">Risk Assessment</h3>
                  <div className="flex items-center space-x-3">
                    <AlertTriangle className="w-5 h-5 text-slate-500" />
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskLevelColor(riskAssessment?.risk_level || 'unknown')}`}>
                      {riskAssessment?.risk_level || 'Not assessed'}
                    </span>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-lg p-4">
                  <h3 className="font-medium text-slate-900 mb-3">Terms Acceptance</h3>
                  <div className="flex items-center space-x-3">
                    {termsAcceptance ? (
                      <>
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span>Accepted v{termsAcceptance.terms_version}</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-5 h-5 text-red-500" />
                        <span>Not accepted</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="bg-slate-50 rounded-lg p-4">
                  <h3 className="font-medium text-slate-900 mb-3">Privacy Consents</h3>
                  <div className="space-y-1">
                    {privacyConsents.map((consent) => (
                      <div key={consent.id} className="flex items-center justify-between text-sm">
                        <span className="capitalize">{consent.consent_type}</span>
                        {consent.granted ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Identity Verification Tab */}
            {activeTab === 'verification' && (
              <div className="space-y-4">
                <div className="bg-slate-50 rounded-lg p-4">
                  <h3 className="font-medium text-slate-900 mb-3">Verification Status</h3>
                  {verification ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span>Status:</span>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(verification.status)}
                          <span className="capitalize">{verification.status}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Document Type:</span>
                        <span className="capitalize">{verification.document_type}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Document Number:</span>
                        <span>{verification.document_number}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Submitted:</span>
                        <span>{new Date(verification.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-slate-600">No verification data available.</p>
                  )}
                </div>

                <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                  Start Identity Verification
                </button>
              </div>
            )}

            {/* Risk Assessment Tab */}
            {activeTab === 'risk' && (
              <div className="space-y-4">
                <div className="bg-slate-50 rounded-lg p-4">
                  <h3 className="font-medium text-slate-900 mb-3">Risk Assessment</h3>
                  {riskAssessment ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span>Risk Level:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskLevelColor(riskAssessment.risk_level)}`}>
                          {riskAssessment.risk_level}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Risk Score:</span>
                        <span>{riskAssessment.risk_score}/100</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Assessment Date:</span>
                        <span>{new Date(riskAssessment.assessment_date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Next Review:</span>
                        <span>{new Date(riskAssessment.next_review_date).toLocaleDateString()}</span>
                      </div>
                      <div>
                        <span className="block mb-2">Risk Factors:</span>
                        <ul className="list-disc list-inside text-sm text-slate-600">
                          {riskAssessment.factors.map((factor, index) => (
                            <li key={index}>{factor}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <p className="text-slate-600">No risk assessment data available.</p>
                  )}
                </div>
              </div>
            )}

            {/* Compliance Reports Tab */}
            {activeTab === 'reports' && (
              <div className="space-y-4">
                <h3 className="font-medium text-slate-900">Compliance Reports</h3>
                {complianceReports.length > 0 ? (
                  <div className="space-y-3">
                    {complianceReports.map((report) => (
                      <div key={report.id} className="border border-slate-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-slate-900 capitalize">{report.report_type} Report</h4>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(report.status)}
                            <span className="capitalize text-sm">{report.status}</span>
                          </div>
                        </div>
                        <div className="text-sm text-slate-600 mb-3">
                          Period: {report.period_start} to {report.period_end}
                        </div>
                        <div className="flex items-center space-x-2">
                          <button className="text-blue-600 hover:text-blue-700 text-sm">
                            View Details
                          </button>
                          <button className="text-blue-600 hover:text-blue-700 text-sm">
                            Download
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-600">No compliance reports available.</p>
                )}
              </div>
            )}

            {/* Legal & Privacy Tab */}
            {activeTab === 'legal' && (
              <div className="space-y-6">
                <div className="bg-slate-50 rounded-lg p-4">
                  <h3 className="font-medium text-slate-900 mb-3">Terms of Service</h3>
                  {termsAcceptance ? (
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span>Accepted version {termsAcceptance.terms_version}</span>
                      </div>
                      <div className="text-sm text-slate-600">
                        Accepted on {new Date(termsAcceptance.accepted_at).toLocaleDateString()}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-slate-600">You haven't accepted the terms of service yet.</p>
                      <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                        Accept Terms
                      </button>
                    </div>
                  )}
                </div>

                <div className="bg-slate-50 rounded-lg p-4">
                  <h3 className="font-medium text-slate-900 mb-3">Privacy Consents</h3>
                  <div className="space-y-3">
                    {privacyConsents.map((consent) => (
                      <div key={consent.id} className="flex items-center justify-between">
                        <div>
                          <span className="capitalize">{consent.consent_type} consent</span>
                          <div className="text-sm text-slate-600">
                            {consent.granted 
                              ? `Granted on ${new Date(consent.granted_at!).toLocaleDateString()}`
                              : `Revoked on ${new Date(consent.revoked_at!).toLocaleDateString()}`
                            }
                          </div>
                        </div>
                        <button className="text-blue-600 hover:text-blue-700 text-sm">
                          {consent.granted ? 'Revoke' : 'Grant'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Data Export Tab */}
            {activeTab === 'data' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-slate-900">Data Export</h3>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                    Request Export
                  </button>
                </div>

                {dataExports.length > 0 ? (
                  <div className="space-y-3">
                    {dataExports.map((exportItem) => (
                      <div key={exportItem.id} className="border border-slate-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-slate-900 capitalize">{exportItem.export_type} Export</h4>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(exportItem.status)}
                            <span className="capitalize text-sm">{exportItem.status}</span>
                          </div>
                        </div>
                        <div className="text-sm text-slate-600 mb-3">
                          Requested: {new Date(exportItem.requested_at).toLocaleDateString()}
                          {exportItem.completed_at && (
                            <span> • Completed: {new Date(exportItem.completed_at).toLocaleDateString()}</span>
                          )}
                        </div>
                        {exportItem.status === 'completed' && exportItem.file_url && (
                          <button className="text-blue-600 hover:text-blue-700 text-sm flex items-center space-x-1">
                            <Download className="w-4 h-4" />
                            <span>Download Export</span>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-600">No data export requests found.</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </Dialog>
  );
}

export default function ComplianceCenter(props: ComplianceCenterProps) {
  return (
    <ErrorBoundary>
      <ComplianceCenterContent {...props} />
    </ErrorBoundary>
  );
} 