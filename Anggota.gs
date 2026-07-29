/**
 * Mengambil semua data anggota
 */
function getAnggota() {
  return DB.getData(CONFIG.SHEET.ANGGOTA);
}

/**
 * Menyimpan anggota baru
 */
function saveAnggota(data) {

  data.id = Utils.generateId(
      CONFIG.SHEET.ANGGOTA,
      "S"
  );

  DB.insert(CONFIG.SHEET.ANGGOTA, data);

  return Utils.success("Data berhasil disimpan");

}

/**
 * Menghapus anggota
 */
function deleteAnggota(id){

   DB.remove(
      CONFIG.SHEET.ANGGOTA,
      "id",
      id
   );

   return Utils.success("Data berhasil dihapus");

}
