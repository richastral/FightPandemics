const httpErrors = require("http-errors");

/*
 * /api/posts
 */
async function routes(app) {
  const Post = app.mongo.model("Post");
  const Comment = app.mongo.model("Comment");

  // /posts

  app.get("/", async (req, reply) => {
    const { authorId } = req.params;
    const filter = authorId ? { authorId: req.params.authorId } : {};
    const sortedPosts = await Post.find(filter).sort({ date: -1 });
    return reply.send(sortedPosts);
  });

  app.post("/", async (req) => {
    // todo add logged in user from jwt
    req.body.authorId = ""; // req.user.id;
    return new Post(req.body).save();
  });

  // /posts/postId

  app.get("/:postId", async (req, reply) => {
    const post = await Post.findById(req.params.postId);
    if (post === null) {
      return reply.send(new httpErrors.NotFound());
    }
    return post;
  });

  app.delete("/:postId", async (req) => {
    return Post.findByIdAndRemove(req.params.postId);
  });

  app.patch("/:postId", async (req, reply) => {
    const post = await Post.findById(req.params.postId);
    if (post === null) {
      return reply.send(new httpErrors.NotFound());
    }
    Object.keys(req.body).forEach((key) => {
      if (post[key] && post[key] !== req.body[key]) {
        post[key] = req.body[key];
      }
    });
    return post.save();
  });

  app.post("/:postId/comment", async (req) => {
    const { postId } = req.params;
    // todo: get user id from JWT
    req.body.authorId = "";
    req.body.postId = postId;
    const newComment = await new Comment(req.body).save();
    const updatedPost = await Post.findOneAndUpdate(
      { _id: postId },
      { $push: { comments: newComment } },
      { new: true },
    );
    return updatedPost;
  });
}

module.exports = routes;