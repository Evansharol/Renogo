export type Dealer = {
	id: string;
	name: string;
	location: string;
	orders: number;
	status: string;
};

export const workflowDealers: Dealer[] = [
	{ id: "D001", name: "ABC Motors", location: "Chennai", orders: 5, status: "In Production" },
	{ id: "D002", name: "Royal Autos", location: "Bangalore", orders: 3, status: "Approved" },
	{ id: "D003", name: "Chennai Cars", location: "Chennai", orders: 2, status: "Pending Approval" },
];

export function getDealer(id?: string, stateDealer?: Dealer) {
	return stateDealer ?? workflowDealers.find((dealer) => dealer.id === id) ?? workflowDealers[0];
}
