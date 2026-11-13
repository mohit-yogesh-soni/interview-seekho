# Interview Seekho </>

Senior SWE interview ki taiyari zero se, Hinglish mein: Java → DSA → Concurrency → LLD → HLD → AI.
Backend nahi hai: sirf HTML, CSS aur JavaScript. Java code browser mein hi compile aur run hota hai.

## Features
- ▶️ **Runnable examples**: har code box editable hai, Run (Ctrl/Cmd+Enter) karo
- 🏋️ **Practice**: Run = sample tests, Submit = hidden tests bhi. Hint pe -1, solution dekhne pe max 5/10
- 🤔 **Pehle aap socho**: design/theory questions mein apna jawab likho, rubric se 0-10 score, phir model answer
- ❓ **Quiz** aur progress/score browser ke localStorage mein save

## Local chalana
Java runner (CheerpJ) `file://` pe nahi chalta, isliye local server chahiye:
```
cd interview-seekho
python3 -m http.server 8080
```
Phir Chrome mein http://localhost:8080 kholo. Pehli baar Run dabane pe 5-15 second lagte hain.

## Folder structure
```
index.html, learn.html       pages (learn.html?m=<module>&l=<lesson>)
css/style.css
js/common.js                 navbar, modules list, progress/scores (localStorage)
js/java-runner.js            CheerpJ: javac + run, output aur test results parse
js/editor.js                 CodeMirror editor, compile errors ke Hinglish hints, output UI
js/blocks.js                 lesson blocks: text, tip, warn, code, exercise, quiz, think
js/learn.js                  lesson page (sidebar, overview, prev/next)
js/data/<module>.js          content (registerModule)
runtime/Launcher.java        har run naye ClassLoader mein, time limit, thread check
runtime/Check.java           test helper: Check.eq(...), Check.hiddenFromHere()
runtime/launcher.jar         upar wali dono files compile karke (tools/build-launcher.sh)
tools/verify-content.mjs     saare code blocks/exercises local JDK pe check
```

## Naya content likhna
Lesson = blocks ki list (`js/blocks.js` ke upar format likha hai). Exercise ke liye:
- `harness` wala: user `Solution.java` likhta hai, `Main.java` (harness) `seekho.Check` se tests chalata hai
- `expectedOutput` wala: user ka `Main` jo print kare wo match hota hai

Content badalne ke baad check karo (JDK 17+ chahiye):
```
node tools/verify-content.mjs
```
`runtime/*.java` badla ho to pehle: `bash tools/build-launcher.sh`

## Credits / License
- Java runner: [CheerpJ](https://cheerpj.com/) (Leaning Technologies). Personal, educational aur hobby use ke liye free.
  Site se paisa kamaana ho (ads, paid course) to [CheerpJ license](https://cheerpj.com/licensing/) chahiye.
- Editor: [CodeMirror 5](https://codemirror.net/5/) (MIT), cdnjs se.
- Learning content: is project ke liye likha gaya.
