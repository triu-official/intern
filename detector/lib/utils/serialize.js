function safeStringify(obj) {
  try {
    return JSON.stringify(obj);
  } catch (e) {
    return '{}';
  }
}

function safeParse(str, fallback = {}) {
  if (!str) return fallback;
  try {
    return JSON.parse(str);
  } catch (e) {
    return fallback;
  }
}

module.exports = {
  safeStringify,
  safeParse
};
