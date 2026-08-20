import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// Standalone Supabase client — no cookies needed for a cron endpoint
function createCronClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function GET(request: Request) {
  // Optional: verify the request comes from Vercel Cron
  const authHeader = request.headers.get("authorization");
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const supabase = createCronClient();

    // Query sangat ringan, hanya meminta 1 row dari tabel services
    const { data, error } = await supabase
      .from("services")
      .select("id")
      .limit(1)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 = no rows returned, which is fine (the db is still alive)
      throw error;
    }

    return NextResponse.json(
      {
        success: true,
        message: "Database keep-alive ping successful",
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Keep-alive error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Unknown error" },
      { status: 500 }
    );
  }
}
