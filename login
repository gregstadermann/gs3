#!/bin/bash
# Wrapper script for login-script that checks for expect

if ! command -v expect &> /dev/null; then
    echo "Error: 'expect' is not installed."
    echo "Please install it with: sudo apt install expect"
    exit 1
fi

exec expect -f "$(dirname "$0")/login-script" "$@"

