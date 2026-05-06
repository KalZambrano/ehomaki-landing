import { Map, MapControls, MapMarker, MarkerContent } from "../ui/map";
import { Star, Clock } from "lucide-react";
import { MarkerLabel, MarkerPopup } from "../ui/map";
import { useState } from "react";

const styles = {
  default: undefined,
  openstreetmap: "https://tiles.openfreemap.org/styles/bright",
};

type StyleKey = keyof typeof styles;

export function EhomakiMap() {
  const [style, setStyle] = useState<StyleKey>("default");
  const selectedStyle = styles[style];

  return (
    <div className="h-70 md:h-157.5 min-w-75 w-full">
      <Map
        center={[-77.01358787855044, -12.20456994618187]}
        zoom={16}
        className="w-full h-full"
        styles={
          selectedStyle
            ? { light: selectedStyle, dark: selectedStyle }
            : undefined
        }
      >
        <div className="absolute top-2 left-2 z-10">
          <label htmlFor="map-style" className="sr-only">
            Cambiar estilo del mapa
          </label>
          <select
            id="map-style"
            value={style}
            onChange={(e) => setStyle(e.target.value as StyleKey)}
            className="border-gray-600 bg-gray-800 text-white hover:bg-gray-700 rounded-md border px-2 py-1 text-sm shadow focus:ring-1 focus:ring-white"
          >
            <option value="default">Oscuro (Carto)</option>
            <option value="openstreetmap">Tradicional (OSM)</option>
          </select>
        </div>
        <MapMarker longitude={-77.01358787855044} latitude={-12.20456994618187}>
          <MarkerContent>
            <div
              className={`size-5 cursor-pointer rounded-full border-2 ${style === "default" ? "border-white" : "border-gray-700"} bg-rose-500 shadow-lg transition-transform hover:scale-110`}
            />
            <MarkerLabel
              position="bottom"
              className={`font-medium ${style === "default" ? "text-white" : "text-black"}`}
            >
              Ehomakis
            </MarkerLabel>
          </MarkerContent>
          <MarkerPopup className="w-62 p-0 bg-[#171717] border-gray-800">
            <div className="relative h-32 overflow-hidden rounded-t-md">
              <img
                src="/og-wallpaper.png"
                alt="Ehomakis Map"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="space-y-2 p-3">
              <div>
                <p className="text-gray-300 pb-0.5 text-[11px] font-medium tracking-wide uppercase">
                  Restaurante
                </p>
                <h3 className="text-white leading-tight font-semibold">
                  Ehomakis Sushi Bar
                </h3>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="flex items-center gap-1">
                  <Star className="size-3.5 fill-amber-400 text-amber-400" />
                  <span className="font-medium text-gray-200">4.5</span>
                  <span className="text-gray-400">(160)</span>
                </div>
              </div>
              <div className="text-gray-300 flex items-center gap-1.5 text-sm">
                <Clock className="size-3.5" />
                <span className="text-gray-200">12:00 - 22:00</span>
              </div>
            </div>
          </MarkerPopup>
        </MapMarker>
        <MapControls position="top-right" showZoom showFullscreen />
      </Map>
    </div>
  );
}
