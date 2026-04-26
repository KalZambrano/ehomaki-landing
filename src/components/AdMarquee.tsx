import { Marquee } from "./ui/marquee";
import { cn } from "@/lib/utils";

const MARQUEE_ITEMS = [
  "Acevichado",
  "Furai Roll",
  "Gaucho",
  "Huancaína Roll",
  "Brasa Roll",
  "Seiji",
  "Box Infarto 30pz",
  "Delivery Diario",
];

export function AdMarquee() {
  return (
    <Marquee className="bg-(--gold)">
      {MARQUEE_ITEMS.map((item) => (
        <div key={item} className="flex items-center">
          <span className="text-lg font-bold px-4 whitespace-nowrap">
            {item}
          </span>

          <span className="mx-2 opacity-50">✦</span>
        </div>
      ))}
    </Marquee>
  );
}
