
import {HomeOutlined, UsergroupAddOutlined, UserOutlined, ProductOutlined, ProfileOutlined, BookOutlined, NotificationOutlined } from '@ant-design/icons';
import { Breadcrumb } from 'antd';
import { useLocation, matchPath , Link } from "react-router-dom";
import * as route from '../../routes/Slugs'
import { useSpecificTrainer } from '../dashboard/Contexts/SpecificTrainers';
import { useSpecificStudent } from '../dashboard/Contexts/SpecificStudent';
import { useSpecificBatch } from '../dashboard/Contexts/SpecificBatch';
import { useSpecificBook } from '../dashboard/Contexts/SpecificBook';



const breadcrumbNameMap = {
  [route.BATCHES_PATH]: { title: "Batches", icon: <ProductOutlined /> },
  [route.STUDENTS_PATH]: { title: "Students", icon: <UsergroupAddOutlined /> },
  [route.TRAINERS_PATH]: { title: "Trainers", icon: <UserOutlined /> },
  [route.COURSES_PATH]: { title: "Courses", icon: <ProfileOutlined /> },
  [route.ALL_LOGS_PATH]: { title: "Logs", icon: <ProductOutlined /> },
  [route.BOOKS_PATH]: { title: "Books", icon: <BookOutlined /> }, // Added new route
  [route.ANNOUNCEMENTS_PATH]: { title: "Announcements", icon: <NotificationOutlined /> }, // Added new route

};

const BreadCrumbs = () => {
  const location = useLocation();
  const { specificTrainer } = useSpecificTrainer();
  const { specificStudent } = useSpecificStudent();
  const { specificBatch } = useSpecificBatch();
  const { specificBook } = useSpecificBook();  

  const batch = matchPath("/batches/:batchId", location.pathname);
  const batchId = batch?.params?.batchId || null;

  const student = matchPath("/students/:studentId", location.pathname);
  const studentId = student?.params?.studentId || null;
  
  const trainer = matchPath("/trainers/:trainerId", location.pathname);
  const trainerId = trainer?.params?.trainerId || null;

  const book = matchPath("/book/:bookId", location.pathname);
  const bookId = book?.params?.bookId  || null

  // Get name dynamically (fallback to ID if not found)
  const batchCode = specificBatch?.batch?.batch_id || `# ${batchId}`;
  const studentName = specificStudent?.All_in_One?.student?.name || `Student ${studentId}`;
  const trainerName = specificTrainer?.Trainer_All?.trainer?.name || `Trainer ${trainerId}`;
  const bookName = specificBook?.book_info?.name || `Book ${bookId}`;

  // Split pathname into segments
  const pathSnippets = location.pathname.split("/").filter((i) => i);



  const breadcrumbItems = [
    {
      href: "/",
      title: (
        <>
          <HomeOutlined /> Home
        </>
      ),
    },
    ...pathSnippets.map((snippet, index) => {
      const path = `/${pathSnippets.slice(0, index + 1).join("/")}`;

      // for books breadcrumbs
        if (path.startsWith("/book/") && bookId) {
          return {
            href: `/book/${bookId}`,
            title: bookName ,
          };
        }

        // For general books page (/books)
        if (path === "/books" && !bookId) {
          return {
            href: path,
            title: (
              <>
                <BookOutlined /> Books
              </>
            ),
          };
        }

  
      if (breadcrumbNameMap[path]) {
        return {
          href: path,
          title: (
            <>
              {breadcrumbNameMap[path].icon} {breadcrumbNameMap[path].title}
            </>
          ),
        };
      }
  
      if (path.startsWith("/batches/") && batchId) {
        return {
          href: `/batches/${batchId}`,
          title: batchCode,
        };
      }
      
      if (path.startsWith("/students/") && studentId) {
        return {
          href: `/students/${studentId}`,
          title: studentName,
        };
      }

      if (path.startsWith("/trainers/") && trainerId) {
        return {
          href: `/trainers/${trainerId}`,
          title: trainerName,
        };
      }

  
      return null;
    }).filter(Boolean),
  ];
  

  return <Breadcrumb
              items={breadcrumbItems}
              itemRender={(route, params, routes, paths) =>
                <Link to={route.href}>{route.title}</Link>
              }
          />;
};

export default BreadCrumbs;

