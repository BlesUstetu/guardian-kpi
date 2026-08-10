/**
 * ==========================================================
 * Guardian KPI Web3
 * File : Penilaian.gs
 * Version : 8.0.0 FINAL
 * Module : PENILAIAN
 * ==========================================================
 *
 * LOGIKA PENILAIAN FINAL
 *
 * ----------------------------------------------------------
 * 1. ID PENILAIAN = ID TETAP ANGGOTA
 * ----------------------------------------------------------
 *
 * Contoh:
 *
 * P0001 | BLES | Agustus   | 2026
 * P0001 | BLES | September | 2026
 * P0001 | BLES | Oktober   | 2026
 *
 * ID P0001 tetap.
 *
 *
 * ----------------------------------------------------------
 * 2. BULAN BARU = BARIS BARU
 * ----------------------------------------------------------
 *
 * Penilaian baru untuk bulan berbeda tidak melakukan UPDATE
 * terhadap bulan sebelumnya.
 *
 * Selalu INSERT baris baru.
 *
 *
 * ----------------------------------------------------------
 * 3. UNIQUE PERIOD
 * ----------------------------------------------------------
 *
 * Satu anggota hanya boleh mempunyai satu penilaian:
 *
 *      anggotaId + bulan + tahun
 *
 *
 * ----------------------------------------------------------
 * 4. EDIT
 * ----------------------------------------------------------
 *
 * Identitas baris:
 *
 *      ID + bulan + tahun
 *
 * Contoh:
 *
 *      P0001|8|2026
 *
 *
 * ----------------------------------------------------------
 * 5. DELETE
 * ----------------------------------------------------------
 *
 * Sama:
 *
 *      ID + bulan + tahun
 *
 *
 * ----------------------------------------------------------
 * 6. NILAI AKHIR
 * ----------------------------------------------------------
 *
 * Nilai akhir dihitung ulang di server:
 *
 *      nilai × bobot / 100
 *
 *
 * ----------------------------------------------------------
 * 7. LOCK
 * ----------------------------------------------------------
 *
 * LockService digunakan pada SAVE / UPDATE / DELETE
 * untuk mencegah konflik ketika dua request datang bersamaan.
 *
 * ==========================================================
 */


/* ==========================================================
 * GET SEMUA PENILAIAN
 * ==========================================================
 */

function getPenilaian() {

  try {

    const data =
      DB.getData(
        CONFIG.SHEET.PENILAIAN
      ) || [];


    const anggota =
      DB.getData(
        CONFIG.SHEET.ANGGOTA
      ) || [];


    /*
     * Map anggota.
     *
     * S001 → data anggota
     */

    const anggotaMap = {};


    anggota.forEach(function(item) {

      const id =
        String(
          item.id || ""
        ).trim();


      if (id) {

        anggotaMap[id] =
          item;

      }

    });


    /*
     * Bentuk response.
     */

    const result =
      data.map(function(row) {

        return buildPenilaianResponse(
          row,
          anggotaMap
        );

      });


    return Utils.success(
      "Data penilaian berhasil diambil.",
      result
    );


  }
  catch (err) {

    return Utils.error(
      "Gagal mengambil data penilaian : " +
      err.message
    );

  }

}


/* ==========================================================
 * GET PENILAIAN BY ROW KEY
 *
 * Input bisa:
 *
 * P0001|8|2026
 *
 * atau ID lama:
 *
 * P0001
 *
 * ==========================================================
 */

function getPenilaianById(id) {

  try {

    const rowKey =
      parsePenilaianRowKey(
        id
      );


    const row =
      findPenilaianRowByKey(
        rowKey
      );


    if (!row) {

      return Utils.error(
        "Data penilaian tidak ditemukan."
      );

    }


    const anggota =
      DB.getData(
        CONFIG.SHEET.ANGGOTA
      ) || [];


    const anggotaMap = {};


    anggota.forEach(function(item) {

      const anggotaId =
        String(
          item.id || ""
        ).trim();


      if (anggotaId) {

        anggotaMap[anggotaId] =
          item;

      }

    });


    return Utils.success(
      "Data penilaian berhasil diambil.",
      buildPenilaianResponse(
        row,
        anggotaMap
      )
    );


  }
  catch (err) {

    return Utils.error(
      err.message
    );

  }

}


