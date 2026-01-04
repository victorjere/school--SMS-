
import React, { useState, useRef } from 'react';
import { firebaseService } from '../../services/firebaseService';
import { SchoolSettings, PaymentAccount } from '../../types';
import { TERMS } from '../../constants';

interface SchoolSettingsViewProps {
  settings: SchoolSettings;
  onUpdate: (newSettings: SchoolSettings) => void;
}

const SchoolSettingsView: React.FC<SchoolSettingsViewProps> = ({ settings, onUpdate }) => {
  const [formData, setFormData] = useState<SchoolSettings>({ ...settings });
  const [activeTab, setActiveTab] = useState<'branding' | 'payments'>('branding');
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // New Account Modal State
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [newAcc, setNewAcc] = useState<Omit<PaymentAccount, 'id'>>({
    provider: 'MTN MoMo',
    accountName: settings.name,
    accountNumber: '',
    type: 'MOBILE_MONEY'
  });

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    const updated = firebaseService.updateSettings(formData);
    onUpdate(updated);
    setIsSaving(false);
  };

  const handleAddAccount = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedAccounts = [...formData.paymentAccounts, { ...newAcc, id: `acc-${Date.now()}` }];
    const updatedSettings = { ...formData, paymentAccounts: updatedAccounts };
    setFormData(updatedSettings);
    setIsAccountModalOpen(false);
    setNewAcc({ provider: 'MTN MoMo', accountName: settings.name, accountNumber: '', type: 'MOBILE_MONEY' });
  };

  const removeAccount = (id: string) => {
    setFormData({
      ...formData,
      paymentAccounts: formData.paymentAccounts.filter(a => a.id !== id)
    });
  };

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setFormData(prev => ({ ...prev, logo: e.target?.result as string }));
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Configuration Center</h2>
          <p className="text-slate-500 text-sm font-medium">Manage school identity, academic structure, and bank details</p>
        </div>
        <div className="flex bg-slate-100 p-1.5 rounded-2xl">
          <button 
            onClick={() => setActiveTab('branding')}
            className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'branding' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}
          >
            Identity
          </button>
          <button 
            onClick={() => setActiveTab('payments')}
            className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'payments' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}
          >
            Payments
          </button>
        </div>
      </div>

      {activeTab === 'branding' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col items-center text-center space-y-4">
               <div 
                onClick={() => fileInputRef.current?.click()}
                className="relative group cursor-pointer w-32 h-32 rounded-[2.5rem] overflow-hidden border-4 border-slate-50 shadow-inner"
              >
                <img src={formData.logo} className="w-full h-full object-cover" alt="Logo" />
                <div className="absolute inset-0 bg-blue-600/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                  <i className="fas fa-camera text-xl"></i>
                </div>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
              </div>
              <div>
                <p className="text-lg font-black text-slate-900">{formData.name}</p>
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-1">Official Institution</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="md:col-span-2 space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">School Name</label>
                      <input type="text" className="w-full border-2 border-slate-100 rounded-2xl p-4 font-bold text-slate-900 outline-none focus:border-blue-500" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact Email</label>
                      <input type="email" className="w-full border-2 border-slate-100 rounded-2xl p-4 font-bold text-slate-900 outline-none focus:border-blue-500" value={formData.contactEmail} onChange={e => setFormData({...formData, contactEmail: e.target.value})} />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact Phone</label>
                      <input type="tel" className="w-full border-2 border-slate-100 rounded-2xl p-4 font-bold text-slate-900 outline-none focus:border-blue-500" value={formData.contactPhone} onChange={e => setFormData({...formData, contactPhone: e.target.value})} />
                   </div>
                   <div className="md:col-span-2 space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Address</label>
                      <textarea className="w-full border-2 border-slate-100 rounded-2xl p-4 font-bold text-slate-900 outline-none focus:border-blue-500" rows={2} value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Term</label>
                      <select className="w-full border-2 border-slate-100 rounded-2xl p-4 font-black text-blue-600 outline-none" value={formData.currentTerm} onChange={e => setFormData({...formData, currentTerm: parseInt(e.target.value) as 1|2|3})}>
                        {TERMS.map(t => <option key={t} value={t}>Term {t}</option>)}
                      </select>
                   </div>
                </div>
              </div>
              <div className="p-6 bg-slate-50 border-t flex justify-end">
                 <button type="submit" className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-black text-sm shadow-xl shadow-blue-600/30">Save Settings</button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-blue-600 rounded-[2rem] p-8 text-white flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-left">
              <h3 className="text-2xl font-black">Financial Destinations</h3>
              <p className="text-blue-100 text-sm mt-1">Configure where parents send school fee payments.</p>
            </div>
            <button 
              onClick={() => setIsAccountModalOpen(true)}
              className="bg-white text-blue-600 px-6 py-3 rounded-2xl font-black text-sm shadow-xl active:scale-95 transition"
            >
              <i className="fas fa-plus mr-2"></i> Add Account
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {formData.paymentAccounts.map(acc => (
              <div key={acc.id} className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 relative group overflow-hidden">
                <div className="flex items-center gap-4 mb-6">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-sm ${
                    acc.type === 'MOBILE_MONEY' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'
                  }`}>
                    <i className={acc.type === 'MOBILE_MONEY' ? 'fas fa-mobile-alt' : 'fas fa-university'}></i>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{acc.provider}</p>
                    <p className="font-black text-slate-900">{acc.accountName}</p>
                  </div>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Account / Merchant ID</p>
                  <p className="text-xl font-black text-slate-900 tracking-tight">{acc.accountNumber}</p>
                </div>
                <button 
                  onClick={() => removeAccount(acc.id)}
                  className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition p-2"
                >
                  <i className="fas fa-trash-alt"></i>
                </button>
              </div>
            ))}
          </div>
          
          <div className="flex justify-end pt-4">
             <button 
               onClick={() => handleSubmit()} 
               className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black text-sm shadow-xl"
              >
                Apply All Payment Updates
              </button>
          </div>
        </div>
      )}

      {/* Add Account Modal */}
      {isAccountModalOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-[110] p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="bg-slate-900 p-8 text-white">
              <h3 className="text-xl font-black">New Payment Destination</h3>
              <p className="text-slate-400 text-xs mt-1">Configure a new bank or MoMo channel</p>
            </div>
            <form onSubmit={handleAddAccount} className="p-8 space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Account Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      type="button" 
                      onClick={() => setNewAcc({...newAcc, type: 'MOBILE_MONEY', provider: 'MTN MoMo'})}
                      className={`py-3 rounded-xl border-2 font-black text-[10px] transition-all uppercase tracking-widest ${newAcc.type === 'MOBILE_MONEY' ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-100 text-slate-400'}`}
                    >
                      Mobile Money
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setNewAcc({...newAcc, type: 'BANK', provider: 'ZANACO'})}
                      className={`py-3 rounded-xl border-2 font-black text-[10px] transition-all uppercase tracking-widest ${newAcc.type === 'BANK' ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-100 text-slate-400'}`}
                    >
                      Bank Account
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Provider Name</label>
                  <input type="text" placeholder="e.g. MTN, FNB, ZANACO" required className="w-full border-2 border-slate-100 rounded-2xl p-4 font-bold outline-none text-slate-900" value={newAcc.provider} onChange={e => setNewAcc({...newAcc, provider: e.target.value})} />
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Account Name</label>
                  <input type="text" placeholder="School Business Name" required className="w-full border-2 border-slate-100 rounded-2xl p-4 font-bold outline-none text-slate-900" value={newAcc.accountName} onChange={e => setNewAcc({...newAcc, accountName: e.target.value})} />
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Merchant Code / Account Number</label>
                  <input type="text" placeholder="000000" required className="w-full border-2 border-slate-100 rounded-2xl p-4 font-black outline-none text-slate-900 text-lg" value={newAcc.accountNumber} onChange={e => setNewAcc({...newAcc, accountNumber: e.target.value})} />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsAccountModalOpen(false)} className="flex-1 py-4 text-slate-400 font-black text-sm">Cancel</button>
                <button type="submit" className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-blue-600/30">Add Channel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchoolSettingsView;
