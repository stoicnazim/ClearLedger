/* ── Rule Engine: evaluates SOP_REGISTRY rules against runtime agent context ── */

/**
 * evaluateRules(sopRegistry, categories, context)
 *
 * @param {Array} sopRegistry - full SOP_REGISTRY array from seedDatabase
 * @param {string|string[]} categories - SOP category or array of categories to filter by
 * @param {Object} context - key/value pairs of runtime facts (e.g. { podVerified: true, claimWithinThreshold: true })
 * @returns {Array} matched rules sorted by priority (1 = highest), each enriched with { sopId, sopTitle, sopVersion }
 */
export function evaluateRules(sopRegistry, categories, context) {
  const cats = Array.isArray(categories) ? categories : [categories]
  const matched = []

  const applicable = sopRegistry.filter(s => cats.includes(s.category))

  for (const sop of applicable) {
    for (const rule of sop.rules) {
      const conditions = rule.condition || {}
      let allMet = true
      for (const [key, expected] of Object.entries(conditions)) {
        const actual = context[key]
        // strict equality — context must have the exact expected value
        if (actual !== expected) {
          allMet = false
          break
        }
      }
      if (allMet) {
        matched.push({
          ...rule,
          sopId: sop.id,
          sopTitle: sop.title,
          sopVersion: sop.version,
        })
      }
    }
  }

  // sort by priority ascending (1 = highest urgency)
  return matched.sort((a, b) => (a.priority || 99) - (b.priority || 99))
}
