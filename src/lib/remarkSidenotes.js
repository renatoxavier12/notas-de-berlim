import { visit } from 'unist-util-visit'

/**
 * Remark plugin: converts ^[anchor text | note text] to sidenote nodes.
 * The anchor text gets a dashed underline; note appears as tooltip on hover/tap.
 * Usage: "pedi um ^[Apfelschorle | suco de maçã com água com gás, bebida muito comum na Alemanha] e fiquei olhando."
 */
export function remarkSidenotes() {
  return (tree) => {
    visit(tree, 'text', (node, index, parent) => {
      if (!parent || index == null) return

      const regex = /\^\[([^\]|]+)\|([^\]]+)\]/g
      const parts = []
      let last = 0
      let match

      while ((match = regex.exec(node.value)) !== null) {
        if (match.index > last) {
          parts.push({ type: 'text', value: node.value.slice(last, match.index) })
        }
        parts.push({
          type: 'sidenote',
          anchor: match[1].trim(),
          note: match[2].trim(),
          children: [],
        })
        last = match.index + match[0].length
      }

      if (parts.length === 0) return
      if (last < node.value.length) {
        parts.push({ type: 'text', value: node.value.slice(last) })
      }

      parent.children.splice(index, 1, ...parts)
    })
  }
}
