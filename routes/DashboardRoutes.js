import { v4 as uuid } from 'uuid';
import { FaCalendarCheck } from 'react-icons/fa';
import {
  FaHome,
  FaUsers,
  FaCreditCard,
  FaClipboardList,
  FaCalendarAlt,
  FaChalkboardTeacher,
  FaUserGraduate,
  FaFileAlt,
  FaUserCircle,
  FaSignOutAlt
} from 'react-icons/fa';

export const DashboardMenu = [
  {
    id: uuid(),
    title: 'Dashboard',
    icon: <FaHome />,
    link: '/dashboard'
  },
  {
    id: uuid(),
    title: 'Student List',
    icon: <FaUsers />,
    link: '/student-list'
  },
  {
    id: uuid(),
    title: 'Coach List',
    icon: <FaChalkboardTeacher />,
    link: '/coach-list'
  },
  {
    id: uuid(),
    title: 'Payment',
    icon: <FaCreditCard />,
    link: '/payment'
  },
  {
    id: uuid(),
    title: 'Attendance',
    icon: <FaCalendarCheck />,
    link: '/attendance'
  },
  {
    id: uuid(),
    title: 'Marks',
    icon: <FaClipboardList />,
    children: [
      { id: uuid(), link: '/marks', name: 'Marks', icon: <FaFileAlt /> },
      { id: uuid(), link: '/marks/add', name: 'Add Marks', icon: <FaFileAlt /> }
    ]
  },
  {
    id: uuid(),
    title: 'Events',
    icon: <FaCalendarAlt />,
    link: '/events'
  },
  {
    id: uuid(),
    title: 'Class List',
    icon: <FaUserGraduate />,
    link: '/class-list'
  },
  {
    id: uuid(),
    title: 'Demo Class',
    icon: <FaChalkboardTeacher />,
    link: '/demo-class'
  },
  {
    id: uuid(),
    title: 'Assessments',
    icon: <FaFileAlt />,
    link: '/assessments'
  },
  {
    id: uuid(),
    title: 'Profile',
    icon: <FaUserCircle />,
    link: '/profile'
  },
  {
    id: uuid(),
    title: 'Logout',
    icon: <FaSignOutAlt />,
    link: '/logout'
  }
];

// React component example to render menu

const SidebarMenu = () => {
  return (
    <nav>
      {DashboardMenu.map((item) => (
        <a key={item.id} href={item.link} className="menu-item d-flex align-items-center">
          <span className="menu-icon me-2">{item.icon}</span>
          <span className="menu-title">{item.title}</span>
        </a>
      ))}
    </nav>
  );
};

export default SidebarMenu;
