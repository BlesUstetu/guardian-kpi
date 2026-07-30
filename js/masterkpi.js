/**
 * ==========================================================
 * Guardian KPI Web3
 * File : js/masterkpi.js
 * ==========================================================
 * Modul Master KPI
 * Author : BlesProduction
 * Version : 2.0.0
 * ==========================================================
 */

let masterKPIData = [];
let editKPIId = null;

/**
 * ==========================================================
 * LOAD MASTER KPI
 * ==========================================================
 */
async function loadMasterKPI() {

    const tbody = document.getElementById("tblMasterKPI");

    if (!tbody) return;

    tbody.innerHTML = `
        <tr>
            <td colspan="6" class="text-center">
                Memuat data...
            </td>
        </tr>
    `;

    try {

        const result = await API.getMasterKPI();

        if (!result.success) {

            throw new Error(result.message);

        }

        masterKPIData = result.data || [];

        renderMasterKPI(masterKPIData);

    }

    catch (err) {

        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-danger text-center">
                    ${err.message}
                </td>
            </tr>
        `;

    }

}

/**
 * ==========================================================
 * RENDER TABLE
 * ==========================================================
 */
function renderMasterKPI(data) {

    const tbody = document.getElementById("tblMasterKPI");

    if (!tbody) return;

    if (!data.length) {

        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center">
                    Tidak ada data.
                </td>
            </tr>
        `;

        return;

    }

    tbody.innerHTML = "";

    data.forEach(function(item){

        tbody.innerHTML += `

            <tr>

                <td>${item.id}</td>

                <td>${item.nama}</td>

                <td>${item.kategori}</td>

                <td class="text-center">
                    ${formatBobot(item.bobot)}
                </td>

                <td>
                    ${badgeKPIStatus(item.status)}
                </td>

                <td>

                    <button
                        class="btn btn-warning btn-sm"
                        onclick="editMasterKPI('${item.id}')">

                        <i class="bi bi-pencil"></i>

                    </button>

                    <button
                        class="btn btn-danger btn-sm"
                        onclick="deleteMasterKPI('${item.id}')">

                        <i class="bi bi-trash"></i>

                    </button>

                </td>

            </tr>

        `;

    });

}

/**
 * ==========================================================
 * FORMAT BOBOT
 * ==========================================================
 */
function formatBobot(value){

    value = Number(value || 0);

    return value + "%";

}

/**
 * ==========================================================
 * BADGE STATUS
 * ==========================================================
 */
function badgeKPIStatus(status){

    status = String(status).toLowerCase();

    if(status === "aktif"){

        return `
            <span class="badge bg-success">
                Aktif
            </span>
        `;

    }

    return `
        <span class="badge bg-danger">
            Nonaktif
        </span>
    `;

}

/**
 * ==========================================================
 * SIMPAN / UPDATE MASTER KPI
 * ==========================================================
 */
async function saveMasterKPI() {

    if (!validateMasterKPIForm()) {

        return;

    }

    const data = {

        nama: document.getElementById("namaKPI").value.trim(),

        kategori: document.getElementById("kategoriKPI").value,

        bobot: Number(document.getElementById("bobotKPI").value),

        status: document.getElementById("statusKPI").value

    };

    try {

        let result;

        if (editKPIId) {

            result = await API.updateMasterKPI(editKPIId, data);

        } else {

            result = await API.saveMasterKPI(data);

        }

        if (!result.success) {

            alert(result.message);

            return;

        }

        closeMasterKPIModal();

        clearMasterKPIForm();

        loadMasterKPI();

    }

    catch (err) {

        alert(err.message);

    }

}

/**
 * ==========================================================
 * VALIDASI FORM
 * ==========================================================
 */
function validateMasterKPIForm() {

    const nama = document.getElementById("namaKPI").value.trim();

    const kategori = document.getElementById("kategoriKPI").value;

    const bobot = Number(document.getElementById("bobotKPI").value);

    const status = document.getElementById("statusKPI").value;

    if (nama === "") {

        alert("Nama KPI wajib diisi.");

        document.getElementById("namaKPI").focus();

        return false;

    }

    if (kategori === "") {

        alert("Kategori wajib dipilih.");

        document.getElementById("kategoriKPI").focus();

        return false;

    }

    if (isNaN(bobot) || bobot <= 0) {

        alert("Bobot harus lebih besar dari 0.");

        document.getElementById("bobotKPI").focus();

        return false;

    }

    if (bobot > 100) {

        alert("Bobot maksimal 100%.");

        document.getElementById("bobotKPI").focus();

        return false;

    }

    if (status === "") {

        alert("Status wajib dipilih.");

        document.getElementById("statusKPI").focus();

        return false;

    }

    return true;

}