/* ==========================================================
 * SAVE PENILAIAN BARU
 * ==========================================================
 */

function savePenilaian(data) {

  const lock =
    LockService.getScriptLock();


  try {

    /*
     * Tunggu maksimal 15 detik.
     */

    lock.waitLock(
      15000
    );


    /*
     * Normalisasi data.
     */

    const payload =
      normalizePenilaianPayload(
        data
      );


    /*
     * Validasi + hitung nilai.
     */

    const context =
      validatePenilaianPayload(
        payload,
        null
      );


    /*
     * CEK DUPLIKASI
     *
     * anggota + bulan + tahun
     */

    const duplicate =
      findDuplicatePenilaian(
        payload.anggotaId,
        payload.bulan,
        payload.tahun,
        null
      );


    if (duplicate) {

      return Utils.error(

        "Penilaian untuk " +

        context.anggota.nama +

        " pada " +

        namaBulanPenilaian(
          payload.bulan
        ) +

        " " +

        payload.tahun +

        " sudah ada dengan ID " +

        duplicate.id +

        ". Silakan gunakan Edit."

      );

    }


    /*
     * ======================================================
     * CARI ID PERSISTEN ANGGOTA
     * ======================================================
     *
     * Jika anggota pernah dinilai:
     *
     * gunakan ID terakhir.
     *
     * Jika belum:
     *
     * generate ID baru.
     */

    const existingId =
      findLatestPenilaianIdForAnggota(
        payload.anggotaId
      );


    const id =
      existingId ||
      Utils.generateId(
        CONFIG.SHEET.PENILAIAN,
        CONFIG.PREFIX.PENILAIAN
      );


    /*
     * Timestamp.
     */

    const now =
      Utils.timestamp();


    /*
     * Build record.
     */

    const record =
      buildPenilaianRecord(
        id,
        payload,
        context,
        now,
        now
      );


    /*
     * INSERT BARIS BARU.
     *
     * Sangat penting:
     *
     * Jangan update periode sebelumnya.
     */

    insertPenilaianRecord(
      record
    );


    return Utils.success(

      "Penilaian berhasil ditambahkan dengan ID " +
      id +
      ".",

      buildPenilaianResponse(
        record,
        context.anggotaMap
      )

    );


  }
  catch (err) {

    return Utils.error(
      err.message
    );


  }
  finally {

    try {

      lock.releaseLock();

    }
    catch (e) {}

  }

}


/* ==========================================================
 * UPDATE PENILAIAN
 *
 * ID yang dikirim frontend:
 *
 * P0001|8|2026
 *
 * ==========================================================
 */

function updatePenilaian(
  id,
  data
) {

  const lock =
    LockService.getScriptLock();


  try {

    lock.waitLock(
      15000
    );


    /*
     * Parse row key.
     */

    const oldRowKey =
      parsePenilaianRowKey(
        id
      );


    if (
      !oldRowKey.id
    ) {

      return Utils.error(
        "ID penilaian tidak valid."
      );

    }


    /*
     * Cari baris lama.
     */

    const existing =
      findPenilaianRowByKey(
        oldRowKey
      );


    if (!existing) {

      return Utils.error(
        "Data penilaian tidak ditemukan."
      );

    }


    /*
     * Normalisasi payload baru.
     */

    const payload =
      normalizePenilaianPayload(
        data
      );


    /*
     * Pastikan anggota tidak berubah.
     *
     * ID sekarang merupakan ID persisten anggota.
     */

    if (
      String(
        payload.anggotaId
      ).trim() !==
      String(
        existing.anggotaId ||
        existing.anggotaID ||
        ""
      ).trim()
    ) {

      return Utils.error(
        "Anggota tidak dapat diganti ketika Edit. " +
        "Buat Penilaian Baru untuk anggota lain."
      );

    }


    /*
     * Validasi.
     */

    const context =
      validatePenilaianPayload(
        payload,
        existing
      );


    /*
     * CEK DUPLIKASI
     *
     * Abaikan baris yang sedang diedit.
     */

    const duplicate =
      findDuplicatePenilaian(
        payload.anggotaId,
        payload.bulan,
        payload.tahun,
        oldRowKey
      );


    if (duplicate) {

      return Utils.error(

        "Tidak dapat menyimpan perubahan.\n\n" +

        "Penilaian untuk " +

        context.anggota.nama +

        " pada " +

        namaBulanPenilaian(
          payload.bulan
        ) +

        " " +

        payload.tahun +

        " sudah digunakan oleh ID " +

        duplicate.id +

        "."

      );

    }


    /*
     * ======================================================
     * PENTING
     * ======================================================
     *
     * ID tetap menggunakan ID lama.
     *
     * Tidak generate ID baru.
     */

    const idTetap =
      String(
        existing.id
      ).trim();


    const now =
      Utils.timestamp();


    const record =
      buildPenilaianRecord(
        idTetap,
        payload,
        context,
        existing.createdAt ||
        now,
        now
      );


    /*
     * Update baris:
     *
     * ID + BULAN + TAHUN LAMA
     */

    const updated =
      updatePenilaianRowByKey(
        oldRowKey,
        record
      );


    if (!updated) {

      return Utils.error(
        "Baris penilaian tidak ditemukan."
      );

    }


    return Utils.success(

      "Penilaian berhasil diperbarui.",

      buildPenilaianResponse(
        record,
        context.anggotaMap
      )

    );


  }
  catch (err) {

    return Utils.error(
      err.message
    );


  }
  finally {

    try {

      lock.releaseLock();

    }
    catch (e) {}

  }

}


