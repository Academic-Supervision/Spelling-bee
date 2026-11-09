"""
Spelling Bee Championship 2026 - Local Server & Auto-Launcher
Provides optimal 60FPS WebGL GPU acceleration & video streaming without CORS limitations.
"""

import http.server
import socketserver
import webbrowser
import os
import sys
import socket

def find_free_port(start_port=8080):
    port = start_port
    while port < 65535:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
            res = sock.connect_ex(('127.0.0.1', port))
            if res != 0:
                return port
            port += 1
    return 8080

class SpellingBeeHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Enable CORS and caching headers for optimal video/canvas performance
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', '*')
        self.send_header('Cache-Control', 'no-cache')
        super().end_headers()

    def guess_type(self, path):
        # Ensure proper video mime types
        if path.endswith('.mp4'):
            return 'video/mp4'
        if path.endswith('.webm'):
            return 'video/webm'
        return super().guess_type(path)

def main():
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    port = find_free_port(8080)
    
    url = f"http://localhost:{port}/index.html"
    
    print("=" * 65)
    print("  🏆 SPELLING BEE CHAMPIONSHIP 2026 - STAGE SERVER")
    print("=" * 65)
    print(f"  Server URL:    {url}")
    print(f"  Local Port:    {port}")
    print("  Status:        ONLINE (WebGL GPU Chroma-Key Active)")
    print("=" * 65)
    print("  Opening default web browser automatically...")
    print("  Press Ctrl+C in this window anytime to stop the server.")
    print("=" * 65)

    webbrowser.open(url)

    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(('127.0.0.1', port), SpellingBeeHandler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down server. Goodbye!")

if __name__ == '__main__':
    main()
