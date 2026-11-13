// Module 5: High Level Design (outline).
// Har component: problem → component kya karta hai → kab lagao / kab nahi → simulator mein RPS badha ke dekho.
registerModule({
  id: "hld",
  intro: "Ek server se shuru. Traffic badhta hai, kuch toot-ta hai, aur tab ek component aata hai: load balancer, cache, replica, queue, shard. Har component ke saath likha hai wo kyun aaya, kaunse alternatives the aur unhe kyun chhoda. Koi quiz ya code nahi: sirf explanation aur animated diagrams.",
  chapters: [
    {
      title: "Basics",
      lessons: [
        { id: "request-flow", title: "Browser mein URL daalne se response tak", plan: ["DNS, IP, TCP, HTTP/HTTPS", "Client-server model"] },
        { id: "latency-numbers", title: "Latency numbers aur bottlenecks", plan: ["RAM vs SSD vs network vs cross-region", "CPU, memory, disk, network bound"] },
        { id: "estimation", title: "Back-of-the-envelope estimation", plan: ["DAU se QPS, peak QPS", "Storage aur bandwidth estimate"] },
        { id: "scaling", title: "Vertical vs Horizontal scaling", plan: ["Stateless servers", "Simulator: 1 server pe RPS badhao"] }
      ]
    },
    {
      title: "Building blocks",
      lessons: [
        { id: "load-balancer", title: "Load Balancer", plan: ["L4 vs L7", "Round robin, least connections, consistent hashing", "Health checks"] },
        { id: "api-gateway", title: "Reverse proxy aur API Gateway", plan: ["Auth, rate limiting, routing"] },
        { id: "caching", title: "Caching (Redis)", plan: ["Kahan cache: client, CDN, app, DB", "Cache-aside, write-through, write-back", "Eviction: LRU, TTL", "Cache stampede, invalidation", "Simulator: cache hit ratio vs DB load"] },
        { id: "cdn", title: "CDN aur Blob storage", plan: ["Static content, video", "S3 type storage"] },
        { id: "sql-vs-nosql", title: "SQL vs NoSQL", plan: ["Relational, key-value, document, wide-column, graph", "Decision table"] },
        { id: "indexing", title: "Database indexing", plan: ["B-tree vs LSM (simple)", "Read vs write trade-off"] },
        { id: "replication", title: "Replication", plan: ["Leader-follower, read replicas", "Replication lag"] },
        { id: "sharding", title: "Sharding aur Consistent Hashing", plan: ["Range vs hash sharding", "Hot shard", "Consistent hashing visual"] },
        { id: "cap", title: "CAP theorem aur consistency", plan: ["Strong vs eventual", "Quorum (simple)"] },
        { id: "message-queue", title: "Message Queue (Kafka / RabbitMQ)", plan: ["Sync vs async", "Kab queue lagao: spikes, slow work, decoupling", "Kafka vs RabbitMQ", "At-least-once, idempotency", "Simulator: spike pe queue"] },
        { id: "search", title: "Search (Elasticsearch)", plan: ["Inverted index", "Kab DB ki LIKE query kaafi nahi"] },
        { id: "rate-limiting", title: "Rate limiting", plan: ["Token bucket, sliding window", "Distributed rate limiter with Redis"] },
        { id: "observability", title: "Monitoring, logging, alerting", plan: ["Metrics, logs, traces", "SLI/SLO"] }
      ]
    },
    {
      title: "Patterns",
      lessons: [
        { id: "monolith-micro", title: "Monolith vs Microservices", plan: ["Kab todna chahiye"] },
        { id: "reliability", title: "Retries, timeouts, circuit breaker", plan: ["Exponential backoff + jitter", "Idempotency keys"] },
        { id: "data-patterns", title: "Saga, CQRS, Event sourcing (overview)", plan: ["Distributed transactions ka problem"] },
        { id: "fanout", title: "Fan-out on write vs read", plan: ["News feed ka core trade-off"] },
        { id: "realtime", title: "Polling, long polling, WebSocket, SSE", plan: ["Chat aur notifications ke liye"] }
      ]
    },
    {
      title: "Interview framework",
      lessons: [
        { id: "framework", title: "45 minute ka HLD framework", plan: ["Requirements (functional / non-functional)", "Estimation → API → data model → high level design → deep dive → bottlenecks"] }
      ]
    },
    {
      title: "Designs (simple se shuru, scale ke saath badhte hue)",
      lessons: [
        { id: "url-shortener", title: "URL Shortener", plan: ["ID generation (base62, counter vs hash)", "Read-heavy: cache", "DB choice"] },
        { id: "rate-limiter-hld", title: "Distributed Rate Limiter", plan: ["Redis + Lua", "Where to place it"] },
        { id: "notification", title: "Notification System", plan: ["Queue per channel, retries, user preferences"] },
        { id: "chat", title: "Chat (WhatsApp)", plan: ["WebSocket servers, presence", "Message storage, delivery receipts", "Group chat fan-out"] },
        { id: "twitter", title: "Twitter / News Feed", plan: ["Tweet storage, timeline", "Fan-out on write vs read, celebrity problem", "Cache design"] },
        { id: "youtube", title: "YouTube", plan: ["Upload pipeline, transcoding queue", "CDN, adaptive streaming", "Metadata DB, view counts"] },
        { id: "chatgpt", title: "ChatGPT jaisa LLM chat app", plan: ["Streaming responses (SSE)", "GPU inference servers, queue, batching", "Conversation storage, rate limits, cost"] },
        { id: "uber", title: "Uber (ride matching)", plan: ["Location updates, geohash / quadtree", "Matching service"] }
      ]
    }
  ]
});
