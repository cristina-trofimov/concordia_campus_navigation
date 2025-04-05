import { RoomInfo } from "../interfaces/RoomInfo";

export const getIndoorDirectionText = (
    originFloor: RoomInfo | null,
    destinationFloor: RoomInfo | null,
    transportMethod: string
): [string, string] => {
    const transport = transportMethod;

    const destinationNum = destinationFloor ? parseInt(destinationFloor.floor) : NaN;
    const originNum = originFloor ? parseInt(originFloor.floor) : NaN;

    // Only origin room, no destination
    if (!destinationFloor && originFloor) {
        return [`Take the ${transport} down to exit the campus.`, ""];
    }



    // Only destination room, no origin
    if (!originFloor && destinationFloor) {
        return [`Take the ${transport} up to floor ${destinationNum}.`, ""];
    }

    

    // Same floor
    if (!isNaN(originNum) && !isNaN(destinationNum) && originNum === destinationNum) {
        return [
            `You are already on floor ${originNum}.`,
            `Please follow the route outlined on this floor.`,
        ];
    }

    const direction = originNum < destinationNum ? "up" : "down";

    if (originFloor && destinationFloor) {
    return [
        `Take the ${transport} ${direction} from floor ${originNum} to floor ${destinationNum}.`,
        `Please follow the route outlined on floor ${destinationNum}.`,
    ];}
    else {return ["", ""];}
};

export default getIndoorDirectionText;
