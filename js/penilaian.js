/**
 * ==========================================================
 * GUARDIAN KPI WEB3
 * File : js/penilaian.js
 * Version : 5.1.0 FINAL
 * ==========================================================
 *
 * Modul Penilaian KPI
 *
 * Fitur:
 * - Load anggota
 * - Load Master KPI
 * - Load data penilaian
 * - Filter penilaian
 * - Tahun otomatis
 * - Render indikator KPI
 * - Perhitungan nilai berbobot
 * - Modal penilaian baru
 * - Simpan penilaian jika API tersedia
 *
 * CATATAN:
 * - Menggunakan API global project secara langsung.
 * - Tidak menggunakan window.API sebagai syarat.
 * - Tidak menggunakan waitForPenilaianAPI().
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

let penilaianEditId = null;


/* ==========================================================
 * KONFIGURASI
 * ==========================================================
 */

const PENILAIAN_CONFIG = {

    maxNilai: 100,

    minNilai: 0,

    defaultStatus: "Draft",

    tahunRange: 2

};


/* ==========================================================
 * NAMA BULAN
 * ==========================================================
 */

const PENILAIAN_BULAN = {

    1: "Januari",

    2: "Februari",

    3: "Maret",

    4: "April",

    5: "Mei",

    6: "Juni",

    7: "Juli",

    8: "Agustus",

    9: "September",

    10: "Oktober",

    11: "November",

    12: "Desember"

};


/* ==========================================================
 * INIT
 * ==========================================================
 */

