'use client';

import FlightForm from '@/components/FlightForm';
import FlightList from '@/components/FlightList';
import DownloadButton from '@/components/DownloadButton';
import { useState } from 'react';

export default function Home() {
  const [flights, setFlights] = useState<{ date: string; flightNumber: string }[]>([]);

  const addFlight = (date: string, flightNumber: string) => {
    if (flights.length < 70) {
      setFlights([...flights, { date, flightNumber }]);
    }
  };

  const removeFlight = (index: number) => {
    setFlights(flights.filter((_, i) => i !== index));
  };

  return (
      <main className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">フライトスケジュールスクレイピング</h1>
        <FlightForm addFlight={addFlight} />
        <FlightList flights={flights} removeFlight={removeFlight} />
        {flights.length > 0 && <DownloadButton flights={flights} />}
      </main>
  );
}
