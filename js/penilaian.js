/**
 * ==========================================================
 * Guardian KPI Web3
 * File : js/penilaian.js
 * Version : 7.0.0 FINAL
 * Module  : PENILAIAN
 * ==========================================================
 *
 * LOGIKA FINAL:
 *
 * 1. ID anggota bersifat PERSISTEN.
 *
 * 2. Penilaian bulan/tahun baru:
 *    - mencari ID terakhir anggota
 *    - backend menggunakan ID tersebut
 *    - membuat BARIS BARU
 *
 * 3. Kombinasi unik:
 *
 *       Anggota + Bulan + Tahun
 *
 * 4. ID boleh sama untuk bulan berbeda.
 *
 *    Contoh:
 *
 *       P0001 | BLES | Agustus  | 2026
 *       P0001 | BLES | September| 2026
 *       P0001 | BLES | Oktober  | 2026
 *
 * 5. Identitas BARIS:
 *
 *       ID + Bulan + Tahun
 *
 *    Contoh:
 *
 *       P0001|8|2026
 *       P0001|9|2026
 *
 * 6. Edit hanya mengubah baris yang sesuai.
 *
 * 7. Hapus hanya menghapus baris yang sesuai.
 *
 * 8. Backend tetap menjadi validasi final.
 *
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

/*
 * Nilai ini berisi ROW KEY ketika Edit.
 *
 * Contoh:
 *
 * P0001|8|2026
 *
 * BUKAN hanya:
 *
 * P0001
 */

let penilaianEditId = null;


/* ==========================================================
 * INIT
 * ==========================================================
 */

