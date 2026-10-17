import calendar
from datetime import date

import ollama

MODEL = "qwen3.5:4b"

SYSTEM_PROMPT = """You are a local Financial Analyst specialized in personal budgeting. Analyze the provided categorical data, evaluate spending habits, find inefficiencies, and suggest realistic, structured changes. Keep responses short, data-focused and actionable. Never recalculate the numbers; use the figures given to you exactly."""

# Default target split (50/30/20 rule)
TARGETS = {"needs": 0.50, "wants": 0.30, "savings": 0.20}


def parse_targets(text):
    """Parse 'needs/wants/savings' percentages like '60/20/20'. Returns None if invalid."""
    try:
        parts = [float(p) for p in text.replace("%", "").replace(",", "/").replace(" ", "/").split("/") if p]
    except ValueError:
        return None
    if len(parts) != 3 or any(p < 0 for p in parts) or abs(sum(parts) - 100) > 0.01:
        return None
    return dict(zip(("needs", "wants", "savings"), (p / 100 for p in parts)))


def recommend_split(income, needs):
    """Recommend a split from income and the share needs already take.

    Needs up to 50% keep the 50/30/20 rule. Above that, needs stay as-is and the
    remainder is divided between wants and savings; higher incomes can save more.
    """
    needs_pct = needs / income
    if needs_pct <= TARGETS["needs"]:
        return dict(TARGETS)
    remainder = max(0.0, 1 - needs_pct)
    savings_share = 0.35 if income < 3000 else 0.40 if income < 8000 else 0.50
    savings = remainder * savings_share
    return {"needs": needs_pct, "wants": remainder - savings, "savings": savings}


def format_recommendation(income, needs, rec):
    lines = [f"Needs use {needs / income * 100:.1f}% of your income.", "Recommended split:"]
    for cat, share in rec.items():
        lines.append(f"  {cat.title():<8}{share * 100:5.1f}%  ${income * share:>10,.2f}/month  ${income * share / 30:>8,.2f}/day (30-day avg)")
    if needs >= income:
        lines.append("Warning: needs consume all of your income; reducing needs must come first.")
    elif rec["savings"] < 0.10:
        lines.append("Warning: savings would be under 10%; look for ways to lower needs.")
    return "\n".join(lines)


def ask_targets(default):
    default_text = "/".join(f"{v * 100:g}" for v in default.values())
    while True:
        text = input(f"Target split needs/wants/savings in % [Enter = recommended {default_text}]: ").strip()
        if not text:
            return dict(default)
        targets = parse_targets(text)
        if targets:
            return targets
        print("Enter three non-negative percentages that add up to 100, e.g. 60/25/15.")


def build_budget(income, needs, wants, savings, days=None, targets=None):
    """Deterministic math: the small model must not do arithmetic."""
    targets = targets or recommend_split(income, needs)
    if days is None:
        today = date.today()
        days = calendar.monthrange(today.year, today.month)[1]
    actual = {"needs": needs, "wants": wants, "savings": savings}
    spent = sum(actual.values())
    rows = {}
    for cat, target in targets.items():
        ideal = income * target
        rows[cat] = {
            "actual": actual[cat],
            "actual_pct": actual[cat] / income * 100,
            "target": ideal,
            "target_pct": target * 100,
            "diff": actual[cat] - ideal,
            "daily_actual": actual[cat] / days,
            "daily_target": ideal / days,
        }
    return {
        "income": income,
        "days": days,
        "unallocated": income - spent,
        "daily_spendable": (needs + wants) / days,
        "rows": rows,
    }


def format_budget(b):
    lines = [f"Monthly income: ${b['income']:,.2f} ({b['days']} days)", ""]
    lines.append(f"{'Category':<9}{'Actual':>11}{'%':>7}{'Target':>11}{'%':>6}{'Diff':>11}{'Daily act.':>12}{'Daily tgt.':>12}")
    for cat, r in b["rows"].items():
        lines.append(
            f"{cat.title():<9}{r['actual']:>11,.2f}{r['actual_pct']:>6.1f}%"
            f"{r['target']:>11,.2f}{r['target_pct']:>5.0f}%{r['diff']:>+11,.2f}"
            f"{r['daily_actual']:>12,.2f}{r['daily_target']:>12,.2f}"
        )
    lines.append("")
    lines.append(f"Unallocated: ${b['unallocated']:,.2f}")
    lines.append(f"Daily spending limit (needs + wants): ${b['daily_spendable']:,.2f}")
    return "\n".join(lines)


