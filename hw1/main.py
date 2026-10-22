import argparse
import sys
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import HTTPRedirectHandler, Request, build_opener


class NoRedirect(HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


def arguments():
    parser = argparse.ArgumentParser(prog="quickcurl", description="A small HTTP client")
    parser.add_argument("url")
    parser.add_argument("-X", "--request", help="HTTP method")
    parser.add_argument("-H", "--header", action="append", default=[], help="Request header")
    parser.add_argument("-d", "--data", help="Request body")
    parser.add_argument("-o", "--output", help="Output file")
    parser.add_argument("-i", "--include", action="store_true", help="Include response headers")
    parser.add_argument("-I", "--head", action="store_true", help="Send a HEAD request")
    parser.add_argument("-L", "--location", action="store_true", help="Follow redirects")
    parser.add_argument("-m", "--max-time", type=float, default=30, help="Timeout in seconds")
    return parser.parse_args()


def parse_headers(items):
    result = {"User-Agent": "quickcurl/1.0"}
    for item in items:
        if ":" not in item:
            raise ValueError(f"Invalid header: {item}")
        name, value = item.split(":", 1)
        result[name.strip()] = value.strip()
    return result


def main():
    args = arguments()
    try:
        headers = parse_headers(args.header)
        data = args.data.encode() if args.data is not None else None
        method = args.request or ("HEAD" if args.head else "POST" if data else "GET")
        request = Request(args.url, data=data, headers=headers, method=method.upper())
        opener = build_opener() if args.location else build_opener(NoRedirect())
        try:
            response = opener.open(request, timeout=args.max_time)
        except HTTPError as error:
            response = error
        with response:
            body = b"" if method.upper() == "HEAD" else response.read()
            output = bytearray()
            if args.include or method.upper() == "HEAD":
                output.extend(f"HTTP {response.status} {response.reason}\r\n".encode())
                for name, value in response.headers.items():
                    output.extend(f"{name}: {value}\r\n".encode())
                output.extend(b"\r\n")
            output.extend(body)
        if args.output:
            Path(args.output).write_bytes(output)
        else:
            sys.stdout.buffer.write(output)
        return 22 if response.status >= 400 else 0
    except (ValueError, OSError, URLError) as error:
        print(f"quickcurl: {error}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())

