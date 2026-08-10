/**
 * ==========================================================
 * Guardian KPI Web3
 * File : penilaian.js
 * Version : 5.0.0 Production
 * ==========================================================
 */

"use strict";

/* ==========================================================
 * GLOBAL STATE
 * ==========================================================
 */

let penilaianList = [];

let anggotaList = [];

let masterKPIList = [];

let penilaianEditId = null;

/* ==========================================================
 * INIT
 * ==========================================================
 */

async function initPenilaian(){

    clearPenilaianForm();

    loadPenilaianTahun();

    await Promise.all([

        loadPenilaianAnggota(),

        loadPenilaianMasterKPI(),

        loadPenilaianData()

    ]);

}

/* ==========================================================
 * LOAD TAHUN
 * ==========================================================
 */

function loadPenilaianTahun(){

    const select =
        document.getElementById(
            "filterTahun"
        );

    const formSelect =
        document.getElementById(
            "tahunPenilaian"
        );

    const tahun =
        new Date().getFullYear();

    if(select){

        select.innerHTML =

            `<option value="">Semua Tahun</option>`;

        for(

            let i=tahun-2;

            i<=tahun+2;

            i++

        ){

            select.innerHTML +=

            `<option value="${i}">

                ${i}

            </option>`;

        }

    }

    if(formSelect){

        formSelect.innerHTML="";

        for(

            let i=tahun-2;

            i<=tahun+2;

            i++

        ){

            formSelect.innerHTML +=

            `<option

                value="${i}"

                ${i===tahun?"selected":""}

            >

                ${i}

            </option>`;

        }

    }

}

/* ==========================================================
 * LOAD ANGGOTA
 * ==========================================================
 */

