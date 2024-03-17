# My API Documentation

## Introduction

This API provides endpoints to manage users in the system. Users can be created using the `create` endpoint, and existing users can log in using the `login` endpoint. 

## Authentication

Authentication is required for all endpoints. The API uses JSON Web Tokens (JWT) for authentication. To authenticate, include the JWT token in the Authorization header of the request.



## Base URL

The base URL for all API endpoints is `https://cyan-unusual-moose.cyclic.app/api`.

## User Entity

### Create User

#### Endpoint

- **URL:** `/user/create`
- **Method:** POST

#### Request Body

- **email** (string, required): The email of the user.
- **password** (string, required): The password of the user.
- **role** (string, required): The role of the user. Possible values: 'super-admin'.
- **schoolID** (string, required for 'admin' role): The ID of the school associated with the user. Not required if the role is 'super-admin'.

#### Response

- **Status:** 201 Created
- **Body:** The newly created user object.
- **Error Responses:**
  - 400 Bad Request: If the request body is missing required fields or contains invalid data.
  - 401 Unauthorized: If authentication is required but missing or invalid.
  - 403 Forbidden: If the user does not have permission to create a user.

#### Example

```json
POST /api/user/create
{
    "email": "admin@example.com",
    "password": "password123",
    "role": "admin",
    "schoolID": "1234567890"
}
```
### Login

#### Endpoint

- **URL:** `/user/login`
- **Method:** POST

#### Request Body

- **email** (string, required): The email of the user.
- **password** (string, required): The password of the user.

#### Response

- **Status:** 201 Created
- **Body:** The newly created user object.
- **Error Responses:**
  - 400 Bad Request: If the request body is missing required fields or contains invalid data.

#### Example

```json
POST /api/user/login
{
    "email": "admin@example.com",
    "password": "password123",
}
```

## Student Entity

### Create Student


#### Endpoint

- **URL:** `/student/create`
- **Method:** POST
- **Authentication Required:** Yes

#### Request Parameters
id (string, required): The ID of the student to update.

#### Request Body

- **name** (string, required): The name of the student.
- **age** (number, required): The age of the student.
- **classroomID** (string, required): The ID of the classroom the student belongs to.

#### Response

- **Status:** 201 Created
- **Body:** The newly created student object.
- **Error Responses:**
  - 400 Bad Request: If the request body is missing required fields or contains invalid data.
  - 401 Unauthorized: If authentication is required but missing or invalid.
  - 403 Forbidden: If the user does not have permission to create a student.
  - 404 Not Found: If the specified classroom does not exist.

#### Example

```json
POST /api/student/create
{
    "name": "John Doe",
    "age": 15,
    "classroomID": "1234567890"
}
```
### Update Student

#### Endpoint

- **URL:** `/student/update/:id`
- **Method:** PUT
- **Authentication Required:** Yes

#### Request Body

- **name** (string, optional): The name of the student.
- **age** (number, optional): The age of the student.
- **classroomID** (string, optional): The ID of the classroom the student belongs to.

#### Response

- **Status:** 200 OK
- **Body:** The updated student object.
- **Error Responses:**
  - 400 Bad Request: If the request body is missing required fields or contains invalid data.
  - 401 Unauthorized: If authentication is required but missing or invalid.
  - 403 Forbidden: If the user does not have permission to update the student.
  - 404 Not Found:  If the specified student does not exist.

#### Example

```json
PUT /api/student/update/609be8f5c3f6826c398a304f
{
    "age": 16
}

```

### Delete Student

#### Endpoint

- **URL:** `/student/delete/:id`
- **Method:** DELETE
- **Authentication Required:** Yes

#### Request Parameters
id (string, required): The ID of the student to delete.

#### Response

- **Status:** 200 OK
- **Body:** The updated student object.
- **Error Responses:**
  - 400 Bad Request: If the request body is missing required fields or contains invalid data.
  - 401 Unauthorized: If authentication is required but missing or invalid.
  - 403 Forbidden: If the user does not have permission to update the student.
  - 404 Not Found:  If the specified student does not exist.

#### Example

```json
DELETE /api/student/update/609be8f5c3f6826c398a304f

```

### Get Student by ID

## Endpoint

- **URL:** `/student/getByID/:id`
- **Method:** GET
- **Authentication Required:** Yes

## Request Parameters

- **id** (string, required): The ID of the student to retrieve.

## Response

- **Status:** 200 OK
- **Body:** The student object.

## Error Responses

- **401 Unauthorized:** If authentication is required but missing or invalid.
- **403 Forbidden:** If the user does not have permission to retrieve the student.
- **404 Not Found:** If the specified student does not exist.


# Get All Students

## Description

