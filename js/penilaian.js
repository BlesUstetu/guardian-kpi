/**
 * ==========================================================
 * Guardian KPI Web3
 * File : js/penilaian.js
 * Module : PENILAIAN
 * Version : 7.0.0
 * ==========================================================
 *
 * PERBAIKAN:
 * 1. Edit tidak lagi membuat ID baru.
 * 2. penilaianEditId dipertahankan saat reset form.
 * 3. Cegah duplikasi Anggota + Bulan + Tahun.
 * 4. Validasi nilai KPI 0-100.
 * 5. Nilai akhir dihitung otomatis.
 * 6. Detail KPI dimuat kembali saat Edit.
 * 7. Frontend tetap melakukan validasi sebelum request backend.
 * 8. Backend tetap menjadi validasi final.
 *
 * ==========================================================
 */

"use strict";

let penilaianList = [];
let anggotaList = [];
let masterKPIList = [];
let penilaianEditId = null;


/* ==========================================================
 * INIT
 * ==========================================================
 */

async function initPenilaian(){

    penilaianEditId = null;

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

    const filterTahun =
        document.getElementById("filterTahun");

    const tahunPenilaian =
        document.getElementById("tahunPenilaian");

    const tahunSekarang =
        new Date().getFullYear();


    /* FILTER TAHUN */

    if(filterTahun){

        filterTahun.innerHTML =
            `<option value="">Semua Tahun</option>`;

        for(
            let tahun = tahunSekarang - 2;
            tahun <= tahunSekarang + 2;
            tahun++
        ){

            filterTahun.innerHTML +=
                `<option value="${tahun}">
                    ${tahun}
                </option>`;
        }
    }


    /* FORM TAHUN */

    if(tahunPenilaian){

        tahunPenilaian.innerHTML = "";

        for(
            let tahun = tahunSekarang - 2;
            tahun <= tahunSekarang + 2;
            tahun++
        ){

            tahunPenilaian.innerHTML += `
                <option
                    value="${tahun}"
                    ${tahun === tahunSekarang ? "selected" : ""}
                >
                    ${tahun}
                </option>
            `;
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

        if(!result || !result.success){

            throw new Error(
                result?.message ||
                "Gagal mengambil data anggota."
            );
        }

        anggotaList =
            Array.isArray(result.data)
                ? result.data
                : [];


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

            select.innerHTML += `
                <option value="${escapePenilaianHtml(item.id)}">
                    ${escapePenilaianHtml(item.nama)}
                </option>
            `;
        });


    }catch(error){

        console.error(
            "loadPenilaianAnggota:",
            error
        );

        alert(error.message);
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


        if(!result || !result.success){

            throw new Error(
                result?.message ||
                "Gagal mengambil Master KPI."
            );
        }


        masterKPIList =
            Array.isArray(result.data)
                ? result.data.filter(function(item){

                    return String(
                        item.status || ""
                    )
                    .trim()
                    .toLowerCase() === "aktif";

                })
                : [];


    }catch(error){

        console.error(
            "loadPenilaianMasterKPI:",
            error
        );

        alert(error.message);
    }
}


/* ==========================================================
 * LOAD DATA PENILAIAN
 * ==========================================================
 */

async function loadPenilaianData(){

    const tbody =
        document.getElementById(
            "tblPenilaian"
        );

    if(!tbody) return;


    tbody.innerHTML = `
        <tr>
            <td colspan="8"
                class="text-center">
                Memuat data...
            </td>
        </tr>
    `;


    try{

        const result =
            await API.getPenilaian();


        if(!result || !result.success){

            throw new Error(
                result?.message ||
                "Gagal mengambil data penilaian."
            );
        }


        penilaianList =
            Array.isArray(result.data)
                ? result.data.map(
                    normalizePenilaianItem
                )
                : [];


        renderPenilaianTable(
            penilaianList
        );


    }catch(error){

        console.error(
            "loadPenilaianData:",
            error
        );


        tbody.innerHTML = `
            <tr>
                <td colspan="8"
                    class="text-danger text-center">
                    ${escapePenilaianHtml(
                        error.message
                    )}
                </td>
            </tr>
        `;
    }
}


