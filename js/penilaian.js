/**
 * ==========================================================
 * GUARDIAN KPI WEB3
 * File     : js/penilaian.js
 * Version  : 6.0.0 FINAL
 * Purpose  : CRUD Penilaian KPI
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

async function initPenilaian() {

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

function loadPenilaianTahun() {

    const filterTahun =
        document.getElementById("filterTahun");

    const tahunPenilaian =
        document.getElementById("tahunPenilaian");

    const tahunSekarang =
        new Date().getFullYear();

    /* FILTER TAHUN */

    if (filterTahun) {

        filterTahun.innerHTML =
            `<option value="">Semua Tahun</option>`;

        for (
            let tahun = tahunSekarang - 2;
            tahun <= tahunSekarang + 2;
            tahun++
        ) {

            filterTahun.innerHTML +=
                `<option value="${tahun}">
                    ${tahun}
                </option>`;

        }

    }


    /* FORM TAHUN */

    if (tahunPenilaian) {

        tahunPenilaian.innerHTML = "";

        for (
            let tahun = tahunSekarang - 2;
            tahun <= tahunSekarang + 2;
            tahun++
        ) {

            tahunPenilaian.innerHTML +=
                `<option
                    value="${tahun}"
                    ${tahun === tahunSekarang ? "selected" : ""}
                >
                    ${tahun}
                </option>`;

        }

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

        if (!result || !result.success) {

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

        if (!select) return;

        select.innerHTML =
            `<option value="">
                Pilih Anggota
            </option>`;

        anggotaList.forEach(function (item) {

            if (!item || !item.id) return;

            const option =
                document.createElement("option");

            option.value =
                item.id;

            option.textContent =
                item.nama || item.name || item.id;

            select.appendChild(option);

        });

    }

    catch (error) {

        console.error(
            "loadPenilaianAnggota:",
            error
        );

        alert(
            error.message ||
            "Gagal mengambil data anggota."
        );

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

        if (!result || !result.success) {

            throw new Error(
                result?.message ||
                "Gagal mengambil Master KPI."
            );

        }

        masterKPIList =
            Array.isArray(result.data)
                ? result.data.filter(function (item) {

                    return String(
                        item.status || ""
                    )
                        .trim()
                        .toLowerCase() === "aktif";

                })
                : [];

    }

    catch (error) {

        console.error(
            "loadPenilaianMasterKPI:",
            error
        );

        alert(
            error.message ||
            "Gagal mengambil Master KPI."
        );

    }

}


/* ==========================================================
 * LOAD DATA PENILAIAN
 * ==========================================================
 */

async function loadPenilaianData() {

    const tbody =
        document.getElementById(
            "tblPenilaian"
        );

    if (!tbody) return;

    tbody.innerHTML =
        `<tr>
            <td
                colspan="8"
                class="text-center"
            >
                Memuat data...
            </td>
        </tr>`;

    try {

        const result =
            await API.getPenilaian();

        if (!result || !result.success) {

            throw new Error(
                result?.message ||
                "Gagal mengambil data Penilaian."
            );

        }

        penilaianList =
            Array.isArray(result.data)
                ? result.data
                : [];

        renderPenilaianTable(
            penilaianList
        );

    }

    catch (error) {

        console.error(
            "loadPenilaianData:",
            error
        );

        tbody.innerHTML =
            `<tr>
                <td
                    colspan="8"
                    class="text-danger text-center"
                >
                    ${escapeHTML(
                        error.message ||
                        "Gagal mengambil data."
                    )}
                </td>
            </tr>`;

    }

}


/* ==========================================================
 * ESCAPE HTML
 * ==========================================================
 */

function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* ==========================================================
 * RENDER TABLE
 * ==========================================================
 */