/* ==========================================================
 * DELETE PENILAIAN
 *
 * Input:
 *
 * P0001|8|2026
 *
 * ==========================================================
 */

function deletePenilaian(id) {

  const lock =
    LockService.getScriptLock();


  try {

    lock.waitLock(
      15000
    );


    const rowKey =
      parsePenilaianRowKey(
        id
      );


    if (
      !rowKey.id
    ) {

      return Utils.error(
        "ID penilaian tidak valid."
      );

    }


    const deleted =
      deletePenilaianRowByKey(
        rowKey
      );


    if (!deleted) {

      return Utils.error(
        "Data penilaian tidak ditemukan."
      );

    }


    return Utils.success(
      "Penilaian berhasil dihapus."
    );


  }
  catch (err) {

    return Utils.error(
      err.message
    );


  }
  finally {

    try {

      lock.releaseLock();

    }
    catch (e) {}

  }

}


/* ==========================================================
 * NORMALIZE PAYLOAD
 * ==========================================================
 */

function normalizePenilaianPayload(
  data
) {

  data =
    data || {};


  return {

    anggotaId:
      String(
        data.anggotaId ||
        data.anggotaID ||
        ""
      ).trim(),

    bulan:
      Number(
        data.bulan ||
        0
      ),

    tahun:
      Number(
        data.tahun ||
        0
      ),

    status:
      String(
        data.status ||
        "Draft"
      ).trim(),

    detail:
      data.detail ||
      []

  };

}


/* ==========================================================
 * VALIDASI PAYLOAD
 * ==========================================================
 */

