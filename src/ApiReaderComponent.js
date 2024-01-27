import React, { useState, useEffect } from 'react';
import socketIOClient from 'socket.io-client';

const ApiReaderComponent = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [path, setPath] = useState('/TestValue'); // Default path
    const [newPath, setNewPath] = useState('/TestValue'); // State to track changes before clicking "Update Path"
    const [socket, setSocket] = useState(null);
    const [fetchInterval, setFetchInterval] = useState(5); // Default fetch interval in seconds
    const [intervalId, setIntervalId] = useState(null);
    const [value, setValue] = useState(null);
    const [quality, setQuality] = useState(null);
    const [ts, setTs] = useState(null);

    useEffect(() => {

        // Establish a WebSocket connection
        const socket = socketIOClient('http://localhost:5000');
        setSocket(socket);

        // Listen for updates from the server
        socket.on('tagUpdate', (updatedData) => {
            // Update only the relevant state based on the received data
            setValue(updatedData?.data?.value);
            setQuality(updatedData?.data?.quality);
            setTs(updatedData?.data?.ts);
        });

        // Clear the previous interval when the fetch interval changes
        clearInterval(intervalId);

        // Set a new interval to fetch data at the specified interval
        const newIntervalId = setInterval(() => {
            fetchData(path);
        }, fetchInterval * 1000);

        // Save the new interval ID
        setIntervalId(newIntervalId);

        // Clean up the interval and WebSocket connection when the component unmounts
        return () => {
            clearInterval(newIntervalId);
            socket.disconnect();
        };
    }, [fetchInterval, path]);

    const fetchData = async (fetchPath) => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`http://localhost:5000/tag?cmd=read&path=${fetchPath}`, {
                headers: {
                    'Authorization': 'Bearer ptwlseLo5TpBLEAH7jKVQF7KWeZCUKmQwG6-YF4hQyJAxQ6NGGTz68i_yg-UA4CD',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const contentType = response.headers.get('Content-Type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new TypeError('The server response is not JSON!');
            }

            const result = await response.json();

            // Update only the relevant state based on the received data
            setValue(result?.data?.value);
            setQuality(result?.data?.quality);
            setTs(result?.data?.ts);

            // Send the fetched data to the server to update other subscribers
            if (socket) {
                socket.emit('updateTag', { path: fetchPath, data: result });
            }

        } catch (error) {
            console.error('Error fetching data:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdatePath = () => {
        // Update path with newPath when the button is clicked
        setPath(newPath);

        // Check if socket is not null before emitting the message
        if (socket) {
            // Send a WebSocket message to subscribe to the new path
            socket.emit('subscribeToTag', newPath);
        }
    };

    const handleUpdateFetchInterval = () => {
        // Update fetch interval and restart the interval
        clearInterval(intervalId);

        const newIntervalId = setInterval(() => {
            fetchData(path);
        }, fetchInterval * 1000);

        setIntervalId(newIntervalId);
    };

    return (
        <div>
            <h2>API Response</h2>

            <div>
                <label htmlFor="pathInput">Path:</label>
                <input
                    type="text"
                    id="pathInput"
                    value={newPath}
                    onChange={(e) => setNewPath(e.target.value)}
                />
                <button onClick={handleUpdatePath}>Update Path</button>
            </div>

            <div>
                <label htmlFor="intervalInput">Fetch Interval(sec):</label>
                <input
                    type="number"
                    id="intervalInput"
                    value={fetchInterval}
                    onChange={(e) => setFetchInterval(parseInt(e.target.value, 10))}
                />
                <button onClick={handleUpdateFetchInterval}>Update Fetch Interval</button>
            </div>

            {loading ? (
                <p>Loading data...</p>
            ) : error ? (
                <p>Error: {error}</p>
            ) : (
                <div>
                    <p>Value: {value}</p>
                    <p>Quality: {quality}</p>
                    <p>Timestamp: {ts}</p>
                </div>
            )}
        </div>
    );
};

export default ApiReaderComponent;