async function initPenilaian() {

    console.log(
        "=========================================="
    );

    console.log(
        "Guardian KPI Penilaian 5.1.0 FINAL"
    );

    console.log(
        "initPenilaian()"
    );


    try {

        /*
         * Pastikan halaman Penilaian
         * sudah benar-benar ter-render.
         */

        const anggotaSelect =
            document.getElementById(
                "anggotaPenilaian"
            );


        if (!anggotaSelect) {

            console.warn(
                "Penilaian: #anggotaPenilaian belum tersedia."
            );

            return;

        }


        /*
         * Reset form.
         */

        clearPenilaianForm();


        /*
         * Tahun.
         */

        loadPenilaianTahun();


        /*
         * Load data.
         *
         * Anggota dan Master KPI dapat berjalan
         * bersamaan.
         */

        await Promise.all([

            loadPenilaianAnggota(),

            loadPenilaianMasterKPI(),

            loadPenilaianData()

        ]);


        console.log(
            "initPenilaian() selesai."
        );

        console.log(
            "Jumlah anggota:",
            penilaianAnggotaList.length
        );

        console.log(
            "Jumlah Master KPI:",
            penilaianMasterKPIList.length
        );

        console.log(
            "Jumlah penilaian:",
            penilaianList.length
        );

    }

    catch (error) {

        console.error(
            "initPenilaian() ERROR:",
            error
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

        /*
         * Jika API.getPenilaian belum tersedia,
         * jangan membuat halaman error.
         */

        if (
            typeof API === "undefined" ||
            typeof API.getPenilaian !==
            "function"
        ) {

            console.warn(
                "API.getPenilaian belum tersedia."
            );


            penilaianList = [];


            renderPenilaianTable(
                []
            );


            return;

        }


        console.log(
            "Penilaian: memanggil API.getPenilaian()..."
        );


        const result =
            await API.getPenilaian();


        console.log(
            "Penilaian API.getPenilaian response:",
            result
        );


        if (!result) {

            throw new Error(
                "Response API penilaian kosong."
            );

        }


        if (
            result.success === false
        ) {

            throw new Error(
                result.message ||
                "Gagal mengambil data penilaian."
            );

        }


        let data =
            result.data || [];


        /*
         * Support response nested.
         */

        if (
            data &&
            !Array.isArray(data) &&
            Array.isArray(data.data)
        ) {

            data =
                data.data;

        }


        if (
            !Array.isArray(data)
        ) {

            throw new Error(
                "Format data penilaian tidak valid."
            );

        }


        penilaianList =
            data;


        renderPenilaianTable(
            penilaianList
        );

    }

    catch (error) {

        console.error(
            "loadPenilaianData ERROR:",
            error
        );


        penilaianList = [];


        tbody.innerHTML = `

            <tr>

                <td
                    colspan="8"
                    class="text-danger text-center"
                >

                    ${escapePenilaianHTML(
                        error.message
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

    const select =
        document.getElementById(
            "anggotaPenilaian"
        );


    if (!select) {

        console.warn(
            "Element #anggotaPenilaian tidak ditemukan."
        );

        return;

    }


    select.disabled = true;


    select.innerHTML = `

        <option value="">
            Memuat anggota...
        </option>

    `;


    try {

        /*
         * ==================================================
         * CEK API
         * ==================================================
         *
         * Jangan menggunakan:
         *
         * window.API
         *
         * Karena project menggunakan API global
         * secara langsung.
         */

        if (
            typeof API === "undefined"
        ) {

            throw new Error(
                "Objek API belum tersedia."
            );

        }


        if (
            typeof API.getAnggota !==
            "function"
        ) {

            throw new Error(
                "API.getAnggota tidak tersedia."
            );

        }


        console.log(
            "Penilaian: memanggil API.getAnggota()..."
        );


        /*
         * Panggil API.
         */

        const result =
            await API.getAnggota();


        console.log(
            "Penilaian API.getAnggota response:",
            result
        );


        /*
         * Validasi response.
         */

        if (!result) {

            throw new Error(
                "Response API anggota kosong."
            );

        }


        if (
            result.success === false
        ) {

            throw new Error(
                result.message ||
                "Gagal mengambil data anggota."
            );

        }


        /*
         * Ambil data.
         */

        let data =
            result.data || [];


        /*
         * Support nested response.
         */

        if (
            data &&
            !Array.isArray(data) &&
            Array.isArray(data.data)
        ) {

            data =
                data.data;

        }


        /*
         * Pastikan array.
         */

        if (
            !Array.isArray(data)
        ) {

            throw new Error(
                "Format data anggota tidak valid."
            );

        }


        /*
         * Simpan state.
         */

        penilaianAnggotaList =
            data;


        /*
         * Reset dropdown.
         */

        select.innerHTML = "";


        /*
         * Default option.
         */

        const defaultOption =
            document.createElement(
                "option"
            );


        defaultOption.value =
            "";


        defaultOption.textContent =
            "Pilih Anggota";


        select.appendChild(
            defaultOption
        );


        /*
         * Tidak ada data.
         */

        if (
            penilaianAnggotaList.length === 0
        ) {

            const emptyOption =
                document.createElement(
                    "option"
                );


            emptyOption.value =
                "";


            emptyOption.textContent =
                "Tidak ada anggota";


            select.appendChild(
                emptyOption
            );


            select.disabled =
                true;


            console.warn(
                "Penilaian: data anggota kosong."
            );


            return;

        }


        /*
         * Render anggota.
         */

        penilaianAnggotaList.forEach(
            function(item) {

                if (
                    !item ||
                    item.id === undefined ||
                    item.id === null
                ) {

                    return;

                }


                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    String(
                        item.id
                    );


                option.textContent =
                    String(
                        item.nama ||
                        "-"
                    );


                select.appendChild(
                    option
                );

            }
        );


        /*
         * Aktifkan dropdown.
         */

        select.disabled =
            false;


        console.log(
            "Penilaian: dropdown anggota berhasil diisi."
        );


        console.log(
            "Penilaian: jumlah anggota =",
            penilaianAnggotaList.length
        );


        console.log(
            "Penilaian: jumlah option =",
            select.options.length
        );

    }

    catch (error) {

        console.error(
            "loadPenilaianAnggota ERROR:",
            error
        );


        penilaianAnggotaList =
            [];


        select.innerHTML = `

            <option value="">
                Gagal memuat anggota
            </option>

        `;


        select.disabled =
            true;

    }

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


    const tahun =
        new Date().getFullYear();


    select.innerHTML =
        "";


    for (
        let i =
            tahun -
            PENILAIAN_CONFIG.tahunRange;

        i <=
            tahun +
            PENILAIAN_CONFIG.tahunRange;

        i++
    ) {

        const option =
            document.createElement(
                "option"
            );


        option.value =
            String(i);


        option.textContent =
            String(i);


        if (
            i === tahun
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
 * LOAD MASTER KPI
 * ==========================================================
 */

async function loadPenilaianMasterKPI() {

    const container =
        document.getElementById(
            "listIndikator"
        );


    try {

        if (
            typeof API === "undefined"
        ) {

            throw new Error(
                "Objek API belum tersedia."
            );

        }


        if (
            typeof API.getMasterKPI !==
            "function"
        ) {

            throw new Error(
                "API.getMasterKPI tidak tersedia."
            );

        }


        console.log(
            "Penilaian: memanggil API.getMasterKPI()..."
        );


        const result =
            await API.getMasterKPI();


        console.log(
            "Penilaian API.getMasterKPI response:",
            result
        );


        if (!result) {

            throw new Error(
                "Response Master KPI kosong."
            );

        }


        if (
            result.success === false
        ) {

            throw new Error(
                result.message ||
                "Gagal mengambil Master KPI."
            );

        }


        let data =
            result.data || [];


        if (
            data &&
            !Array.isArray(data) &&
            Array.isArray(data.data)
        ) {

            data =
                data.data;

        }


        if (
            !Array.isArray(data)
        ) {

            throw new Error(
                "Format Master KPI tidak valid."
            );

        }


        /*
         * Hanya KPI aktif.
         */

        penilaianMasterKPIList =
            data.filter(
                function(item) {

                    return (
                        String(
                            item.status ||
                            ""
                        )
                            .trim()
                            .toLowerCase()
                        ===
                        "aktif"
                    );

                }
            );


        renderPenilaianIndikator();


        console.log(
            "Penilaian: Master KPI aktif =",
            penilaianMasterKPIList.length
        );

    }

    catch (error) {

        console.error(
            "loadPenilaianMasterKPI ERROR:",
            error
        );


        penilaianMasterKPIList =
            [];


        if (container) {

            container.innerHTML = `

                <div
                    class="text-center text-danger"
                >

                    ${escapePenilaianHTML(
                        error.message
                    )}

                </div>

            `;

        }

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
                    class="text-center"
                >

                    Belum ada data Penilaian.

                </td>

            </tr>

        `;


        return;

    }


    tbody.innerHTML =
        "";


    data.forEach(
        function(item) {

            const anggota =
                getPenilaianAnggotaById(
                    item.anggotaId ||
                    item.idAnggota ||
                    item.anggota
                );


            const nama =
                item.nama ||
                item.namaAnggota ||
                (
                    anggota
                        ? anggota.nama
                        : "-"
                );


            const id =
                item.id ||
                item.penilaianId ||
                "-";


            const group =
                item.groupNama ||
                item.group ||
                (
                    anggota
                        ? anggota.group
                        : "-"
                );


            const bulan =
                formatPenilaianBulan(
                    item.bulan
                );


            const tahun =
                item.tahun ||
                "-";


            const nilai =
                item.nilaiAkhir ??
                item.nilai ??
                item.totalNilai ??
                0;


            const status =
                item.status ||
                "Draft";


            const tr =
                document.createElement(
                    "tr"
                );


            tr.innerHTML = `

                <td>
                    ${escapePenilaianHTML(id)}
                </td>

                <td>
                    ${escapePenilaianHTML(nama)}
                </td>

                <td>
                    ${escapePenilaianHTML(group)}
                </td>

                <td>
                    ${escapePenilaianHTML(bulan)}
                </td>

                <td>
                    ${escapePenilaianHTML(tahun)}
                </td>

                <td>
                    <strong>
                        ${formatPenilaianNumber(nilai)}
                    </strong>
                </td>

                <td>
                    ${badgeStatusPenilaian(status)}
                </td>

                <td>

                    <button
                        type="button"
                        class="btn btn-sm btn-warning me-1"
                        onclick="editPenilaian('${escapeAttribute(id)}')"
                        title="Edit"
                    >

                        <i class="bi bi-pencil"></i>

                    </button>

                    <button
                        type="button"
                        class="btn btn-sm btn-info"
                        onclick="viewPenilaian('${escapeAttribute(id)}')"
                        title="Lihat"
                    >

                        <i class="bi bi-eye"></i>

                    </button>

                </td>

            `;


            tbody.appendChild(
                tr
            );

        }
    );

}


/* ==========================================================
 * BADGE STATUS
 * ==========================================================
 */

function badgeStatusPenilaian(
    status
) {

    const normalized =
        String(
            status ||
            "Draft"
        )
            .trim()
            .toLowerCase();


    if (
        normalized === "final"
    ) {

        return `

            <span class="badge bg-success">
                Final
            </span>

        `;

    }


    return `

        <span class="badge bg-warning text-dark">
            Draft
        </span>

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


    if (!container) {

        return;

    }


    if (
        !penilaianMasterKPIList.length
    ) {

        container.innerHTML = `

            <div
                class="text-center text-secondary py-3"
            >

                Tidak ada Master KPI aktif.

            </div>

        `;


        updatePenilaianSummary();


        return;

    }


    let html =
        "";


    penilaianMasterKPIList.forEach(
        function(item, index) {

            const id =
                item.id ??
                item.kode ??
                index;


            const indicator =
                item.indicator ||
                item.indikator ||
                item.nama ||
                "-";


            const kategori =
                item.kategori ||
                item.category ||
                "-";


            const bobot =
                toPenilaianNumber(
                    item.bobot
                );


            html += `

                <div
                    class="row mb-3 align-items-center border-bottom pb-2"
                >

                    <div class="col-md-5">

                        <strong>
                            ${escapePenilaianHTML(
                                indicator
                            )}
                        </strong>

                        <br>

                        <small class="text-info">

                            ${escapePenilaianHTML(
                                kategori
                            )}

                        </small>

                    </div>


                    <div class="col-md-2 text-center">

                        <span class="badge bg-info">

                            ${formatPenilaianNumber(
                                bobot
                            )}%

                        </span>

                    </div>


                    <div class="col-md-5">

                        <input

                            type="number"

                            class="form-control nilaiKPI"

                            data-id="${escapeAttribute(id)}"

                            data-bobot="${escapeAttribute(bobot)}"

                            min="${PENILAIAN_CONFIG.minNilai}"

                            max="${PENILAIAN_CONFIG.maxNilai}"

                            step="0.01"

                            value="100"

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

    const inputs =
        document.querySelectorAll(
            "#listIndikator .nilaiKPI"
        );


    let total =
        0;


    let totalBobot =
        0;


    inputs.forEach(
        function(input) {

            let nilai =
                toPenilaianNumber(
                    input.value
                );


            let bobot =
                toPenilaianNumber(
                    input.dataset.bobot
                );


            if (
                nilai <
                PENILAIAN_CONFIG.minNilai
            ) {

                nilai =
                    PENILAIAN_CONFIG.minNilai;

            }


            if (
                nilai >
                PENILAIAN_CONFIG.maxNilai
            ) {

                nilai =
                    PENILAIAN_CONFIG.maxNilai;

            }


            input.value =
                nilai;


            total +=
                nilai *
                bobot /
                100;


            totalBobot +=
                bobot;

        }
    );


    /*
     * Nilai akhir berbasis bobot.
     *
     * Jika total bobot bukan 100,
     * tetap menggunakan rumus bobot
     * langsung agar sesuai struktur
     * Master KPI yang ada.
     */

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


    console.log(
        "Penilaian calculation:",
        {
            total: total,
            totalBobot: totalBobot
        }
    );

}


/* ==========================================================
 * CLEAR FORM
 * ==========================================================
 */

function clearPenilaianForm() {

    penilaianEditId =
        null;


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

        tahun.value =
            String(
                new Date().getFullYear()
            );

    }


    const status =
        document.getElementById(
            "statusPenilaian"
        );


    if (status) {

        status.value =
            PENILAIAN_CONFIG.defaultStatus;

    }


    const total =
        document.getElementById(
            "totalNilai"
        );


    if (total) {

        total.value =
            "";

    }


    const akhir =
        document.getElementById(
            "nilaiAkhir"
        );


    if (akhir) {

        akhir.value =
            "";

    }

}


