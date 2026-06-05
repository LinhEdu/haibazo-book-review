from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from database import Base, engine, get_db
import models
import schemas

Base.metadata.create_all(bind=engine)

app = FastAPI(title="HAIBAZO Book Review API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"message": "HAIBAZO Book Review API is running"}


# =========================
# AUTHORS
# =========================

@app.get("/authors")
def get_authors(db: Session = Depends(get_db)):
    authors = db.query(models.Author).all()

    result = []

    for author in authors:
        result.append({
            "id": author.id,
            "name": author.name,
            "books_count": len(author.books)
        })

    return result


@app.post("/authors")
def create_author(author: schemas.AuthorCreate, db: Session = Depends(get_db)):
    if not author.name.strip():
        raise HTTPException(status_code=400, detail="Please enter name")

    new_author = models.Author(name=author.name.strip())

    db.add(new_author)
    db.commit()
    db.refresh(new_author)

    return {
        "id": new_author.id,
        "name": new_author.name,
        "books_count": 0
    }


@app.put("/authors/{author_id}")
def update_author(
    author_id: int,
    author: schemas.AuthorUpdate,
    db: Session = Depends(get_db)
):
    existing_author = db.query(models.Author).filter(
        models.Author.id == author_id
    ).first()

    if not existing_author:
        raise HTTPException(status_code=404, detail="Author not found")

    if not author.name.strip():
        raise HTTPException(status_code=400, detail="Please enter name")

    existing_author.name = author.name.strip()

    db.commit()
    db.refresh(existing_author)

    return {
        "id": existing_author.id,
        "name": existing_author.name,
        "books_count": len(existing_author.books)
    }


@app.delete("/authors/{author_id}")
def delete_author(author_id: int, db: Session = Depends(get_db)):
    existing_author = db.query(models.Author).filter(
        models.Author.id == author_id
    ).first()

    if not existing_author:
        raise HTTPException(status_code=404, detail="Author not found")

    db.delete(existing_author)
    db.commit()

    return {"message": "Author deleted successfully"}


# =========================
# BOOKS
# =========================

@app.get("/books")
def get_books(db: Session = Depends(get_db)):
    books = db.query(models.Book).all()

    result = []

    for book in books:
        result.append({
            "id": book.id,
            "title": book.title,
            "author_id": book.author_id,
            "author_name": book.author.name if book.author else ""
        })

    return result


@app.post("/books")
def create_book(book: schemas.BookCreate, db: Session = Depends(get_db)):
    if not book.title.strip():
        raise HTTPException(status_code=400, detail="Please enter title")

    author = db.query(models.Author).filter(
        models.Author.id == book.author_id
    ).first()

    if not author:
        raise HTTPException(status_code=400, detail="Please select author")

    new_book = models.Book(
        title=book.title.strip(),
        author_id=book.author_id
    )

    db.add(new_book)
    db.commit()
    db.refresh(new_book)

    return {
        "id": new_book.id,
        "title": new_book.title,
        "author_id": new_book.author_id,
        "author_name": author.name
    }


@app.put("/books/{book_id}")
def update_book(
    book_id: int,
    book: schemas.BookUpdate,
    db: Session = Depends(get_db)
):
    existing_book = db.query(models.Book).filter(
        models.Book.id == book_id
    ).first()

    if not existing_book:
        raise HTTPException(status_code=404, detail="Book not found")

    if not book.title.strip():
        raise HTTPException(status_code=400, detail="Please enter title")

    author = db.query(models.Author).filter(
        models.Author.id == book.author_id
    ).first()

    if not author:
        raise HTTPException(status_code=400, detail="Please select author")

    existing_book.title = book.title.strip()
    existing_book.author_id = book.author_id

    db.commit()
    db.refresh(existing_book)

    return {
        "id": existing_book.id,
        "title": existing_book.title,
        "author_id": existing_book.author_id,
        "author_name": author.name
    }


@app.delete("/books/{book_id}")
def delete_book(book_id: int, db: Session = Depends(get_db)):
    existing_book = db.query(models.Book).filter(
        models.Book.id == book_id
    ).first()

    if not existing_book:
        raise HTTPException(status_code=404, detail="Book not found")

    db.delete(existing_book)
    db.commit()

    return {"message": "Book deleted successfully"}


# =========================
# REVIEWS
# =========================

@app.get("/reviews")
def get_reviews(db: Session = Depends(get_db)):
    reviews = db.query(models.Review).all()

    result = []

    for review in reviews:
        book = review.book
        author = book.author if book else None

        result.append({
            "id": review.id,
            "book_id": review.book_id,
            "book_title": book.title if book else "",
            "author_name": author.name if author else "",
            "content": review.content
        })

    return result


@app.post("/reviews")
def create_review(review: schemas.ReviewCreate, db: Session = Depends(get_db)):
    book = db.query(models.Book).filter(
        models.Book.id == review.book_id
    ).first()

    if not book:
        raise HTTPException(status_code=400, detail="Please select book")

    if not review.content.strip():
        raise HTTPException(status_code=400, detail="Please enter review")

    new_review = models.Review(
        book_id=review.book_id,
        content=review.content.strip()
    )

    db.add(new_review)
    db.commit()
    db.refresh(new_review)

    return {
        "id": new_review.id,
        "book_id": new_review.book_id,
        "book_title": book.title,
        "author_name": book.author.name if book.author else "",
        "content": new_review.content
    }


@app.put("/reviews/{review_id}")
def update_review(
    review_id: int,
    review: schemas.ReviewUpdate,
    db: Session = Depends(get_db)
):
    existing_review = db.query(models.Review).filter(
        models.Review.id == review_id
    ).first()

    if not existing_review:
        raise HTTPException(status_code=404, detail="Review not found")

    book = db.query(models.Book).filter(
        models.Book.id == review.book_id
    ).first()

    if not book:
        raise HTTPException(status_code=400, detail="Please select book")

    if not review.content.strip():
        raise HTTPException(status_code=400, detail="Please enter review")

    existing_review.book_id = review.book_id
    existing_review.content = review.content.strip()

    db.commit()
    db.refresh(existing_review)

    return {
        "id": existing_review.id,
        "book_id": existing_review.book_id,
        "book_title": book.title,
        "author_name": book.author.name if book.author else "",
        "content": existing_review.content
    }


@app.delete("/reviews/{review_id}")
def delete_review(review_id: int, db: Session = Depends(get_db)):
    existing_review = db.query(models.Review).filter(
        models.Review.id == review_id
    ).first()

    if not existing_review:
        raise HTTPException(status_code=404, detail="Review not found")

    db.delete(existing_review)
    db.commit()

    return {"message": "Review deleted successfully"}