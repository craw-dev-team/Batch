import { Button, Drawer, Space } from "antd";
import { SettingOutlined, BellOutlined } from '@ant-design/icons';
import { useState } from "react";





const SettingDrawer = ({Open, size, onClose}) => {
        if (!Open) return null;
    const [activeTab, setActiveTab] = useState('general');



    //  const showLargeDrawer = () => {
    //     setSize('large');
    //     setOpen(true);
    // };

    const settingsTabs = [
        { id: 'general', label: 'General', icon: SettingOutlined },
        { id: 'coordinators', label: 'Coordinators', icon: SettingOutlined },
        { id: 'trainers', label: 'Trainers', icon: SettingOutlined },
        { id: 'students', label: 'Students', icon: SettingOutlined },
        { id: 'security', label: 'Security', icon: BellOutlined },
        { id: 'appearance', label: 'Appearance', icon: BellOutlined }
    ];


        const coordinatorTabs = [
        { id: 'Manpreet_kaur', label: 'Manpreet Kaur', icon: SettingOutlined },
        { id: 'Tannu_rastogi', label: 'Tannu Rastogi', icon: SettingOutlined },
        { id: 'Kasak_chauhan', label: 'Kasak Chauhan', icon: SettingOutlined },
        { id: 'Shivani_kumari', label: 'Shivani Kumari', icon: SettingOutlined },
        { id: 'Shalini_gupta', label: 'Shalini Gupta', icon: BellOutlined },
        { id: 'Chandani_daksh', label: 'Chandani Daksh', icon: BellOutlined }
    ];


    return(
        <>
            <Drawer
                title={`Settings`}
                placement="right"
                size={size}
                onClose={onClose}
                open={Open}
                // extra={
                // <Space>
                //     <Button onClick={onClose}>Cancel</Button>
                //     <Button type="primary" onClick={onClose}>
                //     OK
                //     </Button>
                // </Space>
                // }
                >

                <div className="grid grid-cols-4 gap-x-2">
                    <div className="col-span-1">
                        <div className="flex h-full">
                            {/* Sidebar Tabs */}
                            <div className="w-48 bg-gray-50 border-r border-gray-200 py-4">
                                {settingsTabs.map((tab) => {
                                const IconComponent = tab.icon;
                                return (
                                    <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-100 transition-colors ${
                                        activeTab === tab.id ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600' : 'text-gray-700'
                                    }`}
                                    >
                                    {/* <IconComponent className="w-5 h-5" /> */}
                                    <span className="text-sm font-medium">{tab.label}</span>
                                    </button>
                                );
                                })}
                            </div>
                        </div>
                    </div>

                    {activeTab === "coordinators" && (
                        <div className="col-span-1">
                            <div className="w-48 bg-gray-50 border-r border-gray-200 py-4">
                                {coordinatorTabs.map((tab) => {
                                const IconComponent = tab.icon;
                                return (
                                    <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-100 transition-colors ${
                                        activeTab === tab.id ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600' : 'text-gray-700'
                                    }`}
                                    >
                                    {/* <IconComponent className="w-5 h-5" /> */}
                                    <span className="text-sm font-medium">{tab.label}</span>
                                    </button>
                                );
                                })}
                            </div>
                        </div>
                    )}

                    {activeTab === "Manpreet_kaur" && (
                        <div className="col-span-1">
                        <p>chat </p>    
                        </div>
                    )}
                </div>
            </Drawer>
        </>
    )
};


export default SettingDrawer;