/* ==========================================================
 * OPEN MODAL
 * ==========================================================
 */

function openPenilaianModal() {

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


    if (!modalElement) {

        console.error(
            "Modal #penilaianModal tidak ditemukan."
        );

        return;

    }


    if (
        typeof bootstrap ===
        "undefined"
    ) {

        console.error(
            "Bootstrap tidak tersedia."
        );

        return;

    }


    const modal =
        bootstrap.Modal.getOrCreateInstance(
            modalElement
        );


    modal.show();


    /*
     * Pastikan anggota sudah terisi.
     */

    if (
        penilaianAnggotaList.length === 0
    ) {

        loadPenilaianAnggota();

    }


    /*
     * Pastikan Master KPI tersedia.
     */

    if (
        penilaianMasterKPIList.length === 0
    ) {

        loadPenilaianMasterKPI();

    }


    setTimeout(
        function() {

            hitungNilaiPenilaian();

        },
        100
    );

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


    if (
        typeof bootstrap ===
        "undefined"
    ) {

        return;

    }


    const modal =
        bootstrap.Modal.getInstance(
            element
        );


    if (modal) {

        modal.hide();

    }

}


/* ==========================================================
 * VALIDASI FORM
 * ==========================================================
 */

function validatePenilaianForm() {

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


    const status =
        document.getElementById(
            "statusPenilaian"
        );


    if (
        !anggota ||
        !anggota.value
    ) {

        alert(
            "Anggota wajib dipilih."
        );


        if (anggota) {

            anggota.focus();

        }


        return false;

    }


    if (
        !bulan ||
        !bulan.value
    ) {

        alert(
            "Bulan wajib dipilih."
        );


        if (bulan) {

            bulan.focus();

        }


        return false;

    }


    if (
        !tahun ||
        !tahun.value
    ) {

        alert(
            "Tahun wajib dipilih."
        );


        if (tahun) {

            tahun.focus();

        }


        return false;

    }


    if (
        !status ||
        !status.value
    ) {

        alert(
            "Status penilaian wajib dipilih."
        );


        if (status) {

            status.focus();

        }


        return false;

    }


    if (
        penilaianMasterKPIList.length === 0
    ) {

        alert(
            "Master KPI aktif belum tersedia."
        );


        return false;

    }


    return true;

}


