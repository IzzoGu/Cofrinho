-- Check if the column exists before adding it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'metas_financeiras' 
        AND column_name = 'concluida'
    ) THEN
        ALTER TABLE metas_financeiras ADD COLUMN concluida BOOLEAN DEFAULT FALSE;
    END IF;
END $$; 