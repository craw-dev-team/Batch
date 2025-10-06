import React, { useState } from 'react';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UsergroupAddOutlined,
  ReadOutlined,
  WechatWorkOutlined,
  LoginOutlined,
  NotificationOutlined,
} from '@ant-design/icons';
import { Button, Layout, Menu, Drawer } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import crawlogo from '../../../../assets/images/crawlogo.png';
import { useAuth } from '../../../dashboard/AuthContext/AuthContext';
import { useTheme } from '../../../Themes/ThemeContext';

const { Sider } = Layout;

const TrainerSidebar = ({ collapsed, setCollapsed, drawerOpen, setDrawerOpen }) => {
    // for theme -------------------------
      const { getTheme } = useTheme();
      const theme = getTheme();
    // ------------------------------------

  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth(); 
  const [spinning, setSpinning] = useState(false);

  const handleLogout = () => {
    setSpinning(true);
    setTimeout(() => {
      setSpinning(false);
      logout();
    }, 2000);
  };

  const menuItems = [
    {
      key: '/trainer-info',
      icon: <ReadOutlined style={{ color: theme.textColor }} />,
      label: <span className={theme.text}>Overview</span>,
      className: location.pathname === '/trainer-info' ? theme.sideBarTab : ""
    },
    {
      key: '/trainer-info/trainer-batches',
      icon: <UsergroupAddOutlined style={{ color: theme.textColor }} />,
      label: <span className={theme.text}>Batches</span>,
      className:  location.pathname === '/trainer-info/trainer-batches' ||
                  location.pathname.startsWith("/trainer-info/trainer-batches")
                  ? theme.sideBarTab
                    : ""
    },
    {
      key: '/trainer-info/trainer-chat',
      icon: <WechatWorkOutlined style={{ color: theme.textColor }} />,
      label: <span className={theme.text}>Chat</span>,
      className: location.pathname === '/trainer-info/trainer-chat' ? theme.sideBarTab : ""
    },
    {
      key: '/trainer-info/trainer-announcement',
      icon: <NotificationOutlined style={{ color: theme.textColor }} />,
      label: <span className={theme.text}>Announcements</span>,
      className: location.pathname === '/trainer-info/trainer-announcement' ? theme.sideBarTab : ""
    },
    {
      key: 'logout',
      icon: <LoginOutlined />,
      label: <span className="text-red-600">Logout</span>,
      className: 'bg-red-100 rounded-md',
    },
  ];

  const handleMenuClick = ({ key }) => {
    if (key === 'logout') {
      handleLogout();
    } else {
      navigate(key);
      setDrawerOpen(false);
    }
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        className={`hidden md:block h-screen sticky top-0 left-0 z-50 ${theme.bg} border border-gray-200`}
      >
        <div className="h-28 flex justify-center items-center border-b border-gray-200">
          <img src={crawlogo} alt="logo" className="w-12 h-12 object-contain" />
        </div>

        <div className="flex-1 overflow-y-auto">
          <Menu
            mode="inline"
            selectedKeys={[location.pathname]}
            items={menuItems}
            onClick={handleMenuClick}
            // className="pt-6 custom-menu"
            className={`pt-6 ${theme.bg}`}
          />
        </div>
      </Sider>

      {/* Mobile Drawer */}
      <Drawer
        title={
          <div className="flex items-center justify-end gap-2">
            <img src={crawlogo} alt="logo" className="w-9 h-8" />
          </div>
        }
        placement="left"
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
        className="md:hidden"
        styles={{ body: { padding: 0 } }}
        width={300}
      >
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
          // className="custom-menu"
        />
      </Drawer>
    </>
  );
};

export default TrainerSidebar;
