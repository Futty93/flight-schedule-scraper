"use client";

import { useState } from "react";

interface FlightFormProps {
    addFlight: (date: string, flightNumber: string) => void;
}

export default function FlightForm({ addFlight }: FlightFormProps) {
    const [date, setDate] = useState('');
    const [flightNumber, setFlightNumber] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (date && flightNumber) {
            addFlight(date, flightNumber);
            setFlightNumber('');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="mb-4 flex space-x-2 bg-white dark:bg-gray-900 p-4 rounded-lg shadow">
            <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="border p-2 rounded-md bg-gray-100 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                required
            />
            <input
                type="text"
                value={flightNumber}
                onChange={(e) => setFlightNumber(e.target.value)}
                placeholder="便名 (3桁)"
                className="border p-2 rounded-md bg-gray-100 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                required
            />
            <button type="submit" className="bg-blue-500 dark:bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-600 dark:hover:bg-blue-700 transition">
                追加
            </button>
        </form>
    );
}