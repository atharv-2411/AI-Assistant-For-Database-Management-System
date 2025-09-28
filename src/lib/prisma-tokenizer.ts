export default  {
  tokenizer: {
    root: [
      // Functions like autoincrement(), now(), etc.
      [/\b(?:autoincrement|now|uuid|cuid|dbgenerated|env)\b\(\)/, 'function'],

      // Prisma-specific directives
      [/@\b(?:relation|id|default|unique|map|updatedAt)\b/, 'annotation'],
          
      // Built-in types and modifiers
      [/\b(?:Int|String|Boolean|DateTime|Float|Json|Bytes|BigInt|Decimal|enum|model)\b/, 'keyword'],
      [/!/, 'operator'], // Non-nullable fields
      
      // Fields and Types
      [/\b[A-Z][a-zA-Z0-9_]*\b/, 'type.identifier'], // Type names
      [/\b[a-z_][a-zA-Z0-9_]*\b(?=\s+\b(?:Int|String|Boolean|DateTime|Float|Json|Bytes|BigInt|Decimal)\b)/, 'variable'], // Field names

      // Field names that end with Id or IDs correctly like userpostId
      [/\b(?:\w*Id|\w*IDs)\b/, 'variable.id'], 

      // Comments
      [/#.*$/, 'comment'], // Hash style comments
      [/\/\/.*$/, 'comment'], // Double slash comments
      
      // Strings
      [/"(?:[^"\\]|\\.)*"/, 'string'], // Double quoted strings
      [/'(?:[^'\\]|\\.)*'/, 'string'], // Single quoted strings
      
      // Operators and Punctuation
      [/[\[\]{}().,;]+/, 'delimiter'], // Brackets, delimiters, semicolon
      
      // Annotations
      [/@\w+/, 'annotation'], // Other annotations like @map, @unique
      
      // Numeric Constants
      [/\b\d+\b/, 'number'],
    ]
  }
};