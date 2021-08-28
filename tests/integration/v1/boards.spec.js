const supertest = require("supertest");
const { v4: uuid } = require("uuid");

const app = require("../../../server");
const database = require("../../../server/database");
const { hashPassword } = require("../../../server/helpers");
const { board: generateBoards } = require("../../utils/generators");
const { getUser } = require("../../utils/getUser");

beforeAll(async () => {
	return await database.migrate.latest();
});

afterAll(async () => {
	return await database.migrate.rollback();
});

// Get all boards
describe("GET /api/v1/boards", () => {
	it("should get 0 boards", async () => {
		const response = await supertest(app).get("/api/v1/boards");

		expect(response.headers["content-type"]).toContain("application/json");
		expect(response.status).toBe(200);
		expect(response.body.boards).toHaveLength(0);
	});

	// it("should get all boards", async () => {
	// 	// generate & add board
	// 	const board = generateBoards();
	// 	console.log(board);

	// 	await database.insert(board).into("boards");

	// 	const response = await supertest(app).get("/api/v1/boards");

	// 	expect(response.headers["content-type"]).toContain("application/json");
	// 	expect(response.status).toBe(200);

	// 	console.log(response.body);
	// 	const boards = response.body.boards;

	// 	delete boards[0].boardId;
	// 	expect(boards[0]).toStrictEqual(boards);
	// })
});

// Get boards by URL
describe("GET /boards/:url", () => {
	it('should throw error "BOARD_NOT_FOUND"', async () => {
		const response = await supertest(app).get("/api/v1/boards/do_not_exists");

		expect(response.headers["content-type"]).toContain("application/json");
		expect(response.status).toBe(404);
		expect(response.body.code).toEqual("BOARD_NOT_FOUND");
	});

	it("should get board by url", async () => {
		// generate & add board
		const board = generateBoards();
		board.url = "create-existing-board";

		await database.insert(board).into("boards");

		const response = await supertest(app).get(
			"/api/v1/boards/create-existing-board"
		);

		expect(response.headers["content-type"]).toContain("application/json");
		expect(response.status).toBe(200);
		expect(response.body.board).toStrictEqual(board);
	});
});

// Search board by name
describe.only("GET /boards/search/:name", () => {
	it('should throw error "INVALID_AUTH_HEADER"', async () => {
		const response = await supertest(app).get("/api/v1/boards/search/name");

		expect(response.headers["content-type"]).toContain("application/json");
		expect(response.status).toBe(400);
		expect(response.body.code).toEqual("INVALID_AUTH_HEADER");
	});

	it("should throw error not having 'board:read' permission", async () => {
		// seed users with no "board:read permission"
		await database
			.insert([
				{
					userId: uuid(),
					email: "no-permission@example.com",
					password: hashPassword("strongPassword"),
					username: "no-permission",
				},
			])
			.into("users");

		const user = await getUser({
			email: "no-permission@example.com",
			password: "strongPassword",
		});

		const response = await supertest(app)
			.get("/api/v1/boards/search/name")
			.set("Authorization", `Bearer ${user.body.user.authToken}`);

		expect(response.body.code).toEqual("ACCESS_DENIED");
	});
});

// Create new boards
describe("POST /api/v1/boards", () => {
	it('should throw error "INVALID_AUTH_HEADER"', async () => {
		const response = await supertest(app).post("/api/v1/boards");

		expect(response.headers["content-type"]).toContain("application/json");
		expect(response.status).toBe(400);
		expect(response.body.code).toEqual("INVALID_AUTH_HEADER");
	});
});