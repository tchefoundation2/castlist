// Removed unused React import
import { Page } from './types';
import {
  HomeIcon,
  BookmarkSquareIcon,
  PlusCircleIcon,
  TrophyIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';

export const NAV_ITEMS = [
  {
    page: Page.Home,
    label: 'Home',
    icon: HomeIcon,
  },
  {
    page: Page.MyGuides,
    label: 'My Guides',
    icon: BookmarkSquareIcon,
  },
  {
    page: Page.Create,
    label: 'Create',
    icon: PlusCircleIcon,
  },
  {
    page: Page.Ranking,
    label: 'Ranking',
    icon: TrophyIcon,
  },
  {
    page: Page.Profile,
    label: 'Profile',
    icon: UserCircleIcon,
  },
];