function validatePenilaianPayload(
  data,
  existing
) {

  /*
   * ANGGOTA
   */

  if (
    Utils.isEmpty(
      data.anggotaId
    )
  ) {

    throw new Error(
      "Anggota wajib dipilih."
    );

  }


  /*
   * BULAN
   */

  const bulan =
    Number(
      data.bulan
    );


  if (
    !Number.isInteger(
      bulan
    ) ||
    bulan < 1 ||
    bulan > 12
  ) {

    throw new Error(
      "Bulan penilaian tidak valid."
    );

  }


  /*
   * TAHUN
   */

  const tahun =
    Number(
      data.tahun
    );


  if (
    !Number.isInteger(
      tahun
    ) ||
    tahun < 2000 ||
    tahun > 2100
  ) {

    throw new Error(
      "Tahun penilaian tidak valid."
    );

  }


  /*
   * CARI ANGGOTA
   */

  const anggota =
    DB.find(
      CONFIG.SHEET.ANGGOTA,
      "id",
      data.anggotaId
    );


  if (!anggota) {

    throw new Error(
      "Anggota tidak ditemukan."
    );

  }


  /*
   * STATUS
   */

  if (
    Utils.isEmpty(
      data.status
    )
  ) {

    data.status =
      "Draft";

  }


  const status =
    String(
      data.status
    ).trim();


  if (
    status !== "Draft" &&
    status !== "Final"
  ) {

    throw new Error(
      "Status penilaian harus Draft atau Final."
    );

  }


  /*
   * MASTER KPI
   */

  const kpiMap =
    getMasterKPIMap();


  /*
   * DETAIL KPI
   */

  const detail =
    normalizeAndValidateDetail(
      data.detail,
      kpiMap,
      existing
    );


  if (
    !detail.length
  ) {

    throw new Error(
      "Detail KPI wajib diisi."
    );

  }


  /*
   * HITUNG NILAI AKHIR
   *
   * Nilai × Bobot / 100
   */

  let total = 0;


  detail.forEach(
    function(item) {

      total +=
        Number(
          item.nilai
        ) *
        Number(
          item.bobot
        ) /
        100;

    }
  );


  total =
    roundPenilaian(
      total
    );


  /*
   * Masukkan hasil perhitungan
   * ke payload.
   */

  data.bulan =
    bulan;


  data.tahun =
    tahun;


  data.status =
    status;


  data.detail =
    detail;


  data.total =
    total;


  data.nilaiAkhir =
    total;


  /*
   * Map anggota.
   */

  const anggotaMap = {};


  anggotaMap[
    String(
      anggota.id
    ).trim()
  ] =
    anggota;


  return {

    anggota:
      anggota,

    anggotaMap:
      anggotaMap,

    kpiMap:
      kpiMap

  };

}


/* ==========================================================
 * NORMALIZE + VALIDATE DETAIL
 * ==========================================================
 */

function normalizeAndValidateDetail(
  rawDetail,
  kpiMap,
  existing
) {

  let detail =
    rawDetail;


  /*
   * JSON string → array.
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


  /*
   * Detail lama.
   *
   * Digunakan untuk KPI historis.
   */

  const oldDetailMap = {};


  if (
    existing &&
    existing.detail
  ) {

    let oldDetail =
      existing.detail;


    if (
      typeof oldDetail ===
      "string"
    ) {

      try {

        oldDetail =
          JSON.parse(
            oldDetail
          );

      }
      catch (err) {

        oldDetail = [];

      }

    }


    if (
      Array.isArray(
        oldDetail
      )
    ) {

      oldDetail.forEach(
        function(item) {

          const kpiId =
            String(
              item.kpiId ||
              item.id ||
              ""
            ).trim();


          if (
            kpiId
          ) {

            oldDetailMap[
              kpiId
            ] =
              item;

          }

        }
      );

    }

  }


  /*
   * Hasil.
   */

  const result = [];


  /*
   * Cegah KPI duplikat.
   */

  const seen = {};


  detail.forEach(
    function(item) {

      item =
        item || {};


      const kpiId =
        String(
          item.kpiId ||
          item.id ||
          ""
        ).trim();


      if (
        !kpiId
      ) {

        return;

      }


      /*
       * Jangan masukkan KPI dua kali.
       */

      if (
        seen[kpiId]
      ) {

        return;

      }


      /*
       * KPI aktif/current.
       */

      const kpi =
        kpiMap[
          kpiId
        ];


      /*
       * KPI historis.
       */

      const old =
        oldDetailMap[
          kpiId
        ];


      let bobot = 0;


      /*
       * Jika KPI masih ada di Master KPI:
       * gunakan bobot terbaru.
       */

      if (
        kpi
      ) {

        bobot =
          Number(
            kpi.bobot ||
            0
          );

      }


      /*
       * Jika KPI sudah tidak ada:
       * gunakan bobot historis.
       */

      else if (
        old
      ) {

        bobot =
          Number(
            old.bobot ||
            0
          );

      }


      else {

        throw new Error(
          "KPI " +
          kpiId +
          " tidak ditemukan."
        );

      }


      /*
       * Nilai.
       */

      const nilai =
        Number(
          item.nilai
        );


      if (
        !Number.isFinite(
          nilai
        ) ||
        nilai < 0 ||
        nilai > 100
      ) {

        throw new Error(
          "Nilai KPI harus berada di antara 0 sampai 100."
        );

      }


      /*
       * Bobot.
       */

      if (
        !Number.isFinite(
          bobot
        ) ||
        bobot < 0
      ) {

        throw new Error(
          "Bobot KPI tidak valid untuk " +
          kpiId +
          "."
        );

      }


      seen[
        kpiId
      ] =
        true;


      result.push({

        kpiId:
          kpiId,

        bobot:
          bobot,

        nilai:
          roundPenilaian(
            nilai
          )

      });

    }
  );


  return result;

}


