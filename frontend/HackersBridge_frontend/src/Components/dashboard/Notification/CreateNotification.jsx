// // src/pages/CreateNotification.js
// import React, { useEffect, useState } from "react";
// import { FaUpload, FaTimes, FaArrowLeft } from "react-icons/fa";
// import EnhancedStepHeader from "./NotificationStepheader";
// import { useNotification } from "./NotificationContext";
// import { Cascader, message } from "antd";
// const { SHOW_CHILD } = Cascader;
// import axiosInstance from "../api/api";

// const CreateNotification = ({ onClose }) => {
//   const { publishCampaign, loading } = useNotification();
//   const [step, setStep] = useState(1);
//   const [unlockedSteps, setUnlockedSteps] = useState([1]);
//   const [trainer, setTrainer] = useState([]);
//   const [cascaderOptions, setCascaderOptions] = useState([]);

//   // Fetch trainers
//   useEffect(() => {
//     fetchTrainerData();
//   }, []);

//   const fetchTrainerData = async () => {
//     try {
//       const response = await axiosInstance.get("/api/announcement/trainer/");
//       setTrainer(response.data);
//     } catch (err) {
//       console.error("Error fetching trainers", err);
//       message.error("Failed to load trainers");
//     }
//   };

//   // Map trainers → cascader options
//   useEffect(() => {
//     if (!Array.isArray(trainer)) return;

//     const trainerWithBatchesOptions = trainer
//       .filter((t) => t?.trainer_name)
//       .map((t) => ({
//         label: t.trainer_name,
//         value: t.trainer_id, // ✅ use trainer_id
//         children: (t.batches || []).map((batch) => ({
//           label: batch.batch_id,
//           value: batch.batch_id,
//         })),
//       }));

//     const dynamicOptions = [
//       {
//         label: "All",
//         value: "all",
//         children: [
//           { label: "Trainers", value: "Trainers" },
//           { label: "Students", value: "Students" },
//         ],
//       },
//       {
//         label: "Batches",
//         value: "batches",
//         children: trainerWithBatchesOptions,
//       },
//     ];

//     setCascaderOptions(dynamicOptions);
//   }, [trainer]);

//   // Form data
//   const [formData, setFormData] = useState({
//     channel: "",
//     Send_to: [],
//     title: "",
//     description: "",
//     landingOption: "App Homepage",
//     landingUrl: "",
//     uploadedImage: null,
//     uploadedImageFile: null,
//     campaignTitle: "",
//     scheduleType: "later",
//     date: "",
//     time: "",
//   });

//   // Auto-fill campaignTitle from title
//   useEffect(() => {
//     if (formData.title) {
//       setFormData((prev) => ({
//         ...prev,
//         campaignTitle: formData.title,
//       }));
//     }
//   }, [formData.title]);

//   const landingOptions = [
//     "App Homepage",
//     "Store Tab",
//     "Custom Link",
//     "Specific Course",
//   ];

//   const handleInputChange = (field, value) => {
//     setFormData((prev) => ({
//       ...prev,
//       [field]: value,
//     }));
//   };

//   const handleImageUpload = (event) => {
//     const file = event.target.files[0];
//     if (file) {
//       setFormData((prev) => ({
//         ...prev,
//         uploadedImage: URL.createObjectURL(file),
//         uploadedImageFile: file,
//       }));
//     }
//   };

//   const removeImage = () => {
//     setFormData((prev) => ({
//       ...prev,
//       uploadedImage: null,
//       uploadedImageFile: null,
//     }));
//   };

//   // Publish handler
//   const handlePublish = async () => {
//     try {
//       const formPayload = new FormData();
//       formPayload.append("channel", formData.channel);
//       formPayload.append("title", formData.title);
//       formPayload.append("description", formData.description || "");
//       formPayload.append("campaignTitle", formData.campaignTitle);
//       formPayload.append("scheduleType", formData.scheduleType);
//       formPayload.append("landingOption", formData.landingOption);
//       formPayload.append("link", formData.landingUrl || "");

//       if (formData.scheduleType === "later") {
//         formPayload.append(
//           "scheduled_time",
//           `${formData.date}T${formData.time}:00`
//         );
//       }

//       // Flatten recipients
//       const cleanRecipients = formData.Send_to.flatMap((item) => {
//         if (Array.isArray(item)) {
//           return item.filter((v) => typeof v === "number");
//         }
//         return typeof item === "number" ? [item] : [];
//       });

