const passwordInput = document.getElementById('password-input');
const checkBtn = document.getElementById('check-btn');
const terminalOutput = document.getElementById('terminal-output');
if (checkBtn) {
  checkBtn.addEventListener('click', () => {
    const val = passwordInput.value.trim();
    if (!val) return;
    const score = [val.length >= 12, /[A-Z]/.test(val), /[a-z]/.test(val), /\d/.test(val), /[^A-Za-z0-9]/.test(val)].filter(Boolean).length;
    let output = `<p>→ Strength: `;
    if (score <= 2) output += `<span style="color: #ff9b82">WEAK</span>`;
    else if (score <= 3) output += `<span style="color: #ffd700">FAIR</span>`;
    else if (score === 4) output += `<span style="color: #8bc34a">STRONG</span>`;
    else output += `<span style="color: #c7f74b">EXCELLENT</span>`;
    output += ` (${score}/5)</p>`;
    terminalOutput.innerHTML += output;
    passwordInput.value = '';
  });
}