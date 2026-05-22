import { SHIFT_MANAGER_ROLE, SECURITY_ROLES, DERT_ROLES, OCC_ROLES } from "../constants/Posts";
import { Post } from "../types/Post";
import { User } from "../types/User";
import { getRoleByPost } from "./getRoleByPost";

export const getAvailablePostsByRole = (
  user: User,
  posts: Post[]
): Post[] => {

  // shift manager sees everything
  if (user.roles.includes(SHIFT_MANAGER_ROLE)) {
    return posts;
  }

  return posts.filter((post) => {

    // SECURITY FAMILY
    if (
      SECURITY_ROLES.includes(post.role) &&
      user.roles.some(role => SECURITY_ROLES.includes(role))
    ) {
      return true;
    }

    // DERT FAMILY
    if (
      DERT_ROLES.includes(post.role) &&
      user.roles.some(role => DERT_ROLES.includes(role))
    ) {
      return true;
    }

    // OCC FAMILY
    if (
      OCC_ROLES.includes(post.role) &&
      user.roles.some(role => OCC_ROLES.includes(role))
    ) {
      return true;
    }

    return false;
  });
};

export const getAvailableUsersByPost = (
  users: User[],
  postId: string,
  posts: Post[]
): User[] => {
  const role = getRoleByPost(postId, posts);

  if (!role) return [];

  return users.filter(user => user.roles.includes(role));
};
