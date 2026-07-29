/**
 * ==========================================================
 * Guardian KPI Web3
 * File : Database.gs
 * ==========================================================
 * Database Layer
 * ==========================================================
 */

const DB = {

  /**
   * Mengambil objek Sheet
   */
  getSheet(sheetName) {

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);

    if (!sheet) {
      throw new Error("Sheet '" + sheetName + "' tidak ditemukan.");
    }

    return sheet;

  },

  /**
   * Mengambil semua data menjadi array object
   */
  getData(sheetName) {

    const sheet = this.getSheet(sheetName);

    const values = sheet.getDataRange().getValues();

    if (values.length <= 1) {
      return [];
    }

    const headers = values.shift();

    return values.map(function (row) {

      let obj = {};

      headers.forEach(function (header, index) {

        obj[String(header).trim()] = row[index];

      });

      return obj;

    });

  },

  /**
   * Mencari satu data berdasarkan field
   */
  find(sheetName, field, value) {

    const data = this.getData(sheetName);

    return data.find(function (row) {

      return String(row[field]) === String(value);

    }) || null;

  },

  /**
   * Mengecek apakah data sudah ada
   */
  exists(sheetName, field, value) {

    return this.find(sheetName, field, value) !== null;

  },

  /**
   * Menambahkan data baru
   */
  insert(sheetName, data) {

    const sheet = this.getSheet(sheetName);

    const headers = sheet
      .getRange(1, 1, 1, sheet.getLastColumn())
      .getValues()[0];

    const row = headers.map(function (header) {

      return data[header] !== undefined ? data[header] : "";

    });

    sheet.appendRow(row);

    return true;

  },

  /**
   * Update data berdasarkan field
   */
  update(sheetName, field, value, newData) {

    const sheet = this.getSheet(sheetName);

    const values = sheet.getDataRange().getValues();

    const headers = values[0];

    const fieldIndex = headers.indexOf(field);

    if (fieldIndex === -1) {
      throw new Error("Field '" + field + "' tidak ditemukan.");
    }

    for (let i = 1; i < values.length; i++) {

      if (String(values[i][fieldIndex]) === String(value)) {

        headers.forEach(function (header, col) {

          if (newData.hasOwnProperty(header)) {

            sheet.getRange(i + 1, col + 1).setValue(newData[header]);

          }

        });

        return true;

      }

    }

    return false;

  },

  /**
   * Menghapus data berdasarkan field
   */
  remove(sheetName, field, value) {

    const sheet = this.getSheet(sheetName);

    const values = sheet.getDataRange().getValues();

    const headers = values[0];

    const fieldIndex = headers.indexOf(field);

    if (fieldIndex === -1) {
      throw new Error("Field '" + field + "' tidak ditemukan.");
    }

    for (let i = values.length - 1; i >= 1; i--) {

      if (String(values[i][fieldIndex]) === String(value)) {

        sheet.deleteRow(i + 1);

        return true;

      }

    }

    return false;

  },

  /**
   * Menghitung jumlah data
   */
  count(sheetName) {

    return this.getData(sheetName).length;

  },

  /**
   * Menghapus seluruh isi data
   * (header tetap dipertahankan)
   */
  clear(sheetName) {

    const sheet = this.getSheet(sheetName);

    const lastRow = sheet.getLastRow();

    if (lastRow > 1) {

      sheet.getRange(
        2,
        1,
        lastRow - 1,
        sheet.getLastColumn()
      ).clearContent();

    }

    return true;

  }

};
