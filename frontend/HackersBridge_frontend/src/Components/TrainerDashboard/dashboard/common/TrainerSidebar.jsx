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

const { Sider } = Layout;

const TrainerSidebar = ({ collapsed, setCollapsed, drawerOpen, setDrawerOpen }) => {
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
      icon: <ReadOutlined />,
      label: <span>Overview</span>,
    },
    {
      key: '/trainer-info/trainer-batches',
      icon: <UsergroupAddOutlined />,
      label: <span>Batches</span>,
    },
    {
      key: '/trainer-info/trainer-chat',
      icon: <WechatWorkOutlined/>,
      label: <span>Chat</span>,
    },
    {
      key: '/trainer-info/trainer-announcement',
      icon: <NotificationOutlined />,
      label: <span>Announcements</span>,
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
        className="hidden md:block h-screen sticky top-0 left-0 z-50 bg-white"
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
            className="pt-6"
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
