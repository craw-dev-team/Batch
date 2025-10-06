import React, { useEffect, useState } from 'react';
import { useTheme } from '../Themes/ThemeContext';
import { SettingOutlined, BellOutlined, CloseOutlined, RightOutlined } from '@ant-design/icons';



const Settings = ()=> {

    // for theme -------------------------
    const { getTheme } = useTheme();
    const theme = getTheme();
    // ------------------------------------


// Sidebar states
  const [activeCategory, setActiveCategory] = useState('');
  const [activeSubCategory, setActiveSubCategory] = useState('');
  const [activeItem, setActiveItem] = useState('');
  

  // Level 1 - Main Categories (Default open)
  const mainCategories = [
    { id: 'academics', label: 'Academics',  },
    { id: 'students', label: 'Students',  },
    { id: 'schedule', label: 'Schedule',  },
    { id: 'achievements', label: 'Achievements',  },
  ];

  // Level 2 - Subcategories
  const subCategories = {
    academics: [
      { id: 'courses', label: 'Courses' },
      { id: 'subjects', label: 'Subjects' },
      { id: 'assignments', label: 'Assignments' },
    ],
    students: [
      { id: 'enrollment', label: 'Enrollment' },
      { id: 'performance', label: 'Performance' },
      { id: 'attendance', label: 'Attendance' }
    ],
    schedule: [
      { id: 'classes', label: 'Classes' },
      { id: 'exams', label: 'Exams' },
      { id: 'events', label: 'Events' }
    ],
    achievements: [
      { id: 'awards', label: 'Awards' },
      { id: 'certificates', label: 'Certificates' },
      { id: 'rankings', label: 'Rankings' }
    ]
  };

  // Level 3 - Items
  const items = {
    courses: [
      { id: 'computer-science', label: 'Computer Science' },
      { id: 'mathematics', label: 'Mathematics' },
      { id: 'physics', label: 'Physics' }
    ],
    subjects: [
      { id: 'algorithms', label: 'Algorithms' },
      { id: 'databases', label: 'Databases' },
      { id: 'networking', label: 'Networking' }
    ],
    assignments: [
      { id: 'homework', label: 'Homework' },
      { id: 'projects', label: 'Projects' },
      { id: 'quizzes', label: 'Quizzes' }
    ],
    enrollment: [
      { id: 'new-students', label: 'New Students' },
      { id: 'transfers', label: 'Transfers' },
      { id: 'returning', label: 'Returning Students' }
    ],
    performance: [
      { id: 'grades', label: 'Grades' },
      { id: 'reports', label: 'Reports' },
      { id: 'analytics', label: 'Analytics' }
    ],
    attendance: [
      { id: 'daily', label: 'Daily Attendance' },
      { id: 'monthly', label: 'Monthly Reports' },
      { id: 'yearly', label: 'Yearly Summary' }
    ]
  };


  const handleLevel1Click = (categoryId) => {
    setActiveCategory(categoryId);
    setActiveSubCategory('');
    setActiveItem('');

  };

  const handleLevel2Click = (subCategoryId) => {
    setActiveSubCategory(subCategoryId);
    setActiveItem('');

  };

  const handleLevel3Click = (itemId) => {
    setActiveItem(itemId);

  };

  const resetSelections = () => {
    setActiveCategory('');
    setActiveSubCategory('');
    setActiveItem('');

  };
  const resetSelectionsthird = () => {
    setActiveItem('');

  };



    return(
        <>
        <div className={`p-4 h-full w-full ${theme.bg}`}>

            <div className={`h-[80vh] md:h-[85vh] lg:h-[88vh] 2xl:max-h-[90vh] overflow-y-auto relative shadow-xs flex flex-col ${theme.cardBg}`}>
                {/* Header (sticky, not scrollable) */}
                <div className="flex justify-between items-center px-4 mt-12 mb-1 sticky top-0 left-0 z-10">
                    <h1 className={`text-xl font-semibold px-1 ${theme.text}`}>Settings</h1>
                </div>

                {/* Scrollable Content */}
                <div className="w-full overflow-y-auto flex-1 mx-auto space-y-4 px-4 py-2 border-t rounded-md">
                    <div className="grid grid-cols-4 gap-x-2">
                        
                    {/* Level 1 - Main Categories (Always visible) */}
                    <div className="bg-gray-50 rounded-lg px-4 pb-4 h-[75vh] overflow-y-auto">
                        <div className='pt-4 sticky top-0 left-0 z-10 bg-gray-50'>
                            <h3 className="text-sm font-semibold text-gray-700 mb-3">Categories</h3>
                        </div>
                    <div className="space-y-2">
                        {mainCategories.map((category) => {
                        const IconComponent = category.icon;
                        return (
                            <button
                            key={category.id}
                            onClick={() => handleLevel1Click(category.id)}
                            className={`w-full flex items-center justify-between p-3 rounded-lg hover:bg-white hover:shadow-sm transition-all duration-200 ${
                                activeCategory === category.id ? 'bg-blue-50 text-blue-600 border-2 border-blue-200' : 'text-gray-700 border-2 border-transparent'
                            }`}
                            >
                            <div className="flex items-center space-x-2">
                                {/* <IconComponent className="w-4 h-4" /> */}
                                <span className="text-sm font-medium">{category.label}</span>
                            </div>
                            <RightOutlined className="w-3 h-3" />
                            </button>
                        );
                        })}
                    </div>
                    </div>

                    {/* Level 2 - Subcategories (Shows when category selected) */}
                    {activeCategory && (
                    <div className="bg-gray-50 rounded-lg px-4 pb-4 h-[75vh] overflow-y-auto">
                        <div className="flex items-center justify-between pt-4 mb-3 sticky top-0 left-0 z-10 bg-gray-50">
                           
                        <h3 className="text-sm font-semibold text-gray-700 capitalize">{activeCategory}</h3>
                           
                        <button
                            onClick={resetSelections}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <CloseOutlined className="w-4 h-4" />
                        </button>
                        </div>
                        <div className="space-y-2">
                        {subCategories[activeCategory]?.map((subCategory) => (
                            <button
                            key={subCategory.id}
                            onClick={() => handleLevel2Click(subCategory.id)}
                            className={`w-full flex items-center justify-between p-3 rounded-lg hover:bg-white hover:shadow-sm transition-all duration-200 ${
                                activeSubCategory === subCategory.id ? 'bg-blue-50 text-blue-600 border-2 border-blue-200' : 'text-gray-700 border-2 border-transparent'
                            }`}
                            >
                            <span className="text-sm font-medium">{subCategory.label}</span>
                            <RightOutlined className="w-3 h-3" />
                            </button>
                        ))}
                        </div>
                    </div>
                    )}

                    {/* Level 3 - Items (Shows when subcategory selected) */}
                    {activeSubCategory && (
                    <div className="col-span-2 bg-gray-50 rounded-lg px-4 pb-4 h-[75vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-3 pt-4 sticky top-0 left-0 z-10 bg-gray-50">
                            <h3 className="text-sm font-semibold text-gray-700 capitalize">{activeSubCategory}</h3>
                            <button
                            onClick={resetSelectionsthird}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <CloseOutlined className="w-4 h-4" />
                        </button>
                        </div>
                        <div className="space-y-2">
                        {items[activeSubCategory]?.map((item) => (
                            <button
                            key={item.id}
                            onClick={() => handleLevel3Click(item.id)}
                            className={`w-full p-3 rounded-lg text-left hover:bg-white hover:shadow-sm transition-all duration-200 ${
                                activeItem === item.id ? 'bg-blue-50 text-blue-600 border-2 border-blue-200' : 'text-gray-700 border-2 border-transparent'
                            }`}
                            >
                            <span className="text-sm font-medium">{item.label}</span>
                            </button>
                        ))}
                        </div>
                    </div>
                    )}

                    </div>

                </div>
            </div>


        </div>
        </>
    )
};



export default Settings;