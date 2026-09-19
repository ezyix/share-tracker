'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ShieldCheck, TrendingUp, Coins, Layers, CreditCard, Sun, User, Moon } from 'lucide-react';

/**
 * Mask function: displays only first and last letter of each word
 * e.g., "Mohammed Rashid" -> "M******d R****d"
 */
function maskName(fullName) {
  if (!fullName) return 'Anonymous';
  const parts = fullName.trim().split(/\s+/);
  return parts
    .map((word) => {
      if (word.length <= 1) return word + '*';
      if (word.length === 2) return `${word[0]}*${word[1]}`;
      const first = word[0];
      const last = word[word.length - 1];
      const asterisks = '*'.repeat(Math.min(Math.max(word.length - 2, 2), 6));
      return `${first}${asterisks}${last}`;
    })
    .join(' ');
}

export default function PublicPage() {
  const [isDarkMode, setIsDarkMode] = useState(false);
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
  const [contributors, setContributors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/contributors');
      const json = await res.json();
      if (json.success) {
        setSummary(json.summary);
        setContributors(json.data);
      }
    } catch (err) {
      console.error('Failed fetching data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    const startedAt = Date.now();

    try {
      await fetchData();
    } finally {
      const remainingTime = Math.max(0, 500 - (Date.now() - startedAt));
      setTimeout(() => setRefreshing(false), remainingTime);
    }
  };

  useEffect(() => {
    document.documentElement.classList.toggle('theme-dark', isDarkMode);
    document.documentElement.classList.toggle('theme-light', !isDarkMode);

    return () => {
      document.documentElement.classList.remove('theme-dark', 'theme-light');
    };
  }, [isDarkMode]);

  useEffect(() => {
    fetchData();

    const intervalId = setInterval(() => {
      fetchData();
    }, 2000);

    return () => clearInterval(intervalId);
  }, [fetchData]);

  const progressPercent = Math.min(
    100,
    (summary.totalSharesReceived / summary.totalTargetShares) * 100
  ).toFixed(1);

  return (
    <div className={`min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans ${isDarkMode ? 'theme-dark' : 'theme-light'}`}>
      {/* Top Bar */}
      <header className="border-b border-slate-800 bg-slate-900/70 backdrop-blur sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsDarkMode((current) => !current)}
              type="button"
              className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-200 transition hover:border-emerald-400 hover:text-emerald-400"
              aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
            >
              {isDarkMode ? <Sun /> : <Moon />}
            </button>
            <button
              onClick={handleRefresh}
              title="Refresh Data"
              aria-label="Refresh data"
            >
            </button>
            
          </div>

          <div className="flex items-center space-x-2">
            <div >
            </div>
            <span className="font-bold text-lg text-white"><ShieldCheck /></span>
          </div>

         
        </div>
      </header>

      {/* Main Body */}
      <main className="max-w-6xl w-full mx-auto px-4 py-8 flex-1 space-y-8">
        {/* Hero Card */}
        <section className="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 relative overflow-hidden">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-3">
            <ShieldCheck className="w-3.5 h-3.5" /> 
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white">
            A HELP FOR OUR SALAFI BROTHER
          </h1>
          <br/>

          <div >

             <div className="text-right" dir="rtl">
          <p className="text-slate-400 text-sm mt-1 max-w-xl ml-auto">
            
            حَدَّثَنَا يَحْيَى بْنُ بُكَيْرِ، حَدَّثَنَا اللَّيْثُ، عَنْ عُقَيْلٍ ، 
              
          </p>
          <p className="text-slate-400 text-sm mt-1 max-w-xl ml-auto">
            
             عَنِ ابْنِ شِهَابٍ، أَنَّ سَالِمًا، أَخْبَرَهُ أَنَّ عَبْدَ اللَّهِ بْنَ              
          </p>

          <p className="text-slate-400 text-sm mt-1 max-w-xl ml-auto">

            عُمَرَ ـ رضى الله عنهما ـ

          </p>  

           <p className="text-slate-400 text-sm mt-1 max-w-xl ml-auto" style={{color:'var(--theme-strong-text)'}}>

              أَخْبَرَهُ أَنَّ رَسُولَ اللَّهِ صلى الله عليه وسلم قَالَ
            
          </p>  

          <p className="text-slate-400 text-sm mt-1 max-w-xl ml-auto" style={{color:'var(--theme-strong-text)'}}>

            الْمُسْلِمُ أَخُو الْمُسْلِمِ، لاَ يَظْلِمُهُ، وَلاَ يُسْلِمُهُ، وَمَنْ
            
          </p>   

          <p className="text-slate-400 text-sm mt-1 max-w-xl ml-auto"style={{color:'var(--theme-strong-text)'}}>

            كَانَ فِي حَاجَةِ أَخِيهِ، كَانَ اللَّهُ فِي حَاجَتِهِ 
   
          </p> 
          </div>  

          <div className="text-left" style={{ marginTop: '45px' }}>

           <p className="text-slate-400 text-sm mt-1 max-w-xl">
            Narrated `Abdullah bin `Umar:
            <br/><br/>

            
              
          </p>

           <p className="text-slate-400 text-sm mt-1 max-w-xl" style={{color:'var(--theme-strong-text)'}}>
         
            Allah's Messenger (ﷺ)  said, "A Muslim is a brother of another Muslim.
             So he should neither oppress him nor hand him over to an oppressor.
            And whoever fulfilled the needs of his brother, Allah will fulfill his needs."
            
              
          </p>

          </div>
          <br/>

         

          <h2 style={{color:'var(--theme-strong-text)',fontWeight:'800',fontSize:'17px'}} className="text-right" dir="rtl">Sahih al-Bukhari, 6951</h2> 
          </div> 

          <br/>        

          {/* 4 Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mt-6">
            <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl">
              <div className="text-xs text-slate-400 flex justify-between items-center">
                <span>Share Amount</span>
                <Coins className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-bold text-white mt-1">₹{summary.pricePerShare}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Fixed price per share</div>
            </div>

            <div className="bg-slate-900/90 border border-emerald-500/30 p-4 rounded-2xl">
              <div className="text-xs text-emerald-400 flex justify-between items-center">
                <span>Shares Received</span>
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-bold text-emerald-400 mt-1">
                {summary.totalSharesReceived}{' '}
                <span className="text-xs text-slate-400 font-normal">/ 250</span>
              </div>
              <div className="text-[10px] text-emerald-500/80 mt-0.5">
                ₹{summary.totalMoneyCollected.toLocaleString('en-IN')} collected
              </div>
            </div>

            <div className="bg-slate-900/90 border border-emerald-500/30 p-4 rounded-2xl">
              <div className="text-xs text-emerald-400 flex justify-between items-center">
                <span>Money Received</span>
                <CreditCard className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-bold text-emerald-400 mt-1">
                ₹{summary.totalMoneyCollected.toLocaleString('en-IN')}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Total amount collected</div>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl">
              <div className="text-xs text-amber-400 flex justify-between items-center">
                <span>Shares Needed</span>
                <Layers className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-bold text-amber-400 mt-1">
                {summary.balanceSharesNeeded}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Remaining to complete</div>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl">
              <div className="text-xs text-cyan-400 flex justify-between items-center">
                <span>Balance Money Needed</span>
                <CreditCard className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-2xl font-bold text-cyan-400 mt-1">
                ₹{summary.balanceMoneyNeeded.toLocaleString('en-IN')}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Goal: ₹1,00,000</div>
            </div>

            <div className="bg-slate-900/90 border border-emerald-500/30 p-4 rounded-2xl">
              <div className="text-xs text-emerald-400 flex justify-between items-center">
                <span>Refund Completed</span>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-bold text-emerald-400 mt-1">
                ₹{(summary.refundCompletedAmount || 0).toLocaleString('en-IN')}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                {summary.refundCompletedCount || 0} contributor{(summary.refundCompletedCount || 0) === 1 ? '' : 's'}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-6 bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <div className="flex justify-between items-center text-xs mb-2">
              <span className="text-slate-400">Target Progress</span>
              <span className="font-mono text-emerald-400 font-bold">{progressPercent}%</span>
            </div>
            <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>
        </section>

        {/* Masked Contributors List */}
        <section className="bg-slate-900 border border-slate-800 rounded-3xl">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 p-6 ">
            <div>
              <h2 className="text-lg font-bold text-white">Contributors List</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                
              </p>
            </div>
            <span className="text-xs bg-slate-800 text-emerald-400 px-3 py-1 rounded-full font-mono" style={{ color: 'var(--theme-strong-text)' }}>
              {contributors.length} <User className="w-3.5 h-3.5 inline-block ml-1" />
            </span>
          </div>

          <div className="overflow-x-auto mt-4">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/60 uppercase font-semibold text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">#</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Shares</th>
                  <th className="px-4 py-3">Paid</th>
                  <th className="px-4 py-3">Refund</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {contributors.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-6 text-slate-500">
                      {loading ? 'Loading contributions...' : 'No contributions recorded yet.'}
                    </td>
                  </tr>
                ) : (
                  contributors.map((c, index) => (
                    <tr key={c._id} className="hover:bg-slate-800/30 transition">
                      <td className="px-4 py-3 font-mono text-slate-500">{index + 1}</td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-sm font-semibold text-white tracking-wide">
                          {maskName(c.name)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded text-[11px] font-semibold">
                          {c.shares} {c.shares > 1 ? '' : 'share'}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-sm font-bold text-emerald-400">
                        ₹{c.amount}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded px-2 py-0.5 text-[11px] font-semibold ${
                            (c.refundStatus || 'Pending') === 'Completed'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}
                        >
                          {c.refundStatus || 'Pending'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}