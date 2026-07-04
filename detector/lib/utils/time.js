function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function calculateAgeDays(dateString) {
  if (!dateString) return null;
  const target = new Date(dateString);
  if (isNaN(target.getTime())) return null;

  const diffTime = Math.abs(new Date() - target);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

module.exports = {
  sleep,
  calculateAgeDays
};
