const toolPassword = document.getElementById('tool-password');
const strengthFill = document.getElementById('strength-fill');
const strengthFeedback = document.getElementById('strength-feedback');
if (toolPassword) {
  toolPassword.addEventListener('input', () => {
    const val = toolPassword.value;
    const score = [val.length >= 12, /[A-Z]/.test(val), /[a-z]/.test(val), /\d/.test(val), /[^A-Za-z0-9]/.test(val)].filter(Boolean).length;
    strengthFill.style.width = `${(score / 5) * 100}%`;
    let color = '#ff9b82'; let text = 'Very Weak';
    if (score === 3) { color = '#ffd700'; text = 'Fair'; }
    else if (score === 4) { color = '#8bc34a'; text = 'Strong'; }
    else if (score === 5) { color = '#c7f74b'; text = 'Excellent'; }
    strengthFill.style.background = color;
    strengthFeedback.textContent = text;
    strengthFeedback.style.color = color;
  });
}
const hashBtn = document.getElementById('hash-btn');
if (hashBtn) {
  hashBtn.addEventListener('click', async () => {
    const text = document.getElementById('hash-input').value;
    const output = document.getElementById('hash-output');
    if (!text) return;
    output.textContent = 'Generating...';
    const data = new TextEncoder().encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    output.textContent = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  });
}
const genBtn = document.getElementById('gen-btn');
if (genBtn) {
  const genLength = document.getElementById('gen-length');
  const genSymbols = document.getElementById('gen-symbols');
  const genOutput = document.getElementById('gen-output');
  const genCopy = document.getElementById('gen-copy');
  const genLengthLabel = document.getElementById('gen-length-label');
  genLength.addEventListener('input', () => genLengthLabel.textContent = genLength.value);
  genBtn.addEventListener('click', () => {
    const length = parseInt(genLength.value);
    const symbols = genSymbols.checked;
    const lower = 'abcdefghijkmnopqrstuvwxyz';
    const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const numbers = '23456789';
    const special = '!@#$%^&*?-_=+';
    let pool = lower + upper + numbers;
    if (symbols) pool += special;
    let pass = '';
    for (let i = 0; i < length; i++) pass += pool[Math.floor(Math.random() * pool.length)];
    genOutput.value = pass;
  });
  genCopy.addEventListener('click', () => {
    if (!genOutput.value) return;
    navigator.clipboard.writeText(genOutput.value).then(() => {
      genCopy.textContent = 'COPIED!';
      setTimeout(() => genCopy.textContent = 'COPY', 2000);
    });
  });
}
const speedBtn = document.getElementById('speed-btn');
if (speedBtn) {
  speedBtn.addEventListener('click', async () => {
    const speedValue = document.getElementById('speed-value');
    const speedDetail = document.getElementById('speed-detail');
    speedBtn.disabled = true; speedBtn.textContent = 'TESTING...';
    speedValue.textContent = '...'; speedDetail.textContent = 'Starting test...';
    const startTime = performance.now();
    try {
      const response = await fetch('https://speed.cloudflare.com/__down?bytes=20000000', { cache: 'no-store' });
      await response.arrayBuffer();
      const duration = (performance.now() - startTime) / 1000;
      speedValue.textContent = ((20000000 * 8) / (duration * 1000000)).toFixed(2);
      speedDetail.textContent = 'Test complete!';
    } catch (e) { speedDetail.textContent = 'Error: ' + e.message; }
    finally { speedBtn.disabled = false; speedBtn.textContent = 'Start Test'; }
  });
}
const ipBtn = document.getElementById('ip-btn');
if (ipBtn) {
  ipBtn.addEventListener('click', async () => {
    const output = document.getElementById('ip-output');
    output.textContent = 'Looking up...';
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      output.textContent = 'Your Public IP: ' + data.ip;
    } catch (e) { output.textContent = 'Error: ' + e.message; }
  });
}
const b64Encode = document.getElementById('b64-encode');
if (b64Encode) {
  const b64Decode = document.getElementById('b64-decode');
  const base64Input = document.getElementById('base64-input');
  const base64Output = document.getElementById('base64-output');
  b64Encode.addEventListener('click', () => { try { base64Output.textContent = btoa(base64Input.value); } catch (e) { base64Output.textContent = 'Error'; } });
  b64Decode.addEventListener('click', () => { try { base64Output.textContent = atob(base64Input.value); } catch (e) { base64Output.textContent = 'Error: Invalid Base64'; } });
}
const qrBtn = document.getElementById('qr-btn');
if (qrBtn) {
  qrBtn.addEventListener('click', () => {
    const text = document.getElementById('qr-input').value.trim();
    const preview = document.getElementById('qr-preview');
    if (!text) return;
    preview.innerHTML = '';
    preview.style.display = 'flex';
    new QRCode(preview, { text: text, width: 128, height: 128 });
  });
}
const logBtn = document.getElementById('log-btn');
if (logBtn) {
  logBtn.addEventListener('click', () => {
    const lines = document.getElementById('log-input').value.split('\n').filter(Boolean);
    const output = document.getElementById('log-output');
    if (lines.length === 0) return;
    let warnings = 0, errors = 0, infos = 0;
    lines.forEach(line => {
      if (/\b(warn|warning)\b/i.test(line)) warnings++;
      if (/\b(error|failed|denied)\b/i.test(line)) errors++;
      if (/\b(info|success)\b/i.test(line)) infos++;
    });
    output.textContent = `Lines: ${lines.length} | Info: ${infos} | Warnings: ${warnings} | Errors: ${errors}`;
    output.style.color = errors > 0 ? '#ff9b82' : (warnings > 0 ? '#ffd700' : '#c7f74b');
  });
}