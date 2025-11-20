import React, { useEffect, useState } from 'react';
import { Plus, Calendar as CalendarIcon } from 'lucide-react';
import { generateMorningBriefing } from '../services/geminiService';
import TaskCard from '../components/TaskCard';
import ProjectPulse from '../components/ProjectPulse';
import { useStore } from '../context/StoreContext';

const Dashboard: React.FC = () => {
  const { tasks, events, projects, updateTask } = useStore();
  const [briefing, setBriefing] = useState<string>('');
  const [isLoadingBriefing, setIsLoadingBriefing] = useState(true);

  useEffect(() => {
    const fetchBriefing = async () => {
      // Check local storage for cached briefing today to save tokens
      const today = new Date().toDateString();
      const cached = localStorage.getItem('daily_briefing');
      const cachedDate = localStorage.getItem('daily_briefing_date');

      if (cached && cachedDate === today) {
        setBriefing(cached);
        setIsLoadingBriefing(false);
        return;
      }

      try {
        const text = await generateMorningBriefing(tasks, events, projects);
        setBriefing(text);
        localStorage.setItem('daily_briefing', text);
        localStorage.setItem('daily_briefing_date', today);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoadingBriefing(false);
      }
    };
    
    if (tasks.length > 0) fetchBriefing();
  }, [tasks.length, events.length, projects.length]); 

  const activeTasks = tasks.filter(t => t.status !== 'done').slice(0, 4); // Show top 4
  const todayEvents = events.filter(e => {
      const eventDate = new Date(e.start);
      const today = new Date();
      return eventDate.getDate() === today.getDate() && eventDate.getMonth() === today.getMonth();
  }).sort((a,b) => new Date(a.start).getTime() - new Date(b.start).getTime());

  const handleCompleteTask = (id: string) => {
    updateTask(id, { status: 'done' });
  };

  return (
    <div className="space-y-8">
        {/* Briefing Section */}
        <section className="bg-gradient-to-r from-indigo-600 to-violet-700 rounded-2xl p-6 md:p-8 text-white shadow-lg relative overflow-hidden">
            <div className="relative z-10">
                <h1 className="text-2xl md:text-3xl font-bold mb-2">Good Morning, Jane.</h1>
                <div className="mt-4 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10 max-w-3xl">
                        <div className="flex items-start space-x-3">
                        <div className="p-2 bg-indigo-500/50 rounded-lg mt-1">
                            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold uppercase tracking-wider text-indigo-200 mb-1">Daily Briefing</h3>
                            <p className="text-indigo-50 text-lg leading-relaxed">
                                {isLoadingBriefing 
                                    ? "Synthesizing your daily priorities from Jira, Slack, and Calendar..." 
                                    : briefing
                                }
                            </p>
                        </div>
                        </div>
                </div>
            </div>
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-indigo-500/30 rounded-full blur-2xl pointer-events-none"></div>
        </section>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Col: Priority Tasks */}
            <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-slate-800">Today's Top Actions</h2>
                    <button className="flex items-center text-sm text-indigo-600 hover:text-indigo-800 font-medium">
                        <Plus className="w-4 h-4 mr-1" /> Add Task
                    </button>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                    {activeTasks.map(task => (
                        <TaskCard key={task.id} task={task} onComplete={handleCompleteTask} />
                    ))}
                        {activeTasks.length === 0 && (
                        <div className="p-8 text-center bg-white rounded-xl border border-dashed border-slate-300">
                            <p className="text-slate-500">All caught up! Enjoy your focus time.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Right Col: Schedule & Pulse */}
            <div className="space-y-8">
                    {/* Schedule Widget */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-bold text-slate-800 flex items-center">
                            <CalendarIcon className="w-5 h-5 mr-2 text-indigo-600" />
                            Schedule
                        </h2>
                        <span className="text-xs font-medium text-slate-400">{new Date().toLocaleDateString()}</span>
                    </div>
                    <div className="space-y-4 relative">
                        <div className="absolute left-3.5 top-2 bottom-2 w-0.5 bg-slate-100"></div>
                        
                        {todayEvents.length === 0 ? <p className="text-sm text-slate-500 pl-10">No events scheduled for today.</p> : 
                         todayEvents.map((event) => (
                            <div key={event.id} className="relative pl-10">
                                <div className={`absolute left-2 top-1.5 w-3.5 h-3.5 rounded-full border-2 border-white shadow-sm z-10 ${
                                    event.type === 'focus' ? 'bg-indigo-500' : 'bg-emerald-500'
                                }`}></div>
                                <div className={`p-3 rounded-lg text-sm ${
                                    event.type === 'focus' 
                                        ? 'bg-indigo-50 border border-indigo-100' 
                                        : 'bg-white border border-slate-200 shadow-sm'
                                }`}>
                                    <div className="flex justify-between mb-1">
                                        <span className="font-semibold text-slate-700">{event.title}</span>
                                    </div>
                                    <div className="text-xs text-slate-500">
                                        {new Date(event.start).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - 
                                        {new Date(event.end).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Project Pulse Widget */}
                <div className="h-80">
                        <ProjectPulse projects={projects} />
                </div>
            </div>
        </div>
    </div>
  );
};

export default Dashboard;