/**
 * ==========================================================
 * RESET FORM
 * ==========================================================
 */
function clearMasterKPIForm() {

    editKPIId = null;

    document.getElementById("namaKPI").value = "";

    document.getElementById("kategoriKPI").value = "";

    document.getElementById("bobotKPI").value = "";

    document.getElementById("statusKPI").value = "Aktif";

}

/**
 * ==========================================================
 * OPEN MODAL
 * ==========================================================
 */
function openMasterKPIModal() {

    clearMasterKPIForm();

    const modal = new bootstrap.Modal(
        document.getElementById("masterKPIModal")
    );

    modal.show();

}

/**
 * ==========================================================
 * CLOSE MODAL
 * ==========================================================
 */
function closeMasterKPIModal() {

    const element = document.getElementById("masterKPIModal");

    const modal = bootstrap.Modal.getInstance(element);

    if (modal) {

        modal.hide();

    }

}

/**
 * ==========================================================
 * EDIT MASTER KPI
 * ==========================================================
 */
function editMasterKPI(id) {

    const item = masterKPIData.find(function(row){

        return String(row.id) === String(id);

    });

    if (!item) {

        alert("Data KPI tidak ditemukan.");

        return;

    }

    editKPIId = id;

    document.getElementById("namaKPI").value = item.nama;
    document.getElementById("kategoriKPI").value = item.kategori;
    document.getElementById("bobotKPI").value = item.bobot;
    document.getElementById("statusKPI").value = item.status;

    const modal = new bootstrap.Modal(
        document.getElementById("masterKPIModal")
    );

    modal.show();

}

/**
 * ==========================================================
 * HAPUS MASTER KPI
 * ==========================================================
 */
async function deleteMasterKPI(id) {

    if (!confirm("Yakin ingin menghapus KPI ini?")) {

        return;

    }

    try {

        const result = await API.deleteMasterKPI(id);

        if (!result.success) {

            alert(result.message);

            return;

        }

        loadMasterKPI();

    }

    catch (err) {

        alert(err.message);

    }

}

/**
 * ==========================================================
 * FILTER MASTER KPI
 * ==========================================================
 */
function filterMasterKPI() {

    const keyword = document
        .getElementById("searchKPI")
        .value
        .trim()
        .toLowerCase();

    const kategori = document
        .getElementById("filterKategori")
        .value
        .toLowerCase();

    const hasil = masterKPIData.filter(function(item){

        const cocokNama =
            item.nama.toLowerCase().includes(keyword);

        const cocokKategori =
            kategori === "" ||
            item.kategori.toLowerCase() === kategori;

        return cocokNama && cocokKategori;

    });

    renderMasterKPI(hasil);

}

/**
 * ==========================================================
 * RESET FILTER
 * ==========================================================
 */
function resetFilterMasterKPI() {

    const search = document.getElementById("searchKPI");
    const kategori = document.getElementById("filterKategori");

    if (search) search.value = "";

    if (kategori) kategori.value = "";

    renderMasterKPI(masterKPIData);

}

/**
 * ==========================================================
 * REFRESH DATA
 * ==========================================================
 */
function refreshMasterKPI() {

    clearMasterKPIForm();

    resetFilterMasterKPI();

    loadMasterKPI();

}

/**
 * ==========================================================
 * CEK DUPLIKAT NAMA KPI
 * ==========================================================
 */
function isDuplicateMasterKPI(nama) {

    nama = String(nama).trim().toLowerCase();

    return masterKPIData.some(function(item){

        if(editKPIId && item.id === editKPIId){

            return false;

        }

        return item.nama.trim().toLowerCase() === nama;

    });

}

/**
 * ==========================================================
 * RELOAD DATA
 * ==========================================================
 */
function reloadMasterKPI() {

    clearMasterKPIForm();

    resetFilterMasterKPI();

    loadMasterKPI();

}

/**
 * ==========================================================
 * INIT MODULE
 * ==========================================================
 */
function initMasterKPI() {

    loadMasterKPI();

}

/**
 * ==========================================================
 * EXPORT GLOBAL
 * ==========================================================
 */

window.loadMasterKPI = loadMasterKPI;
window.saveMasterKPI = saveMasterKPI;
window.editMasterKPI = editMasterKPI;
window.deleteMasterKPI = deleteMasterKPI;
window.filterMasterKPI = filterMasterKPI;
window.refreshMasterKPI = refreshMasterKPI;
window.resetFilterMasterKPI = resetFilterMasterKPI;
window.openMasterKPIModal = openMasterKPIModal;
window.closeMasterKPIModal = closeMasterKPIModal;
window.initMasterKPI = initMasterKPI;
