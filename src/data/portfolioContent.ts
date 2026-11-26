export type Project = {
  id: number;
  title: string;
  description: string;
  category: 'Mobile app' | 'System' | 'UI design';
  breakdown: string[];
  tags: string[];
};

export type ProjectCategory = 'All' | Project['category'];

export const CONTACT_INFO = {
  name: 'Ali Akram',
  location: 'Islamabad, Pakistan',
  role: 'React Native Developer',
  lead: 'I build fast, clean mobile apps for Android and iOS, from finance dashboards to booking flows.',
  email: 'Alleeakram007@gmail.com',
  phone: '+92 332 9738286',
  phoneHref: 'tel:+923329738286',
  github: 'https://github.com/ali-akram12',
  linkedin: 'https://www.linkedin.com/in/ali-akram-821491213/',
  footer: '© 2026 Ali Akram · Islamabad, Pakistan',
};

export const ABOUT_PARAGRAPHS = [
  'I’m a React Native developer who cares about clean code and screens that feel smooth to use. I turn UI/UX designs into pixel-perfect mobile screens with reusable components, and connect them to REST APIs so data stays live.',
  'My work covers authentication flows, Redux Toolkit state management, financial interfaces with automatic calculations, and service-booking apps. I also hold a Master’s in Applied AI & Data Analytics from the University of Bradford.',
];

export const CORE_SKILLS = [
  'React Native',
  'Node.js',
  'SQL Server',
  'JavaScript',
  'Redux Toolkit',
  'State management',
  'REST API handling',
  'Firebase',
];

export const TOOL_SKILLS = [
  'Git / GitHub',
  'Postman',
  'Google Cloud Console',
  'Android Studio',
  'Navigation',
  'Third-party library integration',
  'Responsive UI/UX design',
  'Google Play Store deployment',
  'Project management tools',
];

export const EXPERIENCES = [
  {
    id: 'solochoicez',
    role: 'React Native Developer',
    org: 'Solochoicez Pvt. Ltd',
    period: '2023 – Present',
    current: true,
    accent: 'cyan',
    bullets: [
      'Build cross-platform mobile apps with React Native CLI, focused on responsive UI and smooth user experience.',
      'Convert UI/UX designs into pixel-perfect screens using reusable components.',
      'Integrate REST APIs to fetch and show dynamic data in real time.',
      'Implement login, signup and form validation flows.',
      'Manage app state with Redux Toolkit for scalable, organised data handling.',
      'Built financial interfaces for Cash, Bank Balance, Receivables, Payables, Assets and Stock values with automatic calculations.',
      'Developed booking and service flows: listings, selections and user interactions.',
      'Built React Native mobile applications with Node.js backend services and SQL Server databases.',
      'Prepared and deployed Android applications to the Google Play Store.',
      'Test APIs in Postman and debug with React Native tools and Android Studio.',
    ],
  },
  {
    id: 'beta-angels',
    role: 'Android Developer',
    org: 'Beta Angels App',
    period: '2022',
    current: false,
    accent: 'indigo',
    bullets: [
      'Helped build and improve the Beta Angels Android app using React Native.',
      'Implemented responsive UI/UX designs and integrated RESTful APIs and third-party services.',
      'Debugged and optimised performance; worked with the team through Git/GitHub.',
    ],
  },
  {
    id: 'ogdcl',
    role: 'Network Engineer',
    org: 'OGDCL',
    period: '2022',
    current: false,
    accent: 'emerald',
    bullets: [
      'Monitored and maintained network infrastructure; configured and troubleshot routers, switches and firewalls.',
      'Supported network performance work and security monitoring.',
    ],
  },
  {
    id: 'social-welfare',
    role: 'Office Automation Operator',
    org: 'Social Welfare Department',
    period: '2021 – 2022',
    current: false,
    accent: 'amber',
    bullets: [
      'Managed office computer systems, data entry and record management, and gave basic IT support.',
    ],
  },
];