This endpoint retrieves all students, optionally filtered by classroom ID.

## Endpoint

- **URL:** `/student/getAll`
- **Method:** GET
- **Authentication Required:** Yes

## Request Parameters

- **classroomID** (string, optional): The ID of the classroom to filter students. If not provided, returns all students.

## Response

- **Status:** 200 OK
- **Body:** An array of student objects.

## Error Responses

- **401 Unauthorized:** If authentication is required but missing or invalid.
- **403 Forbidden:** If the user does not have permission to retrieve students.


--------------------
## User Entity

## Access Control

To perform any CRUD operation on a classroom, the user must have one of the following roles:

- **Super Admin**: Full access to all classrooms.
- **Admin**: Access limited to classrooms in the same school.

## Endpoints

### Get All Classrooms

#### Endpoint

- **URL:** `/classroom/getAll`
- **Method:** GET
- **Authentication Required:** Yes

#### Response

- **Status:** 200 OK
- **Body:** An array of classroom objects.

#### Error Responses

- **401 Unauthorized:** If authentication is required but missing or invalid.
- **403 Forbidden:** If the user does not have permission to retrieve classrooms.

### Get Classroom by ID

#### Endpoint

- **URL:** `/classroom/getByID/:id`
- **Method:** GET
- **Authentication Required:** Yes

#### Request Parameters

- **id** (string, required): The ID of the classroom to retrieve.

#### Response

- **Status:** 200 OK
- **Body:** The classroom object.

#### Error Responses

- **401 Unauthorized:** If authentication is required but missing or invalid.
- **403 Forbidden:** If the user does not have permission to retrieve the classroom.
- **404 Not Found:** If the specified classroom does not exist.


### Create Classroom

#### Endpoint

- **URL:** `/classroom/create`
- **Method:** POST
- **Authentication Required:** Yes

#### Request Body

- **name** (string, required): The name of the classroom.
- **schoolID** (string, required): The ID of the school the classroom belongs to.

```json
POST /api/classroom/create
{
    "name": "Test Classroom",
    "schoolID": "65f5d3f59a5ae2a9745f513f"
}
```

### Update Classroom

#### Endpoint

- **URL:** `/classroom/update/:id`
- **Method:** PUT
- **Authentication Required:** Yes

#### Request Parameters
id (string, required): The ID of the classroom to update.

#### Request Body

- **name** (string, required): The name of the classroom.



```json
POST /api/classroom/update/65f5e591356cbd0fc267c56c
{
    "name": "Test Classroom 1",
}
```

### Delete Classroom

#### Endpoint

- **URL:** `/classrooms/delete/:id`
- **Method:** DELETE
- **Authentication Required:** Yes

#### Request Parameters
id (string, required): The ID of the classroom to delete.







## School Entity



## Access Control

To perform any CRUD operation on a school, the user must have one of the following roles:

- **Super Admin**: Full access to all schools.

## Endpoints

### Get All Classrooms

#### Endpoint

- **URL:** `/school/getAll`
- **Method:** GET
- **Authentication Required:** Yes

#### Response

- **Status:** 200 OK
- **Body:** An array of classroom objects.

#### Error Responses

- **401 Unauthorized:** If authentication is required but missing or invalid.
- **403 Forbidden:** If the user does not have permission to retrieve schools.

### Get Classroom by ID

#### Endpoint

- **URL:** `/school/getByID/:id`
- **Method:** GET
- **Authentication Required:** Yes

#### Request Parameters

- **id** (string, required): The ID of the school to retrieve.

#### Response

- **Status:** 200 OK
- **Body:** The school object.

#### Error Responses

- **401 Unauthorized:** If authentication is required but missing or invalid.
- **403 Forbidden:** If the user does not have permission to retrieve the school.
- **404 Not Found:** If the specified School does not exist.

### Create School

#### Endpoint

- **URL:** `/school/create`
- **Method:** POST
- **Authentication Required:** Yes

#### Request Body

- **name** (string, required): The name of the school.
- **address** (string, required): The address of the school.


```json
POST /api/school/create
{
    "name": "Test School",
}
```

### Update School

#### Endpoint

- **URL:** `/school/update/:id`
- **Method:** PUT
- **Authentication Required:** Yes

#### Request Parameters
id (string, required): The ID of the school to update.

#### Request Body

- **name** (string, required): The name of the school.
- **address** (string, required): The address of the school.

```json
POST /api/school/update/65f5d3f59a5ae2a9745f513f
{
    "name": "Test School",
}
```

### Delete Classroom

#### Endpoint

- **URL:** `/school/delete/:id`
- **Method:** DELETE
- **Authentication Required:** Yes

#### Request Parameters
id (string, required): The ID of the school to delete.


