export type OrderItem = {
	id: string;
	model: string;
	variant: string;
	color?: string;
	colorHex?: string;
	quantity: number;
	image?: string;
	startingPrice?: string;
	specs: {
		engine?: string;
		transmission?: string;
		fuel?: string;
		seating?: string;
	};
};

export type Order = {
	id: string;
	dealerId: string;
	vehicleModel: string;
	quantity: number;
	status: string;
	orderDate?: string;
	etaDelivery?: string;
	remarks?: string;
	items?: OrderItem[];
};