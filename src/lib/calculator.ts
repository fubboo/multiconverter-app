// Safe expression evaluator. Replaces V1's eval() (which is a security risk
// and an App Store / Play Store rejection trigger).
// Supports: + - * / decimals, parentheses, unary minus.
// Display symbols (× ÷ −) are normalized to (* / -).

type Token =
  | { type: 'num'; value: number }
  | { type: 'op'; value: '+' | '-' | '*' | '/' }
  | { type: 'lparen' }
  | { type: 'rparen' }

const PRECEDENCE: Record<string, number> = { '+': 1, '-': 1, '*': 2, '/': 2 }

function tokenize(input: string): Token[] {
  const src = input.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-')
  const tokens: Token[] = []
  let i = 0
  while (i < src.length) {
    const ch = src[i]
    if (ch === ' ') { i++; continue }
    if (ch === '+' || ch === '*' || ch === '/') {
      tokens.push({ type: 'op', value: ch })
      i++
      continue
    }
    if (ch === '-') {
      const prev = tokens[tokens.length - 1]
      const isUnary = !prev || prev.type === 'op' || prev.type === 'lparen'
      if (isUnary) {
        let j = i + 1
        let dot = false
        while (j < src.length && (/[0-9]/.test(src[j]) || (src[j] === '.' && !dot))) {
          if (src[j] === '.') dot = true
          j++
        }
        if (j === i + 1) {
          tokens.push({ type: 'num', value: 0 })
          tokens.push({ type: 'op', value: '-' })
          i++
          continue
        }
        const num = parseFloat(src.slice(i, j))
        if (Number.isNaN(num)) throw new Error('Invalid number')
        tokens.push({ type: 'num', value: num })
        i = j
        continue
      }
      tokens.push({ type: 'op', value: '-' })
      i++
      continue
    }
    if (ch === '(') { tokens.push({ type: 'lparen' }); i++; continue }
    if (ch === ')') { tokens.push({ type: 'rparen' }); i++; continue }
    if (/[0-9.]/.test(ch)) {
      let j = i
      let dot = false
      while (j < src.length && (/[0-9]/.test(src[j]) || (src[j] === '.' && !dot))) {
        if (src[j] === '.') dot = true
        j++
      }
      const num = parseFloat(src.slice(i, j))
      if (Number.isNaN(num)) throw new Error('Invalid number')
      tokens.push({ type: 'num', value: num })
      i = j
      continue
    }
    throw new Error(`Unexpected character: ${ch}`)
  }
  return tokens
}

function toRPN(tokens: Token[]): Token[] {
  const out: Token[] = []
  const stack: Token[] = []
  for (const t of tokens) {
    if (t.type === 'num') {
      out.push(t)
    } else if (t.type === 'op') {
      while (stack.length) {
        const top = stack[stack.length - 1]
        if (top.type === 'op' && PRECEDENCE[top.value] >= PRECEDENCE[t.value]) {
          out.push(stack.pop()!)
        } else break
      }
      stack.push(t)
    } else if (t.type === 'lparen') {
      stack.push(t)
    } else {
      while (stack.length && stack[stack.length - 1].type !== 'lparen') {
        out.push(stack.pop()!)
      }
      if (!stack.length) throw new Error('Mismatched parentheses')
      stack.pop()
    }
  }
  while (stack.length) {
    const top = stack.pop()!
    if (top.type === 'lparen' || top.type === 'rparen') throw new Error('Mismatched parentheses')
    out.push(top)
  }
  return out
}

function evalRPN(rpn: Token[]): number {
  const stack: number[] = []
  for (const t of rpn) {
    if (t.type === 'num') {
      stack.push(t.value)
    } else if (t.type === 'op') {
      const b = stack.pop()
      const a = stack.pop()
      if (a === undefined || b === undefined) throw new Error('Invalid expression')
      switch (t.value) {
        case '+': stack.push(a + b); break
        case '-': stack.push(a - b); break
        case '*': stack.push(a * b); break
        case '/':
          if (b === 0) throw new Error('Division by zero')
          stack.push(a / b)
          break
      }
    }
  }
  if (stack.length !== 1) throw new Error('Invalid expression')
  return stack[0]
}

export function evaluateExpression(input: string): number {
  if (!input || input.trim() === '') return 0
  const tokens = tokenize(input)
  while (tokens.length && tokens[tokens.length - 1].type === 'op') tokens.pop()
  if (tokens.length === 0) return 0
  const rpn = toRPN(tokens)
  return evalRPN(rpn)
}

export function safeEvaluate(input: string): number | null {
  try {
    const n = evaluateExpression(input)
    if (!Number.isFinite(n)) return null
    return n
  } catch {
    return null
  }
}

const OP_CHARS = ['+', '-', '*', '/', '×', '÷', '−']
export function endsWithOperator(s: string): boolean {
  return OP_CHARS.includes(s.slice(-1))
}
