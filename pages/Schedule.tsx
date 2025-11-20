import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { ChevronLeft, ChevronRight, Clock, Users } from 'lucide-react';
import { CalendarEvent } from '../types';

const Schedule: React.FC = () => {
  const { events } = useStore();
  const [selectedDate, setSelectedDate] = useState(new Date());

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  // Generate calendar grid
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    
    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));
    return days;
  };

  const calendarDays = getDaysInMonth(selectedDate);

  const getEventsForDate = (date: Date) => {
    return events.filter(e => {
      const eDate = new Date(e.start);
      return eDate.getDate() === date.getDate() && 
             eDate.getMonth() === date.getMonth() && 
             eDate.getFullYear() === date.getFullYear();
    }).sort((a,b) => new Date(a.start).getTime() - new Date(b.start).getTime());
  };

  const selectedDateEvents = getEventsForDate(selectedDate);

  const changeMonth = (offset: number) => {
    const newDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + offset, 1);
    setSelectedDate(newDate);
  };

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-slate-800">Schedule & Focus</h1>
          <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">
            + New Event
          </button>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendar Grid */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
             <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-slate-800">
                  {selectedDate.toLocaleDateString('default', { month: 'long', year: 'numeric' })}
                </h2>
                <div className="flex space-x-2">
                  <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button onClick={() => changeMonth(1)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
             </div>

             <div className="grid grid-cols-7 gap-4 mb-2">
                {daysOfWeek.map(d => (
                  <div key={d} className="text-center text-xs font-semibold text-slate-400 uppercase tracking-wide">
                    {d}
                  </div>
                ))}
             </div>
             <div className="grid grid-cols-7 gap-4">
                {calendarDays.map((day, idx) => {
                  if (!day) return <div key={idx} className="h-24"></div>;
                  
                  const dayEvents = getEventsForDate(day);
                  const isSelected = day.toDateString() === selectedDate.toDateString();
                  const isToday = day.toDateString() === new Date().toDateString();

                  return (
                    <div 
                      key={idx} 
                      onClick={() => setSelectedDate(day)}
                      className={`h-24 border rounded-lg p-2 cursor-pointer transition-all ${
                        isSelected ? 'border-indigo-500 ring-1 ring-indigo-500 bg-indigo-50' : 
                        'border-slate-100 hover:border-indigo-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className={`text-sm font-medium mb-2 ${isToday ? 'text-indigo-600' : 'text-slate-700'}`}>
                        {day.getDate()} {isToday && <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-full ml-1">Today</span>}
                      </div>
                      <div className="space-y-1">
                         {dayEvents.slice(0, 2).map(e => (
                           <div key={e.id} className={`text-[10px] truncate px-1.5 py-0.5 rounded ${
                             e.type === 'focus' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'
                           }`}>
                             {e.title}
                           </div>
                         ))}
                         {dayEvents.length > 2 && (
                           <div className="text-[10px] text-slate-400 px-1">+{dayEvents.length - 2} more</div>
                         )}
                      </div>
                    </div>
                  );
                })}
             </div>
          </div>

          {/* Day Detail View */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col">
             <h3 className="text-lg font-bold text-slate-800 mb-1">
                {selectedDate.toLocaleDateString('default', { weekday: 'long', month: 'long', day: 'numeric' })}
             </h3>
             <p className="text-slate-400 text-sm mb-6">
               {selectedDateEvents.length} events scheduled
             </p>

             <div className="space-y-4 flex-1 overflow-y-auto">
                {selectedDateEvents.length === 0 && (
                   <div className="text-center py-10 text-slate-400 text-sm">
                     No events for this day.
                   </div>
                )}
                {selectedDateEvents.map(event => (
                  <div key={event.id} className="flex group">
                     <div className="mr-4 text-right min-w-[60px] pt-1">
                        <div className="text-sm font-bold text-slate-800">
                          {new Date(event.start).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </div>
                        <div className="text-xs text-slate-400">
                          {new Date(event.end).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </div>
                     </div>
                     <div className={`flex-1 p-3 rounded-lg border ${
                       event.type === 'focus' ? 'bg-indigo-50 border-indigo-100' : 'bg-white border-slate-200'
                     }`}>
                        <h4 className="text-sm font-semibold text-slate-800 mb-1">{event.title}</h4>
                        {event.attendees && (
                          <div className="flex items-center text-xs text-slate-500 mb-2">
                            <Users className="w-3 h-3 mr-1" />
                            {event.attendees.length} attendees
                          </div>
                        )}
                        <div className="flex items-center text-xs text-slate-400">
                           <Clock className="w-3 h-3 mr-1" />
                           {event.type.toUpperCase()}
                        </div>
                     </div>
                  </div>
                ))}
             </div>
          </div>
       </div>
    </div>
  );
};

export default Schedule;