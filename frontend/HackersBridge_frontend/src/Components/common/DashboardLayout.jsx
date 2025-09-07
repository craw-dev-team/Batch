// DashboardLayout.jsx
import { Layout } from "antd";
import { Outlet } from "react-router-dom";
import Sidebarnew from "./Sidebarnew";
import Navbar from "./Navbar";
import SearchBar from "./Searchbar";

const { Header, Content } = Layout;

const DashboardLayout = ({ collapsed, setCollapsed }) => {

  return (
    <Layout>
      <Sidebarnew collapsed={collapsed} />
      <Layout>
        <Header className="sticky top-0 z-50 p-0">
          <Navbar collapsed={collapsed} setCollapsed={setCollapsed} />
          <SearchBar />
        </Header>
        <Content className="overflow-auto">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default DashboardLayout;
