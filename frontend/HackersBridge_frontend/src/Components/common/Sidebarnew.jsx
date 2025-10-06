import React, { useState } from 'react';
import {
  UserSwitchOutlined, UsergroupAddOutlined, UserOutlined, ProductOutlined, ProfileOutlined, UnorderedListOutlined, LoginOutlined, AuditOutlined, BookOutlined,  
  NotificationOutlined, TagsOutlined, WechatWorkOutlined, SettingOutlined,
  BellOutlined} from '@ant-design/icons';
import { Button, Layout, Menu, Spin } from 'antd';
import useThemeMode from '../../Hooks/useThemeMode';
const { Header, Sider, Content } = Layout;
import { Routes, Route, useNavigate, useLocation  } from "react-router-dom";
import * as route from '../../routes/Slugs';
import crawlogo from '../../assets/images/crawlogo.png';
import { useAuth } from '../dashboard/AuthContext/AuthContext';
import { useTheme } from '../Themes/ThemeContext';



const Sidebarnew = ({ collapsed }) => {
  // for theme -------------------------
    const { getTheme } = useTheme();
    const theme = getTheme();
  // ------------------------------------

  // const [theme] = useThemeMode(); // Get the theme from contex
  const navigate = useNavigate(); // Hook to navigate programmatically
  const location = useLocation();
  const { logout } = useAuth();
  const [spinning, setSpinning] = useState(false);

  const handleLogout = async () => {
    setSpinning(true); // Show the loader
    await logout(); // Perform logout

    setTimeout(() => {
      setSpinning(false); // Hide loader after logout
      window.location.href = "/";
    }, 2000); // Show spin for 3 seconds
  };


  return (
    <Sider trigger={null} collapsible collapsed={collapsed} className={`h-screen sticky left-0 top-0 overflow-hidden z-50`}>
    <div className={`relative top-0 h-28 flex justify-center items-center ${theme.bg}`}>
      <div className="w-12 h-12">
        <img src={crawlogo} alt="Logo" />
      </div>
    </div>


    <Menu
      className={`h-full z-50 pt-6 ${theme.bg} `}
      onClick={({ key }) => navigate(key)}
      mode="inline"
      selectedKeys={[location.pathname]}
      triggerSubMenuAction='hover'
      items={[
        {
          key: route.BATCHES_PATH,
          icon: <ProductOutlined style={{ color: theme.textColor }} />,
          label: collapsed ? "Batches" : <span className={theme.text}>Batches</span>,
          className:  location.pathname === route.BATCHES_PATH || 
                      location.pathname.startsWith("/batches") 
                      ? theme.sideBarTab : ""
        },

        {
          key: route.STUDENTS_PATH,
          icon: <UsergroupAddOutlined style={{ color: theme.textColor }} />,
          label: collapsed ? "Students" : <span className={theme.text}>Students</span>,
          className:  location.pathname === route.STUDENTS_PATH ||
                      location.pathname.startsWith("/students") ||
                      location.pathname.startsWith("/studentsdata")
                        ? theme.sideBarTab
                        : ""
        },

        {
          key: route.TRAINERS_PATH,
          icon: <UserOutlined style={{ color: theme.textColor }} />,
          label: collapsed ? "Trainers" : <span className={theme.text}>Trainers</span>,
          className:  location.pathname === route.TRAINERS_PATH ||
                      location.pathname.startsWith("/trainers")
                      ? theme.sideBarTab : ""
        },
        
        {
          key: route.BATCH_CHAT_PATH,
          icon: <WechatWorkOutlined style={{ color: theme.textColor }} />,
          label: collapsed ? "Batch Chats" : <span className={theme.text}>Batch Chats</span>,
          className: location.pathname === route.BATCH_CHAT_PATH ? theme.sideBarTab : ""
        },

        {
          key: route.COURSES_PATH,
          icon:<ProfileOutlined style={{ color: theme.textColor }} />,
          label: collapsed ? "Courses" : <span className={theme.text}>Courses</span>,
          className:  location.pathname === route.COURSES_PATH ||
                      location.pathname.startsWith("/course")
                      ? theme.sideBarTab : ""
        },

        {
          key: route.BOOKS_PATH,
          icon: <BookOutlined style={{ color: theme.textColor }} />,
          label: collapsed ? "Books" : <span className={theme.text}>Books</span>,
          className:  location.pathname === route.BOOKS_PATH ||
                      location.pathname.startsWith("/book")
                      ? theme.sideBarTab : ""
          
        },

        {
          key: route.ANNOUNCEMENTS_PATH,
          icon: <NotificationOutlined style={{ color: theme.textColor }} />,
          label: collapsed ? "Announcements" : <span className={theme.text}>Announcements</span>,
          className: location.pathname === route.ANNOUNCEMENTS_PATH ? theme.sideBarTab : ""
          
        },

        {
          key: route.NOTIFICATION_PATH,
          icon: <BellOutlined style={{ color: theme.textColor }} />,
          label: collapsed ? "Notification" : <span className={theme.text}>Notification</span>,
          className: location.pathname === route.NOTIFICATION_PATH ? theme.sideBarTab : ""
          
        },

        {
          key: route.TICKETS_PATH,
          icon: <TagsOutlined style={{ color: theme.textColor }} />,
          label: collapsed ? "Tickets" : <span className={theme.text}>Tickets</span>,
          className: location.pathname === route.TICKETS_PATH ? theme.sideBarTab : ""
        },

        {
          // key: route.ADD_DETAILS_PATH,
          icon:<UnorderedListOutlined style={{ color: theme.textColor }} />,
          label: collapsed ? "Add Details" : <span className={theme.text}>Add Details</span>,
          children: [
            {
              key: route.ADD_DETAILS_COORDINATORS_PATH,
              icon:<UserSwitchOutlined style={{ color: theme.textColor }} />,
              label: collapsed ? "Coordinators" : <span className={theme.text}>Coordinators</span>,
              className:  location.pathname === route.ADD_DETAILS_COORDINATORS_PATH ||
                          location.pathname.startsWith("/add-details/coordinators")
                          ? theme.sideBarTab : ""
            },
            {
              key: route.ADD_DETAILS_COUNSELLORS_PATH,
              icon:<UserSwitchOutlined style={{ color: theme.textColor }} />,
              label: collapsed ? "Counsellors" : <span className={theme.text}>Counsellors</span>,
              className:  location.pathname === route.ADD_DETAILS_COUNSELLORS_PATH ||
                          location.pathname.startsWith("/add-details/counsellors")
                          ? theme.sideBarTab : ""

            },
          ],
        },

        {
          key: route.ALL_LOGS_PATH,
          icon:<AuditOutlined style={{ color: theme.textColor }} />,
          label: collapsed ? "All Logs" : <span className={theme.text}>All Logs</span>,
          className: location.pathname === route.ALL_LOGS_PATH ? theme.sideBarTab : ""

        },

        {
          key: route.SETTINGS_PATH,
          icon:<SettingOutlined style={{ color: theme.textColor }} />,
          label: collapsed ? "Settings" : <span className={theme.text}>Settings</span>,
          className: location.pathname === route.SETTINGS_PATH ? theme.sideBarTab : ""

        },
        
        {
          key: "logout",
          icon: <LoginOutlined />,
          label: "Logout",
          className: "rounded-md hover:bg-red-700 bg-red-200 ",
          onClick: handleLogout,
        },
      ]}
      />
      {spinning && <Spin size='large' fullscreen tip='Logging Out'/>}
  </Sider>
  );
};
export default Sidebarnew;