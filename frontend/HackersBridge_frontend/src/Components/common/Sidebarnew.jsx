import React, { useState } from 'react';
import {
  UserSwitchOutlined, UsergroupAddOutlined, UserOutlined, ProductOutlined, ProfileOutlined, UnorderedListOutlined, LoginOutlined, AuditOutlined, BookOutlined, 
  NotificationOutlined, TagsOutlined, WechatWorkOutlined} from '@ant-design/icons';
import { Button, Layout, Menu, Spin } from 'antd';
import useThemeMode from '../../Hooks/useThemeMode';
const { Header, Sider, Content } = Layout;
import { Routes, Route, useNavigate, useLocation  } from "react-router-dom";
import * as route from '../../routes/Slugs';
import crawlogo from '../../assets/images/crawlogo.png';
import { useAuth } from '../dashboard/AuthContext/AuthContext';


const Sidebarnew = ({ collapsed }) => {

  const [theme] = useThemeMode(); // Get the theme from contex
  const navigate = useNavigate(); // Hook to navigate programmatically
  const location = useLocation();
  const { logout } = useAuth();
  const [spinning, setSpinning] = useState(false);

  const handleLogout = () => {
    setSpinning(true); // Show the loader
    logout(); // Perform logout

    setTimeout(() => {
      setSpinning(false); // Hide loader after logout
      window.location.href = "";
    }, 2000); // Show spin for 3 seconds
  };


  return (
    <Sider trigger={null} collapsible collapsed={collapsed} theme={theme} className="h-screen sticky left-0 top-0 overflow-hidden z-50">
    <div className="darkmode relative top-0 h-28 flex justify-center items-center border border-r-gray-100 ">
      <div className="w-12 h-12">
        <img src={crawlogo} alt="Logo" />
      </div>
    </div>

    <Menu
      className="darkmode h-full z-50 pt-6"
      onClick={({ key }) => navigate(key)}
      mode="inline"
      selectedKeys={[location.pathname]}
      triggerSubMenuAction='hover'
      items={[
        {
          key: route.BATCHES_PATH,
          icon: <ProductOutlined />,
          label: "Batches",
          className: "rounded-md dark:text-gray-100 dark:hover:text-red-500",
        },

        {
          key: route.STUDENTS_PATH,
          icon: <UsergroupAddOutlined />,
          label: "Students",
          className: "rounded-md hover:bg-gray-300 dark:hover:bg-[#344c6b] dark:text-gray-300",
        },

        {
          key: route.TRAINERS_PATH,
          icon: <UserOutlined />,
          label: "Trainers",
          className: "rounded-md hover:bg-gray-300 dark:hover:bg-[#344c6b] dark:text-gray-300",
        },
        
        {
          key: "trainer-student-chat",
          icon: <WechatWorkOutlined />,
          label: "Batch Chats",
          className: "rounded-md hover:bg-gray-300 dark:hover:bg-[#344c6b] dark:text-gray-300",
        },

        {
          key: route.COURSES_PATH,
          icon:<ProfileOutlined />,
          label: "Courses",
          className: "rounded-md hover:bg-gray-300 dark:hover:bg-[#344c6b] dark:text-gray-300",
        },

        {
          key: route.BOOKS_PATH,
          icon: <BookOutlined />,
          label: "Books",
          className: "rounded-md hover:bg-gray-300 dark:hover:bg-[#344c6b] dark:text-gray-300",
          
        },

        {
          key: route.ANNOUNCEMENTS_PATH,
          icon: <NotificationOutlined />,
          label: "Announcements",
          className: "rounded-md hover:bg-gray-300 dark:hover:bg-[#344c6b] dark:text-gray-300",
          
        },

        {
          key: route.TICKETS_PATH,
          icon: <TagsOutlined />,
          label: "Tickets",
          className: "rounded-md hover:bg-gray-300 dark:hover:bg-[#344c6b] dark:text-gray-300",
        },

        {
          // key: route.ADD_DETAILS_PATH,
          icon:<UnorderedListOutlined />,
          label: "Add Details",
          // className: "rounded-md hover:bg-gray-300 dark:hover:bg-[#344c6b] dark:text-gray-300",
          children: [
            {
              key: route.ADD_DETAILS_COORDINATORS_PATH,
              icon:<UserSwitchOutlined />,
              label: "Coordinators",
              className: "rounded-md hover:bg-gray-300 dark:hover:bg-[#344c6b] dark:text-gray-300",

            },
            {
              key: route.ADD_DETAILS_COUNSELLORS_PATH,
              icon:<UserSwitchOutlined />,
              label: "Counsellors",
              className: "rounded-md hover:bg-gray-300 dark:hover:bg-[#344c6b] dark:text-gray-300",

            },
          ],
        },

        {
          key: route.ALL_LOGS_PATH,
          icon:<AuditOutlined />,
          label: "All Logs",
          className: "rounded-md hover:bg-gray-300 dark:hover:bg-[#344c6b] dark:text-gray-300",

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