// StudentLayout.jsx
import React, { useState } from 'react';
import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import TrainerSidebar from './TrainerSidebar';
import TrainerNavbar from './TrainerNavbar';

const { Content } = Layout;

const TrainerLayout = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(false);
  
    return (
      <Layout className="min-h-screen">
        {/* Sidebar (drawer and desktop) */}
        <TrainerSidebar
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          drawerOpen={drawerOpen}
          setDrawerOpen={setDrawerOpen}
        />
  
        {/* Main content */}
        <Layout className="flex-1 min-h-screen">
          {/* Show navbar only on mobile */}
          <TrainerNavbar onMenuClick={() => setDrawerOpen(true)} />
  
          <Content className="p-1 bg-gray-100 overflow-x-hidden overflow-y-hidden">
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    );
  };
  
  export default TrainerLayout;