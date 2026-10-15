const compilerMenuButton = document.querySelector('.menu-toggle');
const compilerNav = document.querySelector('.main-nav');

compilerMenuButton?.addEventListener('click', () => {
  const isOpen = compilerMenuButton.getAttribute('aria-expanded') === 'true';
  compilerMenuButton.setAttribute('aria-expanded', String(!isOpen));
  compilerMenuButton.setAttribute('aria-label', isOpen ? 'Open navigation' : 'Close navigation');
  compilerNav.classList.toggle('open', !isOpen);
});

compilerNav?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    compilerNav.classList.remove('open');
    compilerMenuButton?.setAttribute('aria-expanded', 'false');
  });
});

const compilerStatus = document.querySelector('#compiler-status');
const compilerTabs = document.querySelectorAll('.compiler-tab');
const compilerPanels = document.querySelectorAll('.compiler-panel');

function setStatus(text) {
  if (compilerStatus) compilerStatus.textContent = text;
}

compilerTabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    const target = tab.dataset.compilerTab;
    compilerTabs.forEach((item) => item.classList.toggle('active', item === tab));
    compilerPanels.forEach((panel) => {
      const isMatch = panel.dataset.compilerPanel === target;
      panel.hidden = !isMatch;
      panel.classList.toggle('active', isMatch);
    });
    setStatus('READY');
  });
});

/* ---------- Python (local, Pyodide worker) ---------- */
const pythonCode = document.querySelector('#python-code');
const pythonOutput = document.querySelector('#python-output');
const runPythonButton = document.querySelector('#run-python');
const clearPythonButton = document.querySelector('#clear-python');
const pythonDefault = pythonCode?.value ?? '';
let pythonWorker = null;

function getPythonWorker() {
  if (!pythonWorker) pythonWorker = new Worker('python-worker.js');
  return pythonWorker;
}

runPythonButton?.addEventListener('click', () => {
  runPythonButton.disabled = true;
  pythonOutput.classList.remove('error');
  pythonOutput.textContent = 'Starting the local Python runtime…';
  setStatus('LOADING');
  const worker = getPythonWorker();
  worker.onmessage = ({ data }) => {
    if (data.type === 'loading') {
      pythonOutput.textContent = 'Loading Pyodide for the first time — this can take a few seconds…';
    } else if (data.type === 'running') {
      setStatus('RUNNING');
    } else if (data.type === 'result') {
      pythonOutput.textContent = data.output || 'Program finished with no output.';
      setStatus('READY');
      runPythonButton.disabled = false;
    } else if (data.type === 'error') {
      pythonOutput.classList.add('error');
      pythonOutput.textContent = data.message;
      setStatus('READY');
      runPythonButton.disabled = false;
    }
  };
  worker.onerror = (error) => {
    pythonOutput.classList.add('error');
    pythonOutput.textContent = `The Python runtime failed to load: ${error.message}`;
    setStatus('READY');
    runPythonButton.disabled = false;
  };
  worker.postMessage({ type: 'run', source: pythonCode.value });
});

clearPythonButton?.addEventListener('click', () => {
  pythonCode.value = pythonDefault;
  pythonOutput.classList.remove('error');
  pythonOutput.textContent = 'Press “Run Python” to start the local runner.';
  setStatus('READY');
});

/* ---------- JavaScript (local, sandboxed worker) ---------- */
const javascriptCode = document.querySelector('#javascript-code');
const javascriptOutput = document.querySelector('#javascript-output');
const runJavascriptButton = document.querySelector('#run-javascript');
const clearJavascriptButton = document.querySelector('#clear-javascript');
const javascriptDefault = javascriptCode?.value ?? '';

runJavascriptButton?.addEventListener('click', () => {
  runJavascriptButton.disabled = true;
  javascriptOutput.classList.remove('error');
  javascriptOutput.textContent = 'Running…';
  setStatus('RUNNING');
  const worker = new Worker('js-worker.js');
  worker.onmessage = ({ data }) => {
    if (data.type === 'result') {
      javascriptOutput.textContent = data.output;
    } else if (data.type === 'error') {
      javascriptOutput.classList.add('error');
      javascriptOutput.textContent = data.message;
    }
    setStatus('READY');
    runJavascriptButton.disabled = false;
    worker.terminate();
  };
  worker.onerror = (error) => {
    javascriptOutput.classList.add('error');
    javascriptOutput.textContent = `The runner failed: ${error.message}`;
    setStatus('READY');
    runJavascriptButton.disabled = false;
    worker.terminate();
  };
  worker.postMessage({ type: 'run', source: javascriptCode.value });
});

clearJavascriptButton?.addEventListener('click', () => {
  javascriptCode.value = javascriptDefault;
  javascriptOutput.classList.remove('error');
  javascriptOutput.textContent = 'Press “Run JavaScript” to start the local runner.';
  setStatus('READY');
});

