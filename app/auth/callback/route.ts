import { updateSession } from "@/lib/supabase/middleware";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  return updateSession(request);
}

export async function POST(request: NextRequest) {
  return updateSession(request);
}
