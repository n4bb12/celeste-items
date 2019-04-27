import { MarketplaceItem } from "celeste-api-types"

import { Vendor } from "./Vendor"

export interface Design {
  id: string
  name: string
  description: string
  icon: number
  rarity: string
  materials: Array<{ id: string, quantity: number }>
  vendors: Vendor[] | undefined
  marketplace: MarketplaceItem[] | undefined
  search: string
}
