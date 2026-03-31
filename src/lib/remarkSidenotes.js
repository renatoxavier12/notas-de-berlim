import { visit } from 'unist-util-visit'

/**
 * Remark plugin: converts ^[note text] inline syntax to sidenote nodes.
 * Usage in markdown: "texto principal^[nota lateral aqui] continua."
 */
export function remarkSidenotes() {
  return (tree) => {
    let counter = 0

    visit(tree, 'text', (node, index, parent) => {
      if (!parent || index == null) return
      const regex = /\^\[([^\]]+)\]/g
      const parts = []
      let last = 0
      let match

      while ((match = regex.exec(node.value)) !== null) {
        if (match.index > last) {
          parts.push({ type: 'text', value: node.value.slice(last, match.index) })
        }
        counter++
        parts.push({
          type: 'sidenote',
          data: { hName: 'sidenote' },
          id: counter,
          note: match[1],
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
