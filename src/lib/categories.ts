import { Category } from '@/types';

export interface CategoryDef {
  label: string;
  icon: string;
  googleTypes: string[];
}

export const CATEGORIES: Record<Category, CategoryDef> = {
  shrine_temple: {
    label: '神社仏閣',
    icon: '\u26E9\uFE0F',
    googleTypes: ['place_of_worship', 'hindu_temple'],
  },
  nature: {
    label: '自然',
    icon: '\uD83C\uDF3F',
    googleTypes: ['park', 'natural_feature', 'campground'],
  },
  gourmet: {
    label: 'グルメ',
    icon: '\uD83C\uDF7D\uFE0F',
    googleTypes: ['restaurant', 'cafe', 'bakery', 'food'],
  },
  experience: {
    label: '体験',
    icon: '\uD83C\uDFAF',
    googleTypes: ['amusement_park', 'aquarium', 'zoo', 'spa'],
  },
  shopping: {
    label: 'ショッピング',
    icon: '\uD83D\uDECD\uFE0F',
    googleTypes: ['shopping_mall', 'department_store', 'store'],
  },
  history: {
    label: '歴史',
    icon: '\uD83C\uDFDB\uFE0F',
    googleTypes: ['museum', 'library', 'city_hall'],
  },
  scenery: {
    label: '景観',
    icon: '\uD83C\uDFD4\uFE0F',
    googleTypes: ['point_of_interest', 'tourist_attraction'],
  },
};

export const CATEGORY_LIST = Object.entries(CATEGORIES).map(([key, val]) => ({
  key: key as Category,
  ...val,
}));

export function mapToCategory(googleTypes: string[]): Category {
  for (const [cat, def] of Object.entries(CATEGORIES)) {
    if (googleTypes.some((t) => def.googleTypes.includes(t))) {
      return cat as Category;
    }
  }
  return 'scenery';
}
