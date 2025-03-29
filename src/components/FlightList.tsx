"use client";

interface FlightListProps {
    flights: { date: string; flightNumber: string }[];
    removeFlight: (index: number) => void;
}

export default function FlightList({ flights, removeFlight }: FlightListProps) {
    return (
        <ul className="mb-4 overflow-y-auto border p-2">
            {flights.map((flight, index) => (
                <li key={index} className="flex justify-between p-2 border-b">
                    {flight.date} - {flight.flightNumber}
                    <button onClick={() => removeFlight(index)} className="text-red-500">削除</button>
                </li>
            ))}
        </ul>
    );
}
