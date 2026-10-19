# Upgrade notes

## What was added
- Responsive Manager Tools panel with a quick dashboard.
- Full JSON export/import covering original shift data, upgrade data, ledger and shift history.
- Shift archive before starting a new shift (replaces the original destructive reset behavior).
- Customer ledger with credit/payment transactions and outstanding balances.
- Petrol/Diesel stock tracker with opening stock, delivery entries and estimated sales deduction across archived shifts.
- Basic input warnings for negative values and inconsistent nozzle readings.
- Optional Google Drive appDataFolder backup and restore integration.

## Compatibility / data preservation
- The original `petrol_pump_compact_data` LocalStorage key and field schema are retained.
- Added records use `ppm_upgrade_v1` and `ppm_shift_history_v1` keys.
- Existing data is not intentionally migrated/deleted during page load. Shift reset now archives the current state first.
- Keep an external JSON export before deploying this version.

## Accounting limitation to review with your actual station workflow
The legacy calculation is intentionally retained to avoid silently changing financial outcomes. It currently computes collection as cash-in-hand + cash handover + digital + credit + recovery + salary advance/expense + net staff adjustment; expected amount is (nozzle sale − purchase return) + opening balance. This may not match the correct accounting treatment for every station. Verify what each category means and reconcile test shifts before relying on the audit status. Meter rollover is warned about rather than automatically inferred.

## Browser-only limitations
- LocalStorage is per browser profile/device, not shared between devices.
- Customer ledger entries added in the new module are separate from old shift credit rows; old rows remain preserved in the legacy shift record but are not automatically assigned to customers.
- Stock estimates rely on the recorded opening stock, deliveries, and archived shift nozzle readings. Confirm with physical tank dip readings and delivery documents.
- Google Drive requires a user-supplied OAuth client ID; see `GOOGLE_DRIVE_SETUP.md`.
