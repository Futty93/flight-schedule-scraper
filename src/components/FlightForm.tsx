"use client";

import { useState } from "react";

interface FlightFormProps {
    addFlight: (date: string, flightNumber: string) => void;
    addBulkFlights?: (flights: { date: string; flightNumber: string }[]) => void;
}

export default function FlightForm({ addFlight, addBulkFlights }: FlightFormProps) {
    const [date, setDate] = useState('');
    const [flightNumber, setFlightNumber] = useState('');
    const [bulkInput, setBulkInput] = useState('');
    const [showBulkInput, setShowBulkInput] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (date && flightNumber) {
            addFlight(date, flightNumber);
            setFlightNumber('');
        }
    };

    // JavaScriptのオブジェクトリテラル形式をJSONに変換する関数
    const convertToValidJson = (input: string): string => {
        // 1. プロパティ名をダブルクォートで囲む (例: date: -> "date":)
        let converted = input.replace(/(\w+):/g, '"$1":');

        // 2. シングルクォートをダブルクォートに変換 (例: '2025-05-22' -> "2025-05-22")
        converted = converted.replace(/'/g, '"');

        return converted;
    };

    const handleBulkImport = (e: React.FormEvent) => {
        e.preventDefault();
        if (!bulkInput.trim()) return;

        try {
            // 入力されたテキストを整形：先頭と末尾の不要な文字を削除
            let cleanedInput = bulkInput.trim();

            // 既に配列形式になっているか確認（[...]で囲まれている場合）
            if (!cleanedInput.startsWith('[') && !cleanedInput.endsWith(']')) {
                // 配列形式でなければ、配列に変換
                cleanedInput = `[${cleanedInput}]`;
            }

            // 末尾のカンマを削除（JSON構文エラーの原因になる）
            cleanedInput = cleanedInput.replace(/,\s*]$/, ']');
            console.log(cleanedInput);

            // JavaScriptオブジェクトリテラル形式を有効なJSONに変換
            const validJsonString = convertToValidJson(cleanedInput);

            console.log(validJsonString);

            // JSONとして解析
            const flights = JSON.parse(validJsonString);
            console.log(flights);

            if (Array.isArray(flights)) {
                // 正常に配列として解析できた場合
                const validFlights = flights.filter(flight => flight.date && flight.flightNumber);

                // addBulkFlightsが提供されている場合はそちらを使用
                if (addBulkFlights && validFlights.length > 0) {
                    addBulkFlights(validFlights);
                    setBulkInput('');
                    setShowBulkInput(false);
                } else {
                    // 後方互換性のため、個別にaddFlightを呼び出す
                    validFlights.forEach(flight => {
                        console.log(flight);
                        addFlight(flight.date, flight.flightNumber);
                        console.log(flight.date, flight.flightNumber);
                    });
                    setBulkInput('');
                    setShowBulkInput(false);
                }
            } else {
                alert('有効なJSON形式ではありません。フライト情報を配列形式で入力してください。');
            }
        } catch (error) {
            console.error('JSON解析エラー:', error);
            alert('JSONの解析に失敗しました。正しい形式で入力してください。');
        }
    };

    return (
        <div className="mb-4 bg-white dark:bg-gray-900 p-4 rounded-lg shadow">
            <form onSubmit={handleSubmit} className="flex space-x-2 mb-4">
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

            <div className="flex items-center justify-between mb-2">
                <button
                    onClick={() => setShowBulkInput(!showBulkInput)}
                    className="text-blue-500 hover:text-blue-700 flex items-center text-sm"
                >
                    {showBulkInput ? '一括インポートを隠す' : '一括インポートを表示'}
                </button>
            </div>

            {showBulkInput && (
                <form onSubmit={handleBulkImport} className="mt-4">
                    <textarea
                        value={bulkInput}
                        onChange={(e) => setBulkInput(e.target.value)}
                        placeholder={`{ date: '2025-05-22', flightNumber: '711' },\n{ date: '2025-05-22', flightNumber: '714' },\n{ date: '2025-05-22', flightNumber: '109' }`}
                        className="w-full h-40 border p-2 rounded-md bg-gray-100 dark:bg-gray-700 dark:text-white dark:border-gray-600 font-mono text-sm"
                    />
                    <button
                        type="submit"
                        className="w-full mt-2 bg-green-500 dark:bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-600 dark:hover:bg-green-700 transition"
                    >
                        一括追加
                    </button>
                </form>
            )}
        </div>
    );
}
