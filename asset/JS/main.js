if (!localStorage.getItem('isLoggedIn')) {
    window.location.href = './login.html';
}
console.log("LiParking System on the way...")

const newTypeBtn = document.getElementById("newTypeBtn");
const modal = document.getElementById("modalType");
const closeModalBtn = document.getElementById("closeModal");
const btnCancel = document.getElementById("btnCancel");
const formType = document.getElementById("formType");
const selectVehicle = document.getElementById('names');
const inputRate = document.getElementById('Hrate');
const menuToggle = document.getElementById('menuToggle');
const sidebarElement = document.querySelector('.sidebar');
const formParkingEntry = document.getElementById('formParkingEntry');

let currentSlotID = null;
let currentSlotIndex = null;
let pendingExitIndex = null;
let editIndex = null;
let activeParking = JSON.parse(localStorage.getItem('activeParking')) || [];

function updateEntryTime() {
    const el = document.getElementById('entryTime');
    if (el) el.value = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
}

const SLOTS_LIMIT = 20;


// ===== MODAL =====

newTypeBtn.addEventListener("click", () => {
    editIndex = null;
    document.getElementById('modalTitle').textContent = "New Vehicle Type";
    formType.reset();
    modal.style.display = "flex";
});

const hideModal = () => {
    modal.style.display = "none";
};

closeModalBtn.addEventListener("click", hideModal);
btnCancel.addEventListener("click", hideModal);

selectVehicle.addEventListener('change', () => {
    const selectedOption = selectVehicle.options[selectVehicle.selectedIndex];
    const price = selectedOption.getAttribute('data-price');
    if (price) {
        inputRate.value = price;
    }
});

formType.addEventListener('submit', (e) => {
    e.preventDefault();

    const existingType = JSON.parse(localStorage.getItem('vehicleType')) || [];

    const newType = {
        Code: document.getElementById('code').value,
        Name: document.getElementById('names').value,
        Rate: document.getElementById('Hrate').value
    };

    if (editIndex !== null) {
        existingType[editIndex] = newType;
        editIndex = null;
    } else {
        existingType.push(newType);
    }

    localStorage.setItem('vehicleType', JSON.stringify(existingType));
    formType.reset();
    hideModal();
    renderTable();
});


// ===== NAVIGATION =====

const navLinks = document.querySelectorAll('.sidebar nav a');
const sections = document.querySelectorAll('.content-section');

navLinks.forEach(link => {

    link.addEventListener('click', (e) => {

        const targetSection = link.getAttribute('data-section');

        // SI NO TIENE data-section → dejar navegar normal
        if (!targetSection) {
            return;
        }

        // SOLO prevenir navegación en secciones internas
        e.preventDefault();

        navLinks.forEach(l =>
            l.parentElement.classList.remove('active')
        );

        link.parentElement.classList.add('active');

        const pageTitle =
            document.getElementById('pageTitle');

        pageTitle.textContent = link.textContent;

        sections.forEach(section => {

            section.classList.remove('active');
            section.classList.add('hidden');
        });

        const targetElement =
            document.getElementById(`${targetSection}-section`);

        if (targetElement) {

            targetElement.classList.remove('hidden');
            targetElement.classList.add('active');
        }

        if (
            window.innerWidth <= 768 &&
            sidebarElement.classList.contains('active')
        ) {
            sidebarElement.classList.remove('active');
        }

        if (targetSection === 'parking') {

            loadVehicleTypesToSelect();

            if (typeof updateEntryTime === 'function') {
                updateEntryTime();
            }
        }
    });
});


// ===== VEHICLE TYPES TABLE =====

const renderTable = () => {
    const tableBody = document.getElementById('bodyTypes');
    const existingType = JSON.parse(localStorage.getItem('vehicleType')) || [];

    if (existingType.length === 0) {
        tableBody.innerHTML = `
        <tr>
            <td colspan="4" class="empty-state">
                There are no registered vehicle types yet.<br>
                Click on "New Type" to add one.
            </td>
        </tr>`;
        return;
    }

    tableBody.innerHTML = '';
    existingType.forEach((type, index) => {
        tableBody.innerHTML += `
        <tr>
            <td>${type.Code}</td>
            <td>${type.Name}</td>
            <td>Q ${type.Rate}</td>
            <td class="actions">
                <button class="btn-edit" onclick="editType(${index})">Edit</button>
                <button class="btn-delete" onclick="deleteType(${index})">Delete</button>
            </td>
        </tr>`;
    });
};