/* ==========================================================
 * MASTER KPI MAP
 * ==========================================================
 */

function getMasterKPIMap() {

  const data =
    DB.getData(
      CONFIG.SHEET.KPI
    ) || [];


  const map = {};


  data.forEach(
    function(item) {

      const id =
        String(
          item.id ||
          ""
        ).trim();


      if (
        id
      ) {

        map[
          id
        ] =
          item;

      }

    }
  );


  return map;

}


/* ==========================================================
 * FIND DUPLICATE
 *
 * UNIQUE:
 *
 * anggota + bulan + tahun
 *
 * excludeRowKey digunakan ketika Edit.
 * ==========================================================
 */

function findDuplicatePenilaian(
  anggotaId,
  bulan,
  tahun,
  excludeRowKey
) {

  const data =
    DB.getData(
      CONFIG.SHEET.PENILAIAN
    ) || [];


  const targetAnggota =
    String(
      anggotaId ||
      ""
    )
    .trim()
    .toLowerCase();


  const targetBulan =
    Number(
      bulan
    );


  const targetTahun =
    Number(
      tahun
    );


  const excluded =
    excludeRowKey
      ? excludeRowKey
      : null;


  for (
    let i = 0;
    i < data.length;
    i++
  ) {

    const row =
      canonicalizePenilaianRow(
        data[i]
      );


    /*
     * Abaikan baris yang sedang diedit.
     */

    if (
      excluded &&
      String(
        row.id ||
        ""
      ).trim() ===
      String(
        excluded.id ||
        ""
      ).trim() &&
      Number(
        row.bulan
      ) ===
      Number(
        excluded.bulan
      ) &&
      Number(
        row.tahun
      ) ===
      Number(
        excluded.tahun
      )
    ) {

      continue;

    }


    const rowAnggota =
      String(
        row.anggotaId ||
        row.anggotaID ||
        ""
      )
      .trim()
      .toLowerCase();


    const rowBulan =
      Number(
        row.bulan ||
        0
      );


    const rowTahun =
      Number(
        row.tahun ||
        0
      );


    if (
      rowAnggota ===
        targetAnggota &&

      rowBulan ===
        targetBulan &&

      rowTahun ===
        targetTahun
    ) {

      return row;

    }

  }


  return null;

}


/* ==========================================================
 * FIND LATEST ID FOR ANGGOTA
 *
 * Contoh:
 *
 * P0001 | Agustus 2026
 * P0001 | September 2026
 *
 * hasil:
 *
 * P0001
 *
 * ==========================================================
 */

function findLatestPenilaianIdForAnggota(
  anggotaId
) {

  const data =
    DB.getData(
      CONFIG.SHEET.PENILAIAN
    ) || [];


  const target =
    String(
      anggotaId ||
      ""
    )
    .trim()
    .toLowerCase();


  let latestId =
    null;


  let latestPeriod =
    -1;


  let latestIndex =
    -1;


  data.forEach(
    function(rawRow, index) {

      const row =
        canonicalizePenilaianRow(
          rawRow
        );


      const rowAnggota =
        String(
          row.anggotaId ||
          row.anggotaID ||
          ""
        )
        .trim()
        .toLowerCase();


      if (
        rowAnggota !==
        target
      ) {

        return;

      }


      const tahun =
        Number(
          row.tahun ||
          0
        );


      const bulan =
        Number(
          row.bulan ||
          0
        );


      /*
       * 2026 + 08
       *
       * menjadi:
       *
       * 202608
       */

      const period =
        tahun * 100 +
        bulan;


      if (
        period >
          latestPeriod ||

        (
          period ===
          latestPeriod &&
          index >
          latestIndex
        )
      ) {

        latestId =
          String(
            row.id ||
            ""
          ).trim();


        latestPeriod =
          period;


        latestIndex =
          index;

      }

    }
  );


  return latestId;

}


