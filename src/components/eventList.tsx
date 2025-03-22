import axios from "axios";
import { Text, TouchableOpacity, View } from "react-native";


export const listCalendars = async (accessToken: any) => {
    try {
        const response = await axios({
            method: 'GET',
            url: `https://www.googleapis.com/calendar/v3/calendars/primary/events`,
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            }
        });

        return response.data.items;
    } catch (error) {
        console.error('Error listing calendars:', error);
    }
};



interface CalendarSummaryIdDict {
    [id: string]: string;
}

interface Calendars {
    id: string;
    summary: string;
}

export const allCalendars = async (accessToken: any): Promise<Calendars[]> => {

    try {
        const response = await axios({
            method: 'GET',
            url: `https://www.googleapis.com/calendar/v3/users/me/calendarList`,
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        const items: Calendars[] = response.data.items;

        if (!items) {
            return [];
        }

        const summaryIdDict: CalendarSummaryIdDict = {};
        items.forEach((item) => {
            if (item.summary && item.id) {
                summaryIdDict[item.id] = item.summary;
            }
        });

        return items;
    } catch (error) {
        console.error('Error listing calendars:', error);
        return [];
    }
};





interface ButtonDictionaryProps {
    data: Record<string, string>;
    onButtonPress: (key: string) => void;
    token : string;
}

const ButtonDictionary: React.FC<ButtonDictionaryProps> = ({ data, onButtonPress, token }) => {


    // const calendars = callAllCalendars(token);
    return (
        <View>

            {Object.entries(data).map(([key, value]) => (
                <TouchableOpacity
                    key={key}
                    onPress={() => onButtonPress(key)}
                >
                    <Text>{value}</Text>
                </TouchableOpacity> // Close TouchableOpacity
            ))}
        </View>
    );
};


