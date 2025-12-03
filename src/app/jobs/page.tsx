'use client';

import React, { useState } from 'react';
import Navigation from '@/components/Navigation';
import { useApp } from '@/contexts/AppContext';
import { JobStatus } from '@/types';
import { getTodayString } from '@/lib/calculations';
import Toast from '@/components/Toast';

export default function JobsPage() {
  const { state, addJobApplication, updateJobApplication, addNetworkingContact, addRejectionLog } = useApp();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Job form state
  const [showJobForm, setShowJobForm] = useState(false);
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [salaryRange, setSalaryRange] = useState('');
  const [jobStatus, setJobStatus] = useState<JobStatus>('Saved');

  // Networking form state
  const [showNetworkForm, setShowNetworkForm] = useState(false);
  const [contactName, setContactName] = useState('');
  const [contactCompany, setContactCompany] = useState('');
  const [contactPlatform, setContactPlatform] = useState<'LinkedIn' | 'Email' | 'Coffee Chat' | 'Other'>('LinkedIn');
  const [contactNotes, setContactNotes] = useState('');

  const handleJobSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addJobApplication({
      company,
      role,
      salaryRange,
      status: jobStatus,
      applicationDate: getTodayString(),
      statusHistory: [{
        status: jobStatus,
        date: getTodayString(),
      }],
      interviewPrep: [],
      skillsGap: [],
    });
    setToastMessage('💼 Job application added! +15 XP');
    setShowToast(true);
    setCompany('');
    setRole('');
    setSalaryRange('');
    setJobStatus('Saved');
    setShowJobForm(false);
  };

  const handleNetworkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addNetworkingContact({
      name: contactName,
      company: contactCompany,
      platform: contactPlatform,
      date: getTodayString(),
      notes: contactNotes,
    });
    setToastMessage('🤝 Contact added!');
    setShowToast(true);
    setContactName('');
    setContactCompany('');
    setContactNotes('');
    setShowNetworkForm(false);
  };

  const updateStatus = (jobId: string, newStatus: JobStatus) => {
    const job = state.jobApplications.find(j => j.id === jobId);
    if (!job) return;

    const updatedHistory = [
      ...job.statusHistory,
      { status: newStatus, date: getTodayString() },
    ];

    updateJobApplication(jobId, {
      status: newStatus,
      statusHistory: updatedHistory,
    });

    if (newStatus === 'Rejected') {
      addRejectionLog({
        company: job.company,
        role: job.role,
        date: getTodayString(),
        learnings: '',
      });
    }

    setToastMessage(`Status updated to ${newStatus}`);
    setShowToast(true);
  };

  const getStatusColor = (status: JobStatus) => {
    switch (status) {
      case 'Saved': return 'var(--color-upcoming)';
      case 'Applied': return 'var(--color-in-progress)';
      case 'Interview Scheduled': return 'var(--accent-color)';
      case 'Offer': return 'var(--color-complete)';
      case 'Rejected': return 'var(--color-missed)';
    }
  };

  const groupedJobs = {
    'Saved': state.jobApplications.filter(j => j.status === 'Saved'),
    'Applied': state.jobApplications.filter(j => j.status === 'Applied'),
    'Interview Scheduled': state.jobApplications.filter(j => j.status === 'Interview Scheduled'),
    'Offer': state.jobApplications.filter(j => j.status === 'Offer'),
    'Rejected': state.jobApplications.filter(j => j.status === 'Rejected'),
  };

  return (
    <Navigation>
      <div className="jobs-page">
        <h1>💼 Job Hunt Tracker</h1>
        <p className="subtitle">Track applications and build your network</p>

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{state.jobApplications.length}</div>
            <div className="stat-label">Total Applications</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{groupedJobs['Applied'].length + groupedJobs['Interview Scheduled'].length}</div>
            <div className="stat-label">Active</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{groupedJobs['Interview Scheduled'].length}</div>
            <div className="stat-label">Interviews</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{groupedJobs['Offer'].length}</div>
            <div className="stat-label">Offers</div>
          </div>
        </div>

        {/* Add Job Form */}
        <section className="section-card">
          <div className="section-header">
            <h2>Job Applications</h2>
            <button className="btn btn-primary" onClick={() => setShowJobForm(!showJobForm)}>
              {showJobForm ? 'Cancel' : '+ Add Application'}
            </button>
          </div>

          {showJobForm && (
            <form onSubmit={handleJobSubmit} className="form-card">
              <div className="form-row">
                <div className="form-group">
                  <label>Company</label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g., Google, Microsoft"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Role</label>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="e.g., Software Engineer"
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Salary Range</label>
                  <input
                    type="text"
                    value={salaryRange}
                    onChange={(e) => setSalaryRange(e.target.value)}
                    placeholder="e.g., 15-25 LPA"
                  />
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select value={jobStatus} onChange={(e) => setJobStatus(e.target.value as JobStatus)}>
                    <option value="Saved">Saved</option>
                    <option value="Applied">Applied</option>
                    <option value="Interview Scheduled">Interview Scheduled</option>
                    <option value="Offer">Offer</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="btn btn-primary">Add Application</button>
            </form>
          )}

          {/* Pipeline View */}
          <div className="pipeline">
            {(Object.keys(groupedJobs) as JobStatus[]).map((status) => (
              <div key={status} className="pipeline-column">
                <div className="column-header" style={{ backgroundColor: getStatusColor(status) }}>
                  <h3>{status}</h3>
                  <span className="count">{groupedJobs[status].length}</span>
                </div>
                <div className="column-content">
                  {groupedJobs[status].length === 0 ? (
                    <div className="empty-column">No applications</div>
                  ) : (
                    groupedJobs[status].map((job) => (
                      <div key={job.id} className="job-card">
                        <h4>{job.company}</h4>
                        <p className="job-role">{job.role}</p>
                        {job.salaryRange && (
                          <p className="job-salary">{job.salaryRange}</p>
                        )}
                        <p className="job-date">
                          Applied: {new Date(job.applicationDate).toLocaleDateString()}
                        </p>
                        <div className="job-actions">
                          <select
                            value={job.status}
                            onChange={(e) => updateStatus(job.id, e.target.value as JobStatus)}
                            className="status-select"
                          >
                            <option value="Saved">Saved</option>
                            <option value="Applied">Applied</option>
                            <option value="Interview Scheduled">Interview</option>
                            <option value="Offer">Offer</option>
                            <option value="Rejected">Rejected</option>
                          </select>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Networking Section */}
        <section className="section-card">
          <div className="section-header">
            <h2>🤝 Networking</h2>
            <button className="btn btn-primary" onClick={() => setShowNetworkForm(!showNetworkForm)}>
              {showNetworkForm ? 'Cancel' : '+ Add Contact'}
            </button>
          </div>

          {showNetworkForm && (
            <form onSubmit={handleNetworkSubmit} className="form-card">
              <div className="form-row">
                <div className="form-group">
                  <label>Name</label>
                  <input
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Contact name"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Company</label>
                  <input
                    type="text"
                    value={contactCompany}
                    onChange={(e) => setContactCompany(e.target.value)}
                    placeholder="Their company"
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Platform</label>
                  <select value={contactPlatform} onChange={(e) => setContactPlatform(e.target.value as any)}>
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="Email">Email</option>
                    <option value="Coffee Chat">Coffee Chat</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Notes</label>
                  <input
                    type="text"
                    value={contactNotes}
                    onChange={(e) => setContactNotes(e.target.value)}
                    placeholder="Brief notes..."
                  />
                </div>
              </div>
              <button type="submit" className="btn btn-primary">Add Contact</button>
            </form>
          )}

          {state.networkingContacts.length === 0 ? (
            <div className="empty-state">
              <p>No networking contacts yet. Start building connections!</p>
            </div>
          ) : (
            <div className="contacts-list">
              {state.networkingContacts
                .slice()
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((contact) => (
                  <div key={contact.id} className="contact-item">
                    <div className="contact-info">
                      <h4>{contact.name}</h4>
                      <p>{contact.company}</p>
                    </div>
                    <div className="contact-meta">
                      <span className="badge">{contact.platform}</span>
                      <span className="contact-date">
                        {new Date(contact.date).toLocaleDateString()}
                      </span>
                    </div>
                    {contact.notes && (
                      <p className="contact-notes">{contact.notes}</p>
                    )}
                  </div>
                ))}
            </div>
          )}
        </section>

        {/* Rejections Log */}
        {state.rejectionLogs.length > 0 && (
          <section className="section-card">
            <h2>📊 Rejection Insights</h2>
            <div className="rejections-list">
              {state.rejectionLogs.map((log) => (
                <div key={log.id} className="rejection-item">
                  <div className="rejection-header">
                    <h4>{log.company} - {log.role}</h4>
                    <span>{new Date(log.date).toLocaleDateString()}</span>
                  </div>
                  {log.learnings && (
                    <p className="rejection-learnings">{log.learnings}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      <Toast
        message={toastMessage}
        type="success"
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />

      <style jsx>{`
        .jobs-page {
          max-width: 1400px;
          margin: 0 auto;
        }

        h1 {
          font-size: var(--text-3xl);
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: var(--spacing-sm);
        }

        .subtitle {
          font-size: var(--text-lg);
          color: var(--text-secondary);
          margin-bottom: var(--spacing-xl);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: var(--spacing-lg);
          margin-bottom: var(--spacing-xl);
        }

        .stat-card {
          background-color: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          padding: var(--spacing-lg);
          text-align: center;
        }

        .stat-value {
          font-size: var(--text-3xl);
          font-weight: 700;
          color: var(--accent-color);
        }

        .stat-label {
          font-size: var(--text-sm);
          color: var(--text-secondary);
          margin-top: var(--spacing-xs);
        }

        .section-card {
          background-color: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          padding: var(--spacing-xl);
          margin-bottom: var(--spacing-xl);
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--spacing-lg);
        }

        .section-header h2 {
          font-size: var(--text-xl);
          font-weight: 600;
          color: var(--text-primary);
        }

        .form-card {
          background-color: var(--bg-tertiary);
          padding: var(--spacing-lg);
          border-radius: var(--radius-md);
          margin-bottom: var(--spacing-lg);
        }

        .form-row {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: var(--spacing-md);
          margin-bottom: var(--spacing-md);
        }

        .form-group label {
          display: block;
          font-size: var(--text-sm);
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: var(--spacing-sm);
        }

        .pipeline {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: var(--spacing-md);
          overflow-x: auto;
        }

        .pipeline-column {
          min-width: 250px;
          background-color: var(--bg-tertiary);
          border-radius: var(--radius-md);
          overflow: hidden;
        }

        .column-header {
          padding: var(--spacing-md);
          color: white;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .column-header h3 {
          font-size: var(--text-sm);
          font-weight: 600;
          text-transform: uppercase;
        }

        .count {
          background: rgba(255, 255, 255, 0.3);
          padding: var(--spacing-xs) var(--spacing-sm);
          border-radius: var(--radius-sm);
          font-size: var(--text-xs);
          font-weight: 700;
        }

        .column-content {
          padding: var(--spacing-md);
          min-height: 200px;
        }

        .empty-column {
          text-align: center;
          padding: var(--spacing-lg);
          color: var(--text-tertiary);
          font-size: var(--text-sm);
        }

        .job-card {
          background-color: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: var(--spacing-md);
          margin-bottom: var(--spacing-md);
          transition: all var(--transition-fast);
        }

        .job-card:hover {
          border-color: var(--accent-color);
          transform: translateY(-2px);
          box-shadow: 0 4px 8px var(--shadow);
        }

        .job-card h4 {
          font-size: var(--text-base);
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: var(--spacing-xs);
        }

        .job-role {
          font-size: var(--text-sm);
          color: var(--text-secondary);
          margin-bottom: var(--spacing-xs);
        }

        .job-salary {
          font-size: var(--text-sm);
          color: var(--accent-color);
          font-weight: 600;
          margin-bottom: var(--spacing-xs);
        }

        .job-date {
          font-size: var(--text-xs);
          color: var(--text-tertiary);
          margin-bottom: var(--spacing-sm);
        }

        .job-actions {
          margin-top: var(--spacing-sm);
        }

        .status-select {
          width: 100%;
          padding: var(--spacing-xs) var(--spacing-sm);
          font-size: var(--text-xs);
        }

        .contacts-list {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-md);
        }

        .contact-item {
          background-color: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: var(--spacing-md);
          transition: all var(--transition-fast);
        }

        .contact-item:hover {
          border-color: var(--accent-color);
          transform: translateX(2px);
        }

        .contact-info h4 {
          font-size: var(--text-base);
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: var(--spacing-xs);
        }

        .contact-info p {
          font-size: var(--text-sm);
          color: var(--text-secondary);
        }

        .contact-meta {
          display: flex;
          gap: var(--spacing-md);
          align-items: center;
          margin-top: var(--spacing-sm);
        }

        .contact-date {
          font-size: var(--text-xs);
          color: var(--text-tertiary);
        }

        .contact-notes {
          font-size: var(--text-sm);
          color: var(--text-tertiary);
          margin-top: var(--spacing-sm);
          font-style: italic;
        }

        .rejections-list {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-md);
        }

        .rejection-item {
          background-color: var(--bg-tertiary);
          border-left: 4px solid var(--color-missed);
          padding: var(--spacing-md);
          border-radius: var(--radius-md);
        }

        .rejection-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--spacing-sm);
        }

        .rejection-header h4 {
          font-size: var(--text-base);
          font-weight: 600;
          color: var(--text-primary);
        }

        .rejection-header span {
          font-size: var(--text-xs);
          color: var(--text-tertiary);
        }

        .rejection-learnings {
          font-size: var(--text-sm);
          color: var(--text-secondary);
        }

        .empty-state {
          text-align: center;
          padding: var(--spacing-2xl);
          color: var(--text-secondary);
        }

        @media (max-width: 1200px) {
          .pipeline {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .pipeline {
            grid-template-columns: 1fr;
          }

          .form-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </Navigation>
  );
}
