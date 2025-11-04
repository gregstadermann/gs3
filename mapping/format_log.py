#!/usr/bin/env python3
"""
Log Formatter - Normalize GS3 movement logs
Splits combined lines like ">s[Room Title]" into separate lines
"""

import re
import sys

def format_log(input_path: str, output_path: str = None):
    """
    Format a GS3 movement log to normalize room headers
    
    Handles:
    1. Strips connection header (from "Please wait..." to "...news articles.")
    2. Splits combined movement+room: >s[Room] → >s\\n[Room]
    """
    
    with open(input_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    # Strip header junk if present
    header_start = None
    header_end = None
    
    for i, line in enumerate(lines):
        if 'Please wait for connection to game server' in line:
            header_start = i
        if 'You have unread news articles' in line or 'Type NEWS NEXT' in line:
            header_end = i
            break
    
    # Remove header lines if found
    if header_start is not None and header_end is not None:
        print(f"  Removing header junk (lines {header_start+1} to {header_end+1})")
        lines = lines[:header_start] + lines[header_end+1:]
    
    formatted_lines = []
    changes = 0
    
    for line in lines:
        # Check for combined movement + room header: >direction[Room Title]
        match = re.match(r'^(>[a-z]+)(\[.+?\])(.*)$', line, re.IGNORECASE)
        if match:
            movement = match.group(1)
            room_header = match.group(2)
            remainder = match.group(3)
            
            # Split into separate lines
            formatted_lines.append(movement + '\n')
            formatted_lines.append(room_header + remainder + '\n')
            changes += 1
        else:
            formatted_lines.append(line)
    
    # Write output
    if not output_path:
        output_path = input_path.replace('.txt', '.formatted.txt')
        if output_path == input_path:
            output_path = input_path + '.formatted'
    
    with open(output_path, 'w', encoding='utf-8') as f:
        f.writelines(formatted_lines)
    
    removed_lines = (header_end - header_start + 1) if header_start is not None and header_end is not None else 0
    
    print(f"✅ Formatted {len(lines)} lines")
    if removed_lines > 0:
        print(f"   Removed {removed_lines} header lines (connection/news junk)")
    print(f"   Split {changes} combined movement+room lines")
    print(f"   Output: {output_path}")

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: format_log.py <input.txt> [output.txt]")
        sys.exit(1)
    
    input_file = sys.argv[1]
    output_file = sys.argv[2] if len(sys.argv) > 2 else None
    
    format_log(input_file, output_file)

