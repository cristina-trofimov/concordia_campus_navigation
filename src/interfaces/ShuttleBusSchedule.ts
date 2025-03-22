export interface ShuttleTime {
    departureTime: string;
    arrivalTime: string;
  }
  
  export interface ShuttleStation {
    name: string;
    address: string;
    station: string;
  }
  
  export interface ShuttleSchedule {
    schedule: {
      "monday-thursday": {
        SGW_to_LOY: ShuttleTime[];
        LOY_to_SGW: ShuttleTime[];
      };
      "friday": {
        SGW_to_LOY: ShuttleTime[];
        LOY_to_SGW: ShuttleTime[];
      };
      "weekend": {
        info: string;
      };
    };
    locations: {
      SGW: ShuttleStation;
      LOY: ShuttleStation;
    };
    notes: string[];
  }
  
  export interface ShuttleInfo {
    from: {
      campus: string;
      name: string;
      station: string;
    };
    to: {
      campus: string;
      name: string;
      station: string;
    };
    departureTime: string;
    arrivalTime: string;
    minutesUntilDeparture: number;
    isRunning: boolean;
    status: string;
  }
  
  export interface ShuttleUnavailableInfo {
    message: string;
    isRunning: false;
  }
  
  export type ShuttleResult = ShuttleInfo | ShuttleUnavailableInfo;