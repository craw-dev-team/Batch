import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DownOutlined, MenuOutlined } from '@ant-design/icons';
import { Button, Avatar, Dropdown } from 'antd';
import { useTrainerInfo } from '../TrainerInfo/TrainerDetails/TrainerInfoContext';
import { useAuth } from '../../../dashboard/AuthContext/AuthContext';
import { useTheme } from '../../../Themes/ThemeContext';
import avatar from "../../../../assets/images/avatar.png";
import ThemeDropdown from '../../../Themes/ThemeDropdown';



const TrainerNavbar = ({ onMenuClick }) => {
      // for theme -------------------------
      const { getTheme } = useTheme();
      const theme = getTheme();
      // ------------------------------------
    
      const { username, fetchTrainerDetails } = useTrainerInfo();
      

      useEffect(() => {
        fetchTrainerDetails()
      },[])


        // for setting drawer open and close 
        const [openDrawer, setOpenDrawer] = useState(false);
        const [size, setSize] = useState();
    
    
        const [isOpen, setIsOpen] = useState(false);
        const dropdownRef = useRef(null);
        const themeRef = useRef(null);
    
    
        const showLargeDrawer = () => {
            setSize('large');
            setOpenDrawer(true);
        };
    
    
        // Close dropdowns when clicking outside
        useEffect(() => {
            const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
            };
    
            document.addEventListener('mousedown', handleClickOutside);
            return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            };
        }, []);
    
        const toggleDropdown = () => {
            setIsOpen(!isOpen);
        };
    
    
        const handleMenuClick = (action) => {
            console.log(`${action} clicked`);
            setIsOpen(false);
        };

  return (
    <div className={`flex items-center justify-between px-4 py-1 border-b shadow sticky top-0 z-40 ${theme.bg}`}>
      <div className="flex items-center gap-2">
        <Button
          type="text"
          icon={<MenuOutlined style={{ fontSize: 20 }} />}
          onClick={onMenuClick}
          className="md:hidden"
        />
      </div>

       <div className="col-span-1 flex justify-end items-center gap-x-0 h-auto">
                {/* User Dropdown */}
                <div className="relative" ref={dropdownRef}>
                    <div 
                    className={`${theme.activeTab} border-2 border-${theme.text} hover:bg-blue-100 transition-colors duration-200 rounded-3xl px-2 py-2 flex justify-between items-center gap-x-4 cursor-pointer`}
                    onClick={toggleDropdown}
                    >
                    {/* User Info */}
                    <div className="flex items-center gap-x-2">
                        <img 
                        src={avatar} 
                        alt="User Avatar" 
                        className="w-6 h-6 rounded-full object-cover"
                        />
                        <div className="hidden sm:block">
                        <p className={`text-slate-700 text-sm font-semibold ${theme.text}`}>
                            {username}
                        </p>
                        </div>
                    </div>
                    
                    {/* Arrow Icon */}
                    <DownOutlined
                        className={`w-4 h-4 text-slate-600 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                    />
                    </div>

                    {/* Dropdown Menu */}
                    {isOpen && (
                    <div className={`absolute right-0 mt-2 w-64 rounded-lg shadow-lg border-1 border-${theme.text} py-0 z-50 ${theme.activeTab}`}>
                        {/* Theme Switcher Section */}
                        <div className="px-4 py-1 ">
                        <div className="flex items-center justify-start gap-x-3">
                            <span className="text-sm font-medium text-gray-700">Themes</span>
                            <div className="relative" ref={themeRef}>
                    
                                <span className="text-gray-700"><ThemeDropdown /></span>
                                {/* <DownOutlined  className={`w-3 h-3 text-gray-500 transition-transform duration-200 ${isThemeOpen ? 'rotate-180' : ''}`} /> */}
                            </div>
                        </div>
                        </div>

                        {/* User Info Header */}
                        {/* <div className="px-4 py-1 border-b border-gray-200">
                        <div className="flex items-center gap-x-3">
                            <div>
                            <p className="text-sm font-semibold text-gray-900">
                                {username}
                            </p>
                            <p className="text-xs text-gray-500 ">
                                {userEmail}
                            </p>
                            </div>
                        </div>
                        </div> */}

                        {/* Menu Items */}
                        <div className="py-2">
                        <button
                            onClick={() => handleMenuClick('Profile')}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-x-3"
                        >
                            {/* <UserOutlined className="w-4 h-4" /> */}
                            View Profile
                        </button>
                        
                        <button
                            onClick={() => showLargeDrawer()}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-x-3"
                        >
                            {/* <SettingOutlined className="w-4 h-4" /> */}
                            Settings
                        </button>
                        
                        <button
                            onClick={() => handleMenuClick('Notifications')}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-x-3"
                        >
                            {/* <BellOutlined className="w-4 h-4" /> */}
                            Notifications
                        </button>
                
                        </div>

                        {/* Separator */}
                        <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>

                        {/* Logout */}
                        <button
                        onClick={() => handleMenuClick('Logout')}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-x-3"
                        >
                        {/* <LogoutOutlined  className="w-4 h-4" /> */}
                        Sign Out
                        </button>
                    </div>
                    )}
                </div>

                {/* <div className={'bg-lightBlue3 rounded-xl px-4 flex justify-between items-center gap-x-[9px] cursor-pointer'}>
                    <img alt=""/>
                    <div className="">
                        <p className={`text-blackColor dark:text-grayColor text-xs font-semibold leading-9 ${theme.text}`}>{username}</p>
                        <p className={'text-ashColor2 dark:text-grayColor text-[9px] font-semibold leading-8'}>useremail@mail.com</p>
                        <p className={'text-ashColor2 text-[11px] font-medium'}>{username}</p>
                    </div>
                    <div >
                    <img src={avatar} alt="" className={'pl-3 w-[40px]'}/>
                    </div>
                </div> */}
                </div>
    </div>
  );
};

export default TrainerNavbar;
