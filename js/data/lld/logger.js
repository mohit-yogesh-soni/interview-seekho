// Logging framework
registerLesson("lld", "logger", {
  why: "Logger design ek 'patterns combo' question hai: levels ke liye Chain/filter, outputs (console, file, remote) ke liye Observer/Strategy, formatting ke liye Strategy, aur ek global logger ke liye Singleton/factory. Log4j/Logback jaise asli frameworks isi structure pe hain.",
  blocks: [
    {
      type: "text",
      html: `
        <h2>Requirements</h2>
        <ul>
          <li>Levels: DEBUG &lt; INFO &lt; WARN &lt; ERROR. Logger ka min level set ho; usse neeche wale ignore.</li>
          <li>Kai <b>appenders</b> (destinations): console, file, remote. Har appender ka apna min level bhi ho (file mein sab, PagerDuty mein sirf ERROR).</li>
          <li>Formatter: <code>"[LEVEL] logger: message"</code> ya JSON. Badal sakta hai.</li>
          <li>Named loggers (<code>Logger.get("payments")</code>), same naam = same object.</li>
        </ul>
        <pre class="diagram">
LoggerFactory.get(name) ──► Logger (name, level) ── * Appender «i» (append(LogEvent))
                                                       ▲           ▲             ▲
                                              ConsoleAppender  FileAppender  MemoryAppender (tests)
Appender ── has ─► Formatter «i» (format(LogEvent))  ◁── PlainFormatter, JsonFormatter
LogEvent (level, logger, message, timestamp)   enum Level { DEBUG, INFO, WARN, ERROR }</pre>
        <ul>
          <li>Logger events ko saare appenders ko deta hai: <b>Observer</b>.</li>
          <li>Har appender apna level filter + formatter: <b>Strategy</b> (formatter), filter ek chhoti chain jaisa.</li>
          <li><code>LoggerFactory</code> naam → logger cache: ek naam ka ek object (<b>Flyweight/registry</b>, singleton-jaisa per naam).</li>
          <li><b>Async</b> follow-up: appender ke saamne bounded queue + background thread (Concurrency BlockingQueue lesson ka logging example).</li>
        </ul>`
    },
    {
      type: "exercise",
      id: "ex-logger",
      title: "Mini logging framework",
      level: "Medium",
      task: `<p>Types diye hain: <code>Level</code> enum, <code>LogEvent</code> record, <code>Formatter</code>, <code>Appender</code> interface (<code>void append(LogEvent e)</code>). Likho:</p>
        <ul>
          <li><code>PlainFormatter</code>: <code>"[INFO] payments: done"</code>.</li>
          <li><code>MemoryAppender(Level min, Formatter f)</code>: event.level ≥ min ho to formatted line apni <code>lines()</code> list mein.</li>
          <li><code>Logger</code>: <code>setLevel(Level)</code> (default INFO), <code>addAppender(a)</code>, <code>debug/info/warn/error(String msg)</code>. Logger level se neeche → kisi appender ko na jaaye. Koi appender exception phenke to baaki ko phir bhi mile.</li>
          <li><code>LoggerFactory.get(String name)</code>: same naam → same Logger object.</li>
        </ul>`,
      examples: "logger INFO, appender ERROR-only aur appender DEBUG: <code>warn(\"x\")</code> → sirf doosre mein <code>\"[WARN] app: x\"</code>",
      userFile: "Solution.java",
      starter: `import java.util.*;

enum Level { DEBUG, INFO, WARN, ERROR }

record LogEvent(Level level, String logger, String message) {}

interface Formatter { String format(LogEvent e); }
interface Appender { void append(LogEvent e); }

class PlainFormatter implements Formatter {
    public String format(LogEvent e) { return ""; }
}

class MemoryAppender implements Appender {
    MemoryAppender(Level min, Formatter f) { }
    public void append(LogEvent e) { }
    List<String> lines() { return List.of(); }
}

class Logger {
    Logger(String name) { }
    void setLevel(Level l) { }
    void addAppender(Appender a) { }
    void debug(String m) { }
    void info(String m) { }
    void warn(String m) { }
    void error(String m) { }
}

class LoggerFactory {
    static Logger get(String name) { return new Logger(name); }
}`,
      harness: `import seekho.Check;
import java.util.*;

public class Main {
    static int n = 0;
    static String uniq() { return "log" + (n++); }

    public static void main(String[] args) {
        Check.eq("levels per appender", List.of(List.of(), List.of("[WARN] app: x")), () -> {
            Logger l = new Logger("app");
            MemoryAppender errOnly = new MemoryAppender(Level.ERROR, new PlainFormatter()), all = new MemoryAppender(Level.DEBUG, new PlainFormatter());
            l.addAppender(errOnly); l.addAppender(all); l.warn("x");
            return List.of(errOnly.lines(), all.lines());
        });
        Check.eq("factory same object", true, () -> { String s = uniq(); return LoggerFactory.get(s) == LoggerFactory.get(s); });
        Check.hiddenFromHere();
        Check.eq("default INFO: debug ignore", List.of("[INFO] a: i", "[ERROR] a: e"), () -> {
            Logger l = new Logger("a"); MemoryAppender m = new MemoryAppender(Level.DEBUG, new PlainFormatter()); l.addAppender(m);
            l.debug("d"); l.info("i"); l.error("e"); return m.lines();
        });
        Check.eq("setLevel DEBUG", 1, () -> {
            Logger l = new Logger("a"); l.setLevel(Level.DEBUG); MemoryAppender m = new MemoryAppender(Level.DEBUG, new PlainFormatter()); l.addAppender(m); l.debug("d"); return m.lines().size();
        });
        Check.eq("crashing appender isolate", List.of("[ERROR] p: boom"), () -> {
            Logger l = new Logger("p"); l.addAppender(e -> { throw new RuntimeException("disk full"); });
            MemoryAppender m = new MemoryAppender(Level.INFO, new PlainFormatter()); l.addAppender(m); l.error("boom"); return m.lines();
        });
        Check.eq("custom JSON formatter bina framework badle", List.of("{\\"lvl\\":\\"WARN\\",\\"msg\\":\\"slow\\"}"), () -> {
            Logger l = new Logger("j");
            MemoryAppender m = new MemoryAppender(Level.INFO, e -> "{\\"lvl\\":\\"" + e.level() + "\\",\\"msg\\":\\"" + e.message() + "\\"}");
            l.addAppender(m); l.warn("slow"); return m.lines();
        });
        Check.eq("different names different loggers", false, () -> LoggerFactory.get(uniq()) == LoggerFactory.get(uniq()));
    }
}`,
      hints: [
        "Level compare: <code>e.level().compareTo(min) &gt;= 0</code> (enum ordinal order DEBUG &lt; INFO &lt; ...).",
        "Logger: <code>private void log(Level lv, String m)</code>: level check, phir har appender ko try-catch ke andar <code>append(new LogEvent(lv, name, m))</code>.",
        "Factory: <code>private static final Map&lt;String, Logger&gt; LOGGERS = new ConcurrentHashMap&lt;&gt;();</code> aur <code>computeIfAbsent(name, Logger::new)</code>."
      ],
      solution: `import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

enum Level { DEBUG, INFO, WARN, ERROR }

record LogEvent(Level level, String logger, String message) {}

interface Formatter { String format(LogEvent e); }
interface Appender { void append(LogEvent e); }

class PlainFormatter implements Formatter {
    public String format(LogEvent e) { return "[" + e.level() + "] " + e.logger() + ": " + e.message(); }
}

class MemoryAppender implements Appender {
    private final Level min;
    private final Formatter f;
    private final List<String> lines = new ArrayList<>();
    MemoryAppender(Level min, Formatter f) { this.min = min; this.f = f; }
    public synchronized void append(LogEvent e) { if (e.level().compareTo(min) >= 0) lines.add(f.format(e)); }
    synchronized List<String> lines() { return List.copyOf(lines); }
}

class Logger {
    private final String name;
    private volatile Level level = Level.INFO;
    private final List<Appender> appenders = new CopyOnWriteArrayList<>();   // add kam, log bahut

    Logger(String name) { this.name = name; }

    void setLevel(Level l) { level = l; }
    void addAppender(Appender a) { appenders.add(a); }

    private void log(Level lv, String m) {
        if (lv.compareTo(level) < 0) return;                 // jaldi bahar: sasta
        LogEvent e = new LogEvent(lv, name, m);
        for (Appender a : appenders) {
            try { a.append(e); } catch (RuntimeException ex) { /* ek appender ki galti baaki ko na roke */ }
        }
    }

    void debug(String m) { log(Level.DEBUG, m); }
    void info(String m) { log(Level.INFO, m); }
    void warn(String m) { log(Level.WARN, m); }
    void error(String m) { log(Level.ERROR, m); }
}

class LoggerFactory {
    private static final Map<String, Logger> LOGGERS = new ConcurrentHashMap<>();
    static Logger get(String name) { return LOGGERS.computeIfAbsent(name, Logger::new); }
}`,
      explain: "<p>Logger ko na formatting ka pata, na destination ka: dono interfaces. Level check sabse pehle (DEBUG logs production mein lagbhag free). CopyOnWriteArrayList: appenders kam badalte, log bahut hote hain. Factory registry se ek naam ka ek logger, thread-safe. Real frameworks mein loggers ka hierarchy (\"payments.upi\" parent \"payments\" se level inherit) aur async appenders bhi hote hain: follow-up mein bolo.</p>"
    },
    {
      type: "pick",
      id: "pick-logger",
      q: "Production logging ke liye kaunse design decisions sahi hain?",
      options: [
        { text: "<code>logger.debug(\"user \" + expensiveToString())</code> hamesha theek hai", correct: false, why: "Level off ho tab bhi string ban jaati hai. Lazy: <code>debug(() -&gt; ...)</code> ya parameterized <code>debug(\"user {}\", u)</code>." },
        { text: "Remote appender async (bounded queue), queue full pe drop + counter", correct: true, why: "Logging se request slow nahi honi chahiye." },
        { text: "Appender failure pe application crash kare", correct: false, why: "Logging best-effort; isolate karo." },
        { text: "Har log line mein traceId (MDC / ThreadLocal)", correct: true, why: "Distributed debugging ke liye zaroori (cow-threadlocal lesson)." },
        { text: "Formatter Strategy taaki JSON / plain switch config se ho", correct: true, why: "Log aggregation tools (ELK, Datadog) JSON pasand karte hain." }
      ]
    },
    {
      type: "tip",
      html: "🎤 <b>Interview tip:</b> Logger mein patterns ka naam ek saath mat bolo. Ek ek requirement uthao: <i>\"multiple destinations → appenders list (Observer); format badalta → Formatter strategy; ek naam ek logger → factory registry; slow destinations → async queue.\"</i>"
    }
  ],
  references: [
    { title: "Refactoring Guru: Observer", by: "Refactoring Guru", url: "https://refactoring.guru/design-patterns/observer", type: "article" },
    { title: "Refactoring Guru: Chain of Responsibility", by: "Refactoring Guru", url: "https://refactoring.guru/design-patterns/chain-of-responsibility", type: "article" }
  ]
});
