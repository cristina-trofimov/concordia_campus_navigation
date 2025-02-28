import axios from 'axios';

interface Coords {
    latitude: number;
    longitude: number;
}

const GOOGLE_MAPS_API_KEY = "AIzaSyDVeg6jawwGFbwdBH7y_qlpXfXuZkkLtUU";

async function getDirections(origin: string, destination: string, mode:string): Promise<Coords[] | null> {
    try {
        const response = await axios.get('https://maps.googleapis.com/maps/api/directions/json', {
            params: {
                origin,
                destination,
                mode,
                key: GOOGLE_MAPS_API_KEY,
            },
        });

        if (response.data.status === 'OK') {
            const routes = response.data.routes;
            if (routes && routes.length > 0) {
                return routes;
            } else {
                console.error("No routes found.");
                return null;
            }
        } else {
            console.error("Directions API Error:", response.data.status);
            return null;
        }
    } catch (error) {
        console.error("Error fetching directions:", error);
        return null;
    }
}

export default getDirections;