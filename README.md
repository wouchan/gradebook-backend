# Gradebook

## Made by Adrian Kafel

A comprehensive web-based gradebook system designed for educational institutions to manage student grades, courses, and user accounts efficiently.

## Overview

Gradebook is a full-stack web application that provides essential gradebook functionality for schools and educational institutions. The system supports role-based access control with three distinct user types and offers a clean, intuitive interface for managing academic records.

## Features

### User Management

- **Authentication System**: Secure login and session management
- **Role-Based Access Control**: Three user types with specific permissions
  - **Students**: View their own grades and course information
  - **Teachers**: Create and manage grades for their assigned courses
  - **Admins**: Full system access including user and course management

### Core Functionality

- **Course Management**: Create, edit, and organize courses
- **Grade Management**: Add, update, and track student grades
- **User Administration**: Create and manage student, teacher, and admin accounts

## Technical Stack

### Frontend

- **React**: Modern JavaScript library for building user interfaces
- **Component-based architecture**: Modular and reusable UI components
- **Responsive design**: Optimized for desktop and mobile devices

### Backend

- **Node.js**: JavaScript runtime for server-side development
- **TypeScript**: Type-safe JavaScript for enhanced development experience
- **Express.js**: Fast and minimalist web framework
- **Drizzle ORM**: Type-safe database toolkit and ORM
- **PostgreSQL**: Robust relational database management system

### Additional Technologies

- **JWT Authentication**: Secure token-based authentication
- **RESTful API**: Clean and organized API endpoints
- **Environment Configuration**: Secure configuration management

## Installation

### Prerequisites

- Node.js
- PostgreSQL
- npm or compatible package manager

## API Documentation

| Method | Endpoint  | Description        | Auth Required |
| ------ | --------- | ------------------ | ------------- |
| GET    | `/health` | Check server state | No            |

### Authentication Endpoints

| Method | Endpoint           | Description      | Auth Required |
| ------ | ------------------ | ---------------- | ------------- |
| POST   | `/api/auth/login`  | User login       | No            |
| POST   | `/api/auth/logout` | User logout      | Yes           |
| GET    | `/api/auth/me`     | Get current user | Yes           |

### User Management Endpoints

| Method | Endpoint         | Description     | Auth Required | Role Required |
| ------ | ---------------- | --------------- | ------------- | ------------- |
| GET    | `/api/users`     | Get all users   | Yes           | Admin         |
| POST   | `/api/users`     | Create new user | Yes           | Admin         |
| GET    | `/api/users/:id` | Get user by ID  | Yes           | Admin/Self    |
| PUT    | `/api/users/:id` | Update user     | Yes           | Admin/Self    |
| DELETE | `/api/users/:id` | Delete user     | Yes           | Admin         |

### Class Management Endpoints

| Method | Endpoint                       | Description           | Auth Required | Role Required |
| ------ | ------------------------------ | --------------------- | ------------- | ------------- |
| GET    | `/api/classes`                 | Get all classes       | Yes           | All           |
| POST   | `/api/classes`                 | Create new class      | Yes           | Admin         |
| GET    | `/api/classes/:id`             | Get class by ID       | Yes           | All           |
| PUT    | `/api/classes/:id`             | Update class          | Yes           | Admin         |
| DELETE | `/api/classes/:id`             | Delete class          | Yes           | Admin         |
| GET    | `/api/classes/:id/enrollments` | Get class enrollments | Yes           | All           |

### Grade Management Endpoints

| Method | Endpoint                         | Description           | Auth Required | Role Required |
| ------ | -------------------------------- | --------------------- | ------------- | ------------- |
| GET    | `/api/grades`                    | Get grades            | Yes           | All           |
| POST   | `/api/grades`                    | Create new grade      | Yes           | Teacher/Admin |
| GET    | `/api/grades/:id`                | Get grade by ID       | Yes           | All           |
| PUT    | `/api/grades/:id`                | Update grade          | Yes           | Teacher/Admin |
| DELETE | `/api/grades/:id`                | Delete grade          | Yes           | Teacher/Admin |
| GET    | `/api/grades/student/:studentId` | Get grades by student | Yes           | All           |
| GET    | `/api/grades/class/:classId`     | Get grades by class   | Yes           | All           |

### Enrollment Management Endpoints

| Method | Endpoint                              | Description               | Auth Required | Role Required |
| ------ | ------------------------------------- | ------------------------- | ------------- | ------------- |
| GET    | `/api/enrollments`                    | Get enrollments           | Yes           | All           |
| POST   | `/api/enrollments`                    | Create new enrollment     | Yes           | Admin         |
| GET    | `/api/enrollments/:id`                | Get enrollment by ID      | Yes           | All           |
| PUT    | `/api/enrollments/:id`                | Update enrollment         | Yes           | Admin         |
| DELETE | `/api/enrollments/:id`                | Delete enrollment         | Yes           | Admin         |
| GET    | `/api/enrollments/student/:studentId` | Get enrollment by student | Yes           | All           |

