import React from 'react';
import { Task, Priority, Source } from '../types';
import { AlertCircle, Clock, Slack, Mail, CheckSquare, Calendar as CalIcon, ArrowRight } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onComplete: (id: string) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onComplete }) => {
  const getPriorityColor = (p: Priority) => {
    switch (p) {
      case Priority.CRITICAL: return 'bg-red-100 text-red-800 border-red-200';
      case Priority.HIGH: return 'bg-orange-100 text-orange-800 border-orange-200';
      case Priority.MEDIUM: return 'bg-blue-100 text-blue-800 border-blue-200';
      case Priority.LOW: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getSourceIcon = (s: Source) => {
    switch (s) {
      case Source.SLACK: return <Slack className="w-4 h-4 text-purple-600" />;
      case Source.JIRA: return <CheckSquare className="w-4 h-4 text-blue-600" />;
      case Source.EMAIL: return <Mail className="w-4 h-4 text-yellow-600" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className="group relative bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 mb-3">
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center space-x-2">
          <span className={`text-xs font-bold px-2 py-1 rounded-md border ${getPriorityColor(task.priority)}`}>
            {task.priority}
          </span>
          <div className="flex items-center space-x-1 bg-slate-50 px-2 py-1 rounded text-xs text-slate-500 border border-slate-100">
            {getSourceIcon(task.source)}
            <span>{task.source}</span>
          </div>
        </div>
        <button 
          onClick={() => onComplete(task.id)}
          className="text-slate-400 hover:text-emerald-600 transition-colors"
          title="Mark Complete"
        >
          <CheckSquare className="w-5 h-5" />
        </button>
      </div>
      
      <h3 className="text-slate-800 font-semibold text-sm leading-tight mb-1">{task.title}</h3>
      <p className="text-slate-500 text-xs mb-3 line-clamp-2">{task.description}</p>
      
      {task.aiAnalysis && (
        <div className="bg-indigo-50 p-2 rounded text-xs text-indigo-800 mb-2 border border-indigo-100">
          <span className="font-bold mr-1">AI Insight:</span> {task.aiAnalysis}
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-slate-400 mt-auto">
        <div className="flex items-center space-x-3">
          <div className="flex items-center">
            <Clock className="w-3 h-3 mr-1" />
            {task.estimatedMinutes}m
          </div>
          {task.project && (
            <div className="font-medium text-slate-500">
              {task.project}
            </div>
          )}
        </div>
        {task.contextLink && (
            <a href="#" className="flex items-center text-blue-600 hover:underline">
                Open <ArrowRight className="w-3 h-3 ml-1"/>
            </a>
        )}
      </div>
    </div>
  );
};

export default TaskCard;