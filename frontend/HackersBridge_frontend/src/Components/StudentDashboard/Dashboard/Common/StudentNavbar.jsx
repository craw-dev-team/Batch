import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MenuOutlined } from '@ant-design/icons';
import { Button, Avatar, Dropdown } from 'antd';
import { useStudentInfo } from '../StudentInfo/StudentDetails/StudentInfoContext';

const StudentNavbar = ({ onMenuClick }) => {
  const navigate = useNavigate();

  const { username, fetchStudentDetails } = useStudentInfo();

  useEffect(() => {
    fetchStudentDetails();
  },[])
  

  // const handleMenuClick = ({ key }) => {
  //   if (key === '2') {
  //     navigate('all-tickets'); // Navigate to AllTickets page
  //   } else if (key === '1') {
  //     console.log('Profile clicked');
  //   } else if (key === '3') {
  //     console.log('Logout clicked');
  //   }
  // };

  // const menu = {
  //   onClick: handleMenuClick,
  //   items: [
  //     {
  //       key: '1',
  //       label: 'Profile',
  //     },
  //     {
  //       key: '2',
  //       label: 'Tickets',
  //     },
  //     {
  //       key: '3',
  //       label: 'Logout',
  //     },
  //   ],
  // };

  return (
    <div className="flex items-center justify-between px-4 py-1 bg-white border-b shadow sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <Button
          type="text"
          icon={<MenuOutlined style={{ fontSize: 20 }} />}
          onClick={onMenuClick}
          className="md:hidden"
        />
      </div>
      
      <div className='flex gap-x-2 pl-2 pr-0.5 py-0.5 border border-slate-300 rounded-3xl'>
        <p>{username}</p>
        {/* <Dropdown menu={menu} placement="bottomRight"> */}
        <Avatar className="cursor-default bg-blue-500" size="small">
          {username?.charAt(0).toUpperCase()}
        </Avatar>
      {/* </Dropdown> */}
      </div>
    </div>
  );
};

export default StudentNavbar;
