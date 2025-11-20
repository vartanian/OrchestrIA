import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import TaskCard from '../components/TaskCard';
import { Filter, ArrowUpDown } from 'lucide-react';

const TasksPage: React.FC = () => {
  const { tasks, updateTask } = useStore();
  const [filter, setFilter] = useState<'all' | 'todo' | 'done'>('all');
  const [sort, setSort] = useState<'priority' | 'date'>('priority');

  const handleCompleteTask = (id: string) => {
    updateTask(id, { status: 'done' });
  };

  const filteredTasks = tasks
    .filter(t => filter === 'all' ? true : filter === 'done' ? t.status === 'done' : t.status !== 'done')
    .sort((a, b) => {
      if (sort === 'priority') {
        const priorityMap = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
        return priorityMap[a.priority] - priorityMap[b.priority];
      } else {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
    });

  return (
    <div className="space-y-6">
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Task Master List</h1>
            <p className="text-slate-500 text-sm">Manage your priorities and backlog</p>
          </div>
          
          <div className="flex space-x-3">
            <div className="relative">
                <select 
                    className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 focus:ring-2 focus:ring-indigo-500 appearance-none"
                    value={sort}
                    onChange={(e) => setSort(e.target.value as any)}
                >
                    <option value="priority">Sort by Priority</option>
                    <option value="date">Sort by Due Date</option>
                </select>
                <ArrowUpDown className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            </div>
            <div className="relative">
                <select 
                    className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 focus:ring-2 focus:ring-indigo-500 appearance-none"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value as any)}
                >
                    <option value="all">All Status</option>
                    <option value="todo">Active</option>
                    <option value="done">Completed</option>
                </select>
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            </div>
          </div>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTasks.map(task => (
            <TaskCard key={task.id} task={task} onComplete={handleCompleteTask} />
          ))}
          {filteredTasks.length === 0 && (
             <div className="col-span-full text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
                <p className="text-slate-500">No tasks found matching your filters.</p>
             </div>
          )}
       </div>
    </div>
  );
};

export default TasksPage;