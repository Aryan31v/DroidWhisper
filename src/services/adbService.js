/**
 * adbService.js
 * Handles Android Device Bridge (ADB) operations for DroidWhisper.
 * Specifically manages wireless fallback when USB is disconnected.
 */

const { exec } = require('child_process');
const { appConfig } = require('../config');

/**
 * Checks if a device is connected.
 * @returns {Promise<boolean>}
 */
const isDeviceConnected = () => {
    return new Promise((resolve) => {
        exec(`${appConfig.AUDIO.ADB_PATH} devices`, (err, stdout) => {
            if (err) return resolve(false);
            const lines = stdout.split('\n');
            // Check for at least one device that is not just the header
            const devices = lines.slice(1).filter(line => line.trim() !== '' && line.includes('device'));
            resolve(devices.length > 0);
        });
    });
};

/**
 * Attempts to discover and connect to devices via MDNS (Wireless Debugging).
 */
const discoverAndConnect = () => {
    console.log('ADB: Scanning network for wireless devices...');
    return new Promise((resolve) => {
        // MDNS discovery requires Android 11+ and Wireless Debugging enabled
        exec(`${appConfig.AUDIO.ADB_PATH} mdns check`, (err, stdout) => {
            if (stdout.includes('mdns daemon is running')) {
                exec(`${appConfig.AUDIO.ADB_PATH} devices`, (err, stdout) => {
                    // If mdns found it, it will show up in 'adb devices' automatically
                    const found = stdout.includes(':5555') || stdout.includes('._adb-tls-connect');
                    resolve(found);
                });
            } else {
                resolve(false);
            }
        });
    });
};

/**
 * Attempts to connect to the device via WiFi.
 * @returns {Promise<boolean>}
 */
const connectWireless = async () => {
    // 1. Try MDNS Auto-discovery first
    const found = await discoverAndConnect();
    if (found) {
        console.log('ADB: Automatically discovered phone via MDNS.');
        return true;
    }

    // 2. Fallback to static IP if configured
    const ip = appConfig.AUDIO.DEVICE_IP;
    if (!ip) {
        console.warn('ADB: Auto-discovery failed and no DEVICE_IP configured.');
        return false;
    }

    console.log(`ADB: Attempting wireless connection to ${ip}...`);
    return new Promise((resolve) => {
        exec(`${appConfig.AUDIO.ADB_PATH} connect ${ip}`, (err, stdout) => {
            if (err) {
                console.error('ADB: Wireless connection failed:', err);
                return resolve(false);
            }
            console.log('ADB:', stdout.trim());
            resolve(stdout.includes('connected'));
        });
    });
};

/**
 * Ensures a device is connected, falling back to WiFi if necessary.
 */
const ensureConnection = async () => {
    const connected = await isDeviceConnected();
    if (connected) {
        console.log('ADB: Device already connected (USB or existing WiFi).');
        return true;
    }

    return await connectWireless();
};

module.exports = {
    isDeviceConnected,
    connectWireless,
    ensureConnection
};
