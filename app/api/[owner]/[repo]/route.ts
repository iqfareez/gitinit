import {NextResponse} from 'next/server';
import axios, {AxiosResponse} from "axios";

interface GhCommit {
    sha: string,
    node_id: string,
    commit: {
        author: {
            name: string,
            email: string,
            date: string
        },
        committer: {
            name: string,
            email: string,
            date: string
        },
        message: string,
        tree: {
            sha: string,
            url: string
        },
        url: string,
        comment_count: number,
        verification: {
            verified: boolean,
            reason: string,
            signature: string,
            payload: string
        }
    },
    url: string,
    html_url: string,
    comments_url: string,
    author: {
        login: string,
        id: number,
        node_id: string,
        avatar_url: string,
        gravatar_id: string,
        url: string,
        html_url: string,
        followers_url: string,
        following_url: string,
        gists_url: string,
        starred_url: string,
        subscriptions_url: string,
        organizations_url: string,
        repos_url: string,
        events_url: string,
        received_events_url: string,
        type: string,
        site_admin: boolean
    },
    committer: {
        login: string,
        id: number,
        node_id: string,
        avatar_url: string,
        gravatar_id: string,
        url: string,
        html_url: string,
        followers_url: string,
        following_url: string,
        gists_url: string,
        starred_url: string,
        subscriptions_url: string,
        organizations_url: string,
        repos_url: string,
        events_url: string,
        received_events_url: string,
        type: string,
        site_admin: boolean
    },
    parents: [
        {
            sha: string,
            url: string,
            html_url: string
        }
    ]
}

export async function GET(request: Request, {params}: { params: { owner: string, repo: string }; },) {
    const owner = params.owner;
    const repo = params.repo;
    const { searchParams } = new URL(request.url)
    const shields = searchParams.get('shields')

    console.log(owner, repo, shields)

    // get information about the GitHub repository
    let apiResponse: AxiosResponse;

    try {
        const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}/commits`,
            {
                headers: {
                    Accept: 'application/vnd.github+json',
                    Authorization: 'Bearer ' + process.env.GH_PAT,
                    'X-GitHub-Api-Version': '2022-11-28'
                }
            }
        );
        apiResponse = response;
    } catch (error) {
        console.error(error);
        return NextResponse.json({error: 'Cannot get commit information'}, {status: 400})
    }

    // Get the first commit information
    // TODO: Not working. Need to use since and until parameter
    // https://docs.github.com/en/rest/commits/commits?apiVersion=2022-11-28#list-commits-on-a-repository
    // https://docs.github.com/en/rest/repos/repos?apiVersion=2022-11-28#get-a-repository
    const firstCommit: GhCommit = apiResponse.data[apiResponse.data.length - 1];

    const relativeDate = getRelativeDate(firstCommit.commit.author.date);

    if (shields === "yes") {
        return NextResponse.json(
            {
                schemaVersion: 1,
                label: "First Commit",
                message: relativeDate,
                color: "orange"
            }
        )
    }

    return NextResponse.json({
        commit_message: firstCommit.commit.message,
        commit_date: firstCommit.commit.author.date,
        author_username: firstCommit.author.login,
        author_gravatar: firstCommit.author.avatar_url,
    }, {status: 200});
}

function getRelativeDate(dateString: string): string {
    const currentDate = new Date();
    const targetDate = new Date(dateString);

    // Calculate the difference in milliseconds
    const diff = currentDate.getTime() - targetDate.getTime();

    // Convert the difference to seconds
    const seconds = Math.floor(diff / 1000);

    // Define the time units and their respective values in seconds
    const timeUnits = [
        { unit: 'year', value: 31536000 },
        { unit: 'month', value: 2592000 },
        { unit: 'day', value: 86400 },
        { unit: 'hour', value: 3600 },
        { unit: 'minute', value: 60 },
        { unit: 'second', value: 1 },
    ];

    // Find the appropriate time unit to display
    for (const unit of timeUnits) {
        const interval = Math.floor(seconds / unit.value);
        if (interval >= 1) {
            return `${interval} ${unit.unit}${interval > 1 ? 's' : ''} ago`;
        }
    }

    return 'Just now'; // If the difference is less than a second
}

