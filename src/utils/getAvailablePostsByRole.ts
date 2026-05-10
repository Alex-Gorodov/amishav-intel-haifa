import { Posts } from "../constants/Posts";
import { Post } from "../types/Post";
import { User } from "../types/User";
import { getRoleByPost } from "./getRoleByPost";

export const getAvailablePostsByRole = (user: User): Post[] => {
  return Posts.filter(post => user.roles.includes(post.role));
};

export const getAvailableUsersByPost = (
  users: User[],
  postId: string
): User[] => {
  const role = getRoleByPost(postId);

  if (!role) return [];

  return users.filter(user => user.roles.includes(role));
};
