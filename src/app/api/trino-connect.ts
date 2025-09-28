import { NextRequest, NextResponse } from "next/server";
import * as Trino from "trino-client";

interface TrinoConnectionRequest {
  username: string;
  password: string;
  host: string;
  port?: number;
  http_scheme?: string;
}

const connections: Record<string, Trino.Client> = {};

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const { username, password, host, port = 443, http_scheme = "https" } = (await req.json()) as TrinoConnectionRequest;

    const connectionId = `${host}:${username}`;
    connections[connectionId] = new Trino.Client({
      server: `${http_scheme}://${host}:${port}`,
      user: username,
      password: password,
    });

    return NextResponse.json({ connection_id: connectionId });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
