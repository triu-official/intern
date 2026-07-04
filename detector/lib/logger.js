const logsBuffer = new Map();
const subscribers = new Map();

function getOrCreateBuffer(sessionId) {
  if (!logsBuffer.has(sessionId)) {
    logsBuffer.set(sessionId, []);
  }
  return logsBuffer.get(sessionId);
}

function getOrCreateSubscribers(sessionId) {
  if (!subscribers.has(sessionId)) {
    subscribers.set(sessionId, new Set());
  }
  return subscribers.get(sessionId);
}

const loggerBus = {
  subscribe(sessionId, callback) {
    const subs = getOrCreateSubscribers(sessionId);
    subs.add(callback);
  },

  unsubscribe(sessionId, callback) {
    const subs = subscribers.get(sessionId);
    if (subs) {
      subs.delete(callback);
      if (subs.size === 0) {
        subscribers.delete(sessionId);
      }
    }
  },

  emit(sessionId, level, step, message, data = null) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      step,
      message,
      data
    };

    const buffer = getOrCreateBuffer(sessionId);
    buffer.push(logEntry);

    const subs = subscribers.get(sessionId);
    if (subs) {
      for (const callback of subs) {
        callback(logEntry);
      }
    }
  },

  getBufferedLogs(sessionId) {
    return logsBuffer.get(sessionId) || [];
  },

  clearSession(sessionId) {
    logsBuffer.delete(sessionId);
    subscribers.delete(sessionId);
  }
};

function createSessionLogger(sessionId) {
  return {
    info: (step, message, data) => loggerBus.emit(sessionId, 'info', step, message, data),
    success: (step, message, data) => loggerBus.emit(sessionId, 'success', step, message, data),
    warn: (step, message, data) => loggerBus.emit(sessionId, 'warn', step, message, data),
    error: (step, message, data) => loggerBus.emit(sessionId, 'error', step, message, data),
  };
}

module.exports = {
  loggerBus,
  createSessionLogger
};
