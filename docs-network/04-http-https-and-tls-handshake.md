# Module 04: HTTP, HTTPS, and the TLS Handshake

At the Application layer (Layer 7), HTTP governs how clients and servers exchange web resources. Understanding the evolution of HTTP and the mechanics of TLS is critical for web performance and security.

---

## 🌐 1. The Evolution of HTTP

### HTTP/1.1 (1997)

- **Text-based**: Headers and bodies are sent as plaintext (unless encrypted by TLS).
- **Keep-Alive**: Connections are kept open for multiple requests.
- **Head-of-Line Blocking**: Only one request can be processed per TCP connection at a time. Browsers open ~6 concurrent TCP connections per domain to work around this.

### HTTP/2 (2015)

- **Binary Framing**: Data is broken down into binary frames, which are easier for servers to parse.
- **Multiplexing**: Multiple requests and responses can be intertwined over a **single TCP connection**, eliminating HTTP head-of-line blocking.
- **Header Compression (HPACK)**: Reduces bandwidth by compressing redundant headers.
- **Server Push**: (Largely deprecated in modern browsers).

### HTTP/3 (2022)

- **Built on QUIC (UDP)**: Ditches TCP entirely in favor of QUIC over UDP.
- **Zero Head-of-Line Blocking**: In HTTP/2, if one TCP packet drops, all multiplexed streams pause. In HTTP/3, independent streams don't block each other.
- **0-RTT Resumption**: Clients returning to a server can start sending data immediately without a handshake.

---

## 🔒 2. HTTPS and the TLS Handshake

HTTPS is simply HTTP encrypted via **TLS (Transport Layer Security)**. TLS provides:

1. **Encryption**: Eavesdroppers cannot read the data.
2. **Authentication**: Proves the server is who it claims to be (via Certificates).
3. **Integrity**: Ensures the data wasn't tampered with in transit.

### The TLS 1.2 Handshake (2-RTT)

1. **ClientHello**: Client sends supported ciphers and a random byte string.
2. **ServerHello**: Server chooses a cipher, sends its Certificate, and its own random byte string.
3. **Key Exchange**: Client verifies the cert, generates a "Pre-Master Secret," encrypts it with the server's public key, and sends it.
4. **Finished**: Both sides independently calculate the symmetric session key. Secure communication begins.

### The TLS 1.3 Handshake (1-RTT)

TLS 1.3 drastically improves performance by combining the cipher negotiation and key exchange into the very first step.

1. **ClientHello + Key Share**: Client guesses the cipher (usually Diffie-Hellman) and sends its half of the key exchange immediately.
2. **ServerHello + Key Share**: Server agrees, sends its half, and the session key is instantly computed. Secure communication begins.

---

## 📜 3. SSL/TLS Certificates and SNI

- **CA (Certificate Authority)**: A trusted third party (like Let's Encrypt or DigiCert) that signs your public key, proving you own the domain.
- **SNI (Server Name Indication)**: An extension to TLS. Since a single reverse proxy (like Nginx) might host 50 different domains on the same IP address, SNI allows the client to say `"I want the certificate for cleanarch.com"` during the `ClientHello`, before encryption even starts.

---

## 🛠️ 4. Debugging HTTP/TLS

To view the raw TLS handshake and HTTP headers, use `curl` with verbose mode:

```bash
curl -v https://cleanarch.com
```

Look for lines indicating:

- `* ALPN, offering h2` (Application-Layer Protocol Negotiation for HTTP/2)
- `* SSL connection using TLSv1.3`
- `* Server certificate:` verification
