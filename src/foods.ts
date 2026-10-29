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
  { id: 'greenOnion', name: '대파', aliases: ['파'], category: 'veg', art: 'greenOnion', place: '냉장', keep: { 냉장: 7, 냉동: 30 } },
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
  // More of what people living alone buy (2026-10-28), so most things can be picked as a drawing.
  { id: 'radish', name: '무', category: 'veg', place: '냉장', keep: { 냉장: 7 }, opened: 3 },
  { id: 'broccoli', name: '브로콜리', category: 'veg', place: '냉장', keep: { 냉장: 3, 냉동: 30 } },
  { id: 'eggplant', name: '가지', category: 'veg', place: '냉장', keep: { 냉장: 4 } },
  { id: 'bokChoy', name: '청경채', category: 'veg', place: '냉장', keep: { 냉장: 3 } },
  { id: 'chives', name: '부추', category: 'veg', place: '냉장', keep: { 냉장: 3 } },
  { id: 'iceberg', name: '양상추', category: 'veg', place: '냉장', keep: { 냉장: 4 }, opened: 2 },
  { id: 'avocado', name: '아보카도', category: 'veg', place: '실온', keep: { 실온: 3, 냉장: 3 }, opened: 1 },
  { id: 'lemon', name: '레몬', category: 'veg', place: '냉장', keep: { 냉장: 14 }, opened: 3 },
  { id: 'tangerine', name: '귤', aliases: ['감귤', '밀감'], category: 'veg', place: '실온', keep: { 실온: 7, 냉장: 14 } },
  { id: 'strawberry', name: '딸기', category: 'veg', place: '냉장', keep: { 냉장: 2, 냉동: 90 } },
  { id: 'grape', name: '포도', aliases: ['샤인머스캣', '청포도'], category: 'veg', place: '냉장', keep: { 냉장: 5 } },
  { id: 'kiwi', name: '키위', category: 'veg', place: '냉장', keep: { 냉장: 14, 실온: 5 } },
  { id: 'blueberry', name: '블루베리', category: 'veg', place: '냉장', keep: { 냉장: 5, 냉동: 90 } },
  { id: 'ginger', name: '생강', category: 'veg', place: '냉장', keep: { 냉장: 14, 냉동: 60 } },
  { id: 'kabocha', name: '단호박', category: 'veg', place: '실온', keep: { 실온: 14, 냉동: 30 }, opened: 3 },
  { id: 'corn', name: '옥수수', aliases: ['초당옥수수'], category: 'veg', place: '냉장', keep: { 냉장: 2, 냉동: 60 } },
  { id: 'duck', name: '오리고기', aliases: ['훈제오리'], category: 'meat', place: '냉장', keep: { 냉장: 2, 냉동: 60 }, opened: 2 },
  { id: 'tteokgalbi', name: '떡갈비', category: 'meat', place: '냉동', keep: { 냉장: 2, 냉동: 60 } },
  { id: 'porkCutlet', name: '돈가스', aliases: ['돈까스'], category: 'meat', place: '냉동', keep: { 냉장: 1, 냉동: 60 } },
  { id: 'nugget', name: '너겟', aliases: ['치킨너겟'], category: 'meat', place: '냉동', keep: { 냉장: 1, 냉동: 60 } },
  { id: 'crab', name: '게맛살', aliases: ['맛살', '크래미'], category: 'fish', place: '냉장', keep: { 냉장: 7 }, opened: 2 },
  { id: 'clam', name: '바지락', aliases: ['조개', '홍합'], category: 'fish', place: '냉장', keep: { 냉장: 1, 냉동: 30 } },
  { id: 'anchovy', name: '멸치', aliases: ['볶음멸치', '국물멸치'], category: 'fish', place: '냉동', keep: { 냉장: 30, 냉동: 180 } },
  { id: 'cream', name: '생크림', category: 'dairy', place: '냉장', keep: { 냉장: 7 }, opened: 3 },
  { id: 'creamCheese', name: '크림치즈', category: 'dairy', place: '냉장', keep: { 냉장: 14 }, opened: 7 },
  { id: 'soyMilk', name: '두유', category: 'dairy', place: '실온', keep: { 실온: 30, 냉장: 30 }, opened: 2 },
  { id: 'soySauce', name: '간장', aliases: ['진간장', '국간장'], category: 'sauce', place: '실온', keep: { 실온: 180 }, opened: 180 },
  { id: 'sesameOil', name: '참기름', aliases: ['들기름'], category: 'sauce', place: '실온', keep: { 실온: 180 }, opened: 90 },
  { id: 'oil', name: '식용유', aliases: ['올리브유', '카놀라유'], category: 'sauce', place: '실온', keep: { 실온: 180 }, opened: 90 },
  { id: 'vinegar', name: '식초', category: 'sauce', place: '실온', keep: { 실온: 365 }, opened: 365 },
  { id: 'oysterSauce', name: '굴소스', category: 'sauce', place: '냉장', keep: { 냉장: 90 }, opened: 90 },
  { id: 'ssamjang', name: '쌈장', category: 'sauce', place: '냉장', keep: { 냉장: 90 }, opened: 90 },
  { id: 'chiliPowder', name: '고춧가루', category: 'sauce', place: '냉동', keep: { 냉장: 180, 냉동: 365 } },
  { id: 'sugar', name: '설탕', category: 'sauce', place: '실온', keep: { 실온: 365 }, opened: 365 },
  { id: 'salt', name: '소금', category: 'sauce', place: '실온', keep: { 실온: 365 }, opened: 365 },
  { id: 'mirin', name: '맛술', aliases: ['미림'], category: 'sauce', place: '실온', keep: { 실온: 180 }, opened: 90 },
  { id: 'syrup', name: '올리고당', aliases: ['물엿', '꿀'], category: 'sauce', place: '실온', keep: { 실온: 365 }, opened: 180 },
  { id: 'jam', name: '잼', aliases: ['딸기잼'], category: 'sauce', place: '냉장', keep: { 냉장: 90 }, opened: 30 },
  { id: 'mustard', name: '머스터드', aliases: ['머스타드'], category: 'sauce', place: '냉장', keep: { 냉장: 90 }, opened: 60 },
  { id: 'ramen', name: '라면', aliases: ['컵라면'], category: 'other', place: '실온', keep: { 실온: 120 } },
  { id: 'udon', name: '우동면', aliases: ['우동', '칼국수면'], category: 'other', place: '냉장', keep: { 냉장: 14 }, opened: 1 },
  { id: 'pasta', name: '파스타면', aliases: ['스파게티면', '스파게티'], category: 'other', place: '실온', keep: { 실온: 365 }, opened: 180 },
  { id: 'dumpling', name: '냉동만두', aliases: ['만두'], category: 'other', place: '냉동', keep: { 냉장: 1, 냉동: 90 } },
  { id: 'softTofu', name: '순두부', category: 'other', place: '냉장', keep: { 냉장: 3 }, opened: 1 },
  { id: 'quailEgg', name: '메추리알', category: 'other', place: '냉장', keep: { 냉장: 7 }, opened: 2 },
  { id: 'friedTofu', name: '유부', aliases: ['유부초밥'], category: 'other', place: '냉장', keep: { 냉장: 7, 냉동: 30 }, opened: 2 },
  { id: 'laver', name: '김', aliases: ['조미김', '김밥김'], category: 'other', place: '실온', keep: { 실온: 30 }, opened: 7 },
  { id: 'tuna', name: '참치캔', aliases: ['참치'], category: 'fish', place: '실온', keep: { 실온: 365 }, opened: 1 },
  { id: 'cereal', name: '시리얼', category: 'other', place: '실온', keep: { 실온: 60 }, opened: 30 },
  { id: 'juice', name: '주스', aliases: ['오렌지주스'], category: 'other', place: '냉장', keep: { 냉장: 7 }, opened: 3 },
  { id: 'beer', name: '맥주', category: 'other', place: '냉장', keep: { 냉장: 90, 실온: 90 }, opened: 1 },
  { id: 'friedChicken', name: '남은 치킨', aliases: ['치킨'], category: 'meat', place: '냉장', keep: { 냉장: 1, 냉동: 30 } },
  { id: 'pizza', name: '남은 피자', aliases: ['피자'], category: 'other', place: '냉장', keep: { 냉장: 2, 냉동: 30 } },
  { id: 'banchan', name: '반찬', aliases: ['밑반찬'], category: 'other', place: '냉장', keep: { 냉장: 3 } },
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
