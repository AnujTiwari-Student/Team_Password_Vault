
import client from "@/db";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        await client.connect(); 
        await client.db("admin").command({ ping: 1 });

        return NextResponse.json({ 
            status: "success", 
            message: "MongoDB connection successful!",
            serverStatus: "ping successful"
        }, { status: 200 });

    } catch (error) {
        console.error("MongoDB Connection Error:", error);

        return NextResponse.json({ 
            status: "error", 
            message: "MongoDB connection failed. Check your MONGODB_URI and service status.",
            error: (error as Error).message
        }, { status: 500 });
    }
}