//       cleanRecipients.forEach((id) => {
//         formPayload.append("send_to", id);
//       });

//       if (formData.uploadedImageFile) {
//         formPayload.append("image", formData.uploadedImageFile);
//       }

//       await publishCampaign(formPayload, true);
//       message.success("✅ Campaign published successfully");

//       // Reset
//       setFormData({
//         channel: "",
//         Send_to: [],
//         title: "",
//         description: "",
//         landingOption: "App Homepage",
//         landingUrl: "",
//         uploadedImage: null,
//         uploadedImageFile: null,
//         campaignTitle: "",
//         scheduleType: "later",
//         date: "",
//         time: "",
//       });
//       setStep(1);
//       setUnlockedSteps([1]);
//       onClose();
//       window.location.reload();
//     } catch (error) {
//       console.error("Publish failed", error);
//       message.error("❌ Failed to publish notification");
//     }
//   };

//   return (
//     <div className="h-[51rem] bg-gray-100 px-2 mt-10 py-4">
//         {/* Header */}
//         <div className="text-center">
//           <h1 className="text-5xl text-black font-semibold">
//             Create One Time Campaign
//           </h1>
//           <p className="text-gray-600 font-semibold text-xl mt-2">
//             Set campaign details, choose target audience and edit content before
//             publishing campaign
//           </p>
//         </div>

//         {/* Stepper Card */}
//         <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md mt-10">
//           <EnhancedStepHeader
//             step={step}
//             setStep={setStep}
//             unlockedSteps={unlockedSteps}
//           />

//           {/* Step content */}
//           <div className="h-[20rem] overflow-y-auto px-2 scrollbar-custom">
//             {/* Step 1: Channel */}
//             {step === 1 && (
//               <div className="p-6">
//                 <h2 className="text-lg font-semibold text-gray-900 mb-4">
//                   Choose Channel
//                 </h2>
//                 <p className="text-gray-600 mb-4">
//                   I want to send communication via
//                 </p>
//                 <div className="flex items-center gap-6">
//                   <label
//                     className="flex items-center gap-2 cursor-pointer"
//                     onClick={() =>
//                       handleInputChange(
//                         "channel",
//                         formData.channel === "push" ? "" : "push"
//                       )
//                     }
//                   >
//                     <input
//                       type="radio"
//                       name="channel"
//                       value="push"
//                       checked={formData.channel === "push"}
//                       readOnly
//                     />
//                     <span className="font-medium">Push Notification</span>
//                   </label>
//                 </div>
//               </div>
//             )}

//             {/* Step 2: Audience */}
//             {step === 2 && (
//               <div className="p-6">
//                 <h2 className="text-lg font-semibold text-gray-900 mb-4">
//                   Set Audience
//                 </h2>
//                 <p className="text-gray-600 mb-4">
//                   I want to select my target audience (trainers, students, or
//                   batches)
//                 </p>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   To
//                 </label>
//                 <Cascader
//                   options={cascaderOptions}
//                   multiple
//                   maxTagCount="responsive"
//                   showCheckedStrategy={SHOW_CHILD}
//                   placeholder="Please select at least one recipient"
//                   style={{ width: "100%" }}
//                   value={formData.Send_to || []}
//                   onChange={(val) => handleInputChange("Send_to", val)}
//                   showSearch={{
//                     filter: (inputValue, path) =>
//                       path.some((opt) =>
//                         opt.label
//                           .toLowerCase()
//                           .includes(inputValue.toLowerCase())
//                       ),
//                   }}
//                 />
//               </div>
//             )}

//             {/* Step 3: Content */}
//             {step === 3 && (
//               <div>
//                 <div className="p-6 border-b border-gray-200">
//                   <h2 className="text-lg font-semibold text-gray-900 mb-4">
//                     Push Notification Content
//                   </h2>
//                   <div className="space-y-6">
//                     {/* Title */}
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-2">
//                         Title
//                       </label>
//                       <input
//                         type="text"
//                         value={formData.title}
//                         onChange={(e) =>
//                           handleInputChange("title", e.target.value)
//                         }
//                         placeholder="Enter the title....."
//                         className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
//                       />
//                     </div>

//                     {/* Description */}
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-2">
//                         Description (optional)
//                       </label>
//                       <textarea
//                         value={formData.description}
//                         onChange={(e) =>
//                           handleInputChange("description", e.target.value)
//                         }
//                         placeholder="Enter the description....."
//                         rows={4}
//                         className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
//                       />
//                     </div>

