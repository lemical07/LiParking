// Si el usuario no ha iniciado sesión, lo mandamos al login de una vez
if (!localStorage.getItem('isLoggedIn')) {
    window.location.href = './login.html';
}
console.log("LiParking System on the way...")

// Agarramos todos los elementos del DOM que vamos a usar seguido
const newTypeBtn = document.getElementById("newTypeBtn");
const modal = document.getElementById("modalType");
const closeModalBtn = document.getElementById("closeModal");
const btnCancel = document.getElementById("btnCancel");
const formType = document.getElementById("formType");
const selectVehicle = document.getElementById('names'); // el select de tipo de vehículo en el modal
const inputRate = document.getElementById('Hrate');     // el input de tarifa en el modal
const menuToggle = document.getElementById('menuToggle'); // btnvtipo hamburguesa en móvil
const sidebarElement = document.querySelector('.sidebar');
const formParkingEntry = document.getElementById('formParkingEntry'); // formulario de entrada de vehículos

// Variables globales que usamos para rastrear qué slot o vehículo está activo
let currentSlotID = null;       // ID del slot que se está viendo en el modal
let currentSlotIndex = null;    // índice del vehículo en activeParking según el slot
let pendingExitIndex = null;    // índice del vehículo esperando confirmar salida
let editIndex = null;           // índice del tipo de vehículo que se está editando

// Cargamos los vehículos activos desde localStorage, o arrancamos con array vacío
let activeParking = JSON.parse(localStorage.getItem('activeParking')) || [];

// Muestra la hora actual en el input de entrada (formato 24h)
function updateEntryTime() {
    const el = document.getElementById('entryTime');
    if (el) el.value = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
}

// Cada tipo de vehículo tiene 20 slots disponibles
const SLOTS_LIMIT = 20;


// ===== MODAL DE TIPOS DE VEHÍCULO =====

// Al hacer click en "+New Type", limpiamos el form y abrimos el modal
newTypeBtn.addEventListener("click", () => {
    editIndex = null; // aseguramos que no estamos en modo edición
    document.getElementById('modalTitle').textContent = "New Vehicle Type";
    formType.reset();
    modal.style.display = "flex";
});

// Función para cerrar el modal
const hideModal = () => {
    modal.style.display = "none";
};

// Cerramos el modal con la X o con el btn Cancel
closeModalBtn.addEventListener("click", hideModal);
btnCancel.addEventListener("click", hideModal);

// Cuando se elige un tipo de vehículo en el select, auto-rellena la tarifa sugerida
selectVehicle.addEventListener('change', () => {
    const selectedOption = selectVehicle.options[selectVehicle.selectedIndex];
    const price = selectedOption.getAttribute('data-price');
    if (price) {
        inputRate.value = price;
    }
});

// Al guardar el formulario de tipo de vehículo
formType.addEventListener('submit', (e) => {
    e.preventDefault();

    // Traemos los tipos existentes o empezamos con lista vacía
    const existingType = JSON.parse(localStorage.getItem('vehicleType')) || [];

    // Armamos el objeto con los datos del form
    const newType = {
        Code: document.getElementById('code').value,
        Name: document.getElementById('names').value,
        Rate: document.getElementById('Hrate').value
    };

    // Si estamos editando, reemplazamos; si no, agregamos al final
    if (editIndex !== null) {
        existingType[editIndex] = newType;
        editIndex = null;
    } else {
        existingType.push(newType);
    }

    // Guardamos en localStorage y actualizamos la tabla
    localStorage.setItem('vehicleType', JSON.stringify(existingType));
    formType.reset();
    hideModal();
    renderTable();
});


// ===== NAVEGACIÓN ENTRE SECCIONES =====

const navLinks = document.querySelectorAll('.sidebar nav a');
const sections = document.querySelectorAll('.content-section');

