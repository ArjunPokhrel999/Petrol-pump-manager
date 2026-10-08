
let nozzleCount = 0;

function toggleSection(sectionId) {
    const body = document.getElementById(sectionId);
    const header = body.previousElementSibling;
    
    if (body.classList.contains('closed')) {
        body.classList.remove('closed');
        header.classList.remove('closed');
    } else {
        body.classList.add('closed');
        header.classList.add('closed');
    }
}

function openSection(sectionId) {
    const body = document.getElementById(sectionId);
    const header = body.previousElementSibling;

    body.classList.remove('closed');
    header.classList.remove('closed');
}

function updateNepaliClock() {
    const now = new Date();
    const options = { 
        timeZone: 'Asia/Kathmandu', 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit',
        hour12: true 
    };
    const timeString = new Intl.DateTimeFormat('en-US', options).format(now);
    document.getElementById('nepaliClock').innerText = `NPT: ${timeString}`;
}

function getFormattedTime() {
    const now = new Date();
    return new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Kathmandu',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    }).format(now);
}

setInterval(updateNepaliClock, 1000);

function addNozzle(data = null) {
    nozzleCount++;
    const container = document.getElementById('nozzlesList');
    const div = document.createElement('div');
    div.className = 'card';
    div.id = `nozzle-${nozzleCount}`;

    let selectedFuel = data ? data.type : (nozzleCount % 2 === 0 ? 'Diesel' : 'Petrol');

    div.innerHTML = `
        <div style="display:flex; justify-content:space-between; margin-bottom:4px; align-items:center;">
            <b style="font-size:12px; color:var(--text-main);">Nozzle #${nozzleCount}</b>
            ${nozzleCount > 1 ? `<button class="btn-remove" style="padding: 2px 6px; font-size:11px;" onclick="removeElem('nozzle-${nozzleCount}')">Delete</button>` : ''}
        </div>
        <div class="flex-row">
            <select class="n-type" onchange="calculateShift()">
                <option value="Petrol" ${selectedFuel === 'Petrol' ? 'selected' : ''}>Petrol</option>
                <option value="Diesel" ${selectedFuel === 'Diesel' ? 'selected' : ''}>Diesel</option>
            </select>
            <input type="number" class="n-rate" placeholder="Rate / L (Rs)" value="${data ? data.rate : ''}" oninput="calculateShift()">
        </div>
        <div class="flex-row">
            <input type="number" class="n-old" placeholder="Opening Reading" value="${data ? data.oldR : ''}" oninput="calculateShift()">
            <input type="number" class="n-new" placeholder="Closing Reading" value="${data ? data.newR : ''}" oninput="calculateShift()">
        </div>
    `;
    container.appendChild(div);
    if (!data) openSection('sec-nozzle');
    calculateShift();
}

function addPurchaseReturn(data = null) {
    const container = document.getElementById('purchaseReturnList');
    const id = Date.now() + Math.random();
    const div = document.createElement('div');
    div.className = 'flex-row';
    div.id = `return-${id}`;

    let selectedType = data ? data.type : 'Petrol';

    div.innerHTML = `
        <select class="return-type" onchange="calculateShift()">
            <option value="Petrol" ${selectedType === 'Petrol' ? 'selected' : ''}>Petrol</option>
            <option value="Diesel" ${selectedType === 'Diesel' ? 'selected' : ''}>Diesel</option>
        </select>
        <input type="number" class="return-liters" placeholder="Liters" value="${data ? data.liters : ''}" oninput="calculateShift()">
        <input type="number" class="return-rate" placeholder="Rate / L" value="${data ? data.rate : ''}" oninput="calculateShift()">
        <button class="btn-remove" onclick="removeElem('return-${id}')">✕</button>
    `;
    container.appendChild(div);
    if (!data) openSection('sec-return');
    calculateShift();
}

function addCashInHand(data = null) {
    const container = document.getElementById('cashInHandList');
    const id = Date.now() + Math.random();
    const div = document.createElement('div');
    div.className = 'flex-row';
    div.id = `cashin-${id}`;
    const timestamp = data ? data.time : getFormattedTime();

    div.innerHTML = `
        <span class="time-badge">${timestamp}</span>
        <input type="text" class="cashin-remark" placeholder="Remark / Counter" value="${data ? data.remark : ''}" oninput="calculateShift()">
        <input type="number" class="cashin-amt" placeholder="Amount (Rs)" value="${data ? data.amt : ''}" oninput="calculateShift()">
        <button class="btn-remove" onclick="removeElem('cashin-${id}')">✕</button>
    `;
    container.appendChild(div);
    div.dataset.time = timestamp;
    if (!data) openSection('sec-cashin');
    calculateShift();
}

