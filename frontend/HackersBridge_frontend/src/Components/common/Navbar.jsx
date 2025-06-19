import React, {useState} from "react";

import ThemeSwitcher from '../ThemeSwitcher';
import avatar from "../../assets/images/avatar.png";
// import menu from "../../assets/images/menu.png";
// import NotificationIcon from "../../svg/NotificationIcon";
import { useNavigate } from "react-router-dom";
import { Button } from "antd";
import { MenuUnfoldOutlined, MenuFoldOutlined } from "@ant-design/icons";
import { useAuth } from "../dashboard/AuthContext/AuthContext";


const Navbar = ({ collapsed, setCollapsed }) => {

    const username = localStorage.getItem('name')



    return (
        <>
        {/* <div className={"w-full h-[55px] px-[37px] py-[21px] flex items-center justify-end darkmode transition-all duration-700"}> */}
        <div className={'w-full h-14 grid grid-cols-2 justify-between items-center gap-x-[28px] darkmode'}>
            <div className="col-span-1">
                <Button
                className="dark:text-white dark:hover:text-white"
                    type="text"
                    icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                    onClick={() => setCollapsed(prev => !prev)}
                    style={{
                    fontSize: "16px",
                    width: 34,
                    height: 34,
                    }}
                />
            </div>

            <div className="col-span-1 flex justify-end items-center gap-x-4 h-14 mr-5">
                {/* <ThemeSwitcher/> */}
                <div className={'bg-lightBlue3 rounded-xl px-4  flex justify-between items-center gap-x-[9px] cursor-pointer'}>
                    {/* <img alt=""/> */}
                    <div className="">
                        <p className={'text-blackColor dark:text-grayColor text-xs font-semibold leading-9'}>{username}</p>
                        {/* <p className={'text-ashColor2 dark:text-grayColor text-[9px] font-semibold leading-8'}>useremail@mail.com</p> */}
                        {/* <p className={'text-ashColor2 text-[11px] font-medium'}>useremail@mail.com</p> */}
                    </div>
                    <div >
                    <img src={avatar} alt="" className={'pl-3 w-[40px]'}/>
                    </div>
                </div>
                </div>
        </div>
            
        {/* </div> */}
        </>
    )
}

export default Navbar;