navLinks.forEach(link => {

    link.addEventListener('click', (e) => {

        const targetSection = link.getAttribute('data-section');

        // Si el link no tiene data-section (como Reports), dejamos que navegue normal
        if (!targetSection) {
            return;
        }

        // Para secciones internas prevenimos la navegación del browser
        e.preventDefault();

        // Quitamos el active de todos y se lo ponemos al que se clickeó
        navLinks.forEach(l =>
            l.parentElement.classList.remove('active')
        );
        link.parentElement.classList.add('active');

        // Actualizamos el título del header
        const pageTitle = document.getElementById('pageTitle');
        pageTitle.textContent = link.textContent;

        // Ocultamos todas las secciones
        sections.forEach(section => {
            section.classList.remove('active');
            section.classList.add('hidden');
        });

        // Mostramos solo la sección que corresponde
        const targetElement = document.getElementById(`${targetSection}-section`);
        if (targetElement) {
            targetElement.classList.remove('hidden');
            targetElement.classList.add('active');
        }

        // En móvil, cerramos el sidebar automáticamente al navegar
        if (
            window.innerWidth <= 768 &&
            sidebarElement.classList.contains('active')
        ) {
            sidebarElement.classList.remove('active');
        }

        // Al entrar a Parking, cargamos los tipos en el select y actualizamos el mapa
        if (targetSection === 'parking') {
            loadVehicleTypesToSelect();
            renderSlotsMap(); // importante: actualiza el mapa con vehículos ya registrados
            if (typeof updateEntryTime === 'function') {
                updateEntryTime();
            }
        }
    });
});


// ===== TABLA DE TIPOS DE VEHÍCULO =====