/* ==========================================================
 * PARSE ROW KEY
 *
 * Format:
 *
 * P0001|8|2026
 *
 * ==========================================================
 */

function parsePenilaianRowKey(
  key
) {

  const raw =
    String(
      key ||
      ""
    ).trim();


  const parts =
    raw.split("|");


  /*
   * Format baru.
   */

  if (
    parts.length === 3
  ) {

    const id =
      String(
        parts[0] ||
        ""
      ).trim();


    const bulan =
      Number(
        parts[1]
      );


    const tahun =
      Number(
        parts[2]
      );


    if (
      id &&
      Number.isInteger(
        bulan
      ) &&
      Number.isInteger(
        tahun
      )
    ) {

      return {

        id:
          id,

        bulan:
          bulan,

        tahun:
          tahun

      };

    }

  }


  /*
   * Kompatibilitas:
   *
   * P0001
   */

  return {

    id:
      raw,

    bulan:
      null,

    tahun:
      null

  };

}


/* ==========================================================
 * FIND ROW BY KEY
 * ==========================================================
 */

function findPenilaianRowByKey(
  rowKey
) {

  const data =
    DB.getData(
      CONFIG.SHEET.PENILAIAN
    ) || [];


  for (
    let i = 0;
    i < data.length;
    i++
  ) {

    const row =
      canonicalizePenilaianRow(
        data[i]
      );


    /*
     * ID.
     */

    const sameId =
      String(
        row.id ||
        ""
      ).trim() ===
      String(
        rowKey.id ||
        ""
      ).trim();


    if (
      !sameId
    ) {

      continue;

    }


    /*
     * Jika row key mempunyai bulan,
     * cek bulan.
     */

    if (
      rowKey.bulan !==
      null
    ) {

      if (
        Number(
          row.bulan
        ) !==
        Number(
          rowKey.bulan
        )
      ) {

        continue;

      }

    }


    /*
     * Jika row key mempunyai tahun,
     * cek tahun.
     */

    if (
      rowKey.tahun !==
      null
    ) {

      if (
        Number(
          row.tahun
        ) !==
        Number(
          rowKey.tahun
        )
      ) {

        continue;

      }

    }


    return row;

  }


  return null;

}


/* ==========================================================
 * INSERT PENILAIAN
 *
 * Selalu append row baru.
 * ==========================================================
 */

function insertPenilaianRecord(
  record
) {

  const sheet =
    DB.getSheet(
      CONFIG.SHEET.PENILAIAN
    );


  let lastColumn =
    sheet.getLastColumn();


  if (
    lastColumn < 1
  ) {

    throw new Error(
      "Sheet Penilaian belum memiliki header."
    );

  }


  let headers =
    sheet
      .getRange(
        1,
        1,
        1,
        lastColumn
      )
      .getValues()[0]
      .map(
        function(header) {

          return String(
            header
          ).trim();

        }
      );


  /*
   * Pastikan kolom DETAIL tersedia.
   */

  const detailExists =
    headers.some(
      function(header) {

        return (
          normalizePenilaianHeader(
            header
          ) ===
          "detail"
        );

      }
    );


  if (
    !detailExists
  ) {

    sheet
      .getRange(
        1,
        lastColumn + 1
      )
      .setValue(
        "detail"
      );


    headers.push(
      "detail"
    );

  }


  /*
   * Build row sesuai header Sheet.
   */

  const row =
    headers.map(
      function(header) {

        const field =
          canonicalPenilaianField(
            header
          );


        return (
          record[field] !==
          undefined
            ? record[field]
            : ""
        );

      }
    );


  /*
   * APPEND.
   */

  sheet.appendRow(
    row
  );


  return true;

}


/* ==========================================================
 * UPDATE ROW BY KEY
 *
 * Update:
 *
 * ID + bulan + tahun
 *
 * ==========================================================
 */

function updatePenilaianRowByKey(
  rowKey,
  record
) {

  const sheet =
    DB.getSheet(
      CONFIG.SHEET.PENILAIAN
    );


  const values =
    sheet
      .getDataRange()
      .getValues();


  if (
    values.length <= 1
  ) {

    return false;

  }


  const headers =
    values[0].map(
      function(header) {

        return String(
          header
        ).trim();

      }
    );


  const idIndex =
    findHeaderIndex(
      headers,
      "id"
    );


  const bulanIndex =
    findHeaderIndex(
      headers,
      "bulan"
    );


  const tahunIndex =
    findHeaderIndex(
      headers,
      "tahun"
    );


  if (
    idIndex === -1
  ) {

    throw new Error(
      "Kolom ID pada Sheet Penilaian tidak ditemukan."
    );

  }


  /*
   * Cari baris.
   */

  for (
    let rowIndex = 1;
    rowIndex < values.length;
    rowIndex++
  ) {

    /*
     * Match ID.
     */

    if (
      String(
        values[rowIndex][idIndex]
      ).trim() !==
      String(
        rowKey.id
      ).trim()
    ) {

      continue;

    }


    /*
     * Match bulan jika tersedia.
     */

    if (
      rowKey.bulan !==
        null &&
      bulanIndex !== -1
    ) {

      if (
        Number(
          values[rowIndex][bulanIndex]
        ) !==
        Number(
          rowKey.bulan
        )
      ) {

        continue;

      }

    }


    /*
     * Match tahun jika tersedia.
     */

    if (
      rowKey.tahun !==
        null &&
      tahunIndex !== -1
    ) {

      if (
        Number(
          values[rowIndex][tahunIndex]
        ) !==
        Number(
          rowKey.tahun
        )
      ) {

        continue;

      }

    }


    /*
     * Update kolom.
     */

    headers.forEach(
      function(
        header,
        columnIndex
      ) {

        const field =
          canonicalPenilaianField(
            header
          );


        if (
          Object.prototype
            .hasOwnProperty
            .call(
              record,
              field
            )
        ) {

          sheet
            .getRange(
              rowIndex + 1,
              columnIndex + 1
            )
            .setValue(
              record[field]
            );

        }

      }
    );


    return true;

  }


  return false;

}


/* ==========================================================
 * DELETE ROW BY KEY
 * ==========================================================
 */

function deletePenilaianRowByKey(
  rowKey
) {

  const sheet =
    DB.getSheet(
      CONFIG.SHEET.PENILAIAN
    );


  const values =
    sheet
      .getDataRange()
      .getValues();


  if (
    values.length <= 1
  ) {

    return false;

  }


  const headers =
    values[0].map(
      function(header) {

        return String(
          header
        ).trim();

      }
    );


  const idIndex =
    findHeaderIndex(
      headers,
      "id"
    );


  const bulanIndex =
    findHeaderIndex(
      headers,
      "bulan"
    );


  const tahunIndex =
    findHeaderIndex(
      headers,
      "tahun"
    );


  if (
    idIndex === -1
  ) {

    throw new Error(
      "Kolom ID pada Sheet Penilaian tidak ditemukan."
    );

  }


  /*
   * Dari bawah ke atas supaya aman.
   */

  for (
    let i = values.length - 1;
    i >= 1;
    i--
  ) {

    /*
     * Match ID.
     */

    if (
      String(
        values[i][idIndex]
      ).trim() !==
      String(
        rowKey.id
      ).trim()
    ) {

      continue;

    }


    /*
     * Match bulan.
     */

    if (
      rowKey.bulan !==
        null &&
      bulanIndex !== -1
    ) {

      if (
        Number(
          values[i][bulanIndex]
        ) !==
        Number(
          rowKey.bulan
        )
      ) {

        continue;

      }

    }


    /*
     * Match tahun.
     */

    if (
      rowKey.tahun !==
        null &&
      tahunIndex !== -1
    ) {

      if (
        Number(
          values[i][tahunIndex]
        ) !==
        Number(
          rowKey.tahun
        )
      ) {

        continue;

      }

    }


    /*
     * Delete baris.
     */

    sheet.deleteRow(
      i + 1
    );


    return true;

  }


  return false;

}


/* ==========================================================
 * BUILD RECORD
 * ==========================================================
 */

function buildPenilaianRecord(
  id,
  data,
  context,
  createdAt,
  updatedAt
) {

  return {

    id:
      id,

    anggotaId:
      data.anggotaId,

    namaAnggota:
      context.anggota.nama ||
      "",

    group:
      context.anggota.group ||
      "",

    bulan:
      data.bulan,

    tahun:
      data.tahun,

    total:
      data.total,

    nilaiAkhir:
      data.nilaiAkhir,

    status:
      data.status,

    detail:
      JSON.stringify(
        data.detail
      ),

    createdAt:
      createdAt,

    updatedAt:
      updatedAt

  };

}


