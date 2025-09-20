import { auth0 } from "@/lib/auth0";
import { NextResponse, NextRequest } from "next/server";

export async function GET(_req: NextRequest) {
  const { token } = await auth0.getAccessToken()
  return NextResponse.json({ accessToken: token});
}