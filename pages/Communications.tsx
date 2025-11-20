import React from 'react';
import { Mail, Slack, MessageSquare, Star, Clock } from 'lucide-react';

const Communications: React.FC = () => {
  const communications = [
    { id: 1, type: 'email', from: 'CEO Office', subject: 'Q3 Strategy Review', time: '10:30 AM', preview: 'Please find attached the agenda for tomorrow...', important: true },
    { id: 2, type: 'slack', from: '#prod-eng', subject: 'Deploy Status', time: '11:15 AM', preview: '@jane-doe deployment successful, monitoring metrics...', important: false },
    { id: 3, type: 'email', from: 'HR Team', subject: 'Open Enrollment', time: 'Yesterday', preview: 'Reminder to complete your benefits selection...', important: false },
    { id: 4, type: 'slack', from: 'D. Miller', subject: 'Direct Message', time: 'Yesterday', preview: 'Do you have 5 mins to sync on the Figma file?', important: true },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Communications Hub</h1>
      
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
         <div className="p-4 border-b border-slate-200 bg-slate-50 flex space-x-4 text-sm font-medium text-slate-600 overflow-x-auto">
            <button className="text-indigo-600 border-b-2 border-indigo-600 pb-2 px-2">Unified Inbox</button>
            <button className="hover:text-slate-800 pb-2 px-2">Email (High Priority)</button>
            <button className="hover:text-slate-800 pb-2 px-2">Slack Mentions</button>
            <button className="hover:text-slate-800 pb-2 px-2">Drafts (AI Generated)</button>
         </div>

         <div className="divide-y divide-slate-100">
            {communications.map(comm => (
                <div key={comm.id} className="p-4 hover:bg-slate-50 transition-colors cursor-pointer flex items-start">
                    <div className="mr-4 mt-1">
                        {comm.type === 'email' ? (
                            <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                                <Mail className="w-4 h-4" />
                            </div>
                        ) : (
                            <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center">
                                <Slack className="w-4 h-4" />
                            </div>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                            <h3 className={`text-sm font-semibold ${comm.important ? 'text-slate-900' : 'text-slate-700'}`}>
                                {comm.from}
                            </h3>
                            <span className="text-xs text-slate-400 flex items-center">
                                {comm.time}
                            </span>
                        </div>
                        <h4 className="text-sm font-medium text-slate-800 mt-0.5">{comm.subject}</h4>
                        <p className="text-sm text-slate-500 truncate">{comm.preview}</p>
                    </div>
                    {comm.important && (
                        <div className="ml-4">
                            <Star className="w-4 h-4 text-amber-400 fill-current" />
                        </div>
                    )}
                </div>
            ))}
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <div className="bg-indigo-50 rounded-xl p-6 border border-indigo-100">
            <div className="flex items-center mb-3">
                <MessageSquare className="w-5 h-5 text-indigo-600 mr-2" />
                <h3 className="font-bold text-indigo-900">AI Draft Suggestion</h3>
            </div>
            <p className="text-sm text-indigo-800 mb-4">
                Based on the email from "CEO Office", I've drafted a response confirming your attendance and attaching the Q2 metrics.
            </p>
            <button className="bg-indigo-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-indigo-700">
                Review Draft
            </button>
         </div>
      </div>
    </div>
  );
};

export default Communications;