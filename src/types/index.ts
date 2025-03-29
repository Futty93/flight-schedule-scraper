export interface FlightInfo {
    date: string;        // フライトの日付 (例: "2025/03/29")
    flightNumber: string; // フライト番号 (例: "003")
    departure: string;   // 出発地 (例: "HND")
    arrival: string;     // 到着地 (例: "FUK")
    depTime: string;     // 出発時刻 (例: "10:30")
    arrTime: string;     // 到着時刻 (例: "12:30")
}

export interface Flight {
    date: string;
    flightNumber: string;
};