//                     {/* Image Upload */}
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-2">
//                         Image (optional)
//                       </label>
//                       {!formData.uploadedImage ? (
//                         <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 text-center bg-blue-50">
//                           <input
//                             type="file"
//                             accept="image/*"
//                             onChange={handleImageUpload}
//                             className="hidden"
//                             id="image-upload"
//                           />
//                           <label
//                             htmlFor="image-upload"
//                             className="cursor-pointer"
//                           >
//                             <FaUpload className="w-8 h-8 text-blue-500 mx-auto mb-2" />
//                             <p className="text-blue-600 font-medium">
//                               Upload Image
//                             </p>
//                           </label>
//                         </div>
//                       ) : (
//                         <div className="relative">
//                           <img
//                             src={formData.uploadedImage}
//                             alt="Uploaded"
//                             className="w-full h-32 object-cover rounded-lg"
//                           />
//                           <button
//                             onClick={removeImage}
//                             className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
//                           >
//                             <FaTimes className="w-4 h-4" />
//                           </button>
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 </div>

//                 {/* Landing Details */}
//                 <div className="p-6">
//                   <h2 className="text-lg font-semibold text-gray-900 mb-4">
//                     Landing Details
//                   </h2>
//                   <div className="space-y-6">
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-2">
//                         Landing
//                       </label>
//                       <select
//                         value={formData.landingOption}
//                         onChange={(e) =>
//                           handleInputChange("landingOption", e.target.value)
//                         }
//                         className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
//                       >
//                         {landingOptions.map((option) => (
//                           <option key={option} value={option}>
//                             {option}
//                           </option>
//                         ))}
//                       </select>

//                       {/* <input
//                         type="url"
//                         value={formData.landingUrl}
//                         onChange={(e) =>
//                           handleInputChange("landingUrl", e.target.value)
//                         }
//                         placeholder={`Enter URL for ${formData.landingOption}`}
//                         className="mt-3 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
//                       /> */}
//                       {/* {formData.landingOption === "Custom Link" && (
//                         <input
//                           type="url"
//                           value={formData.landingUrl}
//                           onChange={(e) =>
//                             handleInputChange("landingUrl", e.target.value)
//                           }
//                           placeholder="Enter Custom Link URL"
//                           className="mt-3 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
//                         />
//                       )} */}

//                       {(formData.landingOption === "Custom Link" || formData.landingOption === "Specific Course") && (
//                         <input
//                           type="url"
//                           value={formData.landingUrl}
//                           onChange={(e) => handleInputChange("landingUrl", e.target.value)}
//                           placeholder={formData.landingOption === "Custom Link" ? "Enter Custom Link URL" : "Enter Specific Course URL"}
//                           className="mt-3 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
//                         />
//                       )}

//                     </div>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {/* Step 4: Publish */}
//             {step === 4 && (
//               <div className="p-6">
//                 <h2 className="text-lg font-semibold text-gray-900 mb-4">
//                   Publish Campaign
//                 </h2>
//                 <div className="space-y-6">
//                   {/* Campaign Title */}
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Campaign Title
//                     </label>
//                     <input
//                       type="text"
//                       value={formData.campaignTitle}
//                       onChange={(e) =>
//                         handleInputChange("campaignTitle", e.target.value)
//                       }
//                       placeholder="Enter campaign title"
//                       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
//                     />
//                   </div>

//                   {/* Schedule */}
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       When do you want to publish this campaign?
//                     </label>
//                     <div className="flex gap-6">
//                       <label className="flex items-center gap-2">
//                         <input
//                           type="radio"
//                           name="schedule"
//                           checked={formData.scheduleType === "later"}
//                           onChange={() =>
//                             handleInputChange("scheduleType", "later")
//                           }
//                         />
//                         Send Later
//                       </label>
//                       <label className="flex items-center gap-2">
//                         <input
//                           type="radio"
//                           name="schedule"
//                           checked={formData.scheduleType === "now"}
//                           onChange={() =>
//                             handleInputChange("scheduleType", "now")
//                           }
//                         />
//                         Send Now
//                       </label>
//                     </div>
//                   </div>