const deleteType = (index) => {
    const existingType = JSON.parse(localStorage.getItem('vehicleType')) || [];
    existingType.splice(index, 1);
    localStorage.setItem('vehicleType', JSON.stringify(existingType));
    renderTable();
};

const editType = (index) => {
    editIndex = index;
    const existingType = JSON.parse(localStorage.getItem('vehicleType')) || [];
    const typeToEdit = existingType[index];

    document.getElementById('modalTitle').textContent = "Edit Vehicle Type";
    document.getElementById('code').value = typeToEdit.Code;
    document.getElementById('names').value = typeToEdit.Name;
    document.getElementById('Hrate').value = typeToEdit.Rate;

    modal.style.display = "flex";
};

renderTable();


// ===== SIDEBAR MENU =====

if (menuToggle) {
    menuToggle.addEventListener('click', () => {
        sidebarElement.classList.toggle('active');
    });
}

document.addEventListener('click', (e) => {
    if (sidebarElement.classList.contains('active') &&
        !sidebarElement.contains(e.target) &&
        !menuToggle.contains(e.target)) {
        sidebarElement.classList.remove('active');
    }
});


// ===== CLOCK =====

function updateClock() {
    const now = new Date();

    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    const timeDisplay = document.getElementById('clockTime');
    if (timeDisplay) {
        timeDisplay.textContent = `${hours}:${minutes}:${seconds}`;
    }

    const dateDisplay = document.getElementById('clockDate');
    if (dateDisplay) {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        dateDisplay.textContent = now.toLocaleDateString('en-US', options);
    }
}

setInterval(updateClock, 1000);
updateClock();


// ===== PARKING ENTRY =====

function loadVehicleTypesToSelect() {
    const select = document.getElementById('vehicleSelect');
    const savedTypes = JSON.parse(localStorage.getItem('vehicleType')) || [];

    if (!select) return;

    select.innerHTML = '<option value="" disabled selected>Select type...</option>';

    savedTypes.forEach(type => {
        const option = document.createElement('option');
        option.value = type.Rate;
        option.textContent = `${type.Name} (Q${type.Rate})`;
        option.dataset.name = type.Name;
        select.appendChild(option);
    });
}

document.getElementById('vehicleSelect')?.addEventListener('change', (e) => {
    const rateInput = document.getElementById('currentRate');
    if (rateInput) {
        rateInput.value = e.target.value;
    }
});

if (formParkingEntry) {
    formParkingEntry.addEventListener('submit', (e) => {
        e.preventDefault();

        const plate = document.getElementById('plate').value.trim().toUpperCase();
        const slotValue = document.getElementById('slot').value.trim();
        const select = document.getElementById('vehicleSelect');
        const rate = select.value;
        const typeName = select.options[select.selectedIndex].dataset.name;

        const plateRegex = /^[A-Z0-9-]{6,10}$/;
        if (!plateRegex.test(plate)) {
            document.getElementById('plateErrorMsg').textContent = "Invalid Plate Format. Use at least 6 characters (Letters/Numbers).";
            document.getElementById('modalPlateError').style.display = 'flex';
            return;
        }

        if (!slotValue) {
            document.getElementById('plateErrorMsg').textContent = "Please select a slot from the map.";
            document.getElementById('modalPlateError').style.display = 'flex';
            return;
        }

        if (activeParking.some(vehicle => vehicle.plate === plate)) {
            document.getElementById('plateErrorMsg').textContent = "Error: This vehicle is already inside.";
            document.getElementById('modalPlateError').style.display = 'flex';
            return;
        }

        const newEntry = {
            plate, type: typeName, rate, slot: slotValue,
            entryTime: new Date().toISOString()
        };

        activeParking.push(newEntry);
        localStorage.setItem('activeParking', JSON.stringify(activeParking));

        formParkingEntry.reset();
        updateEntryTime();
        renderParkingTable();
        renderSlotsMap();
        updateHomeStats();
    });
}


// ===== PARKING TABLE =====

