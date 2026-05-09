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
 * Queries the Linux Kernel ARP cache to dynamically find the connected phone's IP address.
 * Ideal for direct peer-to-peer Wi-Fi hotspot connections.
 */
const discoverViaArp = () => {
    console.log('ADB: Querying Linux Kernel ARP cache for dynamic IP...');
    return new Promise((resolve) => {
        exec('ip -4 neigh show dev wlan0', (err, stdout) => {
            if (err) {
                console.error('ADB: Failed to query ARP cache:', err.message);
                return resolve(null);
            }
            
            const lines = stdout.split('\n');
            for (const line of lines) {
                if (line.includes('lladdr')) {
                    const match = line.match(/^([0-9\.]+)\s/);
                    if (match && match[1]) {
                        return resolve(match[1]);
                    }
                }
            }
            resolve(null);
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

    // 2. Try Kernel ARP Cache Auto-Discovery (Solves dynamic DHCP IPs on hotspots)
    let ip = await discoverViaArp();
    
    if (ip) {
        console.log(`ADB: ARP Cache positively identified dynamic IP: ${ip}`);
    } else {
        // 3. Fallback to static IP if configured
        ip = appConfig.AUDIO.DEVICE_IP;
        if (!ip) {
            console.warn('ADB: All discovery methods failed and no DEVICE_IP configured.');
            return { success: false, reason: 'missing_ip' };
        }
        console.log(`ADB: ARP failed. Falling back to static environment IP: ${ip}`);
    }

    console.log(`ADB: Attempting TCP/IP transport connection to ${ip}:5555...`);
    
    // 1. Force disconnect first
    await new Promise(r => exec(`${appConfig.AUDIO.ADB_PATH} disconnect ${ip}:5555`, { timeout: 2000 }, r));

    // 2. Connect with strict timeout
    return new Promise((resolve) => {
        const adbConnect = exec(`${appConfig.AUDIO.ADB_PATH} connect ${ip}:5555`, { timeout: 5000 }, (err, stdout) => {
            if (err) {
                let reason = 'timeout';
                if (err.message.includes('Connection refused')) reason = 'refused';
                console.error(`ADB: Wireless connection failed (${reason}):`, err.message);
                return resolve({ success: false, reason });
            }
            const success = stdout.includes('connected');
            resolve({ success, reason: success ? null : 'failed' });
        });

        // Safety timeout
        setTimeout(() => {
            if (!adbConnect.killed && adbConnect.exitCode === null) {
                console.warn('ADB: Connection attempt hung.');
                adbConnect.kill();
                resolve({ success: false, reason: 'timeout' });
            }
        }, 6000);
    });
};

/**
 * Checks if ANY device (USB or WiFi) is available.
 */
const getAvailableSerials = () => {
    return new Promise((resolve) => {
        exec(`${appConfig.AUDIO.ADB_PATH} devices`, (err, stdout) => {
            if (err) return resolve([]);
            const lines = stdout.split('\n');
            const devices = lines.slice(1)
                .filter(line => line.trim() !== '' && line.includes('device'))
                .map(line => line.split('\t')[0]);
            resolve(devices);
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
        return { success: true };
    }

    return await connectWireless();
};

/**
 * Performs a hard reset of the ADB daemon.
 */
const hardReset = async () => {
    console.log('ADB: Performing hard reset (kill-server)...');
    return new Promise((resolve) => {
        exec(`${appConfig.AUDIO.ADB_PATH} kill-server`, () => {
            exec(`${appConfig.AUDIO.ADB_PATH} start-server`, () => {
                resolve(true);
            });
        });
    });
};

module.exports = {
    isDeviceConnected,
    connectWireless,
    ensureConnection,
    hardReset
};
