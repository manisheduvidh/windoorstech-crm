'use client';
import { useEffect, useState } from 'react';
import { getSession, getUsersFromStorage } from '@/lib/auth';
import { getLeadsForUser } from '@/lib/leads';
import { useRouter } from 'next/navigation';
import * as XLSX from 'xlsx';

export default function ReportPage() {
  const [user, setUser] = useState(null);
  const [leads, setLeads] = useState([]);
  const [report, setReport] = useState({});
  const router = useRouter();

  useEffect(() => {
    const session = getSession();
    if (!session) { router.push('/'); return; }
    setUser(session);
    const userLeads = getLeadsForUser(session);
    setLeads(userLeads);
    calculateReport(userLeads);
  }, [router]);

  function calculateReport(data) {
    const stats = {
      totalLeads: data.length,
      validSocialMedia: data.filter(l => l.leadQuality === 'Valid' && l.leadCategory === 'Social Media').length,
      validGoogleForm: data.filter(l => l.leadQuality === 'Valid' && l.leadCategory === 'Google Form lead Web').length,
      validGoogleCall: data.filter(l => l.leadQuality === 'Valid' && l.leadCategory === 'Google Call lead Web').length,
      validGMB: data.filter(l => l.leadQuality === 'Valid' && l.leadCategory === 'GMB').length,
      notValid: data.filter(l => l.leadQuality === 'Not Valid').length,
      below100sqft: data.filter(l => l.leadQuality === 'Below 100sqft').length,
      quoteGiven: data.filter(l => l.quoteBrand).length,
      totalQuoteSqft: data.reduce((sum, l) => sum + (parseFloat(l.quoteSqft) || 0), 0),
      totalQuoteValue: data.reduce((sum, l) => sum + (parseFloat(l.quoteValue) || 0), 0),
    };
    setReport(stats);
  }

  function downloadCSV() {
    const worksheet = XLSX.utils.json_to_sheet(leads);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Leads");
    XLSX.writeFile(workbook, `Windoorstech_Leads_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
  }

  if (!user) return null;

  return (
    <>
      <div className="page-header">
        <div className="page-title">📈 Employee Report</div>
        <button className="btn btn-primary btn-sm" onClick={downloadCSV}>📥 Download Full Report (Excel)</button>
      </div>
      <div className="page-body">
        <div className="card mb-4">
          <div className="card-header">
            <div className="card-title">Analysis Report</div>
          </div>
          <div className="report-grid">
            <div className="report-card blue">
              <div className="report-card-label">Total Leads</div>
              <div className="report-card-value">{report.totalLeads}</div>
            </div>
            <div className="report-card green">
              <div className="report-card-label">Valid (Social Media)</div>
              <div className="report-card-value">{report.validSocialMedia}</div>
            </div>
            <div className="report-card green">
              <div className="report-card-label">Valid (Google Form)</div>
              <div className="report-card-value">{report.validGoogleForm}</div>
            </div>
            <div className="report-card green">
              <div className="report-card-label">Valid (Google Call)</div>
              <div className="report-card-value">{report.validGoogleCall}</div>
            </div>
            <div className="report-card green">
              <div className="report-card-label">Valid (GMB)</div>
              <div className="report-card-value">{report.validGMB}</div>
            </div>
            <div className="report-card red">
              <div className="report-card-label">Total Not Valid</div>
              <div className="report-card-value">{report.notValid}</div>
            </div>
            <div className="report-card yellow">
              <div className="report-card-label">Total Below 100sqft</div>
              <div className="report-card-value">{report.below100sqft}</div>
            </div>
            <div className="report-card purple">
              <div className="report-card-label">Quotes Given</div>
              <div className="report-card-value">{report.quoteGiven}</div>
            </div>
            <div className="report-card blue">
              <div className="report-card-label">Total Quote Sqft</div>
              <div className="report-card-value">{report.totalQuoteSqft}</div>
            </div>
            <div className="report-card success">
              <div className="report-card-label">Total Quote Value</div>
              <div className="report-card-value">₹{report.totalQuoteValue?.toLocaleString()}</div>
            </div>
          </div>
        </div>

        <div className="alert alert-info">
          ℹ️ This report reflects data based on your access level. Admins see all data, while employees see their own performance.
        </div>
      </div>
    </>
  );
}
