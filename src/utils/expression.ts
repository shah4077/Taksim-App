/**
 * Safe arithmetic expression evaluator for the "20+30*2+40" style quick-sum
 * entry in numeric fields. Supports +, -, *, /, parentheses, decimals, and
 * unary minus. Deliberately hand-rolled instead of eval()/Function() since
 * the input comes directly from a text field.
 */

type Token = { type: 'num'; value: number } | { type: 'op'; value: string };

export function evaluateExpression(input: string): number | null {
  const sanitized = input.trim();
  if (!sanitized) return null;
  if (!/^[0-9+\-*/().\s]+$/.test(sanitized)) return null;

  try {
    const tokens = tokenize(sanitized);
    if (tokens.length === 0) return null;
    const { value, index } = parseExpression(tokens, 0);
    if (index !== tokens.length) return null;
    return Number.isFinite(value) ? value : null;
  } catch {
    return null;
  }
}

/**
 * Resolves a numeric field's raw text to a number, whether it's a plain
 * amount ("150"), a trailing-"=" expression ("150+200="), or a bare
 * expression typed without ever reaching the "=" key ("150+200") — many
 * Android keyboards bury "=" behind an extra symbols page, so typing the
 * expression and just tapping elsewhere or saving must still work.
 */
export function resolveAmount(input: string): number | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const withoutTrailingEquals = trimmed.endsWith('=') ? trimmed.slice(0, -1) : trimmed;
  const direct = Number(withoutTrailingEquals);
  if (Number.isFinite(direct)) return direct;

  return evaluateExpression(withoutTrailingEquals);
}

function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < input.length) {
    const ch = input[i];
    if (/\s/.test(ch)) {
      i += 1;
      continue;
    }
    if (/[0-9.]/.test(ch)) {
      let num = '';
      while (i < input.length && /[0-9.]/.test(input[i])) {
        num += input[i];
        i += 1;
      }
      if ((num.match(/\./g) ?? []).length > 1) throw new Error('Invalid number');
      tokens.push({ type: 'num', value: parseFloat(num) });
      continue;
    }
    if ('+-*/()'.includes(ch)) {
      tokens.push({ type: 'op', value: ch });
      i += 1;
      continue;
    }
    throw new Error(`Unexpected character: ${ch}`);
  }
  return tokens;
}

// expression := term (('+' | '-') term)*
function parseExpression(tokens: Token[], index: number): { value: number; index: number } {
  let { value, index: idx } = parseTerm(tokens, index);
  let token = tokens[idx];
  while (token && token.type === 'op' && (token.value === '+' || token.value === '-')) {
    const op = token.value;
    const rhs = parseTerm(tokens, idx + 1);
    value = op === '+' ? value + rhs.value : value - rhs.value;
    idx = rhs.index;
    token = tokens[idx];
  }
  return { value, index: idx };
}

// term := factor (('*' | '/') factor)*
function parseTerm(tokens: Token[], index: number): { value: number; index: number } {
  let { value, index: idx } = parseFactor(tokens, index);
  let token = tokens[idx];
  while (token && token.type === 'op' && (token.value === '*' || token.value === '/')) {
    const op = token.value;
    const rhs = parseFactor(tokens, idx + 1);
    if (op === '/' && rhs.value === 0) throw new Error('Division by zero');
    value = op === '*' ? value * rhs.value : value / rhs.value;
    idx = rhs.index;
    token = tokens[idx];
  }
  return { value, index: idx };
}

// factor := number | '(' expression ')' | '-' factor
function parseFactor(tokens: Token[], index: number): { value: number; index: number } {
  const token = tokens[index];
  if (!token) throw new Error('Unexpected end of expression');

  if (token.type === 'num') {
    return { value: token.value, index: index + 1 };
  }
  if (token.type === 'op' && token.value === '(') {
    const inner = parseExpression(tokens, index + 1);
    const closing = tokens[inner.index];
    if (!closing || closing.type !== 'op' || closing.value !== ')') {
      throw new Error('Missing closing parenthesis');
    }
    return { value: inner.value, index: inner.index + 1 };
  }
  if (token.type === 'op' && token.value === '-') {
    const inner = parseFactor(tokens, index + 1);
    return { value: -inner.value, index: inner.index };
  }
  throw new Error('Unexpected token');
}
