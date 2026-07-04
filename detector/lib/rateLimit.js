const limiters = new Map();

function cleanup() {
  const now = Date.now();
  for (const [key, record] of limiters.entries()) {
    if (now > record.resetTime) {
      limiters.delete(key);
    }
  }
}

// Run cleanup every minute
setInterval(cleanup, 60000);

function checkRateLimit(ip, bucket = "analyze") {
  const key = `${bucket}:${ip}`;
  const now = Date.now();
  const maxRequests = parseInt(process.env.RATE_LIMIT_PER_MINUTE) || 10;
  const windowMs = 60000;

  if (!limiters.has(key)) {
    limiters.set(key, { count: 1, resetTime: now + windowMs });
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetInSeconds: Math.ceil(windowMs / 1000)
    };
  }

  const record = limiters.get(key);

  if (now > record.resetTime) {
    record.count = 1;
    record.resetTime = now + windowMs;
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetInSeconds: Math.ceil(windowMs / 1000)
    };
  }

  if (record.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetInSeconds: Math.ceil((record.resetTime - now) / 1000)
    };
  }

  record.count += 1;
  return {
    allowed: true,
    remaining: maxRequests - record.count,
    resetInSeconds: Math.ceil((record.resetTime - now) / 1000)
  };
}

module.exports = { checkRateLimit };
