export const getIndoorDirectionText = (
    originFloor: string,
    destinationFloor: string,
    transportMethod: string
): string => {

    const originNum = parseInt(originFloor);
    const destinationNum = parseInt(destinationFloor);

    if ((originNum) && (destinationNum) && originNum === destinationNum) {
        return `You are already on floor ${originFloor}\n Please follow the route outline on floor ${destinationFloor} .`;
    }

    let direction: string = "";
    if ((originNum) && (destinationNum)) {
        direction = originNum < destinationNum ? "up" : "down";
    }

    const transport = transportMethod;

    direction= `Take the ${transport} ${direction} from floor ${originFloor} to floor ${destinationFloor}\n Please follow the route outline on floor ${destinationFloor}`
    return direction;
        
};

export default getIndoorDirectionText;