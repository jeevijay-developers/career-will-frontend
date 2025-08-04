// Main component
export { FeeManagement } from "./fee-management";

// Sub-components
export { AddFeeRecordDialog } from "./AddFeeRecordDialog";
export { PaymentDialog } from "./PaymentDialog";
export { FeeDetailsDialog } from "./FeeDetailsDialog";
export { FeeRecordsTable } from "./FeeRecordsTable";

// Types
export type { FeeRecord, FeeFormData, PaymentData, SimpleFeeFormData } from "./fee-types";

// Utilities
export { getStatusBadge, getStatusIcon, calculateFeeStatus } from "./fee-status-utils";
