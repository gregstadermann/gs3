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
    
    Handles cases like:
        >s[Wehnimer's, North Ring Rd.]
    
    Converts to:
        >s
        [Wehnimer's, North Ring Rd.]
    """
    
    with open(input_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
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
    
    print(f"✅ Formatted {len(lines)} lines")
    print(f"   Split {changes} combined movement+room lines")
    print(f"   Output: {output_path}")

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: format_log.py <input.txt> [output.txt]")
        sys.exit(1)
    
    input_file = sys.argv[1]
    output_file = sys.argv[2] if len(sys.argv) > 2 else None
    
    format_log(input_file, output_file)

