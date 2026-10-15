self.onmessage = ({ data }) => {
  if (data.type !== 'run') return;
  const output = [];
  const sandboxConsole = {
    log: (...parts) => output.push(parts.map(String).join(' ')),
    error: (...parts) => output.push(parts.map(String).join(' '))
  };
  try {
    const runner = new Function('console', `"use strict";\n${data.source}`);
    runner(sandboxConsole);
    self.postMessage({ type: 'result', output: output.length ? output.join('\n') : 'Program finished with no output.' });
  } catch (error) {
    self.postMessage({ type: 'error', message: String(error.message || error) });
  }
};
