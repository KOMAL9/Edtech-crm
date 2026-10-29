import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { api } from './api';
import './style.css';

const categories = ['Scholarship', 'Concert', 'Admission', 'General Query'];
const userTypes = ['Parent', 'Student', 'School'];

function Layout({ children }) {
  return <>
    <header className="topbar">
      <Link to="/" className="brand"><span className="brand-icon">E</span> EduConnect <span className="brand-light">CRM</span></Link>
      <nav><Link to="/">Submit Inquiry</Link><Link to="/admin/login">Admin</Link></nav>
    </header>
    <main>{children}</main>
    <footer>EduConnect · Inquiry Management</footer>
  </>;
}

function InquiryForm() {
  const [form, setForm] = useState({ userType: '', category: '', name: '', email: '', phone: '', message: '' });
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);

  function update(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    setNotice('');
    try {
      const result = await api('/inquiries', { method: 'POST', body: JSON.stringify(form) });
      setNotice(result.message);
      setForm({ userType: '', category: '', name: '', email: '', phone: '', message: '' });
    } catch (error) {
      setNotice(error.message);
    } finally {
      setLoading(false);
    }
  }

  return <div className="page-shell public-page">
    <div className="intro"><span className="eyebrow">GET IN TOUCH</span><h1>How can we help you?</h1><p>Have a question about our programs or opportunities? Send us an inquiry and our team will get back to you.</p></div>
    <form className="panel inquiry-form" onSubmit={submit}>
      <div className="panel-heading"><h2>Submit an inquiry</h2><p>Fill in the details below to get started.</p></div>
      <div className="form-grid">
        <label>User Type <select name="userType" value={form.userType} onChange={update} required><option value="">Select user type</option>{userTypes.map(v => <option key={v}>{v}</option>)}</select></label>
        <label>Category <select name="category" value={form.category} onChange={update} required><option value="">Select category</option>{categories.map(v => <option key={v}>{v}</option>)}</select></label>
        <label>Full Name <input name="name" value={form.name} onChange={update} maxLength="120" placeholder="Your full name" required /></label>
        <label>Email Address <input type="email" name="email" value={form.email} onChange={update} maxLength="255" placeholder="you@example.com" required /></label>
        <label className="full">Phone Number <input type="tel" name="phone" value={form.phone} onChange={update} maxLength="20" pattern="[+0-9() -]{7,20}" placeholder="Your contact number" required /></label>
        <label className="full">Message / Query <textarea name="message" value={form.message} onChange={update} maxLength="3000" rows="5" placeholder="Tell us what you'd like to know..." required /></label>
      </div>
      {notice && <p className="notice" role="status">{notice}</p>}
      <button className="primary" disabled={loading}>{loading ? 'Submitting...' : 'Submit Inquiry'}</button>
    </form>
  </div>;
}

function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const result = await api('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
      sessionStorage.setItem('adminToken', result.token);
      navigate('/admin/dashboard', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return <div className="login-wrap"><form className="panel login-panel" onSubmit={submit}>
    <span className="eyebrow">ADMIN ACCESS</span><h1>Welcome back</h1><p>Sign in to manage incoming inquiries.</p>
    <label>Email Address <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@example.com" required /></label>
    <label>Password <input type="password" value={password} onChange={e => setPassword(e.target.value)} required /></label>
    {error && <p className="error" role="alert">{error}</p>}
    <button className="primary" disabled={loading}>{loading ? 'Signing in...' : 'Sign In'}</button>
  </form></div>;
}

function Dashboard() {
  const navigate = useNavigate();
  const token = sessionStorage.getItem('adminToken');
  const [category, setCategory] = useState('');
  const [userType, setUserType] = useState('');
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setQuery(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setLoading(true);
      setError('');
      try {
        const params = new URLSearchParams({ category, userType, search: query });
        const result = await api(`/inquiries?${params}`, { token });
        if (!controller.signal.aborted) setRows(result);
      } catch (err) {
        if (!controller.signal.aborted) {
          if (err.status === 401 || err.status === 403) {
            sessionStorage.removeItem('adminToken');
            navigate('/admin/login', { replace: true });
          } else setError(err.message);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    load();
    return () => controller.abort();
  }, [category, userType, query, token, navigate]);

  function logout() {
    sessionStorage.removeItem('adminToken');
    navigate('/admin/login', { replace: true });
  }

  return <div className="dashboard page-shell">
    <div className="dashboard-heading"><div><span className="eyebrow">ADMIN DASHBOARD</span><h1>Inquiry Management</h1><p>View and filter all submitted inquiries.</p></div><button className="secondary" onClick={logout}>Log Out</button></div>
    <div className="stat"><span>Total matching inquiries</span><strong>{rows.length}</strong></div>
    <div className="panel table-panel">
      <div className="table-heading"><div><h2>All Inquiries</h2><p>Search and filter the inquiry records.</p></div></div>
      <div className="filters"><input aria-label="Search by name or phone" placeholder="Search name or phone..." value={search} onChange={e => setSearch(e.target.value)} /><select aria-label="Filter category" value={category} onChange={e => setCategory(e.target.value)}><option value="">All Categories</option>{categories.map(v => <option key={v}>{v}</option>)}</select><select aria-label="Filter user type" value={userType} onChange={e => setUserType(e.target.value)}><option value="">All User Types</option>{userTypes.map(v => <option key={v}>{v}</option>)}</select></div>
      {error && <p className="error" role="alert">{error}</p>}
      {loading ? <p className="empty">Loading inquiries...</p> : rows.length === 0 ? <p className="empty">No inquiries found.</p> : <div className="table-scroll"><table><thead><tr><th>Name</th><th>Phone</th><th>Email</th><th>User Type</th><th>Category</th><th>Date</th><th>Status</th><th>Message</th></tr></thead><tbody>{rows.map(row => <tr key={row.id}><td className="name-cell">{row.name}</td><td>{row.phone}</td><td>{row.email}</td><td>{row.userType}</td><td>{row.category}</td><td>{new Date(row.createdAt).toLocaleDateString()}</td><td><span className="status">{row.status}</span></td><td className="message-cell" title={row.message}>{row.message}</td></tr>)}</tbody></table></div>}
    </div>
  </div>;
}

function ProtectedDashboard() {
  return sessionStorage.getItem('adminToken') ? <Dashboard /> : <Navigate to="/admin/login" replace />;
}

function App() {
  return <Layout><Routes><Route path="/" element={<InquiryForm />} /><Route path="/admin/login" element={<AdminLogin />} /><Route path="/admin/dashboard" element={<ProtectedDashboard />} /><Route path="*" element={<Navigate to="/" replace />} /></Routes></Layout>;
}

ReactDOM.createRoot(document.getElementById('root')).render(<React.StrictMode><BrowserRouter><App /></BrowserRouter></React.StrictMode>);
