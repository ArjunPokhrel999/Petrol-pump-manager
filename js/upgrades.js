/* Petrol Pump Manager enhancements. Keeps the original storage key and data shape intact. */
(function () {
  'use strict';
  const LEGACY_KEY = 'petrol_pump_compact_data';
  const EXTRA_KEY = 'ppm_upgrade_v1';
  const HISTORY_KEY = 'ppm_shift_history_v1';
const DRIVE_CLIENT_ID = '214010688673-ijl1cuo03jb77tk8o7tua66td0e12m76.apps.googleusercontent.com';
   // Configure in README.
  let driveTokenClient = null;
  let driveAccessToken = null;
  let saveTimer = null;
  let driveAutoTimer = null;

  const $ = (id) => document.getElementById(id);
  const money = (n) => 'Rs. ' + (Number(n) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const num = (v) => Number.isFinite(Number(v)) ? Number(v) : 0;
  const safeParse = (s, fallback) => { try { return s ? JSON.parse(s) : fallback; } catch (_) { return fallback; } };
  function extra() { return safeParse(localStorage.getItem(EXTRA_KEY), { customers: [], ledger: [], stock: { Petrol: { opening: 0, deliveries: [] }, Diesel: { opening: 0, deliveries: [] } }, audit: [] }); }
  function writeExtra(data) { try { localStorage.setItem(EXTRA_KEY, JSON.stringify(data)); return true; } catch (e) { alert('Save failed: browser storage full or unavailable. Export a backup now.'); return false; } }
  function legacy() { return safeParse(localStorage.getItem(LEGACY_KEY), {}); }
  function snapshot() {
    const state = legacy();
    return { id: 'SHIFT-' + Date.now(), date: new Date().toISOString(), label: new Date().toLocaleString(), state, summary: {
      liters: $('totalLiters')?.innerText || '0 L', expected: $('expectedAmount')?.innerText || '0.00', collection: $('shiftCollection')?.innerText || '0.00', audit: $('finalStatus')?.innerText || 'Not calculated', note: $('auditNote')?.innerText || ''
    } };
  }
  function history() { return safeParse(localStorage.getItem(HISTORY_KEY), []); }
  function saveHistory(list) { try { localStorage.setItem(HISTORY_KEY, JSON.stringify(list)); } catch (_) { alert('History storage is full. Export backup and remove old records if needed.'); } }
  function log(action, details) { const d = extra(); d.audit.unshift({ id: Date.now(), at: new Date().toISOString(), action, details: details || '' }); d.audit = d.audit.slice(0, 500); writeExtra(d); }

  function addEnhancementUI() {
    if ($('ppm-enhancements')) return;
    const root = document.createElement('section'); root.id = 'ppm-enhancements'; root.className = 'ppm-panel';
    root.innerHTML = `
      <div class="ppm-heading"><div><h2>Manager Tools</h2><p>Backup, shift history, stock and customer ledger</p></div><span class="ppm-local">Local-first</span></div>
      <div class="ppm-stats" id="ppmStats"><article><small>Fuel volume</small><strong id="ppmLiters">0 L</strong></article><article><small>Expected sales</small><strong id="ppmExpected">Rs. 0</strong></article><article><small>Actual collection</small><strong id="ppmCollection">Rs. 0</strong></article><article><small>Customers due</small><strong id="ppmDue">Rs. 0</strong></article></div>
      <div class="ppm-block"><h3>Data backup & restore</h3><p class="ppm-help">Export includes the original shift data, saved shift history, ledger and stock records.</p><div class="ppm-actions"><button class="ppm-btn primary" id="ppmExport">Export JSON backup</button><label class="ppm-btn" for="ppmImportFile">Import JSON backup</label><input id="ppmImportFile" type="file" accept="application/json,.json" hidden></div><p id="ppmBackupStatus" class="ppm-status" role="status">Backup not yet exported.</p></div>
      <div class="ppm-block"><h3>Shift history</h3><p class="ppm-help">Close a shift from the original summary section; it will be archived before reset.</p><div id="ppmHistoryList" class="ppm-list"></div></div>
      <div class="ppm-block"><h3>Customer ledger</h3><form id="ppmLedgerForm" class="ppm-form"><input id="ppmCustomer" placeholder="Customer name" required maxlength="100"><select id="ppmTxnType"><option value="credit">Credit given (+ due)</option><option value="payment">Payment received (− due)</option></select><input id="ppmTxnAmount" type="number" min="0.01" step="0.01" placeholder="Amount (Rs.)" required><input id="ppmTxnNote" placeholder="Note / reference" maxlength="160"><button class="ppm-btn primary" type="submit">Add ledger entry</button></form><div id="ppmLedgerList" class="ppm-list"></div></div>
      <div class="ppm-block"><h3>Fuel stock tracker</h3><p class="ppm-help">Estimated stock = opening stock + recorded deliveries − current shift nozzle liters. Enter a verified opening stock and each delivery. This is not a replacement for physical tank dip measurements.</p><form id="ppmStockForm" class="ppm-form"><select id="ppmFuel"><option>Petrol</option><option>Diesel</option></select><input id="ppmStockOpening" type="number" min="0" step="0.01" placeholder="Opening stock (L; set initially)"><input id="ppmDelivery" type="number" min="0" step="0.01" placeholder="New delivery (L), optional"><input id="ppmDeliveryNote" placeholder="Delivery note / invoice"><button class="ppm-btn primary" type="submit">Save stock / delivery</button></form><div id="ppmStockList" class="ppm-list"></div></div>
      <div class="ppm-block"><h3>Google Drive backup (optional)</h3><p class="ppm-help">Requires your own Google OAuth Web Client ID and Drive API enabled. Upload is manual; browser-only apps cannot guarantee background backup when closed.</p><div class="ppm-actions"><button class="ppm-btn" id="ppmDriveConnect">Connect Google</button><button class="ppm-btn primary" id="ppmDriveBackup" disabled>Upload backup to Drive</button><button class="ppm-btn" id="ppmDriveRestore" disabled>Restore latest Drive backup</button></div><p id="ppmDriveStatus" class="ppm-status" role="status">Not connected.</p></div>
      <div class="ppm-block"><h3>Validation warnings</h3><ul id="ppmWarnings" class="ppm-warnings"><li>No warnings detected yet.</li></ul></div>`;
    const container = document.querySelector('.container'); container.appendChild(root);
    $('ppmExport').addEventListener('click', exportBackup);
    $('ppmImportFile').addEventListener('change', importBackup);
    $('ppmLedgerForm').addEventListener('submit', addLedgerEntry);
    $('ppmStockForm').addEventListener('submit', saveStock);
    $('ppmDriveConnect').addEventListener('click', connectDrive);
    $('ppmDriveBackup').addEventListener('click', uploadDriveBackup);
    $('ppmDriveRestore').addEventListener('click', restoreDriveBackup);
    renderAll();
  }

  function collectBackup() { return { app: 'Petrol Pump Manager', backupVersion: 1, exportedAt: new Date().toISOString(), legacy: localStorage.getItem(LEGACY_KEY), upgrade: localStorage.getItem(EXTRA_KEY), history: localStorage.getItem(HISTORY_KEY) }; }
  function exportBackup() {
    const blob = new Blob([JSON.stringify(collectBackup(), null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `petrol-pump-backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json`; a.click(); URL.revokeObjectURL(url);
    $('ppmBackupStatus').textContent = 'JSON backup exported at ' + new Date().toLocaleString(); log('JSON export', 'Full application backup');
  }
  async function importBackup(ev) {
    const file = ev.target.files?.[0]; if (!file) return;
    try {
      if (file.size > 10 * 1024 * 1024) throw new Error('File is too large (maximum 10 MB).');
      const data = JSON.parse(await file.text());
      if (data.app !== 'Petrol Pump Manager' || data.backupVersion !== 1 || typeof data.legacy !== 'string') throw new Error('This is not a supported Petrol Pump Manager backup.');
      JSON.parse(data.legacy); if (data.upgrade) JSON.parse(data.upgrade); if (data.history) JSON.parse(data.history);
      if (!confirm('Restore this backup? Current data will first be downloaded as a safety backup.')) return;
      exportBackup();
      localStorage.setItem(LEGACY_KEY, data.legacy);
      if (data.upgrade) localStorage.setItem(EXTRA_KEY, data.upgrade); else localStorage.removeItem(EXTRA_KEY);
      if (data.history) localStorage.setItem(HISTORY_KEY, data.history); else localStorage.removeItem(HISTORY_KEY);
      alert('Backup restored. The app will reload.'); location.reload();
    } catch (err) { alert('Import failed: ' + (err.message || 'Invalid file')); }
    finally { ev.target.value = ''; }
  }

  function addLedgerEntry(ev) {
    ev.preventDefault(); const name = $('ppmCustomer').value.trim(); const amount = Number($('ppmTxnAmount').value);
    if (!name || !Number.isFinite(amount) || amount <= 0) return alert('Enter a customer name and a positive amount.');
    const d = extra(); const type = $('ppmTxnType').value;
    d.customers = d.customers || []; let customer = d.customers.find(c => c.name.toLowerCase() === name.toLowerCase());
    if (!customer) { customer = { id: 'C-' + Date.now(), name }; d.customers.push(customer); }
    d.ledger.unshift({ id: 'L-' + Date.now(), customerId: customer.id, customer: customer.name, type, amount: Number(amount.toFixed(2)), note: $('ppmTxnNote').value.trim(), at: new Date().toISOString() });
    writeExtra(d); log('Ledger entry', `${name}: ${type} ${amount}`); ev.target.reset(); renderAll();
  }
  function customerBalance(d, id) { return (d.ledger || []).filter(x => x.customerId === id).reduce((s, x) => s + (x.type === 'credit' ? x.amount : -x.amount), 0); }
  function saveStock(ev) {
    ev.preventDefault(); const d = extra(); const fuel = $('ppmFuel').value; const openingText = $('ppmStockOpening').value.trim(); const opening = openingText === '' ? null : Number(openingText); const delivery = Number($('ppmDelivery').value || 0);
    if ((opening !== null && (!Number.isFinite(opening) || opening < 0)) || !Number.isFinite(delivery) || delivery < 0) return alert('Stock values must be zero or greater.');
    const old = d.stock[fuel] || { opening: 0, deliveries: [], startAt: new Date().toISOString() }; if (opening !== null) { old.opening = opening; old.startAt = new Date().toISOString(); }
    if (delivery > 0) old.deliveries.push({ id: Date.now(), liters: delivery, note: $('ppmDeliveryNote').value.trim(), at: new Date().toISOString() });
    d.stock[fuel] = old; writeExtra(d); log('Stock updated', `${fuel} opening ${opening} L, delivery ${delivery} L`); $('ppmDelivery').value = ''; $('ppmDeliveryNote').value = ''; renderAll();
  }
  function stateFuelLiters(state, fuel) { return (state?.nozzles || []).reduce((sum, n) => { const a = Number(n.oldR), b = Number(n.newR); return sum + (n.type === fuel && n.oldR !== '' && n.newR !== '' && Number.isFinite(a) && Number.isFinite(b) && b >= a ? b - a : 0); }, 0); }
  function shiftFuelLiters(fuel) {
    let sum = 0; document.querySelectorAll('#nozzlesList .card').forEach(card => { if (card.querySelector('.n-type')?.value === fuel) { const a = card.querySelector('.n-old')?.value; const b = card.querySelector('.n-new')?.value; if (a !== '' && b !== '' && Number(b) >= Number(a)) sum += Number(b) - Number(a); } }); return sum;
  }
  function historicalFuelSales(fuel, startAt) { const since = Date.parse(startAt || 0); return history().reduce((sum, item) => Date.parse(item.date || 0) >= since ? sum + stateFuelLiters(item.state, fuel) : sum, 0); }
  function renderAll() {
    const liters = $('totalLiters')?.innerText || '0 L', expected = $('expectedAmount')?.innerText || '0', collection = $('shiftCollection')?.innerText || '0';
    $('ppmLiters').textContent = liters; $('ppmExpected').textContent = money(parseFloat(expected) || 0); $('ppmCollection').textContent = money(parseFloat(collection) || 0);
    const d = extra(); const due = (d.customers || []).reduce((s, c) => s + Math.max(0, customerBalance(d, c.id)), 0); $('ppmDue').textContent = money(due);
    const h = history(); $('ppmHistoryList').innerHTML = h.length ? h.slice(0, 30).map((x, i) => `<article class="ppm-list-item"><div><strong>${escapeHTML(x.id || 'Shift')}</strong><small>${escapeHTML(x.label || x.date || '')}</small><small>Volume: ${escapeHTML(x.summary?.liters || '—')} · Difference: ${escapeHTML(x.summary?.audit || '—')}</small></div><button class="ppm-btn small" data-history="${i}">Export</button></article>`).join('') : '<p class="ppm-empty">No closed shifts archived yet.</p>';
    $('ppmHistoryList').querySelectorAll('[data-history]').forEach(btn => btn.addEventListener('click', () => exportOneShift(h[Number(btn.dataset.history)])));
    const grouped = (d.customers || []).map(c => ({ ...c, balance: customerBalance(d, c.id) })).sort((a,b) => b.balance-a.balance);
    $('ppmLedgerList').innerHTML = grouped.length ? grouped.map(c => `<article class="ppm-list-item"><div><strong>${escapeHTML(c.name)}</strong><small>${(d.ledger || []).filter(x => x.customerId === c.id).length} transactions</small></div><strong>${money(c.balance)}</strong></article>`).join('') + `<details class="ppm-details"><summary>Recent transactions (${(d.ledger || []).length})</summary>${(d.ledger || []).slice(0, 50).map(t => `<article class="ppm-list-item"><div><strong>${escapeHTML(t.customer)} · ${t.type === 'credit' ? 'Credit' : 'Payment'}</strong><small>${escapeHTML(new Date(t.at).toLocaleString())} · ${escapeHTML(t.note || '')}</small></div><strong>${t.type === 'credit' ? '+' : '−'}${money(t.amount)}</strong></article>`).join('')}</details>` : '<p class="ppm-empty">No customer ledger entries yet.</p>';
    $('ppmStockList').innerHTML = ['Petrol','Diesel'].map(f => { const s = d.stock?.[f] || { opening: 0, deliveries: [], startAt: new Date().toISOString() }; const delivered = (s.deliveries || []).filter(x => Date.parse(x.at) >= Date.parse(s.startAt || 0)).reduce((n, x) => n + num(x.liters), 0); const pastSales = historicalFuelSales(f, s.startAt); const currentSales = shiftFuelLiters(f); const current = num(s.opening) + delivered - pastSales - currentSales; return `<article class="ppm-list-item"><div><strong>${f}</strong><small>Opening ${num(s.opening).toFixed(2)} L · Deliveries ${delivered.toFixed(2)} L · Recorded sales since opening ${ (pastSales + currentSales).toFixed(2)} L</small></div><strong>${current.toFixed(2)} L</strong></article>`; }).join('') + '<p class="ppm-help">Set opening stock at the start of the period. Do not re-enter the same opening stock for every delivery.</p>';
    renderWarnings();
  }
  function exportOneShift(item) { const blob = new Blob([JSON.stringify(item, null, 2)], {type:'application/json'}); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href=url; a.download=`${item.id || 'shift'}.json`; a.click(); URL.revokeObjectURL(url); }
  function escapeHTML(s) { return String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
  function renderWarnings() {
    const warnings = [];
    document.querySelectorAll('#nozzlesList .card').forEach((card, i) => {
      const old = card.querySelector('.n-old')?.value, close = card.querySelector('.n-new')?.value, rate = card.querySelector('.n-rate')?.value;
      if (old !== '' && close !== '' && Number(close) < Number(old)) warnings.push(`Nozzle ${i+1}: closing reading is lower than opening reading. Check meter rollover or entry.`);
      if (rate !== '' && Number(rate) < 0) warnings.push(`Nozzle ${i+1}: rate cannot be negative.`);
      if ((old !== '' || close !== '') && (old === '' || close === '')) warnings.push(`Nozzle ${i+1}: both opening and closing readings are required.`);
    });
    document.querySelectorAll('#nozzlesList input, #ppmTxnAmount, #ppmStockOpening').forEach(input => { if (input.value !== '' && Number(input.value) < 0) warnings.push(`${input.placeholder || 'Input'} cannot be negative.`); });
    $('ppmWarnings').innerHTML = warnings.length ? warnings.map(w => `<li>${escapeHTML(w)}</li>`).join('') : '<li>No basic input warnings detected. Always verify totals against physical cash and pump readings.</li>';
  }

  // Preserve the original shift calculation and storage implementation; add diagnostics and dashboard refresh.
  const originalCalculate = window.calculateShift;
  if (typeof originalCalculate === 'function') window.calculateShift = function () { originalCalculate.apply(this, arguments); if ($('ppm-enhancements')) renderAll(); clearTimeout(saveTimer); saveTimer = setTimeout(() => { if ($('ppm-enhancements')) renderWarnings(); }, 100); if (driveAccessToken) { clearTimeout(driveAutoTimer); driveAutoTimer = setTimeout(() => uploadDriveBackup(), 2500); } };

  // Archive the current shift before clearing it; never silently discard it.
  window.startNewShift = function () {
    if (!confirm('Close and archive this shift, then start a new one? Export a backup regularly.')) return;
    const current = snapshot(); const h = history(); h.unshift(current); saveHistory(h.slice(0, 500)); log('Shift archived', current.id);
    try { localStorage.removeItem(LEGACY_KEY); } catch (e) { alert('Could not reset current shift. Export a backup first.'); return; }
    location.reload();
  };

  // Add history/archive behavior to the original localStorage data without changing its schema.
  function init() {
    addEnhancementUI();
    try {
      const raw = localStorage.getItem(LEGACY_KEY); if (raw) JSON.parse(raw);
    } catch (e) { alert('Saved shift data could not be read. Do not reset the app. Export the storage data if possible, then restore a known-good JSON backup.'); }
    window.addEventListener('beforeunload', () => { try { const raw = localStorage.getItem(LEGACY_KEY); if (raw) JSON.parse(raw); } catch (_) {} });
    if (window.google?.accounts?.oauth2) setupDriveClient();
    else { const gis = document.createElement('script'); gis.src = 'https://accounts.google.com/gsi/client'; gis.async = true; gis.onload = setupDriveClient; document.head.appendChild(gis); }
  }
  function setupDriveClient() {
    if (!window.google?.accounts?.oauth2) return;
    driveTokenClient = google.accounts.oauth2.initTokenClient({ client_id: DRIVE_CLIENT_ID, scope: 'https://www.googleapis.com/auth/drive.appdata', callback: (response) => { if (response.error) { $('ppmDriveStatus').textContent = 'Google authorization failed: ' + response.error; return; } driveAccessToken = response.access_token; $('ppmDriveBackup').disabled = false; $('ppmDriveRestore').disabled = false; $('ppmDriveStatus').textContent = 'Connected for this browser session. You can upload a backup.'; } });
  }
  function connectDrive() {
    if (DRIVE_CLIENT_ID.startsWith('YOUR_')) { alert('First set DRIVE_CLIENT_ID in js/upgrades.js. Follow GOOGLE_DRIVE_SETUP.md.'); return; }
    if (!driveTokenClient) return alert('Google Identity Services has not loaded. Check internet connection and try again.'); driveTokenClient.requestAccessToken();
  }
  async function restoreDriveBackup() {
    if (!driveAccessToken) return alert('Connect Google first.');
    try {
      const listRes = await fetch('https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&orderBy=createdTime%20desc&pageSize=10&fields=files(id,name,createdTime)', { headers:{ Authorization:'Bearer '+driveAccessToken } });
      if (!listRes.ok) throw new Error('Could not list Drive backups (HTTP ' + listRes.status + ').');
      const listing = await listRes.json(); if (!listing.files?.length) return alert('No Petrol Pump Manager backups found in this Google account.');
      const selected = listing.files[0]; if (!confirm('Restore latest backup: ' + selected.name + '? Current data will first be downloaded as a safety backup.')) return;
      const getRes = await fetch('https://www.googleapis.com/drive/v3/files/' + encodeURIComponent(selected.id) + '?alt=media', { headers:{ Authorization:'Bearer '+driveAccessToken } });
      if (!getRes.ok) throw new Error('Could not download backup (HTTP ' + getRes.status + ').');
      const data = await getRes.json(); if (data.app !== 'Petrol Pump Manager' || data.backupVersion !== 1 || typeof data.legacy !== 'string') throw new Error('Drive file is not a supported backup.');
      JSON.parse(data.legacy); if (data.upgrade) JSON.parse(data.upgrade); if (data.history) JSON.parse(data.history);
      exportBackup(); localStorage.setItem(LEGACY_KEY, data.legacy); if (data.upgrade) localStorage.setItem(EXTRA_KEY, data.upgrade); if (data.history) localStorage.setItem(HISTORY_KEY, data.history); location.reload();
    } catch (e) { $('ppmDriveStatus').textContent = 'Restore failed: ' + e.message; }
  }
  async function uploadDriveBackup() {
    if (!driveAccessToken) return alert('Connect Google first.');
    try {
      const body = JSON.stringify(collectBackup()); const metadata = { name: `petrol-pump-backup-${new Date().toISOString()}.json`, mimeType: 'application/json', parents: ['appDataFolder'] };
      const form = new FormData(); form.append('metadata', new Blob([JSON.stringify(metadata)], {type:'application/json'})); form.append('file', new Blob([body], {type:'application/json'}));
      const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,createdTime', { method:'POST', headers:{ Authorization:'Bearer '+driveAccessToken }, body:form });
      if (!response.ok) throw new Error('Drive upload returned HTTP ' + response.status); const result = await response.json(); $('ppmDriveStatus').textContent = `Uploaded ${result.name} at ${new Date().toLocaleString()}`; log('Google Drive backup', result.id);
    } catch (e) { $('ppmDriveStatus').textContent = 'Upload failed: ' + e.message; }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
