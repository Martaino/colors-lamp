# COLORS UML diagrams

These diagrams model the COLORS lab application in this repository. Each
diagram includes editable PlantUML source, a PNG image, and an SVG image that
can be enlarged without losing clarity.

| Required diagram | Source | PNG | SVG |
| --- | --- | --- | --- |
| Use Case | [usecase.puml](usecase.puml) | [usecase.png](usecase.png) | [usecase.svg](usecase.svg) |
| Activity | [activity.puml](activity.puml) | [activity.png](activity.png) | [activity.svg](activity.svg) |
| Class | [class.puml](class.puml) | [class.png](class.png) | [class.svg](class.svg) |

## Use Case Diagram

The existing user can log in, add a color, search saved colors, and log out.
Login is a precondition for using the color management screen. It is not an
`include` relationship: the user does not repeat login for every add or search.
Account creation, editing, and deletion are outside the implemented scope.
The actor represents a person with an existing account, both before and after
login. The system boundary includes the browser code, PHP API, and database;
the database is therefore internal, rather than an external actor. The lines
connect users to their goals and do not specify execution order.

![COLORS use case diagram](usecase.png)

## Activity Diagram

The swimlanes distinguish user actions, browser logic, and PHP/MySQL processing.
The flow covers unsuccessful login and retry, cookie storage and the page-load
cookie check, repeated add/search actions, and logout. The search no-match branch
shows the current callback failure because the API does not return `results`.
The add branch records that the UI displays success on HTTP 200 without checking
the JSON error. Database operations otherwise show the normal completion path;
configuration, connection, and network failures are summarized in the legend.
The login decisions belong to the browser lane because JavaScript evaluates
the returned ID. Login retries are a chosen scenario, not automatic form
resubmission. The diagram shows one request at a time; actual XMLHttpRequests
are asynchronous, and the UI does not prevent overlapping requests.

On a no-match search, the callback throws before replacing the displayed list;
any previous results remain visible. That error ends the callback, not the
page, so a user can search again, add a color, or log out. The surrounding
`try/catch` does not catch an exception raised later in an asynchronous
callback. The activity's final node ends the depicted interaction only.

![COLORS activity diagram](activity.png)

## Class Diagram

This is a logical class model of a procedural application. `User` and `Color`
represent the `Users` and `Colors` tables. The browser and PHP scripts are shown
as stereotyped modules/scripts grouping their actual functions; the code does
not declare these as object-oriented classes. Endpoint processing occurs at the
top level of each PHP file. Dashed dependencies show API calls, shared database
access, and database operations.

One user logically owns zero or more colors, and each color logically belongs
to one user. This describes the application domain: the supplied schema has no
foreign key, and the PHP endpoints trust the request's `userId`. The model does
not imply database-enforced ownership or a server-side authentication session.
Entity attribute lengths come from `database/schema.sql`.
For example, a database row with `UserID = 0` can exist despite the logical
`1` multiplicity at the User end. All columns are `NOT NULL`; string columns
default to the empty string, and `Colors.UserID` defaults to `0`. `PK` means
primary key, and `0..*` means zero or more. The association is not composition:
the implementation defines no cascading deletion or shared object lifetime.

`AssociativeArray` describes the PHP array produced by
`json_decode(..., true)` for a valid JSON object request. Invalid JSON handling
is outside the modeled normal path. `sendResultInfoAsJson()` receives an
already serialized JSON string and writes it to the response; it does not
return that string. PHP helper functions are global within each request, not
class methods or file-private functions. Each endpoint runs in a separate
request, so its same-named helpers do not indicate inheritance or shared methods.

![COLORS class diagram](class.png)

## Implementation details that affect interpretation

- A successful login compares the supplied password directly with `Users.Password`.
  The included MD5 helper is unused; no hashing or server session is implied.
- `saveCookie()` writes one cookie named `firstName` whose comma-separated value
  also contains `lastName` and `userId`, with a 20-minute expiry. `readCookie()`
  runs when `color.html` loads. It only redirects when the parsed ID is negative;
  it does not validate the account, and values such as `0` or `NaN` can pass.
  Expiry does not automatically log out an already open page.
- Search binds `"%" . search . "%"` and the supplied user ID to a prepared
  statement. An empty search matches all of that user's colors; `%` and `_`
  in input retain SQL `LIKE` wildcard meanings. Case matching depends on the
  database collation, which the supplied schema does not specify.
- An HTTP 200 response is not proof that a color was saved. The UI ignores the
  error field, and the add endpoint does not check `execute()`'s return value.
  Database error paths and malformed input are not fully modeled.

## Traceability to the application

| Model element | Implementation |
| --- | --- |
| Login form and color management controls | [index.html](../../public/index.html), [color.html](../../public/color.html) |
| Login, cookies, add/search requests, logout | [code.js](../../public/js/code.js) |
| Credential lookup | [Login.php](../../api/Login.php) |
| Add a color for a supplied user ID | [AddColor.php](../../api/AddColor.php) |
| Search by name pattern and user ID | [SearchColors.php](../../api/SearchColors.php) |
| Shared environment-based database connection | [database.php](../../api/database.php) |
| User and Color attributes | [schema.sql](../../database/schema.sql) |

## Regenerating the images

With Java, PlantUML, and Graphviz installed, run from the repository root:

```sh
java -jar /path/to/plantuml.jar -charset UTF-8 -tpng "docs/uml/*.puml"
java -jar /path/to/plantuml.jar -charset UTF-8 -tsvg "docs/uml/*.puml"
```

Alternatively, render each source through the
[PlantUML server](https://plantuml.com/server). The checked-in images were
generated through that service and visually reviewed against the sources.
PlantUML documentation describes the [command-line rendering options](https://plantuml.com/command-line).

## Review and validation

The UML sources were reviewed against the HTML, JavaScript, PHP, and SQL files.
All images were regenerated after corrections, checked for valid PNG/SVG
structure, and visually reviewed. Documentation links and Git whitespace checks
were also checked. A Node.js harness with a mocked DOM and asynchronous HTTP
responses verified login success/failure, add responses containing errors,
search matches/no matches, cookie checks, and logout. This is not a live
PHP/MySQL integration test. Application source files were unchanged by this
UML review.

## Assignment reference materials

- [Introduction to UML slides](https://ppawar.github.io/Spring2019/CSE308-S19/Slides/PDF/Introduction%20to%20UML.pdf)
- [Pfleeger–Atlee Chapter 6 slides](https://www.cs.ucf.edu/~turgut/COURSES/Pfleeger-Atlee4EClassMaterials/PA-chapter06-Revised.ppt)

The second slide deck could not be retrieved during preparation. The diagrams
are grounded in the application files linked above. OpenAI Codex assisted with
creating the UML sources, documentation, rendered images, and Git operations.
