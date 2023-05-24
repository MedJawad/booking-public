// user.test.js
import { getUserById } from "./controllers/user-controller.js";
import User from "./models/User.mjs";

// Mock the User model and findById function
jest.mock("./models/User");

test("should get user by ID", async () => {
  const validUserId = "645e78c43b119de82549200a";
  const expectedUser = {
    _id: validUserId,
    name: "user",
    email: "user@gmail.com",
  };

  // Mock the findById function to return the expected user
  jest.spyOn(User, "findById").mockResolvedValue(expectedUser);

  const req = { params: { id: validUserId } };
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };

  await getUserById(req, res);

  expect(User.findById).toHaveBeenCalledWith(validUserId);
  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith({ user: expectedUser });
});
