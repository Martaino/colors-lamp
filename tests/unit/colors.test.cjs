const { readFileSync } = require("node:fs");
const { resolve } = require("node:path");
const { JSDOM } = require("jsdom");

const root = resolve(__dirname, "../..");
const source = readFileSync(resolve(root, "public/js/code.js"), "utf8");
let dom;
let request;

beforeEach(() => {
  // Load the real page and browser script without loading remote fonts or scripts.
  dom = new JSDOM(readFileSync(resolve(root, "public/color.html"), "utf8"), {
    url: "http://localhost/public/color.html",
    runScripts: "outside-only",
  });
  request = {
    open: jest.fn(),
    setRequestHeader: jest.fn(),
    send: jest.fn(),
  };
  dom.window.XMLHttpRequest = jest.fn(() => request);
  dom.window.eval(source);
  dom.window.document.cookie = "firstName=Test,lastName=User,userId=1";
  dom.window.readCookie();
});

afterEach(() => dom.window.close());

function respond(body) {
  request.readyState = 4;
  request.status = 200;
  request.responseText = JSON.stringify(body);
  request.onreadystatechange();
}

test("addColor sends the entered color and current user to the PHP endpoint", () => {
  dom.window.document.getElementById("colorText").value = "Ocean Blue";
  dom.window.addColor();

  expect(request.open).toHaveBeenCalledWith("POST", "../api/AddColor.php", true);
  expect(request.setRequestHeader).toHaveBeenCalledWith(
    "Content-type", "application/json; charset=UTF-8"
  );
  expect(JSON.parse(request.send.mock.calls[0][0])).toEqual({
    color: "Ocean Blue", userId: 1,
  });
  expect(dom.window.document.getElementById("colorAddResult").textContent).toBe("");
  respond({ error: "" });
  expect(dom.window.document.getElementById("colorAddResult").textContent)
    .toBe("Color has been added");
});

test("searchColor sends the search term and renders each matching color", () => {
  dom.window.document.getElementById("searchText").value = "Blue";
  dom.window.searchColor();

  expect(request.open).toHaveBeenCalledWith("POST", "../api/SearchColors.php", true);
  expect(JSON.parse(request.send.mock.calls[0][0])).toEqual({ search: "Blue", userId: 1 });
  respond({ results: ["Ocean Blue", "Sky Blue"], error: "" });

  const list = dom.window.document.getElementById("colorList");
  expect(list.textContent).toContain("Ocean Blue");
  expect(list.textContent).toContain("Sky Blue");
  expect(list.querySelectorAll("br")).toHaveLength(1);
});

test("addColor displays a transport error when sending the request fails", () => {
  request.send.mockImplementation(() => { throw new Error("Network unavailable"); });
  dom.window.addColor();
  expect(dom.window.document.getElementById("colorAddResult").textContent)
    .toBe("Network unavailable");
});

test("doLogin displays the invalid-credentials message returned by the API", () => {
  dom.window.document.body.innerHTML = readFileSync(resolve(root, "public/index.html"), "utf8");
  dom.window.document.getElementById("loginName").value = "unknown";
  dom.window.document.getElementById("loginPassword").value = "wrong";
  dom.window.doLogin();

  expect(request.open).toHaveBeenCalledWith("POST", "../api/Login.php", true);
  expect(JSON.parse(request.send.mock.calls[0][0])).toEqual({ login: "unknown", password: "wrong" });
  respond({ id: 0, firstName: "", lastName: "", error: "No Records Found" });
  expect(dom.window.document.getElementById("loginResult").textContent)
    .toBe("User/Password combination incorrect");
});
