# COLORS — LAMP lab application

COLORS is a small web application from the COP4331 COLORS lab. An existing
user can log in, save color names, search their saved colors by partial name,
and log out. This repository organizes the supplied lab implementation for
the version-control assignment.

## Technologies

- Linux, Apache, MySQL, and PHP (LAMP)
- PHP MySQLi with mysqlnd for prepared queries and `get_result()`
- HTML, CSS, and browser JavaScript with XMLHttpRequest and JSON
- Google Fonts (Ubuntu); the supplied MD5 helper is included but unused

## Repository layout

```text
api/                  PHP login, add, and search endpoints; database helper
public/
  index.html          Login page
  color.html          Color management page
  css/                Styles
  js/                 Browser logic and supplied MD5 helper
  images/             Lab background image
database/schema.sql   Empty Users and Colors tables
README.md             Setup and project notes
LICENSE.md            MIT license
.gitignore            Excludes secrets, local settings, and generated files
```

## Setup

1. Install PHP with MySQLi/mysqlnd, MySQL, and (for LAMP deployment) Apache
   with PHP support on Linux/Ubuntu. Use a supported PHP 8.x installation. A PHP development
   server can be used for local testing without Apache.
2. Clone the repository and enter it:

   ```sh
   git clone https://github.com/Martaino/colors-lamp.git
   cd colors-lamp
   ```

3. As a MySQL administrator, create an empty database named `COP4331` and a
   local application database user. Grant that user SELECT on `Users` and
   SELECT/INSERT on `Colors`. Choose credentials locally; do not commit them.
   Import the schema using an account allowed to create tables:

   ```sh
   mysql -u root -p -e 'CREATE DATABASE COP4331;'
   mysql -u root -p COP4331 < database/schema.sql
   ```

   Adjust the administrator account to your installation. For an existing
   lab database, keep its data and verify the table definitions instead of
   importing this schema over it.

4. The app has no registration screen. Use your database administration tool
   to insert a local test row in `Users`, setting `FirstName`, `LastName`,
   `Login`, and `Password`; `ID` is generated automatically. The supplied lab
   login compares the password directly, so use only a disposable test password.
   No sample accounts or passwords are included in this repository.
5. Configure these variables in the environment of the PHP process:

   | Variable | Meaning |
   | --- | --- |
   | `DB_HOST` | Database host, e.g. `127.0.0.1` |
   | `DB_NAME` | Database name, e.g. `COP4331` |
   | `DB_USER` | Your local application database user |
   | `DB_PASSWORD` | That user's locally chosen password |

   For a local run, start **Bash** and enter the following from the repository
   root. The password prompt keeps the value out of shell history:

   ```bash
   export DB_HOST=127.0.0.1
   export DB_NAME=COP4331
   read -r -p 'Database user: ' DB_USER
   export DB_USER
   read -r -s -p 'Database password: ' DB_PASSWORD
   echo
   export DB_PASSWORD
   php -S 127.0.0.1:8000 -t .
   ```

   The application reads environment variables directly; it does not load
   `.env` files automatically.

## Run and access

With the local server running, open **http://127.0.0.1:8000/public/index.html**.
Log in using the test account, add a color, then search for part of its name.
An empty search matches all colors for that user. Log Out returns to login.
Stop the development server with Ctrl+C.

For Apache, serve `public/` as the document root and map `/api/` to this
repository's `api/` directory with PHP execution enabled. Pass the database
variables to the PHP worker through your local server configuration. Keep
that configuration outside Git. The browser uses `../api`, so the pages and
API must share an origin and the matching sibling paths. Do not expose the
repository root, `.git`, or database files on a public Apache server. The
root-based PHP development command above is for loopback-only local use.
GitHub hosts the source code; GitHub Pages cannot execute this PHP backend.

## API overview

All endpoints accept JSON via POST and return JSON:

| Endpoint | Request fields | Purpose |
| --- | --- | --- |
| `api/Login.php` | `login`, `password` | Return user ID and name for matching credentials |
| `api/AddColor.php` | `color`, `userId` | Save a color for the supplied user ID |
| `api/SearchColors.php` | `search`, `userId` | Find that user's matching color names |

## Assumptions and limitations

- This preserves the lab's basic behavior, not a production authentication
  system. Passwords are compared as plaintext; the browser cookie and request
  user IDs are trusted by the backend. There is no server-side session or
  authorization enforcement. Use isolated local test data only.
- Registration, editing, deleting, and password reset are not implemented.
- Input validation and error handling are minimal. The lab endpoints assemble
  JSON manually, so quotes or backslashes in names may produce invalid responses.
  Search results are rendered as HTML; untrusted input is not safe.
- The UI assumes successful API responses; failed additions may still show a
  success message, and searches with no matches may cause a JavaScript error.
- Names and passwords are limited to 50 characters by the lab schema. Cookies
  use the original simple comma-separated format and a 20-minute expiry.
- The Google Fonts stylesheet requires internet access; fallback fonts still work.
- Database data, original lab instructions, machine metadata, credentials, and
  deployment-specific settings are intentionally excluded.

## Version-control stages and AI usage

ChatGPT assisted in organizing the provided lab files, replacing embedded
connection settings with environment variables, adapting the API URL, adding
an empty schema, minor cleanup, and documentation. The README.md was organized
and mostly generated by ChatGPT.
All of the application originated from the supplied COLORS lab materials.

## Validation

JavaScript syntax and local asset references were checked during repository
preparation, along with whitespace and scans for the original embedded database
credentials. PHP and MySQL were unavailable in the preparation environment,
so PHP linting and an end-to-end database/browser run remain to be performed.
After setup, verify login, adding a color, searching, and logout manually.

## License and attribution

See [LICENSE.md](LICENSE.md) for the MIT license for this repository's original
contributions. Supplied course materials remain attributable to their original
authors and subject to any applicable course terms. The bundled
`public/js/md5.js` retains its original third-party copyright and license notices.
