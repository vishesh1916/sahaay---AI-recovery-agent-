from fastapi import APIRouter
from .users import router as users_router
from .cases import router as cases_router
from .documents import router as documents_router
from .payments import router as payments_router

api_router = APIRouter()

api_router.include_router(users_router, prefix="/users", tags=["users"])
api_router.include_router(cases_router, prefix="/cases", tags=["cases"])
api_router.include_router(documents_router, prefix="/documents", tags=["documents"])
api_router.include_router(payments_router, prefix="/payments", tags=["payments"])
