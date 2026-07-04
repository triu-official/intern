// Simple network utils if needed
function getRequestIp(req) {
  let ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip');
  if (ip && ip.includes(',')) {
    ip = ip.split(',')[0].trim();
  }
  return ip || '127.0.0.1';
}

module.exports = {
  getRequestIp
};
