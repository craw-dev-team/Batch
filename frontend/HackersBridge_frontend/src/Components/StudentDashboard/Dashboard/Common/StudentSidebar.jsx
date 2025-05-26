import React, { useState } from 'react';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UsergroupAddOutlined,
  UserOutlined,
  ProductOutlined,
  WechatWorkOutlined,
  FileDoneOutlined,
  LoginOutlined,
} from '@ant-design/icons';
import { Button, Layout, Menu, Drawer } from 'antd';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import * as route from '../../../../routes/Slugs';
import crawlogo from '../..../../../../../assets/images/crawlogo.png';
import { useAuth } from '../../../dashboard/AuthContext/AuthContext';


const { Sider } = Layout;

const StudentSidebar = ({ collapsed, setCollapsed, drawerOpen, setDrawerOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth(); 
  const [spinning, setSpinning] = useState(false);

  const {batchId} = useParams();


  const handleLogout = () => {
    setSpinning(true); // Show the loader

    setTimeout(() => {
      setSpinning(false); // Hide loader after logout
      logout(); // Perform logout
    }, 2000); // Show spin for 3 seconds
  };

  const menuItems = [
    {
      key: '/student-info',
      icon: <ProductOutlined />,
      label: <span>Overview</span>,
      className: "rounded-md ",            
    },
    {
      key: '/student-info/student-batches',
      icon: <UsergroupAddOutlined />,
      label: <span>Batches</span>,
    },
    {
      key: '/student-info/student-recommended-batches',
      icon: <UsergroupAddOutlined />,
      label: <span>Explore Batches</span>,
    },
    {
      key: '/student-info/student-attendance',
      icon: <UserOutlined />,
      label: <span>Attendance</span>,
    },
    {
      key: '/student-info/student-chat',
      icon : <WechatWorkOutlined/>,
      label: <span>Chat</span>,
    },
    {
      key: '/student-info/student-certificates',
      icon: <FileDoneOutlined />,
      label: <span>Certificates</span>,
    },
    {
      key: "logout",
      icon: <LoginOutlined />,
      label: "Logout",
      className: "rounded-md bg-red-200 ",
      onClick: handleLogout,
    },
  ];

  const handleMenuClick = ({ key }) => {
    if (key === "logout") {
      handleLogout();
    } else {
      navigate(key);
      setDrawerOpen(false); // Close drawer on mobile
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
          <div className="w-12 h-12">
            <img src={crawlogo} alt="logo" className="object-contain" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <Menu
            mode="inline"
            selectedKeys={[
              location.pathname.startsWith('/student-info/student-batches')
                ? '/student-info/student-batches'
                : location.pathname
            ]}
            
            items={menuItems}
            onClick={handleMenuClick}
            className="pt-6 custom-menu"
          />
        </div>
      </Sider>

      {/* Mobile Drawer */}
      <Drawer
        title={
          <div className="flex items-center justify-end gap-2 ">
            <img src={crawlogo} alt="logo" className="w-9 h-8" />
          </div>
        }
        placement="left"
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
        className="md:hidden"
        styles={{
          body: { padding: 0 }
        }}
        width={300}
      >
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
          className='custom-menu'
        />
      </Drawer>
    </>
  );
};


export default StudentSidebar;
