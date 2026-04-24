#!/bin/bash
# DroidWhisper Universal Launcher
APP_DIR="/home/cryptonic/Downloads/AI/Apps/DroidWhisper"

start_app() {
    cd "$APP_DIR"
    # Check if already running
    if pgrep -f "electron .$" > /dev/null; then
        echo "DroidWhisper is already running. Try 'droidwhisper restart' if you can't see the UI."
        return
    fi
    # Start Electron with potential GPU fix for Linux
    nohup npm start -- --disable-gpu > "$APP_DIR/droid.log" 2>&1 &
    echo "DroidWhisper started. Check $APP_DIR/droid.log if UI doesn't appear."
}

stop_app() {
    echo "Stopping DroidWhisper..."
    # 1. Kill any process that has the project directory in its command line
    ps aux | grep "$APP_DIR" | grep -v grep | awk '{print $2}' | xargs -r kill -9
    
    # 2. Cleanup specific known processes
    pkill -9 -f "electron .$"
    pkill -9 -f "whisperBackend.py"
    pkill -9 scrcpy
    
    # 3. Final sweep for any 'npm start' remnants
    pkill -9 -f "npm start"
    
    sleep 0.5
    echo "DroidWhisper stopped and cleared."
}

status_app() {
    local electron_pid=$(pgrep -f "electron .$")
    local python_pid=$(pgrep -f "whisperBackend.py")
    local scrcpy_pid=$(pgrep scrcpy)

    echo "--- DroidWhisper Status ---"
    if [ -n "$electron_pid" ]; then
        echo "Electron UI:   RUNNING (PID: $electron_pid)"
    else
        echo "Electron UI:   STOPPED"
    fi

    if [ -n "$python_pid" ]; then
        echo "Whisper Engine: RUNNING (PID: $python_pid)"
    else
        echo "Whisper Engine: STOPPED"
    fi

    if [ -n "$scrcpy_pid" ]; then
        echo "Audio Bridge:  RUNNING (PID: $scrcpy_pid)"
    else
        echo "Audio Bridge:  STOPPED"
    fi
}

case "$1" in
    stop)
        stop_app
        ;;
    restart)
        stop_app
        sleep 1
        start_app
        ;;
    status)
        status_app
        ;;
    start|*)
        start_app
        ;;
esac
