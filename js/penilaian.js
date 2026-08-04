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

let anggotaData = [];

let masterKPIData = [];

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

    console.log("Load Penilaian");

}

/* ==========================================================
 * LOAD ANGGOTA
 * ==========================================================
 */

async function loadAnggotaPenilaian(){

    console.log("Load Anggota");

}

/* ==========================================================
 * LOAD MASTER KPI
 * ==========================================================
 */

async function loadMasterKPI(){

    console.log("Load Master KPI");

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

