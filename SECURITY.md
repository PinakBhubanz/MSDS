# Security and health-data privacy

This repository is designed to be safe to publish. Do not commit raw Apple Health exports, laboratory reports, nutrition logs, medical records, API tokens, or personalized snapshot files.

The dashboard's import control processes JSON in browser memory. It does not upload the selected file. Imported data disappears on refresh and is not written to browser storage.

Keep private inputs under `data/private/` or `data/imports/`; both paths are ignored by Git. The example snapshot contains fictional data only.

If a future version adds persistent accounts or server-side ingestion, it should include authentication, encryption at rest, audit logs, record-level deletion, retention controls, and a threat-model review before handling real health information.

