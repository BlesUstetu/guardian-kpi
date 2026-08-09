/**
 * ==========================================================
 * GUARDIAN KPI WEB3
 * File    : js/penilaian.js
 * Version : 6.0.0 FINAL
 *
 * ATURAN FINAL PENILAIAN
 * ----------------------------------------------------------
 * 1. ID Anggota + Nama = identitas tetap.
 * 2. Satu anggota boleh memiliki banyak periode.
 * 3. Periode dibedakan berdasarkan:
 *       ID Anggota + Bulan + Tahun
 * 4. Kombinasi yang sama tidak boleh duplikat.
 * 5. Edit = UPDATE record lama.
 * 6. Penilaian Baru = INSERT record baru.
 * 7. ID record penilaian internal tidak ditampilkan
 *    sebagai ID anggota.
 * 8. Kolom ID tabel menampilkan ID Anggota.
 * 9. Draft dapat diedit.
 * 10. Final dikunci.
 * ==========================================================
 */

"use strict";


/* ==========================================================
 * GLOBAL STATE
 * ==========================================================
 */

let penilaianList = [];
let penilaianAnggotaList = [];
let penilaianMasterKPIList = [];

/*
 * Ini adalah ID RECORD PENILAIAN yang sedang diedit.
 *
 * BUKAN ID ANGGOTA.
 *
 * Contoh:
 *
 * anggota:
 * S0004 = BLES
 *
 * record:
 * P0001 = penilaian BLES Agustus 2026
 *
 * Saat edit:
 * penilaianEditId = P0001
 */
let penilaianEditId = null;


/*
 * Mode modal:
 *
 * NEW  = Penilaian Baru
 * EDIT = Edit Penilaian
 */
let penilaianMode = "NEW";


/* ==========================================================
 * KONFIGURASI
 * ==========================================================
 */

const PENILAIAN_VERSION =
    "6.0.0 FINAL";


