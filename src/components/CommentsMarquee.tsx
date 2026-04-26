import { Marquee } from "./ui/marquee";
import { cn } from "@/lib/utils";

const REVIEWS = [
  {
    name: "Carlos Rivera",
    stars: 5,
    body: "Los mejores makis de Chorrillos. El sabor del acevichado es increíble y la atención es súper rápida.",
    img: "https://avatar.vercel.sh/jack",
  },
  {
    name: "Lucía Mendoza",
    stars: 4,
    body: "Muy buenos los combos, el de 50 piezas sale muy a cuenta para compartir. El local es acogedor aunque a veces se llena.",
    img: "https://avatar.vercel.sh/jill",
  },
  {
    name: "Jorge Luis Espinoza",
    stars: 5,
    body: "Excelente fusión nikkei. El maki Brasa Roll es una locura, sabe a pollo a la brasa de verdad. Recomendado.",
    img: "https://avatar.vercel.sh/john",
  },
  {
    name: "Andrea V.",
    stars: 5,
    body: "Mi lugar favorito para pedir delivery. Llega todo bien empacado y las piezas son de buen tamaño.",
    img: "https://avatar.vercel.sh/jane",
  },
  {
    name: "Ricardo Torres",
    stars: 3,
    body: "La comida es rica pero el tiempo de espera para el delivery fue de casi una hora un viernes por la noche.",
    img: "https://avatar.vercel.sh/jenny",
  },
  {
    name: "Mariana Pazos",
    stars: 5,
    body: "Los makis fritos son lo mejor, calientitos y crujientes. El personal es muy amable.",
    img: "https://avatar.vercel.sh/jane",
  },
  {
    name: "Diego Sánchez",
    stars: 4,
    body: "Buena relación calidad-precio. Los sabores son variados y los ingredientes se sienten frescos.",
    img: "https://avatar.vercel.sh/john",
  },
  {
    name: "Fiorella G.",
    stars: 5,
    body: "Me encantó el Gaucho roll. La combinación con el lomo está en su punto.",
    img: "https://avatar.vercel.sh/jane",
  },
  {
    name: "Sebastian Ruiz",
    stars: 4,
    body: "Local pequeño pero con mucho sabor. Las promociones de los días de semana valen mucho la pena.",
    img: "https://avatar.vercel.sh/john",
  },
  {
    name: "Carla Benavides",
    stars: 5,
    body: "Pedimos el Box Infarto y quedamos satisfechos. Muy buena presentación.",
    img: "https://avatar.vercel.sh/jane",
  },
  {
    name: "Pedro Alva",
    stars: 5,
    body: "El mejor acevichado que he probado por esta zona. La salsa tiene el toque justo de picante.",
    img: "https://avatar.vercel.sh/john",
  },
  {
    name: "Jimena L.",
    stars: 2,
    body: "La comida es buena pero el local es muy ruidoso y demoraron mucho en traernos la cuenta.",
    img: "https://avatar.vercel.sh/jane",
  },
  {
    name: "Renzo Castro",
    stars: 5,
    body: "Atención impecable. Fui por mi cumpleaños y me invitaron un postre pequeño. Detallazo.",
    img: "https://avatar.vercel.sh/john",
  },
  {
    name: "Paola Montenegro",
    stars: 4,
    body: "Variedad de sabores innovadores. El maki de huancaína me sorprendió gratamente.",
    img: "https://avatar.vercel.sh/jane",
  },
  {
    name: "Manuel Farfán",
    stars: 5,
    body: "Súper recomendado para los amantes del sushi fusionado con sabores peruanos.",
    img: "https://avatar.vercel.sh/john",
  },
  {
    name: "Sofía Tello",
    stars: 3,
    body: "Los makis son ricos pero las piezas se deshacían un poco al agarrarlas con los palitos.",
    img: "https://avatar.vercel.sh/jane",
  },
  {
    name: "Hugo Delgado",
    stars: 5,
    body: "Gran opción en Cedros de Villa. Siempre pido para llevar y nunca fallan.",
    img: "https://avatar.vercel.sh/john",
  },
  {
    name: "Natalia Reátegui",
    stars: 4,
    body: "Me gustaron mucho las alitas acevichadas como entrada. Los makis cumplen bien.",
    img: "https://avatar.vercel.sh/jane",
  },
  {
    name: "Hugo Delgado",
    stars: 5,
    body: "Gran opción en Cedros de Villa. Siempre pido para llevar y nunca fallan.",
    img: "https://avatar.vercel.sh/john",
  },
  {
    name: "Natalia Reátegui",
    stars: 4,
    body: "Me gustaron mucho las alitas acevichadas como entrada. Los makis cumplen bien.",
    img: "https://avatar.vercel.sh/jane",
  },
];

