package seekho;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.function.Supplier;

/**
 * Exercises ke test cases ke liye chhota helper. Har problem ka Main (harness) isko use karta hai:
 *
 *   Check.eq("nums=[2,7], target=9", new int[]{0, 1}, () -> new Solution().twoSum(new int[]{2, 7}, 9));
 *   Check.hiddenFromHere();   // iske baad wale tests sirf "Submit" pe chalte hain
 *
 * Har test ek marker line print karta hai, jise website table mein dikhati hai:
 *   @@T|PASS or FAIL|visible or hidden|name|expected|actual|ms
 */
public final class Check {
    private static boolean runAll;
    private static boolean hidden;
    private static int pass;
    private static int fail;
    private static int total;

    private Check() {}

    static void reset(boolean all) {
        runAll = all;
        hidden = false;
        pass = 0;
        fail = 0;
        total = 0;
    }

    static void printSummary() {
        if (total > 0) System.out.println("@@SUMMARY|" + pass + "|" + fail + "|" + total);
    }

    /** Iske baad ke tests "hidden" hain: Run pe nahi, sirf Submit pe chalte hain. */
    public static void hiddenFromHere() {
        hidden = true;
    }

    /** Exact match (arrays, lists, numbers, strings sab). */
    public static void eq(String name, Object expected, Supplier<Object> actual) {
        test(name, expected, actual, 0);
    }

    /** Order matter nahi karta (sirf bahar wali list/array ka). */
    public static void eqAnyOrder(String name, Object expected, Supplier<Object> actual) {
        test(name, expected, actual, 1);
    }

    /** Order kisi bhi level pe matter nahi karta, jaise 3Sum ke triplets. */
    public static void eqAnyOrderDeep(String name, Object expected, Supplier<Object> actual) {
        test(name, expected, actual, 2);
    }

    private static void test(String name, Object expected, Supplier<Object> actual, int orderMode) {
        if (hidden && !runAll) return;
        total++;
        long t0 = System.nanoTime();
        Object got;
        String gotText;
        boolean ok;
        try {
            got = actual.get();
            gotText = format(got);
            ok = orderMode == 0 ? same(expected, got) : canonical(expected, orderMode == 2).equals(canonical(got, orderMode == 2));
        } catch (Throwable e) {
            gotText = "💥 " + e;
            for (StackTraceElement el : e.getStackTrace()) {
                if (!el.getClassName().startsWith("seekho.") && !el.getClassName().startsWith("java.")
                        && !el.getClassName().startsWith("jdk.")) {
                    gotText += " (line " + el.getLineNumber() + " in " + el.getClassName() + ")";
                    break;
                }
            }
            ok = false;
        }
        long ms = (System.nanoTime() - t0) / 1_000_000;
        if (ok) pass++;
        else fail++;
        System.out.println("@@T|" + (ok ? "PASS" : "FAIL") + "|" + (hidden ? "hidden" : "visible") + "|"
                + enc(name) + "|" + enc(format(expected)) + "|" + enc(gotText) + "|" + ms);
    }

    // ---------- comparison ----------

    private static boolean same(Object a, Object b) {
        if (a == b) return true;
        if (a == null || b == null) return false;
        if (a instanceof Number && b instanceof Number) {
            if (isFloating(a) || isFloating(b)) return Math.abs(((Number) a).doubleValue() - ((Number) b).doubleValue()) < 1e-6;
            return ((Number) a).longValue() == ((Number) b).longValue();
        }
        if (a.getClass().isArray() || b.getClass().isArray() || a instanceof Collection || b instanceof Collection) {
            List<Object> la = toList(a);
            List<Object> lb = toList(b);
            if (la == null || lb == null || la.size() != lb.size()) return false;
            for (int i = 0; i < la.size(); i++) {
                if (!same(la.get(i), lb.get(i))) return false;
            }
            return true;
        }
        if (a instanceof Character && b instanceof String) return a.toString().equals(b);
        if (a instanceof String && b instanceof Character) return a.equals(b.toString());
        return a.equals(b);
    }

    private static boolean isFloating(Object o) {
        return o instanceof Double || o instanceof Float;
    }

    /** Array ya Collection ko List<Object> mein badlo (primitive arrays bhi). */
    private static List<Object> toList(Object o) {
        if (o instanceof Collection) return new ArrayList<>((Collection<?>) o);
        if (o == null || !o.getClass().isArray()) return null;
        int n = java.lang.reflect.Array.getLength(o);
        List<Object> out = new ArrayList<>(n);
        for (int i = 0; i < n; i++) out.add(java.lang.reflect.Array.get(o, i));
        return out;
    }

    private static String canonical(Object o, boolean deep) {
        List<Object> list = toList(o);
        if (list == null) return format(o);
        List<String> parts = new ArrayList<>();
        for (Object x : list) parts.add(deep ? canonical(x, true) : format(x));
        parts.sort(null);
        return parts.toString();
    }

    // ---------- printing ----------

    static String format(Object o) {
        if (o == null) return "null";
        if (o instanceof String) return "\"" + o + "\"";
        if (o instanceof Character) return "'" + o + "'";
        if (o instanceof Double || o instanceof Float) {
            double d = ((Number) o).doubleValue();
            return d == Math.rint(d) && !Double.isInfinite(d) ? String.format("%.1f", d) : String.valueOf(o);
        }
        if (o instanceof Map) {
            StringBuilder sb = new StringBuilder("{");
            for (Map.Entry<?, ?> e : ((Map<?, ?>) o).entrySet()) {
                if (sb.length() > 1) sb.append(", ");
                sb.append(format(e.getKey())).append("=").append(format(e.getValue()));
            }
            return sb.append("}").toString();
        }
        List<Object> list = toList(o);
        if (list != null) {
            StringBuilder sb = new StringBuilder("[");
            for (int i = 0; i < list.size(); i++) {
                if (i > 0) sb.append(", ");
                sb.append(format(list.get(i)));
            }
            return sb.append("]").toString();
        }
        return String.valueOf(o);
    }

    private static String enc(String s) {
        String r = s.replace("\\", "\\\\").replace("|", "\\p").replace("\n", "\\n");
        return r.length() > 400 ? r.substring(0, 400) + "…" : r;
    }

    /** Debug ke liye: array/list ko readable string mein badlo. */
    public static String show(Object o) {
        return format(o);
    }
}