function addCashHandover(data = null) {
    const container = document.getElementById('cashOutList');
    const id = Date.now() + Math.random();
    const div = document.createElement('div');
    div.className = 'flex-row';
    div.id = `cashout-${id}`;
    const timestamp = data ? data.time : getFormattedTime();

    div.innerHTML = `
        <span class="time-badge">${timestamp}</span>
        <input type="text" class="cashout-person" placeholder="Receiver / Safe" value="${data ? data.person : ''}" oninput="calculateShift()">
        <input type="number" class="cashout-amt" placeholder="Amount (Rs)" value="${data ? data.amt : ''}" oninput="calculateShift()">
        <button class="btn-remove" onclick="removeElem('cashout-${id}')">✕</button>
    `;
    container.appendChild(div);
    div.dataset.time = timestamp;
    if (!data) openSection('sec-cashout');
    calculateShift();
}

function addFonepay(data = null) {
    const container = document.getElementById('fonepayList');
    const id = Date.now() + Math.random();
    const div = document.createElement('div');
    div.className = 'flex-row';
    div.id = `fonepay-${id}`;
    const timestamp = data ? data.time : getFormattedTime();

    div.innerHTML = `
        <span class="time-badge">${timestamp}</span>
        <input type="text" class="fonepay-remark" placeholder="Txn ID / Remark" value="${data ? data.remark : ''}" oninput="calculateShift()">
        <input type="number" class="fonepay-amt" placeholder="Amount (Rs)" value="${data ? data.amt : ''}" oninput="calculateShift()">
        <button class="btn-remove" onclick="removeElem('fonepay-${id}')">✕</button>
    `;
    container.appendChild(div);
    div.dataset.time = timestamp;
    if (!data) openSection('sec-fonepay');
    calculateShift();
}

function addCredit(data = null) {
    const container = document.getElementById('creditList');
    const id = Date.now() + Math.random();
    const div = document.createElement('div');
    div.className = 'flex-row';
    div.id = `credit-${id}`;
    const timestamp = data ? data.time : getFormattedTime();

    div.innerHTML = `
        <span class="time-badge">${timestamp}</span>
        <input type="text" class="credit-name" placeholder="Customer Name" value="${data ? data.name : ''}" oninput="calculateShift()">
        <input type="number" class="credit-amt" placeholder="Amount (Rs)" value="${data ? data.amt : ''}" oninput="calculateShift()">
        <button class="btn-remove" onclick="removeElem('credit-${id}')">✕</button>
    `;
    container.appendChild(div);
    div.dataset.time = timestamp;
    if (!data) openSection('sec-credit');
    calculateShift();
}

function addRecovery(data = null) {
    const container = document.getElementById('recoveryList');
    const id = Date.now() + Math.random();
    const div = document.createElement('div');
    div.className = 'flex-row';
    div.id = `recovery-${id}`;
    const timestamp = data ? data.time : getFormattedTime();

    div.innerHTML = `
        <span class="time-badge">${timestamp}</span>
        <input type="text" class="recovery-name" placeholder="Customer Name" value="${data ? data.name : ''}" oninput="calculateShift()">
        <input type="number" class="recovery-amt" placeholder="Amount Received (Rs)" value="${data ? data.amt : ''}" oninput="calculateShift()">
        <button class="btn-remove" onclick="removeElem('recovery-${id}')">✕</button>
    `;
    container.appendChild(div);
    div.dataset.time = timestamp;
    if (!data) openSection('sec-recovery');
    calculateShift();
}

