/**
 * ==========================================================
 * Guardian KPI Web3
 * File : js/anggota.js
 * ==========================================================
 * Modul Data Anggota
 * ==========================================================
 */

let anggotaData = [];
let groupList = [];
let editId = null;

/**
 * ==========================================================
 * LOAD DATA ANGGOTA
 * ==========================================================
 */
async function loadAnggota() {

    const tbody = document.getElementById("tblAnggota");

    if (!tbody) return;

    tbody.innerHTML = `
        <tr>
            <td colspan="6" class="text-center">
                Memuat data...
            </td>
        </tr>
    `;

    try {

        const result = await API.getAnggota();

        if (!result.success) {

            throw new Error(result.message);

        }

        anggotaData = result.data || [];

        renderAnggota(anggotaData);

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
function renderAnggota(data) {

    const tbody = document.getElementById("tblAnggota");

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

            <td>${item.jabatan}</td>

            <td>${groupName(item.group)}</td>

            <td>${badgeStatus(item.status)}</td>

            <td>

                <button
                    class="btn btn-warning btn-sm"
                    onclick="editAnggota('${item.id}')">

                    <i class="bi bi-pencil"></i>

                </button>

                <button
                    class="btn btn-danger btn-sm"
                    onclick="deleteAnggota('${item.id}')">

                    <i class="bi bi-trash"></i>

                </button>

            </td>

        </tr>

        `;

    });

}

/**
 * ==========================================================
 * BADGE STATUS
 * ==========================================================
 */
function badgeStatus(status){

    if(String(status).toLowerCase()=="aktif"){

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
 * LOAD GROUP
 * ==========================================================
 */
async function loadGroupOptions() {

    try {

        const result = await API.getGroup();

        if (!result.success) {

            throw new Error(result.message);

        }

        groupList = result.data || [];

        const select = document.getElementById("group");

        if (!select) return;

        select.innerHTML = `
            <option value="">
                Pilih Group
            </option>
        `;

        groupList.forEach(function(item){

            select.innerHTML += `
                <option value="${item.id}">
                    ${item.nama}
                </option>
            `;

        });

    }

    catch(err){

        console.error(err);

    }

}

/**
 * ==========================================================
 * CARI NAMA GROUP
 * ==========================================================
 */
function groupName(id){

    const item = groupList.find(function(g){

        return String(g.id) === String(id);

    });

    return item ? item.nama : "-";

}

/**
 * ==========================================================
 * SIMPAN DATA
 * ==========================================================
 */
async function saveAnggota(){
    
    if (!validateAnggotaForm()) {
        
        return;

    }    

    const btn = document.getElementById("btnSaveAnggota");
    const originalHTML = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = `
        <span class="spinner-border spinner-border-sm me-2"></span>
        Menyimpan...
    `;
    
    const data = {

        nama : document.getElementById("nama").value.trim(),

        jabatan : document.getElementById("jabatan").value,

        group : document.getElementById("group").value,

        status : document.getElementById("status").value

    };

    try{

        let result;

        if(editId){

            result = await API.updateAnggota(editId,data);

        }else{

            result = await API.saveAnggota(data);

        }

        if(!result.success){

            btn.disabled = false;
            btn.innerHTML = originalHTML;

            alert(result.message);

            return;

        }

        closeAnggotaModal();

        clearForm();

        await loadAnggota();

        btn.disabled = false;
        btn.innerHTML = originalHTML;

        alert(result.message);

    }

    catch(err){

        alert(err.message);

    }
    finally{

        btn.disabled = false;

        btn.innerHTML = originalHTML;

    }

}

/**
 * ==========================================================
 * RESET FORM
 * ==========================================================
 */
function clearForm(){

    editId = null;

    document.getElementById("nama").value = "";

    document.getElementById("jabatan").value = "";

    document.getElementById("group").value = "";

    document.getElementById("status").value = "Aktif";

}

/**
 * ==========================================================
 * OPEN MODAL
 * ==========================================================
 */
function openAnggotaModal(){

    clearForm();

    const modal = new bootstrap.Modal(

        document.getElementById("anggotaModal")

    );

    modal.show();

    setTimeout(() => {
        document.getElementById("nama").focus();
    }, 200);

}

/**
 * ==========================================================
 * CLOSE MODAL
 * ==========================================================
 */
function closeAnggotaModal(){

    const element = document.getElementById("anggotaModal");

    const modal = bootstrap.Modal.getInstance(element);

    if(modal){

        modal.hide();

    }

}

/**
 * ==========================================================
 * EDIT ANGGOTA
 * ==========================================================
 */
function editAnggota(id){

    const item = anggotaData.find(function(row){

        return String(row.id) === String(id);

    });

    if(!item){

        alert("Data tidak ditemukan.");

        return;

    }

    editId = id;

    document.getElementById("nama").value = item.nama;
    document.getElementById("jabatan").value = item.jabatan;
    document.getElementById("group").value = item.group;
    document.getElementById("status").value = item.status;

    const modal = new bootstrap.Modal(
        document.getElementById("anggotaModal")
    );

    modal.show();

}

/**
 * ==========================================================
 * HAPUS ANGGOTA
 * ==========================================================
 */
async function deleteAnggota(id){

    if(!confirm("Yakin ingin menghapus data ini?")){

        return;

    }

    try{

        const result = await API.deleteAnggota(id);

        if(!result.success){

            alert(result.message);

            return;

        }

        await loadAnggota();

    }

    catch(err){

        alert(err.message);

    }

}

/**
 * ==========================================================
 * FILTER DATA
 * ==========================================================
 */
function filterAnggota(){

    const keyword = document
        .getElementById("searchAnggota")
        .value
        .toLowerCase()
        .trim();

    const status = document
        .getElementById("filterStatus")
        .value
        .toLowerCase();

    const hasil = anggotaData.filter(function(item){

        const cocokNama =
            item.nama.toLowerCase().includes(keyword);

        const cocokStatus =
            status === "" ||
            item.status.toLowerCase() === status;

        return cocokNama && cocokStatus;

    });

    renderAnggota(hasil);

}

/**
 * ==========================================================
 * REFRESH DATA
 * ==========================================================
 */
async function refreshAnggota(){

    clearForm();

    await loadGroupOptions();

    await loadAnggota();

}

/**
 * ==========================================================
 * VALIDASI FORM
 * ==========================================================
 */
function validateAnggotaForm() {

    const nama = document.getElementById("nama").value.trim();
    const jabatan = document.getElementById("jabatan").value;
    const group = document.getElementById("group").value;
    const status = document.getElementById("status").value;

    if (nama === "") {

        alert("Nama anggota wajib diisi.");

        document.getElementById("nama").focus();

        return false;

    }

    if (jabatan === "") {

        alert("Jabatan wajib dipilih.");

        document.getElementById("jabatan").focus();

        return false;

    }

    if (group === "") {

        alert("Group wajib dipilih.");

        document.getElementById("group").focus();

        return false;

    }

    if (status === "") {

        alert("Status wajib dipilih.");

        document.getElementById("status").focus();

        return false;

    }

    return true;

}

/**
 * ==========================================================
 * RESET FILTER
 * ==========================================================
 */
function resetFilterAnggota() {

    const search = document.getElementById("searchAnggota");
    const status = document.getElementById("filterStatus");

    if (search) search.value = "";

    if (status) status.value = "";

    renderAnggota(anggotaData);

}

/**
 * ==========================================================
 * RELOAD MODULE
 * ==========================================================
 */
async function reloadAnggota(){

    clearForm();

    resetFilterAnggota();

    await loadGroupOptions();

    await loadAnggota();

}

/**
 * ==========================================================
 * INITIALIZE PAGE
 * ==========================================================
 */
async function initAnggota(){

    await loadGroupOptions();

    await loadAnggota();

}

/**
 * ==========================================================
 * AUTO INIT
 * ==========================================================
 */

window.loadAnggota = loadAnggota;
window.saveAnggota = saveAnggota;
window.editAnggota = editAnggota;
window.deleteAnggota = deleteAnggota;
window.filterAnggota = filterAnggota;
window.refreshAnggota = refreshAnggota;
window.resetFilterAnggota = resetFilterAnggota;
window.openAnggotaModal = openAnggotaModal;
window.closeAnggotaModal = closeAnggotaModal;
window.initAnggota = initAnggota;
