export interface DailyReport {
  id?: string;
  date: string;
  content: string;
  author: string;
  documentUrl?: string;
}

export interface FinancialReport {
  id?: string;
  month: string;
  amountSpent: number;
  detailsUrl?: string;
}

export interface ProjectDocument {
  id?: string;
  title: string;
  category: 'Drawings' | 'Contracts' | 'Environmental' | 'Site Instructions' | 'Other';
  description: string;
  date: string;
  authorRole: string;
  url: string;
  fileType: string;
}

export interface GPSLog {
  id?: string;
  segmentName: string;
  lat: number;
  lng: number;
  status: 'Planned' | 'In Progress' | 'Completed';
  timestamp: string;
}

export interface MaterialDelivery {
  id?: string;
  materialType: string;
  quantity: string;
  lat: number;
  lng: number;
  timestamp: string;
}

export interface FuelLog {
  id?: string;
  machineryId: string;
  plateNumber: string;
  liters: number;
  cost: number;
  date: string;
}

export interface MaintenanceRecord {
  id?: string;
  machineryId: string;
  plateNumber: string;
  type: 'Scheduled Service' | 'Breakdown Repair';
  description: string;
  date: string;
  cost: number;
}

export interface SparePart {
  id?: string;
  partName: string;
  quantity: number;
  unit: string;
  minThreshold: number;
}

export interface SafetyIncident {
  id?: string;
  date: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  description: string;
  location: string;
  reportedBy: string;
}

export interface PPEAudit {
  id?: string;
  date: string;
  segment: string;
  complianceScore: number;
  notes?: string;
}

export interface EmergencyAlert {
  id?: string;
  timestamp: string;
  message: string;
  sender: string;
}

export interface QualityTest {
  id?: string;
  type: 'Asphalt' | 'Concrete' | 'Soil' | 'Aggregates';
  date: string;
  location: string;
  result: 'Pass' | 'Fail' | 'Pending';
  parameters?: any;
  labReportUrl?: string;
}

export interface InspectionApproval {
  id?: string;
  workType: string;
  location: string;
  status: 'Approved' | 'Rejected' | 'Conditionally Approved';
  inspector: string;
  date: string;
  remarks?: string;
}

export interface BudgetCategory {
  id?: string;
  name: string;
  allocated: number;
  actual: number;
  currency: string;
}

export interface ContractorPayment {
  id?: string;
  contractorName: string;
  amount: number;
  date: string;
  invoiceUrl?: string;
  status: 'Pending' | 'Paid' | 'Disputed';
}

export interface BOQItem {
  id?: string;
  itemCode: string;
  description: string;
  unit: string;
  plannedQuantity: number;
  executedQuantity: number;
  unitRate: number;
}

export interface ProcurementRequest {
  id?: string;
  item: string;
  quantity: number;
  requestedBy: string;
  status: 'Requested' | 'Approved' | 'Ordered' | 'Received';
  urgency: 'Normal' | 'Urgent' | 'Critical';
  createdAt?: any;
}

export interface ProjectTask {
  id?: string;
  title: string;
  startDate: string;
  endDate: string;
  status: 'Todo' | 'In Progress' | 'Completed' | 'Delayed';
  progress: number;
  assignedTo: string;
}

export interface Vendor {
  id?: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  category: string;
}

export interface PurchaseOrder {
  id?: string;
  poNumber: string;
  vendorId: string;
  vendorName: string;
  totalAmount: number;
  status: 'Draft' | 'Issued' | 'Completed' | 'Void';
  orderDate: string;
  expectedDeliveryDate: string;
}