function addStaffAdjustment(data = null) {
    const container = document.getElementById('staffList');
    const id = Date.now() + Math.random();
    const div = document.createElement('div');
    div.className = 'flex-row';
    div.id = `staff-${id}`;
    const timestamp = data ? data.time : getFormattedTime();
    
    const typeGiven = data && data.type === 'given' ? 'selected' : '';
    const typeReceived = data && data.type === 'received' ? 'selected' : '';

    div.innerHTML = `
        <span class="time-badge">${timestamp}</span>
        <input type="text" class="staff-name" placeholder="Staff Name" value="${data ? data.name : ''}" oninput="calculateShift()">
        <select class="staff-type" onchange="calculateShift()">
            <option value="given" ${typeGiven}>📤 Gave (-)</option>
            <option value="received" ${typeReceived}>📥 Received (+)</option>
        </select>
        <input type="number" class="staff-amt" placeholder="Amount (Rs)" value="${data ? data.amt : ''}" oninput="calculateShift()">
        <button class="btn-remove" onclick="removeElem('staff-${id}')">✕</button>
    `;
    container.appendChild(div);
    div.dataset.time = timestamp;
    if (!data) openSection('sec-staff');
    calculateShift();
}

function removeElem(id) {
    document.getElementById(id).remove();
    calculateShift();
}

