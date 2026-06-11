export type ColorBlindnessType =
    | "normal"
    | "protanopia"
    | "deuteranopia"
    | "tritanopia";

export const FILTERS: {
    id: ColorBlindnessType;
    label: string;
    description: string;
}[] = [
        { id: "normal", label: "Normal", description: "Sin filtro" },
        { id: "protanopia", label: "Protanopia", description: "Ceguera al rojo" },
        {
            id: "deuteranopia",
            label: "Deuteranopia",
            description: "Ceguera al verde",
        },
        { id: "tritanopia", label: "Tritanopia", description: "Ceguera al azul" },
    ];

export const FONT_SIZES = [
    { value: 100, label: "T", size: "text-sm" },
    { value: 110, label: "T", size: "text-base" },
    { value: 125, label: "T", size: "text-xl" },
    { value: 150, label: "T", size: "text-3xl" },
];