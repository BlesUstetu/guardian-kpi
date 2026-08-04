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

let editPenilaianId = null;

/* ==========================================================
 * INIT
 * ==========================================================
 */

async function initPenilaian(){

    clearPenilaianForm();

    await loadAnggotaPenilaian();

    await loadMasterKPI();

    await loadPenilaian();

}

/* ==========================================================
 * LOAD PENILAIAN
 * ==========================================================
 */

async function loadPenilaian(){

    const tbody = document.getElementById(
        "tblPenilaian"
    );

    tbody.innerHTML = `

        <tr>

            <td colspan="8" class="text-center">

                Modul Penilaian sedang dibuat...

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

        anggotaData = result.data || [];

        const select = document.getElementById(
            "anggotaPenilaian"
        );

        select.innerHTML = `

            <option value="">

                Pilih Anggota

            </option>

        `;

        anggotaData.forEach(function(item){

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

        masterKPIData = result.data || [];

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