/* ==========================================================
 * NORMALIZE
 * ==========================================================
 */

function normalizePenilaianItem(item){

    item = item || {};


    let detail =
        item.detail;


    if(typeof detail === "string"){

        try{

            detail =
                JSON.parse(detail);

        }catch(error){

            detail = [];
        }
    }


    if(!Array.isArray(detail)){

        detail = [];
    }


    return {

        ...item,

        id:
            String(
                item.id || ""
            ).trim(),

        anggotaId:
            String(
                item.anggotaId ||
                item.anggotaID ||
                ""
            ).trim(),

        namaAnggota:
            item.namaAnggota ||
            item.nama ||
            "-",

        group:
            item.group ||
            item.groupId ||
            "-",

        bulan:
            Number(
                item.bulan || 0
            ),

        tahun:
            Number(
                item.tahun || 0
            ),

        nilaiAkhir:
            Number(
                item.nilaiAkhir ||
                item.nilai ||
                0
            ),

        total:
            Number(
                item.total ||
                item.nilaiAkhir ||
                0
            ),

        status:
            String(
                item.status ||
                "Draft"
            ),

        detail:
            detail
    };
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


    if(!Array.isArray(data) ||
       !data.length){

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


    let html = "";


    data.forEach(function(item){

        html += `
            <tr>

                <td>
                    ${escapePenilaianHtml(
                        item.id
                    )}
                </td>

                <td>
                    ${escapePenilaianHtml(
                        item.namaAnggota
                    )}
                </td>

                <td>
                    ${escapePenilaianHtml(
                        item.group
                    )}
                </td>

                <td>
                    ${escapePenilaianHtml(
                        namaBulan(item.bulan)
                    )}
                </td>

                <td>
                    ${escapePenilaianHtml(
                        item.tahun
                    )}
                </td>

                <td>
                    <span class="badge bg-success">
                        ${Number(
                            item.nilaiAkhir
                        ).toFixed(2)}
                    </span>
                </td>

                <td>
                    ${statusBadge(
                        item.status
                    )}
                </td>

                <td>

                    <button
                        class="btn btn-warning btn-sm"
                        onclick="editPenilaian('${escapePenilaianJs(item.id)}')"
                        title="Edit">

                        <i class="bi bi-pencil"></i>

                    </button>

                    <button
                        class="btn btn-danger btn-sm"
                        onclick="deletePenilaianConfirm('${escapePenilaianJs(item.id)}')"
                        title="Hapus">

                        <i class="bi bi-trash"></i>

                    </button>

                </td>

            </tr>
        `;
    });


    tbody.innerHTML = html;
}


/* ==========================================================
 * BULAN
 * ==========================================================
 */

function namaBulan(bulan){

    const list = [

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


    return (
        list[
            Number(bulan)
        ] || "-"
    );
}


/* ==========================================================
 * STATUS
 * ==========================================================
 */

function statusBadge(status){

    if(
        String(status)
            .trim()
            .toLowerCase() === "final"
    ){

        return `
            <span class="badge bg-success">
                Final
            </span>
        `;
    }


    return `
        <span class="badge bg-secondary">
            Draft
        </span>
    `;
}


/* ==========================================================
 * ESCAPE
 * ==========================================================
 */

function escapePenilaianHtml(value){

    return String(
        value == null
            ? ""
            : value
    )
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


function escapePenilaianJs(value){

    return String(
        value == null
            ? ""
            : value
    )
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "\\'")
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r");
}


/* ==========================================================
 * OPEN PENILAIAN BARU
 * ==========================================================
 */

function openPenilaianModal(){

    /*
     * Mode BARU harus selalu menghapus ID edit.
     */

    penilaianEditId = null;

    clearPenilaianForm();

    renderPenilaianIndikator();


    const title =
        document.querySelector(
            "#penilaianModal .modal-title"
        );

    if(title){

        title.textContent =
            "Penilaian Baru";
    }


    const modalElement =
        document.getElementById(
            "penilaianModal"
        );

    if(!modalElement) return;


    const modal =
        new bootstrap.Modal(
            modalElement
        );

    modal.show();
}


/* ==========================================================
 * CLOSE
 * ==========================================================
 */

function closePenilaianModal(){

    const modalElement =
        document.getElementById(
            "penilaianModal"
        );

    if(!modalElement) return;


    const modal =
        bootstrap.Modal.getInstance(
            modalElement
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

        container.innerHTML = `
            <div class="text-center text-secondary">
                Tidak ada Master KPI Aktif.
            </div>
        `;

        hitungNilaiPenilaian();

        return;
    }


    let html = "";


    masterKPIList.forEach(function(item){

        const bobot =
            Number(
                item.bobot || 0
            );


        html += `

            <div class="row mb-3 border-bottom pb-2">

                <div class="col-md-5">

                    <strong>
                        ${escapePenilaianHtml(
                            item.indicator
                        )}
                    </strong>

                    <br>

                    <small class="text-info">

                        ${escapePenilaianHtml(
                            item.kategori
                        )}

                    </small>

                </div>


                <div class="col-md-2 text-center">

                    <span class="badge bg-info">

                        ${bobot}%

                    </span>

                </div>


                <div class="col-md-5">

                    <input
                        type="number"
                        class="form-control nilaiKPI"
                        data-id="${escapePenilaianHtml(item.id)}"
                        data-bobot="${bobot}"
                        value="100"
                        min="0"
                        max="100"
                        step="0.01"
                        oninput="hitungNilaiPenilaian()"
                    >

                </div>

            </div>

        `;
    });


    container.innerHTML =
        html;


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
                    input.dataset.bobot || 0
                );


            if(
                Number.isFinite(nilai) &&
                Number.isFinite(bobot)
            ){

                total +=
                    nilai *
                    bobot /
                    100;
            }
        });


    total =
        Number(
            total.toFixed(2)
        );


    const totalElement =
        document.getElementById(
            "totalNilai"
        );

    const akhirElement =
        document.getElementById(
            "nilaiAkhir"
        );


    if(totalElement){

        totalElement.value =
            total;
    }


    if(akhirElement){

        akhirElement.value =
            total;
    }
}