def ask_float(prompt):
    while True:
        try:
            value = float(input(prompt).replace("$", "").replace(",", ""))
            if value >= 0:
                return value
        except ValueError:
            pass
        print("Please enter a non-negative number.")


def plan_emergency_fund(needs, months, current=0.0, goal_months=3):
    """Goal = goal_months of needs; returns the monthly contribution required."""
    goal = needs * goal_months
    remaining = max(0.0, goal - current)
    return {"goal": goal, "current": current, "remaining": remaining, "months": months, "monthly": remaining / months}


def format_emergency_fund(plan, savings):
    lines = [
        f"Emergency fund goal (3 months of needs): ${plan['goal']:,.2f}",
        f"Already saved: ${plan['current']:,.2f}  |  Remaining: ${plan['remaining']:,.2f}",
        f"To reach it in {plan['months']} months, save ${plan['monthly']:,.2f}/month "
        f"(${plan['monthly'] / 30:,.2f}/day).",
    ]
    if plan["remaining"] == 0:
        lines.append("Goal already met.")
    elif plan["monthly"] <= savings:
        lines.append(f"This fits within your ${savings:,.2f} monthly savings, leaving ${savings - plan['monthly']:,.2f} for other goals.")
    else:
        months_needed = plan["remaining"] / savings if savings > 0 else None
        lines.append(f"This is ${plan['monthly'] - savings:,.2f} more than your monthly savings.")
        if months_needed:
            lines.append(f"At your current savings it would take {months_needed:.1f} months; or trim wants to close the gap.")
    return "\n".join(lines)


def ask_emergency_fund(needs, savings):
    if needs <= 0:
        return None
    current = ask_float("Emergency fund already saved: $")
    while True:
        months = ask_float("In how many months do you want to reach the goal? ")
        if months >= 1:
            break
        print("Enter at least 1 month.")
    return format_emergency_fund(plan_emergency_fund(needs, months, current), savings)


def chat(messages):
    reply = ollama.chat(model=MODEL, messages=messages)["message"]["content"]
    messages.append({"role": "assistant", "content": reply})
    return reply


def main():
    print("Personal Budget Analyst (press Enter or type 'quit' at the follow-up prompt to exit)\n")
    income = ask_float("Monthly income (after tax): $")
    if income <= 0:
        print("Income must be greater than zero.")
        return
    needs = ask_float("Monthly NEEDS (rent, utilities, groceries, transport, insurance): $")
    rec = recommend_split(income, needs)
    print("\n" + format_recommendation(income, needs, rec) + "\n")

    wants = ask_float("Monthly WANTS (dining out, subscriptions, shopping, fun): $")
    savings = ask_float("Monthly SAVINGS (savings, investments, extra debt payments): $")

    targets = ask_targets(rec)
    budget = build_budget(income, needs, wants, savings, targets=targets)
    split = "/".join(f"{v * 100:g}" for v in targets.values())
    summary = format_budget(budget)
    print("\n" + summary + "\n")

    fund = ask_emergency_fund(needs, savings)
    if fund:
        print("\n" + fund + "\n")
        summary += "\n\n" + fund

    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {
            "role": "user",
            "content": f"Here is my computed budget vs my {split} needs/wants/savings targets:\n\n"
            f"{summary}\n\nGive 3 specific, realistic recommendations.",
        },
    ]
    try:
        print("Analyst:", chat(messages), "\n")
    except Exception as e:
        print(f"Could not reach Ollama ({e}). Run `ollama pull {MODEL}` and make sure Ollama is running.")
        return

    while True:
        q = input("You: ").strip()
        if q.lower() in {"quit", "exit", ""}:
            break
        messages.append({"role": "user", "content": q})
        print("Analyst:", chat(messages), "\n")


if __name__ == "__main__":
    main()
