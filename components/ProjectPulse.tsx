import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Project } from '../types';
import { TrendingUp, AlertTriangle, Clock } from 'lucide-react';

interface ProjectPulseProps {
  projects: Project[];
}

const ProjectPulse: React.FC<ProjectPulseProps> = ({ projects }) => {
  
  const data = projects.map(p => ({
    name: p.name,
    value: p.progress,
    status: p.status
  }));

  const COLORS = ['#10b981', '#f59e0b', '#ef4444']; // emerald, amber, red based on assumption of order, but better to map dynamically

  const getColor = (status: string) => {
      switch(status) {
          case 'on_track': return '#10b981';
          case 'at_risk': return '#f59e0b';
          case 'delayed': return '#ef4444';
          default: return '#cbd5e1';
      }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-indigo-600" />
            Project Pulse
          </h2>
          <p className="text-xs text-slate-500">Real-time risk & progress monitoring</p>
        </div>
      </div>

      <div className="flex-1 min-h-[200px] relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getColor(entry.status)} />
              ))}
            </Pie>
            <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                itemStyle={{ color: '#475569', fontSize: '12px', fontWeight: 600 }}
            />
          </PieChart>
        </ResponsiveContainer>
        {/* Centered Label */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
           <div className="text-center">
               <span className="block text-2xl font-bold text-slate-800">{projects.length}</span>
               <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Active</span>
           </div>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {projects.map(p => (
          <div key={p.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
            <div className="flex items-center">
                <div className={`w-2 h-2 rounded-full mr-3 ${
                    p.status === 'on_track' ? 'bg-emerald-500' : 
                    p.status === 'at_risk' ? 'bg-amber-500' : 'bg-red-500'
                }`} />
                <div>
                    <p className="text-sm font-semibold text-slate-700">{p.name}</p>
                    <p className="text-xs text-slate-500 flex items-center mt-0.5">
                        <Clock className="w-3 h-3 mr-1" />
                        Milestone: {p.nextMilestone} ({new Date(p.milestoneDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })})
                    </p>
                </div>
            </div>
            {p.status !== 'on_track' && (
                 <AlertTriangle className="w-4 h-4 text-amber-500" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectPulse;