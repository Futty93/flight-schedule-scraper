"use server"
import puppeteer from "puppeteer";
import { FlightInfo } from "@/types";
import fs from 'fs/promises';
import path from 'path';

type FlightData = Record<string, [string, string]>;

async function getDepartureArrival(flightNumber: string) {
    const filePath = path.join(process.cwd(), 'src/data/skymark_flight_dict.json');
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const flightArray: Record<string, [string, string]>[] = JSON.parse(fileContent);

    const flightMapping: FlightData = Object.assign({}, ...flightArray);

    const formattedFlightNumber = `SKY${flightNumber}`;
    const [departure, arrival] = flightMapping[formattedFlightNumber] || ["", ""];
    console.log(departure, arrival);

    return { departure, arrival };
}

export async function getFlightSchedules(flights: { date: string, flightNumber: string }[]): Promise<FlightInfo[] | undefined> {
    const browser = await puppeteer.launch({ headless: false, args: ["--no-sandbox"] });
    const page = await browser.newPage();
    const results: FlightInfo[] = [];
    const timedOutFlights: { date: string, flightNumber: string }[] = [];

    try {
        // リクエストインターセプトを有効化
        await page.setRequestInterception(true);

        page.on('request', (request) => {
            // 不要なリソース（CSS, フォント, 画像など）をブロック
            if (
                request.resourceType() === 'stylesheet' ||
                request.resourceType() === 'font' ||
                request.resourceType() === 'image'
            ) {
                request.abort(); // リクエストを中止
            } else {
                request.continue(); // その他は続行
            }
        });

        await page.goto("https://www.skymark.co.jp/ja/", { waitUntil: "domcontentloaded" });
        const title = await page.title();

        console.log(title);

        try {
            await page.waitForSelector("#GA_topbutton_book");
            await page.click("#GA_topbutton_book");
            console.log("予約するボタンは正常に押されたよ");
        } catch (error) {
            console.error("予約するボタンが見つかりませんでした。", error);
        }

        for (const { date, flightNumber } of flights) {
            const { departure, arrival } = await getDepartureArrival(flightNumber);
            if (!departure || !arrival) {
                console.log(`Error: ${flightNumber} の情報が見つかりません。`);
                timedOutFlights.push({ date, flightNumber });
                continue;
            }
            console.log(flightNumber, date);

            try {
                await page.waitForSelector("input[name='button_inputDateAirline']");
                await page.click("input[name='button_inputDateAirline']");
                console.log("日付と路線を選択するページには正常に遷移したよ");
            } catch (error) {
                console.error(`フライト ${flightNumber} (${date}) のページ遷移に失敗しました。`, error);
                timedOutFlights.push({ date, flightNumber });

                await page.goto("https://www.skymark.co.jp/ja/", { waitUntil: "domcontentloaded" });

                try {
                    await page.waitForSelector("#GA_topbutton_book");
                    await page.click("#GA_topbutton_book");
                    console.log("予約するボタンは正常に押されたよ");
                } catch (error) {
                    console.error("予約するボタンが見つかりませんでした。", error);
                }
                continue;
            }

            try {
                await page.waitForSelector("select[name='month']", { visible: true });
                console.log(date);
                const [month, day] = date.split("-").slice(1).map((part) => part.replace(/^0/, ""));
                console.log(month, day);
                await page.select("select[name='month']", month);
                await page.select("select[name='day']", day);
                await page.select("select[name='departure']", departure);
                await page.select("select[name='arrival']", arrival);
            } catch (error) {
                console.error(`フライト ${flightNumber} (${date}) の選択に失敗しました。`, error);
                timedOutFlights.push({ date, flightNumber });

                await page.goto("https://www.skymark.co.jp/ja/", { waitUntil: "domcontentloaded" });

                try {
                    await page.waitForSelector("#GA_topbutton_book");
                    await page.click("#GA_topbutton_book");
                    console.log("予約するボタンは正常に押されたよ");
                } catch (error) {
                    console.error("予約するボタンが見つかりませんでした。", error);
                }
                continue;
            }

            try {
                await page.waitForSelector("#nextBtn");
                await page.evaluate(() => {
                    document.querySelector("#nextBtn")?.click();
                });
                console.log("検索結果画面に遷移したよ");
            } catch (error) {
                console.error(`フライト ${flightNumber} (${date}) の検索ボタンクリックに失敗しました。`, error);
                timedOutFlights.push({ date, flightNumber });

                await page.goto("https://www.skymark.co.jp/ja/", { waitUntil: "domcontentloaded" });

                try {
                    await page.waitForSelector("#GA_topbutton_book");
                    await page.click("#GA_topbutton_book");
                    console.log("予約するボタンは正常に押されたよ");
                } catch (error) {
                    console.error("予約するボタンが見つかりませんでした。", error);
                }
                continue;
            }

            try {
                await page.waitForFunction('document.readyState === "complete"');
                const flightRows = await page.$$eval("table tbody tr", (rows, flightNumber) => {
                    return rows.map((row) => {
                        const flightElement = row.querySelector("td.flight p");
                        if (!flightElement) return null;

                        const flightNum = flightElement.getAttribute("data-flight")?.trim();
                        if (flightNum !== flightNumber) return null;

                        const depTime = row.querySelector("th.depT")?.textContent?.split("\n")[0].trim() || "";
                        const arrTime = row.querySelector("th.arrT")?.textContent?.split("\n")[0].trim() || "";

                        return { flightNumber: flightNum, depTime, arrTime };
                    }).filter((flight) => flight !== null);
                }, flightNumber);

                for (const flight of flightRows) {
                    if (flight) {
                        results.push({
                            date,
                            flightNumber,
                            departure,
                            arrival,
                            depTime: flight.depTime,
                            arrTime: flight.arrTime,
                        });
                    }
                }
            } catch (error) {
                console.error(`フライト ${flightNumber} (${date}) の情報取得に失敗しました。`, error);
                timedOutFlights.push({ date, flightNumber });

                await page.goto("https://www.skymark.co.jp/ja/", { waitUntil: "domcontentloaded" });

                try {
                    await page.waitForSelector("#GA_topbutton_book");
                    await page.click("#GA_topbutton_book");
                    console.log("予約するボタンは正常に押されたよ");
                } catch (error) {
                    console.error("予約するボタンが見つかりませんでした。", error);
                }
            }
        }

        if (timedOutFlights.length > 0) {
            console.warn("タイムアウトになったフライト一覧:", timedOutFlights);
        }

        return results;
    } catch (error) {
        console.error(`Error scraping flight ${flights}:`, error);
    } finally {
        await browser.close();
    }
}
