import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';
import axiosInstance from '../../../../dashboard/api/api';
import { useTheme } from '../../../../Themes/ThemeContext';

const TrainerAnnouncement = () => {
      // for theme -------------------------
      const { getTheme } = useTheme();
      const theme = getTheme();
      // ------------------------------------

  const [trainerAnnouncement, setTrainerAnnouncement] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchAnnouncement = useCallback(async () => {
    if (loading) return;

    setLoading(true);
    try {
      const response = await axiosInstance.get(`/Trainer_login/trainer/announcements/` );

      const data = response.data;
      setTrainerAnnouncement(prevData => {
        if (JSON.stringify(prevData) !== JSON.stringify(data)) {
          return data;
        }
        return prevData;
      });
    } catch (error) {
      console.error('Error fetching Announcement Data', error);
    } finally {
      setLoading(false);
    }
  }, [loading]);

  useEffect(() => {
    fetchAnnouncement();
  },[]);

  return (
    <div className="p-2 w-full">
      <h2 className={`text-base font-semibold mb-6 ${theme.text}`}> Announcements <span className='text-lg font-bold'>({trainerAnnouncement?.announcements?.length || 0})</span></h2>

      {trainerAnnouncement?.announcements?.length > 0 ? (
        <div className="space-y-4">
          {trainerAnnouncement.announcements.map((item) => (
            <div
              key={item.id}
              className={`w-full ${theme.bg} border border-gray-200 rounded-lg shadow-sm p-4 hover:shadow-md transition-all duration-300`}
            >
              {/* Subject */}
              <div className={`text-lg font-semibold ${theme.text} mb-2`}>{item.subject}</div>

              {/* Message */}
              <div className="text-gray-800 text-sm whitespace-pre-line">{item.text}</div>

              {/* Footer */}
              <div className="mt-3 text-right text-xs text-gray-500 italic">
                Posted on {dayjs(item.gen_time).format('DD MMM YYYY hh:mm A')}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="w-full text-center text-gray-500 text-sm">
          {loading ? 'Loading announcements...' : 'No announcements available'}
        </div>
      )}
    </div>
  );
};

export default TrainerAnnouncement;
