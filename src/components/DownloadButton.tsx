"use client";
import { useState } from "react";
import { saveAs } from 'file-saver';
import { FlightInfo } from "@/types";

interface DownloadButtonProps {
    flights: { date: string; flightNumber: string }[];
}

export default function DownloadButton({ flights }: DownloadButtonProps) {
    const [loading, setLoading] = useState(false);

    const handleDownload = async () => {
        console.log("Download button clicked");
        setLoading(true);

        try {
            // API への POST リクエスト
            const response = await fetch("/api/scrape", {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ flights }),
            });

            if (!response.ok) {
                throw new Error("Failed to fetch flight schedules");
            }

            const data = await response.json();
            console.log("Fetched flight data:", data);

            // **修正**: airport_addresses.json を fetch で取得
            const airportResponse = await fetch("/airport_addresses.json"); // 修正
            if (!airportResponse.ok) {
                throw new Error("Failed to load airport data");
            }
            const airportData = await airportResponse.json(); // 修正
            console.log("Loaded airport data:", airportData); // 修正 (デバッグ出力)

            // .ics 生成
            const icsContent = generateICS(data, airportData);

            // Blob を作成してダウンロード
            const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
            saveAs(blob, "flights.ics");

        } catch (error) {
            console.error("Error downloading ICS:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleDownload}
            className={`relative flex items-center justify-center px-6 py-3 text-white font-semibold rounded-lg transition-all duration-300
                ${loading ? "bg-gray-500 cursor-not-allowed" : "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"}
                shadow-lg hover:shadow-xl`}
            disabled={loading}
        >
            {loading ? (
                <>
                    <span
                        className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></span>
                    ダウンロード中...
                </>
            ) : (
                ".ics ダウンロード"
            )}
        </button>
    );
}

// `.ics` フォーマットに変換
function generateICS(flights: FlightInfo[], airportData: Record<string, any>): string { // 修正
    const icsEntries = flights.map(({date, flightNumber, departure, arrival, depTime, arrTime}) => {
        const depDateTime = new Date(`${date}T${convertTo24Hour(depTime)}:00`);
        let arrDateTime = new Date(`${date}T${convertTo24Hour(arrTime)}:00`);

        // 到着時間が出発時間より前なら翌日に調整
        if (arrDateTime < depDateTime) {
            arrDateTime.setDate(arrDateTime.getDate() + 1);
        }

        const location = airportData[arrival] // 修正
            ? `${airportData[arrival].name} (${arrival}) - ${airportData[arrival].postal_code} - ${airportData[arrival].address}`
            : "Unknown";

        return `
BEGIN:VEVENT
SUMMARY:BC${flightNumber}
DESCRIPTION:${departure} → ${arrival}
DTSTART:${formatICSDate(depDateTime)}
DTEND:${formatICSDate(arrDateTime)}
LOCATION:${location}
END:VEVENT
        `.trim();
    });

    return [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//Flight Scheduler//EN",
        ...icsEntries,
        "END:VCALENDAR"
    ].join("\n");
}

// 場所入りの時間（例: "16:55(羽田)"）を24時間表記に変換
function convertTo24Hour(timeStr: string): string {
    return timeStr.match(/\d{2}:\d{2}/)?.[0] || "00:00";
}

// Date を `.ics` フォーマット (UTC) に変換
function formatICSDate(date: Date): string {
    return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}