//                   {/* Date & Time */}
//                   {formData.scheduleType === "later" && (
//                     <div className="flex gap-4">
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-2">
//                           Date
//                         </label>
//                         <input
//                           type="date"
//                           value={formData.date}
//                           onChange={(e) =>
//                             handleInputChange("date", e.target.value)
//                           }
//                           className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
//                         />
//                       </div>
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-2">
//                           Time
//                         </label>
//                         <input
//                           type="time"
//                           value={formData.time}
//                           onChange={(e) =>
//                             handleInputChange("time", e.target.value)
//                           }
//                           className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
//                         />
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             )}
//           </div>

//           {/* Navigation */}
//           <div className="flex justify-between items-center mt-8">
//             {step > 1 && (
//               <button
//                 className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
//                 onClick={() => setStep((prev) => prev - 1)}
//               >
//                 <FaArrowLeft /> Previous
//               </button>
//             )}

//             {step < 4 ? (
//               <button
//                 className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer disabled:opacity-50"
//                 disabled={
//                   (step === 1 && formData.channel !== "push") ||
//                   (step === 2 &&
//                     (!formData.Send_to || formData.Send_to.length === 0)) ||
//                   // (step === 3 && (!formData.title || !formData.landingUrl)) ||
//                   // (step === 3 &&
//                   //   (!formData.title ||
//                   //     (formData.landingOption === "Custom Link" && !formData.landingUrl))) ||

//                   (step === 3 &&
//                     (!formData.title ||
//                       ((formData.landingOption === "Custom Link" || formData.landingOption === "Specific Course") && !formData.landingUrl))) ||

//                   (step === 4 &&
//                     (!formData.campaignTitle ||
//                       (formData.scheduleType === "later" &&
//                         (!formData.date || !formData.time))))
//                 }
//                 onClick={() => {
//                   setStep((prev) => {
//                     const nextStep = prev + 1;
//                     if (!unlockedSteps.includes(nextStep)) {
//                       setUnlockedSteps((prevUnlocked) => [
//                         ...prevUnlocked,
//                         nextStep,
//                       ]);
//                     }
//                     return nextStep;
//                   });
//                 }}
//               >
//                 Continue
//               </button>
//             ) : (
//               <button
//                 className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
//                 disabled={loading}
//                 onClick={handlePublish}
//               >
//                 {loading ? "Publishing..." : "Send Notification"}
//               </button>
//             )}
//           </div>
//         </div>
//       </div>
    
//   );
// };

// export default CreateNotification;



import React, { useEffect, useState } from "react";
import { FaUpload, FaTimes, FaArrowLeft } from "react-icons/fa";
import EnhancedStepHeader from "./NotificationStepheader";
import { useNotification } from "./NotificationContext";
import { Cascader, message } from "antd";
const { SHOW_CHILD } = Cascader;
import axiosInstance from "../api/api";
import { useTheme } from "../../Themes/ThemeContext";

