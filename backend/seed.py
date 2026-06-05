from database import SessionLocal, Base, engine
from models import Author, Book, Review

# Create tables if they do not exist
Base.metadata.create_all(bind=engine)


def seed_data():
    db = SessionLocal()

    try:
        # Clear old data
        db.query(Review).delete()
        db.query(Book).delete()
        db.query(Author).delete()
        db.commit()

        # Authors
        author_1 = Author(name="Jack Trout")
        author_2 = Author(name="Inamori Kazuo")
        author_3 = Author(name="Stephen King")
        author_4 = Author(name="Robert Kiyosaki")
        author_5 = Author(name="Dale Carnegie")

        db.add_all([
            author_1,
            author_2,
            author_3,
            author_4,
            author_5
        ])
        db.commit()

        # Refresh to get author IDs
        db.refresh(author_1)
        db.refresh(author_2)
        db.refresh(author_3)
        db.refresh(author_4)
        db.refresh(author_5)

        # Books
        book_1 = Book(
            title="The 22 Immutable Laws of Marketing",
            author_id=author_1.id
        )

        book_2 = Book(
            title="Positioning: The Battle for Your Mind",
            author_id=author_1.id
        )

        book_3 = Book(
            title="Amoeba Management",
            author_id=author_2.id
        )

        book_4 = Book(
            title="The Shining",
            author_id=author_3.id
        )

        book_5 = Book(
            title="Rich Dad Poor Dad",
            author_id=author_4.id
        )

        book_6 = Book(
            title="How to Win Friends and Influence People",
            author_id=author_5.id
        )

        db.add_all([
            book_1,
            book_2,
            book_3,
            book_4,
            book_5,
            book_6
        ])
        db.commit()

        # Refresh to get book IDs
        db.refresh(book_1)
        db.refresh(book_2)
        db.refresh(book_3)
        db.refresh(book_4)
        db.refresh(book_5)
        db.refresh(book_6)

        # Reviews
        review_1 = Review(
            book_id=book_1.id,
            content="A useful book for understanding basic marketing principles."
        )

        review_2 = Review(
            book_id=book_1.id,
            content="The examples are simple and easy to understand."
        )

        review_3 = Review(
            book_id=book_3.id,
            content="This book gives a practical view of business management."
        )

        review_4 = Review(
            book_id=book_4.id,
            content="A very engaging horror novel with strong atmosphere."
        )

        review_5 = Review(
            book_id=book_5.id,
            content="Good introduction to personal finance and mindset."
        )

        review_6 = Review(
            book_id=book_6.id,
            content="A classic book about communication and relationship building."
        )

        db.add_all([
            review_1,
            review_2,
            review_3,
            review_4,
            review_5,
            review_6
        ])
        db.commit()

        print("Seed data inserted successfully!")

    except Exception as error:
        db.rollback()
        print("Seed data failed!")
        print(error)

    finally:
        db.close()


if __name__ == "__main__":
    seed_data()