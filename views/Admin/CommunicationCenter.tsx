
import React, { useState } from 'react';
import { firebaseService } from '../../services/firebaseService';

const CommunicationCenter: React.FC = () => {
  const [logs, setLogs] = useState(firebaseService.getCommLogs());
  const [recipientGroup, setRecipientGroup] = useState('All Parents');
  const [message, setMessage] = useState('');
  const [sendSMS, setSendSMS] = useState(true);
  const [sendPortal, setSendPortal] = useState(true);
  const [isSending, setIsSending] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    if (!sendSMS && !sendPortal) {
      alert("Please select at least one delivery channel (SMS or Portal).");
      return;
    }

    setIsSending(true);
    try {
      const channels: ('SMS' | 'PORTAL')[] = [];
      if (sendSMS) channels.push('SMS');
      if (sendPortal) channels.push('PORTAL');

      await firebaseService.sendBulkCommunication(recipientGroup, message, channels);
      setLogs(firebaseService.getCommLogs());
      setMessage('');
      alert("Communication dispatched successfully!");
    } catch (err) {
      alert("Failed to send bulk communication.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Communication Center</h2>
        <p className="text-gray-500">Dispatch bulk SMS and in-app portal notifications to the school community</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Composer */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-6">
            <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
              <i className="fas fa-edit text-blue-600"></i>
              Compose Message
            </h3>
            <form onSubmit={handleSend} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Recipient Group</label>
                <select 
                  className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900"
                  value={recipientGroup}
                  onChange={(e) => setRecipientGroup(e.target.value)}
                >
                  <option value="All Parents">All Parents</option>
                  <option value="All Teachers">All Teachers</option>
                  <option value="All Staff">All Staff</option>
                  <option value="Grade 7 Parents">Grade 7 Parents</option>
                  <option value="Grade 12 Parents">Grade 12 Parents</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Channels</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition">
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 text-blue-600 rounded" 
                      checked={sendSMS}
                      onChange={(e) => setSendSMS(e.target.checked)}
                    />
                    <div>
                      <p className="text-sm font-bold text-gray-800 flex items-center gap-2">
                        <i className="fas fa-sms text-gray-400"></i> SMS Text Message
                      </p>
                      <p className="text-[10px] text-gray-500">Sent to verified mobile numbers</p>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition">
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 text-blue-600 rounded" 
                      checked={sendPortal}
                      onChange={(e) => setSendPortal(e.target.checked)}
                    />
                    <div>
                      <p className="text-sm font-bold text-gray-800 flex items-center gap-2">
                        <i className="fas fa-desktop text-gray-400"></i> Portal Notification
                      </p>
                      <p className="text-[10px] text-gray-500">Displays on user dashboards when logged in</p>
                    </div>
                  </label>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-sm font-medium text-gray-700">Message Content</label>
                  <span className={`text-xs ${message.length > 160 ? 'text-red-500 font-bold' : 'text-gray-400'}`}>
                    {message.length} / 160
                  </span>
                </div>
                <textarea 
                  required
                  rows={5}
                  className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm bg-white text-slate-900"
                  placeholder="Official announcement content..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                ></textarea>
              </div>

              <button 
                type="submit"
                disabled={isSending || !message.trim() || (!sendSMS && !sendPortal)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-3 rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSending ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Dispatching...
                  </>
                ) : (
                  <>
                    <i className="fas fa-paper-plane"></i>
                    Send Communication
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* History */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50">
              <h3 className="font-bold text-gray-700 flex items-center gap-2">
                <i className="fas fa-history text-gray-400"></i>
                Transmission History
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Group</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Channels</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Message</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50 transition text-sm">
                      <td className="px-6 py-4">
                        <span className="font-bold text-gray-700 whitespace-nowrap">
                          {log.group}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-1">
                          {log.channels.map((ch: string) => (
                            <span key={ch} className={`text-[10px] font-black px-1.5 py-0.5 rounded ${ch === 'SMS' ? 'bg-amber-100 text-amber-700' : 'bg-purple-100 text-purple-700'}`}>
                              {ch}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 max-w-xs">
                        <p className="text-gray-600 line-clamp-2">{log.message}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs text-gray-500 whitespace-nowrap">{log.date}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-xs font-bold text-emerald-600 flex items-center justify-end gap-1">
                          <i className="fas fa-check-circle"></i>
                          SENT
                        </span>
                      </td>
                    </tr>
                  ))}
                  {logs.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                        No messages sent yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunicationCenter;
