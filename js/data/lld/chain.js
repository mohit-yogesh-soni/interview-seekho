// Chain of Responsibility
registerLesson("lld", "chain", {
  why: "Request ko steps ki ek line se guzaarna jahan har step ya to khud handle kare, ya reject kare, ya aage bheje: auth → rate limit → validation → handler. Servlet filters, Spring interceptors, logger levels aur ATM cash dispenser sab isi pattern pe hain.",
  blocks: [
    {
      type: "text",
      html: `
        <h2>Problem: ek method mein saare checks</h2>
        <pre class="code-static">Response handle(Request r) {
    if (r.token == null) return 401;
    if (!rateLimiter.allow(r.user)) return 429;
    if (r.body.length() &gt; 1_000_000) return 413;
    if (!schema.valid(r.body)) return 400;
    ... asli kaam
}</pre>
        <p>Har naya check = method edit. Kuch endpoints pe rate limit nahi chahiye? Flags. Checks ka order badalna ho? Code move.</p>
        <p><b>Chain:</b> har check ek alag <b>handler</b> object. Har handler ke paas <b>next</b> ka reference. Wo decide karta hai: rok do (response lautao) ya <code>next.handle(r)</code>.</p>
        <pre class="diagram">
 request ─► [AuthHandler] ─ok─► [RateLimitHandler] ─ok─► [SizeHandler] ─ok─► [Controller]
               │ fail 401            │ fail 429              │ fail 413</pre>
        <p>Chain config se banti hai: alag endpoint = alag chain, order badalna = list ka order badalna.</p>
        <h3>Doosra roop: "jo handle kar sake wo kare"</h3>
        <p>Support ticket: L1 support → L2 → engineering. Har level dekhta hai "kya main ise sambhal sakta hoon?" warna aage. ATM: ₹2000 notes wala dispenser jitna de sake de, baaki ₹500 wale ko, phir ₹100.</p>`
    },
    {
      type: "exercise",
      id: "ex-atm-chain",
      title: "ATM cash dispenser chain",
      level: "Medium",
      task: `<p><code>NoteDispenser(int note, int count)</code> handlers ki chain banao. <code>setNext(d)</code> chaining ke liye next return kare.</p>
        <p><code>Map&lt;Integer, Integer&gt; dispense(int amount)</code> (sabse pehle handler pe call): har handler <code>min(amount / note, count)</code> notes de, baaki amount next ko. Result: note → kitne notes (sirf jo diye, bade note pehle — <code>LinkedHashMap</code> chain order mein).</p>
        <ul>
          <li>Agar poori chain ke baad bhi amount bacha → <code>IllegalArgumentException</code> aur <b>kisi bhi dispenser ka count kam nahi hona chahiye</b> (pehle check, phir dispense).</li>
          <li>Success pe counts kam ho jaayein (agli withdrawal mein dikhe).</li>
        </ul>`,
      examples: "chain 2000×2 → 500×5 → 100×10: <code>dispense(4700)</code> → <code>{2000=2, 500=1, 100=2}</code>",
      userFile: "Solution.java",
      starter: `import java.util.*;

class NoteDispenser {
    NoteDispenser(int note, int count) { }
    NoteDispenser setNext(NoteDispenser next) { return next; }
    Map<Integer, Integer> dispense(int amount) { return new LinkedHashMap<>(); }
}`,
      harness: `import seekho.Check;
import java.util.*;

public class Main {
    static NoteDispenser atm() {
        NoteDispenser a = new NoteDispenser(2000, 2);
        a.setNext(new NoteDispenser(500, 5)).setNext(new NoteDispenser(100, 10));
        return a;
    }
    static String iae(Runnable r) { try { r.run(); return "ok"; } catch (IllegalArgumentException e) { return "IAE"; } }

    public static void main(String[] args) {
        Check.eq("4700", Map.of(2000, 2, 500, 1, 100, 2), () -> atm().dispense(4700));
        Check.eq("order bade pehle", List.of(2000, 500, 100), () -> new ArrayList<>(atm().dispense(4700).keySet()));
        Check.hiddenFromHere();
        Check.eq("2000 notes khatam to 500 se", Map.of(2000, 2, 500, 4), () -> atm().dispense(6000));
        Check.eq("150 nahi ban sakta → IAE", "IAE", () -> iae(() -> atm().dispense(150)));
        Check.eq("fail pe counts same: phir 7500 possible", Map.of(2000, 2, 500, 5, 100, 10), () -> {
            NoteDispenser a = atm();
            iae(() -> a.dispense(99999));
            return a.dispense(7500);
        });
        Check.eq("success counts kam kare", "IAE", () -> { NoteDispenser a = atm(); a.dispense(7500); return iae(() -> a.dispense(100)); });
        Check.eq("sirf 100", Map.of(100, 3), () -> atm().dispense(300));
    }
}`,
      hints: [
        "Fields: note, count, next. Do private methods: <code>boolean canDispense(int amount)</code> (dry run: kitne de sakta, baaki next pe; end mein 0 bacha?) aur <code>void doDispense(int amount, Map out)</code>.",
        "<code>dispense</code>: <code>if (!canDispense(amount)) throw new IllegalArgumentException(...)</code>, phir <code>doDispense</code>. Is tarah fail pe kuch nahi badlega.",
        "Har level: <code>int use = Math.min(amount / note, count); int rest = amount - use * note;</code> rest == 0 to ruko, warna next (null ho to fail)."
      ],
      solution: `import java.util.*;

class NoteDispenser {
    private final int note;
    private int count;
    private NoteDispenser next;

    NoteDispenser(int note, int count) { this.note = note; this.count = count; }

    NoteDispenser setNext(NoteDispenser next) { this.next = next; return next; }

    Map<Integer, Integer> dispense(int amount) {
        if (!canDispense(amount)) throw new IllegalArgumentException("Cannot dispense " + amount);
        Map<Integer, Integer> out = new LinkedHashMap<>();
        doDispense(amount, out);
        return out;
    }

    private boolean canDispense(int amount) {          // dry run, kuch nahi badalta
        int use = Math.min(amount / note, count);
        int rest = amount - use * note;
        if (rest == 0) return true;
        return next != null && next.canDispense(rest);
    }

    private void doDispense(int amount, Map<Integer, Integer> out) {
        int use = Math.min(amount / note, count);
        if (use > 0) { out.put(note, use); count -= use; }
        int rest = amount - use * note;
        if (rest > 0) next.doDispense(rest, out);
    }
}`,
      explain: "<p>Har handler sirf apna note jaanta hai aur baaki <code>next</code> ko deta hai: ₹200 ka note jodna = chain mein ek naya dispenser. Do-phase (pehle check, phir karo) se adha-dispense (paise kam hue par notes nahi nikle) nahi hota. Note: greedy har note system ke liye optimal nahi hota (DSA Greedy lesson), par Indian denominations ke saath chalta hai.</p>"
    },
    {
      type: "quiz",
      q: "Chain of Responsibility aur Decorator dono mein objects ek doosre ko wrap/call karte hain. Farak?",
      options: [
        "Koi farak nahi",
        "Chain mein koi bhi handler request <b>rok</b> sakta hai (aage na bheje); Decorator hamesha andar wale ko call karta hai aur sirf behaviour jodta hai",
        "Decorator mein next nahi hota",
        "Chain sirf logging ke liye"
      ],
      answer: 1,
      why: "Chain = 'kaun handle karega / pass hoga ya nahi'. Decorator = 'sab karenge, upar se extra'. Real filters (Servlet) dono jaisa behave kar sakte hain: kuch rokte hain (auth), kuch extra jodte hain (logging)."
    },
    {
      type: "tip",
      html: "🎤 <b>Interview tip:</b> Middleware / validation pipeline / approval workflow (₹10k tak manager, ₹1L tak director, upar CFO) dikhe to Chain bolo. Chain list config se banao taaki order aur steps code badle bina badal sakein."
    }
  ],
  references: [
    { title: "Refactoring Guru: Chain of Responsibility", by: "Refactoring Guru", url: "https://refactoring.guru/design-patterns/chain-of-responsibility", type: "article" }
  ]
});