function renderPenilaianTable(data) {

    const tbody =
        document.getElementById(
            "tblPenilaian"
        );

    if (!tbody) return;

    if (!Array.isArray(data) || !data.length) {

        tbody.innerHTML =
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

    let html = "";

    data.forEach(function (item) {

        const id =
            item.id || "";

        const nama =
            item.namaAnggota ||
            item.nama ||
            item.anggotaNama ||
            "-";

        const group =
            item.group ||
            item.namaGroup ||
            item.groupNama ||
            "-";

        const bulan =
            item.bulan;

        const tahun =
            item.tahun || "";

        const nilai =
            Number(
                item.nilaiAkhir ??
                item.nilai ??
                0
            );

        const status =
            String(
                item.status || "Draft"
            );

        html +=
            `<tr>

                <td>
                    ${escapeHTML(id)}
                </td>

                <td>
                    ${escapeHTML(nama)}
                </td>

                <td>
                    ${escapeHTML(group)}
                </td>

                <td>
                    ${escapeHTML(
                        namaBulan(bulan)
                    )}
                </td>

                <td>
                    ${escapeHTML(tahun)}
                </td>

                <td>
                    <span class="badge bg-success">
                        ${nilai.toFixed(2)}
                    </span>
                </td>

                <td>
                    ${statusBadge(status)}
                </td>

                <td>

                    <button
                        type="button"
                        class="btn btn-warning btn-sm"
                        title="Edit"
                        onclick="editPenilaian('${escapeJS(id)}')"
                    >
                        <i class="bi bi-pencil"></i>
                    </button>

                    <button
                        type="button"
                        class="btn btn-danger btn-sm"
                        title="Hapus"
                        onclick="deletePenilaianConfirm('${escapeJS(id)}')"
                    >
                        <i class="bi bi-trash"></i>
                    </button>

                </td>

            </tr>`;

    });

    tbody.innerHTML =
        html;

}


/* ==========================================================
 * ESCAPE JAVASCRIPT VALUE
 * ==========================================================
 */

function escapeJS(value) {

    return String(value ?? "")
        .replace(/\\/g, "\\\\")
        .replace(/'/g, "\\'")
        .replace(/"/g, '\\"')
        .replace(/\r/g, "\\r")
        .replace(/\n/g, "\\n");

}


/* ==========================================================
 * NAMA BULAN
 * ==========================================================
 */

function namaBulan(bulan) {

    const daftarBulan = [

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
        daftarBulan[
            Number(bulan)
        ] || "-"
    );

}


/* ==========================================================
 * STATUS BADGE
 * ==========================================================
 */

function statusBadge(status) {

    const value =
        String(status || "Draft")
            .trim();

    if (
        value.toLowerCase() ===
        "final"
    ) {

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
 * OPEN MODAL PENILAIAN BARU
 * ==========================================================
 */

function openPenilaianModal() {

    /*
     * PENTING:
     * Penilaian Baru selalu NULL.
     */

    penilaianEditId = null;

    clearPenilaianForm();

    renderPenilaianIndikator();

    const title =
        document.querySelector(
            "#penilaianModal .modal-title"
        );

    if (title) {

        title.textContent =
            "Penilaian Baru";

    }

    const modalElement =
        document.getElementById(
            "penilaianModal"
        );

    if (!modalElement) return;

    const modal =
        bootstrap.Modal.getOrCreateInstance(
            modalElement
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

    if (!element) return;

    const modal =
        bootstrap.Modal.getInstance(
            element
        );

    if (modal) {

        modal.hide();

    }

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

    if (!masterKPIList.length) {

        container.innerHTML =
            `<div
                class="text-center text-secondary"
            >
                Tidak ada Master KPI Aktif.
            </div>`;

        return;

    }

    let html = "";

    masterKPIList.forEach(function (item) {

        const id =
            item.id || "";

        const indicator =
            item.indicator ||
            item.nama_kpi ||
            item.nama ||
            "-";

        const kategori =
            item.kategori ||
            "-";

        const bobot =
            Number(
                item.bobot || 0
            );

        html +=
            `<div
                class="row mb-3 border-bottom pb-2"
            >

                <div class="col-md-5">

                    <strong>
                        ${escapeHTML(
                            indicator
                        )}
                    </strong>

                    <br>

                    <small class="text-info">
                        ${escapeHTML(
                            kategori
                        )}
                    </small>

                </div>

                <div
                    class="col-md-2 text-center"
                >

                    <span class="badge bg-info">
                        ${bobot}%
                    </span>

                </div>

                <div class="col-md-5">

                    <input
                        type="number"
                        class="form-control nilaiKPI"
                        data-id="${escapeHTML(id)}"
                        data-bobot="${bobot}"
                        value="100"
                        min="0"
                        max="100"
                        step="0.01"
                        onchange="hitungNilaiPenilaian()"
                    >

                </div>

            </div>`;

    });

    container.innerHTML =
        html;

    hitungNilaiPenilaian();

}


/* ==========================================================
 * HITUNG NILAI
 * ==========================================================
 */

function hitungNilaiPenilaian() {

    let total = 0;

    const inputs =
        document.querySelectorAll(
            ".nilaiKPI"
        );

    inputs.forEach(function (input) {

        let nilai =
            Number(
                input.value || 0
            );

        let bobot =
            Number(
                input.dataset.bobot || 0
            );

        if (!Number.isFinite(nilai)) {
            nilai = 0;
        }

        if (!Number.isFinite(bobot)) {
            bobot = 0;
        }

        total +=
            nilai *
            bobot /
            100;

    });

    total =
        Number(
            total.toFixed(2)
        );

    const totalInput =
        document.getElementById(
            "totalNilai"
        );

    const akhirInput =
        document.getElementById(
            "nilaiAkhir"
        );

    if (totalInput) {

        totalInput.value =
            total.toFixed(2);

    }

    if (akhirInput) {

        akhirInput.value =
            total.toFixed(2);

    }

}


/* ==========================================================
 * AMBIL DETAIL KPI
 * ==========================================================
 */

function getPenilaianDetail() {

    const detail = [];

    const inputs =
        document.querySelectorAll(
            ".nilaiKPI"
        );

    inputs.forEach(function (input) {

        const kpiId =
            input.dataset.id || "";

        const bobot =
            Number(
                input.dataset.bobot || 0
            );

        const nilai =
            Number(
                input.value || 0
            );

        detail.push({

            kpiId: kpiId,

            bobot: bobot,

            nilai: nilai

        });

    });

    return detail;

}


/* ==========================================================
 * NORMALIZE FIELD
 * ==========================================================
 */

function getAnggotaId(item) {

    return String(
        item?.anggotaId ??
        item?.anggota_id ??
        item?.anggotaID ??
        item?.memberId ??
        ""
    ).trim();

}

function getBulan(item) {

    return Number(
        item?.bulan ??
        item?.month ??
        0
    );

}

function getTahun(item) {

    return Number(
        item?.tahun ??
        item?.year ??
        0
    );

}


/* ==========================================================
 * CEK DUPLIKASI
 *
 * ATURAN:
 * 1 anggota
 * + 1 bulan
 * + 1 tahun
 * = 1 penilaian
 *
 * Record yang sedang diedit dikecualikan.
 * ==========================================================
 */

function isDuplicatePenilaian(data) {

    const anggotaId =
        String(
            data?.anggotaId || ""
        ).trim();

    const bulan =
        Number(
            data?.bulan || 0
        );

    const tahun =
        Number(
            data?.tahun || 0
        );

    return penilaianList.some(
        function (item) {

            const itemId =
                String(
                    item?.id || ""
                ).trim();

            const editId =
                String(
                    penilaianEditId || ""
                ).trim();

            /*
             * JANGAN membandingkan record
             * dengan dirinya sendiri.
             */

            if (
                editId &&
                itemId === editId
            ) {

                return false;

            }

            return (

                getAnggotaId(item) ===
                anggotaId

                &&

                getBulan(item) ===
                bulan

                &&

                getTahun(item) ===
                tahun

            );

        }
    );

}


/* ==========================================================
 * VALIDASI
 * ==========================================================
 */

function validatePenilaian(data) {

    const anggota =
        document.getElementById(
            "anggotaPenilaian"
        );

    if (
        !anggota ||
        !anggota.value
    ) {

        alert(
            "Pilih anggota terlebih dahulu."
        );

        return false;

    }


    const bulan =
        Number(
            data?.bulan
        );

    const tahun =
        Number(
            data?.tahun
        );


    if (
        !Number.isInteger(bulan) ||
        bulan < 1 ||
        bulan > 12
    ) {

        alert(
            "Bulan penilaian tidak valid."
        );

        return false;

    }


    if (
        !Number.isInteger(tahun) ||
        tahun < 2000
    ) {

        alert(
            "Tahun penilaian tidak valid."
        );

        return false;

    }


    const detail =
        getPenilaianDetail();


    if (!detail.length) {

        alert(
            "Belum ada indikator KPI."
        );

        return false;

    }


    for (
        const item of detail
    ) {

        if (
            !Number.isFinite(
                item.nilai
            )
            ||
            item.nilai < 0
            ||
            item.nilai > 100
        ) {

            alert(
                "Nilai KPI harus berada antara 0 sampai 100."
            );

            return false;

        }

    }


    /*
     * CEK DUPLIKASI
     */

    if (
        isDuplicatePenilaian(
            data
        )
    ) {

        alert(
            "Penilaian untuk anggota, bulan, dan tahun tersebut sudah ada. Gunakan tombol Edit untuk memperbarui data yang sudah ada."
        );

        return false;

    }


    return true;

}


/* ==========================================================
 * CLEAR FORM
 *
 * PENTING:
 * Fungsi ini TIDAK mengubah penilaianEditId.
 *
 * Ini adalah perbaikan utama bug.
 * ==========================================================
 */

function clearPenilaianForm() {

    const anggota =
        document.getElementById(
            "anggotaPenilaian"
        );

    if (anggota) {

        anggota.value =
            "";

    }


    const bulan =
        document.getElementById(
            "bulanPenilaian"
        );

    if (bulan) {

        bulan.value =
            String(
                new Date().getMonth() + 1
            );

    }


    const tahun =
        document.getElementById(
            "tahunPenilaian"
        );

    if (tahun) {

        const tahunSekarang =
            new Date().getFullYear();

        if (
            [...tahun.options]
                .some(
                    option =>
                        option.value ===
                        String(tahunSekarang)
                )
        ) {

            tahun.value =
                String(
                    tahunSekarang
                );

        }

    }


    const status =
        document.getElementById(
            "statusPenilaian"
        );

    if (status) {

        status.value =
            "Draft";

    }


    const total =
        document.getElementById(
            "totalNilai"
        );

    if (total) {

        total.value =
            "0.00";

    }


    const akhir =
        document.getElementById(
            "nilaiAkhir"
        );

    if (akhir) {

        akhir.value =
            "0.00";

    }

}


/* ==========================================================
 * SAVE / UPDATE PENILAIAN
 *
 * INI BAGIAN PALING PENTING
 *
 * Jika penilaianEditId ada:
 *      UPDATE
 *
 * Jika penilaianEditId kosong:
 *      INSERT
 * ==========================================================
 */

async function savePenilaian() {

    const anggotaElement =
        document.getElementById(
            "anggotaPenilaian"
        );

    const bulanElement =
        document.getElementById(
            "bulanPenilaian"
        );

    const tahunElement =
        document.getElementById(
            "tahunPenilaian"
        );

    const statusElement =
        document.getElementById(
            "statusPenilaian"
        );

    const totalElement =
        document.getElementById(
            "totalNilai"
        );

    const akhirElement =
        document.getElementById(
            "nilaiAkhir"
        );


    if (
        !anggotaElement ||
        !bulanElement ||
        !tahunElement ||
        !statusElement
    ) {

        alert(
            "Form Penilaian tidak lengkap."
        );

        return;

    }


    const data = {

        anggotaId:
            String(
                anggotaElement.value || ""
            ).trim(),

        bulan:
            Number(
                bulanElement.value
            ),

        tahun:
            Number(
                tahunElement.value
            ),

        status:
            String(
                statusElement.value ||
                "Draft"
            ),

        total:
            Number(
                totalElement?.value || 0
            ),

        nilaiAkhir:
            Number(
                akhirElement?.value || 0
            ),

        detail:
            getPenilaianDetail()

    };


    /*
     * VALIDASI
     */

    if (
        !validatePenilaian(
            data
        )
    ) {

        return;

    }


    const button =
        document.getElementById(
            "btnSavePenilaian"
        );


    const originalHTML =
        button
            ? button.innerHTML
            : "";


    if (button) {

        button.disabled =
            true;

        button.innerHTML =
            `
                <span
                    class="spinner-border spinner-border-sm me-2"
                ></span>
                Menyimpan...
            `;

    }


    try {

        let result;


        /*
         * ==================================================
         * EDIT
         * ==================================================
         */

        if (
            penilaianEditId !== null &&
            String(
                penilaianEditId
            ).trim() !== ""
        ) {

            console.log(
                "PENILAIAN MODE: UPDATE"
            );

            console.log(
                "UPDATE ID:",
                penilaianEditId
            );

            console.log(
                "UPDATE DATA:",
                data
            );


            result =
                await API.updatePenilaian(

                    penilaianEditId,

                    data

                );

        }


        /*
         * ==================================================
         * BARU
         * ==================================================
         */

        else {

            console.log(
                "PENILAIAN MODE: INSERT"
            );

            console.log(
                "INSERT DATA:",
                data
            );


            result =
                await API.savePenilaian(

                    data

                );

        }


        /*
         * ==================================================
         * HASIL API
         * ==================================================
         */

        if (
            !result ||
            !result.success
        ) {

            throw new Error(
                result?.message ||
                "Gagal menyimpan Penilaian."
            );

        }


        alert(
            result.message ||
            "Penilaian berhasil disimpan."
        );


        /*
         * RESET EDIT ID
         * HANYA setelah berhasil.
         */

        penilaianEditId =
            null;


        closePenilaianModal();


        /*
         * Ambil ulang data
         */

        await loadPenilaianData();


    }

    catch (error) {

        console.error(
            "savePenilaian:",
            error
        );

        alert(
            error.message ||
            "Terjadi kesalahan saat menyimpan."
        );

    }

    finally {

        if (button) {

            button.disabled =
                false;

            button.innerHTML =
                originalHTML;

        }

    }

}


/* ==========================================================
 * EDIT PENILAIAN
 * ==========================================================
 */

async function editPenilaian(id) {

    console.log(
        "EDIT PENILAIAN ID:",
        id
    );


    /*
     * Cari data dari data yang sudah dimuat.
     */

    let item =
        penilaianList.find(
            function (row) {

                return (
                    String(
                        row?.id || ""
                    )
                    ===
                    String(id)
                );

            }
        );


    /*
     * Kalau tidak ditemukan,
     * coba ambil langsung dari API.
     */

    if (!item) {

        try {

            const result =
                await API.getPenilaianById(
                    id
                );

            if (
                result &&
                result.success &&
                result.data
            ) {

                item =
                    Array.isArray(
                        result.data
                    )
                        ? result.data[0]
                        : result.data;

            }

        }

        catch (error) {

            console.error(
                "getPenilaianById:",
                error
            );

        }

    }


    if (!item) {

        alert(
            "Data Penilaian tidak ditemukan."
        );

        return;

    }


    /*
     * ==================================================
     * PENTING
     *
     * Set ID setelah clear form.
     * ==================================================
     */

    clearPenilaianForm();


    penilaianEditId =
        id;


    console.log(
        "EDIT MODE AKTIF:",
        penilaianEditId
    );


    /*
     * ANGGOTA
     */

    const anggota =
        document.getElementById(
            "anggotaPenilaian"
        );

    if (anggota) {

        anggota.value =
            getAnggotaId(item);

    }


    /*
     * BULAN
     */

    const bulan =
        document.getElementById(
            "bulanPenilaian"
        );

    if (bulan) {

        bulan.value =
            String(
                getBulan(item)
            );

    }


    /*
     * TAHUN
     */

    const tahun =
        document.getElementById(
            "tahunPenilaian"
        );

    if (tahun) {

        tahun.value =
            String(
                getTahun(item)
            );

    }


    /*
     * STATUS
     */

    const status =
        document.getElementById(
            "statusPenilaian"
        );

    if (status) {

        status.value =
            String(
                item.status ||
                "Draft"
            );

    }


    /*
     * Render semua KPI
     */

    renderPenilaianIndikator();


    /*
     * Isi nilai KPI lama.
     */

    const detail =
        Array.isArray(
            item.detail
        )
            ? item.detail
            : [];


    detail.forEach(
        function (detailItem) {

            const kpiId =
                String(
                    detailItem.kpiId ??
                    detailItem.kpi_id ??
                    detailItem.id ??
                    ""
                );


            const input =
                document.querySelector(
                    `.nilaiKPI[data-id="${CSS.escape(kpiId)}"]`
                );


            if (input) {

                input.value =
                    Number(
                        detailItem.nilai ??
                        0
                    );

            }

        }
    );


    /*
     * Hitung ulang.
     */

    hitungNilaiPenilaian();


    /*
     * Judul modal.
     */

    const title =
        document.querySelector(
            "#penilaianModal .modal-title"
        );

    if (title) {

        title.textContent =
            "Edit Penilaian";

    }


    /*
     * Tampilkan modal.
     */

    const element =
        document.getElementById(
            "penilaianModal"
        );

    if (!element) {

        alert(
            "Modal Penilaian tidak ditemukan."
        );

        return;

    }


    const modal =
        bootstrap.Modal.getOrCreateInstance(
            element
        );

    modal.show();

}


/* ==========================================================
 * DELETE
 * ==========================================================
 */

async function deletePenilaianConfirm(id) {

    const item =
        penilaianList.find(
            function (row) {

                return (
                    String(
                        row?.id || ""
                    )
                    ===
                    String(id)
                );

            }
        );


    const nama =
        item?.namaAnggota ||
        item?.nama ||
        "anggota ini";


    if (
        !confirm(
            `Hapus penilaian ${nama}?`
        )
    ) {

        return;

    }


    try {

        const result =
            await API.deletePenilaian(
                id
            );


        if (
            !result ||
            !result.success
        ) {

            throw new Error(
                result?.message ||
                "Gagal menghapus Penilaian."
            );

        }


        alert(
            result.message ||
            "Penilaian berhasil dihapus."
        );


        await loadPenilaianData();

    }

    catch (error) {

        console.error(
            "deletePenilaian:",
            error
        );

        alert(
            error.message ||
            "Gagal menghapus Penilaian."
        );

    }

}


/* ==========================================================
 * REFRESH
 * ==========================================================
 */

async function refreshPenilaian() {

    await initPenilaian();

}


/* ==========================================================
 * FILTER
 * ==========================================================
 */

function filterPenilaian() {

    const searchElement =
        document.getElementById(
            "searchPenilaian"
        );

    const bulanElement =
        document.getElementById(
            "filterBulan"
        );

    const tahunElement =
        document.getElementById(
            "filterTahun"
        );

    const statusElement =
        document.getElementById(
            "filterStatusPenilaian"
        );


    const keyword =
        String(
            searchElement?.value || ""
        )
            .toLowerCase()
            .trim();


    const bulan =
        String(
            bulanElement?.value || ""
        );


    const tahun =
        String(
            tahunElement?.value || ""
        );


    const status =
        String(
            statusElement?.value || ""
        );


    const hasil =
        penilaianList.filter(
            function (item) {

                const nama =
                    String(
                        item?.namaAnggota ||
                        item?.nama ||
                        ""
                    )
                        .toLowerCase();


                const cocokNama =
                    !keyword ||
                    nama.includes(
                        keyword
                    );


                const cocokBulan =
                    !bulan ||
                    String(
                        getBulan(item)
                    ) === bulan;


                const cocokTahun =
                    !tahun ||
                    String(
                        getTahun(item)
                    ) === tahun;


                const cocokStatus =
                    !status ||
                    String(
                        item?.status || ""
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

function resetFilterPenilaian() {

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


    if (search) {

        search.value =
            "";

    }


    if (bulan) {

        bulan.value =
            "";

    }


    if (tahun) {

        tahun.value =
            "";

    }


    if (status) {

        status.value =
            "";

    }


    renderPenilaianTable(
        penilaianList
    );

}


/* ==========================================================
 * GLOBAL EXPORT
 * ==========================================================
 */

window.initPenilaian =
    initPenilaian;

window.openPenilaianModal =
    openPenilaianModal;

window.closePenilaianModal =
    closePenilaianModal;

window.savePenilaian =
    savePenilaian;

window.editPenilaian =
    editPenilaian;

window.deletePenilaianConfirm =
    deletePenilaianConfirm;

window.loadPenilaianData =
    loadPenilaianData;

window.refreshPenilaian =
    refreshPenilaian;

window.renderPenilaianTable =
    renderPenilaianTable;

window.renderPenilaianIndikator =
    renderPenilaianIndikator;

window.hitungNilaiPenilaian =
    hitungNilaiPenilaian;

window.filterPenilaian =
    filterPenilaian;

window.resetFilterPenilaian =
    resetFilterPenilaian;

window.getPenilaianDetail =
    getPenilaianDetail;

window.isDuplicatePenilaian =
    isDuplicatePenilaian;

window.clearPenilaianForm =
    clearPenilaianForm;
