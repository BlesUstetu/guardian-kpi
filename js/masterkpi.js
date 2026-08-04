/**
 * ==========================================================
 * Guardian KPI Web3
 * File : masterkpi.js
 * Version : 3.1.0
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
 * INIT
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

    const tbody = document.getElementById(
        "tblMasterKPI"
    );

    if (!tbody) return;

    tbody.innerHTML = `

        <tr>

            <td colspan="7"
                class="text-center">

                Memuat data...

            </td>

        </tr>

    `;

    try {

        const result =
            await API.getMasterKPI();

        if (!result.success) {

            throw new Error(
                result.message
            );

        }

        masterKPIData =
            result.data || [];

        renderMasterKPI(
            masterKPIData
        );

    }

    catch (err) {

        tbody.innerHTML = `

            <tr>

                <td colspan="7"
                    class="text-danger text-center">

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

    const tbody = document.getElementById(
        "tblMasterKPI"
    );

    if (!tbody) return;

    if (!data.length) {

        tbody.innerHTML = `

            <tr>

                <td colspan="7"
                    class="text-center">

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

            <td>

                ${item.id}

            </td>

            <td>

                ${item.indicator}

            </td>

            <td>

                ${item.kategori}

            </td>

            <td class="text-center">

                ${formatBobot(item.bobot)}

            </td>

            <td class="text-center">

                ${item.target}%

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

    return Number(value || 0) + "%";

}

/* ==========================================================
 * BADGE STATUS
 * ==========================================================
 */

function badgeKPIStatus(status){

    status = String(status)
        .trim()
        .toLowerCase();

    if(status==="aktif"){

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
        .value
        .trim();

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

    if(indicator === ""){

        alert("Indicator wajib diisi.");

        document
            .getElementById("indicatorKPI")
            .focus();

        return false;

    }

    if(kategori === ""){

        alert("Kategori wajib dipilih.");

        document
            .getElementById("kategoriKPI")
            .focus();

        return false;

    }

    if(isNaN(bobot) || bobot < 1 || bobot > 100){

        alert("Bobot harus antara 1 sampai 100.");

        document
            .getElementById("bobotKPI")
            .focus();

        return false;

    }

    if(isNaN(target) || target < 0 || target > 100){

        alert("Target harus antara 0 sampai 100.");

        document
            .getElementById("targetKPI")
            .focus();

        return false;

    }

    if(status === ""){

        alert("Status wajib dipilih.");

        document
            .getElementById("statusKPI")
            .focus();

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

            String(item.id) ===
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

        target: Number(
            document
                .getElementById("targetKPI")
                .value
        ),

        status: document
            .getElementById("statusKPI")
            .value

    };

    if(isDuplicateMasterKPI(data.indicator)){

        alert("Indicator KPI sudah digunakan.");

        return;

    }

    const btn = document.getElementById("btnSaveMasterKPI");
    const originalHTML = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = `
        <span class="spinner-border spinner-border-sm me-2"></span>
        Menyimpan...
    `;

    try{

        let result;

        if(editMasterKPIId){

            result = await API.updateMasterKPI(

                editMasterKPIId,

                data

            );

        }

        else{

            result = await API.saveMasterKPI(data);

        }

        if(!result.success){

            alert(result.message);

            return;

        }

        closeMasterKPIModal();

        clearMasterKPIForm();

        await loadMasterKPI();

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

/* ==========================================================
 * EDIT MASTER KPI
 * ==========================================================
 */

function editMasterKPI(id){

    const item = masterKPIData.find(function(row){

        return String(row.id) === String(id);

    });

    if(!item){

        alert("Data Master KPI tidak ditemukan.");

        return;

    }

    editMasterKPIId = item.id;

    document.getElementById("indicatorKPI").value =
        item.indicator;

    document.getElementById("kategoriKPI").value =
        item.kategori;

    document.getElementById("bobotKPI").value =
        item.bobot;

    document.getElementById("targetKPI").value =
        item.target;

    document.getElementById("statusKPI").value =
        item.status;

    document.querySelector(
        "#masterKPIModal .modal-title"
    ).textContent = "Edit Master KPI";

    const modal = new bootstrap.Modal(

        document.getElementById(
            "masterKPIModal"
        )

    );

    modal.show();

    setTimeout(() => {
        document.getElementById("indicatorKPI").focus();
    }, 200);

}

/* ==========================================================
 * DELETE MASTER KPI
 * ==========================================================
 */

async function deleteMasterKPI(id){

    if(!confirm("Yakin ingin menghapus Master KPI ini?")){
        return;
    }

    try{

        const result = await API.deleteMasterKPI(id);

        if(!result.success){

            alert(result.message);

            return;

        }

        await loadMasterKPI();

        alert(result.message);

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

    document.getElementById("indicatorKPI").value = "";

    document.getElementById("kategoriKPI").value = "";

    document.getElementById("bobotKPI").value = "";

    document.getElementById("targetKPI").value = 100;

    document.getElementById("statusKPI").value = "Aktif";

}

/* ==========================================================
 * OPEN MODAL
 * ==========================================================
 */

function openMasterKPIModal(){

    editMasterKPIId = null;

    clearMasterKPIForm();

    document.querySelector(
        "#masterKPIModal .modal-title"
    ).textContent = "Tambah Indicator";

    const modal = new bootstrap.Modal(
        document.getElementById("masterKPIModal")
    );

    modal.show();
    setTimeout(() => {
        document.getElementById("indicatorKPI").focus();
    }, 200);

}

/* ==========================================================
 * CLOSE MODAL
 * ==========================================================
 */

function closeMasterKPIModal(){

    const element = document.getElementById(
        "masterKPIModal"
    );

    const modal = bootstrap.Modal.getInstance(element);

    if(modal){

        modal.hide();

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

        const cocokIndicator =

            String(item.indicator)

                .toLowerCase()

                .includes(keyword);

        const cocokKategori =

            kategori === "" ||

            String(item.kategori)

                .toLowerCase()

                === kategori;

        return cocokIndicator && cocokKategori;

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

window.renderMasterKPI = renderMasterKPI;

window.saveMasterKPI = saveMasterKPI;

window.editMasterKPI = editMasterKPI;

window.deleteMasterKPI = deleteMasterKPI;

window.filterMasterKPI = filterMasterKPI;

window.resetFilterMasterKPI = resetFilterMasterKPI;

window.refreshMasterKPI = refreshMasterKPI;

window.reloadMasterKPI = reloadMasterKPI;

window.openMasterKPIModal = openMasterKPIModal;

window.closeMasterKPIModal = closeMasterKPIModal;

window.clearMasterKPIForm = clearMasterKPIForm;
