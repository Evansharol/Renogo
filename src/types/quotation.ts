export type Quotation = {
	id: string;
	dealerId: string;
	orderId: string;
	vehicleModel: string;
	quantity: number;
	basePrice: number;
	taxRate: number;
	depositRate: number;
	gstNumber: string;
	paymentTerms: string;
	bankDetails?: {
		beneficiaryName: string;
		accountNumber: string;
		ifscCode: string;
		bankBranch: string;
	};
	status?: string;
};
