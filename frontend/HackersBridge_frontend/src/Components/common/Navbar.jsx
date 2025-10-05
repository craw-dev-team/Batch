import React, { useState, useRef, useEffect } from 'react';

import ThemeSwitcher from '../ThemeSwitcher';
import avatar from "../../assets/images/avatar.png";
// import menu from "../../assets/images/menu.png";
// import NotificationIcon from "../../svg/NotificationIcon";
import { useNavigate } from "react-router-dom";
import { Button } from "antd";
import { MenuUnfoldOutlined, MenuFoldOutlined, DownOutlined, LogoutOutlined, UserOutlined, SettingOutlined, BellOutlined } from "@ant-design/icons";
import { useAuth } from "../dashboard/AuthContext/AuthContext";
import { useTheme } from "../Themes/ThemeContext";
import ThemeDropdown from "../Themes/ThemeDropdown";




const Navbar = ({ collapsed, setCollapsed }) => {
    
    // for theme -------------------------
    const { getTheme } = useTheme();
    const theme = getTheme();
    // ------------------------------------

    const { username } = useAuth();


    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const themeRef = useRef(null);


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
        <>
        {/* <div className={"w-full h-[55px] px-[37px] py-[21px] flex items-center justify-end darkmode transition-all duration-700"}> */}
        <div className={`w-full h-14 grid grid-cols-2 justify-between items-center gap-x-[28px] ${theme.bg}`}>
            <div className="col-span-1">
                <Button
                className={`${theme.text}`}
                    type="text"
                    icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                    onClick={() => setCollapsed(prev => !prev)}
                    style={{
                    fontSize: "16px",
                    width: 34,
                    height: 34,
                    }}
                />
            </div>

                <div className="col-span-1 flex justify-end items-center gap-x-0 h-auto mr-5">
                {/* User Dropdown */}
                <div className="relative" ref={dropdownRef}>
                    <div 
                    className={`${theme.activeTab} border-2 border-${theme.text} hover:bg-blue-100 transition-colors duration-200 rounded-3xl px-2 py-2 flex justify-between items-center gap-x-4 cursor-pointer`}
                    onClick={toggleDropdown}
                    >
                    {/* User Info */}
                    <div className="flex items-center gap-x-0">
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
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Themes</span>
                            <div className="relative" ref={themeRef}>
                    
                                <span className="text-gray-700 dark:text-gray-300"><ThemeDropdown /></span>
                                {/* <DownOutlined  className={`w-3 h-3 text-gray-500 transition-transform duration-200 ${isThemeOpen ? 'rotate-180' : ''}`} /> */}
                            </div>
                        </div>
                        </div>

                        {/* User Info Header */}
                        <div className="px-4 py-1 border-b border-gray-200">
                        <div className="flex items-center gap-x-3">
                            <div>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                {username}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {/* {userEmail} */}
                            </p>
                            </div>
                        </div>
                        </div>

                        {/* Menu Items */}
                        <div className="py-2">
                        <button
                            onClick={() => handleMenuClick('Profile')}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-x-3"
                        >
                            <UserOutlined className="w-4 h-4" />
                            View Profile
                        </button>
                        
                        <button
                            onClick={() => handleMenuClick('Settings')}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-x-3"
                        >
                            <SettingOutlined className="w-4 h-4" />
                            Settings
                        </button>
                        
                        <button
                            onClick={() => handleMenuClick('Notifications')}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-x-3"
                        >
                            <BellOutlined className="w-4 h-4" />
                            Notifications
                        </button>
                
                        </div>

                        {/* Separator */}
                        <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>

                        {/* Logout */}
                        <button
                        onClick={() => handleMenuClick('Logout')}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-x-3"
                        >
                        <LogoutOutlined  className="w-4 h-4" />
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
            
        {/* </div> */}
        </>
    )
}

export default Navbar;