const MAX_SIZE_BYTES = 2 * 1024 * 1024; // 2MB

export function getBase64Size(base64String) {
  const base64 = base64String.split(',')[1];
  return Math.floor(base64.length * 0.75);
}

export function isValidMimeType(mime) {
  return ['image/png', 'image/jpeg'].includes(mime);
}

export { MAX_SIZE_BYTES }; 