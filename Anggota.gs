/**
 * ==========================================
 * Anggota.gs
 * ==========================================
 */

function getAnggota() {
  return DB.getData(CONFIG.SHEET.ANGGOTA);
}

function getAnggotaById(id) {
  return DB.find(CONFIG.SHEET.ANGGOTA, "id", id);
}

function saveAnggota(data) {

  if (!data.nama) throw new Error("Nama wajib diisi");
  if (!data.jabatan) throw new Error("Jabatan wajib diisi");
  if (!data.group) throw new Error("Group wajib dipilih");

  data.id = Utils.generateId(CONFIG.SHEET.ANGGOTA, "S");

  DB.insert(CONFIG.SHEET.ANGGOTA, data);

  return Utils.success("Data berhasil disimpan");
}

function updateAnggota(id, data) {

  DB.update(
    CONFIG.SHEET.ANGGOTA,
    "id",
    id,
    data
  );

  return Utils.success("Data berhasil diupdate");
}

function deleteAnggota(id) {

  DB.remove(
    CONFIG.SHEET.ANGGOTA,
    "id",
    id
  );

  return Utils.success("Data berhasil dihapus");
}
