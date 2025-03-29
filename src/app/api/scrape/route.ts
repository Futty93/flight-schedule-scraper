"use server"
import { NextRequest, NextResponse } from "next/server";
import { getFlightSchedules } from "@/lib/scraper";
import { Flight } from "@/types";

export async function POST(req: NextRequest) {
    try {
        const { flights }: { flights: Flight[] } = await req.json();
        if (!flights || !Array.isArray(flights)) {
            return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
        }
        const result = await getFlightSchedules(flights);

        if (!result) {
            return NextResponse.json(
                { message: "No flight schedules found" },
                { status: 400 }
            );
        }

        return NextResponse.json(result);
    } catch (error) {
        console.error("Error processing the scrape request:", error);
        return NextResponse.json(
            { message: "Internal Server Error", error: error.message },
            { status: 500 }
        );
    }
}