// StudentLayout.jsx
import React, { useState } from 'react';
import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import StudentSidebar from './StudentSidebar';
import StudentNavbar from './StudentNavbar';

const { Content } = Layout;

const StudentLayout = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(false);
  
    return (
      <Layout className="min-h-screen">
        {/* Sidebar (drawer and desktop) */}
        <StudentSidebar
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          drawerOpen={drawerOpen}
          setDrawerOpen={setDrawerOpen}
        />
  
        {/* Main content */}
        <Layout className="flex-1 min-h-screen">
          {/* Show navbar only on mobile */}
          <StudentNavbar onMenuClick={() => setDrawerOpen(true)} />
  
          {/* <Content className="p-1 bg-gray-100 min-h-screen"> */}
            <Content className="p-1 bg-gray-100 overflow-x-hidden overflow-y-hidden">

            <Outlet />
          </Content>
        </Layout>
      </Layout>
    );
  };
  
  export default StudentLayout;