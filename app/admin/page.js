'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  Lock,
  PlusCircle,
  CreditCard,
  Banknote,
  Phone,
  MessageSquare,
  MapPin,
  Trash2,
  Download,
  Search,
  ArrowLeft,
  RefreshCw,
  AlertTriangle,
  Sun,
  Moon,
} from 'lucide-react';

const PRICE_PER_SHARE = 400;

export default function AdminPage() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [contributors, setContributors] = useState([]);
  const [summary, setSummary] = useState({
    totalTargetShares: 250,
    pricePerShare: 400,
    totalSharesReceived: 0,
    balanceSharesNeeded: 250,
    totalMoneyCollected: 0,
    balanceMoneyNeeded: 100000,
    refundCompletedAmount: 0,
    refundCompletedCount: 0,
  });
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [modeFilter, setModeFilter] = useState('ALL');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    whatsapp: '',
    upiId: '',
    place: '',
    paymentMode: 'UPI',
    shares: 1,
    sameAsPhone: true,
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('theme-dark', isDarkMode);
    document.documentElement.classList.toggle('theme-light', !isDarkMode);

    return () => {
      document.documentElement.classList.remove('theme-dark', 'theme-light');
    };
  }, [isDarkMode]);

  // Fetch Data from MongoDB API
  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/contributors');
      const json = await res.json();
      if (json.success) {
        setSummary(json.summary);
        setContributors(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handlePhoneChange = (val) => {
    setFormData((prev) => ({
      ...prev,
      phone: val,
      whatsapp: prev.sameAsPhone ? val : prev.whatsapp,
    }));
  };

  const handleAddContributor = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.name.trim() || !formData.phone.trim() || !formData.whatsapp.trim() || !formData.place.trim()) {
      setFormError('Please fill all required fields');
      return;
    }
    if (formData.paymentMode === 'UPI' && !formData.upiId.trim()) {
      setFormError('Please enter a UPI ID or select Cash');
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch('/api/contributors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (!json.success) {
        setFormError(json.error || 'Failed to add contributor');
        return;
      }

      // Reset form on success
      setFormData({
        name: '',
        phone: '',
        whatsapp: '',
        upiId: '',
        place: '',
        paymentMode: 'UPI',
        shares: 1,
        sameAsPhone: true,
      });

      // Reload fresh counts & records
      await loadData();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Are you sure you want to delete ${name}? This will return their share(s) back to the target pool.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/contributors/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        await loadData();
      }
    } catch (err) {
      alert('Failed to delete: ' + err.message);
    }
  };

  const handleRefundStatusChange = async (id, refundStatus) => {
    try {
      const res = await fetch(`/api/contributors/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refundStatus }),
      });
      const json = await res.json();

      if (!json.success) {
        throw new Error(json.error || 'Failed to update refund status');
      }

      setContributors((prev) =>
        prev.map((item) => (item._id === id ? { ...item, refundStatus } : item))
      );
    } catch (err) {
      alert(err.message);
    }
  };

  const handleExportPDF = () => {
    const pdf = new jsPDF({ orientation: 'landscape' });
    const exportDate = new Date().toLocaleDateString();

    pdf.setFontSize(16);
    pdf.text('Share Contributors Report', 14, 15);
    pdf.setFontSize(9);
    pdf.setTextColor(100);
    pdf.text(`Generated: ${exportDate} | Contributors: ${contributors.length}`, 14, 22);

    autoTable(pdf, {
      startY: 28,
      head: [['ID', 'Name', 'Phone', 'WhatsApp', 'UPI ID', 'Place', 'Mode', 'Shares', 'Amount', 'Refund', 'Date']],
      body: contributors.map((c) => [
        c._id,
        c.name,
        c.phone,
        c.whatsapp,
        c.upiId || '',
        c.place,
        c.paymentMode,
        c.shares,
        `Rs. ${c.amount}`,
        c.refundStatus || 'Pending',
        new Date(c.createdAt).toLocaleDateString(),
      ]),
      styles: { fontSize: 8, cellPadding: 2.5 },
      headStyles: { fillColor: [16, 185, 129] },
      alternateRowStyles: { fillColor: [241, 245, 249] },
    });

    pdf.save(`share_contributors_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  const filteredContributors = useMemo(() => {
    return contributors.filter((item) => {
      const matchSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.phone.includes(searchTerm) ||
        item.place.toLowerCase().includes(searchTerm.toLowerCase());
      const matchMode = modeFilter === 'ALL' || item.paymentMode === modeFilter;
      return matchSearch && matchMode;
    });
  }, [contributors, searchTerm, modeFilter]);

  return (
    <div className={`min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans ${isDarkMode ? 'theme-dark' : 'theme-light'}`}>
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/70 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsDarkMode((current) => !current)}
              type="button"
              className="rounded-lg   px-3 py-2 text-sm font-semibold text-slate-200 transition hover:border-emerald-400 hover:text-emerald-400"
              aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
            >
              {isDarkMode ? <Sun /> : <Moon />}
            </button>

            <span className="font-bold text-base text-white ml-2 flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-emerald-400" /> Admin Console
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={loadData}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={handleExportPDF}
              className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-2 rounded-xl border border-slate-700 flex items-center space-x-1.5 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span> PDF</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl w-full mx-auto px-4 py-8 space-y-6 flex-1">
        {/* Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <span className="text-[11px] text-slate-400">Total Shares</span>
            <div className="text-xl font-bold text-white mt-1">250</div>
            <span className="text-[10px] text-slate-500">₹400 / share</span>
          </div>

          <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-4">
            <span className="text-[11px] text-emerald-400">Shares Received</span>
            <div className="text-xl font-bold text-emerald-400 mt-1">{summary.totalSharesReceived}</div>
            <span className="text-[10px] text-emerald-500/70">Sold so far</span>
          </div>

          <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-4">
            <span className="text-[11px] text-amber-400">Balance Shares Needed</span>
            <div className="text-xl font-bold text-amber-400 mt-1">{summary.balanceSharesNeeded}</div>
            <span className="text-[10px] text-amber-500/70">Available left</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <span className="text-[11px] text-slate-400">Money Received</span>
            <div className="text-xl font-bold text-white mt-1">
              ₹{summary.totalMoneyCollected.toLocaleString('en-IN')}
            </div>
            <span className="text-[10px] text-slate-500">Total collected</span>
          </div>

          <div className="bg-slate-900 border border-cyan-500/30 rounded-2xl p-4 col-span-2 md:col-span-1">
            <span className="text-[11px] text-cyan-400">Balance Money Needed</span>
            <div className="text-xl font-bold text-cyan-400 mt-1">
              ₹{summary.balanceMoneyNeeded.toLocaleString('en-IN')}
            </div>
            <span className="text-[10px] text-cyan-400/70">Goal: ₹1,00,000</span>
          </div>

          <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-4 col-span-2 md:col-span-1">
            <span className="text-[11px] text-emerald-400">Refund Completed</span>
            <div className="text-xl font-bold text-emerald-400 mt-1">
              ₹{(summary.refundCompletedAmount || 0).toLocaleString('en-IN')}
            </div>
            <span className="text-[10px] text-emerald-500/70">
              {summary.refundCompletedCount || 0} contributor{(summary.refundCompletedCount || 0) === 1 ? '' : 's'}
            </span>
          </div>
        </div>

        {/* 2-Column: Left = Form, Right = Table */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Add Contributor Form */}
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 h-fit">
            <h2 className="text-base font-bold text-white flex items-center gap-2 pb-3 border-b border-slate-800">
              <PlusCircle className="w-5 h-5 text-emerald-400" />
              <span>Add Contributor</span>
            </h2>

            {formError && (
              <div className="mt-4 bg-red-950/50 border border-red-500/40 text-red-300 text-xs p-3 rounded-xl flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 text-red-400" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleAddContributor} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-medium">Full Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Yunus Ali"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Phone Number *</label>
                  <input
                    type="tel"
                    placeholder="10 digit number"
                    value={formData.phone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-slate-300 font-medium">WhatsApp *</label>
                    <label className="text-[10px] text-slate-400 flex items-center gap-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.sameAsPhone}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setFormData((p) => ({
                            ...p,
                            sameAsPhone: checked,
                            whatsapp: checked ? p.phone : p.whatsapp,
                          }));
                        }}
                        className="rounded bg-slate-900 border-slate-700 text-emerald-500"
                      />
                      <span>Same</span>
                    </label>
                  </div>
                  <input
                    type="tel"
                    disabled={formData.sameAsPhone}
                    placeholder="WhatsApp number"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    className={`w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500 ${
                      formData.sameAsPhone ? 'opacity-60 cursor-not-allowed' : ''
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Place / City *</label>
                <input
                  type="text"
                  placeholder="e.g. Kozhikode"
                  value={formData.place}
                  onChange={(e) => setFormData({ ...formData, place: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Payment Mode Selection */}
              <div>
                <label className="block text-slate-300 mb-1 font-medium">Payment Mode *</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, paymentMode: 'UPI' })}
                    className={`py-2 px-3 rounded-xl border flex items-center justify-center space-x-2 font-medium transition ${
                      formData.paymentMode === 'UPI'
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>UPI</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, paymentMode: 'Cash' })}
                    className={`py-2 px-3 rounded-xl border flex items-center justify-center space-x-2 font-medium transition ${
                      formData.paymentMode === 'Cash'
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <Banknote className="w-3.5 h-3.5" />
                    <span>Cash</span>
                  </button>
                </div>
              </div>

              {formData.paymentMode === 'UPI' && (
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">UPI ID *</label>
                  <input
                    type="text"
                    placeholder="e.g. user@oksbi"
                    value={formData.upiId}
                    onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              )}

              {/* Share Count & Live Calculation */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Share Count (1 share reduces 1 from pool):</span>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setFormData((p) => ({ ...p, shares: Math.max(1, p.shares - 1) }))}
                      className="w-6 h-6 rounded bg-slate-800 text-white font-bold"
                    >
                      -
                    </button>
                    <span className="font-bold text-sm text-white w-6 text-center">{formData.shares}</span>
                    <button
                      type="button"
                      onClick={() => setFormData((p) => ({ ...p, shares: p.shares + 1 }))}
                      className="w-6 h-6 rounded bg-slate-800 text-white font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2 mt-2 border-t border-slate-800">
                  <span className="text-slate-400">Total Amount:</span>
                  <span className="font-mono font-bold text-emerald-400 text-sm">
                    ₹{formData.shares * PRICE_PER_SHARE}
                  </span>
                </div>
              </div>

              <button
                style={{ color: 'white' }}
                type="submit"
                disabled={submitting}
                className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold py-2.5 rounded-xl transition"
              >
                {submitting ? 'Adding...' : 'Add Contributor'}
              </button>
            </form>
          </div>

          {/* Full Database Table */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <h3 className="font-bold text-white text-base">Contributors Database</h3>
                <p className="text-xs text-slate-400">Full unmasked records with direct actions</p>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search name, phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 w-44"
                  />
                </div>

                <select
                  value={modeFilter}
                  onChange={(e) => setModeFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none"
                >
                  <option value="ALL">All Modes</option>
                  <option value="UPI">UPI</option>
                  <option value="Cash">Cash</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto mt-4 flex-1">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 uppercase font-semibold text-slate-400 border-b border-slate-800 text-[11px]">
                  <tr>
                    <th className="px-3 py-2.5">Name</th>
                    <th className="px-3 py-2.5">Contact</th>
                    <th className="px-3 py-2.5">Place</th>
                    <th className="px-3 py-2.5">Mode</th>
                    <th className="px-3 py-2.5">Shares</th>
                    <th className="px-3 py-2.5">Amount</th>
                    <th className="px-3 py-2.5">Refund</th>
                    <th className="px-3 py-2.5 text-right">Delete</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredContributors.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="text-center py-8 text-slate-500">
                        No contributor records found.
                      </td>
                    </tr>
                  ) : (
                    filteredContributors.map((c) => (
                      <tr key={c._id} className="hover:bg-slate-800/30 transition">
                        <td className="px-3 py-2.5 font-semibold text-white">{c.name}</td>
                        <td className="px-3 py-2.5 space-y-0.5">
                          <div className="flex items-center gap-1 text-slate-300">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{c.phone}</span>
                          </div>
                          <a
                            href={`https://wa.me/91${c.whatsapp}?text=Hi%20${encodeURIComponent(
                              c.name
                            )},%20thank%20you%20for%20purchasing%20${c.shares}%20share(s).`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] text-emerald-400 hover:underline"
                          >
                            <MessageSquare className="w-2.5 h-2.5" />
                            <span>WhatsApp</span>
                          </a>
                        </td>
                        <td className="px-3 py-2.5">
                          <span className="flex items-center gap-1 text-slate-300">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {c.place}
                          </span>
                        </td>
                        <td className="px-3 py-2.5">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                              c.paymentMode === 'UPI'
                                ? 'bg-purple-500/20 text-purple-300'
                                : 'bg-amber-500/20 text-amber-300'
                            }`}
                          >
                            {c.paymentMode}
                          </span>
                          {c.upiId && <div className="text-[10px] text-slate-400 font-mono mt-0.5">{c.upiId}</div>}
                        </td>
                        <td className="px-3 py-2.5 font-bold text-white">{c.shares}</td>
                        <td className="px-3 py-2.5 font-mono text-emerald-400 font-bold">₹{c.amount}</td>
                        <td className="px-3 py-2.5">
                          <select
                            value={c.refundStatus || 'Pending'}
                            onChange={(e) => handleRefundStatusChange(c._id, e.target.value)}
                            className={`rounded-lg border px-2 py-1 text-[10px] font-semibold focus:outline-none ${
                              (c.refundStatus || 'Pending') === 'Completed'
                                ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                                : 'border-amber-500/40 bg-amber-500/10 text-amber-300'
                            }`}
                            aria-label={`Refund status for ${c.name}`}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Completed">Completed</option>
                          </select>
                        </td>
                        <td className="px-3 py-2.5 text-right">
                          <button
                            onClick={() => handleDelete(c._id, c.name)}
                            className="p-1.5 rounded-lg bg-red-950/40 text-red-400 hover:bg-red-900/60 transition"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}