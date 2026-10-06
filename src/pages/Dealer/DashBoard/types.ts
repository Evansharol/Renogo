// ─── Shared Dealer types & constants ─────────────────────────────────────────

import kigerImg  from "../../../assets/dealer/kiger.jpg";
import triberImg from "../../../assets/dealer/triber.jpg";
import dusterImg from "../../../assets/dealer/duster.jpg";
import kwidImg   from "../../../assets/dealer/kwid.jpg";

export type TabType = "dashboard" | "catalog" | "order-request" | "my-requests" | "profile";


export type LoginState = {
  name?: string;
  userId?: string;
  dealerId?: string;
  location?: string;
};

export type VehicleModelData = {
  id: string;
  name: string;
  tagline: string;
  image: string;
  startingPrice: string;
  stockCount: number;
  specs: {
    engine: string;
    transmission: string;
    fuel: string;
    seating: string;
  };
  description: string;
  status: "Available" | "Low Stock" | "High Demand";
};

export const POPULAR_MODELS: VehicleModelData[] = [
  {
    id: "kiger",
    name: "Renault Kiger",
    tagline: "Bold. Smart. Versatile.",
    image: kigerImg,
    startingPrice: "₹ 5.99 Lakh*",
    stockCount: 50,
    specs: {
      engine: "1.0L Turbo Petrol",
      transmission: "5-Speed MT / CVT",
      fuel: "Petrol",
      seating: "5 Seater",
    },
    description:
      "Compact athletic SUV with high ground clearance, smart cabin tech, and exceptional fuel economy.",
    status: "Available",
  },
  {
    id: "triber",
    name: "Renault Triber",
    tagline: "Space for everything.",
    image: triberImg,
    startingPrice: "₹ 5.99 Lakh*",
    stockCount: 35,
    specs: {
      engine: "1.0L Energy Petrol",
      transmission: "5-Speed MT / EASY-R AMT",
      fuel: "Petrol",
      seating: "7 Seater Modular",
    },
    description:
      "Ultra-flexible 7-seater MPV with 625L modular boot space and modern safety suite for commercial fleets.",
    status: "Available",
  },
  {
    id: "duster",
    name: "Renault Duster",
    tagline: "Go anywhere.",
    image: dusterImg,
    startingPrice: "₹ 9.86 Lakh*",
    stockCount: 12,
    specs: {
      engine: "1.3L Turbo Petrol / Hybrid",
      transmission: "6-Speed MT / EDC Auto",
      fuel: "Turbo Petrol",
      seating: "5 Seater Rugged",
    },
    description:
      "Legendary all-terrain SUV built for endurance, highway reliability, and heavy-duty fleet operations.",
    status: "Low Stock",
  },
  {
    id: "kwid",
    name: "Renault Kwid",
    tagline: "Smart moves. Greater possibilities.",
    image: kwidImg,
    startingPrice: "₹ 4.69 Lakh*",
    stockCount: 20,
    specs: {
      engine: "1.0L SCe Smart Drive",
      transmission: "5-Speed MT / AMT",
      fuel: "Petrol",
      seating: "5 Seater City Hatch",
    },
    description:
      "Expressive urban hatchback engineered with SUV design language, touchscreen infotainment, and best-in-class running costs.",
    status: "Available",
  },
];
