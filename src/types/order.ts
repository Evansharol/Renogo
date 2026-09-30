export type Order = {
	id: string;
	dealerId: string;
	vehicleModel: string;
	quantity: number;
	status: string;
	orderDate?: string;
	etaDelivery?: string;
};