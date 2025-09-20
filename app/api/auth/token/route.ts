import { auth0 } from "@/lib/auth0";
import { NextResponse } from "next/server";

export async function GET() {
  const { token } = await auth0.getAccessToken()
  return NextResponse.json({ accessToken: token});
}