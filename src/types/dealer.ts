export type Dealer = {
	id: string;
	name: string;
	location: string;
	orders: number;
	status: string;
};

export type NewDealer = Omit<Dealer, "orders"> & {
	orders?: number;
};