const NAMA_BULAN = [
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


/* ==========================================================
 * INIT
 * ==========================================================
 */

async function initPenilaian() {

    console.log(
        "=========================================="
    );

    console.log(
        "Guardian KPI Penilaian " +
        PENILAIAN_VERSION
    );

    console.log(
        "Penilaian init()"
    );


    /*
     * Pastikan mode baru.
     */

    penilaianMode = "NEW";

    penilaianEditId = null;


    /*
     * Tahun form.
     */

    loadPenilaianTahun();


    /*
     * Reset form.
     */

    clearPenilaianForm();


    /*
     * Load semua data.
     */

    await Promise.all([
        loadPenilaianAnggota(),
        loadPenilaianMasterKPI(),
        loadPenilaianData()
    ]);


    /*
     * Filter tahun.
     */

    loadFilterTahun();


    console.log(
        "Penilaian init selesai."
    );

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

        if (
            typeof API === "undefined"
            ||
            typeof API.getPenilaian !==
            "function"
        ) {

            throw new Error(
                "API.getPenilaian tidak tersedia."
            );

        }


        const result =
            await API.getPenilaian();


        console.log(
            "Penilaian API Response:",
            result
        );


        if (!result) {

            throw new Error(
                "Response Penilaian kosong."
            );

        }


        if (
            result.success === false
        ) {

            throw new Error(
                result.message ||
                "Gagal mengambil data Penilaian."
            );

        }


        let data =
            result.data;


        /*
         * Support:
         *
         * result.data
         *
         * atau
         *
         * result.data.data
         */

        if (
            data &&
            data.data &&
            typeof data.data ===
            "object"
        ) {

            data =
                data.data;

        }


        penilaianList =
            Array.isArray(data)
                ? data
                : [];


        console.log(
            "Penilaian Data:",
            penilaianList
        );


        renderPenilaianTable(
            penilaianList
        );

    }

    catch (error) {

        console.error(
            "loadPenilaianData:",
            error
        );


        tbody.innerHTML = `
            <tr>
                <td
                    colspan="8"
                    class="text-danger text-center"
                >
                    ${escapeHTML(
                        error.message ||
                        "Gagal mengambil data Penilaian."
                    )}
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

        if (
            typeof API === "undefined"
            ||
            typeof API.getAnggota !==
            "function"
        ) {

            throw new Error(
                "API.getAnggota tidak tersedia."
            );

        }


        const result =
            await API.getAnggota();


        if (
            !result ||
            result.success === false
        ) {

            throw new Error(
                result?.message ||
                "Gagal mengambil data anggota."
            );

        }


        let data =
            result.data;


        if (
            data &&
            data.data &&
            typeof data.data ===
            "object"
        ) {

            data =
                data.data;

        }


        penilaianAnggotaList =
            Array.isArray(data)
                ? data
                : [];


        renderAnggotaSelect();


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
 * RENDER SELECT ANGGOTA
 * ==========================================================
 */

function renderAnggotaSelect() {

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


    penilaianAnggotaList.forEach(
        function(item) {

            if (!item) {

                return;

            }


            const id =
                getAnggotaId(item);


            const nama =
                getAnggotaNama(item);


            if (!id) {

                return;

            }


            const option =
                document.createElement(
                    "option"
                );


            option.value =
                id;


            option.textContent =
                id +
                " — " +
                nama;


            select.appendChild(
                option
            );

        }
    );

}


/* ==========================================================
 * LOAD TAHUN
 * ==========================================================
 */

function loadPenilaianTahun() {

    const select =
        document.getElementById(
            "tahunPenilaian"
        );


    if (!select) {

        return;

    }


    const tahunSekarang =
        new Date().getFullYear();


    select.innerHTML = "";


    for (
        let tahun =
            tahunSekarang - 2;

        tahun <=
            tahunSekarang + 2;

        tahun++
    ) {

        const option =
            document.createElement(
                "option"
            );


        option.value =
            String(tahun);


        option.textContent =
            String(tahun);


        if (
            tahun ===
            tahunSekarang
        ) {

            option.selected =
                true;

        }


        select.appendChild(
            option
        );

    }

}


/* ==========================================================
 * LOAD FILTER TAHUN
 * ==========================================================
 */

function loadFilterTahun() {

    const select =
        document.getElementById(
            "filterTahun"
        );


    if (!select) {

        return;

    }


    const tahunSekarang =
        new Date().getFullYear();


    select.innerHTML = `
        <option value="">
            Semua Tahun
        </option>
    `;


    /*
     * Ambil tahun dari data
     * agar filter mengikuti data
     * yang benar-benar ada.
     */

    const tahunSet =
        new Set();


    penilaianList.forEach(
        function(item) {

            const tahun =
                getTahun(item);


            if (tahun) {

                tahunSet.add(
                    tahun
                );

            }

        }
    );


    /*
     * Jika belum ada data,
     * tetap tampilkan beberapa tahun.
     */

    if (
        tahunSet.size === 0
    ) {

        for (
            let tahun =
                tahunSekarang - 2;

            tahun <=
                tahunSekarang + 2;

            tahun++
        ) {

            tahunSet.add(
                tahun
            );

        }

    }


    Array.from(
        tahunSet
    )
        .sort(
            function(a, b) {
                return b - a;
            }
        )
        .forEach(
            function(tahun) {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    String(tahun);


                option.textContent =
                    String(tahun);


                select.appendChild(
                    option
                );

            }
        );

}


/* ==========================================================
 * LOAD MASTER KPI
 * ==========================================================
 */

async function loadPenilaianMasterKPI() {

    try {

        if (
            typeof API === "undefined"
            ||
            typeof API.getMasterKPI !==
            "function"
        ) {

            throw new Error(
                "API.getMasterKPI tidak tersedia."
            );

        }


        const result =
            await API.getMasterKPI();


        if (
            !result ||
            result.success === false
        ) {

            throw new Error(
                result?.message ||
                "Gagal mengambil Master KPI."
            );

        }


        let data =
            result.data;


        if (
            data &&
            data.data &&
            typeof data.data ===
            "object"
        ) {

            data =
                data.data;

        }


        penilaianMasterKPIList =
            Array.isArray(data)
                ? data.filter(
                    function(item) {

                        return (
                            String(
                                item?.status ||
                                ""
                            )
                                .trim()
                                .toLowerCase()
                            ===
                            "aktif"
                        );

                    }
                )
                : [];


        console.log(
            "Master KPI untuk Penilaian:",
            penilaianMasterKPIList
        );


        renderPenilaianIndikator();

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
 * RENDER TABLE
 * ==========================================================
 */

function renderPenilaianTable(
    data
) {

    const tbody =
        document.getElementById(
            "tblPenilaian"
        );


    if (!tbody) {

        return;

    }


    if (
        !Array.isArray(data) ||
        data.length === 0
    ) {

        tbody.innerHTML = `
            <tr>
                <td
                    colspan="8"
                    class="text-center text-secondary"
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

            const anggotaId =
                getRecordAnggotaId(
                    item
                );


            const nama =
                getRecordNamaAnggota(
                    item
                );


            const group =
                getRecordGroup(
                    item
                );


            const bulan =
                getBulan(item);


            const tahun =
                getTahun(item);


            const nilai =
                getNilaiAkhir(item);


            const status =
                normalizeStatus(
                    item?.status
                );


            const recordId =
                getRecordId(item);


            /*
             * ID yang DITAMPILKAN adalah
             * ID anggota.
             *
             * BUKAN P0001/P0002.
             */

            const displayId =
                anggotaId ||
                "-";


            /*
             * Final tidak boleh diedit.
             */

            let actionHTML = "";


            if (
                status ===
                "Final"
            ) {

                actionHTML = `
                    <button
                        type="button"
                        class="btn btn-outline-secondary btn-sm"
                        title="Penilaian Final - Terkunci"
                        disabled
                    >
                        <i class="bi bi-lock-fill"></i>
                    </button>
                `;

            }

            else {

                actionHTML = `
                    <button
                        type="button"
                        class="btn btn-warning btn-sm me-1"
                        title="Edit Penilaian"
                        onclick="editPenilaian('${escapeJS(recordId)}')"
                    >
                        <i class="bi bi-pencil"></i>
                    </button>

                    <button
                        type="button"
                        class="btn btn-danger btn-sm"
                        title="Hapus Penilaian"
                        onclick="deletePenilaianConfirm('${escapeJS(recordId)}')"
                    >
                        <i class="bi bi-trash"></i>
                    </button>
                `;

            }


            html += `
                <tr>

                    <td>
                        <strong class="text-info">
                            ${escapeHTML(
                                displayId
                            )}
                        </strong>
                    </td>

                    <td>
                        ${escapeHTML(
                            nama
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            group
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            namaBulan(
                                bulan
                            )
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            tahun
                                ? tahun
                                : "-"
                        )}
                    </td>

                    <td>
                        <span
                            class="badge bg-success"
                        >
                            ${nilai.toFixed(2)}
                        </span>
                    </td>

                    <td>
                        ${renderStatusBadge(
                            status
                        )}
                    </td>

                    <td>
                        ${actionHTML}
                    </td>

                </tr>
            `;

        }
    );


    tbody.innerHTML =
        html;

}


