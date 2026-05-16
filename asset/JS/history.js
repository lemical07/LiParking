// ===== AUTH =====

if (!localStorage.getItem('isLoggedIn')) {
    window.location.href = './login.html';
}

// ===== USER =====

const user = JSON.parse(localStorage.getItem('appUser'));

if (user) {
    document.getElementById('userName').textContent = user.name;
}

// ===== LOGOUT =====

document.getElementById('logOutBtn').addEventListener('click', () => {

    localStorage.removeItem('isLoggedIn');

    window.location.href = './login.html';
});

// ===== SIDEBAR MOBILE =====

const menuToggle = document.getElementById('menuToggle');
const sidebar = document.querySelector('.sidebar');

if (menuToggle) {

    menuToggle.addEventListener('click', () => {

        sidebar.classList.toggle('active');
    });
}

// ===== HISTORY TABLE =====

function renderHistory() {

    const history =
        JSON.parse(localStorage.getItem('parkingHistory')) || [];

    const tbody = document.getElementById('historyTableBody');

    // SIN REGISTROS
    if (history.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="empty-state">
                    No parking history available yet.
                </td>
            </tr>
        `;

        document.getElementById('totalRecords').textContent = '0';

        document.getElementById('totalEarnings').textContent = 'Q 0.00';

        return;
    }

    // CON REGISTROS
    tbody.innerHTML = '';

    let totalEarnings = 0;

    history.forEach(record => {

        const entryTime =
            new Date(record.entryTime).toLocaleString('en-US');

        const exitTime =
            new Date(record.exitTime).toLocaleString('en-US');

        totalEarnings += parseFloat(record.total);

        tbody.innerHTML += `
            <tr>
                <td>${record.slot}</td>
                <td><strong>${record.plate}</strong></td>
                <td>${record.type}</td>
                <td>${entryTime}</td>
                <td>${exitTime}</td>
                <td>${record.hours} hr(s)</td>
                <td>Q ${record.total}</td>
            </tr>
        `;
    });

    document.getElementById('totalRecords').textContent =
        history.length;

    document.getElementById('totalEarnings').textContent =
        `Q ${totalEarnings.toFixed(2)}`;
}

// ===== CLEAR HISTORY =====

document.getElementById('btnClearHistory')
.addEventListener('click', () => {

    const confirmDelete =
        confirm('Are you sure you want to clear all history?');

    if (!confirmDelete) return;

    localStorage.removeItem('parkingHistory');

    renderHistory();
});

// ===== INIT =====

renderHistory();