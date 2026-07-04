const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

let db;

function initDB() {
  if (db) return db;

  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const dbPath = path.join(dataDir, 'detector.db');
  db = new Database(dbPath);

  // Initialize tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS analyses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      raw_url TEXT NOT NULL,
      normalized_url TEXT NOT NULL,
      domain TEXT NOT NULL,
      risk_score INTEGER NOT NULL,
      label TEXT NOT NULL,
      verdict_text TEXT NOT NULL,
      reachability TEXT NOT NULL,
      redirect_chain TEXT,
      reasons TEXT,
      trust_score INTEGER DEFAULT 0,
      trust_signals TEXT,
      features_summary TEXT,
      deep_analysis TEXT,
      status_code INTEGER,
      error_type TEXT,
      error_message TEXT,
      feedback TEXT,
      feedback_note TEXT,
      session_id TEXT,
      created_at TEXT NOT NULL
    )
  `);

  return db;
}

function insertAnalysis(result) {
  const db = initDB();
  const stmt = db.prepare(`
    INSERT INTO analyses (
      raw_url, normalized_url, domain, risk_score, label, verdict_text,
      reachability, redirect_chain, reasons, trust_score, trust_signals,
      features_summary, deep_analysis, status_code, error_type, error_message,
      session_id, created_at
    ) VALUES (
      @raw_url, @normalized_url, @domain, @risk_score, @label, @verdict_text,
      @reachability, @redirect_chain, @reasons, @trust_score, @trust_signals,
      @features_summary, @deep_analysis, @status_code, @error_type, @error_message,
      @session_id, @created_at
    )
  `);

  const info = stmt.run({
    raw_url: result.raw_url,
    normalized_url: result.normalized_url,
    domain: result.domain,
    risk_score: result.risk_score,
    label: result.label,
    verdict_text: result.verdict_text,
    reachability: result.reachability,
    redirect_chain: result.redirect_chain ? JSON.stringify(result.redirect_chain) : null,
    reasons: result.reasons ? JSON.stringify(result.reasons) : null,
    trust_score: result.trust_score || 0,
    trust_signals: result.trust_signals ? JSON.stringify(result.trust_signals) : null,
    features_summary: result.features_summary ? JSON.stringify(result.features_summary) : null,
    deep_analysis: result.deep_analysis ? JSON.stringify(result.deep_analysis) : null,
    status_code: result.status_code || null,
    error_type: result.error_type || null,
    error_message: result.error_message || null,
    session_id: result.session_id || null,
    created_at: new Date().toISOString()
  });

  return info.lastInsertRowid;
}

function getAnalysisById(id) {
  const db = initDB();
  const stmt = db.prepare('SELECT * FROM analyses WHERE id = ?');
  const row = stmt.get(id);

  if (row) {
    row.redirect_chain = row.redirect_chain ? JSON.parse(row.redirect_chain) : null;
    row.reasons = row.reasons ? JSON.parse(row.reasons) : null;
    row.trust_signals = row.trust_signals ? JSON.parse(row.trust_signals) : null;
    row.features_summary = row.features_summary ? JSON.parse(row.features_summary) : null;
    row.deep_analysis = row.deep_analysis ? JSON.parse(row.deep_analysis) : null;
  }

  return row;
}

function listRecentAnalyses(limit = 20) {
  const db = initDB();
  const stmt = db.prepare('SELECT id, domain, label, risk_score, created_at FROM analyses ORDER BY id DESC LIMIT ?');
  return stmt.all(limit);
}

function updateAnalysisFeedback(id, feedback, note) {
  const db = initDB();
  const stmt = db.prepare(`
    UPDATE analyses
    SET feedback = ?, feedback_note = ?
    WHERE id = ?
  `);
  stmt.run(feedback, note, id);
}

module.exports = {
  initDB,
  insertAnalysis,
  getAnalysisById,
  listRecentAnalyses,
  updateAnalysisFeedback
};