/* ==========================================================
 * GET RECORD ID
 *
 * ID INTERNAL PENILAIAN
 *
 * Contoh:
 * P0001
 *
 * Tidak ditampilkan sebagai ID anggota.
 * ==========================================================
 */

function getRecordId(item) {

    return String(
        item?.penilaianId ??
        item?.recordId ??
        item?.id ??
        ""
    ).trim();

}


/* ==========================================================
 * GET ANGGOTA ID
 * ==========================================================
 */

function getAnggotaId(item) {

    return String(
        item?.anggotaId ??
        item?.anggota_id ??
        item?.anggotaID ??
        item?.memberId ??
        item?.member_id ??
        ""
    ).trim();

}


/* ==========================================================
 * GET ANGGOTA NAMA
 * ==========================================================
 */

function getAnggotaNama(item) {

    return String(
        item?.nama ??
        item?.namaAnggota ??
        item?.anggotaNama ??
        item?.nama_anggota ??
        item?.name ??
        ""
    ).trim();

}


/* ==========================================================
 * GET GROUP
 * ==========================================================
 */

function getGroupFromAnggota(
    anggotaId
) {

    const anggota =
        penilaianAnggotaList.find(
            function(item) {

                return (
                    getAnggotaId(item)
                    ===
                    String(
                        anggotaId
                    )
                        .trim()
                );

            }
        );


    if (!anggota) {

        return "-";

    }


    return String(
        anggota.group ??
        anggota.namaGroup ??
        anggota.groupNama ??
        anggota.group_name ??
        "-"
    ).trim();

}


/* ==========================================================
 * GET RECORD ANGGOTA
 * ==========================================================
 */

function getRecordAnggotaId(
    item
) {

    const id =
        getAnggotaId(item);


    if (id) {

        return id;

    }


    /*
     * Jika backend hanya mengembalikan
     * nama anggota, cari dari list anggota.
     */

    const nama =
        getAnggotaNama(item)
            .toLowerCase();


    if (!nama) {

        return "";

    }


    const anggota =
        penilaianAnggotaList.find(
            function(member) {

                return (
                    getAnggotaNama(member)
                        .toLowerCase()
                    ===
                    nama
                );

            }
        );


    return anggota
        ? getAnggotaId(anggota)
        : "";

}


/* ==========================================================
 * GET RECORD NAMA
 * ==========================================================
 */

function getRecordNamaAnggota(
    item
) {

    const nama =
        getAnggotaNama(item);


    if (nama) {

        return nama;

    }


    const anggotaId =
        getAnggotaId(item);


    const anggota =
        penilaianAnggotaList.find(
            function(member) {

                return (
                    getAnggotaId(member)
                    ===
                    anggotaId
                );

            }
        );


    return anggota
        ? getAnggotaNama(anggota)
        : "-";

}


/* ==========================================================
 * GET RECORD GROUP
 * ==========================================================
 */

function getRecordGroup(
    item
) {

    const direct =
        String(
            item?.group ??
            item?.namaGroup ??
            item?.groupNama ??
            item?.group_name ??
            ""
        ).trim();


    if (direct) {

        return direct;

    }


    return getGroupFromAnggota(
        getRecordAnggotaId(
            item
        )
    );

}


/* ==========================================================
 * NORMALIZE BULAN
 * ==========================================================
 */

function normalizeBulan(
    value
) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {

        return "";

    }


    const text =
        String(value)
            .trim()
            .toLowerCase();


    const map = {

        "1": 1,
        "01": 1,
        "januari": 1,

        "2": 2,
        "02": 2,
        "februari": 2,

        "3": 3,
        "03": 3,
        "maret": 3,

        "4": 4,
        "04": 4,
        "april": 4,

        "5": 5,
        "05": 5,
        "mei": 5,

        "6": 6,
        "06": 6,
        "juni": 6,

        "7": 7,
        "07": 7,
        "juli": 7,

        "8": 8,
        "08": 8,
        "agustus": 8,

        "9": 9,
        "09": 9,
        "september": 9,

        "10": 10,
        "oktober": 10,

        "11": 11,
        "november": 11,

        "12": 12,
        "desember": 12

    };


    return map[text] || "";

}


/* ==========================================================
 * GET BULAN
 * ==========================================================
 */

function getBulan(item) {

    return normalizeBulan(
        item?.bulan ??
        item?.month ??
        item?.namaBulan ??
        item?.nama_bulan ??
        ""
    );

}


/* ==========================================================
 * GET TAHUN
 * ==========================================================
 */

function getTahun(item) {

    const tahun =
        Number(
            item?.tahun ??
            item?.year ??
            0
        );


    return Number.isFinite(
        tahun
    )
        ? tahun
        : 0;

}