/* ==========================================================
 * BUILD PAYLOAD
 * ==========================================================
 */

function buildPenilaianPayload() {

    const anggotaId =
        document.getElementById(
            "anggotaPenilaian"
        ).value;


    const bulan =
        document.getElementById(
            "bulanPenilaian"
        ).value;


    const tahun =
        document.getElementById(
            "tahunPenilaian"
        ).value;


    const status =
        document.getElementById(
            "statusPenilaian"
        ).value;


    const totalNilai =
        toPenilaianNumber(
            document.getElementById(
                "totalNilai"
            ).value
        );


    const nilaiAkhir =
        toPenilaianNumber(
            document.getElementById(
                "nilaiAkhir"
            ).value
        );


    const indikator =
        [];


    document
        .querySelectorAll(
            "#listIndikator .nilaiKPI"
        )
        .forEach(
            function(input) {

                indikator.push({

                    id:
                        input.dataset.id,

                    bobot:
                        toPenilaianNumber(
                            input.dataset.bobot
                        ),

                    nilai:
                        toPenilaianNumber(
                            input.value
                        )

                });

            }
        );


    return {

        id:
            penilaianEditId,

        anggotaId:
            anggotaId,

        bulan:
            Number(bulan),

        tahun:
            Number(tahun),

        totalNilai:
            totalNilai,

        nilaiAkhir:
            nilaiAkhir,

        status:
            status,

        indikator:
            indikator

    };

}


