export type Stock = {
  name: string;
  code: string;
  variant: string;
  category: string;
  fuelType: string;
  transmission: string;
  color: string;
  colorClass?: string;
  quantity: number;
  status: string;
};

export type VehicleStock = {
  name: string;
  image: string;
  category: string;
  fuelType: string;
  transmission: string;
  quantity: number;
  status: string;
  variants: string[];
  colors: Array<{ name: string; quantity: number; colorClass?: string }>;
};
