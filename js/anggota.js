/**
 * ==========================================================
 * Guardian KPI Web3
 * File : js/anggota.js
 * ==========================================================
 * Modul Data Anggota
 * ==========================================================
 */

let anggotaData = [];
let groupData = [];
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
async function loadGroup() {

    try {

        const result = await API.getGroup();

        if (!result.success) {

            throw new Error(result.message);

        }

        groupData = result.data || [];

        const select = document.getElementById("group");

        if (!select) return;

        select.innerHTML = `
            <option value="">
                Pilih Group
            </option>
        `;

        groupData.forEach(function(item){

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

    const item = groupData.find(function(g){

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

    const data = {

        nama : document.getElementById("nama").value.trim(),

        jabatan : document.getElementById("jabatan").value,

        group : document.getElementById("group").value,

        status : document.getElementById("status").value

    };

    if(!data.nama){

        alert("Nama wajib diisi");

        return;

    }

    if(!data.jabatan){

        alert("Jabatan wajib dipilih");

        return;

    }

    if(!data.group){

        alert("Group wajib dipilih");

        return;

    }

    try{

        let result;

        if(editId){

            result = await API.updateAnggota(editId,data);

        }else{

            result = await API.saveAnggota(data);

        }

        if(!result.success){

            alert(result.message);

            return;

        }

        closeModal();

        clearForm();

        loadAnggota();

    }

    catch(err){

        alert(err.message);

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
function openModal(){

    clearForm();

    const modal = new bootstrap.Modal(

        document.getElementById("anggotaModal")

    );

    modal.show();

}

/**
 * ==========================================================
 * CLOSE MODAL
 * ==========================================================
 */
function closeModal(){

    const element = document.getElementById("anggotaModal");

    const modal = bootstrap.Modal.getInstance(element);

    if(modal){

        modal.hide();

    }

}
