
import React, { useState, useEffect } from 'react';
import { firebaseService } from '../../services/firebaseService';
import { RegistrationRequest } from '../../types';

const UserApprovals: React.FC = () => {
  const [requests, setRequests] = useState<RegistrationRequest[]>([]);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    setRequests(firebaseService.getPendingUsers());
  }, []);

  const handleApprove = async (id: string) => {
    setProcessingId(id);
    try {
      await firebaseService.approveUser(id);
      setRequests(firebaseService.getPendingUsers());
      alert("User account successfully verified and approved!");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: string) => {
    if (!confirm("Are you sure you want to reject this registration?")) return;
    setProcessingId(id);
    await firebaseService.rejectUser(id);
    setRequests(firebaseService.getPendingUsers());
    setProcessingId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Verification Center</h2>
          <p className="text-gray-500">Approve accounts after checking names against school database</p>
        </div>
        <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-xl text-sm font-bold border border-blue-100">
          {requests.length} Pending Requests
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {requests.length > 0 ? (
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Name & Role</th>
                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Contact Info</th>
                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-center">Date Requested</th>
                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Verification Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {requests.map(req => (
                <tr key={req.id} className="hover:bg-blue-50/30 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-black text-slate-500">
                        {req.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 leading-tight">{req.name}</p>
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                          req.role === 'TEACHER' ? 'bg-purple-100 text-purple-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {req.role}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-gray-600">{req.email}</p>
                    <p className="text-xs text-gray-400">{req.phoneNumber}</p>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-xs font-bold text-gray-500">{req.requestDate}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => handleReject(req.id)}
                        disabled={!!processingId}
                        className="px-4 py-2 bg-red-50 text-red-600 rounded-xl text-xs font-bold hover:bg-red-100 transition disabled:opacity-50"
                      >
                        Reject
                      </button>
                      <button 
                        onClick={() => handleApprove(req.id)}
                        disabled={!!processingId}
                        className="px-6 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition flex items-center gap-2 shadow-lg shadow-emerald-600/20 disabled:opacity-50"
                      >
                        {processingId === req.id ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-check"></i>}
                        Verify & Approve
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="py-24 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <i className="fas fa-user-check text-gray-300 text-3xl"></i>
            </div>
            <h3 className="text-xl font-bold text-gray-900">Queue is Clear!</h3>
            <p className="text-gray-400 mt-1">There are no pending account verification requests.</p>
          </div>
        )}
      </div>
      
      <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100 flex items-start gap-4">
        <i className="fas fa-shield-alt text-amber-600 text-xl mt-1"></i>
        <div>
          <h4 className="font-bold text-amber-900">Zambian School Security Protocol</h4>
          <p className="text-sm text-amber-700 leading-relaxed mt-1">
            Verification is mandatory. When you click <strong>Approve</strong>, SchoolUp automatically validates the applicant's name against the schools' registered employee and parent rolls. This prevents unauthorized access to student sensitive data.
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserApprovals;
