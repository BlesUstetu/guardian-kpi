/**
 * ==========================================================
 * Guardian KPI Web3
 * File : Utils.gs
 * ==========================================================
 * Utility Functions
 * ==========================================================
 */

const Utils = {

  /**
   * Generate Auto ID
   * Contoh:
   * S001
   * G001
   * K001
   * P001
   */
  generateId(sheetName, prefix) {

    const data = DB.getData(sheetName);

    if (!data || data.length === 0) {
      return prefix + "001";
    }

    let max = 0;

    data.forEach(function (row) {

      if (!row.id) return;

      const number = parseInt(
        String(row.id).replace(prefix, ""),
        10
      );

      if (!isNaN(number) && number > max) {
        max = number;
      }

    });

    return prefix + String(max + 1).padStart(3, "0");

  },

  /**
   * Response Success
   */
  success(message, data) {

    return {
      success: true,
      message: message || "Berhasil",
      data: data || null
    };

  },

  /**
   * Response Error
   */
  error(message) {

    return {
      success: false,
      message: message || "Terjadi kesalahan."
    };

  },

  /**
   * Format Angka
   */
  formatNumber(value) {

    value = Number(value || 0);

    return value.toLocaleString("id-ID");

  },

  /**
   * Format Persentase
   */
  formatPercent(value, digit) {

    digit = digit || 2;

    return Number(value || 0).toFixed(digit) + "%";

  },

  /**
   * Format Tanggal
   */
  formatDate(date) {

    if (!date) return "";

    return Utilities.formatDate(
      new Date(date),
      Session.getScriptTimeZone(),
      "dd/MM/yyyy"
    );

  },

  /**
   * Timestamp
   */
  timestamp() {

    return Utilities.formatDate(
      new Date(),
      Session.getScriptTimeZone(),
      "yyyy-MM-dd HH:mm:ss"
    );

  },

  /**
   * Deep Copy Object
   */
  clone(obj) {

    return JSON.parse(JSON.stringify(obj));

  },

  /**
   * Cek String Kosong
   */
  isEmpty(value) {

    return value === null ||
           value === undefined ||
           String(value).trim() === "";

  },

  /**
   * Kapitalisasi Huruf Awal
   */
  capitalize(text) {

    if (!text) return "";

    return text
      .toLowerCase()
      .replace(/\b\w/g, function (char) {

        return char.toUpperCase();

      });

  }

};
