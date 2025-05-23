const { User, Movie, Genre, WatchHistory } = require("../models");

/**
 * Retrieves user interaction statistics for the admin.
 * @param {*} req http request.
 * @param {*} res http response.
 */
exports.getDashboardStats = async (req, res) => {
  try {
    const allUsers = await User.count();
    const allMovies = await Movie.count();
    const allGenres = await Genre.count();
    const moviesWatched = await WatchHistory.count();
    res.status(200).json({
      allUsers,
      allMovies,
      allGenres,
      moviesWatched,
    });
    console.log("Dashboard Stats:", {
      allUsers,
      allMovies,
      allGenres,
      moviesWatched,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

/**
 * Retrieves all user accounts.
 * @param {*} req http request.
 * @param {*} res http response.
 */
exports.getUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ["id", "email", "password", "username", "isAdmin"],
    });
    res.status(200).json(users);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

/**
 * Retrieves a single user by id.
 * @param {*} req http request.
 * @param {*} res http response.
 */
exports.getUserById = async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findByPk(userId, {
      attributes: ["id", "email", "username", "isAdmin"],
    });
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }
    res.status(200).json(user);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

/**
 * Updates a user's status to or from the administrator role.
 * @param {*} req http request.
 * @param {*} res http response.
 */
exports.updateUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    const { isAdmin, username, email } = req.body;
    // Prevents a user with a standard role from promoting themselves to admin
    if (userId === req.user.id) {
      return res
        .status(403)
        .json({ error: "Action Requires Admin Privileges!" });
    }
    // Find a user via id
    const user = await User.findByPk(userId);
    // Throw an error if the user id does not exist
    if (!user) {
      return res.status(404).json({ error: "Could Not Find Requested User!" });
    }
    // Based on the status of the user the function is being called on, change their status to either admin or standard
    user.isAdmin = !!isAdmin;
    // Also update username and email if possible
    if (username) user.username = username;
    if (email) user.email = email;
    await user.save();
    res.status(200).json({
      message: `User ${
        isAdmin
          ? "rank updated to Administrator role"
          : "rank updated to Standard role"
      }`,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin,
      },
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

/**
 * Deletes a user's account by id.
 * @param {*} req http request.
 * @param {*} res http response.
 */
exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    // find a user via id
    const user = await User.findByPk(userId);
    await user.destroy();
    if (!user) {
      return res.status(404).json({ error: "Could Not Find Requested User!" });
    }
    await user.destroy();
    res.status(200).json({ message: "User Deleted!" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
