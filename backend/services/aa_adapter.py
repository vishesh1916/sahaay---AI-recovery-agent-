"""Account Aggregator adapter for financial data.

MVP: Uses synthetic transaction CSV.
Production: Would connect to Setu AA gateway.
"""
import csv
import os
from abc import ABC, abstractmethod
from datetime import datetime
from dataclasses import dataclass

@dataclass
class Transaction:
    date: str
    description: str
    amount: float
    type: str  # credit or debit
    category: str

@dataclass
class FinancialSummary:
    average_inflow: float
    recurring_expenses: float
    existing_obligations: float
    liquidity_buffer: float
    source: str
    months_analyzed: int
    income_entries: list[dict]
    expense_categories: dict[str, float]

class AAAdapter(ABC):
    """Abstract base class for Account Aggregator adapters."""
    
    @abstractmethod
    async def fetch_transactions(self, user_id: str, months: int = 6) -> list[Transaction]:
        ...
    
    async def compute_financial_summary(self, user_id: str, months: int = 6) -> FinancialSummary:
        """Compute financial summary from transactions."""
        transactions = await self.fetch_transactions(user_id, months)
        
        credits = [t for t in transactions if t.type == "credit"]
        debits = [t for t in transactions if t.type == "debit"]
        
        # Average monthly inflow
        total_inflow = sum(t.amount for t in credits)
        average_inflow = total_inflow / max(months, 1)
        
        # Categorize expenses
        expense_categories: dict[str, float] = {}
        for t in debits:
            cat = t.category.lower()
            expense_categories[cat] = expense_categories.get(cat, 0) + t.amount
        
        # Monthly averages per category
        monthly_categories = {k: v / months for k, v in expense_categories.items()}
        
        # Identify EMI/obligation payments (recurring fixed amounts)
        emi_categories = {"emi", "loan", "credit card", "insurance premium"}
        existing_obligations = sum(
            v for k, v in monthly_categories.items() 
            if any(emi in k for emi in emi_categories)
        )
        
        # Recurring expenses (non-obligation)
        recurring_expenses = sum(
            v for k, v in monthly_categories.items() 
            if not any(emi in k for emi in emi_categories)
        )
        
        # Liquidity buffer
        liquidity_buffer = average_inflow - recurring_expenses - existing_obligations
        
        return FinancialSummary(
            average_inflow=round(average_inflow, 2),
            recurring_expenses=round(recurring_expenses, 2),
            existing_obligations=round(existing_obligations, 2),
            liquidity_buffer=round(liquidity_buffer, 2),
            source="SIMULATED_FINANCIAL_DATA",
            months_analyzed=months,
            income_entries=[{"month": f"Month {i+1}", "amount": average_inflow} for i in range(months)],
            expense_categories=monthly_categories,
        )

class SyntheticTransactionsAdapter(AAAdapter):
    """MVP adapter that reads from a synthetic CSV file."""
    
    def __init__(self, csv_path: str = None):
        self.csv_path = csv_path or os.path.join(
            os.path.dirname(__file__), "..", "data", "sample_transactions.csv"
        )

class SyntheticFinancialDataAdapter(SyntheticTransactionsAdapter):
    """Compliance-labeled adapter for simulated financial transactions (Rule 22/44)."""
    pass
    
    async def fetch_transactions(self, user_id: str, months: int = 6) -> list[Transaction]:
        """Read transactions from CSV file."""
        transactions = []
        try:
            with open(self.csv_path, 'r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                for row in reader:
                    transactions.append(Transaction(
                        date=row.get("date", ""),
                        description=row.get("description", ""),
                        amount=float(row.get("amount", 0)),
                        type=row.get("type", "debit"),
                        category=row.get("category", "misc"),
                    ))
        except FileNotFoundError:
            # Fallback if transaction CSV is missing
            pass
        
        return transactions

class AccountAggregatorAdapter(AAAdapter):
    """Production adapter for Setu AA gateway. NOT IMPLEMENTED for hackathon."""
    
    async def fetch_transactions(self, user_id: str, months: int = 6) -> list[Transaction]:
        raise NotImplementedError(
            "Account Aggregator integration requires Setu AA gateway credentials. "
            "Use SyntheticTransactionsAdapter for the hackathon MVP."
        )
