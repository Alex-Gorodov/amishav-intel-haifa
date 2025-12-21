import { Posts } from "../constants/Posts";
import { Tariffs } from "../constants/Tariffs";

export const getRoleByPost = (postId: string) => {
  const post = Posts.find(p => p.id === postId);
  if (!post) return null;

  switch (post.hourlyRate) {
    case Tariffs.shiftManager:
      return "shift_manager";
    case Tariffs.securityShiftLeader:
      return "security_shift_leader";
    case Tariffs.securityGuard:
      return "security_guard";
    default:
      return null;
  }
};
