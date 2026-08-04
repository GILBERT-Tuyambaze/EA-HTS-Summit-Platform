-- Create join table to support multiple speakers per session
BEGIN;

CREATE TABLE IF NOT EXISTS session_speakers (
  session_id uuid NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  speaker_id uuid NOT NULL REFERENCES speakers(id) ON DELETE CASCADE,
  PRIMARY KEY (session_id, speaker_id)
);

-- Migrate existing single speaker references into the join table
INSERT INTO session_speakers (session_id, speaker_id)
SELECT id AS session_id, speaker_id FROM sessions WHERE speaker_id IS NOT NULL;

COMMIT;
