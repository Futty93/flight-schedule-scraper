'use client';

import FlightForm from '@/components/FlightForm';
import FlightList from '@/components/FlightList';
import DownloadButton from '@/components/DownloadButton';
import { useState } from 'react';

export default function Home() {
  const [flights, setFlights] = useState<{ date: string; flightNumber: string }[]>([]);

  const addFlight = (date: string, flightNumber: string) => {
    if (flights.length < 70) {
      setFlights(prevFlights => [...prevFlights, { date, flightNumber }]);
    }
  };

  const addBulkFlights = (newFlights: { date: string; flightNumber: string }[]) => {
    setFlights(prevFlights => {
      const combinedFlights = [...prevFlights];

      // 最大70件までの制限を守りながら追加
      for (const flight of newFlights) {
        if (combinedFlights.length < 70) {
          combinedFlights.push(flight);
        } else {
          break;
        }
      }

      return combinedFlights;
    });
  };

  const removeFlight = (index: number) => {
    setFlights(flights.filter((_, i) => i !== index));
  };

  return (
      <main className="container mx-auto max-w-xl p-6 bg-white dark:bg-gray-950 dark:text-white rounded-lg shadow-lg">
          <h1 className="text-3xl font-bold tracking-wide mb-6 text-center">
              フライトスケジュールスクレイピング
          </h1>
          <div className="flex flex-col gap-6">
              <FlightForm addFlight={addFlight} addBulkFlights={addBulkFlights}/>
              <FlightList flights={flights} removeFlight={removeFlight}/>
              {flights.length > 0 && <DownloadButton flights={flights}/>}
          </div>
      </main>
  );
}
