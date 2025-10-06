import React, { useState } from 'react';
import { useTheme } from './ThemeContext';
import { DownOutlined, UpOutlined } from '@ant-design/icons';

const ThemeDropdown = () => {
  const { currentTheme, themes, saveTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleThemeChange = async (themeKey) => {
    setSaving(true);
    try {
      await saveTheme(themeKey);
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to save theme:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center justify-between w-auto px-2 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-0"
        disabled={saving}
      >
        <div className="flex items-center space-x-3">
          {/* <div className="flex space-x-1">
            <div className={`w-4 h-4 rounded-full ${themes[currentTheme]?.cards[0]?.split(' ')[0] || 'bg-purple-100'}`}></div>
            <div className={`w-4 h-4 rounded-full ${themes[currentTheme]?.cards[1]?.split(' ')[0] || 'bg-pink-100'}`}></div>
          </div> */}
          <span
            className={`w-3 h-3 rounded-full ${themes[currentTheme]?.dot || "bg-gray-400"}`}
          />

          <span className="truncate">
            {saving ? 'Saving...' : themes[currentTheme]?.name || 'Select Theme'}
          </span>
        </div>

        {isOpen ? <UpOutlined className={`w-5 h-5 ml-2 transition-transform duration-200`}/> 
        : <DownOutlined className={`w-5 h-5 ml-2 transition-transform duration-200`}/>
        }

      </button>

      {isOpen && (
        <div className="absolute left-0 z-50 w-44 max-w-48 mt-0 bg-white border border-gray-200 rounded-xl shadow-lg max-h-96 overflow-y-auto">
          <div className="p-2 space-y-0">
            {Object.entries(themes).map(([key, theme]) => (
              <button
                key={key}
                onClick={() => handleThemeChange(key)}
                className={`w-full px-2 py-1 text-left rounded-lg hover:bg-gray-50 transition-colors ${
                  currentTheme === key ? 'bg-indigo-50 ring-1 ring-indigo-200' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-4">
                      {/* <div className="flex space-x-1">
                        {theme.cards.slice(0, 3).map((card, idx) => (
                          <div
                            key={idx}
                            className={`w-4 h-4 rounded-full ${card.split(' ')[0]}`}
                          ></div>
                        ))}
                      </div> */}
                      <div>
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {theme.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {theme.description}
                        </p>
                      </div>
                    </div>
                  </div>
                  {currentTheme === key && (
                    <div className="flex-shrink-0">
                      <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemeDropdown;