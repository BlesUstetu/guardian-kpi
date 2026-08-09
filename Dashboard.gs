/**
 * ==========================================================
 * Guardian KPI Web3
 * File : Dashboard.gs
 * Version : 5.0.0 Enterprise
 * Module : Dashboard Analytics
 * Author : BlesProduction
 * ==========================================================
 */


/* ==========================================================
 * GET DASHBOARD
 *
 * Sumber:
 * - Anggota
 * - Group
 * - Master KPI
 * - Penilaian
 *
 * Semua statistik Dashboard berasal dari sumber data
 * yang sama sehingga tidak terjadi perbedaan angka antar
 * komponen Dashboard.
 * ==========================================================
 */

function getDashboard(){

    try{

        /* ==================================================
         * LOAD DATA
         * ==================================================
         */

        const anggota =
            DB.getData(
                CONFIG.SHEET.ANGGOTA
            ) || [];

        const group =
            DB.getData(
                CONFIG.SHEET.GROUP
            ) || [];

        const masterKPI =
            DB.getData(
                CONFIG.SHEET.MASTER_KPI
            ) || [];

        const penilaian =
            DB.getData(
                CONFIG.SHEET.PENILAIAN
            ) || [];


        /* ==================================================
         * ANGGOTA
         * ==================================================
         */

        const totalAnggota =
            anggota.length;

        const anggotaAktif =
            anggota.filter(function(item){

                return String(
                    item.status || ""
                )
                .trim()
                .toLowerCase() === "aktif";

            }).length;

        const anggotaNonAktif =
            totalAnggota -
            anggotaAktif;


        /* ==================================================
         * GROUP
         * ==================================================
         */

        const totalGroup =
            group.length;


        /* ==================================================
         * MASTER KPI
         * ==================================================
         */

        const totalMasterKPI =
            masterKPI.length;

        const masterKPIAktif =
            masterKPI.filter(function(item){

                return String(
                    item.status || ""
                )
                .trim()
                .toLowerCase() === "aktif";

            });


        /* ==================================================
         * PENILAIAN
         * ==================================================
         */

        const totalPenilaian =
            penilaian.length;


        /* ==================================================
         * MASTER KPI ANALYTICS
         * ==================================================
         */

        const kategoriResult =
            buildMasterKPIKategori(
                masterKPIAktif
            );

        const indikatorResult =
            buildMasterKPIIndikator(
                masterKPIAktif
            );


        /* ==================================================
         * RESULT
         * ==================================================
         */

        const data = {

            /* ----------------------------------------------
             * STATISTIK UTAMA
             * ---------------------------------------------- */

            totalAnggota:
                totalAnggota,

            anggotaAktif:
                anggotaAktif,

            anggotaNonAktif:
                anggotaNonAktif,

            totalGroup:
                totalGroup,

            totalMasterKPI:
                totalMasterKPI,

            totalPenilaian:
                totalPenilaian,


            /* ----------------------------------------------
             * MASTER KPI
             * ---------------------------------------------- */

            masterKPIAktif:
                masterKPIAktif.length,

            masterKPINonAktif:
                totalMasterKPI -
                masterKPIAktif.length,


            /* ----------------------------------------------
             * CATEGORY CHART
             * ---------------------------------------------- */

            categoryAvailable:
                kategoriResult.available,

            masterKPIKategori:
                kategoriResult.data,


            /* ----------------------------------------------
             * INDICATOR CHART
             * ---------------------------------------------- */

            masterKPIIndikator:
                indikatorResult.data,


            /* ----------------------------------------------
             * METADATA
             * ---------------------------------------------- */

            generatedAt:
                new Date().toISOString()

        };


        return Utils.success(

            "Dashboard berhasil diambil.",

            data

        );

    }

    catch(err){

        return Utils.error(

            err.message

        );

    }

}


/* ==========================================================
 * BUILD MASTER KPI CATEGORY
 *
 * Pie chart:
 *
 * Kategori → jumlah indikator
 *
 * Contoh:
 *
 * [
 *   {
 *      kategori : "Disiplin",
 *      jumlah   : 3
 *   }
 * ]
 *
 * Tidak membuat kategori fiktif.
 * ==========================================================
 */

function buildMasterKPIKategori(data){

    if(!Array.isArray(data)){

        return {

            available:false,

            data:[]

        };

    }


    /*
     * Deteksi apakah kolom kategori tersedia.
     */

    const hasKategori =
        data.some(function(item){

            return Object.prototype
                .hasOwnProperty.call(
                    item,
                    "kategori"
                );

        });


    if(!hasKategori){

        return {

            available:false,

            data:[]

        };

    }


    const map = {};


    data.forEach(function(item){

        const kategori =
            String(
                item.kategori || ""
            ).trim();


        /*
         * Jangan memasukkan kategori kosong
         * ke chart sebagai kategori palsu.
         */

        if(!kategori){

            return;

        }


        if(
            !map[kategori]
        ){

            map[kategori] = 0;

        }


        map[kategori]++;

    });


    const result =
        Object.keys(map)
        .map(function(kategori){

            return {

                kategori:
                    kategori,

                jumlah:
                    map[kategori]

            };

        });


    /*
     * Urutkan dari jumlah terbesar.
     */

    result.sort(function(a,b){

        return b.jumlah -
               a.jumlah;

    });


    return {

        available:
            result.length > 0,

        data:
            result

    };

}


/* ==========================================================
 * BUILD MASTER KPI INDICATOR
 *
 * Horizontal bar chart.
 *
 * Nilai utama yang digunakan:
 * bobot KPI.
 *
 * Bobot berasal langsung dari Master KPI.
 * ==========================================================
 */

function buildMasterKPIIndikator(data){

    if(!Array.isArray(data)){

        return [];

    }


    return data
        .map(function(item){

            const indicator =
                getKPIIndicatorName(
                    item
                );

            const bobot =
                Number(
                    item.bobot || 0
                );

            const target =
                Number(
                    item.target || 0
                );


            return {

                id:
                    item.id || "",

                indikator:
                    indicator,

                bobot:
                    bobot,

                target:
                    target,

                status:
                    item.status || ""

            };

        })

        /*
         * KPI dengan bobot terbesar
         * ditampilkan terlebih dahulu.
         */

        .sort(function(a,b){

            return b.bobot -
                   a.bobot;

        });

}


/* ==========================================================
 * GET KPI INDICATOR NAME
 *
 * Mendukung beberapa nama field yang sudah muncul
 * dalam versi Master KPI proyek:
 *
 * indicator
 * nama
 * nama_kpi
 *
 * Prioritas:
 *
 * indicator → nama → nama_kpi
 * ==========================================================
 */

function getKPIIndicatorName(item){

    if(!item){

        return "";

    }


    const indicator =
        String(
            item.indicator || ""
        ).trim();


    if(indicator){

        return indicator;

    }


    const nama =
        String(
            item.nama || ""
        ).trim();


    if(nama){

        return nama;

    }


    const namaKPI =
        String(
            item.nama_kpi || ""
        ).trim();


    if(namaKPI){

        return namaKPI;

    }


    return "KPI Tanpa Nama";

}