const renderTable = () => {
    const tableBody = document.getElementById('bodyTypes');
    const existingType = JSON.parse(localStorage.getItem('vehicleType')) || [];

    // Si no hay tipos registrados, mostramos mensaje vacío
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

    // Pintamos una fila por cada tipo con sus botones de acción
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

// Elimina un tipo de vehículo por su índice
const deleteType = (index) => {
    const existingType = JSON.parse(localStorage.getItem('vehicleType')) || [];
    existingType.splice(index, 1);
    localStorage.setItem('vehicleType', JSON.stringify(existingType));
    renderTable();
};

// Abre el modal con los datos del tipo a editar
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

// Pintamos la tabla al cargar la página
renderTable();


// ===== MENÚ SIDEBAR EN MÓVIL =====

// Toggle del menú tipo hamburguesa
if (menuToggle) {
    menuToggle.addEventListener('click', () => {
        sidebarElement.classList.toggle('active');
    });
}

// Si se hace click fuera del sidebar, lo cerramos
document.addEventListener('click', (e) => {
    if (sidebarElement.classList.contains('active') &&
        !sidebarElement.contains(e.target) &&
        !menuToggle.contains(e.target)) {
        sidebarElement.classList.remove('active');
    }
});


// ===== RELOJ EN TIEMPO REAL =====

function updateClock() {
    const now = new Date();

    // Formateamos horas, minutos y segundos con dos dígitos siempre
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    const timeDisplay = document.getElementById('clockTime');
    if (timeDisplay) {
        timeDisplay.textContent = `${hours}:${minutes}:${seconds}`;
    }

    // También actualizamos la fecha en formato legible
    const dateDisplay = document.getElementById('clockDate');
    if (dateDisplay) {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        dateDisplay.textContent = now.toLocaleDateString('en-US', options);
    }
}

// Actualizamos el reloj cada segundo
setInterval(updateClock, 1000);
updateClock(); // llamada inicial para que no espere 1 segundo al cargar


// ===== FORMULARIO DE ENTRADA DE VEHÍCULOS =====

// Carga los tipos de vehículo guardados en el select del formulario
function loadVehicleTypesToSelect() {
    const select = document.getElementById('vehicleSelect');
    const savedTypes = JSON.parse(localStorage.getItem('vehicleType')) || [];

    if (!select) return;

    select.innerHTML = '<option value="" disabled selected>Select type...</option>';

    // Creamos una opción por cada tipo, guardando el nombre en data-name
    savedTypes.forEach(type => {
        const option = document.createElement('option');
        option.value = type.Rate;
        option.textContent = `${type.Name} (Q${type.Rate})`;
        option.dataset.name = type.Name;
        select.appendChild(option);
    });
}

// Al cambiar el tipo de vehículo en el form, mostramos la tarifa correspondiente
document.getElementById('vehicleSelect')?.addEventListener('change', (e) => {
    const rateInput = document.getElementById('currentRate');
    if (rateInput) {
        rateInput.value = e.target.value;
    }
});

// Al enviar el formulario de entrada
if (formParkingEntry) {
    formParkingEntry.addEventListener('submit', (e) => {
        e.preventDefault();

        const plate = document.getElementById('plate').value.trim().toUpperCase();
        const slotValue = document.getElementById('slot').value.trim();
        const select = document.getElementById('vehicleSelect');
        const rate = select.value;
        const typeName = select.options[select.selectedIndex].dataset.name;

        // Validamos que la placa tenga formato correcto (mínimo 6 caracteres alfanuméricos)
        const plateRegex = /^[A-Z0-9-]{6,10}$/;
        if (!plateRegex.test(plate)) {
            document.getElementById('plateErrorMsg').textContent = "Invalid Plate Format. Use at least 6 characters (Letters/Numbers).";
            document.getElementById('modalPlateError').style.display = 'flex';
            return;
        }

        // Verificamos que haya un slot seleccionado desde el mapa
        if (!slotValue) {
            document.getElementById('plateErrorMsg').textContent = "Please select a slot from the map.";
            document.getElementById('modalPlateError').style.display = 'flex';
            return;
        }

        // No permitimos registrar un vehículo que ya está adentro
        if (activeParking.some(vehicle => vehicle.plate === plate)) {
            document.getElementById('plateErrorMsg').textContent = "Error: This vehicle is already inside.";
            document.getElementById('modalPlateError').style.display = 'flex';
            return;
        }

        // Armamos el registro del vehículo con la hora exacta de entrada
        const newEntry = {
            plate, type: typeName, rate, slot: slotValue,
            entryTime: new Date().toISOString()
        };

        // Lo agregamos al array y lo guardamos en localStorage
        activeParking.push(newEntry);
        localStorage.setItem('activeParking', JSON.stringify(activeParking));

        // Limpiamos el form y actualizamos toda la UI
        formParkingEntry.reset();
        updateEntryTime();
        renderParkingTable();
        renderSlotsMap();
        updateHomeStats();
    });
}


// ===== TABLA DE VEHÍCULOS EN PARQUEO =====

const renderParkingTable = () => {

    const tableBody = document.getElementById('parkingTableBody');
    if (!tableBody) return;

    // Si no hay vehículos, mostramos estado vacío
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

    // Pintamos una fila por cada vehículo activo
    tableBody.innerHTML = '';
    activeParking.forEach((item, index) => {

        // Formateamos la hora de entrada para mostrarla limpia
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

// Abre el modal de recibo al presionar "Exit / Pay" en la tabla
window.processExit = (index) => {
    const vehicle = activeParking[index];
    const entryTime = new Date(vehicle.entryTime);
    const exitTime = new Date();
    const diffMs = exitTime - entryTime;

    // Redondeamos hacia arriba: si estuvo 1h01min, se cobra 2 horas
    let diffHrs = Math.ceil(diffMs / (1000 * 60 * 60));
    if (diffHrs <= 0) diffHrs = 1; // mínimo 1 hora

    const totalToPay = (diffHrs * parseFloat(vehicle.rate)).toFixed(2);

    // Guardamos el índice para usarlo al confirmar
    pendingExitIndex = index;

    // Llenamos el recibo con los datos del vehículo
    document.getElementById('receiptPlate').textContent = vehicle.plate;
    document.getElementById('receiptHours').textContent = `${diffHrs} hour(s)`;
    document.getElementById('receiptRate').textContent = `Q ${vehicle.rate}`;
    document.getElementById('receiptTotal').textContent = `Q ${totalToPay}`;

    document.getElementById('modalReceipt').style.display = 'flex';
};

// Cerramos el recibo sin confirmar salida
document.getElementById('closeReceiptModal').addEventListener('click', () => {
    document.getElementById('modalReceipt').style.display = 'none';
    pendingExitIndex = null;
});

document.getElementById('btnCancelExit').addEventListener('click', () => {
    document.getElementById('modalReceipt').style.display = 'none';
    pendingExitIndex = null;
});

// Confirmamos la salida desde la tabla de vehículos
document.getElementById('btnConfirmExit').addEventListener('click', () => {
    if (pendingExitIndex === null) return;

    const vehicle = activeParking[pendingExitIndex];
    const entryTime = new Date(vehicle.entryTime);
    const exitTime = new Date();
    const diffMs = exitTime - entryTime;
    let diffHrs = Math.ceil(diffMs / (1000 * 60 * 60));
    if (diffHrs <= 0) diffHrs = 1;
    const total = (diffHrs * parseFloat(vehicle.rate)).toFixed(2);

    // Guardamos el registro en el historial antes de eliminarlo
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

    // Sumamos al total de ganancias del día
    addTodayEarnings(parseFloat(total));

    // Sacamos el vehículo del array activo y actualizamos localStorage
    activeParking.splice(pendingExitIndex, 1);
    localStorage.setItem('activeParking', JSON.stringify(activeParking));

    document.getElementById('modalReceipt').style.display = 'none';
    pendingExitIndex = null;

    // Actualizamos toda la UI: tabla, mapa y estadísticas
    renderParkingTable();
    renderSlotsMap();
    updateHomeStats();
});


// ===== ESTADÍSTICAS Y UTILIDADES =====

// Devuelve la fecha de hoy como clave (ej: "2026-05-16")
function getTodayKey() {
    return new Date().toISOString().slice(0, 10);
}

// Suma una cantidad a las ganancias del día actual
function addTodayEarnings(amount) {
    const key = getTodayKey();
    const earnings = JSON.parse(localStorage.getItem('dailyEarnings')) || {};
    earnings[key] = (earnings[key] || 0) + amount;
    localStorage.setItem('dailyEarnings', JSON.stringify(earnings));
}

// Devuelve las ganancias de hoy formateadas con 2 decimales
function getTodayEarnings() {
    const key = getTodayKey();
    const earnings = JSON.parse(localStorage.getItem('dailyEarnings')) || {};
    return (earnings[key] || 0).toFixed(2);
}

// Actualiza las 3 tarjetas del dashboard: vehículos activos, espacios libres y ganancias
function updateHomeStats() {
    const savedTypes = JSON.parse(localStorage.getItem('vehicleType')) || [];
    const totalSlots = savedTypes.length * SLOTS_LIMIT; // total de slots según tipos registrados
    const occupied = activeParking.length;
    const available = totalSlots - occupied;

    const activeCarsEl = document.getElementById('activeCars');
    if (activeCarsEl) activeCarsEl.textContent = occupied;

    const availableSpotsEl = document.getElementById('availableSpots');
    if (availableSpotsEl) availableSpotsEl.textContent = available >= 0 ? available : 0;

    const todayEarningsEl = document.getElementById('todayEarnings');
    if (todayEarningsEl) todayEarningsEl.textContent = `Q ${getTodayEarnings()}`;
}

// Renderizamos tabla y stats al cargar la página
renderParkingTable();
updateHomeStats();


// ===== MAPA DE SLOTS =====

// Genera un ID único automático (no se usa actualmente pero está disponible)
function generateAutoID(typeName) {
    const prefix = typeName.substring(0, 3).toUpperCase();
    const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, '');
    const random = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}-${dateStr}-${random}`;
}

// Dibuja el mapa de slots por cada tipo de vehículo registrado
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
        // Título de sección para cada tipo
        const title = document.createElement('h4');
        title.style.gridColumn = "1 / -1";
        title.style.marginTop = "20px";
        title.textContent = `Slots for: ${type.Name}`;
        container.appendChild(title);

        // Creamos 20 slots por tipo
        for (let i = 1; i <= SLOTS_LIMIT; i++) {
            const slotID = `${type.Name.substring(0, 3).toUpperCase()}-${i}`;

            // Buscamos si este slot está ocupado
            const occupancy = activeParking.find(v => v.slot === slotID);

            const card = document.createElement('div');
            card.className = `slot-card ${occupancy ? 'occupied' : 'available'}`;
            card.innerHTML = `<span>${i}</span>`;

            // Si está ocupado, abrimos el modal de info; si está libre, lo asignamos al form
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

// Selecciona un slot libre y rellena el formulario con sus datos
function assignSlotToForm(cardElement, slotID, typeName, rate) {
    // Quitamos el selected de cualquier slot anterior
    document.querySelectorAll('.slot-card.selected').forEach(c => c.classList.remove('selected'));
    cardElement.classList.add('selected');

    document.getElementById('slot').value = slotID;
    document.getElementById('currentRate').value = rate;

    // Hacemos scroll suave al formulario
    document.getElementById('formParkingEntry').scrollIntoView({ behavior: 'smooth' });

    // Intentamos seleccionar el tipo correcto en el dropdown
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

    // Si no encontró el tipo, recargamos el select y reintentamos
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

// Abre el modal con la información de un slot ocupado
function openSlotModal(slotID, occupancy) {
    currentSlotID = slotID;
    currentSlotIndex = activeParking.findIndex(v => v.slot === slotID);

    const entryDate = new Date(occupancy.entryTime);
    const now = new Date();
    const diffMs = now - entryDate;
    let diffHrs = Math.ceil(diffMs / (1000 * 60 * 60));
    if (diffHrs <= 0) diffHrs = 1;

    const total = (diffHrs * parseFloat(occupancy.rate)).toFixed(2);

    // Llenamos el modal con los datos del vehículo en ese slot
    document.getElementById('infoID').textContent = slotID;
    document.getElementById('infoPlate').textContent = occupancy.plate;
    document.getElementById('infoTime').textContent = entryDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    document.getElementById('infoTotal').textContent = `Q ${total} (${diffHrs} hr${diffHrs > 1 ? 's' : ''})`;

    document.getElementById('modalSlotDetails').style.display = 'flex';
}

// Cierra el modal de información del slot
document.getElementById('closeSlotModal').addEventListener('click', () => {
    document.getElementById('modalSlotDetails').style.display = 'none';
});

// Botón Editar del modal de slot: pasa los datos al formulario principal
document.getElementById('btnEditSlot').addEventListener('click', () => {
    document.getElementById('modalSlotDetails').style.display = 'none';

    if (currentSlotIndex !== null) {
        const vehicle = activeParking[currentSlotIndex];

        document.getElementById('plate').value = vehicle.plate;
        document.getElementById('slot').value = vehicle.slot;
        document.getElementById('currentRate').value = vehicle.rate;

        // Seleccionamos el tipo correcto en el dropdown
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

// Confirma la salida desde el modal del slot del mapa
document.getElementById('btnSaveVacate').addEventListener('click', () => {
    if (currentSlotIndex === null) return;

    const vehicle = activeParking[currentSlotIndex];
    const entryDate = new Date(vehicle.entryTime);
    const exitTime = new Date();
    const diffMs = exitTime - entryDate;
    let diffHrs = Math.ceil(diffMs / (1000 * 60 * 60));
    if (diffHrs <= 0) diffHrs = 1;
    const total = (diffHrs * parseFloat(vehicle.rate)).toFixed(2);

    // Guardamos en historial
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

    // Sumamos a las ganancias del día
    addTodayEarnings(parseFloat(total));

    // Liberamos el slot eliminando el vehículo del array activo
    activeParking.splice(currentSlotIndex, 1);
    localStorage.setItem('activeParking', JSON.stringify(activeParking));

    document.getElementById('modalSlotDetails').style.display = 'none';
    currentSlotID = null;
    currentSlotIndex = null;

    // Actualizamos mapa, tabla y estadísticas
    renderSlotsMap();
    renderParkingTable();
    updateHomeStats();
});

// Cierra el modal de error de placa
document.getElementById('closePlateError').addEventListener('click', () => {
    document.getElementById('modalPlateError').style.display = 'none';
});
document.getElementById('btnClosePlateError').addEventListener('click', () => {
    document.getElementById('modalPlateError').style.display = 'none';
});

// Cierra sesión: limpia el flag de login y manda al login
document.getElementById('logOutBtn').addEventListener('click', () => {
    localStorage.removeItem('isLoggedIn');
    window.location.href = './login.html';
});

// Abre el modal de perfil con los datos del usuario actual
document.getElementById('profileBtn').addEventListener('click', () => {
    const user = JSON.parse(localStorage.getItem('appUser'));
    document.getElementById('profileName').value = user.name;
    document.getElementById('profileEmail').value = user.email;
    document.getElementById('profilePassword').value = '';
    document.getElementById('modalProfile').style.display = 'flex';
});

// Cierra el modal de perfil
document.getElementById('closeProfileModal').addEventListener('click', () => {
    document.getElementById('modalProfile').style.display = 'none';
});

document.getElementById('btnCancelProfile').addEventListener('click', () => {
    document.getElementById('modalProfile').style.display = 'none';
});

// Guarda los cambios del perfil en localStorage
document.getElementById('formProfile').addEventListener('submit', (e) => {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem('appUser'));

    user.name = document.getElementById('profileName').value.trim();
    user.email = document.getElementById('profileEmail').value.trim();

    // Solo actualizamos la contraseña si escribieron algo nuevo
    const newPass = document.getElementById('profilePassword').value;
    if (newPass) user.password = newPass;

    localStorage.setItem('appUser', JSON.stringify(user));
    document.getElementById('userName').textContent = user.name; // actualizamos el nombre en el sidebar
    document.getElementById('modalProfile').style.display = 'none';
});
    //Función para resetear sistema
    function resetAll() {
        document.getElementById('modalResetConfirm').style.display = 'flex';
    }
    
    document.getElementById('closeResetModal').addEventListener('click', () => {
        document.getElementById('modalResetConfirm').style.display = 'none';
    });
    
    document.getElementById('btnCancelReset').addEventListener('click', () => {
        document.getElementById('modalResetConfirm').style.display = 'none';
    });
    
    document.getElementById('btnConfirmReset').addEventListener('click', () => {
        localStorage.removeItem('dailyEarnings');
        localStorage.removeItem('parkingHistory');
        localStorage.removeItem('activeParking');
        localStorage.removeItem('vehicleType');
    
        activeParking = [];
    
        renderTable();
        renderParkingTable();
        renderSlotsMap();
        updateHomeStats();
    
        document.getElementById('modalResetConfirm').style.display = 'none';
    });