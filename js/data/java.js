// Module 1: Java Basics → Streams
// Outline (chapters + lessons). Har lesson ka content: js/data/java/<lesson-id>.js. Format: CONTENT_GUIDE.md

registerModule({
  id: "java",
  intro: "Java zero se. Pehle samjho Java chalta kaise hai, phir syntax, OOP, Collections aur end mein Lambdas + Streams. Har lesson mein code chalao aur practice karo.",
  howTo: "💡 Har code box editable hai. Kuch bhi badlo aur <b>Run</b> dabao (ya <b>Ctrl/Cmd + Enter</b>). Galat code bhi chalao, error padhna bhi ek skill hai.",
  chapters: [
    {
      title: "Shuruaat",
      lessons: [
        { id: "how-java-runs", title: "Java kaise chalta hai + Hello World", plan: ["JDK, JRE, JVM", "javac, bytecode, JIT", "main() ka har word", "Errors padhna"] },
        { id: "variables-types", title: "Variables aur Data Types", plan: ["8 primitive types", "Overflow, integer division, char arithmetic, casting", "Paise ke liye double kyun nahi"] },
        { id: "operators-strings", title: "Operators aur String basics", plan: ["Arithmetic, comparison, logical (&&, ||, short-circuit)", "++i vs i++ (output questions)", "String methods: length, charAt, substring, indexOf, equals vs ==", "Practice: palindrome check, vowels count"] }
      ]
    },
    {
      title: "Control Flow aur Arrays",
      lessons: [
        { id: "if-switch", title: "if-else aur switch", plan: ["if / else if / else", "Ternary operator", "Switch statement aur Java 14+ switch expression (->)", "Practice: grade calculator, FizzBuzz"] },
        { id: "loops", title: "Loops", plan: ["for, while, do-while", "break, continue, labelled break", "Nested loops aur patterns", "Practice: prime check, sum of digits, reverse number"] },
        { id: "arrays", title: "Arrays (1D aur 2D)", plan: ["Declare, initialize, default values", "Arrays.toString, Arrays.sort, Arrays.fill", "2D arrays / matrix traversal", "Practice: max element, reverse array, matrix transpose"] }
      ]
    },
    {
      title: "Methods aur Memory",
      lessons: [
        { id: "methods", title: "Methods", plan: ["Method banana, parameters, return", "Overloading", "Varargs", "Practice: utility methods"] },
        { id: "stack-heap", title: "Stack vs Heap aur pass-by-value", plan: ["Primitive aur reference variables memory mein kahan", "Java hamesha pass-by-value hai (reference ki copy bhi value hai)", "Garbage collection ka basic idea", "Output questions: swap kyun kaam nahi karta"] },
        { id: "recursion", title: "Recursion", plan: ["Base case + recursive case", "Call stack visualize karo", "StackOverflowError", "Practice: factorial, fibonacci, power(x, n)"] }
      ]
    },
    {
      title: "OOP (Object Oriented Programming)",
      lessons: [
        { id: "class-object", title: "Class, Object, Constructor, this", plan: ["Class = blueprint, Object = asli cheez", "Constructors, constructor chaining, this", "Practice: BankAccount class"] },
        { id: "encapsulation-static", title: "Encapsulation, access modifiers, static", plan: ["private/default/protected/public", "Getters/setters kab aur kab nahi", "static variables/methods/blocks", "final keyword"] },
        { id: "inheritance-poly", title: "Inheritance aur Polymorphism", plan: ["extends, super", "Method overriding vs overloading", "Runtime polymorphism (dynamic dispatch)", "Output questions"] },
        { id: "abstract-interface", title: "Abstract class vs Interface", plan: ["Abstract class aur abstract methods", "Interface, default aur static methods", "Kab kaunsa use karein (interview favourite)", "Practice: Shape hierarchy"] },
        { id: "object-methods", title: "equals, hashCode, toString", plan: ["== vs equals", "equals/hashCode contract aur HashMap mein kyun zaroori", "Practice: Point class jo HashSet mein sahi kaam kare"] },
        { id: "enum-record", title: "Enums aur Records", plan: ["Enum with fields/methods", "Records (Java 16+): immutable data classes", "Sealed classes (intro)"] }
      ]
    },
    {
      title: "Core APIs",
      lessons: [
        { id: "strings-deep", title: "String deep dive", plan: ["Immutability aur String pool", "StringBuilder vs StringBuffer", "Loop mein + se string jodna kyun slow hai", "Practice: reverse words, compress string"] },
        { id: "wrappers", title: "Wrapper classes aur Autoboxing", plan: ["int vs Integer", "Integer cache (-128 to 127) wala == trap", "NullPointerException from unboxing"] },
        { id: "exceptions", title: "Exceptions", plan: ["Checked vs unchecked", "try/catch/finally, try-with-resources", "Custom exceptions", "Best practices"] },
        { id: "generics", title: "Generics", plan: ["Generic class aur method", "Bounded types (<T extends Comparable<T>>)", "Wildcards: ? extends vs ? super (PECS)", "Type erasure"] }
      ]
    },
    {
      title: "Collections Framework",
      lessons: [
        { id: "collections-overview", title: "Collections ka naksha", plan: ["List, Set, Queue, Map hierarchy", "Kaunsa kab: decision table", "Big-O of common operations"] },
        { id: "list", title: "ArrayList vs LinkedList", plan: ["Internals: resizing array vs nodes", "Kab kaunsa", "Practice"] },
        { id: "hashmap", title: "HashMap internals", plan: ["Hashing, buckets, collisions", "Java 8 treeify", "Load factor aur resize", "Interview: HashMap kaise kaam karta hai (poora answer)"] },
        { id: "set-tree", title: "HashSet, TreeSet, TreeMap, LinkedHashMap", plan: ["Sorted collections", "floor/ceiling/higher/lower", "LinkedHashMap se LRU cache"] },
        { id: "queue-deque-pq", title: "Queue, Deque, PriorityQueue", plan: ["ArrayDeque as stack and queue", "PriorityQueue min/max heap", "Practice: top-k elements"] },
        { id: "comparable-comparator", title: "Comparable vs Comparator", plan: ["compareTo contract", "Comparator.comparing().thenComparing()", "Practice: sort employees"] },
        { id: "iterator-cme", title: "Iterator aur ConcurrentModificationException", plan: ["Loop mein remove karne ka sahi tareeka", "fail-fast vs fail-safe"] }
      ]
    },
    {
      title: "Lambdas aur Streams",
      lessons: [
        { id: "lambdas", title: "Lambdas aur Functional Interfaces", plan: ["Anonymous class se lambda tak", "Function, Predicate, Consumer, Supplier, BiFunction", "Effectively final"] },
        { id: "method-refs-optional", title: "Method References aur Optional", plan: ["4 types of method references", "Optional: map, orElse, orElseGet, orElseThrow", "Optional ka galat use"] },
        { id: "streams-basics", title: "Streams basics", plan: ["Stream pipeline: source → intermediate → terminal", "filter, map, sorted, distinct, limit", "collect(toList), count, forEach", "Lazy evaluation"] },
        { id: "streams-advanced", title: "Streams advanced", plan: ["flatMap", "reduce", "groupingBy, partitioningBy, counting, mapping", "toMap aur duplicate key", "IntStream, boxed"] },
        { id: "streams-interview", title: "Streams interview questions", plan: ["Frequency of characters", "Second highest salary", "Group employees by department", "Find duplicates", "Parallel streams: kab nahi"] }
      ]
    },
    {
      title: "Interview Round-up",
      lessons: [
        { id: "java-versions", title: "Java 8 se 21 tak naye features", plan: ["8: lambdas, streams, Optional", "11: var in lambda, String methods", "17: records, sealed, switch expressions, text blocks", "21: virtual threads, pattern matching for switch"] },
        { id: "output-questions", title: "Tricky output questions", plan: ["Static vs instance init order", "String pool aur ==", "finally with return", "Overloading resolution"] }
      ]
    }
  ]
});
