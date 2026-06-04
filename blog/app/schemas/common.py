from pydantic import BaseModel
from typing import Generic, TypeVar

T = TypeVar("T")


class PaginatedResponse(BaseModel):
    data: list
    total: int
    page: int
    page_size: int


class MessageResponse(BaseModel):
    message: str = "ok"
