import React, { useState } from 'react';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UsergroupAddOutlined,
  UserOutlined,
  ProductOutlined,
} from '@ant-design/icons';
import { Button, Layout, Menu, theme } from 'antd';
import Navbar from './Navbar';
import SearchBar from './Searchbar';
import useThemeMode from '../../Hooks/useThemeMode';
const { Header, Sider, Content } = Layout;
import { Routes, Route, useNavigate, useLocation  } from "react-router-dom";
import StudentsHome from '../../Pages/StudentsHome';
import BatchesHome from '../../Pages/BatchesHome';
import TrainersHome from '../../Pages/TrainersHome';
import * as route from '../../routes/Slugs';
import crawlogo from '../../assets/images/crawlogo.png';


const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);

  const [theme] = useThemeMode(); // Get the theme from contex
  const navigate = useNavigate(); // Hook to navigate programmatically
  const location = useLocation();

  return (
    <Layout>
      <Sider trigger={null} collapsible collapsed={collapsed}  theme={theme}  className="h-screen sticky left-0 top-0 overflow-hidden z-50">
        <div className="darkmode sticky top-0 h-28 flex justify-center items-center border border-r-gray-100">
          <div className='w-12 h-12'>
          <img src={crawlogo} alt="" />
          </div>
          </div>

        <Menu
          className='darkmode h-full z-50 pt-6'
          onClick={({ key }) => navigate(key)} // Handle navigation
          mode="inline"
          defaultSelectedKeys={[location.pathname]}
          items={[
            {
              key: route.BATCHES_PATH,
              icon: <ProductOutlined />,
              label: <span>Batches</span>,
              className: "rounded-md dark:text-gray-100 dark:hover:text-red-500",            
            },
            {
              key: route.STUDENTS_PATH,
              icon:  <UsergroupAddOutlined />,
              label:  <span>Students</span>,
              className: "rounded-md hover:bg-gray-300 dark:hover:bg-[#344c6b] dark:text-gray-300",
            },
            {
              key: route.TRAINERS_PATH,
              icon: <UserOutlined />,
              label:  <span>Trainers</span>,
              className: "rounded-md hover:bg-gray-300 dark:hover:bg-[#344c6b] dark:text-gray-300",
            },
          ]}
        />
      </Sider>
      <Layout>
        <Header className='sticky top-0 z-50 p-0'>
            <Navbar collapsed={collapsed} setCollapsed={setCollapsed}/>
            <SearchBar/>
         
        </Header>

        <Content
        theme={theme}
          style={{
            // margin: '80px 16px',
            // padding: 24,
            // minHeight: 280,
            // background: colorBgContainer,
            // borderRadius: borderRadiusLG,
          }}
        >
           <Routes>
            <Route path={route.BATCHES_PATH} element={<BatchesHome />} />
            <Route path={route.STUDENTS_PATH} element={<StudentsHome/>} />
            <Route path={route.TRAINERS_PATH} element={<TrainersHome />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
};
export default Sidebar;