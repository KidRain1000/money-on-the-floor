const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const PORT = 8080;
const API_KEY = '3ab6f718-2fdb-4361-9074-bf183ba6f3c3';

const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // API proxy endpoint
    if (req.url.startsWith('/api/')) {
        const apiPath = req.url.replace('/api/', '');
        const apiUrl = `https://api.balldontlie.io/v1/${apiPath}`;

        console.log('Proxying API request:', apiUrl);

        const options = {
            headers: {
                'Authorization': API_KEY
            }
        };

        https.get(apiUrl, options, (apiRes) => {
            let data = '';
            apiRes.on('data', chunk => data += chunk);
            apiRes.on('end', () => {
                res.setHeader('Content-Type', 'application/json');
                res.writeHead(apiRes.statusCode);
                res.end(data);
            });
        }).on('error', (err) => {
            console.error('API Error:', err);
            res.writeHead(500);
            res.end(JSON.stringify({ error: err.message }));
        });
        return;
    }

    // Serve static files
    let filePath = req.url.split('?')[0];
    if (filePath === '/') filePath = '/index.html';
    filePath = path.join(__dirname, filePath);

    const ext = path.extname(filePath);
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404);
                res.end('File not found');
            } else {
                res.writeHead(500);
                res.end('Server error');
            }
            return;
        }

        res.setHeader('Content-Type', contentType);
        res.writeHead(200);
        res.end(content);
    });
});

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log('API proxy available at /api/*');
});
