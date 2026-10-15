const PYODIDE_INDEX = 'https://cdn.jsdelivr.net/pyodide/v0.28.3/full/';
let pyodide;

self.onmessage = async ({ data }) => {
  if (data.type !== 'run') return;
  try {
    if (!pyodide) {
      self.postMessage({ type: 'loading' });
      importScripts(`${PYODIDE_INDEX}pyodide.js`);
      pyodide = await loadPyodide({ indexURL: PYODIDE_INDEX });
    }
    const output = [];
    pyodide.setStdout({ batched: (line) => output.push(line) });
    pyodide.setStderr({ batched: (line) => output.push(line) });
    self.postMessage({ type: 'running' });
    const result = await pyodide.runPythonAsync(data.source);
    if (result !== undefined) output.push(String(result));
    self.postMessage({ type: 'result', output: output.join('\n') });
  } catch (error) {
    self.postMessage({ type: 'error', message: String(error.message || error) });
  }
};