# 05. API


## 1. Общие правила API

### 1.1. Базовый префикс

Общий префикс: ```/api/v1```

### 1.2. Формат данных

Формат JSON.
Заголовки запроса: 
```http
Content-Type: application/json
Accept: application/json
```

### 1.3. Подход к именованию маршрутов

- использовать существительные;
- не использовать глаголы в URL;
- использовать HTTP-метод для определения действия.

Примеры:
- `GET /movies`
- `POST /bookings`
- `PATCH /sessions/{id}`

### 1.4. Аутентификация

Для административных endpoints - JWT-аутентификация.

Заголовок:
```http
Authorization: Bearer <access_token>
```

Публичные endpoints доступны без авторизации.  


## 2. Общая структура API

API делится на следующие группы:
- auth;
- public;
- admin;
- bookings.


## 3. Формат успешного ответа

### 3.1. Успешный ответ с данными
```json
{
  "data": {}
}
```

### 3.2. Успешный ответ со списком
```json
{
  "data": []
}
```

### 3.3. Успешное создание ресурса
```json
{
  "data": {
    "id": 1
  },
  "message": "Resource created"
}
```


## 4. Формат ответа с ошибкой

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "field": [
        "Error message"
      ]
    }
  }
}
```


## 5. Основные коды ответа

`200 OK` - успешное получение или изменение данных 
`201 Created` - успешное создание ресурса
`204 No Content` - успешное удаление без тела ответа
`400 Bad Request` - ошибка валидации или некорректный запрос
`401 Unauthorized` - пользователь не аутентифицирован
`403 Forbidden` - у пользователя нет прав доступа
`404 Not Found` - ресурс не найден
`409 Conflict` - конфликт состояния, например место уже занято
`500 Internal Server Error` - внутренняя ошибка сервера


## 6. Auth API

### 6.1. Вход администратора

**POST** `/api/v1/auth/login`

#### Назначение
Аутентификация администратора и получение JWT-токенов.

#### Request
```json
{
  "email": "admin@example.com",
  "password": "secret"
}
```

#### Response `200 OK`
```json
{
  "data": {
    "access": "jwt-access-token",
    "refresh": "jwt-refresh-token",
    "user": {
      "id": 1,
      "email": "admin@example.com",
      "role": "ADMIN"
    }
  }
}
```

#### Возможные ошибки
- `400 Bad Request`
- `401 Unauthorized`

### 6.2. Обновление access token

**POST** `/api/v1/auth/refresh`

#### Request
```json
{
  "refresh": "jwt-refresh-token"
}
```

#### Response `200 OK`
```json
{
  "data": {
    "access": "new-jwt-access-token"
  }
}
```

#### Возможные ошибки
- `400 Bad Request`
- `401 Unauthorized`

### 6.3. Получение текущего пользователя

**GET** `/api/v1/auth/me`

#### Назначение
Получение данных текущего аутентифицированного администратора.

#### Response `200 OK`
```json
{
  "data": {
    "id": 1,
    "email": "admin@example.com",
    "role": "ADMIN"
  }
}
```

#### Возможные ошибки
- `401 Unauthorized`

## 7. Public API

### 7.1. Получение списка фильмов

**GET** `/api/v1/movies`

#### Назначение
Возвращает список активных фильмов, доступных для отображения гостю.

#### Query params
- `search` — поиск по названию
- `is_active` — фильтр по активности, опционально для админских сценариев

#### Response `200 OK`
```json
{
  "data": [
    {
      "id": 1,
      "title": "Интерстеллар",
      "duration_min": 169,
      "age_rating": "12+",
      "poster_url": "/media/posters/interstellar.jpg"
    }
  ]
}
```

### 7.2. Получение карточки фильма

**GET** `/api/v1/movies/{movieId}`

#### Response `200 OK`
```json
{
  "data": {
    "id": 1,
    "title": "Интерстеллар",
    "description": "Описание фильма",
    "duration_min": 169,
    "age_rating": "12+",
    "poster_url": "/media/posters/interstellar.jpg",
    "country": "USA",
    "release_date": "2014-11-06"
  }
}
```

#### Возможные ошибки
- `404 Not Found`

### 7.3. Получение списка сеансов

**GET** `/api/v1/sessions`

#### Назначение
Возвращает опубликованные сеансы, доступные для бронирования.

#### Query params
- `movie_id`
- `date`
- `hall_id`

#### Response `200 OK`
```json
{
  "data": [
    {
      "id": 10,
      "movie_id": 1,
      "hall_id": 2,
      "start_at": "2026-06-20T18:00:00Z",
      "end_at": "2026-06-20T20:49:00Z",
      "base_price": 400,
      "vip_price": 700,
      "status": "PUBLISHED"
    }
  ]
}
```

### 7.4. Получение информации о сеансе

**GET** `/api/v1/sessions/{sessionId}`

#### Response `200 OK`
```json
{
  "data": {
    "id": 10,
    "movie": {
      "id": 1,
      "title": "Интерстеллар"
    },
    "hall": {
      "id": 2,
      "name": "Зал 1"
    },
    "start_at": "2026-06-20T18:00:00Z",
    "end_at": "2026-06-20T20:49:00Z",
    "base_price": 400,
    "vip_price": 700,
    "status": "PUBLISHED"
  }
}
```

#### Возможные ошибки
- `404 Not Found`

### 7.5. Получение схемы зала для сеанса

**GET** `/api/v1/sessions/{sessionId}/seats`

#### Назначение
Возвращает список мест, их типы и статус доступности для выбранного сеанса.

#### Response `200 OK`
```json
{
  "data": {
    "hall": {
      "id": 2,
      "name": "Зал 1",
      "rows_count": 5,
      "seats_per_row": 10
    },
    "seats": [
      {
        "id": 101,
        "row_number": 1,
        "seat_number": 1,
        "seat_type": "VIP",
        "is_available": true,
        "price": 700
      },
      {
        "id": 102,
        "row_number": 1,
        "seat_number": 2,
        "seat_type": "VIP",
        "is_available": false,
        "price": 700
      }
    ]
  }
}
```

#### Возможные ошибки
- `404 Not Found`
- `409 Conflict`

## 8. Booking API

### 8.1. Создание бронирования

**POST** `/api/v1/bookings`

#### Назначение
Создает бронь на выбранное место для конкретного сеанса.

#### Request
```json
{
  "session_id": 10,
  "seat_id": 101,
  "guest_name": "Иван Иванов",
  "guest_email": "ivan@example.com",
  "guest_phone": "+79990000000"
}
```

#### Response `201 Created`
```json
{
  "data": {
    "id": 501,
    "booking_code": "BK-20260620-0001",
    "status": "RESERVED",
    "session_id": 10,
    "seat_id": 101,
    "ticket_id": 9001
  }
}
```

#### Возможные ошибки
- `400 Bad Request`
- `404 Not Found`
- `409 Conflict`

`409 Conflict` - если место занято или недоступно для брони.

### 8.2. Получение информации о бронировании

**GET** `/api/v1/bookings/{bookingId}`

#### Назначение
Возвращает информацию о брони и связанном билете.

#### Response `200 OK`
```json
{
  "data": {
    "id": 501,
    "booking_code": "BK-20260620-0001",
    "status": "RESERVED",
    "guest_name": "Иван Иванов",
    "session": {
      "id": 10,
      "start_at": "2026-06-20T18:00:00Z"
    },
    "seat": {
      "id": 101,
      "row_number": 1,
      "seat_number": 1
    },
    "ticket": {
      "id": 9001,
      "qr_image": "/media/qr/9001.png"
    }
  }
}
```

#### Возможные ошибки
- `404 Not Found`

### 8.3. Получение билета

**GET** `/api/v1/tickets/{ticketId}`

#### Назначение
Возвращает информацию о билете и QR-коде.

#### Response `200 OK`
```json
{
  "data": {
    "id": 9001,
    "booking_id": 501,
    "qr_payload": "BK-20260620-0001",
    "qr_image": "/media/qr/9001.png",
    "issued_at": "2026-06-18T10:30:00Z"
  }
}
```

#### Возможные ошибки
- `404 Not Found`

## 9. Admin API: фильмы

### 9.1. Получение списка фильмов

**GET** `/api/v1/admin/movies`

#### Назначение
Возвращает список фильмов для административной панели.

#### Возможные ошибки
- `401 Unauthorized`
- `403 Forbidden`

### 9.2. Создание фильма

**POST** `/api/v1/admin/movies`

#### Request
```json
{
  "title": "Интерстеллар",
  "description": "Описание фильма",
  "duration_min": 169,
  "age_rating": "12+",
  "poster_url": "/media/posters/interstellar.jpg",
  "country": "USA",
  "release_date": "2014-11-06",
  "is_active": true
}
```

#### Response `201 Created`
```json
{
  "data": {
    "id": 1
  }
}
```

### 9.3. Обновление фильма

**PATCH** `/api/v1/admin/movies/{movieId}`

#### Response
- `200 OK`
- `400 Bad Request`
- `401 Unauthorized`
- `403 Forbidden`
- `404 Not Found`

### 9.4. Удаление фильма

**DELETE** `/api/v1/admin/movies/{movieId}`

#### Response
- `204 No Content`
- `401 Unauthorized`
- `403 Forbidden`
- `404 Not Found`

## 10. Admin API: залы

### 10.1. Получение списка залов

**GET** `/api/v1/admin/halls`

### 10.2. Создание зала

**POST** `/api/v1/admin/halls`

#### Request
```json
{
  "name": "Зал 1",
  "rows_count": 5,
  "seats_per_row": 10,
  "is_active": false
}
```

#### Response `201 Created`
```json
{
  "data": {
    "id": 2
  }
}
```

### 10.3. Обновление зала

**PATCH** `/api/v1/admin/halls/{hallId}`

### 10.4. Переключение активности зала

**PATCH** `/api/v1/admin/halls/{hallId}/toggle-active`

#### Назначение
Открывает или приостанавливает продажу билетов для зала.

#### Response `200 OK`
```json
{
  "data": {
    "id": 2,
    "is_active": true
  }
}
```

### 10.5. Получение мест зала

**GET** `/api/v1/admin/halls/{hallId}/seats`

### 10.6. Обновление схемы мест

**PUT** `/api/v1/admin/halls/{hallId}/seats`

#### Request
```json
{
  "seats": [
    { "row_number": 1, "seat_number": 1, "seat_type": "VIP" },
    { "row_number": 1, "seat_number": 2, "seat_type": "VIP" },
    { "row_number": 2, "seat_number": 1, "seat_type": "STANDARD" }
  ]
}
```

## 11. Admin API: сеансы

### 11.1. Получение списка сеансов

**GET** `/api/v1/admin/sessions`

### 11.2. Создание сеанса

**POST** `/api/v1/admin/sessions`

#### Request
```json
{
  "movie_id": 1,
  "hall_id": 2,
  "start_at": "2026-06-20T18:00:00Z",
  "end_at": "2026-06-20T20:49:00Z",
  "base_price": 400,
  "vip_price": 700,
  "status": "PUBLISHED"
}
```

#### Возможные ошибки
- `400 Bad Request`
- `409 Conflict`

### 11.3. Обновление сеанса

**PATCH** `/api/v1/admin/sessions/{sessionId}`

### 11.4. Удаление сеанса

**DELETE** `/api/v1/admin/sessions/{sessionId}`

## 12. Admin API: бронирования

### 12.1. Получение списка броней

**GET** `/api/v1/admin/bookings`

#### Query params
- `session_id`
- `movie_id`
- `hall_id`
- `date`
- `status`

### 12.2. Получение одной брони

**GET** `/api/v1/admin/bookings/{bookingId}`

### 12.3. Отмена брони

**PATCH** `/api/v1/admin/bookings/{bookingId}/cancel`

#### Response `200 OK`
```json
{
  "data": {
    "id": 501,
    "status": "CANCELED"
  }
}
```

## 13. Основные сценарии ошибок

### 13.1. Ошибка валидации
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "seat_id": [
        "This field is required."
      ]
    }
  }
}
```

### 13.2. Ресурс не найден
```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Resource not found"
  }
}
```

### 13.3. Недостаточно прав
```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "You do not have permission to perform this action"
  }
}
```

### 13.4. Конфликт бронирования
```json
{
  "error": {
    "code": "BOOKING_CONFLICT",
    "message": "Seat is already booked for this session"
  }
}
```

