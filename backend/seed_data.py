import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from database import AsyncSessionLocal, create_tables
from models.user import User
from models.case import Case
from models.financial_context import FinancialContext

async def seed():
    await create_tables()
    async with AsyncSessionLocal() as session:
        # Create user
        user = User(name="User", language="english", consent_health=True, consent_financial=True, consent_payment=True)
        session.add(user)
        await session.flush()

        # Create sample case
        case = Case(case_id="CASE-SH-SAMPLE", user_id=user.user_id, type="medical", status="open")
        session.add(case)
        await session.flush()

        # Create financial context
        fin_context = FinancialContext(
            case_id=case.case_id,
            average_inflow=53700.0,
            recurring_expenses=31400.0,
            existing_obligations=6500.0,
            liquidity_buffer=15800.0,
            source="bank_statement"
        )
        session.add(fin_context)
        
        await session.commit()
        print("Seed data successfully added!")

if __name__ == "__main__":
    asyncio.run(seed())
