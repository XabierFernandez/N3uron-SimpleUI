import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import {apiKey, originUrl,originPort, serverPort, targetApiUrl, targetPort} from './utils.js';

const app = express();

const corsOptions = {
    origin: `${originUrl}:${originPort}`,
};
app.use(cors(corsOptions)); // Enable CORS for the specified origin


app.get('/tag', async (req, res) => {
    const { cmd, path } = req.query;
    try {
        const fetchOptions = {
            method: 'GET',
            headers: {
                'Authorization':`Bearer ${apiKey}`,
            },
        };

        const response = await fetch(`${targetApiUrl}:${targetPort}/tag?cmd=${cmd}&path=${path}`, fetchOptions);

        if (response.ok) {
            const contentType = response.headers.get('Content-Type');
            if (contentType && contentType.includes('application/json')) {
                const jsonResponse = await response.json();
                res.json(jsonResponse);
            } else {
                throw new TypeError('The server response is not JSON!');
            }
        } else {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(serverPort, () => {
    console.log(`Express server listening at http://localhost:${serverPort}`);
});
