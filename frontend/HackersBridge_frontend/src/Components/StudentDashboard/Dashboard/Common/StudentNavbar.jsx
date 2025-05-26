import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MenuOutlined } from '@ant-design/icons';
import { Button, Avatar, Dropdown } from 'antd';

const StudentNavbar = ({ onMenuClick }) => {
  const navigate = useNavigate();

  const handleMenuClick = ({ key }) => {
    if (key === '2') {
      navigate('all-tickets'); // ✅ Navigate to AllTickets page
    } else if (key === '1') {
      console.log('Profile clicked');
    } else if (key === '3') {
      console.log('Logout clicked');
    }
  };

  const menu = {
    onClick: handleMenuClick,
    items: [
      {
        key: '1',
        label: 'Profile',
      },
      {
        key: '2',
        label: 'Tickets',
      },
      {
        key: '3',
        label: 'Logout',
      },
    ],
  };

  return (
    <div className="flex items-center justify-between px-4 py-2 bg-white border-b shadow sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <Button
          type="text"
          icon={<MenuOutlined style={{ fontSize: 20 }} />}
          onClick={onMenuClick}
          className="md:hidden"
        />
      </div>

      <Dropdown menu={menu} placement="bottomRight">
        <Avatar className="cursor-pointer bg-blue-500" size="small">
          S
        </Avatar>
      </Dropdown>
    </div>
  );
};

export default StudentNavbar;
