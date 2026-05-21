if (!localStorage.getItem('isLoggedIn')) {
    window.location.href = './login.html';
}

const user = JSON.parse(localStorage.getItem('appUser'));

if (user) {
    document.getElementById('userName').textContent = user.name;
}

document.getElementById('logOutBtn').addEventListener('click', () => {
    localStorage.removeItem('isLoggedIn');
    window.location.href = './login.html';
});

const menuToggle = document.getElementById('menuToggle');
const sidebar = document.querySelector('.sidebar');

if (menuToggle) {
    menuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('active');
    });
}

function loadDateSelects() {
    const history = JSON.parse(localStorage.getItem('parkingHistory')) || [];
    const uniqueDates = new Set();
    
    history.forEach(record => {
        const date = new Date(record.entryTime).toISOString().split('T')[0];
        uniqueDates.add(date);
    });
    
    const sortedDates = Array.from(uniqueDates).sort();
    const startSelect = document.getElementById('startTimeSelect');
    const endSelect = document.getElementById('endTimeSelect');
    
    sortedDates.forEach(date => {
        const optionStart = document.createElement('option');
        optionStart.value = date;
        optionStart.textContent = date;
        startSelect.appendChild(optionStart);
        
        const optionEnd = document.createElement('option');
        optionEnd.value = date;
        optionEnd.textContent = date;
        endSelect.appendChild(optionEnd);
    });
    
    startSelect.addEventListener('change', generateReport);
    endSelect.addEventListener('change', generateReport);
}

function generateReport() {
    const startDate = document.getElementById('startTimeSelect').value;
    const endDate = document.getElementById('endTimeSelect').value;
    const tbody = document.getElementById('statusTableBody');
    
    if (!startDate || !endDate) {
        tbody.innerHTML = `<tr><td colspan="5" class="empty-state">Please select a Start Time and Finish Time.</td></tr>`;
        return;
    }

    if (startDate > endDate) {
        tbody.innerHTML = `<tr><td colspan="5" class="empty-state" style="color: red;">Start Time cannot be greater than Finish Time.</td></tr>`;
        return;
    }
    
    const history = JSON.parse(localStorage.getItem('parkingHistory')) || [];
    const vehicleTypes = JSON.parse(localStorage.getItem('vehicleType')) || [];
    
    const filteredHistory = history.filter(record => {
        const recordDate = new Date(record.entryTime).toISOString().split('T')[0];
        return recordDate >= startDate && recordDate <= endDate;
    });
    
    const stats = {};
    vehicleTypes.forEach(type => {
        stats[type.Name] = { code: type.Code, name: type.Name, count: 0, time: 0, earnings: 0 };
    });
    
    filteredHistory.forEach(record => {
        if (stats[record.type]) {
            stats[record.type].count += 1;
            stats[record.type].time += record.hours;
            stats[record.type].earnings += parseFloat(record.total);
        }
    });
    
    tbody.innerHTML = '';
    let hasData = false;
    
    for (const key in stats) {
        const s = stats[key];
        if (s.count > 0) {
            hasData = true;
            tbody.innerHTML += `<tr><td>${s.code}</td><td>${s.name}</td><td>${s.count}</td><td>${s.time} hr(s)</td><td>Q ${s.earnings.toFixed(2)}</td></tr>`;
        }
    }
    
    if (!hasData) tbody.innerHTML = `<tr><td colspan="5" class="empty-state">No services found for the selected dates.</td></tr>`;
}

loadDateSelects();
generateReport();