export const PROJECTS: Project[] = [
  {
    id: 0,
    title: 'Financial Analytics',
    description: 'Finance interface with automatic calculations.',
    category: 'Mobile app',
    breakdown: [
      'Real-time automatic Net Position calculation engine built with Redux Toolkit',
      'Clean financial ledger rows covering Cash, Bank Balance, Receivables, Payables, Assets, and Stock value',
      'Responsive cross-platform mobile dashboard screens built in React Native',
    ],
    tags: ['React Native', 'Redux Toolkit', 'REST APIs'],
  },
  {
    id: 1,
    title: 'Saloon Online',
    description: 'Service listings, selection and booking flow.',
    category: 'Mobile app',
    breakdown: [
      'Structured service catalog with multi-service selection state',
      'Intuitive booking flow and responsive user interaction states',
      'REST API integration for service availability and appointment requests',
    ],
    tags: ['React Native', 'Navigation', 'Booking Flow'],
  },
  {
    id: 2,
    title: 'IC Licensing',
    description: 'Licensing app built with React Native.',
    category: 'Mobile app',
    breakdown: [
      'Authentication and structured form validation flows',
      'Reusable UI components for consistent iOS and Android rendering',
      'Dynamic API integration for licensing data and status tracking',
    ],
    tags: ['React Native', 'JavaScript', 'Form Validation'],
  },
  {
    id: 3,
    title: 'Messenger',
    description: 'Chat-style mobile application.',
    category: 'Mobile app',
    breakdown: [
      'Clean real-time conversation threads and responsive chat composer',
      'Firebase integration for live message sync and updates',
      'Smooth mobile list rendering and navigation transitions',
    ],
    tags: ['React Native', 'Firebase', 'Mobile UI'],
  },
  {
    id: 4,
    title: 'Attendance Management',
    description: 'Tracking attendance records.',
    category: 'System',
    breakdown: [
      'Structured attendance record tracking and daily status logs',
      'Organised data handling and clear summary views',
      'Reliable state management for accurate record inspection',
    ],
    tags: ['System', 'Record Management', 'Data Handling'],
  },
  {
    id: 5,
    title: 'Payroll Management',
    description: 'Managing payroll data.',
    category: 'System',
    breakdown: [
      'Structured payroll data organisation and calculation summaries',
      'Clear breakdown of earnings, deductions, and net payouts',
      'Validated workflows ensuring data consistency across records',
    ],
    tags: ['System', 'Payroll Logic', 'Data Management'],
  },
  {
    id: 6,
    title: 'Biometric Control',
    description: 'Biometric-based access and control.',
    category: 'System',
    breakdown: [
      'Biometric-based verification and access control workflow',
      'Real-time status indicators and access event tracking',
      'Security-minded interface design for controlled entry points',
    ],
    tags: ['System', 'Biometrics', 'Access Control'],
  },
  {
    id: 7,
    title: 'Coffee Shop',
    description: 'Ordering experience for a coffee shop.',
    category: 'UI design',
    breakdown: [
      'Tactile beverage menu and item selection screens',
      'Clean mobile-first visual hierarchy and touch targets',
      'Component-ready UI layout tailored for mobile ordering',
    ],
    tags: ['UI design', 'Mobile UX', 'Ordering Flow'],
  },
  {
    id: 8,
    title: 'Biztrack',
    description: 'Business tracking app interface.',
    category: 'UI design',
    breakdown: [
      'Clear business performance cards and metric hierarchy',
      'Balanced contrast and legible typography across screen sizes',
      'Reusable interface patterns for business tracking views',
    ],
    tags: ['UI design', 'Dashboard UI', 'Mobile Interface'],
  },
  {
    id: 9,
    title: 'SwiftBrew',
    description: 'Beverage ordering app interface.',
    category: 'UI design',
    breakdown: [
      'Fast beverage discovery, selection, and order flow UI',
      'Cohesive card styling and clear visual feedback states',
      'Designed for smooth translation into React Native components',
    ],
    tags: ['UI design', 'App Interface', 'UX Flow'],
  },
  {
    id: 10,
    title: 'Car Wash Mobile App',
    description: 'BSCS final year project for booking and managing car wash services.',
    category: 'Mobile app',
    breakdown: [
      'End-to-end car wash booking flow for selecting services, location, date, and time',
      'Service catalog and customer order management with clear booking status tracking',
      'Mobile interface for Android with reusable screens and structured appointment data',
    ],
    tags: ['BSCS Final Project', 'Android', 'React Native'],
  },
  {
    id: 11,
    title: 'AI Traffic Control System',
    description: 'MS Applied AI dissertation using AI and data analytics.',
    category: 'System',
    breakdown: [
      'AI-based traffic flow analysis and intelligent signal control decision support',
      'Data analytics workflow for identifying congestion patterns and traffic trends',
      'Dissertation project focused on improving road efficiency through predictive modelling',
    ],
    tags: ['MS AI Dissertation', 'Data Analytics', 'Traffic Control'],
  },
  {
    id: 12,
    title: 'App Guard',
    description: 'Secure mobile application with protected access and monitoring workflows.',
    category: 'Mobile app',
    breakdown: [
      'Secure authentication and protected application access flows',
      'Real-time status and security event monitoring screens',
      'Cross-platform React Native interface with Node.js API integration',
    ],
    tags: ['React Native', 'Node.js', 'Security'],
  },
  {
    id: 13,
    title: 'SoloPulse',
    description: 'Mobile application for live business and performance monitoring.',
    category: 'Mobile app',
    breakdown: [
      'Live performance dashboards and responsive mobile data views',
      'Structured API-driven workflows for organised business information',
      'Backend integration built around Node.js and SQL Server',
    ],
    tags: ['React Native', 'Node.js', 'SQL Server'],
  },
  {
    id: 14,
    title: 'Deskpin',
    description: 'Cross-platform productivity and workspace management application.',
    category: 'Mobile app',
    breakdown: [
      'Task, workspace, and status management for mobile users',
      'React Native screens with responsive navigation and reusable components',
      'Node.js APIs and SQL Server database integration with Play Store deployment',
    ],
    tags: ['React Native', 'Node.js', 'Google Play'],
  },
];

export const EDUCATION = [
  {
    id: 'bradford',
    degree: 'Master’s in Applied AI & Data Analytics',
    institution: 'University of Bradford, England',
    period: '2024 – 2025',
    badge: 'Postgraduate',
    accent: 'indigo',
    dissertation: 'Dissertation: AI and Data Analytics-based Traffic Control System',
  },
  {
    id: 'ucp',
    degree: 'Bachelor’s in Computer Science',
    institution: 'University of Central Punjab, Lahore',
    period: '2018 – 2022',
    badge: 'Undergraduate',
    accent: 'cyan',
    dissertation: 'Final Year Project: Android Mobile App for Car Wash Services',
  },
];

export const NAV_ITEMS = [
  { id: 'about', label: 'About' },
  { id: 'skills', label: 'Skills' },
  { id: 'experience', label: 'Experience' },
  { id: 'projects', label: 'Projects' },
  { id: 'education', label: 'Education' },
  { id: 'contact', label: 'Contact' },
];
