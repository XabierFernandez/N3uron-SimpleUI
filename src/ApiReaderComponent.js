import React, { useState, useEffect } from 'react';
import GaugeMeterSvg from './svg/gauge_meter.svg';
import {serverPort, serverUrl} from './utils.js';
import SVG from 'react-inlinesvg';
import * as d3 from "d3";


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
                const response = await fetch(`${serverUrl}:${serverPort}/tag?cmd=read&path=${path}`);
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

    useEffect(() => {
        const svgElement = document.getElementById('gaugeMeterSvg');
        if (svgElement) {
            const textValueTspan = svgElement.querySelector('#textValue tspan');
            const rulerFillerValue = svgElement.querySelector('#inner');
            const needleGroupValue = svgElement.querySelector('#needleGroup ');

            if (textValueTspan) {
                rulerFillerValue.style.transition = 'transform 1.0s ease-in-out';
                textValueTspan.textContent = value.toString();
            }
            if (rulerFillerValue) {
                // Convert the percentage to stroke-dasharray value
                const strokeDasharrayValue = (value / 100) * 471;
                rulerFillerValue.style.transition = 'stroke-dasharray  1s ease-in-out';
                rulerFillerValue.style.strokeDasharray = `${strokeDasharrayValue} 628`;
                value === 0 ? rulerFillerValue.style.strokeWith= 0: rulerFillerValue.style.strokeWith = 20;
            }
            if (needleGroupValue) {
                // Set your minimum and maximum values here
                const minValue = 0;
                const maxValue = 100;

                const minAngle = -50; // 0% angle
                const maxAngle = 230; // 100% angle

                const rotation = minAngle + ((maxAngle - minAngle) * (value - minValue)) / (maxValue - minValue);

                // Set the rotation using CSS
                needleGroupValue.style.transition = 'transform 1s ease-in-out';
                needleGroupValue.style.transform = `rotate(${rotation}deg)`;
            }

        }
    }, [value]);

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
                <SVG src={GaugeMeterSvg} id="gaugeMeterSvg" style={{ width: '100%', height: '100%' }} />
            </div>
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
                    onKeyDown={handleIntervalKeyPress}
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