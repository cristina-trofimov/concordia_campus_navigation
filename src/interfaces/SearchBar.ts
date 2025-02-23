
export interface Prediction {
    description: string;
    place_id: string;
}

export interface SearchBarProps {
    placeholder: string;
    onSelect: (selectedPlace: string, coords: any) => void;
    setCoords: any;
}