/* ---------- HTML/CSS (local preview) ---------- */
const htmlCode = document.querySelector('#html-code');
const htmlPreview = document.querySelector('#html-preview');
const runHtmlButton = document.querySelector('#run-html');
const clearHtmlButton = document.querySelector('#clear-html');
const htmlDefault = htmlCode?.value ?? '';

runHtmlButton?.addEventListener('click', () => {
  if (htmlPreview) htmlPreview.srcdoc = htmlCode.value;
  setStatus('READY');
});

clearHtmlButton?.addEventListener('click', () => {
  htmlCode.value = htmlDefault;
  if (htmlPreview) htmlPreview.srcdoc = '';
});

/* ---------- More languages (remote runner via Piston) ---------- */
const PISTON_ENDPOINT = 'https://emkc.org/api/v2/piston/execute';
const LANGUAGE_TEMPLATES = {
  c: '#include <stdio.h>\n\nint main(void) {\n    printf("Hello from C!\\n");\n    return 0;\n}\n',
  cpp: '#include <iostream>\n\nint main() {\n    std::cout << "Hello from C++!" << std::endl;\n    return 0;\n}\n',
  java: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello from Java!");\n    }\n}\n',
  csharp: 'using System;\n\nclass Program {\n    static void Main() {\n        Console.WriteLine("Hello from C#!");\n    }\n}\n',
  go: 'package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello from Go!")\n}\n',
  rust: 'fn main() {\n    println!("Hello from Rust!");\n}\n',
  ruby: 'puts "Hello from Ruby!"\n',
  php: '<?php\necho "Hello from PHP!\\n";\n',
  typescript: 'const message: string = "Hello from TypeScript!";\nconsole.log(message);\n',
  kotlin: 'fun main() {\n    println("Hello from Kotlin!")\n}\n',
  swift: 'print("Hello from Swift!")\n',
  bash: 'echo "Hello from Bash!"\n'
};
const LANGUAGE_FILENAMES = {
  c: 'main.c', cpp: 'main.cpp', java: 'Main.java', csharp: 'Program.cs',
  go: 'main.go', rust: 'main.rs', ruby: 'main.rb', php: 'main.php',
  typescript: 'main.ts', kotlin: 'main.kt', swift: 'main.swift', bash: 'main.sh'
};

const otherLanguage = document.querySelector('#other-language');
const otherCode = document.querySelector('#other-code');
const otherOutput = document.querySelector('#other-output');
const runOtherButton = document.querySelector('#run-other');
const clearOtherButton = document.querySelector('#clear-other');

function applyTemplate(language) {
  otherCode.value = LANGUAGE_TEMPLATES[language] || '';
}

if (otherLanguage) applyTemplate(otherLanguage.value);

otherLanguage?.addEventListener('change', () => {
  const previousTemplate = otherCode.dataset.lastTemplate || '';
  const isUntouched = otherCode.value.trim() === '' || otherCode.value === previousTemplate;
  if (isUntouched) applyTemplate(otherLanguage.value);
  otherCode.dataset.lastTemplate = LANGUAGE_TEMPLATES[otherLanguage.value] || '';
});
if (otherLanguage) otherCode.dataset.lastTemplate = LANGUAGE_TEMPLATES[otherLanguage.value] || '';

runOtherButton?.addEventListener('click', async () => {
  const language = otherLanguage.value;
  const source = otherCode.value;
  if (!source.trim()) {
    otherOutput.classList.remove('error');
    otherOutput.textContent = 'Add some code first.';
    return;
  }
  runOtherButton.disabled = true;
  otherOutput.classList.remove('error');
  otherOutput.textContent = 'Sending code to the remote runner…';
  setStatus('RUNNING');
  try {
    const response = await fetch(PISTON_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        language,
        version: '*',
        files: [{ name: LANGUAGE_FILENAMES[language] || 'main', content: source }]
      })
    });
    if (!response.ok) throw new Error(`Runner responded with status ${response.status}.`);
    const result = await response.json();
    const compileError = result.compile && result.compile.code !== 0 ? result.compile.stderr || result.compile.output : '';
    const runOutput = [result.run?.stdout, result.run?.stderr].filter(Boolean).join('\n');
    if (compileError) {
      otherOutput.classList.add('error');
      otherOutput.textContent = compileError.trim();
    } else {
      otherOutput.textContent = runOutput.trim() || 'Program finished with no output.';
      if (result.run?.code) otherOutput.classList.add('error');
    }
  } catch (error) {
    otherOutput.classList.add('error');
    otherOutput.textContent = `Could not reach the remote runner: ${error.message}. Check your connection and try again.`;
  } finally {
    setStatus('READY');
    runOtherButton.disabled = false;
  }
});

clearOtherButton?.addEventListener('click', () => {
  applyTemplate(otherLanguage.value);
  otherCode.dataset.lastTemplate = LANGUAGE_TEMPLATES[otherLanguage.value] || '';
  otherOutput.classList.remove('error');
  otherOutput.textContent = 'Pick a language, then press “Run Code” to start.';
  setStatus('READY');
});
