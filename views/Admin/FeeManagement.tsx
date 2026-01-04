
import React, { useState } from 'react';
import { firebaseService } from '../../services/firebaseService';
import { CURRENCY, ZAMBIAN_GRADES, TERMS } from '../../constants';
import { Payment } from '../../types';

const FeeManagement: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>(firebaseService.getPayments());
  const [activeTab, setActiveTab] = useState<'payments' | 'structure'>('payments');
  const [isMoMoModalOpen, setIsMoMoModalOpen] = useState(false);
  
  const [momoForm, setMomoForm] = useState({
    studentId: 'std-1',
    amount: '',
    method: 'MTN_MOMO' as const,
    phone: ''
  });

  const handleMomoPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const newPayment: Payment = {
      id: `pay-${Date.now()}`,
      studentId: momoForm.studentId,
      amount: parseFloat(momoForm.amount),
      method: momoForm.method,
      status: 'PAID',
      date: new Date().toISOString().split('T')[0],
      receiptNumber: `RCP-${Math.floor(Math.random() * 900000) + 100000}`
    };
    firebaseService.addPayment(newPayment);
    setPayments(firebaseService.getPayments());
    setIsMoMoModalOpen(false);
    alert(`Payment successful! Receipt ${newPayment.receiptNumber} generated.`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Financial Management</h2>
          <p className="text-gray-500">Track tuition, payments, and balances</p>
        </div>
        <button 
          onClick={() => setIsMoMoModalOpen(true)}
          className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-emerald-700 transition flex items-center gap-2"
        >
          <i className="fas fa-mobile-alt"></i> Mobile Money Payment
        </button>
      </div>

      <div className="flex border-b border-gray-200">
        <button 
          onClick={() => setActiveTab('payments')}
          className={`px-6 py-3 font-semibold transition-colors border-b-2 ${activeTab === 'payments' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Payment History
        </button>
        <button 
          onClick={() => setActiveTab('structure')}
          className={`px-6 py-3 font-semibold transition-colors border-b-2 ${activeTab === 'structure' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Fee Structures
        </button>
      </div>

      {activeTab === 'payments' ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-sm font-bold text-gray-700 uppercase">Receipt</th>
                <th className="px-6 py-4 text-sm font-bold text-gray-700 uppercase">Student ID</th>
                <th className="px-6 py-4 text-sm font-bold text-gray-700 uppercase">Method</th>
                <th className="px-6 py-4 text-sm font-bold text-gray-700 uppercase">Amount ({CURRENCY})</th>
                <th className="px-6 py-4 text-sm font-bold text-gray-700 uppercase">Status</th>
                <th className="px-6 py-4 text-sm font-bold text-gray-700 uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {payments.map(p => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{p.receiptNumber}</td>
                  <td className="px-6 py-4 text-gray-600">{p.studentId}</td>
                  <td className="px-6 py-4">
                    <span className="flex items-center gap-2">
                       <i className={`fas ${p.method.includes('MOMO') || p.method.includes('MONEY') ? 'fa-mobile-alt text-blue-500' : 'fa-university text-gray-500'}`}></i>
                       {p.method.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-900">{p.amount.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${p.status === 'PAID' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{p.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ZAMBIAN_GRADES.slice(0, 6).map(grade => (
            <div key={grade} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-start mb-4">
                <h4 className="text-lg font-bold text-gray-800">{grade}</h4>
                <button className="text-blue-600 hover:text-blue-800"><i className="fas fa-edit"></i></button>
              </div>
              <div className="space-y-3">
                {TERMS.map(term => (
                  <div key={term} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                    <span className="text-gray-600">Term {term}</span>
                    <span className="font-bold">{CURRENCY} {grade.includes('7') ? '2,500' : '1,800'}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MoMo Payment Modal */}
      {isMoMoModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden">
            <div className="bg-emerald-600 p-6 text-white text-center">
              <i className="fas fa-mobile-alt text-4xl mb-2"></i>
              <h3 className="text-xl font-bold">Mobile Money Portal</h3>
              <p className="text-emerald-100 text-sm">Simulated Payment Gateway</p>
            </div>
            <form onSubmit={handleMomoPayment} className="p-8 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Network Provider</label>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    type="button" 
                    onClick={() => setMomoForm({...momoForm, method: 'MTN_MOMO'})}
                    className={`py-3 rounded-lg border-2 font-bold transition ${momoForm.method === 'MTN_MOMO' ? 'border-yellow-400 bg-yellow-50 text-yellow-700' : 'border-gray-100 text-gray-500'}`}
                  >
                    MTN MoMo
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setMomoForm({...momoForm, method: 'AIRTEL_MONEY'})}
                    className={`py-3 rounded-lg border-2 font-bold transition ${momoForm.method === 'AIRTEL_MONEY' ? 'border-red-600 bg-red-50 text-red-700' : 'border-gray-100 text-gray-500'}`}
                  >
                    Airtel Money
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                <input 
                  type="text" required placeholder="097... / 096..."
                  className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-emerald-500"
                  value={momoForm.phone}
                  onChange={e => setMomoForm({...momoForm, phone: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount ({CURRENCY})</label>
                <input 
                  type="number" required placeholder="0.00"
                  className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-emerald-500"
                  value={momoForm.amount}
                  onChange={e => setMomoForm({...momoForm, amount: e.target.value})}
                />
              </div>
              <div className="pt-4 flex gap-3">
                 <button type="button" onClick={() => setIsMoMoModalOpen(false)} className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-100 rounded-lg">Cancel</button>
                 <button type="submit" className="flex-1 py-3 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700">Pay Now</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeeManagement;
