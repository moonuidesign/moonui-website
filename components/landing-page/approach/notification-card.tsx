import { Bell } from 'lucide-react';

export const NotificationCard = () => (
  <div className="p-5 w-full h-full bg-white flex flex-col gap-3">
    <div className="flex items-center gap-3 border-b border-gray-100 pb-2">
      <div className="bg-red-100 p-2 rounded-full text-red-500">
        <Bell size={18} />
      </div>
      <span className="font-semibold text-gray-700">Notifications</span>
    </div>
    <div className="space-y-2">
      <div className="h-10 bg-gray-50 rounded-md border border-gray-100 w-full flex items-center px-3">
        <div className="w-6 h-2 bg-gray-200 rounded-full"></div>
      </div>
      <div className="h-10 bg-gray-50 rounded-md border border-gray-100 w-full flex items-center px-3">
        <div className="w-12 h-2 bg-gray-200 rounded-full"></div>
      </div>
    </div>
  </div>
);
