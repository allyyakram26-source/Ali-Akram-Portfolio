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
  number: number;
  label: string;
  subtitle: string;
  worldPosition: number;
  accent: 'cyan' | 'indigo' | 'emerald' | 'amber' | 'rose' | 'violet';
  content: DriveStationContent;
};

export const DRIVE_STATIONS: readonly DriveStation[] = [
  {
    id: 'about',
    number: 1,
    label: 'About',
    subtitle: 'Meet the driver',
    worldPosition: 640,
    accent: 'cyan',
    content: { type: 'about', paragraphs: ABOUT_PARAGRAPHS },
  },
  {
    id: 'skills',
    number: 2,
    label: 'Skills',
    subtitle: 'Tools on board',
    worldPosition: 1680,
    accent: 'indigo',
    content: { type: 'skills', core: CORE_SKILLS, tools: TOOL_SKILLS },
  },
  {
    id: 'education',
    number: 3,
    label: 'Education',
    subtitle: 'Learning journey',
    worldPosition: 2720,
    accent: 'emerald',
    content: { type: 'education', items: EDUCATION },
  },
  {
    id: 'experience',
    number: 4,
    label: 'Experience',
    subtitle: 'Career track',
    worldPosition: 3760,
    accent: 'amber',
    content: { type: 'experience', items: EXPERIENCES },
  },
  {
    id: 'projects',
    number: 5,
    label: 'Projects',
    subtitle: 'Selected work',
    worldPosition: 4800,
    accent: 'rose',
    content: { type: 'projects', items: PROJECTS, github: CONTACT_INFO.github },
  },
  {
    id: 'contact',
    number: 6,
    label: 'Contact',
    subtitle: 'Let’s connect',
    worldPosition: 5840,
    accent: 'violet',
    content: { type: 'contact', details: CONTACT_INFO },
  },
];
