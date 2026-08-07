/**
 * Shared debt-simplification utility used by both the Family Gathering and
 * Friends flows. Given a list of net balances (positive = should receive
 * money, negative = owes money), it produces the minimal set of transactions
 * that settles everyone up.
 */

export interface Balance {
  id: string;
  name: string;
  balance: number;
}

export interface Settlement {
  fromId: string;
  fromName: string;
  toId: string;
  toName: string;
  amount: number;
}

const EPSILON = 0.01;

export function roundCurrency(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function simplifySettlements(balances: Balance[]): Settlement[] {
  const creditors = balances
    .filter((b) => b.balance > EPSILON)
    .map((b) => ({ ...b, balance: roundCurrency(b.balance) }))
    .sort((a, b) => b.balance - a.balance);

  const debtors = balances
    .filter((b) => b.balance < -EPSILON)
    .map((b) => ({ ...b, balance: roundCurrency(b.balance) }))
    .sort((a, b) => a.balance - b.balance);

  const settlements: Settlement[] = [];
  let i = 0;
  let j = 0;

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];
    const amount = roundCurrency(Math.min(-debtor.balance, creditor.balance));

    if (amount > EPSILON) {
      settlements.push({
        fromId: debtor.id,
        fromName: debtor.name,
        toId: creditor.id,
        toName: creditor.name,
        amount,
      });
    }

    debtor.balance = roundCurrency(debtor.balance + amount);
    creditor.balance = roundCurrency(creditor.balance - amount);

    if (Math.abs(debtor.balance) <= EPSILON) i += 1;
    if (Math.abs(creditor.balance) <= EPSILON) j += 1;
  }

  return settlements;
}