/* ==========================================================
 * SAVE PENILAIAN
 * ==========================================================
 */

async function savePenilaian() {

    if (
        !validatePenilaianForm()
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


        button.innerHTML = `

            <span
                class="spinner-border spinner-border-sm me-2"
            ></span>

            Menyimpan...

        `;

    }


    try {

        const payload =
            buildPenilaianPayload();


        console.log(
            "Penilaian payload:",
            payload
        );


        /*
         * ==================================================
         * CEK API
         * ==================================================
         */

        if (
            typeof API === "undefined"
        ) {

            throw new Error(
                "Objek API belum tersedia."
            );

        }


        /*
         * ==================================================
         * MODE UPDATE
         * ==================================================
         */

        let result;


        if (
            penilaianEditId
        ) {

            if (
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
         * MODE CREATE
         * ==================================================
         */

        else {

            if (
                typeof API.savePenilaian !==
                "function"
            ) {

                throw new Error(
                    "API.savePenilaian belum tersedia di api.js."
                );

            }


            result =
                await API.savePenilaian(
                    payload
                );

        }


        console.log(
            "Penilaian save response:",
            result
        );


        if (!result) {

            throw new Error(
                "Response penyimpanan kosong."
            );

        }


        if (
            result.success === false
        ) {

            throw new Error(
                result.message ||
                "Gagal menyimpan penilaian."
            );

        }


        /*
         * Berhasil.
         */

        closePenilaianModal();


        clearPenilaianForm();


        await loadPenilaianData();


        alert(
            result.message ||
            "Penilaian berhasil disimpan."
        );

    }

    catch (error) {

        console.error(
            "savePenilaian ERROR:",
            error
        );


        alert(
            error.message ||
            "Gagal menyimpan penilaian."
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
 * FILTER PENILAIAN
 * ==========================================================
 */

function filterPenilaian() {

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


    const keyword =
        search
            ? search.value
                .toLowerCase()
                .trim()
            : "";


    const bulanValue =
        bulan
            ? bulan.value
            : "";


    const tahunValue =
        tahun
            ? tahun.value
            : "";


    const statusValue =
        status
            ? status.value
                .toLowerCase()
            : "";


    const hasil =
        penilaianList.filter(
            function(item) {

                const anggota =
                    getPenilaianAnggotaById(
                        item.anggotaId ||
                        item.idAnggota ||
                        item.anggota
                    );


                const nama =
                    String(
                        item.nama ||
                        item.namaAnggota ||
                        (
                            anggota
                                ? anggota.nama
                                : ""
                        ) ||
                        ""
                    )
                        .toLowerCase();


                const itemBulan =
                    String(
                        item.bulan ??
                        ""
                    );


                const itemTahun =
                    String(
                        item.tahun ??
                        ""
                    );


                const itemStatus =
                    String(
                        item.status ||
                        ""
                    )
                        .toLowerCase();


                const cocokNama =
                    !keyword ||
                    nama.includes(
                        keyword
                    );


                const cocokBulan =
                    !bulanValue ||
                    itemBulan ===
                    bulanValue;


                const cocokTahun =
                    !tahunValue ||
                    itemTahun ===
                    tahunValue;


                const cocokStatus =
                    !statusValue ||
                    itemStatus ===
                    statusValue;


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
 * REFRESH
 * ==========================================================
 */

async function refreshPenilaian() {

    console.log(
        "Penilaian: refresh..."
    );


    clearPenilaianForm();


    loadPenilaianTahun();


    await Promise.all([

        loadPenilaianAnggota(),

        loadPenilaianMasterKPI(),

        loadPenilaianData()

    ]);


    filterPenilaian();

}


/* ==========================================================
 * EDIT PENILAIAN
 * ==========================================================
 */

async function editPenilaian(
    id
) {

    const item =
        penilaianList.find(
            function(row) {

                return (
                    String(
                        row.id ||
                        row.penilaianId
                    ) ===
                    String(id)
                );

            }
        );


    if (!item) {

        alert(
            "Data penilaian tidak ditemukan."
        );


        return;

    }


    penilaianEditId =
        id;


    /*
     * Pastikan data anggota
     * tersedia.
     */

    if (
        penilaianAnggotaList.length === 0
    ) {

        await loadPenilaianAnggota();

    }


    const anggotaId =
        item.anggotaId ||
        item.idAnggota ||
        item.anggota ||
        "";


    const anggota =
        document.getElementById(
            "anggotaPenilaian"
        );


    if (anggota) {

        anggota.value =
            String(
                anggotaId
            );

    }


    const bulan =
        document.getElementById(
            "bulanPenilaian"
        );


    if (bulan) {

        bulan.value =
            String(
                item.bulan ||
                1
            );

    }


    const tahun =
        document.getElementById(
            "tahunPenilaian"
        );


    if (tahun) {

        tahun.value =
            String(
                item.tahun ||
                new Date().getFullYear()
            );

    }


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
     * Render KPI terlebih dahulu.
     */

    renderPenilaianIndikator();


    /*
     * Jika data indikator tersedia,
     * masukkan nilainya.
     */

    const indikatorData =
        item.indikator ||
        item.detail ||
        item.details ||
        [];


    if (
        Array.isArray(
            indikatorData
        )
    ) {

        indikatorData.forEach(
            function(detail) {

                const detailId =
                    detail.id ||
                    detail.kpiId ||
                    detail.indikatorId;


                const input =
                    document.querySelector(
                        `#listIndikator .nilaiKPI[data-id="${CSS.escape(String(detailId))}"]`
                    );


                if (input) {

                    input.value =
                        toPenilaianNumber(
                            detail.nilai
                        );

                }

            }
        );

    }


    hitungNilaiPenilaian();


    const title =
        document.querySelector(
            "#penilaianModal .modal-title"
        );


    if (title) {

        title.textContent =
            "Edit Penilaian";

    }


    const modalElement =
        document.getElementById(
            "penilaianModal"
        );


    if (
        modalElement &&
        typeof bootstrap !==
        "undefined"
    ) {

        const modal =
            bootstrap.Modal.getOrCreateInstance(
                modalElement
            );


        modal.show();

    }

}


/* ==========================================================
 * VIEW PENILAIAN
 * ==========================================================
 */

function viewPenilaian(
    id
) {

    const item =
        penilaianList.find(
            function(row) {

                return (
                    String(
                        row.id ||
                        row.penilaianId
                    ) ===
                    String(id)
                );

            }
        );


    if (!item) {

        alert(
            "Data penilaian tidak ditemukan."
        );


        return;

    }


    /*
     * Untuk sementara gunakan modal
     * dalam mode edit/view.
     */

    editPenilaian(id);

}


/* ==========================================================
 * GET ANGGOTA BY ID
 * ==========================================================
 */

function getPenilaianAnggotaById(
    id
) {

    if (
        id === undefined ||
        id === null ||
        id === ""
    ) {

        return null;

    }


    return (
        penilaianAnggotaList.find(
            function(item) {

                return (
                    String(item.id) ===
                    String(id)
                );

            }
        ) ||
        null
    );

}


/* ==========================================================
 * FORMAT BULAN
 * ==========================================================
 */

function formatPenilaianBulan(
    value
) {

    if (
        value === undefined ||
        value === null ||
        value === ""
    ) {

        return "-";

    }


    const numeric =
        Number(value);


    return (
        PENILAIAN_BULAN[numeric] ||
        String(value)
    );

}


/* ==========================================================
 * FORMAT NUMBER
 * ==========================================================
 */

function formatPenilaianNumber(
    value
) {

    const number =
        toPenilaianNumber(
            value
        );


    return number.toFixed(2);

}


/* ==========================================================
 * NUMBER PARSER
 * ==========================================================
 */

function toPenilaianNumber(
    value
) {

    if (
        value === undefined ||
        value === null ||
        value === ""
    ) {

        return 0;

    }


    const normalized =
        String(value)
            .replace(",", ".")
            .trim();


    const number =
        Number(
            normalized
        );


    return Number.isFinite(
        number
    )
        ? number
        : 0;

}


/* ==========================================================
 * ESCAPE HTML
 * ==========================================================
 */

function escapePenilaianHTML(
    value
) {

    return String(
        value ??
        ""
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
 * ESCAPE ATTRIBUTE
 * ==========================================================
 */

function escapeAttribute(
    value
) {

    return String(
        value ??
        ""
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
            "&quot;"
        );

}


/* ==========================================================
 * UPDATE SUMMARY
 * ==========================================================
 */

function updatePenilaianSummary() {

    const total =
        document.getElementById(
            "totalNilai"
        );


    const akhir =
        document.getElementById(
            "nilaiAkhir"
        );


    if (
        !total ||
        !akhir
    ) {

        return;

    }


    if (
        !total.value
    ) {

        total.value =
            "0.00";

    }


    if (
        !akhir.value
    ) {

        akhir.value =
            "0.00";

    }

}


/* ==========================================================
 * EXPORT GLOBAL
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


window.clearPenilaianForm =
    clearPenilaianForm;


window.openPenilaianModal =
    openPenilaianModal;


window.closePenilaianModal =
    closePenilaianModal;


window.validatePenilaianForm =
    validatePenilaianForm;


window.savePenilaian =
    savePenilaian;


window.filterPenilaian =
    filterPenilaian;


window.refreshPenilaian =
    refreshPenilaian;


window.editPenilaian =
    editPenilaian;


window.viewPenilaian =
    viewPenilaian;


/* ==========================================================
 * END
 * ==========================================================
 */

console.log(
    "Guardian KPI penilaian.js 5.1.0 FINAL loaded."
);
