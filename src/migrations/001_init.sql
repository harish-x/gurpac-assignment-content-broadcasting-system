
CREATE TABLE IF NOT EXISTS users (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(120) NOT NULL,
    email           VARCHAR(160) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    role            VARCHAR(20)  NOT NULL CHECK (role IN ('principal', 'teacher')),
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);


CREATE TABLE IF NOT EXISTS content_slots (
    id          SERIAL PRIMARY KEY,
    subject     VARCHAR(80) NOT NULL UNIQUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS content (
    id                          SERIAL PRIMARY KEY,
    title                       VARCHAR(200) NOT NULL,
    description                 TEXT,
    subject                     VARCHAR(80)  NOT NULL,
    file_path                   VARCHAR(500) NOT NULL,
    file_type                   VARCHAR(50)  NOT NULL,
    file_size                   BIGINT       NOT NULL,
    uploaded_by                 INTEGER      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status                      VARCHAR(20)  NOT NULL DEFAULT 'pending'
                                CHECK (status IN ('pending', 'approved', 'rejected')),
    rejection_reason            TEXT,
    approved_by                 INTEGER REFERENCES users(id) ON DELETE SET NULL,
    approved_at                 TIMESTAMPTZ,
    start_time                  TIMESTAMPTZ,
    end_time                    TIMESTAMPTZ,
    rotation_duration_minutes   INTEGER,
    created_at                  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_content_uploaded_by_status ON content(uploaded_by, status);
CREATE INDEX IF NOT EXISTS idx_content_subject_status     ON content(subject, status);
CREATE INDEX IF NOT EXISTS idx_content_status_window      ON content(status, start_time, end_time);

CREATE TABLE IF NOT EXISTS content_schedule (
    id                  SERIAL PRIMARY KEY,
    content_id          INTEGER NOT NULL REFERENCES content(id) ON DELETE CASCADE,
    slot_id             INTEGER NOT NULL REFERENCES content_slots(id) ON DELETE CASCADE,
    rotation_order      INTEGER NOT NULL DEFAULT 0,
    duration_minutes    INTEGER NOT NULL DEFAULT 5,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (content_id)
);

CREATE INDEX IF NOT EXISTS idx_schedule_slot_order ON content_schedule(slot_id, rotation_order);
