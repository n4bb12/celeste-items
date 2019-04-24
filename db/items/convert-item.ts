import { Trait } from "celeste-api-types"

import { downloadIcon } from "../download"
import { Item } from "../interfaces"
import { translateEn } from "../shared/convert-text"
import { findVendors } from "../vendors"

import { convertEffects } from "./convert-effects"
import { convertEvent } from "./convert-event"
import { findAndConvertRecipe } from "./convert-recipe"
import { addToLegendaryRotation } from "./legendary-rotation"
import { buildSearchString } from "./search"
import { getQuestName, isReforgeable } from "./source"

/**
 * Converts items from their API format to the format
 * used by the search app.
 */
export async function convertItem(trait: Trait): Promise<Item> {
  const name = await translateEn(trait.displaynameid, trait.name)
  const type = await translateEn(trait.rollovertextid, "")
  const iconId = await downloadIcon(`Art/${trait.icon}`, "items")

  const item: Item = {
    name,
    id: trait.name,
    type,
    levels: trait.itemlevels.map(l => l - 3).filter(l => l > 0),
    icon: iconId,
    rarity: trait.rarity,
    effects: convertEffects(trait),
    effectsRange: undefined,
    recipe: undefined,
    vendors: undefined,
    quest: getQuestName(trait),
    event: convertEvent(trait),
    search: "",
  }

  if (item.levels.length === 0) {
    item.levels = [40]
  }

  item.recipe = await findAndConvertRecipe(trait)
  item.vendors = await findVendors(item)

  if (trait.rarity === "legendary") {
    addToLegendaryRotation(item, trait)
    if (item.effects) {
      item.effectsRange = isReforgeable(trait)
    }
  } else {
    if (item.effects) {
      item.effectsRange = !item.vendors || !item.vendors.length
    }
  }

  item.search = await buildSearchString(item, trait)

  return item
}