function calculateShift() {
    let totalLiters = 0;
    let rawExpectedSale = 0;

    let petrolLiters = 0, petrolAmt = 0;
    let dieselLiters = 0, dieselAmt = 0;

    let nozzlesData = [];
    const nozzleElems = document.querySelectorAll('#nozzlesList .card');
    document.getElementById('count-nozzle').innerText = nozzleElems.length;

    nozzleElems.forEach(card => {
        let type = card.querySelector('.n-type').value;
        let oldR = parseFloat(card.querySelector('.n-old').value) || 0;
        let newR = parseFloat(card.querySelector('.n-new').value) || 0;
        let rate = parseFloat(card.querySelector('.n-rate').value) || 0;

        let liters = newR >= oldR ? newR - oldR : 0;
        let amount = liters * rate;

        totalLiters += liters;
        rawExpectedSale += amount;

        if (type === 'Petrol') {
            petrolLiters += liters;
            petrolAmt += amount;
        } else {
            dieselLiters += liters;
            dieselAmt += amount;
        }

        nozzlesData.push({ 
            type: type, 
            oldR: card.querySelector('.n-old').value, 
            newR: card.querySelector('.n-new').value, 
            rate: card.querySelector('.n-rate').value 
        });
    });

    let totalPurchaseReturnAmt = 0;
    let purchaseReturnData = [];
    const returnElems = document.querySelectorAll('#purchaseReturnList .flex-row');
    document.getElementById('count-return').innerText = returnElems.length;

    returnElems.forEach(row => {
        let type = row.querySelector('.return-type').value;
        let litersStr = row.querySelector('.return-liters').value;
        let rateStr = row.querySelector('.return-rate').value;
        let liters = parseFloat(litersStr) || 0;
        let rate = parseFloat(rateStr) || 0;
        let amt = liters * rate;

        totalPurchaseReturnAmt += amt;
        purchaseReturnData.push({ type, liters: litersStr, rate: rateStr });
    });

    document.getElementById('petrolLiters').innerText = petrolLiters.toFixed(2) + " L";
    document.getElementById('petrolAmount').innerText = petrolAmt.toFixed(2);
    document.getElementById('dieselLiters').innerText = dieselLiters.toFixed(2) + " L";
    document.getElementById('dieselAmount').innerText = dieselAmt.toFixed(2);
    document.getElementById('returnAmount').innerText = totalPurchaseReturnAmt.toFixed(2);

    let totalCashInHand = 0;
    let cashInHandData = [];
    const cashInElems = document.querySelectorAll('#cashInHandList .flex-row');
    document.getElementById('count-cashin').innerText = cashInElems.length;

    cashInElems.forEach(row => {
        let remark = row.querySelector('.cashin-remark').value;
        let amtStr = row.querySelector('.cashin-amt').value;
        let amt = parseFloat(amtStr) || 0;
        totalCashInHand += amt;
        cashInHandData.push({ remark, amt: amtStr, time: row.dataset.time });
    });

    let totalCashOut = 0;
    let cashOutData = [];
    const cashOutElems = document.querySelectorAll('#cashOutList .flex-row');
    document.getElementById('count-cashout').innerText = cashOutElems.length;

    cashOutElems.forEach(row => {
        let person = row.querySelector('.cashout-person').value;
        let amtStr = row.querySelector('.cashout-amt').value;
        let amt = parseFloat(amtStr) || 0;
        totalCashOut += amt;
        cashOutData.push({ person, amt: amtStr, time: row.dataset.time });
    });

    let totalFonepay = 0;
    let fonepayData = [];
    const fonepayElems = document.querySelectorAll('#fonepayList .flex-row');
    document.getElementById('count-fonepay').innerText = fonepayElems.length;

    fonepayElems.forEach(row => {
        let remark = row.querySelector('.fonepay-remark').value;
        let amtStr = row.querySelector('.fonepay-amt').value;
        let amt = parseFloat(amtStr) || 0;
        totalFonepay += amt;
        fonepayData.push({ remark, amt: amtStr, time: row.dataset.time });
    });

    let totalCredit = 0;
    let creditData = [];
    const creditElems = document.querySelectorAll('#creditList .flex-row');
    document.getElementById('count-credit').innerText = creditElems.length;

    creditElems.forEach(row => {
        let name = row.querySelector('.credit-name').value;
        let amtStr = row.querySelector('.credit-amt').value;
        let amt = parseFloat(amtStr) || 0;
        totalCredit += amt;
        creditData.push({ name, amt: amtStr, time: row.dataset.time });
    });

    let totalRecovery = 0;
    let recoveryData = [];
    const recoveryElems = document.querySelectorAll('#recoveryList .flex-row');
    document.getElementById('count-recovery').innerText = recoveryElems.length;

    recoveryElems.forEach(row => {
        let name = row.querySelector('.recovery-name').value;
        let amtStr = row.querySelector('.recovery-amt').value;
        let amt = parseFloat(amtStr) || 0;
        totalRecovery += amt;
        recoveryData.push({ name, amt: amtStr, time: row.dataset.time });
    });

    let netStaffAdjustment = 0;
    let staffData = [];
    const staffElems = document.querySelectorAll('#staffList .flex-row');
    document.getElementById('count-staff').innerText = staffElems.length;

    staffElems.forEach(row => {
        let name = row.querySelector('.staff-name').value;
        let type = row.querySelector('.staff-type').value;
        let amtStr = row.querySelector('.staff-amt').value;
        let amt = parseFloat(amtStr) || 0;

        if (type === 'given') netStaffAdjustment -= amt;
        else netStaffAdjustment += amt;

        staffData.push({ name, type, amt: amtStr, time: row.dataset.time });
    });

    let openingBalance = parseFloat(document.getElementById('openingBalance').value) || 0;
    let sapat = parseFloat(document.getElementById('sapat').value) || 0;

    let shiftCollection = totalCashInHand + totalCashOut + totalFonepay + totalCredit + totalRecovery + sapat + netStaffAdjustment;
    let finalExpectedSale = (rawExpectedSale - totalPurchaseReturnAmt) + openingBalance;
    let difference = shiftCollection - finalExpectedSale;

    document.getElementById('totalLiters').innerText = totalLiters.toFixed(2) + " L";
    document.getElementById('expectedAmount').innerText = (rawExpectedSale - totalPurchaseReturnAmt).toFixed(2);
    document.getElementById('shiftCollection').innerText = shiftCollection.toFixed(2);

    let statusElement = document.getElementById('finalStatus');
    let auditNote = document.getElementById('auditNote');

    if (difference > 0) {
        statusElement.innerText = "+ Rs. " + difference.toFixed(2);
        statusElement.className = "surplus";
        auditNote.innerText = "Surplus (Extra Cash Found)";
    } else if (difference < 0) {
        statusElement.innerText = "- Rs. " + Math.abs(difference).toFixed(2);
        statusElement.className = "shortage";
        auditNote.innerText = "Shortage (Cash Deficit)";
    } else {
        statusElement.innerText = "Rs. 0.00";
        statusElement.className = "surplus";
        auditNote.innerText = "Exact Match (Balanced)";
    }

    const state = {
        openingBalance: document.getElementById('openingBalance').value,
        sapat: document.getElementById('sapat').value,
        nozzles: nozzlesData,
        purchaseReturns: purchaseReturnData,
        cashInHand: cashInHandData,
        cashOut: cashOutData,
        fonepay: fonepayData,
        credit: creditData,
        recovery: recoveryData,
        staff: staffData
    };
    localStorage.setItem('petrol_pump_compact_data', JSON.stringify(state));
}

function generatePDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    let timeStr = document.getElementById('nepaliClock').innerText.replace('NPT: ', '');
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("PETROL PUMP SHIFT AUDIT REPORT", 105, 14, { align: "center" });
    
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(`Generated Date & Time (NPT): ${timeStr}`, 105, 20, { align: "center" });
    doc.line(14, 23, 196, 23);

    let currentY = 27;

    const tableStyles = {
        theme: 'grid',
        styles: { fontSize: 8, cellPadding: 2, font: 'helvetica' },
        headStyles: { fillColor: [225, 231, 239], textColor: [15, 23, 42], fontStyle: 'bold', lineWidth: 0.1, lineColor: [200, 200, 200] },
        bodyStyles: { lineWidth: 0.1, lineColor: [220, 220, 220] }
    };

    // 1. Nozzle Dispenser Log
    const nozzleRows = [];
    document.querySelectorAll('#nozzlesList .card').forEach((card, i) => {
        let type = card.querySelector('.n-type').value;
        let oldR = parseFloat(card.querySelector('.n-old').value) || 0;
        let newR = parseFloat(card.querySelector('.n-new').value) || 0;
        let rate = parseFloat(card.querySelector('.n-rate').value) || 0;
        let liters = newR >= oldR ? newR - oldR : 0;
        let amt = liters * rate;
        nozzleRows.push([`Nozzle ${i+1} (${type})`, oldR.toFixed(2), newR.toFixed(2), liters.toFixed(2) + " L", rate.toFixed(2), "Rs. " + amt.toFixed(2)]);
    });

    if (nozzleRows.length > 0) {
        doc.autoTable({
            startY: currentY,
            head: [['Nozzle Fuel', 'Opening Reading', 'Closing Reading', 'Volume', 'Rate (Rs)', 'Total Amount']],
            body: nozzleRows,
            ...tableStyles
        });
        currentY = doc.lastAutoTable.finalY + 6;
    }

    // 2. Purchase Return Table
    const returnRows = [];
    document.querySelectorAll('#purchaseReturnList .flex-row').forEach((row) => {
        let type = row.querySelector('.return-type').value;
        let liters = parseFloat(row.querySelector('.return-liters').value) || 0;
        let rate = parseFloat(row.querySelector('.return-rate').value) || 0;
        let amt = liters * rate;
        returnRows.push([type, liters.toFixed(2) + " L", rate.toFixed(2), "Rs. " + amt.toFixed(2)]);
    });

    if (returnRows.length > 0) {
        doc.autoTable({
            startY: currentY,
            head: [['Purchase Return Fuel', 'Returned Volume', 'Rate (Rs)', 'Deducted Amount']],
            body: returnRows,
            ...tableStyles
        });
        currentY = doc.lastAutoTable.finalY + 6;
    }

    // 3. Cash & Financial Ledger
    const ledgerRows = [];
    let opening = parseFloat(document.getElementById('openingBalance').value) || 0;
    let sapat = parseFloat(document.getElementById('sapat').value) || 0;
    if (opening > 0) ledgerRows.push(['- ', 'Opening Change Provided', 'Cash Base', '+ Rs. ' + opening.toFixed(2)]);
    if (sapat > 0) ledgerRows.push(['- ', 'Salary Advance / Expense', 'Expense', '+ Rs. ' + sapat.toFixed(2)]);

    document.querySelectorAll('#cashInHandList .flex-row').forEach(row => {
        ledgerRows.push([row.dataset.time || '-', row.querySelector('.cashin-remark').value || 'Physical Cash', 'Counter Cash In Hand', '+ Rs. ' + (parseFloat(row.querySelector('.cashin-amt').value) || 0).toFixed(2)]);
    });
    document.querySelectorAll('#cashOutList .flex-row').forEach(row => {
        ledgerRows.push([row.dataset.time || '-', row.querySelector('.cashout-person').value || 'Safe/Owner Deposit', 'Cash Handover Out', '+ Rs. ' + (parseFloat(row.querySelector('.cashout-amt').value) || 0).toFixed(2)]);
    });

    // FONEPAY - Single Combined Total Row
    let totalFonepayPdf = 0;
    let fonepayCount = 0;
    document.querySelectorAll('#fonepayList .flex-row').forEach(row => {
        totalFonepayPdf += parseFloat(row.querySelector('.fonepay-amt').value) || 0;
        fonepayCount++;
    });
    if (totalFonepayPdf > 0) {
        ledgerRows.push(['- ', `Total Fonepay Transactions (${fonepayCount} Entries)`, 'Fonepay / Digital Total', '+ Rs. ' + totalFonepayPdf.toFixed(2)]);
    }

    document.querySelectorAll('#creditList .flex-row').forEach(row => {
        ledgerRows.push([row.dataset.time || '-', row.querySelector('.credit-name').value || 'Customer', 'Credit Sale Ledger', '+ Rs. ' + (parseFloat(row.querySelector('.credit-amt').value) || 0).toFixed(2)]);
    });
    
    // Old Credit Received Entries
    document.querySelectorAll('#recoveryList .flex-row').forEach(row => {
        ledgerRows.push([row.dataset.time || '-', row.querySelector('.recovery-name').value || 'Customer', 'Old Credit Received', '+ Rs. ' + (parseFloat(row.querySelector('.recovery-amt').value) || 0).toFixed(2)]);
    });

    document.querySelectorAll('#staffList .flex-row').forEach(row => {
        let type = row.querySelector('.staff-type').value;
        let amt = parseFloat(row.querySelector('.staff-amt').value) || 0;
        ledgerRows.push([row.dataset.time || '-', row.querySelector('.staff-name').value || 'Staff Member', `Staff ${type.toUpperCase()}`, (type === 'given' ? '- Rs. ' : '+ Rs. ') + amt.toFixed(2)]);
    });

    if (ledgerRows.length > 0) {
        doc.autoTable({
            startY: currentY,
            head: [['Time (NPT)', 'Transaction Remark / Person', 'Collection Category', 'Recorded Amount']],
            body: ledgerRows,
            ...tableStyles
        });
        currentY = doc.lastAutoTable.finalY + 6;
    }

    // 4. Executive Summary Audit Table
    const summaryRows = [
        ['Total Fuel Volume Dispensed', document.getElementById('totalLiters').innerText],
        ['Purchase Returns Deducted', "Rs. " + document.getElementById('returnAmount').innerText],
        ['Expected Target Collection', "Rs. " + document.getElementById('expectedAmount').innerText],
        ['Actual Total Collections Recorded', "Rs. " + document.getElementById('shiftCollection').innerText],
        ['Audit Shift Status', document.getElementById('finalStatus').innerText + " (" + document.getElementById('auditNote').innerText + ")"]
    ];

    doc.autoTable({
        startY: currentY,
        head: [['Audit Summary Field', 'Shift Total']],
        body: summaryRows,
        ...tableStyles,
        headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: 'bold' }
    });

    doc.save(`Shift_Audit_Report_${Date.now()}.pdf`);
}