async function loadPenilaianAnggota(){

    try{

        const result =
            await API.getAnggota();

        if(!result.success){

            throw new Error(

                result.message

            );

        }

        anggotaList =
            result.data || [];

        const select =
            document.getElementById(

                "anggotaPenilaian"

            );

        if(!select) return;

        select.innerHTML =

            `<option value="">

                Pilih Anggota

            </option>`;

        anggotaList.forEach(function(item){

            select.innerHTML +=

            `<option

                value="${item.id}"

            >

                ${item.nama}

            </option>`;

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

async function loadPenilaianMasterKPI(){

    try{

        const result =

            await API.getMasterKPI();

        if(!result.success){

            throw new Error(

                result.message

            );

        }

        masterKPIList =

            (result.data || [])

            .filter(function(item){

                return String(item.status)

                    .toLowerCase()

                    ==="aktif";

            });

    }

    catch(err){

        alert(err.message);

    }

}

/* ==========================================================
 * LOAD DATA
 * ==========================================================
 */

async function loadPenilaianData(){

    const tbody =

        document.getElementById(

            "tblPenilaian"

        );

    if(!tbody) return;

    tbody.innerHTML=

    `<tr>

        <td

            colspan="8"

            class="text-center"

        >

            Memuat data...

        </td>

    </tr>`;

    try{

        const result =

            await API.getPenilaian();

        if(!result.success){

            throw new Error(

                result.message

            );

        }

        penilaianList =

            result.data || [];

        renderPenilaianTable(

            penilaianList

        );

    }

    catch(err){

        tbody.innerHTML=

        `<tr>

            <td

                colspan="8"

                class="text-danger text-center"

            >

                ${err.message}

            </td>

        </tr>`;

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

        tbody.innerHTML=

        `<tr>

            <td

                colspan="8"

                class="text-center"

            >

                Belum ada data Penilaian.

            </td>

        </tr>`;

        return;

    }

    let html="";

    data.forEach(function(item){

        html +=

        `<tr>

            <td>

                ${item.id}

            </td>

            <td>

                ${item.namaAnggota}

            </td>

            <td>

                ${item.group}

            </td>

            <td>

                ${namaBulan(item.bulan)}

            </td>

            <td>

                ${item.tahun}

            </td>

            <td>

                <span class="badge bg-success">

                    ${Number(item.nilaiAkhir).toFixed(2)}

                </span>

            </td>

            <td>

                ${statusBadge(item.status)}

            </td>

            <td>

                <button

                    class="btn btn-warning btn-sm"

                    onclick="editPenilaian('${item.id}')"

                >

                    <i class="bi bi-pencil"></i>

                </button>

                <button

                    class="btn btn-danger btn-sm"

                    onclick="deletePenilaianConfirm('${item.id}')"

                >

                    <i class="bi bi-trash"></i>

                </button>

            </td>

        </tr>`;

    });

    tbody.innerHTML = html;

}

/* ==========================================================
 * HELPER
 * ==========================================================
 */

function namaBulan(bulan){

    const list=[

        "",

        "Januari",

        "Februari",

        "Maret",

        "April",

        "Mei",

        "Juni",

        "Juli",

        "Agustus",

        "September",

        "Oktober",

        "November",

        "Desember"

    ];

    return list[Number(bulan)] || "-";

}

function statusBadge(status){

    if(status==="Final"){

        return `<span class="badge bg-success">Final</span>`;

    }

    return `<span class="badge bg-secondary">Draft</span>`;

}

/* ==========================================================
 * OPEN MODAL
 * ==========================================================
 */

function openPenilaianModal(){

    penilaianEditId = null;

    clearPenilaianForm();

    renderPenilaianIndikator();

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

function closePenilaianModal(){

    const modal =

        bootstrap.Modal.getInstance(

            document.getElementById(
                "penilaianModal"
            )

        );

    if(modal){

        modal.hide();

    }

}

/* ==========================================================
 * RENDER KPI
 * ==========================================================
 */

function renderPenilaianIndikator(){

    const container =

        document.getElementById(
            "listIndikator"
        );

    if(!container) return;

    if(!masterKPIList.length){

        container.innerHTML=

        `<div class="text-center text-secondary">

            Tidak ada Master KPI Aktif.

        </div>`;

        return;

    }

    let html="";

    masterKPIList.forEach(function(item){

        html +=

        `<div class="row mb-3 border-bottom pb-2">

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

                    value="100"

                    min="0"

                    max="100"

                    onchange="hitungNilaiPenilaian()"

                >

            </div>

        </div>`;

    });

    container.innerHTML = html;

    hitungNilaiPenilaian();

}

/* ==========================================================
 * HITUNG NILAI
 * ==========================================================
 */

function hitungNilaiPenilaian(){

    let total = 0;

    document

    .querySelectorAll(

        ".nilaiKPI"

    )

    .forEach(function(input){

        const nilai =

            Number(

                input.value || 0

            );

        const bobot =

            Number(

                input.dataset.bobot

            );

        total +=

            nilai *

            bobot /

            100;

    });

    total =

        Number(

            total.toFixed(2)

        );

    document.getElementById(

        "totalNilai"

    ).value = total;

    document.getElementById(

        "nilaiAkhir"

    ).value = total;

}

/* ==========================================================
 * GET DETAIL
 * ==========================================================
 */

function getPenilaianDetail(){

    const detail=[];

    document

    .querySelectorAll(

        ".nilaiKPI"

    )

    .forEach(function(input){

        detail.push({

            kpiId:

                input.dataset.id,

            bobot:

                Number(

                    input.dataset.bobot

                ),

            nilai:

                Number(

                    input.value

                )

        });

    });

    return detail;

}

/* ==========================================================
 * VALIDASI
 * ==========================================================
 */

function validatePenilaian(){

    if(

        !document.getElementById(

            "anggotaPenilaian"

        ).value

    ){

        alert(

            "Pilih anggota."

        );

        return false;

    }

    if(

        getPenilaianDetail()

        .length===0

    ){

        alert(

            "Belum ada indikator KPI."

        );

        return false;

    }

    return true;

}

/* ==========================================================
 * CLEAR FORM
 * ==========================================================
 */

function clearPenilaianForm(){

    penilaianEditId = null;

    const anggota =

        document.getElementById(
            "anggotaPenilaian"
        );

    if(anggota){

        anggota.value="";

    }

    const bulan =

        document.getElementById(
            "bulanPenilaian"
        );

    if(bulan){

        bulan.value=
            new Date().getMonth()+1;

    }

    const status =

        document.getElementById(
            "statusPenilaian"
        );

    if(status){

        status.value="Draft";

    }

    const total =

        document.getElementById(
            "totalNilai"
        );

    if(total){

        total.value=0;

    }

    const akhir =

        document.getElementById(
            "nilaiAkhir"
        );

    if(akhir){

        akhir.value=0;

    }

}

/* ==========================================================
 * SAVE PENILAIAN
 * ==========================================================
 */

async function savePenilaian(){

    if(!validatePenilaian()){

        return;

    }

    const data={

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

    const btn=

        document.getElementById(

            "btnSavePenilaian"

        );

    const html=

        btn.innerHTML;

    btn.disabled=true;

    btn.innerHTML=`

        <span class="spinner-border spinner-border-sm me-2"></span>

        Menyimpan...

    `;

    try{

        let result;

        if(penilaianEditId){

            result=

                await API.updatePenilaian(

                    penilaianEditId,

                    data

                );

        }

        else{

            result=

                await API.savePenilaian(

                    data

                );

        }

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

        btn.disabled=false;

        btn.innerHTML=html;

    }

}

/* ==========================================================
 * EDIT PENILAIAN
 * ==========================================================
 */

async function editPenilaian(id){

    const item=

        penilaianList.find(function(row){

            return row.id===id;

        });

    if(!item){

        alert("Data tidak ditemukan.");

        return;

    }

    penilaianEditId=id;

    clearPenilaianForm();

    document.getElementById(

        "anggotaPenilaian"

    ).value=item.anggotaId;

    document.getElementById(

        "bulanPenilaian"

    ).value=item.bulan;

    document.getElementById(

        "tahunPenilaian"

    ).value=item.tahun;

    document.getElementById(

        "statusPenilaian"

    ).value=item.status;

    renderPenilaianIndikator();

    setTimeout(function(){

        item.detail.forEach(function(detail){

            const input=

                document.querySelector(

                    `.nilaiKPI[data-id="${detail.kpiId}"]`

                );

            if(input){

                input.value=

                    detail.nilai;

            }

        });

        hitungNilaiPenilaian();

    },100);

    document.querySelector(

        "#penilaianModal .modal-title"

    ).textContent=

        "Edit Penilaian";

    const modal=

        new bootstrap.Modal(

            document.getElementById(

                "penilaianModal"

            )

        );

    modal.show();

}

/* ==========================================================
 * DELETE
 * ==========================================================
 */

async function deletePenilaianConfirm(id){

    if(

        !confirm(

            "Hapus data Penilaian ini?"

        )

    ){

        return;

    }

    try{

        const result=

            await API.deletePenilaian(

                id

            );

        if(!result.success){

            throw new Error(

                result.message

            );

        }

        alert(result.message);

        await loadPenilaianData();

    }

    catch(err){

        alert(err.message);

    }

}

/* ==========================================================
 * REFRESH
 * ==========================================================
 */

async function refreshPenilaian(){

    await initPenilaian();

}

/* ==========================================================
 * FILTER
 * ==========================================================
 */

function filterPenilaian(){

    const keyword =

        document.getElementById(

            "searchPenilaian"

        ).value.toLowerCase().trim();

    const bulan =

        document.getElementById(

            "filterBulan"

        ).value;

    const tahun =

        document.getElementById(

            "filterTahun"

        ).value;

    const status =

        document.getElementById(

            "filterStatusPenilaian"

        ).value;

    const hasil = penilaianList.filter(function(item){

        const cocokNama =

            String(item.namaAnggota || "")

            .toLowerCase()

            .includes(keyword);

        const cocokBulan =

            bulan==="" ||

            String(item.bulan)===bulan;

        const cocokTahun =

            tahun==="" ||

            String(item.tahun)===tahun;

        const cocokStatus =

            status==="" ||

            item.status===status;

        return (

            cocokNama &&

            cocokBulan &&

            cocokTahun &&

            cocokStatus

        );

    });

    renderPenilaianTable(

        hasil

    );

}

/* ==========================================================
 * RESET FILTER
 * ==========================================================
 */

function resetFilterPenilaian(){

    document.getElementById(

        "searchPenilaian"

    ).value="";

    document.getElementById(

        "filterBulan"

    ).value="";

    document.getElementById(

        "filterTahun"

    ).value="";

    document.getElementById(

        "filterStatusPenilaian"

    ).value="";

    renderPenilaianTable(

        penilaianList

    );

}

/* ==========================================================
 * EXPORT GLOBAL
 * ==========================================================
 */

window.initPenilaian = initPenilaian;

window.openPenilaianModal = openPenilaianModal;

window.closePenilaianModal = closePenilaianModal;

window.savePenilaian = savePenilaian;

window.editPenilaian = editPenilaian;

window.deletePenilaianConfirm = deletePenilaianConfirm;

window.loadPenilaianData = loadPenilaianData;

window.refreshPenilaian = refreshPenilaian;

window.renderPenilaianTable = renderPenilaianTable;

window.renderPenilaianIndikator = renderPenilaianIndikator;

window.hitungNilaiPenilaian = hitungNilaiPenilaian;

window.filterPenilaian = filterPenilaian;

window.resetFilterPenilaian = resetFilterPenilaian;

window.getPenilaianDetail = getPenilaianDetail;

window.clearPenilaianForm = clearPenilaianForm;
