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

    }

    catch(err){

        alert(err.message);

    }

}

/* ==========================================================
 * CLEAR FORM
 * ==========================================================
 */

function clearPenilaianForm(){

    editPenilaianId = null;

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
