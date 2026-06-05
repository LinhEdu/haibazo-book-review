from pydantic import BaseModel

class AuthorCreate(BaseModel):
    name: str

class AuthorUpdate(BaseModel):
    name: str

class AuthorResponse(BaseModel):
    id: int
    name: str
    books_count: int = 0

    class Config:
        from_attributes = True


class BookCreate(BaseModel):
    title: str
    author_id: int

class BookUpdate(BaseModel):
    title: str
    author_id: int

class BookResponse(BaseModel):
    id: int
    title: str
    author_id: int
    author_name: str

    class Config:
        from_attributes = True


class ReviewCreate(BaseModel):
    book_id: int
    content: str

class ReviewUpdate(BaseModel):
    book_id: int
    content: str

class ReviewResponse(BaseModel):
    id: int
    book_id: int
    book_title: str
    author_name: str
    content: str

    class Config:
        from_attributes = True