async function initPenilaian() {

    /*
     * Pastikan mode awal = BARU.
     */

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
 * LOAD TAHUN DINAMIS
 *
 * Tahun:
 * - Tidak dibatasi sampai 2028
 * - Tahun historis dari data tetap tersedia
 * - Tahun berjalan selalu tersedia
 * - Tahun berikutnya dibuat otomatis
 * ==========================================================
 */

function loadPenilaianTahun() {

    const filterSelect =
        document.getElementById(
            "filterTahun"
        );

    const formSelect =
        document.getElementById(
            "tahunPenilaian"
        );


    const currentYear =
        new Date().getFullYear();


    /*
     * ======================================================
     * KUMPULKAN TAHUN YANG SUDAH ADA
     * ======================================================
     */

    const existingYears =
        Array.isArray(
            penilaianList
        )
            ? penilaianList
                .map(function(item) {

                    return Number(
                        item.tahun
                    );

                })
                .filter(function(year) {

                    return (
                        Number.isInteger(year) &&
                        year >= 2000 &&
                        year <= 9999
                    );

                })
            : [];


    /*
     * Tahun pertama.
     *
     * Jika sudah ada data lama,
     * gunakan tahun paling awal.
     *
     * Jika belum ada data,
     * mulai dari tahun berjalan.
     */

    let startYear =
        existingYears.length
            ? Math.min(
                ...existingYears
            )
            : currentYear;


    /*
     * Jangan pernah membuat tahun
     * lebih kecil dari tahun berjalan
     * jika belum ada data historis.
     */

    if (
        !existingYears.length
    ) {

        startYear =
            currentYear;

    }


    /*
     * ======================================================
     * FILTER TAHUN
     * ======================================================
     *
     * Tambahkan tahun historis + tahun berjalan
     * + tahun mendatang.
     *
     * Future range dibuat dinamis.
     *
     * Tidak ada angka "2028" yang ditanam
     * dalam kode.
     */

    if (filterSelect) {

        const selectedValue =
            filterSelect.value;


        filterSelect.innerHTML = `
            <option value="">
                Semua Tahun
            </option>
        `;


        /*
         * Tampilkan tahun historis sampai
         * beberapa tahun ke depan.
         *
         * Setiap tahun aplikasi berjalan,
         * range ikut bergerak otomatis.
         */

        const futureYears =
            10;


        const endYear =
            Math.max(
                currentYear +
                futureYears,

                existingYears.length
                    ? Math.max(
                        ...existingYears
                    )
                    : currentYear
            );


        for (
            let year = startYear;
            year <= endYear;
            year++
        ) {

            filterSelect.innerHTML += `
                <option value="${year}">
                    ${year}
                </option>
            `;

        }


        /*
         * Kembalikan pilihan sebelumnya
         * jika masih tersedia.
         */

        if (
            selectedValue &&
            [...filterSelect.options]
                .some(function(option) {

                    return (
                        option.value ===
                        selectedValue
                    );

                })
        ) {

            filterSelect.value =
                selectedValue;

        }

    }


    /*
     * ======================================================
     * FORM PENILAIAN
     * ======================================================
     */

    if (formSelect) {

        const selectedValue =
            formSelect.value;


        formSelect.innerHTML =
            "";


        const futureYears =
            10;


        const endYear =
            Math.max(
                currentYear +
                futureYears,

                existingYears.length
                    ? Math.max(
                        ...existingYears
                    )
                    : currentYear
            );


        for (
            let year = startYear;
            year <= endYear;
            year++
        ) {

            formSelect.innerHTML += `
                <option
                    value="${year}"
                    ${
                        year === currentYear
                            ? "selected"
                            : ""
                    }
                >
                    ${year}
                </option>
            `;

        }


        /*
         * Jika sebelumnya sedang Edit,
         * pertahankan tahun yang sedang diedit.
         */

        if (
            selectedValue &&
            [...formSelect.options]
                .some(function(option) {

                    return (
                        option.value ===
                        selectedValue
                    );

                })
        ) {

            formSelect.value =
                selectedValue;

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


        if (
            !result ||
            !result.success
        ) {

            throw new Error(
                result?.message ||
                "Gagal mengambil data anggota."
            );
        }


        anggotaList =
            Array.isArray(
                result.data
            )
                ? result.data
                : [];


        const select =
            document.getElementById(
                "anggotaPenilaian"
            );


        if (!select) {
            return;
        }


        select.innerHTML = `
            <option value="">
                Pilih Anggota
            </option>
        `;


        anggotaList.forEach(
            function(item) {

                select.innerHTML += `
                    <option
                        value="${escapePenilaianHtml(
                            item.id
                        )}"
                    >
                        ${escapePenilaianHtml(
                            item.nama
                        )}
                    </option>
                `;
            }
        );


    }
    catch (err) {

        console.error(
            "loadPenilaianAnggota:",
            err
        );

        alert(
            err.message
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


        if (
            !result ||
            !result.success
        ) {

            throw new Error(
                result?.message ||
                "Gagal mengambil Master KPI."
            );
        }


        masterKPIList =
            (
                Array.isArray(
                    result.data
                )
                    ? result.data
                    : []
            )
            .filter(
                function(item) {

                    return (
                        String(
                            item.status || ""
                        )
                        .trim()
                        .toLowerCase() ===
                        "aktif"
                    );
                }
            );


    }
    catch (err) {

        console.error(
            "loadPenilaianMasterKPI:",
            err
        );

        alert(
            err.message
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


    if (!tbody) {
        return;
    }


    tbody.innerHTML = `
        <tr>
            <td
                colspan="8"
                class="text-center"
            >
                Memuat data...
            </td>
        </tr>
    `;


    try {

        const result =
            await API.getPenilaian();


        if (
            !result ||
            !result.success
        ) {

            throw new Error(
                result?.message ||
                "Gagal mengambil data penilaian."
            );
        }


        penilaianList =
            Array.isArray(
                result.data
            )
                ? result.data.map(
                    normalizePenilaianItem
                )
                : [];


        renderPenilaianTable(
            penilaianList
        );


    }
    catch (err) {

        console.error(
            "loadPenilaianData:",
            err
        );


        tbody.innerHTML = `
            <tr>
                <td
                    colspan="8"
                    class="text-danger text-center"
                >
                    ${escapePenilaianHtml(
                        err.message
                    )}
                </td>
            </tr>
        `;
    }

}


/* ==========================================================
 * NORMALIZE DATA
 * ==========================================================
 */

function normalizePenilaianItem(item) {

    item =
        item || {};


    let detail =
        item.detail ||
        [];


    /*
     * Detail dari Sheet biasanya JSON string.
     */

    if (
        typeof detail ===
        "string"
    ) {

        try {

            detail =
                JSON.parse(
                    detail
                );

        }
        catch (err) {

            detail = [];
        }
    }


    if (
        !Array.isArray(
            detail
        )
    ) {

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
                item.nilaiAkhir ??
                item.nilai ??
                item.total ??
                0
            ),

        total:
            Number(
                item.total ??
                item.nilaiAkhir ??
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
 * ROW KEY
 *
 * Identitas satu BARIS penilaian.
 *
 * Contoh:
 *
 * P0001|8|2026
 *
 * ==========================================================
 */

function getPenilaianRowKey(item) {

    return [

        String(
            item?.id || ""
        ).trim(),

        Number(
            item?.bulan || 0
        ),

        Number(
            item?.tahun || 0
        )

    ].join("|");

}


/* ==========================================================
 * PARSE ROW KEY
 * ==========================================================
 */

function parsePenilaianRowKey(key) {

    const parts =
        String(
            key || ""
        )
        .split("|");


    return {

        id:
            String(
                parts[0] || ""
            ).trim(),

        bulan:
            Number(
                parts[1] || 0
            ),

        tahun:
            Number(
                parts[2] || 0
            )
    };

}


/* ==========================================================
 * UNIQUE KEY
 *
 * Untuk mencegah:
 *
 * anggota + bulan + tahun
 *
 * ==========================================================
 */

function getPenilaianUniqueKey(
    anggotaId,
    bulan,
    tahun
) {

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
 * RENDER TABLE
 * ==========================================================
 */

function renderPenilaianTable(data) {

    const tbody =
        document.getElementById(
            "tblPenilaian"
        );


    if (!tbody) {
        return;
    }


    if (
        !Array.isArray(data) ||
        !data.length
    ) {

        tbody.innerHTML = `
            <tr>
                <td
                    colspan="8"
                    class="text-center"
                >
                    Belum ada data Penilaian.
                </td>
            </tr>
        `;

        return;
    }


    let html = "";


    data.forEach(
        function(item) {

            /*
             * Row key berbeda walaupun ID sama.
             */

            const rowKey =
                getPenilaianRowKey(
                    item
                );


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
                            namaBulan(
                                item.bulan
                            )
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
                                item.nilaiAkhir || 0
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
                            type="button"
                            class="btn btn-warning btn-sm"
                            onclick="editPenilaian('${escapePenilaianJs(rowKey)}')"
                            title="Edit"
                        >

                            <i class="bi bi-pencil"></i>

                        </button>

                        <button
                            type="button"
                            class="btn btn-danger btn-sm"
                            onclick="deletePenilaianConfirm('${escapePenilaianJs(rowKey)}')"
                            title="Hapus"
                        >

                            <i class="bi bi-trash"></i>

                        </button>

                    </td>

                </tr>
            `;
        }
    );


    tbody.innerHTML =
        html;

}


/* ==========================================================
 * BULAN
 * ==========================================================
 */

function namaBulan(bulan) {

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
        ] ||
        "-"
    );

}


/* ==========================================================
 * STATUS
 * ==========================================================
 */

function statusBadge(status) {

    if (
        String(
            status || ""
        )
        .trim()
        .toLowerCase() ===
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
 * ESCAPE HTML
 * ==========================================================
 */

function escapePenilaianHtml(value) {

    return String(
        value == null
            ? ""
            : value
    )
    .replace(
        /&/g,
        "&amp;"
    )
    .replace(
        /</g,
        "&lt;"
    )
    .replace(
        />/g,
        "&gt;"
    )
    .replace(
        /"/g,
        "&quot;"
    )
    .replace(
        /'/g,
        "&#039;"
    );

}


/* ==========================================================
 * ESCAPE JAVASCRIPT
 * ==========================================================
 */

function escapePenilaianJs(value) {

    return String(
        value == null
            ? ""
            : value
    )
    .replace(
        /\\/g,
        "\\\\"
    )
    .replace(
        /'/g,
        "\\'"
    )
    .replace(
        /\n/g,
        "\\n"
    )
    .replace(
        /\r/g,
        "\\r"
    );

}


/* ==========================================================
 * OPEN MODAL — PENILAIAN BARU
 * ==========================================================
 */

function openPenilaianModal() {

    /*
     * Mode BARU.
     */

    penilaianEditId =
        null;


    clearPenilaianForm();


    const anggota =
        document.getElementById(
            "anggotaPenilaian"
        );


    /*
     * Pastikan anggota bisa dipilih
     * kembali setelah sebelumnya Edit.
     */

    if (anggota) {

        anggota.disabled =
            false;
    }


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


    if (!modalElement) {

        alert(
            "Modal Penilaian tidak ditemukan."
        );

        return;
    }


    const modal =
        bootstrap.Modal.getInstance(
            modalElement
        ) ||
        new bootstrap.Modal(
            modalElement
        );


    modal.show();

}


/* ==========================================================
 * CLOSE MODAL
 * ==========================================================
 */

function closePenilaianModal() {

    const modalElement =
        document.getElementById(
            "penilaianModal"
        );


    if (!modalElement) {
        return;
    }


    const modal =
        bootstrap.Modal.getInstance(
            modalElement
        );


    if (modal) {

        modal.hide();
    }


    /*
     * Setelah modal ditutup,
     * mode Edit dibatalkan.
     */

    penilaianEditId =
        null;


    const anggota =
        document.getElementById(
            "anggotaPenilaian"
        );


    if (anggota) {

        anggota.disabled =
            false;
    }

}


/* ==========================================================
 * RENDER KPI
 * ==========================================================
 */

function renderPenilaianIndikator() {

    const container =
        document.getElementById(
            "listIndikator"
        );


    if (!container) {
        return;
    }


    if (
        !masterKPIList.length
    ) {

        container.innerHTML = `
            <div class="text-center text-secondary">
                Tidak ada Master KPI Aktif.
            </div>
        `;

        hitungNilaiPenilaian();

        return;
    }


    let html = "";


    masterKPIList.forEach(
        function(item) {

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
                            ${Number(
                                item.bobot || 0
                            )}%
                        </span>

                    </div>


                    <div class="col-md-5">

                        <input
                            type="number"
                            class="form-control nilaiKPI"
                            data-id="${escapePenilaianHtml(
                                item.id
                            )}"
                            data-bobot="${Number(
                                item.bobot || 0
                            )}"
                            value="100"
                            min="0"
                            max="100"
                            step="0.01"
                            oninput="hitungNilaiPenilaian()"
                        >

                    </div>

                </div>
            `;
        }
    );


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


    document
        .querySelectorAll(
            ".nilaiKPI"
        )
        .forEach(
            function(input) {

                const nilai =
                    Number(
                        input.value || 0
                    );


                const bobot =
                    Number(
                        input.dataset.bobot || 0
                    );


                if (
                    Number.isFinite(nilai) &&
                    Number.isFinite(bobot)
                ) {

                    total +=
                        nilai *
                        bobot /
                        100;
                }

            }
        );


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


    if (totalElement) {

        totalElement.value =
            total;
    }


    if (akhirElement) {

        akhirElement.value =
            total;
    }

}


/* ==========================================================
 * GET DETAIL KPI
 * ==========================================================
 */

function getPenilaianDetail() {

    const detail = [];


    document
        .querySelectorAll(
            ".nilaiKPI"
        )
        .forEach(
            function(input) {

                detail.push({

                    kpiId:
                        String(
                            input.dataset.id ||
                            ""
                        ).trim(),

                    bobot:
                        Number(
                            input.dataset.bobot ||
                            0
                        ),

                    nilai:
                        Number(
                            input.value ||
                            0
                        )
                });
            }
        );


    return detail;

}


/* ==========================================================
 * FIND DUPLICATE FRONTEND
 *
 * Unik berdasarkan:
 *
 * anggota + bulan + tahun
 *
 * ==========================================================
 */

function findDuplicatePenilaian(
    anggotaId,
    bulan,
    tahun,
    excludeRowKey
) {

    const targetKey =
        getPenilaianUniqueKey(
            anggotaId,
            bulan,
            tahun
        );


    const excluded =
        excludeRowKey
            ? parsePenilaianRowKey(
                excludeRowKey
            )
            : null;


    return (
        penilaianList.find(
            function(item) {

                /*
                 * Jika sedang Edit,
                 * abaikan baris yang sedang diedit.
                 */

                if (
                    excluded &&
                    String(
                        item.id || ""
                    ).trim() ===
                    excluded.id &&
                    Number(
                        item.bulan
                    ) ===
                    excluded.bulan &&
                    Number(
                        item.tahun
                    ) ===
                    excluded.tahun
                ) {

                    return false;
                }


                return (
                    getPenilaianUniqueKey(
                        item.anggotaId,
                        item.bulan,
                        item.tahun
                    ) ===
                    targetKey
                );
            }
        ) ||
        null
    );

}


/* ==========================================================
 * VALIDASI
 * ==========================================================
 */

function validatePenilaian() {

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


    /*
     * ANGGOTA
     */

    if (
        !anggota ||
        !String(
            anggota.value
        ).trim()
    ) {

        alert(
            "Pilih anggota."
        );

        return false;
    }


    /*
     * BULAN
     */

    const bulanValue =
        Number(
            bulan?.value
        );


    if (
        !Number.isInteger(
            bulanValue
        ) ||
        bulanValue < 1 ||
        bulanValue > 12
    ) {

        alert(
            "Bulan penilaian tidak valid."
        );

        return false;
    }


    /*
     * TAHUN
     */

    const tahunValue =
        Number(
            tahun?.value
        );


    if (
        !Number.isInteger(
            tahunValue
        ) ||
        tahunValue < 2000 ||
        tahunValue > 2100
    ) {

        alert(
            "Tahun penilaian tidak valid."
        );

        return false;
    }


    /*
     * MASTER KPI
     */

    if (
        !masterKPIList.length
    ) {

        alert(
            "Tidak ada Master KPI Aktif."
        );

        return false;
    }


    /*
     * DETAIL KPI
     */

    const detail =
        getPenilaianDetail();


    if (
        !detail.length
    ) {

        alert(
            "Belum ada indikator KPI."
        );

        return false;
    }


    /*
     * VALIDASI NILAI
     */

    for (
        let i = 0;
        i < detail.length;
        i++
    ) {

        const item =
            detail[i];


        if (
            !item.kpiId
        ) {

            alert(
                "ID KPI tidak valid."
            );

            return false;
        }


        if (
            !Number.isFinite(
                item.nilai
            ) ||
            item.nilai < 0 ||
            item.nilai > 100
        ) {

            alert(
                "Nilai KPI harus berada di antara 0 sampai 100."
            );

            return false;
        }


        if (
            !Number.isFinite(
                item.bobot
            ) ||
            item.bobot < 0
        ) {

            alert(
                "Bobot KPI tidak valid."
            );

            return false;
        }
    }


    /*
     * CEK DUPLIKASI
     */

    const duplicate =
        findDuplicatePenilaian(
            anggota.value,
            bulanValue,
            tahunValue,
            penilaianEditId
        );


    if (duplicate) {

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
            "Silakan gunakan Edit."
        );

        return false;
    }


    return true;

}


/* ==========================================================
 * CLEAR FORM
 *
 * PENTING:
 *
 * Fungsi ini TIDAK mengubah penilaianEditId.
 *
 * ==========================================================
 */

function clearPenilaianForm() {

    const anggota =
        document.getElementById(
            "anggotaPenilaian"
        );


    if (anggota) {

        anggota.value = "";

        /*
         * Ketika form dibersihkan,
         * anggota boleh dipilih.
         */

        anggota.disabled =
            false;
    }


    const bulan =
        document.getElementById(
            "bulanPenilaian"
        );


    if (bulan) {

        bulan.value =
            new Date().getMonth() + 1;
    }


    const tahun =
        document.getElementById(
            "tahunPenilaian"
        );


    if (tahun) {

        const currentYear =
            new Date().getFullYear();


        const exists =
            [...tahun.options]
            .some(
                function(option) {

                    return (
                        Number(
                            option.value
                        ) ===
                        currentYear
                    );
                }
            );


        if (exists) {

            tahun.value =
                currentYear;
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
            0;
    }


    const akhir =
        document.getElementById(
            "nilaiAkhir"
        );


    if (akhir) {

        akhir.value =
            0;
    }


    const container =
        document.getElementById(
            "listIndikator"
        );


    if (container) {

        container.innerHTML =
            "";
    }


    /*
     * JANGAN menulis:
     *
     * penilaianEditId = null;
     *
     * di sini.
     *
     * Karena fungsi ini juga dipakai
     * ketika Edit.
     */

}


/* ==========================================================
 * BUILD PAYLOAD
 * ==========================================================
 */

function buildPenilaianPayload() {

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

async function savePenilaian() {

    /*
     * Validasi sebelum request.
     */

    if (
        !validatePenilaian()
    ) {

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


    if (btn) {

        btn.disabled =
            true;


        btn.innerHTML = `
            <span
                class="spinner-border spinner-border-sm me-2">
            </span>

            Menyimpan...
        `;
    }


    try {

        let result;


        /*
         * ==================================================
         * MODE EDIT
         * ==================================================
         *
         * penilaianEditId:
         *
         * P0001|8|2026
         *
         */

        if (
            penilaianEditId
        ) {

            result =
                await API.updatePenilaian(
                    penilaianEditId,
                    data
                );
        }


        /*
         * ==================================================
         * MODE BARU
         * ==================================================
         */

        else {

            result =
                await API.savePenilaian(
                    data
                );
        }


        if (
            !result ||
            !result.success
        ) {

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


    }
    catch (err) {

        console.error(
            "savePenilaian:",
            err
        );


        alert(
            err.message
        );


    }
    finally {

        if (btn) {

            btn.disabled =
                false;

            btn.innerHTML =
                originalHtml;
        }
    }

}


/* ==========================================================
 * EDIT PENILAIAN
 *
 * Parameter:
 *
 * P0001|8|2026
 *
 * ==========================================================
 */

async function editPenilaian(rowKey) {

    const normalizedKey =
        String(
            rowKey || ""
        ).trim();


    if (!normalizedKey) {

        alert(
            "ID penilaian tidak valid."
        );

        return;
    }


    /*
     * Parse row key.
     */

    const parsed =
        parsePenilaianRowKey(
            normalizedKey
        );


    /*
     * Cari data berdasarkan:
     *
     * ID + Bulan + Tahun
     */

    let item =
        penilaianList.find(
            function(row) {

                return (
                    getPenilaianRowKey(
                        row
                    ) ===
                    normalizedKey
                );
            }
        );


    if (!item) {

        alert(
            "Data penilaian tidak ditemukan."
        );

        return;
    }


    try {

        /*
         * Bersihkan form.
         *
         * Fungsi ini tidak menghapus
         * penilaianEditId.
         */

        clearPenilaianForm();


        /*
         * SIMPAN ROW KEY.
         */

        penilaianEditId =
            normalizedKey;


        /*
         * Anggota.
         */

        const anggota =
            document.getElementById(
                "anggotaPenilaian"
            );


        if (anggota) {

            anggota.value =
                item.anggotaId;


            /*
             * ID anggota tidak boleh
             * diganti ketika Edit.
             */

            anggota.disabled =
                true;
        }


        /*
         * Bulan.
         */

        const bulan =
            document.getElementById(
                "bulanPenilaian"
            );


        if (bulan) {

            bulan.value =
                item.bulan;
        }


        /*
         * Tahun.
         */

        const tahun =
            document.getElementById(
                "tahunPenilaian"
            );


        if (tahun) {

            tahun.value =
                item.tahun;
        }


        /*
         * Status.
         */

        const status =
            document.getElementById(
                "statusPenilaian"
            );


        if (status) {

            status.value =
                item.status ||
                "Draft";
        }


        /*
         * Jika detail belum tersedia,
         * ambil dari backend.
         *
         * Backend versi baru harus
         * menerima row key.
         */

        if (
            !Array.isArray(
                item.detail
            ) ||
            !item.detail.length
        ) {

            const result =
                await API.getPenilaianById(
                    normalizedKey
                );


            if (
                !result ||
                !result.success
            ) {

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
         * Isi nilai lama.
         */

        item.detail.forEach(
            function(detail) {

                const kpiId =
                    String(
                        detail.kpiId ||
                        detail.id ||
                        ""
                    ).trim();


                if (!kpiId) {
                    return;
                }


                const input =
                    [
                        ...document.querySelectorAll(
                            ".nilaiKPI"
                        )
                    ]
                    .find(
                        function(element) {

                            return (
                                String(
                                    element.dataset.id ||
                                    ""
                                ).trim() ===
                                kpiId
                            );
                        }
                    );


                if (input) {

                    input.value =
                        Number(
                            detail.nilai ||
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
                "Edit Penilaian - " +
                namaBulan(
                    parsed.bulan
                ) +
                " " +
                parsed.tahun;
        }


        /*
         * Tampilkan modal.
         */

        const modalElement =
            document.getElementById(
                "penilaianModal"
            );


        if (!modalElement) {

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


    }
    catch (err) {

        console.error(
            "editPenilaian:",
            err
        );


        penilaianEditId =
            null;


        const anggota =
            document.getElementById(
                "anggotaPenilaian"
            );


        if (anggota) {

            anggota.disabled =
                false;
        }


        alert(
            err.message
        );
    }

}


/* ==========================================================
 * DELETE PENILAIAN
 *
 * Parameter:
 *
 * P0001|8|2026
 *
 * ==========================================================
 */

async function deletePenilaianConfirm(
    rowKey
) {

    const normalizedKey =
        String(
            rowKey || ""
        ).trim();


    const parsed =
        parsePenilaianRowKey(
            normalizedKey
        );


    const item =
        penilaianList.find(
            function(row) {

                return (
                    getPenilaianRowKey(
                        row
                    ) ===
                    normalizedKey
                );
            }
        );


    if (!item) {

        alert(
            "Data penilaian tidak ditemukan."
        );

        return;
    }


    const yakin =
        confirm(
            "Hapus penilaian " +
            item.namaAnggota +
            " untuk " +
            namaBulan(
                parsed.bulan
            ) +
            " " +
            parsed.tahun +
            "?"
        );


    if (!yakin) {
        return;
    }


    try {

        const result =
            await API.deletePenilaian(
                normalizedKey
            );


        if (
            !result ||
            !result.success
        ) {

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


    }
    catch (err) {

        console.error(
            "deletePenilaian:",
            err
        );


        alert(
            err.message
        );
    }

}


/* ==========================================================
 * REFRESH
 * ==========================================================
 */

async function refreshPenilaian() {

    /*
     * Kembali ke mode normal.
     */

    penilaianEditId =
        null;


    await initPenilaian();

}


/* ==========================================================
 * FILTER
 * ==========================================================
 */

function filterPenilaian() {

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
            function(item) {

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
        search.value = "";
    }


    if (bulan) {
        bulan.value = "";
    }


    if (tahun) {
        tahun.value = "";
    }


    if (status) {
        status.value = "";
    }


    renderPenilaianTable(
        penilaianList
    );

}


/* ==========================================================
 * EXPORT GLOBAL
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


window.clearPenilaianForm =
    clearPenilaianForm;


/* ==========================================================
 * END
 * ==========================================================
 */
