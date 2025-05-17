CREATE TABLE Users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL
);
CREATE TABLE Players (
    player_id INT PRIMARY KEY,
    given_name VARCHAR(100),
    family_name VARCHAR(100),
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    current_level INT,
    country VARCHAR(100),
    /* state, city, street, postcode */
    address VARCHAR(255),
    reward_points INT DEFAULT 0,
    introduction TEXT
);

CREATE TABLE ChatRooms (
    room_id INT PRIMARY KEY,
    room_name VARCHAR(100),
    introduction TEXT
);

CREATE TABLE ChatRoomMembers (
    room_id INT,
    player_id INT,
    PRIMARY KEY (room_id, player_id),
    FOREIGN KEY (room_id) REFERENCES ChatRooms(room_id),
    FOREIGN KEY (player_id) REFERENCES Players(player_id)
);

CREATE TABLE GameSessions (
    session_id INT PRIMARY KEY,
    game_mode VARCHAR(50),
    ai_level INT,
    status VARCHAR(50),
    timestamp DATETIME
);

CREATE TABLE GameSessionPlayers (
    session_id INT,
    player_id INT,
    PRIMARY KEY (session_id, player_id),
    FOREIGN KEY (session_id) REFERENCES GameSessions(session_id),
    FOREIGN KEY (player_id) REFERENCES Players(player_id)
);

CREATE TABLE Questions (
    question_id INT PRIMARY KEY,
    question_text TEXT,
    correct_answer TEXT,
    incorrect_answers JSON,
    category VARCHAR(100),
    difficulty VARCHAR(50),
    question_type VARCHAR(50)
);

CREATE TABLE SessionQuestions (
    session_id INT,
    question_id INT,
    player_answer TEXT,
    PRIMARY KEY (session_id, question_id),
    FOREIGN KEY (session_id) REFERENCES GameSessions(session_id),
    FOREIGN KEY (question_id) REFERENCES Questions(question_id)
);

CREATE TABLE Achievements (
    achievement_id INT PRIMARY KEY,
    title VARCHAR(100),
    requirement TEXT
);

CREATE TABLE PlayerAchievements (
    achievement_id INT,
    player_id INT,
    PRIMARY KEY (achievement_id, player_id),
    FOREIGN KEY (achievement_id) REFERENCES Achievements(achievement_id),
    FOREIGN KEY (player_id) REFERENCES Players(player_id)
);

CREATE TABLE PlayerStats (
    player_id INT PRIMARY KEY,
    total_score INT DEFAULT 0,
    player_rank VARCHAR(50),
    game_time INT,
    FOREIGN KEY (player_id) REFERENCES Players(player_id)
);
