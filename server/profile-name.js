"use strict";

// Display names are labels, not login identifiers. Normalize Vietnamese IME
// output so a decomposed accent doesn't count as an extra letter at the limit.
module.exports = function profileName(input) {
  var value = String(input || "").trim().normalize("NFC");
  var length = [...value].length;
  if (length < 2 || length > 20) return { error: "Tên hiển thị cần có từ 2 đến 20 ký tự." };
  if (!/^[\p{L}\p{M}\p{N} ·._-]+$/u.test(value)) {
    return { error: "Tên hiển thị chỉ gồm chữ, số, khoảng trắng và các dấu · . _ -." };
  }
  return { value: value };
};
