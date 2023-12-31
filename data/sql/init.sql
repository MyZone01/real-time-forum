-- Table for 'user'
CREATE TABLE IF NOT EXISTS "user" (
    id VARCHAR PRIMARY KEY,
    nickname VARCHAR UNIQUE,
    firstname VARCHAR,
    lastname VARCHAR,
    age INT,
    gender VARCHAR,
    email VARCHAR UNIQUE,
    password TEXT,
    avatarURL VARCHAR
);

-- Table for 'category'
CREATE TABLE IF NOT EXISTS "category" (
    id VARCHAR PRIMARY KEY,
    name VARCHAR UNIQUE,
    createDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table for 'post'
CREATE TABLE IF NOT EXISTS "post" (
    id VARCHAR PRIMARY KEY,
    title VARCHAR,
    slug VARCHAR UNIQUE,
    description TEXT,
    authorID VARCHAR,
    createDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (authorID) REFERENCES "user"(id)
);

-- Table for 'post_category'
CREATE TABLE IF NOT EXISTS "post_category" (
    id VARCHAR PRIMARY KEY,
    postID VARCHAR,
    categoryID VARCHAR,
    FOREIGN KEY (postID) REFERENCES "post"(id),
    FOREIGN KEY (categoryID) REFERENCES "category"(id)
);

-- Table for 'comment'
CREATE TABLE IF NOT EXISTS "comment" (
    id VARCHAR PRIMARY KEY,
    text TEXT,
    authorID VARCHAR,
    postID VARCHAR,
    createDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (authorID) REFERENCES "user"(id),
    FOREIGN KEY (postID) REFERENCES "post"(id)
);

-- Table for 'message'
CREATE TABLE IF NOT EXISTS "message" (
    id VARCHAR PRIMARY KEY,
    senderID VARCHAR,
    receiverID VARCHAR,
    content TEXT,
    createDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (senderID) REFERENCES "user"(id),
    FOREIGN KEY (receiverID) REFERENCES "user"(id)
);
