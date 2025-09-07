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
        <Layout className="w-full">
          {/* Show navbar only on mobile */}
          <TrainerNavbar onMenuClick={() => setDrawerOpen(true)} />
  
          <Content className="p-1 bg-gray-100 min-h-screen">
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    );
  };
  
  export default TrainerLayout;