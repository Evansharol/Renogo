export type OrderItem = {
	id: string;
	model: string;
	variant: string;
	color?: string;
	colorHex?: string;
	quantity: number;
	unitPrice?: number;
	image?: string;
	startingPrice?: string;
	specs: {
		engine?: string;
		transmission?: string;
		fuel?: string;
		seating?: string;
	};
};

export type WorkflowStage =
	| "Dealer Request Created"
	| "Pending Manufacturer Review"
	| "Stock Allocated by Manufacturer"
	| "Pending Finance Quotation"
	| "Quotation Sent"
	| "Pending Sales Manager Approval"
	| "Approved by Sales Manager"
	| "Rejected"
	| "Awaiting Payment"
	| "Payment Submitted"
	| "Payment Verified"
	| "Completed";

export type WorkflowHistoryEntry = {
	status: WorkflowStage;
	timestamp: string;
	owner: string;
	remarks?: string;
};

export type Order = {
	id: string;
	requestNumber?: string;
	dealerId: string;
	vehicleModel: string;
	quantity: number;
	status: string;
	orderDate?: string;
	etaDelivery?: string;
	remarks?: string;
	items?: OrderItem[];
	estimatedTotal?: number;
	allocation?: {
		available: number;
		toManufacture: number;
		manufacturerStatus: "Fully Allocated" | "Partially Allocated" | "Not Allocated";
		updatedAt: string;
	};
	currentOwner?: "Dealer" | "Manufacturer" | "Finance Head" | "Sales Manager" | "Dealer Manager" | "Admin";
	workflowHistory?: WorkflowHistoryEntry[];
	paymentProof?: {
		fileName: string;
		submittedAt: string;
		remarks?: string;
	};
	notifications?: Array<{
		role: string;
		message: string;
		createdAt: string;
		read: boolean;
	}>;
};