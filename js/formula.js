export function evaluateFormula(expression, variables) {
  const tokens = [];
  const source = String(expression || "");
  let cursor = 0;
  const tokenPattern = /\s*(?:(\d+(?:\.\d*)?|\.\d+)|([A-Za-z_][A-Za-z0-9_]*)|([()+\-*/]))/y;
  while (cursor < source.length) {
    tokenPattern.lastIndex = cursor;
    const match = tokenPattern.exec(source);
    if (!match) throw new Error("La fórmula tiene un carácter no permitido.");
    tokens.push(match[1] ? { type: "number", value: Number(match[1]) }
      : match[2] ? { type: "variable", value: match[2] }
        : { type: match[3], value: match[3] });
    cursor = tokenPattern.lastIndex;
  }
  if (!tokens.length) throw new Error("Escribe una fórmula.");
  let index = 0;
  const peek = () => tokens[index];
  const consume = (type) => {
    if (peek()?.type !== type) throw new Error("La fórmula tiene paréntesis u operadores incompletos.");
    return tokens[index++];
  };
  const factor = () => {
    if (peek()?.type === "number") return consume("number").value;
    if (peek()?.type === "variable") {
      const name = consume("variable").value;
      if (!(name in variables)) throw new Error(`Variable desconocida: ${name}`);
      return variables[name];
    }
    if (peek()?.type === "+") { consume("+"); return factor(); }
    if (peek()?.type === "-") { consume("-"); return -factor(); }
    if (peek()?.type === "(") {
      consume("(");
      const value = expressionValue();
      consume(")");
      return value;
    }
    throw new Error("La fórmula espera un número o variable.");
  };
  const term = () => {
    let value = factor();
    while (["*", "/"].includes(peek()?.type)) {
      const operator = tokens[index++].type;
      const right = factor();
      if (operator === "/" && right === 0) throw new Error("No se puede dividir por cero.");
      value = operator === "*" ? value * right : value / right;
    }
    return value;
  };
  const expressionValue = () => {
    let value = term();
    while (["+", "-"].includes(peek()?.type)) {
      const operator = tokens[index++].type;
      const right = term();
      value = operator === "+" ? value + right : value - right;
    }
    return value;
  };
  const result = expressionValue();
  if (index !== tokens.length || !Number.isFinite(result)) throw new Error("La fórmula no produce un resultado válido.");
  return result;
}