const renderParkingTable = () => {

    const tableBody = document.getElementById('parkingTableBody');

    if (!tableBody) return;

    if (activeParking.length === 0) {

        tableBody.innerHTML = `
            <tr>
                <td colspan="4" class="empty-state">
                    No vehicles in parking.
                </td>
            </tr>
        `;

        return;
    }

    tableBody.innerHTML = '';

    activeParking.forEach((item, index) => {

        const entryDate = new Date(item.entryTime);

        const hours = String(entryDate.getHours()).padStart(2, '0');
        const minutes = String(entryDate.getMinutes()).padStart(2, '0');

        const timeDisplay = `${hours}:${minutes}`;

        tableBody.innerHTML += `
            <tr>
                <td>${item.plate}</td>
                <td>${item.type}</td>
                <td>${timeDisplay}</td>
                <td>
                    <button 
                        class="btn-delete"
                        onclick="processExit(${index})">
                        Exit / Pay
                    </button>
                </td>
            </tr>
        `;
    });
};

window.processExit = (index) => {
    const vehicle = activeParking[index];
    const entryTime = new Date(vehicle.entryTime);
    const exitTime = new Date();
    const diffMs = exitTime - entryTime;
    let diffHrs = Math.ceil(diffMs / (1000 * 60 * 60));
    if (diffHrs <= 0) diffHrs = 1;
    const totalToPay = (diffHrs * parseFloat(vehicle.rate)).toFixed(2);

    pendingExitIndex = index;

    document.getElementById('receiptPlate').textContent = vehicle.plate;
    document.getElementById('receiptHours').textContent = `${diffHrs} hour(s)`;
    document.getElementById('receiptRate').textContent = `Q ${vehicle.rate}`;
    document.getElementById('receiptTotal').textContent = `Q ${totalToPay}`;

    document.getElementById('modalReceipt').style.display = 'flex';
};

document.getElementById('closeReceiptModal').addEventListener('click', () => {
    document.getElementById('modalReceipt').style.display = 'none';
    pendingExitIndex = null;
});

document.getElementById('btnCancelExit').addEventListener('click', () => {
    document.getElementById('modalReceipt').style.display = 'none';
    pendingExitIndex = null;
});

document.getElementById('btnConfirmExit').addEventListener('click', () => {
    if (pendingExitIndex === null) return;

    const vehicle = activeParking[pendingExitIndex];
    const entryTime = new Date(vehicle.entryTime);
    const exitTime = new Date();
    const diffMs = exitTime - entryTime;
    let diffHrs = Math.ceil(diffMs / (1000 * 60 * 60));
    if (diffHrs <= 0) diffHrs = 1;
    const total = (diffHrs * parseFloat(vehicle.rate)).toFixed(2);

    // Guardar en historial
    const history = JSON.parse(localStorage.getItem('parkingHistory')) || [];
    history.push({
        slot: vehicle.slot,
        plate: vehicle.plate,
        type: vehicle.type,
        rate: vehicle.rate,
        entryTime: vehicle.entryTime,
        exitTime: exitTime.toISOString(),
        hours: diffHrs,
        total: total
    });
    localStorage.setItem('parkingHistory', JSON.stringify(history));

    // Sumar a ganancias del día
    addTodayEarnings(parseFloat(total));

    activeParking.splice(pendingExitIndex, 1);
    localStorage.setItem('activeParking', JSON.stringify(activeParking));

    document.getElementById('modalReceipt').style.display = 'none';
    pendingExitIndex = null;

    renderParkingTable();
    renderSlotsMap();   // <-- esto vuelve el slot a verde automáticamente
    updateHomeStats();
});


// ===== STATS & UTILS =====

function getTodayKey() {
    return new Date().toISOString().slice(0, 10); 
}
function addTodayEarnings(amount) {
    const key = getTodayKey();
    const earnings = JSON.parse(localStorage.getItem('dailyEarnings')) || {};
    earnings[key] = (earnings[key] || 0) + amount;
    localStorage.setItem('dailyEarnings', JSON.stringify(earnings));
}

