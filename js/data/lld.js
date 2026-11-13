// Module 4: Low Level Design (outline). Focus: class design + DB design.
// Har problem: requirements → pehle aap entities/classes socho (score) → model design → DB tables (score) → code.
registerModule({
  id: "lld",
  intro: "Zero se: OOP aur UML, SOLID, phir design patterns (har ek ke saath chhota example). Uske baad problems aasaan se mushkil. Har step pe pehle aap design socho, site score degi, phir model answer aur code.",
  chapters: [
    {
      title: "Foundation",
      lessons: [
        { id: "what-is-lld", title: "LLD kya hai aur interview kaise hota hai", plan: ["LLD vs HLD", "45 minute ka flow: requirements → entities → relationships → class diagram → APIs → code", "Kya score karta hai interviewer"] },
        { id: "oop-for-design", title: "Design ke liye OOP", plan: ["Composition vs inheritance (has-a vs is-a)", "Interface pe code karo, implementation pe nahi", "Practice: inheritance ko composition mein badlo"] },
        { id: "uml", title: "UML class diagram", plan: ["Class box: fields, methods, visibility", "Association, aggregation, composition, inheritance, dependency", "Multiplicity (1, *, 0..1)", "Practice: diagram padho aur relationship pehchano"] },
        { id: "solid", title: "SOLID principles", plan: ["S, O, L, I, D: har ek ka bura code → achha code", "Pehle aap socho: is code mein kaunsa principle toota"] },
        { id: "dry-kiss-yagni", title: "DRY, KISS, YAGNI aur code smells", plan: ["Over-engineering kab hota hai"] }
      ]
    },
    {
      title: "Design Patterns: Creational",
      lessons: [
        { id: "singleton", title: "Singleton", plan: ["Kab sahi, kab anti-pattern", "Thread-safe versions"] },
        { id: "factory", title: "Factory aur Abstract Factory", plan: ["Example: Notification factory (SMS, Email, Push)"] },
        { id: "builder", title: "Builder", plan: ["Telescoping constructor problem", "Example: Pizza / HTTP request builder"] },
        { id: "prototype", title: "Prototype (overview)", plan: ["clone, deep vs shallow copy"] }
      ]
    },
    {
      title: "Design Patterns: Structural",
      lessons: [
        { id: "adapter", title: "Adapter", plan: ["Example: purana payment gateway naye interface pe"] },
        { id: "decorator", title: "Decorator", plan: ["Example: coffee add-ons, Java I/O streams"] },
        { id: "facade", title: "Facade", plan: ["Example: order placement facade"] },
        { id: "proxy", title: "Proxy", plan: ["Caching proxy, access-control proxy"] },
        { id: "composite", title: "Composite", plan: ["Example: file system (File, Folder)"] }
      ]
    },
    {
      title: "Design Patterns: Behavioral",
      lessons: [
        { id: "strategy", title: "Strategy", plan: ["Example: pricing / payment strategy", "if-else chain hatao"] },
        { id: "observer", title: "Observer", plan: ["Example: stock price alerts, event listeners"] },
        { id: "state", title: "State", plan: ["Example: order status, vending machine states"] },
        { id: "command", title: "Command", plan: ["Example: undo/redo in text editor"] },
        { id: "chain", title: "Chain of Responsibility", plan: ["Example: logger levels, request validation"] },
        { id: "template-method", title: "Template Method aur Iterator", plan: ["Example: data export pipeline"] },
        { id: "pattern-picker", title: "Kaunsa pattern? (practice)", plan: ["Scenario padho, pattern chuno, score pao"] }
      ]
    },
    {
      title: "Database Design",
      lessons: [
        { id: "db-basics", title: "Entities se tables", plan: ["Primary key, foreign key", "1:1, 1:N, M:N (junction table)", "Pehle aap socho: tables banao"] },
        { id: "normalization", title: "Normalization (1NF, 2NF, 3NF)", plan: ["Duplicate data ki problem", "Kab denormalize karte hain"] },
        { id: "indexes-constraints", title: "Indexes, constraints, transactions", plan: ["Index kab lagayein", "Unique constraint se double booking rokna", "ACID aur isolation (simple)"] },
        { id: "sql-nosql-lld", title: "SQL vs NoSQL (LLD level)", plan: ["Schema choice ka simple rule"] }
      ]
    },
    {
      title: "Problems (aasaan se mushkil)",
      lessons: [
        { id: "parking-lot", title: "Parking Lot", plan: ["Classes: ParkingLot, Floor, Spot, Vehicle, Ticket", "Strategy: spot allocation", "DB tables", "Code"] },
        { id: "tic-tac-toe", title: "Tic Tac Toe", plan: ["Board, Player, Game, win check O(1)"] },
        { id: "vending-machine", title: "Vending Machine", plan: ["State pattern", "Inventory aur coins"] },
        { id: "library", title: "Library Management", plan: ["Book vs BookCopy", "Members, loans, fines", "DB design focus"] },
        { id: "snake-ladder", title: "Snake and Ladder", plan: ["Board, Dice, Jumps"] },
        { id: "elevator", title: "Elevator (simple)", plan: ["Request scheduling strategy", "State"] },
        { id: "bookmyshow", title: "Movie Ticket Booking", plan: ["Show, Screen, Seat, Booking", "Seat lock aur double booking (concurrency)", "DB design"] },
        { id: "splitwise", title: "Splitwise", plan: ["Expense split strategies", "Balance sheet", "DB design"] },
        { id: "lru-cache-lld", title: "LRU Cache", plan: ["HashMap + doubly linked list", "Thread safety"] },
        { id: "logger", title: "Logging framework", plan: ["Chain of Responsibility + Singleton", "Appenders (Observer)"] },
        { id: "chess", title: "Chess", plan: ["Board, Cell, Piece hierarchy, Move", "Move validation (polymorphism)", "Game state", "DB: games aur moves"] }
      ]
    }
  ]
});
