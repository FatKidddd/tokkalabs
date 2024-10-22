CREATE TABLE IF NOT EXISTS txnfees (
    id VARCHAR(64) PRIMARY KEY, -- tx_hash
    "timeStamp" BIGINT NOT NULL,
    "gasUsed" BIGINT NOT NULL,
    "gasPrice" BIGINT NOT NULL,
    "priceETHUSDT" NUMERIC(10, 4) NOT NULL,
    "txnFeeUSDT" NUMERIC(20, 4) NOT NULL
);

-- Optional index on timestamp for faster sorting
CREATE INDEX IF NOT EXISTS idx_timestamp ON txnfees (timestamp DESC);

