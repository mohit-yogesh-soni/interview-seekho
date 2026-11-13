// Template Method aur Iterator
registerLesson("lld", "template-method", {
  why: "Template Method: jab kai classes ka flow same ho (padho → transform → likho) par kuch steps alag hon. Iterator: collection ke andar ka structure chhupa ke ek ek item dena. Dono Java library mein har jagah hain, aur 'inheritance kab sahi hai' ka achha example Template Method hai.",
  blocks: [
    {
      type: "text",
      html: `
        <h2>Template Method</h2>
        <p><b>Problem:</b> Reports export: CSV aur JSON. Dono ka flow: data fetch → header → har row format → footer → save. Sirf format wale steps alag. Do classes mein poora flow copy kiya to ek mein bug fix, doosre mein bhool gaye.</p>
        <p><b>Template Method:</b> parent class mein ek <code>final</code> method jo flow (skeleton) define kare, aur alag steps <code>abstract</code> (ya default ke saath "hook") rakhe. Subclasses sirf wo steps bharti hain.</p>
        <pre class="code-static">abstract class Exporter {
    public final String export(List&lt;Row&gt; rows) {      // template: order fix, override nahi ho sakta
        StringBuilder sb = new StringBuilder(header());
        for (int i = 0; i &lt; rows.size(); i++) sb.append(formatRow(rows.get(i), i));
        sb.append(footer());
        return sb.toString();
    }
    protected abstract String header();
    protected abstract String formatRow(Row r, int index);
    protected String footer() { return ""; }            // hook: chahe to override
}</pre>
        <p><b>Strategy vs Template Method:</b> dono "algorithm ka badalne wala hissa" alag karte hain. Template = inheritance (compile time, subclass), flow parent ke control mein. Strategy = composition (runtime swap). Aaj kal Strategy zyada flexible maana jaata hai, par jab flow fix ho aur steps chhote, Template saaf hai. Java examples: <code>AbstractList</code> (sirf <code>get</code> aur <code>size</code> do, baaki iterator/contains free), JUnit ka setup → test → teardown.</p>
        <h2>Iterator</h2>
        <p>Collection ka andar ka structure (array, linked nodes, tree) chhupa ke ek common tareeka: <code>hasNext()</code>, <code>next()</code>. Java ka <code>for (x : collection)</code> isi pe chalta hai: jo class <code>Iterable</code> implement kare, wo for-each mein chal jaati hai.</p>`
    },
    {
      type: "code",
      title: "Template Method exporter + custom Iterable (range with step)",
      code: `import java.util.*;

public class Main {
    record Row(String name, int score) {}

    static abstract class Exporter {
        public final String export(List<Row> rows) {
            StringBuilder sb = new StringBuilder(header());
            for (int i = 0; i < rows.size(); i++) sb.append(formatRow(rows.get(i), i));
            return sb.append(footer()).toString();
        }
        protected abstract String header();
        protected abstract String formatRow(Row r, int i);
        protected String footer() { return ""; }
    }

    static class CsvExporter extends Exporter {
        protected String header() { return "name,score\\n"; }
        protected String formatRow(Row r, int i) { return r.name() + "," + r.score() + "\\n"; }
    }

    static class JsonExporter extends Exporter {
        protected String header() { return "["; }
        protected String formatRow(Row r, int i) { return (i > 0 ? "," : "") + "{\\"name\\":\\"" + r.name() + "\\",\\"score\\":" + r.score() + "}"; }
        protected String footer() { return "]"; }
    }

    // Iterator: for-each mein chalne wala range(start, end, step)
    static class Range implements Iterable<Integer> {
        private final int start, end, step;
        Range(int start, int end, int step) { this.start = start; this.end = end; this.step = step; }
        public Iterator<Integer> iterator() {
            return new Iterator<>() {
                int cur = start;
                public boolean hasNext() { return cur < end; }
                public Integer next() {
                    if (!hasNext()) throw new NoSuchElementException();
                    int v = cur; cur += step; return v;
                }
            };
        }
    }

    public static void main(String[] args) {
        List<Row> rows = List.of(new Row("riya", 90), new Row("aman", 75));
        System.out.print(new CsvExporter().export(rows));
        System.out.println(new JsonExporter().export(rows));
        for (int x : new Range(0, 10, 3)) System.out.print(x + " ");
        System.out.println();
    }
}`
    },
    {
      type: "exercise",
      id: "ex-template-iterator",
      title: "Markdown exporter + paginated iterator",
      level: "Easy",
      task: `<p>Do kaam:</p>
        <ol>
          <li><code>Exporter</code> (template, diya hai) ke liye <code>MarkdownExporter</code>: header <code>"| name | score |\\n|---|---|\\n"</code>, har row <code>"| riya | 90 |\\n"</code>, footer <code>"\\n_2 rows_"</code> (rows ki ginti, isliye <code>footer(int count)</code> hook diya hai).</li>
          <li><code>Pages implements Iterable&lt;List&lt;String&gt;&gt;</code>: <code>Pages(List&lt;String&gt; items, int pageSize)</code> for-each mein ek ek <b>page</b> (sublist) de. Khaali list → koi page nahi. Iterator khatam hone ke baad <code>next()</code> → <code>NoSuchElementException</code>.</li>
        </ol>`,
      examples: "<code>new Pages([a,b,c,d,e], 2)</code> → <code>[a,b]</code>, <code>[c,d]</code>, <code>[e]</code>",
      userFile: "Solution.java",
      starter: `import java.util.*;

record Row(String name, int score) {}

abstract class Exporter {
    public final String export(List<Row> rows) {
        StringBuilder sb = new StringBuilder(header());
        for (Row r : rows) sb.append(formatRow(r));
        return sb.append(footer(rows.size())).toString();
    }
    protected abstract String header();
    protected abstract String formatRow(Row r);
    protected String footer(int count) { return ""; }
}

class MarkdownExporter extends Exporter {
    protected String header() { return ""; }            // TODO
    protected String formatRow(Row r) { return ""; }    // TODO
}

class Pages implements Iterable<List<String>> {
    Pages(List<String> items, int pageSize) { }
    public Iterator<List<String>> iterator() { return Collections.emptyIterator(); }   // TODO
}`,
      harness: `import seekho.Check;
import java.util.*;

public class Main {
    static List<List<String>> all(Pages p) { List<List<String>> o = new ArrayList<>(); for (List<String> pg : p) o.add(pg); return o; }

    public static void main(String[] args) {
        Check.eq("markdown", "| name | score |\\n|---|---|\\n| riya | 90 |\\n| aman | 75 |\\n\\n_2 rows_",
            () -> new MarkdownExporter().export(List.of(new Row("riya", 90), new Row("aman", 75))));
        Check.eq("pages of 2", List.of(List.of("a", "b"), List.of("c", "d"), List.of("e")), () -> all(new Pages(List.of("a", "b", "c", "d", "e"), 2)));
        Check.hiddenFromHere();
        Check.eq("markdown empty", "| name | score |\\n|---|---|\\n\\n_0 rows_", () -> new MarkdownExporter().export(List.of()));
        Check.eq("empty pages", List.of(), () -> all(new Pages(List.of(), 3)));
        Check.eq("exact multiple", List.of(List.of("a", "b"), List.of("c", "d")), () -> all(new Pages(List.of("a", "b", "c", "d"), 2)));
        Check.eq("page bada", List.of(List.of("x")), () -> all(new Pages(List.of("x"), 10)));
        Check.eq("khatam ke baad next → NoSuchElementException", "NSEE", () -> {
            Iterator<List<String>> it = new Pages(List.of("a"), 1).iterator(); it.next();
            try { it.next(); return "no exception"; } catch (NoSuchElementException e) { return "NSEE"; }
        });
        Check.eq("do baar iterate (naya iterator)", 2, () -> { Pages p = new Pages(List.of("a", "b", "c"), 2); all(p); return all(p).size(); });
    }
}`,
      hints: [
        "Markdown: <code>formatRow</code> → <code>\"| \" + r.name() + \" | \" + r.score() + \" |\\n\"</code>; footer override: <code>\"\\n_\" + count + \" rows_\"</code>.",
        "Pages iterator: <code>int from = 0;</code> hasNext = <code>from &lt; items.size()</code>; next = <code>items.subList(from, Math.min(from + size, items.size()))</code> aur from badhao. Har <code>iterator()</code> call naya iterator object."
      ],
      solution: `import java.util.*;

record Row(String name, int score) {}

abstract class Exporter {
    public final String export(List<Row> rows) {
        StringBuilder sb = new StringBuilder(header());
        for (Row r : rows) sb.append(formatRow(r));
        return sb.append(footer(rows.size())).toString();
    }
    protected abstract String header();
    protected abstract String formatRow(Row r);
    protected String footer(int count) { return ""; }
}

class MarkdownExporter extends Exporter {
    protected String header() { return "| name | score |\\n|---|---|\\n"; }
    protected String formatRow(Row r) { return "| " + r.name() + " | " + r.score() + " |\\n"; }
    @Override protected String footer(int count) { return "\\n_" + count + " rows_"; }
}

class Pages implements Iterable<List<String>> {
    private final List<String> items;
    private final int size;

    Pages(List<String> items, int pageSize) { this.items = List.copyOf(items); this.size = pageSize; }

    public Iterator<List<String>> iterator() {
        return new Iterator<>() {
            int from = 0;
            public boolean hasNext() { return from < items.size(); }
            public List<String> next() {
                if (!hasNext()) throw new NoSuchElementException();
                List<String> page = items.subList(from, Math.min(from + size, items.size()));
                from += size;
                return page;
            }
        };
    }
}`,
      explain: "<p>MarkdownExporter ne sirf 3 chhote steps likhe; flow (order, loop) parent ka hai aur <code>final</code> hone se koi tod nahi sakta. Pages ka iterator har baar naya hai, isliye ek hi object pe do baar for-each chalta hai. Ye pagination APIs (DB cursor, S3 listing) ka chhota roop hai: caller ko pata nahi ki andar pages kaise aate hain.</p>"
    },
    {
      type: "quiz",
      q: "Template method ko <code>final</code> kyun banaya jaata hai?",
      options: [
        "Performance ke liye",
        "Taaki subclass poora flow override karke steps ka order na tod de; sirf diye gaye steps badal sakein",
        "Java mein abstract class ke methods final hone chahiye",
        "Thread safety"
      ],
      answer: 1,
      why: "Pattern ka wada hai: skeleton parent ka, details child ki. final se ye wada compiler enforce karta hai."
    },
    {
      type: "tip",
      html: "🎤 <b>Interview tip:</b> Template Method bolte waqt trade-off bhi bolo: <i>\"Ye inheritance hai, to steps compile time pe fix hain; agar runtime pe mix karna ho to main steps ko strategies bana dunga.\"</i>"
    }
  ],
  references: [
    { title: "Refactoring Guru: Template Method", by: "Refactoring Guru", url: "https://refactoring.guru/design-patterns/template-method", type: "article" },
    { title: "Refactoring Guru: Iterator", by: "Refactoring Guru", url: "https://refactoring.guru/design-patterns/iterator", type: "article" }
  ]
});
