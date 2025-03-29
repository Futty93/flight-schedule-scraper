"use client";

interface FlightListProps {
    flights: { date: string; flightNumber: string }[];
    removeFlight: (index: number) => void;
}

export default function FlightList({ flights, removeFlight }: FlightListProps) {
    return (
        <ul className="mb-4 overflow-y-auto border rounded-lg bg-white dark:bg-gray-900 p-4 shadow-md">
            {flights.map((flight, index) => (
                <li key={index} className="flex justify-between items-center p-3 border-b last:border-none dark:border-gray-700">
                    <span className="text-gray-700 dark:text-gray-300 font-medium">
                        {flight.date} - {flight.flightNumber}
                    </span>
                    <button
                        onClick={() => removeFlight(index)}
                        className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition"
                    >
                        削除
                    </button>
                </li>
            ))}
        </ul>
    );
}
