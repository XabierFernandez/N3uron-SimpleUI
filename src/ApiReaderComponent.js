import React, { useState, useEffect } from 'react';

const ApiReaderComponent = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [path, setPath] = useState('/TestValue'); // Default path
    const [newPath, setNewPath] = useState('/TestValue'); // State to track changes before clicking "Update Path"

    useEffect(() => {
        fetchData(path);
    }, [path]);
    const handleUpdatePath = () => {
        // Update path with newPath when the button is clicked
        setPath(newPath);

        // Trigger a new fetch request with the updated path
        fetchData(newPath);
    };

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
            setData(result);
        } catch (error) {
            console.error('Error fetching data:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
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

            {loading ? (
                <p>Loading data...</p>
            ) : error ? (
                <p>Error: {error}</p>
            ) : (
                <div>
                    <p>Value: {data?.data?.value}</p>
                    <p>Quality: {data?.data?.quality}</p>
                    <p>Timestamp: {data?.data?.ts}</p>
                </div>
            )}
        </div>
    );
};

export default ApiReaderComponent;
