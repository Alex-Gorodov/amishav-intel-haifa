import { Post } from "../types/Post";
import { ROLE_VISIBILITY, SECURITY_POSTS, OCC_POSTS, DERT_POSTS } from "../constants/Posts";

export const getVisiblePostsForSchedule = (
  user: { roles: string[] },
  scheduleType: "security" | "occ" | "dert"
): Post[] => {

  const posts =
    scheduleType === "security"
      ? SECURITY_POSTS
      : scheduleType === "occ"
      ? OCC_POSTS
      : DERT_POSTS;

  const allowedRoles = new Set(
    user.roles.flatMap(role => ROLE_VISIBILITY[role] ?? [])
  );

  return posts.filter(post => allowedRoles.has(post.role));
};
