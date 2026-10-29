// Recipe recommendation: which recipes to show, and in what order.
// Order (what the user asked for): recipes that use an ingredient about to run out come first, soonest first;
// at the same urgency, the user's own and bookmarked recipes come before the rest. Then fewer missing ingredients,
// then more of the fridge used.

export type Stock = { name: string; daysLeft: number }; // daysLeft until the date it is safe to eat
export type Recipe = { id: string; name: string; ingredients: string[]; mine?: boolean; saved?: boolean };
export type Substitutes = Record<string, string[]>; // 대파 → [쪽파, 양파]

// An ingredient this close (in days) to its safe-to-eat date makes a recipe "urgent".
export const URGENT_DAYS = 3;
// Recipes missing more than this many ingredients are not shown.
export const MAX_MISSING = 1;

export type Match = {
  recipe: Recipe;
  missing: string[];
  swaps: { need: string; use: string }[]; // ingredients covered by a substitute
  used: number; // fridge items the recipe uses
  urgentIn: number | null; // days left on the most urgent item it uses, if within URGENT_DAYS
};

// The user's own recipes and the ones they bookmarked rank the same.
const favored = (r: Recipe) => !!(r.mine || r.saved);

export function recommend(recipes: Recipe[], stock: Stock[], subs: Substitutes = {}): Match[] {
  // Food past its safe-to-eat date is never suggested as an ingredient.
  const have = new Map<string, number>();
  for (const s of stock) {
    if (s.daysLeft < 0) continue;
    const prev = have.get(s.name);
    have.set(s.name, prev == null ? s.daysLeft : Math.min(prev, s.daysLeft));
  }

  const matches: Match[] = [];
  for (const recipe of recipes) {
    const missing: string[] = [];
    const swaps: Match['swaps'] = [];
    const days: number[] = [];
    for (const need of recipe.ingredients) {
      if (have.has(need)) {
        days.push(have.get(need)!);
        continue;
      }
      // Of the substitutes on hand, use the one that runs out first, so it gets eaten.
      // A substitute must not be something the recipe already uses (애호박 → 양파 when 양파 is already in it).
      const options = (subs[need] ?? []).filter((s) => have.has(s) && !recipe.ingredients.includes(s)).sort((a, b) => have.get(a)! - have.get(b)!);
      if (options.length) {
        swaps.push({ need, use: options[0] });
        days.push(have.get(options[0])!);
      } else {
        missing.push(need);
      }
    }
    if (missing.length > MAX_MISSING || days.length === 0) continue;
    const soonest = Math.min(...days);
    matches.push({ recipe, missing, swaps, used: days.length, urgentIn: soonest <= URGENT_DAYS ? soonest : null });
  }

  return matches.sort(
    (a, b) =>
      (a.urgentIn ?? Infinity) - (b.urgentIn ?? Infinity) ||
      Number(favored(b.recipe)) - Number(favored(a.recipe)) ||
      a.missing.length - b.missing.length ||
      b.used - a.used,
  );
}