/* ==========================================================
 * DETAIL
 * ==========================================================
 */

function getPenilaianDetail(){

    const detail = [];


    document
        .querySelectorAll(
            ".nilaiKPI"
        )
        .forEach(function(input){

            detail.push({

                kpiId:
                    String(
                        input.dataset.id ||
                        ""
                    ).trim(),

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
 * UNIQUE KEY
 * ==========================================================
 */

function getPenilaianUniqueKey(
    anggotaId,
    bulan,
    tahun
){

    return [

        String(
            anggotaId || ""
        )
        .trim()
        .toLowerCase(),

        Number(
            bulan || 0
        ),

        Number(
            tahun || 0
        )

    ].join("|");
}


/* ==========================================================
 * FIND DUPLICATE
 * ==========================================================
 */

function findDuplicatePenilaian(
    anggotaId,
    bulan,
    tahun,
    excludeId
){

    const key =
        getPenilaianUniqueKey(
            anggotaId,
            bulan,
            tahun
        );


    return (
        penilaianList.find(
            function(item){

                const itemId =
                    String(
                        item.id || ""
                    ).trim();


                if(
                    excludeId &&
                    itemId ===
                    String(
                        excludeId
                    ).trim()
                ){

                    return false;
                }


                return (
                    getPenilaianUniqueKey(
                        item.anggotaId,
                        item.bulan,
                        item.tahun
                    ) === key
                );
            }
        ) || null
    );
}


/* ==========================================================
 * VALIDASI
 * ==========================================================
 */

function validatePenilaian(){

    const anggota =
        document.getElementById(
            "anggotaPenilaian"
        );

    const bulan =
        document.getElementById(
            "bulanPenilaian"
        );

    const tahun =
        document.getElementById(
            "tahunPenilaian"
        );


    /* ANGGOTA */

    if(
        !anggota ||
        !String(
            anggota.value
        ).trim()
    ){

        alert(
            "Pilih anggota."
        );

        return false;
    }


    const bulanValue =
        Number(
            bulan?.value
        );


    const tahunValue =
        Number(
            tahun?.value
        );


    /* BULAN */

    if(
        !Number.isInteger(
            bulanValue
        ) ||
        bulanValue < 1 ||
        bulanValue > 12
    ){

        alert(
            "Bulan penilaian tidak valid."
        );

        return false;
    }


    /* TAHUN */

    if(
        !Number.isInteger(
            tahunValue
        ) ||
        tahunValue < 2000 ||
        tahunValue > 2100
    ){

        alert(
            "Tahun penilaian tidak valid."
        );

        return false;
    }


    /* KPI */

    if(
        !masterKPIList.length
    ){

        alert(
            "Tidak ada Master KPI Aktif."
        );

        return false;
    }


    const detail =
        getPenilaianDetail();


    if(!detail.length){

        alert(
            "Belum ada indikator KPI."
        );

        return false;
    }


    /* NILAI */

    for(
        let i = 0;
        i < detail.length;
        i++
    ){

        const item =
            detail[i];


        if(!item.kpiId){

            alert(
                "ID KPI tidak valid."
            );

            return false;
        }


        if(
            !Number.isFinite(
                item.nilai
            ) ||
            item.nilai < 0 ||
            item.nilai > 100
        ){

            alert(
                "Semua nilai KPI harus berada di antara 0 sampai 100."
            );

            return false;
        }


        if(
            !Number.isFinite(
                item.bobot
            ) ||
            item.bobot < 0
        ){

            alert(
                "Bobot KPI tidak valid."
            );

            return false;
        }
    }


    /* DUPLIKASI */

    const duplicate =
        findDuplicatePenilaian(
            anggota.value,
            bulanValue,
            tahunValue,
            penilaianEditId
        );


    if(duplicate){

        alert(
            "Penilaian untuk " +
            duplicate.namaAnggota +
            " pada " +
            namaBulan(
                duplicate.bulan
            ) +
            " " +
            duplicate.tahun +
            " sudah ada dengan ID " +
            duplicate.id +
            ".\n\n" +
            "Silakan gunakan tombol Edit."
        );

        return false;
    }


    return true;
}


/* ==========================================================
 * CLEAR FORM
 *
 * PENTING:
 * Fungsi ini TIDAK BOLEH mengubah penilaianEditId.
 * ==========================================================
 */

function clearPenilaianForm(){

    const anggota =
        document.getElementById(
            "anggotaPenilaian"
        );

    if(anggota){

        anggota.value = "";
    }


    const bulan =
        document.getElementById(
            "bulanPenilaian"
        );

    if(bulan){

        bulan.value =
            new Date().getMonth() + 1;
    }


    const tahun =
        document.getElementById(
            "tahunPenilaian"
        );


    if(tahun){

        const currentYear =
            new Date().getFullYear();


        if(
            [...tahun.options]
            .some(function(option){

                return Number(
                    option.value
                ) === currentYear;
            })
        ){

            tahun.value =
                currentYear;
        }
    }


    const status =
        document.getElementById(
            "statusPenilaian"
        );


    if(status){

        status.value =
            "Draft";
    }


    const total =
        document.getElementById(
            "totalNilai"
        );


    if(total){

        total.value =
            0;
    }


    const akhir =
        document.getElementById(
            "nilaiAkhir"
        );


    if(akhir){

        akhir.value =
            0;
    }


    const container =
        document.getElementById(
            "listIndikator"
        );


    if(container){

        container.innerHTML =
            "";
    }
}


/* ==========================================================
 * BUILD PAYLOAD
 * ==========================================================
 */

function buildPenilaianPayload(){

    return {

        anggotaId:
            document.getElementById(
                "anggotaPenilaian"
            ).value,

        bulan:
            Number(
                document.getElementById(
                    "bulanPenilaian"
                ).value
            ),

        tahun:
            Number(
                document.getElementById(
                    "tahunPenilaian"
                ).value
            ),

        status:
            document.getElementById(
                "statusPenilaian"
            ).value,

        total:
            Number(
                document.getElementById(
                    "totalNilai"
                ).value || 0
            ),

        nilaiAkhir:
            Number(
                document.getElementById(
                    "nilaiAkhir"
                ).value || 0
            ),

        detail:
            getPenilaianDetail()
    };
}


/* ==========================================================
 * SAVE / UPDATE
 * ==========================================================
 */

async function savePenilaian(){

    if(
        !validatePenilaian()
    ){

        return;
    }


    const data =
        buildPenilaianPayload();


    const btn =
        document.getElementById(
            "btnSavePenilaian"
        );


    const originalHtml =
        btn
            ? btn.innerHTML
            : "Simpan";


    if(btn){

        btn.disabled =
            true;

        btn.innerHTML = `
            <span
                class="spinner-border spinner-border-sm me-2">
            </span>

            Menyimpan...
        `;
    }


    try{

        let result;


        /*
         * JIKA ADA ID:
         * UPDATE
         */

        if(
            penilaianEditId
        ){

            result =
                await API.updatePenilaian(
                    penilaianEditId,
                    data
                );

        }

        /*
         * JIKA TIDAK ADA ID:
         * SAVE BARU
         */

        else{

            result =
                await API.savePenilaian(
                    data
                );
        }


        if(
            !result ||
            !result.success
        ){

            throw new Error(
                result?.message ||
                "Gagal menyimpan penilaian."
            );
        }


        alert(
            result.message ||
            "Penilaian berhasil disimpan."
        );


        closePenilaianModal();


        penilaianEditId =
            null;


        await loadPenilaianData();


    }catch(error){

        console.error(
            "savePenilaian:",
            error
        );

        alert(
            error.message
        );


    }finally{

        if(btn){

            btn.disabled =
                false;

            btn.innerHTML =
                originalHtml;
        }
    }
}


/* ==========================================================
 * EDIT
 * ==========================================================
 */

async function editPenilaian(id){

    const normalizedId =
        String(
            id || ""
        ).trim();


    /*
     * Cari data berdasarkan ID.
     */

    let item =
        penilaianList.find(
            function(row){

                return String(
                    row.id || ""
                ).trim() ===
                normalizedId;
            }
        );


    if(!item){

        alert(
            "Data penilaian tidak ditemukan."
        );

        return;
    }


    try{

        /*
         * ==================================================
         * PENTING
         * ==================================================
         *
         * Jangan pernah melakukan:
         *
         * penilaianEditId = id;
         * clearPenilaianForm();
         *
         * jika clearPenilaianForm menghapus ID.
         *
         * Sekarang clearPenilaianForm tidak menghapus ID,
         * tetapi kita tetap menggunakan urutan aman:
         *
         * clear → set ID.
         * ==================================================
         */

        clearPenilaianForm();


        penilaianEditId =
            normalizedId;


        /*
         * Isi header penilaian.
         */

        const anggota =
            document.getElementById(
                "anggotaPenilaian"
            );

        if(anggota){

            anggota.value =
                item.anggotaId;
        }


        const bulan =
            document.getElementById(
                "bulanPenilaian"
            );

        if(bulan){

            bulan.value =
                item.bulan;
        }


        const tahun =
            document.getElementById(
                "tahunPenilaian"
            );

        if(tahun){

            tahun.value =
                item.tahun;
        }


        const status =
            document.getElementById(
                "statusPenilaian"
            );

        if(status){

            status.value =
                item.status ||
                "Draft";
        }


        /*
         * Jika detail tidak tersedia,
         * ambil detail berdasarkan ID.
         */

        if(
            !Array.isArray(
                item.detail
            ) ||
            !item.detail.length
        ){

            const result =
                await API.getPenilaianById(
                    normalizedId
                );


            if(
                !result ||
                !result.success
            ){

                throw new Error(
                    result?.message ||
                    "Detail penilaian tidak dapat diambil."
                );
            }


            item =
                normalizePenilaianItem(
                    result.data ||
                    item
                );
        }


        /*
         * Render KPI.
         */

        renderPenilaianIndikator();


        /*
         * Masukkan nilai lama.
         */

        item.detail.forEach(
            function(detail){

                const kpiId =
                    String(
                        detail.kpiId ||
                        ""
                    ).trim();


                if(!kpiId) return;


                const input =
                    [...document.querySelectorAll(
                        ".nilaiKPI"
                    )]
                    .find(function(element){

                        return String(
                            element.dataset.id ||
                            ""
                        ).trim() ===
                        kpiId;
                    });


                if(input){

                    input.value =
                        Number(
                            detail.nilai || 0
                        );
                }
            }
        );


        /*
         * Hitung ulang.
         */

        hitungNilaiPenilaian();


        /*
         * Ubah judul modal.
         */

        const title =
            document.querySelector(
                "#penilaianModal .modal-title"
            );


        if(title){

            title.textContent =
                "Edit Penilaian";
        }


        /*
         * Tampilkan modal.
         */

        const modalElement =
            document.getElementById(
                "penilaianModal"
            );


        if(!modalElement){

            throw new Error(
                "Modal Penilaian tidak ditemukan."
            );
        }


        const modal =
            bootstrap.Modal.getInstance(
                modalElement
            ) ||
            new bootstrap.Modal(
                modalElement
            );


        modal.show();


    }catch(error){

        console.error(
            "editPenilaian:",
            error
        );


        penilaianEditId =
            null;


        alert(
            error.message
        );
    }
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

        const result =
            await API.deletePenilaian(
                id
            );


        if(
            !result ||
            !result.success
        ){

            throw new Error(
                result?.message ||
                "Gagal menghapus penilaian."
            );
        }


        alert(
            result.message ||
            "Penilaian berhasil dihapus."
        );


        await loadPenilaianData();


    }catch(error){

        console.error(
            "deletePenilaian:",
            error
        );

        alert(
            error.message
        );
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

    const search =
        document.getElementById(
            "searchPenilaian"
        );

    const filterBulan =
        document.getElementById(
            "filterBulan"
        );

    const filterTahun =
        document.getElementById(
            "filterTahun"
        );

    const filterStatus =
        document.getElementById(
            "filterStatusPenilaian"
        );


    const keyword =
        search
            ? search.value
                .toLowerCase()
                .trim()
            : "";


    const bulan =
        filterBulan
            ? filterBulan.value
            : "";


    const tahun =
        filterTahun
            ? filterTahun.value
            : "";


    const status =
        filterStatus
            ? filterStatus.value
            : "";


    const hasil =
        penilaianList.filter(
            function(item){

                const cocokNama =
                    String(
                        item.namaAnggota ||
                        ""
                    )
                    .toLowerCase()
                    .includes(
                        keyword
                    );


                const cocokBulan =
                    bulan === "" ||
                    String(
                        item.bulan
                    ) === bulan;


                const cocokTahun =
                    tahun === "" ||
                    String(
                        item.tahun
                    ) === tahun;


                const cocokStatus =
                    status === "" ||
                    String(
                        item.status
                    ) === status;


                return (
                    cocokNama &&
                    cocokBulan &&
                    cocokTahun &&
                    cocokStatus
                );
            }
        );


    renderPenilaianTable(
        hasil
    );
}


/* ==========================================================
 * RESET FILTER
 * ==========================================================
 */

function resetFilterPenilaian(){

    const search =
        document.getElementById(
            "searchPenilaian"
        );

    const bulan =
        document.getElementById(
            "filterBulan"
        );

    const tahun =
        document.getElementById(
            "filterTahun"
        );

    const status =
        document.getElementById(
            "filterStatusPenilaian"
        );


    if(search){

        search.value = "";
    }


    if(bulan){

        bulan.value = "";
    }


    if(tahun){

        tahun.value = "";
    }


    if(status){

        status.value = "";
    }


    renderPenilaianTable(
        penilaianList
    );
}
