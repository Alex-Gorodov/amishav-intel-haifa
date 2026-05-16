import { useSelector } from "react-redux";
// import { Posts } from "../constants/Posts";
import { Post } from "../types/Post";
import { User } from "../types/User";
import { getRoleByPost } from "./getRoleByPost";
import { RootState } from "../store/root-reducer";

export const getAvailablePostsByRole = (user: User): Post[] => {
  const posts = useSelector((state: RootState) => state.data.posts)

  return posts.filter(post => user.roles.includes(post.role));
};

export const getAvailableUsersByPost = (
  users: User[],
  postId: string
): User[] => {
  const role = getRoleByPost(postId);

  if (!role) return [];

  return users.filter(user => user.roles.includes(role));
};
