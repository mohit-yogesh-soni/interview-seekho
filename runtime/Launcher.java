package seekho;

import java.io.File;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.net.URL;
import java.net.URLClassLoader;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Browser (CheerpJ) mein user ka code chalane wala launcher.
 *
 * Kyun chahiye: CheerpJ ek hi JVM mein saare runs chalata hai. Agar seedha "Main" chalayein,
 * to doosre run mein purani Main class (aur uske static variables) cache se aa sakti hai.
 * Isliye har run ek naye URLClassLoader mein hota hai. Parent system loader hai, taaki
 * user ka code seekho.Check (test helper) use kar sake.
 *
 * Args: <classDir> [mainClass] [timeLimitMs] [mode: sample|all]
 * Output ke end mein marker line aati hai jise JS padhta aur chhupata hai:
 *   @@SEEKHO_EXIT <code>@@   0 = theek, 1 = exception, 2 = setup problem, 3 = time limit
 */
public final class Launcher {
    private static final String MARKER = "@@SEEKHO_EXIT ";

    public static void main(String[] args) {
        int exit = run(args);
        System.out.flush();
        System.err.flush();
        Check.printSummary();
        System.out.println();
        System.out.println(MARKER + exit + "@@");
        System.out.flush();
    }

    private static int run(String[] args) {
        if (args.length < 1) {
            System.err.println("Launcher: class folder nahi diya");
            return 2;
        }
        String dir = args[0];
        String mainClass = args.length > 1 ? args[1] : "Main";
        long limitMs = args.length > 2 ? Long.parseLong(args[2]) : 10000;
        boolean runAll = args.length > 3 && "all".equals(args[3]);
        Check.reset(runAll);

        Set<Thread> before = Thread.getAllStackTraces().keySet();
        try {
            URLClassLoader loader = new URLClassLoader(
                    new URL[] { new File(dir).toURI().toURL() }, ClassLoader.getSystemClassLoader());
            Class<?> cls;
            try {
                cls = Class.forName(mainClass, true, loader);
            } catch (ClassNotFoundException e) {
                System.err.println("Class '" + mainClass + "' nahi mili. 'public static void main' wali class ka naam " + mainClass + " rakho.");
                return 2;
            }
            Method main;
            try {
                main = cls.getMethod("main", String[].class);
            } catch (NoSuchMethodException e) {
                System.err.println(mainClass + " mein 'public static void main(String[] args)' nahi mila.");
                return 2;
            }

            // main() ko alag thread mein chalate hain, taaki infinite loop pe time limit laga sakein
            AtomicInteger result = new AtomicInteger(0);
            Thread runner = new Thread(() -> {
                try {
                    main.invoke(null, (Object) new String[0]);
                } catch (InvocationTargetException e) {
                    System.out.flush();
                    System.err.print("Exception in thread \"main\" ");
                    printUserTrace(e.getCause());
                    result.set(1);
                } catch (Throwable t) {
                    System.err.println("Launcher error: " + t);
                    result.set(2);
                }
            }, "main");
            runner.setContextClassLoader(loader);
            runner.start();
            runner.join(limitMs);
            if (runner.isAlive()) {
                System.out.flush();
                System.err.println();
                System.err.println("⏱️ Time limit (" + (limitMs / 1000) + "s) khatam. Infinite loop ya bahut slow code?");
                return 3;
            }
            if (result.get() == 0) waitForUserThreads(before, runner, Math.min(limitMs, 5000));
            return result.get();
        } catch (Throwable t) {
            System.err.println("Launcher error: " + t);
            return 2;
        }
    }

    /** Stack trace se launcher/reflection wali lines hata do, sirf user ke kaam ki lines dikhao. */
    private static void printUserTrace(Throwable t) {
        System.err.println(t);
        for (StackTraceElement el : t.getStackTrace()) {
            String c = el.getClassName();
            if (c.startsWith("seekho.") || c.startsWith("jdk.internal.reflect") || c.startsWith("java.lang.reflect")
                    || c.startsWith("sun.reflect") || c.equals("java.lang.Thread")) {
                continue;
            }
            System.err.println("\tat " + el);
        }
        if (t.getCause() != null && t.getCause() != t) {
            System.err.print("Caused by: ");
            printUserTrace(t.getCause());
        }
    }

    /**
     * Asli JVM non-daemon threads khatam hone tak rukti hai. Hum bhi rukte hain, par sirf waitMs tak,
     * taaki bhoola hua executor.shutdown() page ko hamesha ke liye na atkaaye.
     */
    private static void waitForUserThreads(Set<Thread> before, Thread runner, long waitMs) throws InterruptedException {
        long deadline = System.currentTimeMillis() + waitMs;
        while (true) {
            List<Thread> alive = new ArrayList<>();
            for (Thread t : Thread.getAllStackTraces().keySet()) {
                if (!before.contains(t) && t != runner && t.isAlive() && !t.isDaemon() && t != Thread.currentThread()) {
                    alive.add(t);
                }
            }
            if (alive.isEmpty()) return;
            if (System.currentTimeMillis() > deadline) {
                System.out.flush();
                System.err.println();
                System.err.println("⚠️ main() khatam ho gaya, par " + alive.size() + " thread(s) abhi bhi chal rahe hain: " + names(alive));
                System.err.println("   Asli JVM yahan hamesha ke liye ruki rehti. ExecutorService pe shutdown() bhool gaye kya?");
                return;
            }
            Thread.sleep(50);
        }
    }

    private static String names(List<Thread> threads) {
        StringBuilder sb = new StringBuilder();
        for (Thread t : threads) {
            if (sb.length() > 0) sb.append(", ");
            sb.append(t.getName());
        }
        return sb.toString();
    }
}
