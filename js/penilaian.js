/**
 * ==========================================================
 * Guardian KPI Web3
 * File : penilaian.js
 * Version : 4.0.0
 * ==========================================================
 */

"use strict";

/* ==========================================================
 * GLOBAL VARIABLE
 * ==========================================================
 */

let penilaianList = [];

let penilaianAnggotaList = [];

let penilaianMasterKPIList = [];

let penilaianEditId = null;


/* ==========================================================
 * INIT
 * ==========================================================
 */

async function initPenilaian() {

    clearPenilaianForm();
    loadPenilaianTahun();

    await Promise.all([

        loadPenilaianAnggota(),

        loadPenilaianMasterKPI(),

        loadPenilaianData()

    ]);

}


/* ==========================================================
 * LOAD DATA PENILAIAN
 * ==========================================================
 */

async function loadPenilaianData() {

    const tbody = document.getElementById(
        "tblPenilaian"
    );

    if (!tbody) return;

    tbody.innerHTML = `

        <tr>

            <td colspan="8"
                class="text-center">

                Memuat data...

            </td>

        </tr>

    `;

    try {

        // Jika backend belum dibuat
        if (typeof API.getPenilaian !== "function") {

            penilaianList = [];

            renderPenilaianTable([]);

            return;

        }

        const result = await API.getPenilaian();

        if (!result.success) {

            throw new Error(result.message);

        }

        penilaianList = result.data || [];

        renderPenilaianTable(
            penilaianList
        );

    }

    catch (err) {

        tbody.innerHTML = `

            <tr>

                <td colspan="8"
                    class="text-danger text-center">

                    ${err.message}

                </td>

            </tr>

        `;

    }

}

/* ==========================================================
 * LOAD ANGGOTA
 * ==========================================================
 */

async function loadPenilaianAnggota() {

    try {

        const result =
            await API.getAnggota();

        if (!result.success) {

            throw new Error(
                result.message
            );

        }

        penilaianAnggotaList =
            result.data || [];

        const select =
            document.getElementById(
                "anggotaPenilaian"
            );

        if (!select) return;

        select.innerHTML = `

            <option value="">

                Pilih Anggota

            </option>

        `;

        penilaianAnggotaList.forEach(function (item) {

            select.innerHTML += `

                <option value="${item.id}">

                    ${item.nama}

                </option>

            `;

        });

    }

    catch (err) {

        alert(err.message);

    }

}

/* ==========================================================
 * LOAD TAHUN
 * ==========================================================
 */

function loadPenilaianTahun(){

    const select =
        document.getElementById(
            "tahunPenilaian"
        );

    if(!select) return;

    const tahun =
        new Date().getFullYear();

    select.innerHTML = "";

    for(
        let i=tahun-2;
        i<=tahun+2;
        i++
    ){

        select.innerHTML += `

            <option
                value="${i}"
                ${i===tahun?"selected":""}>

                ${i}

            </option>

        `;

    }

}

/* ==========================================================
 * LOAD MASTER KPI
 * ==========================================================
 */

async function loadPenilaianMasterKPI() {

    try {

        const result =
            await API.getMasterKPI();
        console.log("MASTER KPI RESULT");
        console.log(result);

        if (!result.success) {

            throw new Error(
                result.message
            );

        }

        penilaianMasterKPIList =
            (result.data || []).filter(function(item){

                return String(item.status)
                    .trim()
                    .toLowerCase() === "aktif";

            });
        
        console.log("MASTER KPI LIST");
        console.log(penilaianMasterKPIList);

        renderPenilaianIndikator();

    }

    catch (err) {

        alert(err.message);

    }

}

/* ==========================================================
 * RENDER TABLE
 * ==========================================================
 */

function renderPenilaianTable(data){

    const tbody =
        document.getElementById(
            "tblPenilaian"
        );

    if(!tbody) return;

    if(!data.length){

        tbody.innerHTML = `

            <tr>

                <td colspan="8"
                    class="text-center">

                    Belum ada data Penilaian.

                </td>

            </tr>

        `;

        return;

    }

    tbody.innerHTML = `

        <tr>

            <td colspan="8"
                class="text-center">

                Render data akan dibuat pada tahap berikutnya.

            </td>

        </tr>

    `;

}


/* ==========================================================
 * RENDER INDIKATOR KPI
 * ==========================================================
 */

function renderPenilaianIndikator() {

    const container =
        document.getElementById(
            "listIndikator"
        );

    if (!container) return;

    if (!penilaianMasterKPIList.length) {

        container.innerHTML = `

            <div class="text-center text-secondary">

                Tidak ada Master KPI.

            </div>

        `;

        return;

    }

    let html = "";

    penilaianMasterKPIList.forEach(function(item){

        html += `

        <div class="row mb-3 align-items-center border-bottom pb-2">

            <div class="col-md-5">

                <strong>

                    ${item.indicator}

                </strong>

                <br>

                <small class="text-info">

                    ${item.kategori}

                </small>

            </div>

            <div class="col-md-2 text-center">

                <span class="badge bg-info">

                    ${item.bobot}%

                </span>

            </div>

            <div class="col-md-5">

                <input

                    type="number"

                    class="form-control nilaiKPI"

                    data-id="${item.id}"

                    data-bobot="${item.bobot}"

                    min="0"

                    max="100"

                    value="100"

                    onchange="hitungNilaiPenilaian()"

                >

            </div>

        </div>

        `;

    });

    container.innerHTML = html;

}