## Database Schema

### Users Table

| Column     | Type         | Constraints             | Description                         |
| ---------- | ------------ | ----------------------- | ----------------------------------- |
| id         | SERIAL       | PRIMARY KEY             | Unique user identifier              |
| email      | VARCHAR(255) | UNIQUE, NOT NULL        | User email address                  |
| password   | VARCHAR(255) | NOT NULL                | Hashed password                     |
| first_name | VARCHAR(100) | NOT NULL                | User's first name                   |
| last_name  | VARCHAR(100) | NOT NULL                | User's last name                    |
| user_type  | ENUM         | NOT NULL                | User role (student, teacher, admin) |
| is_active  | BOOLEAN      | DEFAULT true, NOT NULL  | Account status                      |
| created_at | TIMESTAMP    | DEFAULT NOW(), NOT NULL | Account creation timestamp          |
| updated_at | TIMESTAMP    | DEFAULT NOW(), NOT NULL | Last update timestamp               |

### Students Table

| Column          | Type      | Constraints             | Description               |
| --------------- | --------- | ----------------------- | ------------------------- |
| id              | SERIAL    | PRIMARY KEY             | Unique student identifier |
| user_id         | INTEGER   | FOREIGN KEY, NOT NULL   | Reference to users table  |
| enrollment_date | TIMESTAMP | DEFAULT NOW(), NOT NULL | Student enrollment date   |

### Teachers Table

| Column    | Type      | Constraints             | Description               |
| --------- | --------- | ----------------------- | ------------------------- |
| id        | SERIAL    | PRIMARY KEY             | Unique teacher identifier |
| user_id   | INTEGER   | FOREIGN KEY, NOT NULL   | Reference to users table  |
| hire_date | TIMESTAMP | DEFAULT NOW(), NOT NULL | Teacher hire date         |

### Classes Table

| Column     | Type         | Constraints            | Description                 |
| ---------- | ------------ | ---------------------- | --------------------------- |
| id         | SERIAL       | PRIMARY KEY            | Unique class identifier     |
| name       | VARCHAR(200) | UNIQUE, NOT NULL       | Class name                  |
| teacher_id | INTEGER      | FOREIGN KEY, NOT NULL  | Reference to teachers table |
| is_active  | BOOLEAN      | DEFAULT true, NOT NULL | Class status                |

### Enrollments Table

| Column          | Type      | Constraints             | Description                  |
| --------------- | --------- | ----------------------- | ---------------------------- |
| id              | SERIAL    | PRIMARY KEY             | Unique enrollment identifier |
| student_id      | INTEGER   | FOREIGN KEY, NOT NULL   | Reference to students table  |
| class_id        | INTEGER   | FOREIGN KEY, NOT NULL   | Reference to classes table   |
| enrollment_date | TIMESTAMP | DEFAULT NOW(), NOT NULL | Enrollment timestamp         |
| is_active       | BOOLEAN   | DEFAULT true, NOT NULL  | Enrollment status            |

_Indexes: Unique index on (student_id, class_id)_

### Grades Table

| Column          | Type         | Constraints             | Description                    |
| --------------- | ------------ | ----------------------- | ------------------------------ |
| id              | SERIAL       | PRIMARY KEY             | Unique grade identifier        |
| enrollment_id   | INTEGER      | FOREIGN KEY, NOT NULL   | Reference to enrollments table |
| assignment_name | VARCHAR(200) | NOT NULL                | Name of assignment             |
| grade_value     | INTEGER      | NOT NULL                | Numeric grade value            |
| weight          | INTEGER      | DEFAULT 1               | Grade weight for calculations  |
| comments        | TEXT         |                         | Additional comments            |
| graded_by       | INTEGER      | FOREIGN KEY, NOT NULL   | Reference to teachers table    |
| graded_at       | TIMESTAMP    | DEFAULT NOW(), NOT NULL | Grading timestamp              |
| updated_at      | TIMESTAMP    | DEFAULT NOW(), NOT NULL | Last update timestamp          |

### Sessions Table

| Column     | Type         | Constraints             | Description                |
| ---------- | ------------ | ----------------------- | -------------------------- |
| id         | SERIAL       | PRIMARY KEY             | Unique session identifier  |
| user_id    | INTEGER      | FOREIGN KEY, NOT NULL   | Reference to users table   |
| token      | VARCHAR(500) | UNIQUE, NOT NULL        | Session token              |
| expires_at | TIMESTAMP    | NOT NULL                | Token expiration time      |
| created_at | TIMESTAMP    | DEFAULT NOW(), NOT NULL | Session creation timestamp |

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions, please create an issue in the GitHub repository or contact the development team.

---

**Note**: This is a educational project designed for learning purposes.