function getTodayEarnings() {
    const key = getTodayKey();
    const earnings = JSON.parse(localStorage.getItem('dailyEarnings')) || {};
    return (earnings[key] || 0).toFixed(2);
}
function updateHomeStats() {
    const savedTypes = JSON.parse(localStorage.getItem('vehicleType')) || [];
    const totalSlots = savedTypes.length * SLOTS_LIMIT;
    const occupied = activeParking.length;
    const available = totalSlots - occupied;

    const activeCarsEl = document.getElementById('activeCars');
    if (activeCarsEl) activeCarsEl.textContent = occupied;

    const availableSpotsEl = document.getElementById('availableSpots');
    if (availableSpotsEl) availableSpotsEl.textContent = available >= 0 ? available : 0;

    const todayEarningsEl = document.getElementById('todayEarnings');
    if (todayEarningsEl) todayEarningsEl.textContent = `Q ${getTodayEarnings()}`;
}

renderParkingTable();
updateHomeStats();


// ===== SLOTS MAP =====

function generateAutoID(typeName) {
    const prefix = typeName.substring(0, 3).toUpperCase();
    const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, '');
    const random = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}-${dateStr}-${random}`;
}

function renderSlotsMap() {
    const container = document.getElementById('slotsContainer');
    const savedTypes = JSON.parse(localStorage.getItem('vehicleType')) || [];

    if (!container) return;
    container.innerHTML = '';

    if (savedTypes.length === 0) {
        container.innerHTML = '<p style="text-align:center;color:#888;">No vehicle types registered yet.</p>';
        return;
    }

    savedTypes.forEach(type => {
        const title = document.createElement('h4');
        title.style.gridColumn = "1 / -1";
        title.style.marginTop = "20px";
        title.textContent = `Slots for: ${type.Name}`;
        container.appendChild(title);

        for (let i = 1; i <= SLOTS_LIMIT; i++) {
            const slotID = `${type.Name.substring(0, 3).toUpperCase()}-${i}`;
            const occupancy = activeParking.find(v => v.slot === slotID);

            const card = document.createElement('div');
            card.className = `slot-card ${occupancy ? 'occupied' : 'available'}`;
            card.innerHTML = `<span>${i}</span>`;

            card.onclick = () => {
                if (occupancy) {
                    openSlotModal(slotID, occupancy);
                } else {
                    assignSlotToForm(card, slotID, type.Name, type.Rate);
                }
            };

            container.appendChild(card);
        }
    });
}
function assignSlotToForm(cardElement, slotID, typeName, rate) {
    document.querySelectorAll('.slot-card.selected').forEach(c => c.classList.remove('selected'));
    cardElement.classList.add('selected');

    document.getElementById('slot').value = slotID;
    document.getElementById('currentRate').value = rate;

    // Scroll al form
    document.getElementById('formParkingEntry').scrollIntoView({ behavior: 'smooth' });

    // Intentar seleccionar en el dropdown
    const vehicleSelect = document.getElementById('vehicleSelect');
    let matched = false;
    for (let i = 0; i < vehicleSelect.options.length; i++) {
        const optName = vehicleSelect.options[i].dataset.name || '';
        if (optName.toLowerCase() === typeName.toLowerCase()) {
            vehicleSelect.selectedIndex = i;
            matched = true;
            break;
        }
    }

    // Si no hizo match, recargar el select y reintentar
    if (!matched) {
        loadVehicleTypesToSelect();
        for (let i = 0; i < vehicleSelect.options.length; i++) {
            const optName = vehicleSelect.options[i].dataset.name || '';
            if (optName.toLowerCase() === typeName.toLowerCase()) {
                vehicleSelect.selectedIndex = i;
                break;
            }
        }
    }
}

document.querySelector('[data-section="parking"]').addEventListener('click', () => {
    loadVehicleTypesToSelect();
    renderSlotsMap();
});

function openSlotModal(slotID, occupancy) {
    currentSlotID = slotID;
    currentSlotIndex = activeParking.findIndex(v => v.slot === slotID);

    const entryDate = new Date(occupancy.entryTime);
    const now = new Date();
    const diffMs = now - entryDate;
    let diffHrs = Math.ceil(diffMs / (1000 * 60 * 60));
    if (diffHrs <= 0) diffHrs = 1;

    const total = (diffHrs * parseFloat(occupancy.rate)).toFixed(2);

    document.getElementById('infoID').textContent = slotID;
    document.getElementById('infoPlate').textContent = occupancy.plate;
    document.getElementById('infoTime').textContent = entryDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    document.getElementById('infoTotal').textContent = `Q ${total} (${diffHrs} hr${diffHrs > 1 ? 's' : ''})`;

    document.getElementById('modalSlotDetails').style.display = 'flex';
}
// Cerrar modal slot
document.getElementById('closeSlotModal').addEventListener('click', () => {
    document.getElementById('modalSlotDetails').style.display = 'none';
});

document.getElementById('btnEditSlot').addEventListener('click', () => {
    document.getElementById('modalSlotDetails').style.display = 'none';

    if (currentSlotIndex !== null) {
        const vehicle = activeParking[currentSlotIndex];

        document.getElementById('plate').value = vehicle.plate;
        document.getElementById('slot').value = vehicle.slot;
        document.getElementById('currentRate').value = vehicle.rate;

        const vehicleSelect = document.getElementById('vehicleSelect');
        for (let i = 0; i < vehicleSelect.options.length; i++) {
            if (vehicleSelect.options[i].dataset.name === vehicle.type) {
                vehicleSelect.selectedIndex = i;
                break;
            }
        }

        document.getElementById('formParkingEntry').scrollIntoView({ behavior: 'smooth' });
    }
});

document.getElementById('btnSaveVacate').addEventListener('click', () => {
    if (currentSlotIndex === null) return;

    const vehicle = activeParking[currentSlotIndex];
    const entryDate = new Date(vehicle.entryTime);
    const exitTime = new Date();
    const diffMs = exitTime - entryDate;
    let diffHrs = Math.ceil(diffMs / (1000 * 60 * 60));
    if (diffHrs <= 0) diffHrs = 1;
    const total = (diffHrs * parseFloat(vehicle.rate)).toFixed(2);

    // Guardar en historial
    const history = JSON.parse(localStorage.getItem('parkingHistory')) || [];
    history.push({
        slot: vehicle.slot,
        plate: vehicle.plate,
        type: vehicle.type,
        rate: vehicle.rate,
        entryTime: vehicle.entryTime,
        exitTime: exitTime.toISOString(),
        hours: diffHrs,
        total: total
    });
    localStorage.setItem('parkingHistory', JSON.stringify(history));

    addTodayEarnings(parseFloat(total));
    // Liberar slot
    activeParking.splice(currentSlotIndex, 1);
    localStorage.setItem('activeParking', JSON.stringify(activeParking));

    document.getElementById('modalSlotDetails').style.display = 'none';
    currentSlotID = null;
    currentSlotIndex = null;

    renderSlotsMap();
    renderParkingTable();
    updateHomeStats();
});
document.getElementById('closePlateError').addEventListener('click', () => {
    document.getElementById('modalPlateError').style.display = 'none';
});
document.getElementById('btnClosePlateError').addEventListener('click', () => {
    document.getElementById('modalPlateError').style.display = 'none';
});

document.getElementById('logOutBtn').addEventListener('click', () => {
    localStorage.removeItem('isLoggedIn');
    window.location.href = './login.html';
});
document.getElementById('profileBtn').addEventListener('click', () => {
    const user = JSON.parse(localStorage.getItem('appUser'));
    document.getElementById('profileName').value = user.name;
    document.getElementById('profileEmail').value = user.email;
    document.getElementById('profilePassword').value = '';
    document.getElementById('modalProfile').style.display = 'flex';
});

document.getElementById('closeProfileModal').addEventListener('click', () => {
    document.getElementById('modalProfile').style.display = 'none';
});

document.getElementById('btnCancelProfile').addEventListener('click', () => {
    document.getElementById('modalProfile').style.display = 'none';
});

document.getElementById('formProfile').addEventListener('submit', (e) => {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem('appUser'));

    user.name = document.getElementById('profileName').value.trim();
    user.email = document.getElementById('profileEmail').value.trim();

    const newPass = document.getElementById('profilePassword').value;
    if (newPass) user.password = newPass;

    localStorage.setItem('appUser', JSON.stringify(user));
    document.getElementById('userName').textContent = user.name;
    document.getElementById('modalProfile').style.display = 'none';
});