# Database Schema Documentation

## Summary
This database schema supports a library management system, capturing essential information about authors, books, borrowers, and the borrowing transactions. It facilitates the organization of authors and their works, as well as tracking who borrows which books and when. This system enhances the efficiency of managing library resources.

## Table of Contents
1. [Authors Table](#authors-table)
2. [Books Table](#books-table)
3. [Borrowers Table](#borrowers-table)
4. [Borrowings Table](#borrowings-table)

## Authors Table

**Description:**  
The Authors table stores information about book authors.

| Column Name | Data Type | Constraints | Description |
|-------------|-----------|-------------|-------------|
| author_id   | [INT](https://www.postgresql.org/docs/current/datatype-numeric.html#DATATYPE-NUMERIC-INTEGER) | `PRIMARY KEY`, `AUTO_INCREMENT` | Unique identifier for each author. |
| first_name  | [VARCHAR(100)](https://www.postgresql.org/docs/current/datatype-character.html#DATATYPE-CHARACTER-VARYING) | `NOT NULL` | Author's first name. |
| last_name   | [VARCHAR(100)](https://www.postgresql.org/docs/current/datatype-character.html#DATATYPE-CHARACTER-VARYING) | `NOT NULL` | Author's last name. |
| birth_year  | [INT](https://www.postgresql.org/docs/current/datatype-numeric.html#DATATYPE-NUMERIC-INTEGER) |  | Author's birth year. |

**Relationships:**
- One-to-Many relationship with the **Books** table via `author_id`.

## Books Table

**Description:**  
The Books table stores information about books available in the library.

| Column Name | Data Type | Constraints | Description |
|-------------|-----------|-------------|-------------|
| book_id     | [INT](https://www.postgresql.org/docs/current/datatype-numeric.html#DATATYPE-NUMERIC-INTEGER) | `PRIMARY KEY`, `AUTO_INCREMENT` | Unique identifier for each book. |
| title       | [VARCHAR(255)](https://www.postgresql.org/docs/current/datatype-character.html#DATATYPE-CHARACTER-VARYING) | `NOT NULL` | Title of the book. |
| genre       | [VARCHAR(100)](https://www.postgresql.org/docs/current/datatype-character.html#DATATYPE-CHARACTER-VARYING) |  | Genre of the book. |
| publish_year | [INT](https://www.postgresql.org/docs/current/datatype-numeric.html#DATATYPE-NUMERIC-INTEGER) |  | Year the book was published. |
| author_id   | [INT](https://www.postgresql.org/docs/current/datatype-numeric.html#DATATYPE-NUMERIC-INTEGER) | `FOREIGN KEY` | References the author of the book. |

**Relationships:**
- Many-to-One relationship with the **Authors** table via `author_id`.
- Many-to-Many relationship with the **Borrowers** table through the **Borrowings** table.

## Borrowers Table

**Description:**  
The Borrowers table stores information about individuals who borrow books.

| Column Name | Data Type | Constraints | Description |
|-------------|-----------|-------------|-------------|
| borrower_id | [INT](https://www.postgresql.org/docs/current/datatype-numeric.html#DATATYPE-NUMERIC-INTEGER) | `PRIMARY KEY`, `AUTO_INCREMENT` | Unique identifier for each borrower. |
| first_name  | [VARCHAR(100)](https://www.postgresql.org/docs/current/datatype-character.html#DATATYPE-CHARACTER-VARYING) | `NOT NULL` | Borrower's first name. |
| last_name   | [VARCHAR(100)](https://www.postgresql.org/docs/current/datatype-character.html#DATATYPE-CHARACTER-VARYING) | `NOT NULL` | Borrower's last name. |
| email       | [VARCHAR(255)](https://www.postgresql.org/docs/current/datatype-character.html#DATATYPE-CHARACTER-VARYING) | `NOT NULL`, `UNIQUE` | Borrower's email address. |

**Relationships:**
- Many-to-Many relationship with the **Books** table through the **Borrowings** table.

## Borrowings Table

**Description:**  
The Borrowings table represents the many-to-many relationship between books and borrowers, tracking which borrower has borrowed which book and when.

| Column Name   | Data Type | Constraints | Description |
|---------------|-----------|-------------|-------------|
| borrow_id     | [INT](https://www.postgresql.org/docs/current/datatype-numeric.html#DATATYPE-NUMERIC-INTEGER) | `PRIMARY KEY`, `AUTO_INCREMENT` | Unique identifier for each borrowing record. |
| book_id       | [INT](https://www.postgresql.org/docs/current/datatype-numeric.html#DATATYPE-NUMERIC-INTEGER) | `FOREIGN KEY` | References the borrowed book. |
| borrower_id   | [INT](https://www.postgresql.org/docs/current/datatype-numeric.html#DATATYPE-NUMERIC-INTEGER) | `FOREIGN KEY` | References the borrower. |
| borrow_date   | [DATE](https://www.postgresql.org/docs/current/datatype-datetime.html#DATATYPE-DATETIME-DATE) | `NOT NULL` | Date when the book was borrowed. |
| return_date   | [DATE](https://www.postgresql.org/docs/current/datatype-datetime.html#DATATYPE-DATETIME-DATE) |  | Date when the book was returned. |

**Relationships:**
- Many-to-One relationship with the **Books** table via `book_id`.
- Many-to-One relationship with the **Borrowers** table via `borrower_id`.
- Represents a Many-to-Many relationship between **Books** and **Borrowers**.

## References

- [PostgreSQL Data Types](https://www.postgresql.org/docs/current/datatype.html)
- [PostgreSQL Constraints](https://www.postgresql.org/docs/current/ddl-constraints.html)
- [PostgreSQL Foreign Keys](https://www.postgresql.org/docs/current/ddl-constraints.html#DDL-CONSTRAINTS-FK)
