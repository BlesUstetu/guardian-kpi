/**
 * ==========================================================
 * Guardian KPI Web3
 * File : js/masterkpi.js
 * ==========================================================
 * Modul Master KPI
 * Author : BlesProduction
 * Version : 3.0.0
 * ==========================================================
 */

"use strict";

/* ==========================================================
 * GLOBAL VARIABLE
 * ==========================================================
 */

let masterKPIData = [];

let editMasterKPIId = null;

/* ==========================================================
 * INIT MODULE
 * ==========================================================
 */

async function initMasterKPI() {

    clearMasterKPIForm();

    await loadMasterKPI();

}

/* ==========================================================
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

                <td colspan="6"
                    class="text-center text-danger">

                    ${err.message}

                </td>

            </tr>

        `;

    }

}

/* ==========================================================
 * RENDER TABLE
 * ==========================================================
 */

function renderMasterKPI(data) {

    const tbody = document.getElementById("tblMasterKPI");

    if (!tbody) return;

    if (!data.length) {

        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center">
                    Tidak ada data.
                </td>
            </tr>
        `;

        return;

    }

    let html = "";

    data.forEach(function(item){

        html += `

        <tr>

            <td>${item.id}</td>

            <td>${item.indicator}</td>

            <td>${item.kategori}</td>

            <td class="text-center">

                ${item.bobot}%

            </td>

            <td class="text-center">

                ${item.target}

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

    tbody.innerHTML = html;

}
/* ==========================================================
 * FORMAT BOBOT
 * ==========================================================
 */

function formatBobot(value){

    value = Number(value || 0);

    return value + "%";

}

/* ==========================================================
 * BADGE STATUS
 * ==========================================================
 */

function badgeKPIStatus(status){

    status = String(status)
        .trim()
        .toLowerCase();

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

/* ==========================================================
 * VALIDASI FORM
 * ==========================================================
 */

function validateMasterKPIForm(){

    const indicator = document
        .getElementById("indicatorKPI")
        .value
        .trim();

    const kategori = document
        .getElementById("kategoriKPI")
        .value;

    const bobot = Number(

        document
            .getElementById("bobotKPI")
            .value

    );

    const target = Number(

        document
            .getElementById("targetKPI")
            .value

    );

    const status = document
        .getElementById("statusKPI")
        .value;

    if(indicator===""){

        alert("Indicator wajib diisi.");

        return false;

    }

    if(kategori===""){

        alert("Kategori wajib dipilih.");

        return false;

    }

    if(isNaN(bobot)||bobot<1||bobot>100){

        alert("Bobot harus 1 - 100.");

        return false;

    }

    if(isNaN(target)||target<0||target>100){

        alert("Target harus 0 - 100.");

        return false;

    }

    if(status===""){

        alert("Status wajib dipilih.");

        return false;

    }

    return true;

}

/* ==========================================================
 * CEK DUPLIKAT
 * ==========================================================
 */

function isDuplicateMasterKPI(indicator){

    indicator = String(indicator)
        .trim()
        .toLowerCase();

    return masterKPIData.some(function(item){

        if(

            editMasterKPIId &&

            String(item.id)===

            String(editMasterKPIId)

        ){

            return false;

        }

        return String(item.indicator)

            .trim()

            .toLowerCase()

            === indicator;

    });

}

/* ==========================================================
 * SIMPAN / UPDATE
 * ==========================================================
 */

async function saveMasterKPI(){

    if(!validateMasterKPIForm()){

        return;

    }

    const data = {

        indicator: document
            .getElementById("indicatorKPI")
            .value
            .trim(),

        kategori: document
            .getElementById("kategoriKPI")
            .value,

        bobot: Number(

            document
                .getElementById("bobotKPI")
                .value

        ),

        status: document
            .getElementById("statusKPI")
            .value

    };

    if(isDuplicateMasterKPI(data.nama)){

        alert("Nama KPI sudah digunakan.");

        return;

    }

    try{

        let result;

        if(editMasterKPIId){

            result = await API.updateMasterKPI(

                editMasterKPIId,

                data

            );

        }

        else{

            result = await API.saveMasterKPI(

                data

            );

        }

        if(!result.success){

            alert(result.message);

            return;

        }

        closeMasterKPIModal();

        clearMasterKPIForm();

        await loadMasterKPI();

    }

    catch(err){

        alert(err.message);

    }

}

/* ==========================================================
 * CLEAR FORM
 * ==========================================================
 */

function clearMasterKPIForm(){

    editMasterKPIId = null;

    document.getElementById("namaKPI").value = "";

    document.getElementById("kategoriKPI").value = "";

    document.getElementById("bobotKPI").value = "";

    document.getElementById("statusKPI").value = "Aktif";

}

/* ==========================================================
 * OPEN MODAL
 * ==========================================================
 */

function openMasterKPIModal(){

    clearMasterKPIForm();

    document.querySelector(

        "#masterKPIModal .modal-title"

    ).textContent = "Tambah KPI";

    const modal = new bootstrap.Modal(

        document.getElementById(

            "masterKPIModal"

        )

    );

    modal.show();

}

/* ==========================================================
 * CLOSE MODAL
 * ==========================================================
 */

function closeMasterKPIModal(){

    const modal = bootstrap.Modal.getInstance(

        document.getElementById(

            "masterKPIModal"

        )

    );

    if(modal){

        modal.hide();

    }

}

/* ==========================================================
 * EDIT MASTER KPI
 * ==========================================================
 */

function editMasterKPI(id){

    const item = masterKPIData.find(function(row){

        return String(row.id) === String(id);

    });

    if(!item){

        alert("Data KPI tidak ditemukan.");

        return;

    }

    editMasterKPIId = item.id;

    document.getElementById("namaKPI").value =
        item.nama;

    document.getElementById("kategoriKPI").value =
        item.kategori;

    document.getElementById("bobotKPI").value =
        item.bobot;

    document.getElementById("statusKPI").value =
        item.status;

    document.querySelector(

        "#masterKPIModal .modal-title"

    ).textContent = "Edit KPI";

    const modal = new bootstrap.Modal(

        document.getElementById(

            "masterKPIModal"

        )

    );

    modal.show();

}

/* ==========================================================
 * DELETE MASTER KPI
 * ==========================================================
 */

async function deleteMasterKPI(id){

    if(!confirm("Yakin ingin menghapus KPI ini?")){

        return;

    }

    try{

        const result = await API.deleteMasterKPI(id);

        if(!result.success){

            alert(result.message);

            return;

        }

        await loadMasterKPI();

    }

    catch(err){

        alert(err.message);

    }

}

/* ==========================================================
 * FILTER MASTER KPI
 * ==========================================================
 */

function filterMasterKPI(){

    const keyword = document

        .getElementById("searchMasterKPI")

        .value

        .trim()

        .toLowerCase();

    const kategori = document

        .getElementById("filterKategori")

        .value

        .trim()

        .toLowerCase();

    const hasil = masterKPIData.filter(function(item){

        const cocokNama =

            String(item.nama)

            .toLowerCase()

            .includes(keyword);

        const cocokKategori =

            kategori === "" ||

            String(item.kategori)

            .toLowerCase() === kategori;

        return cocokNama && cocokKategori;

    });

    renderMasterKPI(hasil);

}

/* ==========================================================
 * RESET FILTER
 * ==========================================================
 */

function resetFilterMasterKPI(){

    document.getElementById(

        "searchMasterKPI"

    ).value = "";

    document.getElementById(

        "filterKategori"

    ).value = "";

    renderMasterKPI(masterKPIData);

}

/* ==========================================================
 * REFRESH
 * ==========================================================
 */

async function refreshMasterKPI(){

    clearMasterKPIForm();

    resetFilterMasterKPI();

    await loadMasterKPI();

}

/* ==========================================================
 * RELOAD
 * ==========================================================
 */

async function reloadMasterKPI(){

    await refreshMasterKPI();

}

/* ==========================================================
 * EXPORT GLOBAL
 * ==========================================================
 */

window.initMasterKPI = initMasterKPI;

window.loadMasterKPI = loadMasterKPI;

window.saveMasterKPI = saveMasterKPI;

window.editMasterKPI = editMasterKPI;

window.deleteMasterKPI = deleteMasterKPI;

window.filterMasterKPI = filterMasterKPI;

window.resetFilterMasterKPI = resetFilterMasterKPI;

window.refreshMasterKPI = refreshMasterKPI;

window.reloadMasterKPI = reloadMasterKPI;

window.openMasterKPIModal = openMasterKPIModal;

window.closeMasterKPIModal = closeMasterKPIModal;
