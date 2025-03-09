
export interface Prediction {
    description: string;
    place_id: string;
}

export interface SearchBarProps {
    placeholder: string;
    onSelect: (place: string, coords: { latitude: number; longitude: number }) => void;
    setCoords: (coords: { latitude: number; longitude: number }) => void;
    defaultValue?: string | null;
    showClearButton?: boolean;
    onClear?: () => void;
}