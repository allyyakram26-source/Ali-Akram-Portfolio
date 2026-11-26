import {
  ABOUT_PARAGRAPHS,
  CONTACT_INFO,
  CORE_SKILLS,
  EDUCATION,
  EXPERIENCES,
  PROJECTS,
  TOOL_SKILLS,
} from '../../data/portfolioContent';

export type DriveStationId =
  | 'about'
  | 'skills'
  | 'education'
  | 'experience'
  | 'projects'
  | 'contact';

type DriveStationContent =
  | { type: 'about'; paragraphs: typeof ABOUT_PARAGRAPHS }
  | { type: 'skills'; core: typeof CORE_SKILLS; tools: typeof TOOL_SKILLS }
  | { type: 'education'; items: typeof EDUCATION }
  | { type: 'experience'; items: typeof EXPERIENCES }
  | { type: 'projects'; items: typeof PROJECTS; github: string }
  | { type: 'contact'; details: typeof CONTACT_INFO };

export type DriveStation = {
  id: DriveStationId;
  label: string;
  subtitle: string;
  worldPosition: number;
  accent: 'cyan' | 'indigo' | 'emerald' | 'amber' | 'rose' | 'violet';
  content: DriveStationContent;
};

export const DRIVE_STATIONS: readonly DriveStation[] = [
  {
    id: 'about',
    label: 'About',
    subtitle: 'Meet the driver',
    worldPosition: 640,
    accent: 'cyan',
    content: { type: 'about', paragraphs: ABOUT_PARAGRAPHS },
  },
  {
    id: 'skills',
    label: 'Skills',
    subtitle: 'Tools on board',
    worldPosition: 1540,
    accent: 'indigo',
    content: { type: 'skills', core: CORE_SKILLS, tools: TOOL_SKILLS },
  },
  {
    id: 'education',
    label: 'Education',
    subtitle: 'Learning journey',
    worldPosition: 2440,
    accent: 'emerald',
    content: { type: 'education', items: EDUCATION },
  },
  {
    id: 'experience',
    label: 'Experience',
    subtitle: 'Career track',
    worldPosition: 3340,
    accent: 'amber',
    content: { type: 'experience', items: EXPERIENCES },
  },
  {
    id: 'projects',
    label: 'Projects',
    subtitle: 'Selected work',
    worldPosition: 4240,
    accent: 'rose',
    content: { type: 'projects', items: PROJECTS, github: CONTACT_INFO.github },
  },
  {
    id: 'contact',
    label: 'Contact',
    subtitle: 'Let’s connect',
    worldPosition: 5140,
    accent: 'violet',
    content: { type: 'contact', details: CONTACT_INFO },
  },
];
