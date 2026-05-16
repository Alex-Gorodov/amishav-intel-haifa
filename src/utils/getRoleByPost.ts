import { useSelector } from "react-redux";
// import { Posts } from "../constants/Posts";
import { Tariffs } from "../constants/Tariffs";
import { RootState } from "../store/root-reducer";

export const getRoleByPost = (postId: string) => {
  const posts = useSelector((state: RootState) => state.data.posts)

  const post = posts.find(p => p.id === postId);
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
