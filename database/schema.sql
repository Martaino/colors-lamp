-- Import into an empty database selected by your MySQL client.
-- No accounts, passwords, or existing user data are included.
CREATE TABLE Users (
    ID INT NOT NULL AUTO_INCREMENT,
    FirstName VARCHAR(50) NOT NULL DEFAULT '',
    LastName VARCHAR(50) NOT NULL DEFAULT '',
    Login VARCHAR(50) NOT NULL DEFAULT '',
    Password VARCHAR(50) NOT NULL DEFAULT '',
    PRIMARY KEY (ID)
) ENGINE=InnoDB;

CREATE TABLE Colors (
    ID INT NOT NULL AUTO_INCREMENT,
    Name VARCHAR(50) NOT NULL DEFAULT '',
    UserID INT NOT NULL DEFAULT 0,
    PRIMARY KEY (ID)
) ENGINE=InnoDB;