/* ==========================================================
 * BUILD RESPONSE
 * ==========================================================
 */

function buildPenilaianResponse(
  row,
  anggotaMap
) {

  row =
    canonicalizePenilaianRow(
      row
    );


  const anggotaId =
    String(
      row.anggotaId ||
      row.anggotaID ||
      ""
    ).trim();


  const anggota =
    anggotaMap &&
    anggotaMap[
      anggotaId
    ]
      ? anggotaMap[
          anggotaId
        ]
      : null;


  /*
   * Detail.
   */

  let detail =
    row.detail ||
    [];


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

    id:
      String(
        row.id ||
        ""
      ).trim(),

    anggotaId:
      anggotaId,

    namaAnggota:
      anggota
        ? anggota.nama || ""
        : row.namaAnggota || "-",

    group:
      anggota
        ? anggota.group || ""
        : row.group || "-",

    bulan:
      Number(
        row.bulan ||
        0
      ),

    tahun:
      Number(
        row.tahun ||
        0
      ),

    total:
      Number(
        row.total ??
        row.nilaiAkhir ??
        0
      ),

    nilaiAkhir:
      Number(
        row.nilaiAkhir ??
        row.total ??
        0
      ),

    status:
      String(
        row.status ||
        "Draft"
      ),

    detail:
      detail,

    createdAt:
      row.createdAt ||
      "",

    updatedAt:
      row.updatedAt ||
      ""

  };

}


/* ==========================================================
 * CANONICALIZE ROW
 *
 * Menyamakan berbagai kemungkinan nama header Sheet.
 * ==========================================================
 */

function canonicalizePenilaianRow(
  row
) {

  row =
    row || {};


  const result = {};


  Object.keys(
    row
  ).forEach(
    function(header) {

      const field =
        canonicalPenilaianField(
          header
        );


      result[field] =
        row[header];

    }
  );


  return result;

}


/* ==========================================================
 * HEADER NORMALIZATION
 * ==========================================================
 */

function normalizePenilaianHeader(
  header
) {

  return String(
    header ||
    ""
  )
  .trim()
  .toLowerCase()
  .replace(
    /[^a-z0-9]/g,
    ""
  );

}


/* ==========================================================
 * CANONICAL FIELD
 * ==========================================================
 */

function canonicalPenilaianField(
  header
) {

  const normalized =
    normalizePenilaianHeader(
      header
    );


  const aliases = {

    id:
      "id",

    penilaianid:
      "id",

    anggotaid:
      "anggotaId",

    anggota:
      "anggotaId",

    namaanggota:
      "namaAnggota",

    nama:
      "namaAnggota",

    group:
      "group",

    groupid:
      "group",

    bulan:
      "bulan",

    month:
      "bulan",

    tahun:
      "tahun",

    year:
      "tahun",

    total:
      "total",

    totalnilai:
      "total",

    nilaiakhir:
      "nilaiAkhir",

    nilai:
      "nilaiAkhir",

    status:
      "status",

    detail:
      "detail",

    createdat:
      "createdAt",

    updatedat:
      "updatedAt"

  };


  return (
    aliases[
      normalized
    ] ||
    String(
      header
    ).trim()
  );

}


/* ==========================================================
 * FIND HEADER INDEX
 * ==========================================================
 */

function findHeaderIndex(
  headers,
  field
) {

  for (
    let i = 0;
    i < headers.length;
    i++
  ) {

    if (
      canonicalPenilaianField(
        headers[i]
      ) ===
      field
    ) {

      return i;

    }

  }


  return -1;

}


/* ==========================================================
 * ROUND
 * ==========================================================
 */

function roundPenilaian(
  value
) {

  return Number(
    Number(
      value ||
      0
    ).toFixed(
      2
    )
  );

}


/* ==========================================================
 * NAMA BULAN
 * ==========================================================
 */

function namaBulanPenilaian(
  bulan
) {

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
      Number(
        bulan
      )
    ] ||
    "-"
  );

}


/* ==========================================================
 * END PENILAIAN.GS
 * ==========================================================
 */