/* ==========================================================
 * HITUNG NILAI
 * ==========================================================
 */

function hitungNilaiPenilaian(){

    const inputs =
        document.querySelectorAll(
            ".nilaiKPI"
        );

    let total = 0;

    inputs.forEach(function(input){

        const nilai =
            Number(input.value || 0);

        const bobot =
            Number(
                input.dataset.bobot
            );

        total +=
            nilai * bobot / 100;

    });

    document.getElementById(
        "totalNilai"
    ).value =
        total.toFixed(2);

    document.getElementById(
        "nilaiAkhir"
    ).value =
        total.toFixed(2);

}

/* ==========================================================
 * GET DETAIL KPI
 * ==========================================================
 */

function getPenilaianDetail(){

    const detail = [];

    document
        .querySelectorAll(".nilaiKPI")
        .forEach(function(input){

            detail.push({

                kpiId: input.dataset.id,

                nilai: Number(input.value),

                bobot: Number(input.dataset.bobot)

            });

        });

    return detail;

}

/* ==========================================================
 * VALIDASI FORM
 * ==========================================================
 */

function validatePenilaian(){

    if(
        !document.getElementById(
            "anggotaPenilaian"
        ).value
    ){

        alert("Pilih anggota.");

        return false;

    }

    if(
        getPenilaianDetail().length===0
    ){

        alert("Belum ada indikator KPI.");

        return false;

    }

    return true;

}

/* ==========================================================
 * SAVE PENILAIAN
 * ==========================================================
 */

async function savePenilaian(){

    if(!validatePenilaian()){

        return;

    }

    const data = {

        anggotaId:
            document.getElementById(
                "anggotaPenilaian"
            ).value,

        bulan:Number(

            document.getElementById(
                "bulanPenilaian"
            ).value

        ),

        tahun:Number(

            document.getElementById(
                "tahunPenilaian"
            ).value

        ),

        status:

            document.getElementById(
                "statusPenilaian"
            ).value,

        total:Number(

            document.getElementById(
                "totalNilai"
            ).value

        ),

        nilaiAkhir:Number(

            document.getElementById(
                "nilaiAkhir"
            ).value

        ),

        detail:

            getPenilaianDetail()

    };

   const btn =
    document.getElementById(
        "btnSavePenilaian"
    );

const html =
    btn.innerHTML;

btn.disabled = true;

btn.innerHTML = `

    <span
        class="spinner-border spinner-border-sm me-2">
    </span>

    Menyimpan...

`;

try{

    const result =
        await API.savePenilaian(data);

    if(!result.success){

        throw new Error(
            result.message
        );

    }

    alert(result.message);

    closePenilaianModal();

    await loadPenilaianData();

}
catch(err){

    alert(err.message);

}
finally{

    btn.disabled = false;

    btn.innerHTML = html;

}
}


/* ==========================================================
 * CLEAR FORM
 * ==========================================================
 */

function clearPenilaianForm() {

    penilaianEditId = null;

    const anggota =
        document.getElementById(
            "anggotaPenilaian"
        );

    if (anggota) {

        anggota.value = "";

    }

    const bulan =
        document.getElementById(
            "bulanPenilaian"
        );

    if (bulan) {

        bulan.selectedIndex = 0;

    }

    loadPenilaianTahun();

    const status =
        document.getElementById(
            "statusPenilaian"
        );

    if (status) {

        status.value = "Draft";

    }

    const total =
        document.getElementById(
            "totalNilai"
        );

    if (total) {

        total.value = "";

    }

    const akhir =
        document.getElementById(
            "nilaiAkhir"
        );

    if (akhir) {

        akhir.value = "";

    }

}


/* ==========================================================
 * OPEN MODAL
 * ==========================================================
 */

function openPenilaianModal() {

    clearPenilaianForm();

    renderPenilaianIndikator();

    hitungNilaiPenilaian();

    document.querySelector(
        "#penilaianModal .modal-title"
    ).textContent =
        "Penilaian Baru";

    const modal =
        new bootstrap.Modal(

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

function closePenilaianModal() {

    const element =
        document.getElementById(
            "penilaianModal"
        );

    const modal =
        bootstrap.Modal.getInstance(
            element
        );

    if (modal) {

        modal.hide();

    }

}


/* ==========================================================
 * EXPORT
 * ==========================================================
 */

window.initPenilaian = initPenilaian;

window.loadPenilaianData = loadPenilaianData;

window.loadPenilaianAnggota = loadPenilaianAnggota;

window.loadPenilaianMasterKPI = loadPenilaianMasterKPI;

window.loadPenilaianTahun = loadPenilaianTahun;

window.renderPenilaianTable = renderPenilaianTable;

window.renderPenilaianIndikator = renderPenilaianIndikator;

window.hitungNilaiPenilaian = hitungNilaiPenilaian;

window.openPenilaianModal = openPenilaianModal;

window.closePenilaianModal = closePenilaianModal;

window.clearPenilaianForm = clearPenilaianForm;

window.getPenilaianDetail = getPenilaianDetail;

window.savePenilaian = savePenilaian;

window.validatePenilaian = validatePenilaian;
