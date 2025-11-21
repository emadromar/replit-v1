// src/utils/phoneUtils.js
export const sanitizePhoneForWhatsApp = (phone) => {
  if (!phone) return '';
  // 1. Remove all non-numeric characters
  let clean = phone.replace(/\D/g, '');
  
  // 2. Handle Jordanian numbers (079... -> 96279...)
  if (clean.startsWith('07')) {
    clean = '962' + clean.substring(1);
  }
  
  return clean;
};