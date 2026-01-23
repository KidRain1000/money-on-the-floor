const https = require('https');

// ESPN team IDs mapped to NBA abbreviations
const ESPN_TEAMS = {
    'ATL': 1, 'BOS': 2, 'BKN': 17, 'CHA': 30, 'CHI': 4,
    'CLE': 5, 'DAL': 6, 'DEN': 7, 'DET': 8, 'GSW': 9,
    'HOU': 10, 'IND': 11, 'LAC': 12, 'LAL': 13, 'MEM': 29,
    'MIA': 14, 'MIL': 15, 'MIN': 16, 'NOP': 3, 'NYK': 18,
    'OKC': 25, 'ORL': 19, 'PHI': 20, 'PHX': 21, 'POR': 22,
    'SAC': 23, 'SAS': 24, 'TOR': 28, 'UTA': 26, 'WAS': 27
};

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Cache-Control', 'public, max-age=300');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const teamAbbr = req.query.team;

    if (!teamAbbr) {
        res.status(400).json({ error: 'team parameter required (e.g., ?team=ATL)' });
        return;
    }

    const espnId = ESPN_TEAMS[teamAbbr.toUpperCase()];
    if (!espnId) {
        res.status(400).json({ error: 'Unknown team: ' + teamAbbr });
        return;
    }

    try {
        const url = `https://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams/${espnId}/roster`;

        const data = await new Promise((resolve, reject) => {
            https.get(url, (response) => {
                let body = '';
                response.on('data', chunk => body += chunk);
                response.on('end', () => {
                    try {
                        resolve(JSON.parse(body));
                    } catch (e) {
                        reject(e);
                    }
                });
            }).on('error', reject);
        });

        // Parse roster and extract player info with injuries
        const players = [];

        if (data.athletes && Array.isArray(data.athletes)) {
            data.athletes.forEach(player => {
                const injuries = player.injuries || [];
                let status = 'active';

                if (injuries.length > 0) {
                    const injury = injuries[0];
                    const injStatus = injury.status ? injury.status.toLowerCase() : '';
                    if (injStatus.includes('out')) status = 'out';
                    else if (injStatus.includes('doubtful')) status = 'doubtful';
                    else if (injStatus.includes('questionable') || injStatus.includes('day-to-day') || injStatus.includes('day to day')) status = 'questionable';
                    else if (injStatus.includes('probable')) status = 'probable';
                }

                players.push({
                    name: player.fullName || player.displayName,
                    position: player.position ? player.position.abbreviation : 'F',
                    status: status,
                    salary: player.contract ? player.contract.salary : null
                });
            });
        }

        res.status(200).json({
            team: teamAbbr.toUpperCase(),
            players: players
        });
    } catch (error) {
        console.error('Error fetching roster for ' + teamAbbr + ':', error);
        res.status(500).json({ error: 'Failed to fetch roster' });
    }
};
