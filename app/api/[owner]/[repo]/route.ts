import { NextResponse } from 'next/server';

export async function GET(request: Request, {params,}: { params: { owner: string, repo:string }; },) {
    const owner = params.owner;
    const repo = params.repo;

    var data = {
        "owner": owner,
        "repo": repo
    }

    return NextResponse.json({ data });
}