const CreateNotification = ({ onClose }) => {
      // for theme -------------------------
      const { getTheme } = useTheme();
      const theme = getTheme();
      // ------------------------------------

  const { publishCampaign, loading, rescheduleNotification } = useNotification();
  const [step, setStep] = useState(1);
  const [unlockedSteps, setUnlockedSteps] = useState([1]);
  const [trainer, setTrainer] = useState([]);
  const [cascaderOptions, setCascaderOptions] = useState([]);

  // Fetch trainers
  useEffect(() => {
    fetchTrainerData();
  }, []);

  const fetchTrainerData = async () => {
    try {
      const response = await axiosInstance.get("/api/announcement/trainer/");
      setTrainer(response.data);
    } catch (err) {
      console.error("Error fetching trainers", err);
      message.error("Failed to load trainers");
    }
  };

  // Map trainers → cascader options
  useEffect(() => {
    if (!Array.isArray(trainer)) return;

    const trainerWithBatchesOptions = trainer
      .filter((t) => t?.trainer_name)
      .map((t) => ({
        label: t.trainer_name,
        value: t.trainer_id,
        children: (t.batches || []).map((batch) => ({
          label: batch.batch_id,
          value: batch.batch_id,
        })),
      }));

    const dynamicOptions = [
      {
        label: "All",
        value: "all",
        children: [
          { label: "Trainers", value: "Trainers" },
          { label: "Students", value: "Students" },
        ],
      },
      {
        label: "Batches",
        value: "batches",
        children: trainerWithBatchesOptions,
      },
    ];

    setCascaderOptions(dynamicOptions);
  }, [trainer]);

  // Form data
  const [formData, setFormData] = useState({
    channel: "",
    Send_to: [],
    title: "",
    description: "",
    landingOption: "App Homepage",
    landingUrl: "",
    uploadedImage: null,
    uploadedImageFile: null,
    campaignTitle: "",
    scheduleType: "later",
    date: "",
    time: "",
  });

  // Auto-fill campaignTitle from title
  useEffect(() => {
    if (formData.title) {
      setFormData((prev) => ({
        ...prev,
        campaignTitle: formData.title,
      }));
    }
  }, [formData.title]);

  const landingOptions = [
    "App Homepage",
    "Store Tab",
    "Custom Link",
    "Specific Course",
  ];

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        uploadedImage: URL.createObjectURL(file),
        uploadedImageFile: file,
      }));
    }
  };

  const removeImage = () => {
    setFormData((prev) => ({
      ...prev,
      uploadedImage: null,
      uploadedImageFile: null,
    }));
  };

  // Publish handler
  const handlePublish = async () => {
    try {
      const formPayload = new FormData();
      formPayload.append("channel", formData.channel);
      formPayload.append("title", formData.title);
      formPayload.append("description", formData.description || "");
      formPayload.append("campaignTitle", formData.campaignTitle);
      formPayload.append("scheduleType", formData.scheduleType);
      formPayload.append("link", formData.landingUrl || "");

      if (formData.scheduleType === "later") {
        formPayload.append(
          "scheduled_time",
          `${formData.date}T${formData.time}:00`
        );
      }

      // Flatten recipients
      const cleanRecipients = formData.Send_to.flatMap((item) => {
        if (Array.isArray(item)) {
          return item.filter((v) => typeof v === "number");
        }
        return typeof item === "number" ? [item] : [];
      });

      cleanRecipients.forEach((id) => {
        formPayload.append("send_to", id);
      });

      if (formData.uploadedImageFile) {
        formPayload.append("image", formData.uploadedImageFile);
      }

      await publishCampaign(formPayload, true);
      // ✅ Removed window.location.reload() as polling handles updates
      setFormData({
        channel: "",
        Send_to: [],
        title: "",
        description: "",
        landingOption: "App Homepage",
        landingUrl: "",
        uploadedImage: null,
        uploadedImageFile: null,
        campaignTitle: "",
        scheduleType: "later",
        date: "",
        time: "",
      });
      setStep(1);
      setUnlockedSteps([1]);
      onClose();
    } catch (error) {
      console.error("Publish failed", error);
      message.error("❌ Failed to publish notification");
    }
  };

//   const handlePublish = async () => {
//   try {
//     const formPayload = new FormData();
//     formPayload.append("channel", formData.channel);
//     formPayload.append("title", formData.title);
//     formPayload.append("description", formData.description || "");
//     formPayload.append("campaignTitle", formData.campaignTitle);
//     formPayload.append("scheduleType", formData.scheduleType);
//     formPayload.append("link", formData.landingUrl || "");

//     // Flatten recipients
//     const cleanRecipients = formData.Send_to.flatMap((item) => {
//       if (Array.isArray(item)) return item.filter((v) => typeof v === "number");
//       return typeof item === "number" ? [item] : [];
//     });

//     cleanRecipients.forEach((id) => formPayload.append("send_to", id));

//     if (formData.uploadedImageFile) {
//       formPayload.append("image", formData.uploadedImageFile);
//     }

//     if (formData.scheduleType === "later") {
//       // Build payload for reschedule API
//       const payload = {
//         scheduled_time: `${formData.date}T${formData.time}:00`,
//       };
//       // Call rescheduleNotification API
//       await rescheduleNotification(formData.campaignId, payload); // make sure you have campaignId
//       message.success("Notification scheduled successfully!");
//     } else {
//       // Send immediately
//       await publishCampaign(formPayload, true);
//       message.success("Campaign published successfully!");
//     }