function loadSavedData() {
    const saved = localStorage.getItem('petrol_pump_compact_data');
    if (saved) {
        const state = JSON.parse(saved);
        document.getElementById('openingBalance').value = state.openingBalance || '';
        document.getElementById('sapat').value = state.sapat || '';

        document.getElementById('nozzlesList').innerHTML = '';
        nozzleCount = 0;
        if (state.nozzles && state.nozzles.length > 0) {
            state.nozzles.forEach(n => addNozzle(n));
        } else {
            addNozzle();
        }

        document.getElementById('purchaseReturnList').innerHTML = '';
        if (state.purchaseReturns && state.purchaseReturns.length > 0) {
            state.purchaseReturns.forEach(pr => addPurchaseReturn(pr));
        }

        document.getElementById('cashInHandList').innerHTML = '';
        if (state.cashInHand && state.cashInHand.length > 0) {
            state.cashInHand.forEach(c => addCashInHand(c));
        }

        document.getElementById('cashOutList').innerHTML = '';
        if (state.cashOut && state.cashOut.length > 0) {
            state.cashOut.forEach(co => addCashHandover(co));
        }

        document.getElementById('fonepayList').innerHTML = '';
        if (state.fonepay && state.fonepay.length > 0) {
            state.fonepay.forEach(f => addFonepay(f));
        }

        document.getElementById('creditList').innerHTML = '';
        if (state.credit && state.credit.length > 0) {
            state.credit.forEach(c => addCredit(c));
        }

        document.getElementById('recoveryList').innerHTML = '';
        if (state.recovery && state.recovery.length > 0) {
            state.recovery.forEach(r => addRecovery(r));
        }

        document.getElementById('staffList').innerHTML = '';
        if (state.staff && state.staff.length > 0) {
            state.staff.forEach(s => addStaffAdjustment(s));
        }
    } else {
        addNozzle();
    }
    updateNepaliClock();
    calculateShift();
}

function startNewShift() {
    if (confirm("Reset current shift data and start fresh?")) {
        localStorage.removeItem('petrol_pump_compact_data');
        location.reload();
    }
}

window.onload = function() {
    loadSavedData();
};
