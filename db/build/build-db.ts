import { Trait } from "celeste-api-types"
import chalk from "chalk"

import { convertItem } from "../convert/convert-item"
import { convertMaterials } from "../convert/convert-materials"
import { API } from "../download"
import { DB } from "../interfaces/app"

import {
  buildSearchReplacementMap,
  buildSearchString,
} from "./build-search-string"
import { compareItems } from "./compare-items"

/**
 * Creates the data (db.json) behind the item search app.
 */
export async function buildDb(): Promise<DB> {
  console.log("Build item database...")

  const traitsResponse = await API.getTraits()
  const advisorsResponse = await API.getAdvisors()
  const blueprintsResponse = await API.getBlueprints()
  const designsResponse = await API.getDesigns()

  const itemConversions = Object.values(traitsResponse.data)
    .filter(traitHasLevels)
    .map(trait => convertItem(trait))

  const items = await Promise.all(itemConversions)
  const materials = await convertMaterials(items)
  const replace = buildSearchReplacementMap(items, materials)

  items.sort(compareItems)
  items.forEach(item => item.search = buildSearchString(item, materials))

  const db: DB = {
    items,
    advisors: [],
    blueprints: [],
    designs: [],
    consumables: [],
    materials,
    replace,
  }
  return db
}

function traitHasLevels(trait: Trait) {
  if (trait.itemlevels.length > 0) {
    return true
  }
  console.log(chalk.yellow(`SKIPPED - Item has no levels: ${trait.name} (${trait.dbid})`))
}