const firstRow = REVIEWS.slice(0, 6);
const secondRow = REVIEWS.slice(6, 12);
const thirdRow = REVIEWS.slice(12);

const ReviewCard = ({
  img,
  name,
  stars,
  body,
}: {
  img: string;
  name: string;
  stars: number;
  body: string;
}) => {
  return (
    <figure
      className={cn(
        "relative h-full w-70 sm:w-80 md:w-87.5 lg:w-80 cursor-pointer overflow-hidden rounded-xl border p-4 transition-colors",
        // light styles
        "border-gray-50/10 bg-gray-50/10 hover:bg-gray-50/15",
      )}
    >
      <div className="flex flex-row items-center gap-2">
        <img className="rounded-full" width="32" height="32" alt="" src={img} />
        <div className="flex flex-col">
          <figcaption className="text-sm font-medium">{name}</figcaption>
          <div className="flex flex-row gap-0.5">
            {[...Array(5)].map((_, i) => (
              <span
                key={i}
                className={i < stars ? "text-yellow-400" : "text-gray-400"}
              >
                ★
              </span>
            ))}
          </div>
        </div>
      </div>
      <blockquote className="mt-2 text-sm">{body}</blockquote>
    </figure>
  );
};

export function CommentsMarquee() {
  return (
    <section className="py-8 bg-[#110a00]">
      <div className="mb-6 xl:mb-16 text-center">
        <h2 className="text-4xl md:text-3xl font-semibold text-red-400 mb-4">
          お客様の声
        </h2>
        <p
          className="text-5xl text-white uppercase tracking-wider"
          style={{ fontFamily: "Bebas Neue, sans-serif" }}
        >
          Amantes del sushi opinan
        </p>
      </div>
      <div className="relative flex h-100 xl:h-125 w-full flex-col items-center justify-center overflow-hidden xl:hidden">
        <Marquee pauseOnHover className="[--duration:40s]">
          {REVIEWS.slice(0, 10).map((review, index) => (
            <ReviewCard key={`${review.name}-${index}`} {...review} />
          ))}
        </Marquee>
        <Marquee reverse pauseOnHover className="[--duration:40s]">
          {REVIEWS.slice(11).map((review, index) => (
            <ReviewCard key={`${review.name}-${index}`} {...review} />
          ))}
        </Marquee>
        <div className="from-[#110a00] pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-linear-to-r"></div>
        <div className="from-[#110a00] pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-linear-to-l"></div>
      </div>
      <div className="relative hidden xl:flex h-125 w-full flex-row items-center justify-center overflow-hidden">
        <Marquee pauseOnHover vertical className="[--duration:30s]">
          {firstRow.map((review, index) => (
            <ReviewCard key={`${review.name}-${index}`} {...review} />
          ))}
        </Marquee>
        <Marquee reverse pauseOnHover vertical className="[--duration:30s]">
          {secondRow.map((review, index) => (
            <ReviewCard key={`${review.name}-${index}`} {...review} />
          ))}
        </Marquee>
        <Marquee pauseOnHover vertical className="[--duration:30s]">
          {thirdRow.map((review, index) => (
            <ReviewCard key={`${review.name}-${index}`} {...review} />
          ))}
        </Marquee>
        <div className="from-[#110a00] pointer-events-none absolute inset-x-0 top-0 h-1/4 bg-linear-to-b"></div>
        <div className="from-[#110a00] pointer-events-none absolute inset-x-0 bottom-0 h-1/4 bg-linear-to-t"></div>
      </div>
    </section>
  );
}
