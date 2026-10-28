// Recipes that come with the app: simple one-person dishes written for this app (no outside text or photos).
// `ingredients` are dictionary names and are what gets matched against the fridge; `pantry` is seasoning most
// kitchens keep (shown, never required). Steps are short on purpose: one pan, one person, under 20 minutes mostly.

import type { Recipe } from './recommend';

export type FullRecipe = Recipe & { minutes: number; pantry: string[]; steps: string[]; mine?: boolean };

export const RECIPES: FullRecipe[] = [
  {
    id: 'r-egg-fried-rice', name: '계란볶음밥', minutes: 10, ingredients: ['계란', '밥', '대파'], pantry: ['간장', '식용유', '소금'],
    steps: ['대파를 송송 썰어 기름에 볶아 파기름을 내요.', '계란을 넣고 스크램블해요.', '밥을 넣고 간장 1숟갈, 소금 조금으로 간해요.'],
  },
  {
    id: 'r-tofu-jorim', name: '두부조림', minutes: 15, ingredients: ['두부', '대파'], pantry: ['간장', '고춧가루', '설탕', '식용유'],
    steps: ['두부를 1cm로 썰어 앞뒤로 노릇하게 부쳐요.', '간장 2, 고춧가루 1, 설탕 0.5, 물 4숟갈을 섞어요.', '양념을 붓고 대파를 올려 졸여요.'],
  },
  {
    id: 'r-tofu-pan', name: '두부부침', minutes: 10, ingredients: ['두부', '계란'], pantry: ['소금', '식용유'],
    steps: ['두부를 썰어 소금을 살짝 뿌려요.', '계란물을 입혀 앞뒤로 부쳐요.'],
  },
  {
    id: 'r-rolled-omelet', name: '계란말이', minutes: 10, ingredients: ['계란', '쪽파'], pantry: ['소금', '식용유'],
    steps: ['계란 3개에 쪽파와 소금을 넣고 풀어요.', '약불에서 얇게 부어 끝에서부터 말아요.', '남은 계란물을 이어 부어 두툼하게 말아요.'],
  },
  {
    id: 'r-kimchi-stew', name: '김치찌개', minutes: 20, ingredients: ['김치', '돼지고기', '두부'], pantry: ['고춧가루', '식용유'],
    steps: ['돼지고기와 김치를 기름에 볶아요.', '물 2컵을 붓고 끓여요.', '두부를 넣고 5분 더 끓여요.'],
  },
  {
    id: 'r-kimchi-fried-rice', name: '김치볶음밥', minutes: 10, ingredients: ['김치', '밥', '계란'], pantry: ['식용유', '설탕'],
    steps: ['김치를 잘게 썰어 기름에 볶아요(설탕 한 꼬집).', '밥을 넣고 같이 볶아요.', '계란 프라이를 올려요.'],
  },
  {
    id: 'r-spam-kimchi', name: '햄김치볶음', minutes: 10, ingredients: ['햄', '김치'], pantry: ['식용유'],
    steps: ['햄을 깍둑썰어 볶아요.', '김치를 넣고 같이 볶아요.'],
  },
  {
    id: 'r-doenjang-stew', name: '된장찌개', minutes: 20, ingredients: ['애호박', '두부', '양파'], pantry: ['된장'],
    steps: ['물 2컵에 된장 1.5숟갈을 풀어 끓여요.', '양파, 애호박을 넣어요.', '두부를 넣고 5분 더 끓여요.'],
  },
  {
    id: 'r-onion-egg-bowl', name: '양파계란덮밥', minutes: 10, ingredients: ['양파', '계란', '밥'], pantry: ['간장', '설탕'],
    steps: ['양파를 채 썰어 물 반 컵, 간장 2, 설탕 1과 끓여요.', '계란을 풀어 둘러 붓고 뚜껑을 덮어요.', '밥 위에 올려요.'],
  },
  {
    id: 'r-mushroom-stirfry', name: '버섯볶음', minutes: 10, ingredients: ['버섯', '양파'], pantry: ['간장', '식용유'],
    steps: ['버섯과 양파를 썰어요.', '센불에 볶다가 간장 1숟갈로 마무리해요.'],
  },
  {
    id: 'r-jeyuk', name: '제육볶음', minutes: 20, ingredients: ['돼지고기', '양파', '대파'], pantry: ['고추장', '간장', '설탕', '식용유'],
    steps: ['고추장 2, 간장 1, 설탕 1로 양념을 만들어 고기를 버무려요.', '양파와 함께 볶아요.', '대파를 넣고 한 번 더 볶아요.'],
  },
  {
    id: 'r-bulgogi', name: '소불고기', minutes: 20, ingredients: ['소고기', '양파', '대파'], pantry: ['간장', '설탕', '참기름'],
    steps: ['간장 2, 설탕 1, 참기름 조금으로 고기를 재워요.', '양파와 함께 볶아요.', '대파를 넣고 마무리해요.'],
  },
  {
    id: 'r-chicken-breast-salad', name: '닭가슴살 샐러드', minutes: 10, ingredients: ['닭고기', '양상추', '토마토'], pantry: ['소금'],
    steps: ['닭가슴살을 구워 썰어요(훈제면 그대로).', '양상추와 토마토를 한입 크기로 썰어요.', '좋아하는 드레싱을 뿌려요.'],
  },
  {
    id: 'r-dak-galbi', name: '간단 닭갈비', minutes: 20, ingredients: ['닭고기', '양배추', '고구마'], pantry: ['고추장', '간장', '설탕'],
    steps: ['고추장 2, 간장 1, 설탕 1에 닭을 버무려요.', '양배추, 고구마와 함께 볶아요.', '고구마가 익으면 완성이에요.'],
  },
  {
    id: 'r-ramen-upgrade', name: '계란 파 라면', minutes: 5, ingredients: ['라면', '계란', '대파'], pantry: [],
    steps: ['물 550ml를 끓여 면과 스프를 넣어요.', '2분 뒤 계란과 대파를 넣어요.', '1분 더 끓여요.'],
  },
  {
    id: 'r-budae', name: '자취 부대찌개', minutes: 15, ingredients: ['햄', '소시지', '김치', '라면'], pantry: ['고춧가루'],
    steps: ['햄, 소시지, 김치를 냄비에 담아요.', '물 3컵과 라면 스프 반을 넣고 끓여요.', '면을 넣고 2분 더 끓여요.'],
  },
  {
    id: 'r-tteokbokki', name: '떡볶이', minutes: 15, ingredients: ['떡', '어묵', '대파'], pantry: ['고추장', '설탕', '고춧가루'],
    steps: ['물 1.5컵에 고추장 2, 설탕 1, 고춧가루 1을 풀어요.', '떡과 어묵을 넣고 졸여요.', '대파를 넣고 마무리해요.'],
  },
  {
    id: 'r-fishcake-stirfry', name: '어묵볶음', minutes: 10, ingredients: ['어묵', '양파'], pantry: ['간장', '설탕', '식용유'],
    steps: ['어묵과 양파를 썰어요.', '볶다가 간장 1, 설탕 0.5로 간해요.'],
  },
  {
    id: 'r-tuna-mayo', name: '참치마요덮밥', minutes: 5, ingredients: ['참치캔', '밥', '김'], pantry: ['마요네즈', '간장'],
    steps: ['참치 기름을 빼고 마요네즈, 간장을 조금 섞어요.', '밥 위에 올리고 김을 부숴 뿌려요.'],
  },
  {
    id: 'r-tuna-kimchi-rice', name: '참치김치볶음밥', minutes: 10, ingredients: ['참치캔', '김치', '밥'], pantry: ['식용유'],
    steps: ['김치를 볶다가 참치를 넣어요.', '밥을 넣고 같이 볶아요.'],
  },
  {
    id: 'r-steamed-egg', name: '계란찜', minutes: 10, ingredients: ['계란', '쪽파'], pantry: ['소금'],
    steps: ['계란 2개에 물 같은 양, 소금을 넣고 풀어요.', '전자레인지용 그릇에 담아 랩을 씌워요.', '2~3분 돌려요(30초씩 확인).'],
  },
  {
    id: 'r-bean-sprout-soup', name: '콩나물국', minutes: 15, ingredients: ['콩나물', '대파', '마늘'], pantry: ['소금'],
    steps: ['물 3컵에 콩나물을 넣고 뚜껑 덮어 끓여요.', '다진 마늘, 소금으로 간해요.', '대파를 넣고 1분 더 끓여요.'],
  },
  {
    id: 'r-spinach-namul', name: '시금치나물', minutes: 10, ingredients: ['시금치', '마늘'], pantry: ['소금', '참기름'],
    steps: ['시금치를 30초 데쳐 찬물에 헹궈 짜요.', '다진 마늘, 소금, 참기름으로 무쳐요.'],
  },
  {
    id: 'r-potato-stirfry', name: '감자볶음', minutes: 15, ingredients: ['감자', '양파'], pantry: ['소금', '식용유'],
    steps: ['감자를 채 썰어 물에 헹궈요.', '양파와 함께 볶다가 소금으로 간해요.'],
  },
  {
    id: 'r-zucchini-jeon', name: '애호박전', minutes: 15, ingredients: ['애호박', '계란'], pantry: ['소금', '식용유'],
    steps: ['애호박을 동그랗게 썰어 소금을 뿌려요.', '계란물을 입혀 부쳐요.'],
  },
  {
    id: 'r-kimchi-jeon', name: '김치전', minutes: 15, ingredients: ['김치', '양파'], pantry: ['식용유'],
    steps: ['김치와 양파를 잘게 썰어요.', '부침가루(또는 밀가루)와 물을 섞어 반죽해요.', '얇게 펴서 바삭하게 부쳐요.'],
  },
  {
    id: 'r-pajeon', name: '파전', minutes: 15, ingredients: ['쪽파', '계란'], pantry: ['식용유'],
    steps: ['쪽파를 프라이팬 길이로 잘라요.', '반죽을 얇게 붓고 쪽파를 올려요.', '계란을 풀어 위에 두르고 뒤집어요.'],
  },
  {
    id: 'r-cabbage-stirfry', name: '양배추 계란볶음', minutes: 10, ingredients: ['양배추', '계란'], pantry: ['소금', '식용유'],
    steps: ['양배추를 채 썰어 볶아요.', '계란을 넣고 섞어 소금으로 간해요.'],
  },
  {
    id: 'r-tomato-egg', name: '토마토 계란볶음', minutes: 10, ingredients: ['토마토', '계란', '대파'], pantry: ['소금', '설탕', '식용유'],
    steps: ['계란을 반숙으로 볶아 덜어요.', '대파와 토마토를 볶아요(설탕 한 꼬집).', '계란을 다시 넣고 소금으로 간해요.'],
  },
  {
    id: 'r-bacon-pasta', name: '베이컨 크림파스타', minutes: 15, ingredients: ['파스타면', '베이컨', '우유'], pantry: ['소금'],
    steps: ['면을 소금물에 삶아요.', '베이컨을 볶고 우유 1컵을 부어 졸여요.', '면을 넣고 섞어요(치즈가 있으면 더 좋아요).'],
  },
  {
    id: 'r-garlic-pasta', name: '알리오올리오', minutes: 15, ingredients: ['파스타면', '마늘'], pantry: ['식용유', '소금'],
    steps: ['면을 소금물에 삶아요(면수 조금 남기기).', '마늘을 편 썰어 기름에 약불로 볶아요.', '면과 면수를 넣고 섞어요.'],
  },
  {
    id: 'r-sausage-veg', name: '소시지야채볶음', minutes: 10, ingredients: ['소시지', '양파', '파프리카'], pantry: ['케첩', '식용유'],
    steps: ['소시지에 칼집을 내요.', '양파, 파프리카와 볶아요.', '케첩 2숟갈로 마무리해요.'],
  },
  {
    id: 'r-dumpling-soup', name: '만둣국', minutes: 10, ingredients: ['냉동만두', '계란', '대파'], pantry: ['간장'],
    steps: ['물 2컵을 끓여 만두를 넣어요.', '간장으로 간하고 계란을 풀어 넣어요.', '대파를 올려요.'],
  },
  {
    id: 'r-udon', name: '볶음우동', minutes: 10, ingredients: ['우동면', '양배추', '소시지'], pantry: ['간장', '굴소스', '식용유'],
    steps: ['소시지와 양배추를 볶아요.', '데친 우동면을 넣어요.', '간장 1, 굴소스 1로 볶아요.'],
  },
  {
    id: 'r-cheese-omelet-rice', name: '치즈 오므라이스', minutes: 15, ingredients: ['계란', '밥', '치즈'], pantry: ['케첩', '식용유'],
    steps: ['밥을 케첩에 볶아요(남은 채소가 있으면 같이).', '계란을 얇게 부쳐 밥을 감싸요.', '치즈를 올리고 녹여요.'],
  },
  {
    id: 'r-soft-tofu-stew', name: '순두부찌개', minutes: 15, ingredients: ['순두부', '계란', '대파'], pantry: ['고춧가루', '간장', '식용유'],
    steps: ['기름에 고춧가루 1숟갈과 대파를 볶아요.', '물 1컵, 간장 1을 넣고 순두부를 넣어요.', '계란을 깨 넣고 2분 더 끓여요.'],
  },
  {
    id: 'r-mackerel', name: '생선구이', minutes: 15, ingredients: ['생선'], pantry: ['식용유'],
    steps: ['생선의 물기를 닦아요.', '기름을 두르고 껍질부터 중약불로 구워요.', '뒤집어 속까지 익혀요.'],
  },
  {
    id: 'r-shrimp-fried-rice', name: '새우볶음밥', minutes: 10, ingredients: ['새우', '밥', '계란'], pantry: ['소금', '식용유'],
    steps: ['새우를 볶아요.', '계란 스크램블과 밥을 넣어요.', '소금으로 간해요.'],
  },
  {
    id: 'r-banana-toast', name: '바나나 토스트', minutes: 5, ingredients: ['식빵', '바나나'], pantry: ['잼'],
    steps: ['식빵을 구워요.', '바나나를 썰어 올려요(잼이나 땅콩버터와 잘 어울려요).'],
  },
  {
    id: 'r-egg-toast', name: '계란 토스트', minutes: 10, ingredients: ['식빵', '계란', '양배추'], pantry: ['케첩', '설탕', '식용유'],
    steps: ['양배추를 채 썰어 계란과 섞어 부쳐요.', '식빵 사이에 끼워요.', '케첩, 설탕을 살짝 뿌려요.'],
  },
  {
    id: 'r-yogurt-bowl', name: '요거트 볼', minutes: 3, ingredients: ['요거트', '블루베리'], pantry: [],
    steps: ['그릇에 요거트를 담아요.', '블루베리를 올려요(시리얼이 있으면 같이).'],
  },
];

// What can stand in for what (by dictionary name), for recipes and for "대체 가능" on a card.
export const SUBSTITUTES: Record<string, string[]> = {
  대파: ['쪽파', '부추', '양파'],
  쪽파: ['대파', '부추'],
  부추: ['쪽파', '대파'],
  우유: ['두유', '생크림'],
  돼지고기: ['소고기', '닭고기', '오리고기'],
  소고기: ['돼지고기', '오리고기'],
  닭고기: ['돼지고기'],
  애호박: ['가지', '양파'],
  양배추: ['양상추', '배추'],
  양상추: ['양배추', '상추'],
  시금치: ['청경채'],
  햄: ['소시지', '베이컨'],
  소시지: ['햄', '베이컨'],
  베이컨: ['햄', '소시지'],
  두부: ['순두부'],
  우동면: ['라면'],
  파스타면: ['우동면'],
  버섯: ['양파'],
  김치: [],
  치즈: ['크림치즈'],
  토마토: ['파프리카'],
  고구마: ['감자', '단호박'],
  감자: ['고구마'],
};
