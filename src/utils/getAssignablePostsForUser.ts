import { Post } from "../types/Post";
import { User } from "../types/User";
import {
  ALL_POSTS,
} from "../constants/Posts";

export const getAssignablePostsForUser = (user: User): Post[] => {
  if (!user) return [];

  const userRoles = new Set(user.roles);

  let posts = ALL_POSTS.filter(post =>
    userRoles.has(post.role)
  );

  const isShiftManager = userRoles.has("shift_manager");

  if (!isShiftManager) {
    posts = posts.filter(post => post.role !== "shift_manager");
  }

  // ✅ REMOVE DUPLICATES BY ID
  const uniquePosts = Array.from(
    new Map(posts.map(p => [p.id, p])).values()
  );

  return uniquePosts;
};
