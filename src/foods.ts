// The ingredient dictionary: names the voice parser listens for, the drawing each one gets, where it usually goes,
// and how many days it keeps when the package shows no date.
//
// Day counts are deliberately conservative placeholders (the short end of common home-storage guidance). Before launch,
// check them against USDA FoodKeeper (CC0, https://catalog.data.gov/dataset/fsis-foodkeeper-data) and keep the
// shorter value; FoodKeeper has no 김치/깻잎/떡 and the like, so those stay ours.

import type { Category } from './Ingredients';

export type Place = '냉장' | '냉동' | '실온';

export type Food = {
  id: string;
  name: string;
  aliases?: string[];
  category: Category;
  art?: string; // drawing id in Ingredients.tsx, when it has its own drawing
  place: Place; // where it goes when nothing else says
  keep: Partial<Record<Place, number>>; // days it keeps from the day it goes in, when there is no date on it
  opened?: number; // days it keeps in the fridge once opened or portioned
  usesSellBy?: boolean; // still printed with 유통기한 (refrigerated milk until 2031)
};

export const FOODS: Food[] = [
  { id: 'egg', name: '계란', aliases: ['달걀'], category: 'other', art: 'egg', place: '냉장', keep: { 냉장: 21 } },
  { id: 'tofu', name: '두부', category: 'other', art: 'tofu', place: '냉장', keep: { 냉장: 3, 냉동: 30 }, opened: 2 },
  { id: 'milk', name: '우유', category: 'dairy', art: 'milk', place: '냉장', keep: { 냉장: 5 }, opened: 3, usesSellBy: true },
  { id: 'yogurt', name: '요거트', aliases: ['요구르트'], category: 'dairy', place: '냉장', keep: { 냉장: 7 }, opened: 3 },
  { id: 'cheese', name: '치즈', aliases: ['슬라이스 치즈'], category: 'dairy', place: '냉장', keep: { 냉장: 14 }, opened: 7 },
  { id: 'butter', name: '버터', category: 'dairy', place: '냉장', keep: { 냉장: 30, 냉동: 90 }, opened: 30 },
  { id: 'greenOnion', name: '대파', category: 'veg', art: 'greenOnion', place: '냉장', keep: { 냉장: 7, 냉동: 30 } },
  { id: 'scallion', name: '쪽파', category: 'veg', place: '냉장', keep: { 냉장: 5, 냉동: 30 } },
  { id: 'onion', name: '양파', category: 'veg', art: 'onion', place: '실온', keep: { 실온: 14, 냉장: 14, 냉동: 30 }, opened: 3 },
  { id: 'garlic', name: '마늘', aliases: ['다진 마늘', '다진마늘'], category: 'veg', place: '냉장', keep: { 냉장: 14, 실온: 14, 냉동: 60 }, opened: 7 },
  { id: 'potato', name: '감자', category: 'veg', art: 'potato', place: '실온', keep: { 실온: 14 }, opened: 1 },
  { id: 'sweetPotato', name: '고구마', category: 'veg', place: '실온', keep: { 실온: 14 } },
  { id: 'carrot', name: '당근', category: 'veg', art: 'carrot', place: '냉장', keep: { 냉장: 14, 냉동: 60 }, opened: 5 },
  { id: 'zucchini', name: '애호박', aliases: ['호박'], category: 'veg', place: '냉장', keep: { 냉장: 5 }, opened: 2 },
  { id: 'cabbage', name: '양배추', category: 'veg', place: '냉장', keep: { 냉장: 7 }, opened: 4 },
  { id: 'napa', name: '배추', category: 'veg', place: '냉장', keep: { 냉장: 7 } },
  { id: 'lettuce', name: '상추', category: 'veg', place: '냉장', keep: { 냉장: 3 } },
  { id: 'perilla', name: '깻잎', category: 'veg', place: '냉장', keep: { 냉장: 3 } },
  { id: 'spinach', name: '시금치', category: 'veg', place: '냉장', keep: { 냉장: 3, 냉동: 30 } },
  { id: 'beanSprout', name: '콩나물', category: 'veg', place: '냉장', keep: { 냉장: 2 } },
  { id: 'mungSprout', name: '숙주', aliases: ['숙주나물'], category: 'veg', place: '냉장', keep: { 냉장: 2 } },
  { id: 'cucumber', name: '오이', category: 'veg', place: '냉장', keep: { 냉장: 5 } },
  { id: 'tomato', name: '토마토', aliases: ['방울토마토'], category: 'veg', place: '냉장', keep: { 냉장: 5, 실온: 3 } },
  { id: 'mushroom', name: '버섯', aliases: ['팽이버섯', '새송이', '새송이버섯', '표고', '표고버섯', '느타리'], category: 'veg', art: 'mushroom', place: '냉장', keep: { 냉장: 4, 냉동: 30 } },
  { id: 'paprika', name: '파프리카', aliases: ['피망'], category: 'veg', place: '냉장', keep: { 냉장: 7 }, opened: 3 },
  { id: 'pepper', name: '고추', aliases: ['청양고추', '풋고추'], category: 'veg', place: '냉장', keep: { 냉장: 7, 냉동: 60 } },
  { id: 'apple', name: '사과', category: 'veg', place: '냉장', keep: { 냉장: 21, 실온: 7 } },
  { id: 'banana', name: '바나나', category: 'veg', place: '실온', keep: { 실온: 4 } },
  { id: 'pork', name: '돼지고기', aliases: ['삼겹살', '목살', '앞다리살', '제육'], category: 'meat', art: 'pork', place: '냉장', keep: { 냉장: 2, 냉동: 90 } },
  { id: 'beef', name: '소고기', aliases: ['쇠고기', '불고기'], category: 'meat', place: '냉장', keep: { 냉장: 2, 냉동: 90 } },
  { id: 'chicken', name: '닭고기', aliases: ['닭가슴살', '닭다리', '닭'], category: 'meat', place: '냉장', keep: { 냉장: 1, 냉동: 90 } },
  { id: 'minced', name: '다짐육', aliases: ['다진 고기', '다진고기', '간 고기'], category: 'meat', place: '냉장', keep: { 냉장: 1, 냉동: 60 } },
  { id: 'fish', name: '생선', aliases: ['고등어', '연어', '갈치', '삼치'], category: 'fish', place: '냉장', keep: { 냉장: 1, 냉동: 60 } },
  { id: 'shrimp', name: '새우', category: 'fish', place: '냉동', keep: { 냉장: 1, 냉동: 60 } },
  { id: 'squid', name: '오징어', category: 'fish', place: '냉동', keep: { 냉장: 1, 냉동: 60 } },
  { id: 'ham', name: '햄', aliases: ['스팸', '통조림 햄'], category: 'meat', place: '냉장', keep: { 냉장: 14 }, opened: 3 },
  { id: 'sausage', name: '소시지', aliases: ['비엔나'], category: 'meat', place: '냉장', keep: { 냉장: 14 }, opened: 3 },
  { id: 'bacon', name: '베이컨', category: 'meat', place: '냉장', keep: { 냉장: 7, 냉동: 30 }, opened: 3 },
  { id: 'fishcake', name: '어묵', aliases: ['오뎅'], category: 'fish', place: '냉장', keep: { 냉장: 7, 냉동: 30 }, opened: 3 },
  { id: 'kimchi', name: '김치', aliases: ['배추김치', '깍두기'], category: 'other', art: 'kimchi', place: '냉장', keep: { 냉장: 30 } },
  { id: 'rice', name: '밥', aliases: ['햇반', '즉석밥'], category: 'other', art: 'rice', place: '냉동', keep: { 냉장: 1, 냉동: 30 } },
  { id: 'bread', name: '식빵', aliases: ['빵'], category: 'other', place: '실온', keep: { 실온: 3, 냉동: 30 } },
  { id: 'riceCake', name: '떡', aliases: ['떡볶이 떡', '가래떡'], category: 'other', place: '냉동', keep: { 실온: 1, 냉장: 2, 냉동: 60 } },
  { id: 'gochujang', name: '고추장', category: 'sauce', place: '냉장', keep: { 냉장: 90 }, opened: 90 },
  { id: 'doenjang', name: '된장', category: 'sauce', place: '냉장', keep: { 냉장: 90 }, opened: 90 },
  { id: 'mayo', name: '마요네즈', category: 'sauce', place: '냉장', keep: { 냉장: 30 }, opened: 30 },
  { id: 'ketchup', name: '케첩', aliases: ['케찹'], category: 'sauce', place: '냉장', keep: { 냉장: 30 }, opened: 30 },
];

