import React, { useState, useEffect } from 'react';

const ApiReaderComponent = () => {
    const [value, setValue] = useState(null);
    const [quality, setQuality] = useState(null);
    const [ts, setTs] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [path, setPath] = useState('/TestValue');
    const [newPath, setNewPath] = useState('/TestValue');
    const [fetchInterval, setFetchInterval] = useState(10); // Fetch interval in seconds

    useEffect(() => {
        // Function to fetch data from the server
        const fetchData = async () => {
            setLoading(false);//negative logic
            setError(null);

            try {
                const response = await fetch(`http://localhost:5000/tag?cmd=read&path=${path}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                const result = await response.json();
                setValue(result?.data?.value);
                setQuality(result?.data?.quality);
                setTs(result?.data?.ts);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        // Set up interval to fetch data repeatedly
        const intervalId = setInterval(() => fetchData(), fetchInterval * 1000);

        // Clean up interval on component unmount
        return () => clearInterval(intervalId);
    }, [path, fetchInterval]); // Dependencies array, re-run effect if these values change

    // Function to handle Enter key press for path update
    const handlePathKeyPress = (event) => {
        if (event.key === 'Enter') {
            handleUpdatePath();
        }
    };

    // Function to handle Enter key press for fetch interval update
    const handleIntervalKeyPress = (event) => {
        if (event.key === 'Enter') {
            handleUpdateFetchInterval();
        }
    };
    // Function to handle path update
    const handleUpdatePath = () => {
        setPath(newPath);
    };

    // Function to handle fetch interval update
    const handleUpdateFetchInterval = (e) => {
        setFetchInterval(Number(e.target.value));
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
                    onKeyDown={handlePathKeyPress} // Use onKeyDown instead of onKeyPress
                />
                <button onClick={handleUpdatePath}>Update Path</button>
            </div>

            <div>
                <label htmlFor="intervalInput">Fetch Interval (sec):</label>
                <input
                    type="number"
                    id="intervalInput"
                    value={fetchInterval}
                    onChange={(e) => setFetchInterval(parseInt(e.target.value, 10))}
                    onKeyDown={handleUpdateFetchInterval}
                />
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