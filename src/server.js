import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const PORT = 5000;
const app = express();


const corsOptions = {
    origin: "http://localhost:3005",
};
app.use(cors(corsOptions)); // Enable CORS for the specified origin

const targetApiUrl = "http://localhost:3003";

app.get('/tag', async (req, res) => {
    const { cmd, path } = req.query;
    try {
        const fetchOptions = {
            method: 'GET',
            headers: {
                'Authorization':'Bearer ptwlseLo5TpBLEAH7jKVQF7KWeZCUKmQwG6-YF4hQyJAxQ6NGGTz68i_yg-UA4CD',
            },
        };

        const response = await fetch(`${targetApiUrl}/tag?cmd=${cmd}&path=${path}`, fetchOptions);

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

app.listen(PORT, () => {
    console.log(`Express server listening at http://localhost:${PORT}`);
});