//     // Reset form
//     setFormData({
//       channel: "",
//       Send_to: [],
//       title: "",
//       description: "",
//       landingOption: "App Homepage",
//       landingUrl: "",
//       uploadedImage: null,
//       uploadedImageFile: null,
//       campaignTitle: "",
//       scheduleType: "later",
//       date: "",
//       time: "",
//     });
//     setStep(1);
//     setUnlockedSteps([1]);
//     onClose();
//   } catch (error) {
//     console.error("Publish failed", error);
//     message.error("❌ Failed to publish notification");
//   }
// };


  // Compute disabled state for Continue button
  const isContinueDisabled = () => {
    if (step === 1) {
      return formData.channel !== "push";
    }
    if (step === 2) {
      return !formData.Send_to || formData.Send_to.length === 0;
    }
    if (step === 3) {
      return (
        !formData.title ||
        ((formData.landingOption === "Custom Link" ||
          formData.landingOption === "Specific Course") &&
          !formData.landingUrl)
      );
    }
    if (step === 4) {
      return (
        !formData.campaignTitle ||
        (formData.scheduleType === "later" && (!formData.date || !formData.time))
      );
    }
    return false;
  };

  return (
    <div className={`h-auto px-0 mt-6 py-0 rounded-lg`}>
      <div className={`${theme.specificPageBg} p-2 text-left h-auto rounded-lg`}>
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl text-black font-semibold">
            Create One Time Campaign
          </h1>
          <p className="text-gray-600 font-semibold text-md mt-2">
            Set campaign details, choose target audience and edit content before
            publishing campaign
          </p>
        </div>

        {/* Stepper Card */}
        <div className={`w-auto p-6 rounded-lg shadow-md mt-2 ${theme.bg}`}>
          <EnhancedStepHeader
            step={step}
            setStep={setStep}
            unlockedSteps={unlockedSteps}
          />

          {/* Step content */}
          <div className="h-[20rem] overflow-y-auto px-0 scrollbar-custom">
            {/* Step 1: Channel */}
            {step === 1 && (
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Choose Channel
                </h2>
                <p className="text-gray-600 mb-4">
                  I want to send communication via
                </p>
                <div className="flex items-center gap-6">
                  <label
                    className="flex items-center gap-2 cursor-pointer"
                    onClick={() =>
                      handleInputChange(
                        "channel",
                        formData.channel === "push" ? "" : "push"
                      )
                    }
                  >
                    <input
                      type="radio"
                      name="channel"
                      value="push"
                      checked={formData.channel === "push"}
                      readOnly
                    />
                    <span className="font-medium">Push Notification</span>
                  </label>
                </div>
              </div>
            )}

            {/* Step 2: Audience */}
            {step === 2 && (
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Set Audience
                </h2>
                <p className="text-gray-600 mb-4">
                  I want to select my target audience (trainers, students, or
                  batches)
                </p>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  To
                </label>
                <Cascader
                  options={cascaderOptions}
                  multiple
                  maxTagCount="responsive"
                  showCheckedStrategy={SHOW_CHILD}
                  placeholder="Please select at least one recipient"
                  style={{ width: "100%" }}
                  value={formData.Send_to || []}
                  onChange={(val) => handleInputChange("Send_to", val)}
                  showSearch={{
                    filter: (inputValue, path) =>
                      path.some((opt) =>
                        opt.label
                          .toLowerCase()
                          .includes(inputValue.toLowerCase())
                      ),
                  }}
                />
              </div>
            )}

            {/* Step 3: Content */}
            {step === 3 && (
              <div>
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Push Notification Content
                  </h2>
                  <div className="space-y-6">
                    {/* Title */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Title
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) =>
                          handleInputChange("title", e.target.value)
                        }
                        placeholder="Enter the title....."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-0 focus:ring-blue-500"
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description (optional)
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) =>
                          handleInputChange("description", e.target.value)
                        }
                        placeholder="Enter the description....."
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-0 focus:ring-blue-500"
                      />
                    </div>

                    {/* Image Upload */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Image (optional)
                      </label>
                      {!formData.uploadedImage ? (
                        <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 text-center bg-blue-50">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                            id="image-upload"
                          />
                          <label
                            htmlFor="image-upload"
                            className="cursor-pointer"
                          >
                            <FaUpload className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                            <p className="text-blue-600 font-medium">
                              Upload Image
                            </p>
                          </label>
                        </div>
                      ) : (
                        <div className="relative">
                          <img
                            src={formData.uploadedImage}
                            alt="Uploaded"
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          <button
                            onClick={removeImage}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                          >
                            <FaTimes className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Landing Details */}
                <div className="p-6 ">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Landing Details
                  </h2>
                  <div className="space-y-6 flex justify-between items-center gap-x-2">
                    <div className="w-1/2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Landing
                      </label>
                      <select
                        value={formData.landingOption}
                        onChange={(e) =>
                          handleInputChange("landingOption", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-0 focus:ring-blue-500"
                      >
                        {landingOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                      </div>

                      <div className="w-1/2">
                      {(formData.landingOption === "Custom Link" ||
                        formData.landingOption === "Specific Course") && (
                        <input
                          type="url"
                          value={formData.landingUrl}
                          onChange={(e) =>
                            handleInputChange("landingUrl", e.target.value)
                          }
                          placeholder={
                            formData.landingOption === "Custom Link"
                              ? "Enter Custom Link URL"
                              : "Enter Specific Course URL"
                          }
                          className="mt-0.5 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-0 focus:ring-blue-500"
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Publish */}
            {/* {step === 4 && (
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Publish Campaign
                </h2>
                <div className="space-y-6"> */}
                  {/* Campaign Title */}
                  {/* <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Campaign Title
                    </label>
                    <input
                      type="text"
                      value={formData.campaignTitle}
                      onChange={(e) =>
                        handleInputChange("campaignTitle", e.target.value)
                      }
                      placeholder="Enter campaign title"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                  </div> */}

                  {/* Schedule */}
                  {/* <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      When do you want to publish this campaign?
                    </label>
                    <div className="flex gap-6">
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="schedule"
                          checked={formData.scheduleType === "later"}
                          onChange={() =>
                            handleInputChange("scheduleType", "later")
                          }
                        />
                        Send Later
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="schedule"
                          checked={formData.scheduleType === "now"}
                          onChange={() =>
                            handleInputChange("scheduleType", "now")
                          }
                        />
                        Send Now
                      </label>
                    </div>
                  </div> */}

                  {/* Date & Time */}
                  {/* {formData.scheduleType === "later" && (
                    <div className="flex gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Date
                        </label>
                        <input
                          type="date"
                          value={formData.date}
                          onChange={(e) =>
                            handleInputChange("date", e.target.value)
                          }
                          className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Time
                        </label>
                        <input
                          type="time"
                          value={formData.time}
                          onChange={(e) =>
                            handleInputChange("time", e.target.value)
                          }
                          className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )} */}

            {/* Step 4: Publish */}
{step === 4 && (
  <div className="p-6">
    <h2 className="text-lg font-semibold text-gray-900 mb-3">
      Publish Campaign
    </h2>
    <div className="space-y-6">
      {/* Campaign Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Campaign Title
        </label>
        <input
          type="text"
          value={formData.campaignTitle}
          onChange={(e) =>
            handleInputChange("campaignTitle", e.target.value)
          }
          placeholder="Enter campaign title"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-0 focus:ring-blue-500"
        />
      </div>

      {/* Schedule */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          When do you want to publish this campaign?
        </label>
        <div className="flex gap-6">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="schedule"
              checked={formData.scheduleType === "later"}
              onChange={() => handleInputChange("scheduleType", "later")}
            />
            Send Later
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="schedule"
              checked={formData.scheduleType === "now"}
              onChange={() => handleInputChange("scheduleType", "now")}
            />
            Send Now
          </label>
        </div>
      </div>

      {/* Date & Time */}
      {formData.scheduleType === "later" && (
        <div className="flex gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) =>
                handleInputChange("date", e.target.value)
              }
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time
            </label>
            <input
              type="time"
              value={formData.time}
              onChange={(e) =>
                handleInputChange("time", e.target.value)
              }
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      )}
    </div>
  </div>
)}

          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center mt-8">
            {step > 1 && (
              <button
                className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                onClick={() => setStep((prev) => prev - 1)}
              >
                <FaArrowLeft /> Previous
              </button>
            )}

            {step < 4 ? (
              <button
                className={`px-6 py-2 ${theme.createBtn} text-white rounded-lg cursor-pointer disabled:opacity-50`}
                disabled={isContinueDisabled()}
                onClick={() => {
                  setStep((prev) => {
                    const nextStep = prev + 1;
                    if (!unlockedSteps.includes(nextStep)) {
                      setUnlockedSteps((prevUnlocked) => [
                        ...prevUnlocked,
                        nextStep,
                      ]);
                    }
                    return nextStep;
                  });
                }}
              >
                Continue
              </button>
            ) : (
              <button
                className={`px-4 py-2 ${theme.createBtn} text-white rounded-lg hover:bg-green-700 disabled:opacity-50`}
                disabled={loading}
                onClick={handlePublish}
              >
                {loading ? "Publishing..." : "Publish Campaign"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateNotification;