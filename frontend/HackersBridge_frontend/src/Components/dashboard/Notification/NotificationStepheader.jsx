import React, { useState } from "react";
import { FaCheck } from "react-icons/fa"; // using react-icons instead of lucide-react
import { useTheme } from "../../Themes/ThemeContext";

const EnhancedStepHeader = ({ step, setStep, unlockedSteps }) => {
      // for theme -------------------------
      const { getTheme } = useTheme();
      const theme = getTheme();
      // ------------------------------------

  const steps = [
    "Choose Channel",
    "Set Audience", 
    "Add Content",
    "Publish Campaign"
  ];

  return (
    <div className="w-full max-w-4xl mx-auto px-0">
      <div className="relative">
        {/* Progress Line Background */}
        <div className="absolute top-6 left-0 w-full h-0.5 bg-gray-200"></div>
        
        {/* Active Progress Line */}
        <div 
          className="absolute top-6 left-0 h-0.5 bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-500 ease-out"
          style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
        ></div>

        {/* Steps Container */}
        <div className="relative flex justify-between">
          {steps.map((label, index) => {
            const stepNumber = index + 1;
            const active = step === stepNumber;
            const completed = step > stepNumber;
            const isUnlocked = unlockedSteps.includes(stepNumber);

            return (
              <div
                key={label}
                className={`flex flex-col items-center ${
                  isUnlocked ? "cursor-pointer group" : "cursor-not-allowed opacity-50"
                }`}
                onClick={() => {
                  if (isUnlocked) setStep(stepNumber);
                }}
              >
                {/* Step Circle */}
                <div
                  className={`
                    relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 ease-out
                    ${active
                      ? "border-blue-500 bg-blue-500 text-white shadow-lg shadow-blue-200"
                      : completed
                      ? "border-green-500 bg-green-500 text-white shadow-lg shadow-green-200"
                      : "border-gray-300 bg-white text-gray-400"
                    }
                  `}
                >
                  {completed ? (
                    <FaCheck className="w-5 h-5" />
                  ) : (
                    <span className="text-sm font-semibold">{stepNumber}</span>
                  )}

                  {active && (
                    <div className="absolute inset-0 rounded-full border-2 border-blue-400 animate-ping opacity-30"></div>
                  )}
                </div>

                {/* Step Label */}
                <div className="mt-3 text-center max-w-24">
                  <span
                    className={`
                      text-sm font-medium transition-colors duration-200
                      ${active
                        ? "text-blue-600"
                        : completed
                        ? "text-green-600"
                        : "text-gray-500"
                      }
                    `}
                  >
                    {label}
                  </span>
                  <div className="mt-1 text-xs">
                    {active && (
                      <span className="inline-block px-2 py-1 bg-blue-100 text-blue-600 rounded-full">
                        Current
                      </span>
                    )}
                    {completed && (
                      <span className="inline-block px-2 py-1 bg-green-100 text-green-600 rounded-full">
                        Complete
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};


export default EnhancedStepHeader;
