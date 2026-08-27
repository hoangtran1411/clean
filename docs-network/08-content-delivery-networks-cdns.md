# Module 08: Content Delivery Networks (CDNs)

A Content Delivery Network (CDN) is a globally distributed network of proxy servers. Its primary goal is to deliver web content to users faster by serving it from a geographical location closest to them.

---

## 🌍 1. How a CDN Works

Without a CDN, if your server is in New York, a user in Tokyo experiences high latency (ping > 200ms) because the data must cross the Pacific Ocean.

With a CDN (like Cloudflare, AWS CloudFront, or Akamai):

1. **Edge Locations**: The CDN operates hundreds of data centers worldwide.
2. **Anycast IP Routing**: All edge locations advertise the *same* IP address. The global internet routing protocol (BGP) automatically directs the Tokyo user to the Tokyo edge server.
3. **Caching**: If the Tokyo user requests an image, the Tokyo edge server checks its cache.
   - **Cache Hit**: It returns the image instantly (< 10ms).
   - **Cache Miss**: It fetches the image from the **Origin Server** (New York), saves a copy in Tokyo, and serves the user.

---

## 📦 2. What Should Be Cached?

- **Static Assets (Cache Aggressively)**: Images, CSS, JavaScript, fonts. These are often immutable (e.g., `app-v2.hash.js`) and can be cached with a TTL of 1 year (`Cache-Control: public, max-age=31536000`).
- **Dynamic Content (Do Not Cache)**: User-specific JSON API responses, shopping cart data, authentication endpoints (`Cache-Control: no-store`).

---

## 🧹 3. Cache Invalidation Strategies

When you deploy a new version of your frontend or update an image, how do you force the CDN to drop the old version?

1. **Cache Busting / File Hashing (Recommended)**: The build tool (like Vite) generates a unique filename based on the file contents (e.g., `main.a3f9b2.js`). Because the URL is entirely new, the CDN treats it as a new resource, bypassing the old cache instantly.
2. **Purge API**: Sending an API request to the CDN provider to explicitly invalidate a specific URL or wildcard path. Takes a few seconds to propagate globally.
3. **Short TTL**: Setting a short Time-To-Live (e.g., 5 minutes) so the CDN frequently checks the origin for updates. Increases load on the origin server.

---

## 🛡️ 4. Security Benefits of CDNs

Beyond performance, modern CDNs act as a massive shield for your origin server:

- **DDoS Mitigation**: CDN edge servers have massive bandwidth capacity capable of absorbing volumetric DDoS attacks that would otherwise crush your origin server.
- **Web Application Firewall (WAF)**: Inspects incoming HTTP requests for SQL injection, Cross-Site Scripting (XSS), and malicious bot signatures at the edge.
- **SSL Offloading**: The CDN manages the SSL/TLS certificates and handshakes, reducing CPU load on your origin.