// Anything not in the dictionary keeps for this long (and this long once opened), by category.
export const CATEGORY_KEEP: Record<Category, Partial<Record<Place, number>> & { opened: number }> = {
  veg: { 냉장: 3, 실온: 2, 냉동: 30, opened: 2 },
  meat: { 냉장: 1, 냉동: 60, opened: 1 },
  fish: { 냉장: 1, 냉동: 60, opened: 1 },
  dairy: { 냉장: 3, opened: 2 },
  sauce: { 냉장: 30, 실온: 30, opened: 30 },
  other: { 냉장: 3, 실온: 3, 냉동: 30, opened: 2 },
};

const BY_ID = new Map(FOODS.map((f) => [f.id, f]));
export const foodById = (id?: string) => (id ? BY_ID.get(id) : undefined);

// Every name and alias, longest first, so "다진 마늘" wins over "마늘" and "쪽파" over "파".
export const NAMES: { text: string; food: Food }[] = FOODS.flatMap((food) =>
  [food.name, ...(food.aliases ?? [])].map((text) => ({ text, food })),
).sort((a, b) => b.text.length - a.text.length);

export function findFood(name: string): Food | undefined {
  const t = name.trim();
  return NAMES.find((n) => n.text === t)?.food;
}

// The foods offered as quick-tap chips when adding.
export const QUICK = ['egg', 'tofu', 'greenOnion', 'onion', 'milk', 'pork', 'kimchi', 'rice', 'potato', 'carrot', 'mushroom', 'ham'];
