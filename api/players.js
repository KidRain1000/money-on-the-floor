const https = require('https');

const API_KEY = '3ab6f718-2fdb-4361-9074-bf183ba6f3c3';

module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const teamId = req.query['team_ids[]'] || req.query.team_ids;

    if (!teamId) {
        res.status(400).json({ error: 'team_ids[] parameter required' });
        return;
    }

    // Fetch players for the team (get first 25 which should cover the roster)
    const apiUrl = `https://api.balldontlie.io/v1/players?team_ids[]=${teamId}&per_page=25`;

    try {
        const data = await new Promise((resolve, reject) => {
            const options = {
                headers: {
                    'Authorization': API_KEY
                }
            };

            https.get(apiUrl, options, (apiRes) => {
                let body = '';
                apiRes.on('data', chunk => body += chunk);
                apiRes.on('end', () => {
                    try {
                        resolve(JSON.parse(body));
                    } catch (e) {
                        reject(e);
                    }
                });
            }).on('error', reject);
        });

        res.status(200).json(data);
    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({ error: 'Failed to fetch players' });
    }
};
