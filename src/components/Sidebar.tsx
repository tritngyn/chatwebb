import React from 'react';
import { currentUser } from '../mockdata';

const Sidebar = () => {
  const menuItems = [
    { icon: 'fa-solid fa-border-all', label: 'Dashboard' },
    { icon: 'fa-regular fa-comment-dots', label: 'Chat', active: true },
    { icon: 'fa-regular fa-calendar', label: 'Calendar' },
    { icon: 'fa-solid fa-gear', label: 'Settings' },
  ];

  return (
    // Đã thêm bg-gradient-to-b
    <div className="w-20 md:w-60 bg-gradient-to-b from-[#f3f4fc] to-[#e8e9f6] border-r border-gray-100 flex flex-col py-6 px-4 items-center md:items-start">
      <div className="flex flex-col md:flex-row items-center w-full mb-8 gap-3 cursor-pointer">
        <img src={currentUser.avatar} alt="Avatar" className="w-10 h-10 rounded-full object-cover shadow-sm" />
        <div className="hidden md:block flex-1">
          <h3 className="font-semibold text-sm text-gray-800">
            {currentUser.name} <i className="fa-solid fa-chevron-down text-xs ml-1 text-gray-400"></i>
          </h3>
        </div>
      </div>

      <div className="flex flex-col w-full gap-2">
        {menuItems.map((item, index) => (
          <div 
            key={index} 
            className={`flex items-center gap-4 p-3 rounded-2xl cursor-pointer transition-colors ${
              item.active ? 'bg-white shadow-sm text-blue-500' : 'text-gray-400 hover:text-gray-600 hover:bg-white/50'
            }`}
          >
            <i className={`${item.icon} text-lg w-6 text-center`}></i>
            <span className="hidden md:block font-medium text-sm">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;