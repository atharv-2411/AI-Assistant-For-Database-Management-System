import type { Node } from "@xyflow/react"

declare global
  type TableNode = Omit<Node, 'data'> & {
  data: Node['data'] & {
    schema: {
      title: string,
      type: string,
      is_null?: boolean,
      is_unique?: boolean,
      is_pk?: boolean,
    }[]
  }
}
