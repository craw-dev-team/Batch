import { useState } from 'react';
import BASE_URL from '../../../../../../ip/Ip';
import { useRequestBatch } from './RequestBatchContext';

  const RequestBatchForm = ({ isOpen, onClose }) => { 
    if(!isOpen) return null;
    const { batchCode, setBatchCode, handleRequestBatch } = useRequestBatch();






  return (

    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
      <div className="relative p-2 w-4/6 sm:w-2/6  bg-white rounded-lg shadow-lg">
      
      <div className="flex items-center justify-between border-b rounded-t border-gray-200">
        <h3 className="text-md font-semibold text-gray-900">
         Join a Batch
        </h3>
        <button
          onClick={() => {onClose(), setBatchCode('')}}
          type="button"
          className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center"
          >
          <svg className="w-3 h-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
          </svg>
            <span className="sr-only">Close modal</span>
        </button>
      </div> 

        <form className="" onSubmit={handleRequestBatch}>
          <label className="block text-xs font-medium text-gray-700 mb-2">
            {/* Enter Code */}
          </label>
          <input
            type="text"
            value={batchCode}
            onChange={(e) => setBatchCode(e.target.value)}
            placeholder="Enter your code...."
            className="w-full text-sm border border-gray-300 px-3 py-1 rounded focus:outline-none focus:ring focus:ring-blue-300 mb-4"
          />
          {/* <label className="block text-sm font-medium text-gray-700 mb-2">
           
          </label> */}
          <h1 className="block text-xs font-medium text-gray-400 mx-1 mb-2 "> Don't have a batch code? Ask your Trainer </h1>
          <div>
            <button
              type="submit"
              className="w-full bg-green-400 text-white py-2 rounded hover:bg-green-500 transition">Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RequestBatchForm;