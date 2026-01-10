-- backend/schema.sql
-- SQLite database schema for Metadata-Driven Dynamic Forms application


PRAGMA foreign_keys = ON;

-- =========================
-- ENTITIES (Forms)
-- =========================
CREATE TABLE IF NOT EXISTS entities (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  api TEXT NOT NULL,
  form_type TEXT NOT NULL CHECK (form_type IN ('schema', 'component')),
  component TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- COLUMNS (AG Grid)
-- =========================
CREATE TABLE IF NOT EXISTS entity_columns (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  entity_id TEXT NOT NULL,
  header_name TEXT NOT NULL,
  field TEXT NOT NULL,
  renderer TEXT,
  renderer_params TEXT,
  hidden BOOLEAN DEFAULT 0,
  sort_order INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (entity_id) REFERENCES entities(id) ON DELETE CASCADE
);

-- =========================
-- FORM FIELDS (Schema Forms)
-- =========================
CREATE TABLE IF NOT EXISTS entity_fields (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  entity_id TEXT NOT NULL,
  name TEXT NOT NULL,
  label TEXT NOT NULL,
  type TEXT NOT NULL,
  required BOOLEAN DEFAULT 0,
  depends_on TEXT,
  config TEXT,
  sort_order INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (entity_id) REFERENCES entities(id) ON DELETE CASCADE
);

-- =========================
-- ROW DATA (User Data)
-- =========================
CREATE TABLE IF NOT EXISTS entity_rows (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  entity_id TEXT NOT NULL,
  data TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (entity_id) REFERENCES entities(id) ON DELETE CASCADE
);
