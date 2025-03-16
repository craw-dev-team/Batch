
import {HomeOutlined, UsergroupAddOutlined, UserOutlined, ProductOutlined, ProfileOutlined } from '@ant-design/icons';
import { Breadcrumb } from 'antd';
import { useLocation, matchPath , Link } from "react-router-dom";
import * as route from '../../routes/Slugs'
import { useSpecificTrainer } from '../dashboard/Contexts/SpecificTrainers';
import { useSpecificStudent } from '../dashboard/Contexts/SpecificStudent';
import { useSpecificBatch } from '../dashboard/Contexts/SpecificBatch';



const breadcrumbNameMap = {
  [route.BATCHES_PATH]: { title: "Batches", icon: <ProductOutlined /> },
  [route.STUDENTS_PATH]: { title: "Students", icon: <UsergroupAddOutlined /> },
  [route.TRAINERS_PATH]: { title: "Trainers", icon: <UserOutlined /> },
  [route.COURSES_PATH]: { title: "Courses", icon: <ProfileOutlined /> },
  // [route.TRAINER_DETAILS_PATH]: { title: "Trainer Details", icon: <UserOutlined /> }, // Added new route

};

const BreadCrumbs = () => {
  const location = useLocation();
  const { specificTrainer } = useSpecificTrainer();
  const { specificStudent } = useSpecificStudent();
  const { specificBatch } = useSpecificBatch();

  const batch = matchPath("/batches/:batchId", location.pathname);
  const batchId = batch?.params?.batchId || null;

  const trainer = matchPath("/trainers/:trainerId", location.pathname);
  const trainerId = trainer?.params?.trainerId || null;

  const student = matchPath("/students/:studentId", location.pathname);
  const studentId = student?.params?.studentId || null;

  // Get trainer name dynamically (fallback to ID if not found)
  const trainerName = specificTrainer?.Trainer_All?.trainer?.name || `Trainer ${trainerId}`;
  const studentName = specificStudent?.All_in_One?.student?.name || `Student ${studentId}`;
  const batchCode = specificBatch?.batch?.batch_id || `# ${batchId}`;

  // Split pathname into segments
  const pathSnippets = location.pathname.split("/").filter((i) => i);

  const breadcrumbItems = [
    {
      href: "/batches",
      title: <Link to="/batches"><HomeOutlined /> Home</Link>,
    },
    ...pathSnippets.map((snippet, index) => {
      const path = `/${pathSnippets.slice(0, index + 1).join("/")}`;

      // Check if the snippet matches a static route
      if (breadcrumbNameMap[path]) {
        return {
          href: path,
          title: (
            <Link to={path}>
              {breadcrumbNameMap[path].icon} {breadcrumbNameMap[path].title}
            </Link>
          ),
        };
      }

      // Handle dynamic trainer route
      if (path.startsWith("/trainers/") && trainerId) {
        return {
          href: `/trainers/${trainerId}`,
          title: trainerName, // Show Trainer Name instead of ID
        };
      }
      if (path.startsWith("/students/") && studentId) {
        return {
          href: `/students/${studentId}`,
          title: studentName,
        };
      }
      if (path.startsWith("/batches/") && batchId) {
        return {
          href: `/batches/${batchId}`,
          title: batchCode,
        };
      }

      return null; // Ignore unknown paths
    }).filter(Boolean), // Remove null values
  ];

  return <Breadcrumb items={breadcrumbItems} />;
};

export default BreadCrumbs;


// const BreadCrumbs = () => {
//   const location = useLocation();
//     const match = matchPath("/trainers/:trainerId", location.pathname);
//   const trainerId = match?.params?.trainerId || null;
//   const { SpecificTrainer } = useSpecificTrainer();
//   const isTrainerPage = location.pathname.startsWith(`/trainers/`);

//   const trainerName = SpecificTrainer?.Trainer_All?.trainer?.name || `Trainer ${trainerId}`;
//   console.log("Trainer ID from useParams:", trainerId);
//   console.log(SpecificTrainer);
  
//     const breadcrumbItems = [
//         {
//           href: "/batches",
//           title: <HomeOutlined />,
//         },
//         isTrainerPage
//       ? {
//         href: `/trainers/${trainerId}`,
//           title: (
//             <>
//                 <span>{trainerName}</span>
//             </>
//           ),
//         }
//         : breadcrumbNameMap[location.pathname] && {
//           href: location.pathname,
//           title: (
//             <>
//               {breadcrumbNameMap[location.pathname]?.icon}{" "}
//               <span>{breadcrumbNameMap[location.pathname]?.title}</span>
//             </>
//           ),
//         },
//       ].filter(Boolean); // Remove any undefined values
    
//       return <Breadcrumb items={breadcrumbItems} />;
// }

// export default BreadCrumbs;