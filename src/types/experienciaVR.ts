export interface DishTopping {
  style: "drape" | "crispy" | "sauceCap";
  color: number;
}

export interface DishDrizzle {
  style: "zigzag";
  color: number;
}

export interface DishGarnish {
  type: "chili" | "sesame" | "herb";
  color: number;
  count?: number;
}

export interface Dish {
  id: string;
  nombre: string;
  categoria: string;
  kanji: string;
  ingredientes: string;
  img: string;
  precio?: number;
  riceColor?: number;
  fillingColor: number;
  fillingColor2?: number;
  topping: DishTopping | null;
  drizzle: DishDrizzle | null;
  garnish: DishGarnish[];
}
