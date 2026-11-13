// Adapter
registerLesson("lld", "adapter", {
  why: "Real projects mein aapka code kisi third-party SDK ya purane system se baat karta hai jiska interface aapke design se match nahi karta. Adapter beech ka 'travel plug' hai. Interview mein payment gateways ya legacy integration ke sawaalon mein aata hai.",
  blocks: [
    {
      type: "text",
      html: `
        <h2>Problem: interface match nahi karta</h2>
        <p>Aapke app ka interface (jo poora code use karta hai):</p>
        <pre class="code-static">interface PaymentGateway {
    PaymentResult pay(String orderId, long amountPaise);   // paise mein, result object
}</pre>
        <p>Naya partner ka SDK (aap badal nahi sakte):</p>
        <pre class="code-static">class LegacyBankSdk {
    int makeTransfer(double amountRupees, String reference);   // rupees double mein, 0 = success, baaki error code
}</pre>
        <p>Do bure raaste: (1) poore app ko LegacyBankSdk ke hisaab se badlo, (2) har jagah <code>if (bank == LEGACY)</code> karke conversion. Achha raasta: <b>ek class jo PaymentGateway implement kare aur andar SDK call kare</b>.</p>
        <pre class="diagram">
 App code ──► PaymentGateway «interface» ◁- - - LegacyBankAdapter ──has-a──► LegacyBankSdk
              pay(orderId, paise)              (paise→rupees,           makeTransfer(rupees, ref)
                                                int code→result)</pre>
        <p>Adapter ka kaam sirf <b>translation</b>: units (paise ↔ rupees), naam, parameter order, error format. Business logic adapter mein nahi.</p>`
    },
    {
      type: "code",
      title: "Adapter: purana SDK naye interface ke peeche",
      code: `public class Main {
    record PaymentResult(boolean success, String message) {}

    interface PaymentGateway {
        PaymentResult pay(String orderId, long amountPaise);
    }

    // Third-party: badal nahi sakte
    static class LegacyBankSdk {
        int makeTransfer(double amountRupees, String reference) {
            if (amountRupees > 100000) return 51;          // 51 = limit exceeded
            return 0;                                      // 0 = ok
        }
    }

    static class LegacyBankAdapter implements PaymentGateway {
        private final LegacyBankSdk sdk;
        LegacyBankAdapter(LegacyBankSdk sdk) { this.sdk = sdk; }

        @Override
        public PaymentResult pay(String orderId, long amountPaise) {
            int code = sdk.makeTransfer(amountPaise / 100.0, "ORD-" + orderId);   // units + naam translate
            return switch (code) {                                               // error format translate
                case 0 -> new PaymentResult(true, "OK");
                case 51 -> new PaymentResult(false, "Limit exceeded");
                default -> new PaymentResult(false, "Bank error " + code);
            };
        }
    }

    public static void main(String[] args) {
        PaymentGateway g = new LegacyBankAdapter(new LegacyBankSdk());   // app ko bas interface dikhta hai
        System.out.println(g.pay("42", 49_900));          // ₹499
        System.out.println(g.pay("43", 20_000_000));      // ₹2 lakh
    }
}`
    },
    {
      type: "quiz",
      q: "Java library mein Adapter ka example kaunsa hai?",
      options: [
        "<code>String.valueOf()</code>",
        "<code>InputStreamReader</code>: byte stream (<code>InputStream</code>) ko character <code>Reader</code> interface mein badalta hai",
        "<code>ArrayList</code>",
        "<code>Thread</code>"
      ],
      answer: 1,
      why: "InputStreamReader ek InputStream leta hai aur Reader interface deta hai (bytes → chars, charset ke saath). <code>Arrays.asList(array)</code> bhi array ko List interface ke roop mein dikhata hai."
    },
    {
      type: "exercise",
      id: "ex-adapter-weather",
      title: "Weather API adapter",
      level: "Easy",
      task: `<p>Aapka app <code>WeatherService</code> interface use karta hai: <code>double tempCelsius(String city)</code> aur <code>boolean isRaining(String city)</code>.</p>
        <p>Vendor SDK <code>UsWeatherApi</code> (diya hai, mat badlo) deta hai: <code>String fetch(String cityCode)</code> jo <code>"72.5F|RAIN"</code> ya <code>"60F|CLEAR"</code> jaisa string lautata hai, aur city ki jagah <b>city code</b> leta hai (<code>"Mumbai"</code> → <code>"BOM"</code>, map adapter ko constructor mein milega).</p>
        <p><code>UsWeatherAdapter(UsWeatherApi api, Map&lt;String, String&gt; cityCodes)</code> likho. Fahrenheit → Celsius: <code>(F − 32) × 5 / 9</code>, 1 decimal tak round (<code>Math.round(c * 10) / 10.0</code>). Unknown city → <code>IllegalArgumentException</code>.</p>`,
      examples: "<code>\"72.5F|RAIN\"</code> → <code>tempCelsius</code> = <code>22.5</code>, <code>isRaining</code> = <code>true</code>",
      userFile: "Solution.java",
      starter: `import java.util.*;

interface WeatherService {
    double tempCelsius(String city);
    boolean isRaining(String city);
}

class UsWeatherApi {
    private final Map<String, String> data;
    UsWeatherApi(Map<String, String> data) { this.data = data; }
    String fetch(String cityCode) { return data.get(cityCode); }
}

class UsWeatherAdapter implements WeatherService {
    UsWeatherAdapter(UsWeatherApi api, Map<String, String> cityCodes) { }
    public double tempCelsius(String city) { return 0; }      // TODO
    public boolean isRaining(String city) { return false; }   // TODO
}`,
      harness: `import seekho.Check;
import java.util.*;

public class Main {
    static WeatherService svc() {
        UsWeatherApi api = new UsWeatherApi(Map.of("BOM", "72.5F|RAIN", "DEL", "104F|CLEAR", "LEH", "14F|SNOW"));
        return new UsWeatherAdapter(api, Map.of("Mumbai", "BOM", "Delhi", "DEL", "Leh", "LEH"));
    }

    public static void main(String[] args) {
        Check.eq("Mumbai temp", 22.5, () -> svc().tempCelsius("Mumbai"));
        Check.eq("Mumbai rain", true, () -> svc().isRaining("Mumbai"));
        Check.hiddenFromHere();
        Check.eq("Delhi 104F", 40.0, () -> svc().tempCelsius("Delhi"));
        Check.eq("Delhi rain", false, () -> svc().isRaining("Delhi"));
        Check.eq("Leh negative", -10.0, () -> svc().tempCelsius("Leh"));
        Check.eq("snow is not rain", false, () -> svc().isRaining("Leh"));
        Check.eq("unknown city → IAE", "IAE", () -> {
            try { svc().tempCelsius("Pune"); return "no exception"; } catch (IllegalArgumentException e) { return "IAE"; }
        });
    }
}`,
      hints: [
        "Fields: api aur cityCodes. Ek private helper: <code>String[] raw(String city)</code> jo code dhoondhe (na mile to IAE) aur <code>api.fetch(code).split(\"\\\\|\")</code> lautaye.",
        "Temp: <code>parts[0]</code> se aakhri <code>F</code> hatao: <code>Double.parseDouble(p.substring(0, p.length() - 1))</code>. Rain: <code>parts[1].equals(\"RAIN\")</code>."
      ],
      solution: `import java.util.*;

interface WeatherService {
    double tempCelsius(String city);
    boolean isRaining(String city);
}

class UsWeatherApi {
    private final Map<String, String> data;
    UsWeatherApi(Map<String, String> data) { this.data = data; }
    String fetch(String cityCode) { return data.get(cityCode); }
}

class UsWeatherAdapter implements WeatherService {
    private final UsWeatherApi api;
    private final Map<String, String> cityCodes;

    UsWeatherAdapter(UsWeatherApi api, Map<String, String> cityCodes) {
        this.api = api;
        this.cityCodes = Map.copyOf(cityCodes);
    }

    private String[] raw(String city) {
        String code = cityCodes.get(city);
        if (code == null) throw new IllegalArgumentException("Unknown city: " + city);
        return api.fetch(code).split("\\\\|");
    }

    public double tempCelsius(String city) {
        String f = raw(city)[0];
        double fahrenheit = Double.parseDouble(f.substring(0, f.length() - 1));
        double c = (fahrenheit - 32) * 5 / 9;
        return Math.round(c * 10) / 10.0;
    }

    public boolean isRaining(String city) {
        return raw(city)[1].equals("RAIN");
    }
}`,
      explain: "<p>Saari 'vendor ki ajeeb baatein' (city code, F, pipe-separated string) ek class mein band. Kal vendor badla to sirf naya adapter likhna hai; app ka <code>WeatherService</code> use karne wala code nahi badlega. Isko <b>anti-corruption layer</b> bhi kehte hain (DDD): bahar ka model aapke model ko 'kharab' na kare.</p>"
    },
    {
      type: "think",
      id: "think-adapter-vs",
      q: "Interviewer: <b>\"Adapter aur Facade dono ek doosre object ko wrap karte hain. Farak kya hai?\"</b> (Facade agle lesson mein hai, apna andaza likho.)",
      rubric: [
        { point: "Adapter: <b>interface badalta</b> hai taaki ek existing interface se match kare (incompatible → compatible)", keys: ["interface badal", "convert", "translate", "match", "compatible", "incompatible"], weight: 2 },
        { point: "Adapter usually <b>ek</b> class/SDK ko wrap karta hai", keys: ["ek class", "one class", "single", "ek sdk"], weight: 1 },
        { point: "Facade: <b>kai classes</b> ke complex system ka ek simple entry point", keys: ["kai", "multiple", "subsystem", "simple", "complex", "entry point"], weight: 2 }
      ],
      answer: `<p><b>Adapter</b>: "mere paas ek interface already hai, ye cheez us shape mein fit nahi hoti" → shape badlo. Usually ek object wrap, intent = <i>compatibility</i>.</p>
        <p><b>Facade</b>: "ye subsystem bahut complicated hai (10 classes, sahi order mein call)" → ek simple naya interface do. Intent = <i>simplicity</i>. Facade apna naya interface define karta hai; adapter kisi existing interface ko implement karta hai.</p>`
    },
    {
      type: "tip",
      html: "🎤 <b>Interview tip:</b> Kisi bhi external system (payment gateway, SMS provider, maps API) ka zikr aaye to bolo: <i>\"Main apna interface define karunga aur vendor ke liye adapter, taaki vendor badalna ya test mein fake lagana aasaan ho.\"</i> Ye ek line Dependency Inversion + Adapter dono dikha deti hai."
    }
  ],
  references: [
    { title: "Refactoring Guru: Adapter", by: "Refactoring Guru", url: "https://refactoring.guru/design-patterns/adapter", type: "article" },
    { title: "Design Patterns (GoF): Adapter", by: "Gamma, Helm, Johnson, Vlissides", type: "book" }
  ]
});
