import { Post } from "../types/Post";
import { User } from "../types/User";
import {
  SECURITY_ROLES,
  DERT_ROLES,
  OCC_ROLES,
  SHIFT_MANAGER_ROLE,
  ALL_POSTS,
} from "../constants/Posts";

export const getAssignablePostsForUser = (user: User): Post[] => {
  if (!user) return [];

  if (user.roles.includes("shift_manager")) {
    return ALL_POSTS;
  }

  return ALL_POSTS.filter(post =>
    user.roles.includes(post.role)
  );
};