/* ==========================================================
 * GET NILAI
 * ==========================================================
 */

function getNilaiAkhir(item) {

    const nilai =
        Number(
            item?.nilaiAkhir ??
            item?.nilai_akhir ??
            item?.nilai ??
            item?.total ??
            0
        );


    return Number.isFinite(
        nilai
    )
        ? nilai
        : 0;

}


/* ==========================================================
 * STATUS
 * ==========================================================
 */

function normalizeStatus(
    status
) {

    const value =
        String(
            status ||
            "Draft"
        )
            .trim();


    return value
        .toLowerCase()
        ===
        "final"
        ? "Final"
        : "Draft";

}


/* ==========================================================
 * STATUS BADGE
 * ==========================================================
 */

function renderStatusBadge(
    status
) {

    if (
        status ===
        "Final"
    ) {

        return `
            <span
                class="badge bg-success"
            >
                Final
            </span>
        `;

    }


    return `
        <span
            class="badge bg-secondary"
        >
            Draft
        </span>
    `;

}


/* ==========================================================
 * NAMA BULAN
 * ==========================================================
 */

function namaBulan(
    bulan
) {

    const number =
        Number(bulan);


    return (
        NAMA_BULAN[number]
        ||
        "-"
    );

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


    if (!container) {

        return;

    }


    if (
        !Array.isArray(
            penilaianMasterKPIList
        )
        ||
        penilaianMasterKPIList.length === 0
    ) {

        container.innerHTML = `
            <div
                class="text-center text-secondary py-3"
            >
                Tidak ada Master KPI Aktif.
            </div>
        `;

        return;

    }


    let html = "";


    penilaianMasterKPIList.forEach(
        function(item) {

            const id =
                String(
                    item?.id ||
                    ""
                ).trim();


            const indicator =
                String(
                    item?.indicator ??
                    item?.nama_kpi ??
                    item?.nama ??
                    "-"
                );


            const kategori =
                String(
                    item?.kategori ||
                    "-"
                );


            const bobot =
                Number(
                    item?.bobot ||
                    0
                );


            html += `
                <div
                    class="row mb-3 align-items-center border-bottom pb-3"
                >

                    <div class="col-md-5">

                        <strong>
                            ${escapeHTML(
                                indicator
                            )}
                        </strong>

                        <br>

                        <small
                            class="text-info"
                        >
                            ${escapeHTML(
                                kategori
                            )}
                        </small>

                    </div>

                    <div
                        class="col-md-2 text-center"
                    >

                        <span
                            class="badge bg-info"
                        >
                            ${bobot}%
                        </span>

                    </div>

                    <div
                        class="col-md-5"
                    >

                        <input
                            type="number"
                            class="form-control nilaiKPI"
                            data-id="${escapeHTML(id)}"
                            data-bobot="${bobot}"
                            min="0"
                            max="100"
                            step="0.01"
                            value="100"
                            onchange="hitungNilaiPenilaian()"
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

    const inputs =
        document.querySelectorAll(
            ".nilaiKPI"
        );


    let total =
        0;


    inputs.forEach(
        function(input) {

            let nilai =
                Number(
                    input.value ||
                    0
                );


            let bobot =
                Number(
                    input.dataset.bobot ||
                    0
                );


            if (
                !Number.isFinite(
                    nilai
                )
            ) {

                nilai = 0;

            }


            if (
                !Number.isFinite(
                    bobot
                )
            ) {

                bobot = 0;

            }


            if (
                nilai < 0
            ) {

                nilai = 0;

            }


            if (
                nilai > 100
            ) {

                nilai = 100;

            }


            total +=
                nilai *
                bobot /
                100;

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
            total.toFixed(2);

    }


    if (akhirElement) {

        akhirElement.value =
            total.toFixed(2);

    }


    return total;

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


    inputs.forEach(
        function(input) {

            const kpiId =
                String(
                    input.dataset.id ||
                    ""
                ).trim();


            const bobot =
                Number(
                    input.dataset.bobot ||
                    0
                );


            const nilai =
                Number(
                    input.value ||
                    0
                );


            detail.push({

                kpiId:
                    kpiId,

                bobot:
                    bobot,

                nilai:
                    Number.isFinite(
                        nilai
                    )
                        ? nilai
                        : 0

            });

        }
    );


    return detail;

}


/* ==========================================================
 * NORMALIZE DETAIL DARI BACKEND
 * ==========================================================
 */

function getExistingDetail(
    item
) {

    const raw =
        item?.detail ??
        item?.details ??
        item?.nilaiKPI ??
        item?.nilai_kpi ??
        [];


    if (
        Array.isArray(raw)
    ) {

        return raw;

    }


    if (
        typeof raw ===
        "object" &&
        raw !== null
    ) {

        return Object.keys(
            raw
        ).map(
            function(key) {

                const value =
                    raw[key];


                if (
                    typeof value ===
                    "object"
                    &&
                    value !== null
                ) {

                    return {

                        kpiId:
                            value.kpiId ??
                            value.kpi_id ??
                            key,

                        nilai:
                            value.nilai ??
                            value.value ??
                            0

                    };

                }


                return {

                    kpiId:
                        key,

                    nilai:
                        value

                };

            }
        );

    }


    return [];

}


/* ==========================================================
 * CLEAR FORM
 *
 * PENTING:
 *
 * Fungsi ini TIDAK mengubah penilaianEditId.
 *
 * Ini mencegah bug:
 *
 * EDIT P0001
 *   ↓
 * clearForm()
 *   ↓
 * ID hilang
 *   ↓
 * INSERT P0006
 *
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

        const bulanSekarang =
            new Date().getMonth() + 1;


        bulan.value =
            String(
                bulanSekarang
            );

    }


    loadPenilaianTahun();


    const tahun =
        document.getElementById(
            "tahunPenilaian"
        );


    if (tahun) {

        const tahunSekarang =
            new Date().getFullYear();


        tahun.value =
            String(
                tahunSekarang
            );

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


    /*
     * Reset indikator ke nilai awal
     * hanya jika container sudah ada.
     */

    if (
        document.getElementById(
            "listIndikator"
        )
    ) {

        renderPenilaianIndikator();

    }

}


/* ==========================================================
 * OPEN MODAL PENILAIAN BARU
 * ==========================================================
 */

function openPenilaianModal() {

    console.log(
        "Membuka Penilaian Baru."
    );


    /*
     * NEW harus menghapus
     * ID record edit.
     */

    penilaianMode =
        "NEW";


    penilaianEditId =
        null;


    clearPenilaianForm();


    renderPenilaianIndikator();


    hitungNilaiPenilaian();


    const title =
        document.querySelector(
            "#penilaianModal .modal-title"
        );


    if (title) {

        title.textContent =
            "Penilaian Baru";

    }


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
 * EDIT PENILAIAN
 * ==========================================================
 */

async function editPenilaian(
    recordId
) {

    const id =
        String(
            recordId ||
            ""
        ).trim();


    if (!id) {

        alert(
            "ID Penilaian tidak valid."
        );

        return;

    }


    console.log(
        "=========================================="
    );

    console.log(
        "EDIT PENILAIAN"
    );

    console.log(
        "Record ID:",
        id
    );


    /*
     * Cari data di memory.
     */

    let item =
        penilaianList.find(
            function(row) {

                return (
                    getRecordId(row)
                    ===
                    id
                );

            }
        );


    /*
     * Jika tidak ada, coba API.
     */

    if (!item) {

        if (
            typeof API !== "undefined"
            &&
            typeof API.getPenilaianById ===
            "function"
        ) {

            try {

                const result =
                    await API.getPenilaianById(
                        id
                    );


                if (
                    result &&
                    result.success !== false
                ) {

                    let data =
                        result.data;


                    if (
                        data &&
                        data.data
                    ) {

                        data =
                            data.data;

                    }


                    if (
                        Array.isArray(data)
                    ) {

                        item =
                            data[0];

                    }
                    else {

                        item =
                            data;

                    }

                }

            }

            catch (error) {

                console.warn(
                    "getPenilaianById gagal:",
                    error
                );

            }

        }

    }


    if (!item) {

        alert(
            "Data Penilaian tidak ditemukan."
        );

        return;

    }


    /*
     * FINAL tidak boleh diedit.
     */

    const status =
        normalizeStatus(
            item.status
        );


    if (
        status ===
        "Final"
    ) {

        alert(
            "Penilaian Final sudah dikunci dan tidak dapat diedit."
        );

        return;

    }


    /*
     * Pastikan ID record benar.
     */

    const realRecordId =
        getRecordId(item);


    if (!realRecordId) {

        alert(
            "ID record Penilaian tidak ditemukan."
        );

        return;

    }


    /*
     * ======================================================
     * MODE EDIT
     *
     * ID disimpan SEBELUM form diisi.
     * clearPenilaianForm() tidak menghapusnya.
     * ======================================================
     */

    penilaianMode =
        "EDIT";


    penilaianEditId =
        realRecordId;


    console.log(
        "EDIT MODE AKTIF"
    );

    console.log(
        "penilaianEditId:",
        penilaianEditId
    );


    /*
     * Reset visual form.
     */

    clearPenilaianForm();


    /*
     * Setelah clear:
     * pastikan ID tetap.
     */

    penilaianEditId =
        realRecordId;


    /*
     * ANGGOTA
     */

    const anggotaId =
        getRecordAnggotaId(
            item
        );


    const anggotaSelect =
        document.getElementById(
            "anggotaPenilaian"
        );


    if (anggotaSelect) {

        anggotaSelect.value =
            anggotaId;

    }


    /*
     * Saat EDIT, anggota
     * sebaiknya tidak diganti.
     */

    if (anggotaSelect) {

        anggotaSelect.disabled =
            true;

    }


    /*
     * BULAN
     */

    const bulan =
        getBulan(item);


    const bulanSelect =
        document.getElementById(
            "bulanPenilaian"
        );


    if (bulanSelect) {

        bulanSelect.value =
            String(
                bulan
            );

    }


    /*
     * TAHUN
     */

    const tahun =
        getTahun(item);


    const tahunSelect =
        document.getElementById(
            "tahunPenilaian"
        );


    if (tahunSelect) {

        /*
         * Jika tahun belum ada
         * di option, tambahkan.
         */

        const exists =
            Array.from(
                tahunSelect.options
            )
                .some(
                    function(option) {

                        return (
                            option.value
                            ===
                            String(
                                tahun
                            )
                        );

                    }
                );


        if (
            !exists &&
            tahun
        ) {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                String(tahun);


            option.textContent =
                String(tahun);


            tahunSelect.appendChild(
                option
            );

        }


        tahunSelect.value =
            String(
                tahun
            );

    }


    /*
     * STATUS
     */

    const statusSelect =
        document.getElementById(
            "statusPenilaian"
        );


    if (statusSelect) {

        statusSelect.value =
            "Draft";

    }


    /*
     * Render indikator.
     */

    renderPenilaianIndikator();


    /*
     * Ambil detail lama.
     */

    const detail =
        getExistingDetail(
            item
        );


    console.log(
        "Detail Penilaian:",
        detail
    );


    /*
     * Isi nilai lama.
     */

    const inputs =
        document.querySelectorAll(
            ".nilaiKPI"
        );


    inputs.forEach(
        function(input) {

            const inputId =
                String(
                    input.dataset.id ||
                    ""
                ).trim();


            const found =
                detail.find(
                    function(row) {

                        const kpiId =
                            String(
                                row?.kpiId ??
                                row?.kpi_id ??
                                row?.masterKPIId ??
                                row?.master_kpi_id ??
                                row?.id ??
                                ""
                            ).trim();


                        return (
                            kpiId ===
                            inputId
                        );

                    }
                );


            if (found) {

                const nilai =
                    Number(
                        found.nilai ??
                        found.value ??
                        0
                    );


                input.value =
                    Number.isFinite(
                        nilai
                    )
                        ? nilai
                        : 0;

            }

        }
    );


    /*
     * Hitung ulang.
     */

    hitungNilaiPenilaian();


    /*
     * Judul.
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


    console.log(
        "Edit Penilaian siap."
    );

}


/* ==========================================================
 * SAVE / UPDATE
 *
 * INI BAGIAN UTAMA.
 *
 * NEW:
 * API.savePenilaian(data)
 *
 * EDIT:
 * API.updatePenilaian(recordId, data)
 *
 * ==========================================================
 */

async function savePenilaian() {

    const anggotaSelect =
        document.getElementById(
            "anggotaPenilaian"
        );


    const bulanSelect =
        document.getElementById(
            "bulanPenilaian"
        );


    const tahunSelect =
        document.getElementById(
            "tahunPenilaian"
        );


    const statusSelect =
        document.getElementById(
            "statusPenilaian"
        );


    if (
        !anggotaSelect ||
        !bulanSelect ||
        !tahunSelect ||
        !statusSelect
    ) {

        alert(
            "Form Penilaian belum lengkap."
        );

        return;

    }


    /*
     * Saat EDIT anggota disabled,
     * value masih tetap tersedia.
     */

    const anggotaId =
        String(
            anggotaSelect.value ||
            ""
        ).trim();


    const bulan =
        normalizeBulan(
            bulanSelect.value
        );


    const tahun =
        Number(
            tahunSelect.value
        );


    const status =
        normalizeStatus(
            statusSelect.value
        );


    const detail =
        getPenilaianDetail();


    const nilaiAkhir =
        hitungNilaiPenilaian();


    /*
     * Validasi dasar.
     */

    if (!anggotaId) {

        alert(
            "Pilih Anggota terlebih dahulu."
        );

        return;

    }


    if (
        !bulan ||
        bulan < 1 ||
        bulan > 12
    ) {

        alert(
            "Bulan Penilaian tidak valid."
        );

        return;

    }


    if (
        !tahun ||
        tahun < 2000
    ) {

        alert(
            "Tahun Penilaian tidak valid."
        );

        return;

    }


    if (
        detail.length === 0
    ) {

        alert(
            "Master KPI belum tersedia."
        );

        return;

    }


    /*
     * Validasi nilai.
     */

    const nilaiInvalid =
        detail.some(
            function(row) {

                return (
                    !Number.isFinite(
                        Number(
                            row.nilai
                        )
                    )
                    ||
                    Number(
                        row.nilai
                    ) < 0
                    ||
                    Number(
                        row.nilai
                    ) > 100
                );

            }
        );


    if (
        nilaiInvalid
    ) {

        alert(
            "Nilai KPI harus berada antara 0 sampai 100."
        );

        return;

    }


    /*
     * ======================================================
     * CEK DUPLIKASI PERIODE
     *
     * ID Anggota
     * +
     * Bulan
     * +
     * Tahun
     *
     * ======================================================
     */

    if (
        isDuplicatePenilaian({
            anggotaId:
                anggotaId,

            bulan:
                bulan,

            tahun:
                tahun

        })
    ) {

        alert(
            "Penilaian untuk anggota tersebut pada bulan dan tahun yang sama sudah ada."
        );

        return;

    }


    /*
     * Payload.
     *
     * ID ANGGOTA tetap.
     */

    const payload = {

        anggotaId:
            anggotaId,

        bulan:
            bulan,

        tahun:
            tahun,

        status:
            status,

        total:
            nilaiAkhir,

        nilaiAkhir:
            nilaiAkhir,

        detail:
            detail

    };


    console.log(
        "=========================================="
    );

    console.log(
        "SAVE PENILAIAN"
    );

    console.log(
        "Mode:",
        penilaianMode
    );

    console.log(
        "Record ID:",
        penilaianEditId
    );

    console.log(
        "Anggota ID:",
        anggotaId
    );

    console.log(
        "Bulan:",
        bulan
    );

    console.log(
        "Tahun:",
        tahun
    );

    console.log(
        "Payload:",
        payload
    );


    /*
     * Tombol.
     */

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


        button.innerHTML = `
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
            penilaianMode ===
            "EDIT"
            &&
            penilaianEditId
        ) {

            console.log(
                ">>> UPDATE RECORD:",
                penilaianEditId
            );


            if (
                typeof API === "undefined"
                ||
                typeof API.updatePenilaian !==
                "function"
            ) {

                throw new Error(
                    "API.updatePenilaian tidak tersedia."
                );

            }


            result =
                await API.updatePenilaian(
                    penilaianEditId,
                    payload
                );

        }


        /*
         * ==================================================
         * NEW
         * ==================================================
         */

        else {

            console.log(
                ">>> INSERT RECORD BARU"
            );


            if (
                typeof API === "undefined"
                ||
                typeof API.savePenilaian !==
                "function"
            ) {

                throw new Error(
                    "API.savePenilaian tidak tersedia."
                );

            }


            result =
                await API.savePenilaian(
                    payload
                );

        }


        console.log(
            "Save/Update Response:",
            result
        );


        if (
            !result
        ) {

            throw new Error(
                "Response API kosong."
            );

        }


        if (
            result.success === false
        ) {

            throw new Error(
                result.message ||
                "Gagal menyimpan Penilaian."
            );

        }


        /*
         * Berhasil.
         */

        alert(
            result.message ||
            (
                penilaianMode ===
                "EDIT"
                    ? "Penilaian berhasil diperbarui."
                    : "Penilaian berhasil disimpan."
            )
        );


        /*
         * Tutup modal.
         */

        closePenilaianModal();


        /*
         * Reset mode SETELAH berhasil.
         */

        penilaianMode =
            "NEW";


        penilaianEditId =
            null;


        /*
         * Aktifkan kembali anggota.
         */

        if (anggotaSelect) {

            anggotaSelect.disabled =
                false;

        }


        /*
         * Ambil data terbaru.
         */

        await loadPenilaianData();


        loadFilterTahun();


    }

    catch (error) {

        console.error(
            "savePenilaian:",
            error
        );


        alert(
            error.message ||
            "Terjadi kesalahan saat menyimpan Penilaian."
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
 * CEK DUPLIKASI
 *
 * HANYA:
 *
 * anggota sama
 * +
 * bulan sama
 * +
 * tahun sama
 *
 * ==========================================================
 */

function isDuplicatePenilaian(
    data
) {

    const anggotaId =
        String(
            data?.anggotaId ||
            ""
        )
            .trim()
            .toUpperCase();


    const bulan =
        normalizeBulan(
            data?.bulan
        );


    const tahun =
        Number(
            data?.tahun
        );


    if (
        !anggotaId ||
        !bulan ||
        !tahun
    ) {

        return false;

    }


    const currentId =
        String(
            penilaianEditId ||
            ""
        ).trim();


    const duplicate =
        penilaianList.some(
            function(item) {

                const recordId =
                    getRecordId(
                        item
                    );


                /*
                 * Saat edit:
                 *
                 * P0001 tidak boleh
                 * dianggap duplikat
                 * dengan dirinya sendiri.
                 */

                if (
                    currentId
                    &&
                    recordId ===
                    currentId
                ) {

                    return false;

                }


                const existingAnggota =
                    getRecordAnggotaId(
                        item
                    )
                        .trim()
                        .toUpperCase();


                const existingBulan =
                    getBulan(
                        item
                    );


                const existingTahun =
                    getTahun(
                        item
                    );


                return (

                    existingAnggota
                    ===
                    anggotaId

                    &&

                    existingBulan
                    ===
                    bulan

                    &&

                    existingTahun
                    ===
                    tahun

                );

            }
        );


    console.log(
        "Cek duplikasi:",
        {
            anggotaId,
            bulan,
            tahun,
            currentId,
            duplicate
        }
    );


    return duplicate;

}


/* ==========================================================
 * DELETE
 * ==========================================================
 */

async function deletePenilaianConfirm(
    recordId
) {

    const id =
        String(
            recordId ||
            ""
        ).trim();


    if (!id) {

        alert(
            "ID Penilaian tidak valid."
        );

        return;

    }


    const item =
        penilaianList.find(
            function(row) {

                return (
                    getRecordId(row)
                    ===
                    id
                );

            }
        );


    if (!item) {

        alert(
            "Data Penilaian tidak ditemukan."
        );

        return;

    }


    const status =
        normalizeStatus(
            item.status
        );


    /*
     * Final tidak boleh dihapus.
     */

    if (
        status ===
        "Final"
    ) {

        alert(
            "Penilaian Final sudah dikunci dan tidak dapat dihapus."
        );

        return;

    }


    const nama =
        getRecordNamaAnggota(
            item
        );


    const bulan =
        namaBulan(
            getBulan(item)
        );


    const tahun =
        getTahun(item);


    const yakin =
        confirm(
            "Hapus penilaian berikut?\n\n" +
            "ID Anggota : " +
            getRecordAnggotaId(item) +
            "\n" +
            "Nama       : " +
            nama +
            "\n" +
            "Periode    : " +
            bulan +
            " " +
            tahun
        );


    if (!yakin) {

        return;

    }


    try {

        if (
            typeof API === "undefined"
            ||
            typeof API.deletePenilaian !==
            "function"
        ) {

            throw new Error(
                "API.deletePenilaian tidak tersedia."
            );

        }


        const result =
            await API.deletePenilaian(
                id
            );


        console.log(
            "Delete Response:",
            result
        );


        if (
            !result ||
            result.success === false
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


        loadFilterTahun();

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
 * CLOSE MODAL
 * ==========================================================
 */

function closePenilaianModal() {

    const element =
        document.getElementById(
            "penilaianModal"
        );


    if (!element) {

        return;

    }


    const modal =
        bootstrap.Modal.getInstance(
            element
        );


    if (modal) {

        modal.hide();

    }


    /*
     * Kembalikan anggota
     * agar bisa digunakan lagi.
     */

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
 * FILTER
 * ==========================================================
 */

function filterPenilaian() {

    const search =
        String(
            document.getElementById(
                "searchPenilaian"
            )?.value ||
            ""
        )
            .trim()
            .toLowerCase();


    const bulan =
        normalizeBulan(
            document.getElementById(
                "filterBulan"
            )?.value ||
            ""
        );


    const tahun =
        Number(
            document.getElementById(
                "filterTahun"
            )?.value ||
            0
        );


    const status =
        String(
            document.getElementById(
                "filterStatusPenilaian"
            )?.value ||
            ""
        )
            .trim()
            .toLowerCase();


    const filtered =
        penilaianList.filter(
            function(item) {

                const id =
                    getRecordAnggotaId(
                        item
                    )
                        .toLowerCase();


                const nama =
                    getRecordNamaAnggota(
                        item
                    )
                        .toLowerCase();


                const group =
                    getRecordGroup(
                        item
                    )
                        .toLowerCase();


                const itemBulan =
                    getBulan(item);


                const itemTahun =
                    getTahun(item);


                const itemStatus =
                    normalizeStatus(
                        item?.status
                    )
                        .toLowerCase();


                const cocokSearch =
                    !search
                    ||
                    id.includes(search)
                    ||
                    nama.includes(search)
                    ||
                    group.includes(search);


                const cocokBulan =
                    !bulan
                    ||
                    itemBulan ===
                    bulan;


                const cocokTahun =
                    !tahun
                    ||
                    itemTahun ===
                    tahun;


                const cocokStatus =
                    !status
                    ||
                    itemStatus ===
                    status;


                return (
                    cocokSearch
                    &&
                    cocokBulan
                    &&
                    cocokTahun
                    &&
                    cocokStatus
                );

            }
        );


    renderPenilaianTable(
        filtered
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
 * REFRESH
 * ==========================================================
 */

async function refreshPenilaian() {

    console.log(
        "Refresh Penilaian..."
    );


    await loadPenilaianData();


    loadFilterTahun();


    /*
     * Terapkan filter aktif
     * setelah refresh.
     */

    filterPenilaian();

}


/* ==========================================================
 * ESCAPE HTML
 * ==========================================================
 */

function escapeHTML(
    value
) {

    return String(
        value ?? ""
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
 * ESCAPE JS
 * ==========================================================
 */

function escapeJS(
    value
) {

    return String(
        value ?? ""
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
            /"/g,
            '\\"'
        )
        .replace(
            /\r/g,
            "\\r"
        )
        .replace(
            /\n/g,
            "\\n"
        );

}


/* ==========================================================
 * DEBUG
 * ==========================================================
 */

function penilaianDebug() {

    console.group(
        "Guardian KPI Penilaian " +
        PENILAIAN_VERSION
    );


    console.log(
        "Mode:",
        penilaianMode
    );


    console.log(
        "Edit Record ID:",
        penilaianEditId
    );


    console.log(
        "Anggota:",
        penilaianAnggotaList
    );


    console.log(
        "Master KPI:",
        penilaianMasterKPIList
    );


    console.log(
        "Penilaian:",
        penilaianList
    );


    console.groupEnd();

}


/* ==========================================================
 * GLOBAL EXPORT
 * ==========================================================
 */

window.initPenilaian =
    initPenilaian;


window.loadPenilaianData =
    loadPenilaianData;


window.loadPenilaianAnggota =
    loadPenilaianAnggota;


window.loadPenilaianMasterKPI =
    loadPenilaianMasterKPI;


window.loadPenilaianTahun =
    loadPenilaianTahun;


window.renderPenilaianTable =
    renderPenilaianTable;


window.renderPenilaianIndikator =
    renderPenilaianIndikator;


window.hitungNilaiPenilaian =
    hitungNilaiPenilaian;


window.getPenilaianDetail =
    getPenilaianDetail;


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


window.filterPenilaian =
    filterPenilaian;


window.resetFilterPenilaian =
    resetFilterPenilaian;


window.refreshPenilaian =
    refreshPenilaian;


window.clearPenilaianForm =
    clearPenilaianForm;


window.isDuplicatePenilaian =
    isDuplicatePenilaian;


window.penilaianDebug =
    penilaianDebug;


/* ==========================================================
 * END
 * ==========================================================
 */
