/**
 * ==========================================================
 * Guardian KPI Web3
 * File : penilaian.js
 * Version : 1.0.0
 * ==========================================================
 */

"use strict";

/* ==========================================================
 * GLOBAL VARIABLE
 * ==========================================================
 */

let penilaianData = [];

let anggotaPenilaianData = [];

let masterPenilaianData = [];

let editPenilaianId = null;

/* ==========================================================
 * INIT
 * ==========================================================
 */

async function initPenilaian(){

    clearPenilaianForm();

    await Promise.all([
        loadAnggotaPenilaian(),
        loadMasterKPI(),
        loadPenilaian()
    ]);

}

/* ==========================================================
 * LOAD PENILAIAN
 * ==========================================================
 */

async function loadPenilaian(){

    const tbody = document.getElementById(
        "tblPenilaian"
    );

    if(!tbody) return;

    tbody.innerHTML = `

        <tr>

            <td colspan="8" class="text-center">

                Memuat data...

            </td>

        </tr>

    `;

    // Backend dibuat pada tahap berikutnya

    tbody.innerHTML = `

        <tr>

            <td colspan="8" class="text-center">

                Belum ada data Penilaian.

            </td>

        </tr>

    `;

}

/* ==========================================================
 * LOAD ANGGOTA
 * ==========================================================
 */

async function loadAnggotaPenilaian(){

    try{

        const result = await API.getAnggota();

        if(!result.success){

            throw new Error(result.message);

        }

        anggotaPenilaianData = result.data || [];

        const select = document.getElementById(
            "anggotaPenilaian"
        );

        if(!select) return;

        select.innerHTML = `

            <option value="">

                Pilih Anggota

            </option>

        `;

        anggotaPenilaianData.forEach(function(item){

            select.innerHTML += `

                <option value="${item.id}">

                    ${item.nama}

                </option>

            `;

        });

    }

    catch(err){

        alert(err.message);

    }

}

/* ==========================================================
 * LOAD MASTER KPI
 * ==========================================================
 */

async function loadMasterKPI(){

    try{

        const result = await API.getMasterKPI();

        if(!result.success){

            throw new Error(result.message);

        }

        masterPenilaianData = result.data || [];
        
        renderIndikatorKPI();

    }

    catch(err){

        alert(err.message);

    }

}


/* ==========================================================
 * RENDER INDIKATOR KPI
 * ==========================================================
 */

function renderIndikatorKPI(){

    const container = document.getElementById(
        "listIndikator"
    );

    if(!container) return;

    if(masterPenilaianData.length === 0){

        container.innerHTML = `

            <div class="text-center text-secondary">

                Tidak ada indikator KPI.

            </div>

        `;

        return;

    }

    let html = "";

    masterPenilaianData.forEach(function(item,index){

        html += `

        <div class="row mb-3 align-items-center">

            <div class="col-md-6">

                <label class="form-label mb-0">

                    ${item.indicator}

                </label>

            </div>

            <div class="col-md-3">

                <input
                    type="number"
                    class="form-control nilaiKPI"
                    data-id="${item.id}"
                    min="0"
                    max="100"
                    value="100">

            </div>

            <div class="col-md-3">

                <span class="badge bg-info">

                    Bobot ${item.bobot}%

                </span>

            </div>

        </div>

        `;

    });

    container.innerHTML = html;

}


/* ==========================================================
 * CLEAR FORM
 * ==========================================================
 */

function clearPenilaianForm(){

    editPenilaianId = null;

}

/* ==========================================================
 * OPEN MODAL
 * ==========================================================
 */

function openPenilaianModal(){

    editPenilaianId = null;

    clearPenilaianForm();

    document.querySelector(
        "#penilaianModal .modal-title"
    ).textContent = "Penilaian Baru";

    const modal = new bootstrap.Modal(

        document.getElementById(
            "penilaianModal"
        )

    );

    modal.show();

}

/* ==========================================================
 * CLOSE MODAL
 * ==========================================================
 */

function closePenilaianModal(){

    const element = document.getElementById(
        "penilaianModal"
    );

    const modal = bootstrap.Modal.getInstance(element);

    if(modal){

        modal.hide();

    }

}


/* ==========================================================
 * EXPORT
 * ==========================================================
 */

window.initPenilaian = initPenilaian;
window.loadPenilaian = loadPenilaian;
window.loadAnggotaPenilaian = loadAnggotaPenilaian;
window.loadMasterKPI = loadMasterKPI;
window.clearPenilaianForm = clearPenilaianForm;
window.renderIndikatorKPI = renderIndikatorKPI;
window.openPenilaianModal = openPenilaianModal;
window.closePenilaianModal = closePenilaianModal;
