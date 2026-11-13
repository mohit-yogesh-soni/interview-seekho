// Module 3: Java Concurrency (outline). Har topic: problem dikhao → tool → code chalao → thread visualizer.
registerModule({
  id: "concurrency",
  intro: "Pehle problem dekho (race condition, deadlock), phir uska tool seekho. Har lesson mein code chalao. Thread timeline visualizer dikhayega ki kaunsa thread kab lock pakadta hai aur kab wait karta hai.",
  chapters: [
    {
      title: "Threads basics",
      lessons: [
        { id: "process-thread", title: "Process vs Thread, concurrency vs parallelism", plan: ["CPU, cores, context switch", "Kab threads se fayda hai (I/O bound vs CPU bound)"] },
        { id: "create-threads", title: "Thread banana", plan: ["extends Thread vs Runnable vs lambda", "start() vs run() (interview trap)", "join, sleep, daemon threads"] },
        { id: "thread-lifecycle", title: "Thread lifecycle aur interrupt", plan: ["NEW, RUNNABLE, BLOCKED, WAITING, TIMED_WAITING, TERMINATED", "interrupt() ka sahi use"] }
      ]
    },
    {
      title: "Problems aur basic tools",
      lessons: [
        { id: "race-condition", title: "Race condition", plan: ["count++ atomic kyun nahi hai", "Visualizer: do threads ka interleaving", "Critical section"] },
        { id: "synchronized", title: "synchronized", plan: ["Method vs block, kis object pe lock", "Intrinsic lock aur reentrancy", "Static synchronized"] },
        { id: "volatile", title: "volatile aur visibility", plan: ["CPU cache aur visibility problem", "happens-before (simple)", "volatile atomicity nahi deta"] },
        { id: "wait-notify", title: "wait / notify (Producer-Consumer)", plan: ["while loop mein wait kyun", "notify vs notifyAll", "Practice: bounded buffer"] },
        { id: "deadlock", title: "Deadlock, livelock, starvation", plan: ["4 conditions", "Lock ordering se bachna", "Visualizer: deadlock banao aur todo"] }
      ]
    },
    {
      title: "java.util.concurrent",
      lessons: [
        { id: "reentrant-lock", title: "ReentrantLock aur Condition", plan: ["lock/unlock in finally", "tryLock with timeout, fairness", "Condition: await/signal", "synchronized vs ReentrantLock table"] },
        { id: "rw-lock", title: "ReadWriteLock aur StampedLock", plan: ["Read-heavy cache example", "Optimistic read (intro)"] },
        { id: "atomic-cas", title: "Atomic variables aur CAS", plan: ["AtomicInteger, compareAndSet", "LongAdder", "ABA problem (intro)"] },
        { id: "executors", title: "Executors aur Thread Pools", plan: ["Thread pool kyun", "Fixed, cached, single, scheduled", "ThreadPoolExecutor params aur rejection policy", "shutdown vs shutdownNow", "Pool size kaise chunein"] },
        { id: "future-completable", title: "Callable, Future, CompletableFuture", plan: ["Future.get blocking", "thenApply, thenCompose, thenCombine, allOf", "Exception handling"] }
      ]
    },
    {
      title: "Synchronizers",
      lessons: [
        { id: "countdownlatch", title: "CountDownLatch", plan: ["Services start hone ka wait", "Practice"] },
        { id: "cyclicbarrier", title: "CyclicBarrier", plan: ["Latch vs Barrier", "Practice: multi-phase computation"] },
        { id: "semaphore", title: "Semaphore", plan: ["Permits = limited resources (DB connections)", "Practice: connection pool limiter"] },
        { id: "phaser-exchanger", title: "Phaser (overview)", plan: ["Kab chahiye, kab nahi"] }
      ]
    },
    {
      title: "Concurrent Collections",
      lessons: [
        { id: "chm", title: "ConcurrentHashMap", plan: ["Hashtable vs synchronizedMap vs CHM", "compute, merge, putIfAbsent", "Internals (Java 8+)"] },
        { id: "blocking-queue", title: "BlockingQueue", plan: ["ArrayBlockingQueue, LinkedBlockingQueue", "Producer-Consumer the easy way"] },
        { id: "cow-threadlocal", title: "CopyOnWriteArrayList aur ThreadLocal", plan: ["Read-heavy lists", "ThreadLocal use cases aur memory leak"] }
      ]
    },
    {
      title: "Modern Java aur Interview classics",
      lessons: [
        { id: "virtual-threads", title: "Virtual Threads (Java 21)", plan: ["Platform vs virtual threads", "Kab fayda, pinning (theory)"] },
        { id: "odd-even", title: "Classic: do threads se odd-even print", plan: ["wait/notify version", "Semaphore version"] },
        { id: "bounded-queue", title: "Classic: apni Bounded Blocking Queue", plan: ["ReentrantLock + 2 Conditions"] },
        { id: "singleton-thread-safe", title: "Classic: Thread-safe Singleton", plan: ["Double-checked locking + volatile", "Holder idiom, enum singleton"] },
        { id: "rate-limiter-code", title: "Classic: Rate Limiter (Token Bucket)", plan: ["Thread-safe implementation"] },
        { id: "dining-philosophers", title: "Classic: Dining Philosophers", plan: ["Deadlock aur uska solution"] }
      ]
    }
  ]
});
