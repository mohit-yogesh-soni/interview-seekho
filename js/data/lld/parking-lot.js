// Parking Lot
registerLesson("lld", "parking-lot", {
  why: "Sabse common LLD question. Isme poora process ek baar karo: requirements → entities → relationships → patterns (Strategy for allocation/pricing) → DB tables → code. Ye flow baaki saare problems ka template hai.",
  blocks: [
    {
      type: "text",
      html: `
        <h2>Step 1: Requirements (scope chhota rakho)</h2>
        <p>Interviewer: "Parking lot design karo." Aap clarify karte ho aur ye scope lock karte ho:</p>
        <ul>
          <li>Kai <b>floors</b>, har floor pe <b>spots</b> of size SMALL (bike), MEDIUM (car), LARGE (truck/bus).</li>
          <li>Vehicle aaye → sabse pehla fit hone wala free spot (chhota vehicle bade spot mein bhi chal sakta hai) → <b>ticket</b>.</li>
          <li>Exit pe ticket se <b>fee</b>: hourly, vehicle type ke hisaab se (rule badal sakta hai).</li>
          <li>Out of scope (bol do): payment gateway, entry gates hardware, reservations.</li>
        </ul>`
    },
    {
      type: "think",
      id: "think-pl-entities",
      q: "<b>Step 2:</b> 5-sawaal list se entities, enums aur interfaces nikaalo. Kya fixed hai, kya badal sakta hai?",
      rubric: [
        { point: "<b>ParkingLot, Floor, Spot</b> (composition: lot ◆ floors ◆ spots)", keys: ["floor", "spot", "parkinglot", "parking lot"], weight: 2 },
        { point: "<b>Vehicle</b> + <b>VehicleType / SpotSize enum</b>", keys: ["vehicle", "enum", "spotsize", "vehicletype", "size"], weight: 2 },
        { point: "<b>Ticket</b> (vehicle, spot, entry time)", keys: ["ticket"], weight: 2 },
        { point: "Badalne wale: <b>PricingStrategy</b>, <b>AllocationStrategy</b> interfaces", keys: ["pricing", "allocation", "strategy", "fee strategy"], weight: 2 }
      ],
      answer: `<pre class="diagram">
ParkingLot 1 ◆── 1..* Floor 1 ◆── * Spot (id, size: SpotSize, vehicle: 0..1)
ParkingLot ── uses ─► AllocationStrategy «i»  (FirstFit, NearestToGate, EvFirst...)
ParkingLot ── uses ─► PricingStrategy «i»     (HourlyPricing, WeekendPricing...)
Ticket (id, vehicle, spot, entryTime) ── 1 ── Spot
Vehicle (number, type: VehicleType)     enum VehicleType { BIKE, CAR, TRUCK }
                                        enum SpotSize { SMALL, MEDIUM, LARGE }</pre>
        <ul>
          <li>Sizes/types fixed → enums. "Kaunsa vehicle kaunse spot mein fit" ek mapping: BIKE → SMALL+, CAR → MEDIUM+, TRUCK → LARGE.</li>
          <li>Allocation aur pricing badal sakte hain → Strategy. Ticket = action (park) ka record.</li>
          <li><code>ParkingLot</code> facade jaisa entry point: <code>park(vehicle)</code>, <code>unpark(ticketId, exitTime)</code>.</li>
        </ul>`
    },
    {
      type: "think",
      id: "think-pl-db",
      q: "<b>Step 3:</b> DB tables likho. Ek spot pe ek waqt ek hi active ticket ho, ye DB level pe kaise ensure karoge?",
      rubric: [
        { point: "Tables: <b>floors, spots, tickets</b> (vehicles optional)", keys: ["floors", "spots", "tickets"], weight: 2 },
        { point: "spots: floor_id FK, size; tickets: spot_id FK, vehicle_number, entry_time, exit_time (nullable), fee", keys: ["floor_id", "spot_id", "entry_time", "exit_time", "fee"], weight: 2 },
        { point: "Ek active ticket per spot: <b>partial unique index</b> (WHERE exit_time IS NULL) / spot.status + conditional update", keys: ["partial", "unique", "exit_time is null", "where exit_time", "conditional", "status"], weight: 2 }
      ],
      answer: `<pre class="code-static">floors(id PK, lot_id, number)
spots(id PK, floor_id FK, size, status)          -- status: FREE / OCCUPIED
tickets(id PK, spot_id FK, vehicle_number, vehicle_type,
        entry_time, exit_time NULL, fee NULL)
-- ek spot ka ek hi active ticket (Postgres partial unique index):
CREATE UNIQUE INDEX one_active_ticket ON tickets(spot_id) WHERE exit_time IS NULL;</pre>
        <p>Allocation ke waqt race (do gates same spot dein): <code>UPDATE spots SET status='OCCUPIED' WHERE id=? AND status='FREE'</code> aur affected rows check, ya upar wala unique index. Free spots jaldi dhoondhne ke liye index <code>(size, status)</code>.</p>`
    },
    {
      type: "exercise",
      id: "ex-parking-lot",
      title: "Parking Lot core (Strategy for pricing)",
      level: "Medium",
      task: `<p>Diye gaye types ke saath <code>ParkingLot</code> likho:</p>
        <ul>
          <li><code>ParkingLot(List&lt;List&lt;SpotSize&gt;&gt; floors, PricingStrategy pricing)</code>: floor i ke spots ki sizes. Spot id = <code>"F&lt;floor&gt;-&lt;index&gt;"</code> (0-based), jaise <code>"F0-2"</code>.</li>
          <li><code>Ticket park(String number, VehicleType type, long entryMinute)</code>: floor 0 se, index order mein, pehla <b>free aur fit hone wala</b> spot (BIKE → SMALL/MEDIUM/LARGE, CAR → MEDIUM/LARGE, TRUCK → LARGE). Na mile → <code>null</code>. Same vehicle number pehle se andar ho → <code>IllegalStateException</code>.</li>
          <li><code>long unpark(String ticketId, long exitMinute)</code>: fee = <code>pricing.fee(type, minutes)</code>, spot free. Galat/used ticket → <code>IllegalArgumentException</code>.</li>
          <li><code>int freeSpots(SpotSize size)</code>.</li>
          <li><code>HourlyPricing</code> likho: per <b>shuru hua</b> ghanta (61 min = 2 ghante, 0 min = 1 ghanta): BIKE 10, CAR 30, TRUCK 80.</li>
        </ul>
        <p>Ticket id <code>"T1"</code>, <code>"T2"</code>... order mein.</p>`,
      examples: "floors <code>[[SMALL, MEDIUM], [LARGE]]</code>: car → F0-1, truck → F1-0, doosri car → null. Car 0→90 min → 2 ghante × 30 = 60",
      userFile: "Solution.java",
      starter: `import java.util.*;

enum SpotSize { SMALL, MEDIUM, LARGE }
enum VehicleType { BIKE, CAR, TRUCK }

record Ticket(String id, String vehicleNumber, VehicleType type, String spotId, long entryMinute) {}

interface PricingStrategy {
    long fee(VehicleType type, long minutes);
}

class HourlyPricing implements PricingStrategy {
    public long fee(VehicleType type, long minutes) { return 0; }   // TODO
}

class ParkingLot {
    ParkingLot(List<List<SpotSize>> floors, PricingStrategy pricing) { }
    Ticket park(String number, VehicleType type, long entryMinute) { return null; }
    long unpark(String ticketId, long exitMinute) { return 0; }
    int freeSpots(SpotSize size) { return 0; }
}`,
      harness: `import seekho.Check;
import java.util.*;

public class Main {
    static ParkingLot lot() {
        return new ParkingLot(List.of(List.of(SpotSize.SMALL, SpotSize.MEDIUM), List.of(SpotSize.LARGE)), new HourlyPricing());
    }
    static <T extends RuntimeException> String ex(Runnable r, Class<T> c) { try { r.run(); return "none"; } catch (RuntimeException e) { return c.isInstance(e) ? c.getSimpleName() : e.toString(); } }

    public static void main(String[] args) {
        Check.eq("allocation", Arrays.asList("F0-1", "F1-0", null), () -> {
            ParkingLot p = lot();
            Ticket a = p.park("MH01", VehicleType.CAR, 0), b = p.park("MH02", VehicleType.TRUCK, 0), c = p.park("MH03", VehicleType.CAR, 0);
            return Arrays.asList(a.spotId(), b.spotId(), c == null ? null : c.spotId());
        });
        Check.eq("fee car 90 min", 60L, () -> { ParkingLot p = lot(); Ticket t = p.park("X", VehicleType.CAR, 0); return p.unpark(t.id(), 90); });
        Check.hiddenFromHere();
        Check.eq("bike pehle SMALL", "F0-0", () -> lot().park("B1", VehicleType.BIKE, 5).spotId());
        Check.eq("bike small full → medium", "F0-1", () -> { ParkingLot p = lot(); p.park("B1", VehicleType.BIKE, 0); return p.park("B2", VehicleType.BIKE, 0).spotId(); });
        Check.eq("unpark ke baad spot free", List.of(0, 1), () -> {
            ParkingLot p = lot(); Ticket t = p.park("C", VehicleType.CAR, 0);
            int during = p.freeSpots(SpotSize.MEDIUM); p.unpark(t.id(), 10); return List.of(during, p.freeSpots(SpotSize.MEDIUM));
        });
        Check.eq("hourly boundaries [0,60,61] car", List.of(30L, 30L, 60L), () -> {
            HourlyPricing h = new HourlyPricing(); return List.of(h.fee(VehicleType.CAR, 0), h.fee(VehicleType.CAR, 60), h.fee(VehicleType.CAR, 61));
        });
        Check.eq("truck 3h, bike 1h", List.of(240L, 10L), () -> { HourlyPricing h = new HourlyPricing(); return List.of(h.fee(VehicleType.TRUCK, 180), h.fee(VehicleType.BIKE, 30)); });
        Check.eq("same vehicle dobara → ISE", "IllegalStateException", () -> { ParkingLot p = lot(); p.park("DUP", VehicleType.BIKE, 0); return ex(() -> p.park("DUP", VehicleType.BIKE, 1), IllegalStateException.class); });
        Check.eq("ticket dobara use → IAE", "IllegalArgumentException", () -> {
            ParkingLot p = lot(); Ticket t = p.park("C", VehicleType.CAR, 0); p.unpark(t.id(), 5);
            return ex(() -> p.unpark(t.id(), 6), IllegalArgumentException.class);
        });
        Check.eq("ticket ids", List.of("T1", "T2"), () -> { ParkingLot p = lot(); return List.of(p.park("a", VehicleType.BIKE, 0).id(), p.park("b", VehicleType.BIKE, 0).id()); });
        Check.eq("naya pricing bina lot badle (flat 5)", 5L, () -> {
            ParkingLot p = new ParkingLot(List.of(List.of(SpotSize.LARGE)), (t, m) -> 5);
            return p.unpark(p.park("Z", VehicleType.TRUCK, 0).id(), 999);
        });
    }
}`,
      hints: [
        "Andar ek <code>Spot</code> class (id, size, occupiedBy). Floors ko ek <code>List&lt;Spot&gt;</code> mein floor order mein bhar do. Maps: <code>active tickets (id → Ticket)</code>, <code>parked vehicles (number → spot)</code>.",
        "Fit: <code>size.ordinal() &gt;= minSize(type).ordinal()</code> jahan BIKE→SMALL, CAR→MEDIUM, TRUCK→LARGE (enums ka order SMALL &lt; MEDIUM &lt; LARGE).",
        "Hours: <code>Math.max(1, (minutes + 59) / 60)</code>. unpark: <code>active.remove(id)</code> null ho to IAE; spot free; vehicle map se hatao."
      ],
      solution: `import java.util.*;

enum SpotSize { SMALL, MEDIUM, LARGE }
enum VehicleType { BIKE, CAR, TRUCK }

record Ticket(String id, String vehicleNumber, VehicleType type, String spotId, long entryMinute) {}

interface PricingStrategy {
    long fee(VehicleType type, long minutes);
}

class HourlyPricing implements PricingStrategy {
    private static final Map<VehicleType, Long> RATE = Map.of(VehicleType.BIKE, 10L, VehicleType.CAR, 30L, VehicleType.TRUCK, 80L);
    public long fee(VehicleType type, long minutes) {
        long hours = Math.max(1, (minutes + 59) / 60);      // har shuru hua ghanta
        return hours * RATE.get(type);
    }
}

class ParkingLot {
    private static final class Spot {
        final String id; final SpotSize size; String vehicle;
        Spot(String id, SpotSize size) { this.id = id; this.size = size; }
    }

    private final List<Spot> spots = new ArrayList<>();          // floor order, index order
    private final Map<String, Spot> byId = new HashMap<>();
    private final Map<String, Ticket> active = new HashMap<>();
    private final Set<String> parked = new HashSet<>();
    private final PricingStrategy pricing;
    private int nextTicket = 1;

    ParkingLot(List<List<SpotSize>> floors, PricingStrategy pricing) {
        this.pricing = pricing;
        for (int f = 0; f < floors.size(); f++)
            for (int i = 0; i < floors.get(f).size(); i++) {
                Spot s = new Spot("F" + f + "-" + i, floors.get(f).get(i));
                spots.add(s);
                byId.put(s.id, s);
            }
    }

    private static SpotSize minSize(VehicleType t) {
        return switch (t) { case BIKE -> SpotSize.SMALL; case CAR -> SpotSize.MEDIUM; case TRUCK -> SpotSize.LARGE; };
    }

    Ticket park(String number, VehicleType type, long entryMinute) {
        if (parked.contains(number)) throw new IllegalStateException(number + " already inside");
        for (Spot s : spots) {                                     // FirstFit allocation
            if (s.vehicle == null && s.size.ordinal() >= minSize(type).ordinal()) {
                s.vehicle = number;
                parked.add(number);
                Ticket t = new Ticket("T" + nextTicket++, number, type, s.id, entryMinute);
                active.put(t.id(), t);
                return t;
            }
        }
        return null;                                               // lot full for this type
    }

    long unpark(String ticketId, long exitMinute) {
        Ticket t = active.remove(ticketId);
        if (t == null) throw new IllegalArgumentException("Invalid ticket " + ticketId);
        byId.get(t.spotId()).vehicle = null;
        parked.remove(t.vehicleNumber());
        return pricing.fee(t.type(), exitMinute - t.entryMinute());
    }

    int freeSpots(SpotSize size) {
        int n = 0;
        for (Spot s : spots) if (s.size == size && s.vehicle == null) n++;
        return n;
    }
}`,
      explain: "<p>Pricing Strategy hai (harness ne flat pricing lambda se jodi, lot nahi badla). Allocation abhi FirstFit loop hai; ise bhi <code>AllocationStrategy</code> interface bana sakte ho (follow-up). <code>park</code> O(spots) hai: bade lot ke liye har size ki free spots ki queue/TreeSet rakho to O(log n). Multi-gate ke liye <code>park</code>/<code>unpark</code> synchronized ya per-size lock (Concurrency module), aur DB pe conditional update.</p>"
    },
    {
      type: "pick",
      id: "pick-pl-followups",
      q: "Follow-ups ke liye kaunse design changes sahi hain?",
      options: [
        { text: "EV charging spots: SpotSize ke saath ek <code>features</code> set (EV) aur allocation strategy jo EV vehicles ko pehle EV spots de", correct: true, why: "Data + strategy, core loop nahi badla." },
        { text: "Weekend pricing: <code>HourlyPricing</code> mein if (weekend)", correct: false, why: "Open/Closed toota. Naya <code>WeekendPricing</code> ya time-aware strategy wrap (decorator)." },
        { text: "Display board: spot free/occupied hone pe Observer se board update", correct: true, why: "Lot ko board ka pata na ho." },
        { text: "Har floor ki alag ParkingLot class", correct: false, why: "Floor ek entity hai, lot ka hissa. Duplicate logic." },
        { text: "Free spots jaldi dhoondhne ke liye per-size min-heap / TreeSet of spot ids", correct: true, why: "O(n) scan se O(log n)." }
      ]
    },
    {
      type: "tip",
      html: "🎤 <b>Interview tip:</b> Code mein pehle <b>park → unpark → fee</b> ka flow chala ke dikhao (main method ya test). Phir khud hi bolo: <i>\"Allocation aur pricing strategies hain, isliye EV ya weekend rules aasaani se jud jaayenge; concurrency ke liye DB conditional update.\"</i>"
    }
  ],
  references: [
    { title: "Hello Interview: Low Level Design", by: "Hello Interview", url: "https://www.hellointerview.com/learn/low-level-design", type: "course" },
    { title: "Refactoring Guru: Strategy", by: "Refactoring Guru", url: "https://refactoring.guru/design-patterns/strategy", type: "article" }
  ]
});
