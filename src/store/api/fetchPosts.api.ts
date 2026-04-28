import { getDocs } from "firebase/firestore"
import { AppDispatch } from "../../types/State"
import { Post } from "../../types/Post";
import { loadPosts } from "../actions";
import { POSTS } from "../../constants";

export const fetchPosts = async (dispatch: AppDispatch) => {
  try {
    const data = await getDocs(POSTS);

    const posts: Post[] = data.docs.map(doc => {
      const postData = doc.data() as Post;
      return {
        id: doc.id,
        title: postData.title || '',
        tasks: [],
        hourlyRate: postData.hourlyRate,
        defaultStartTime: postData.defaultStartTime,
        defaultEndTime: postData.defaultEndTime,
        role: postData.role,
        isMultiple: postData.isMultiple,
      } as Post;
    })

    dispatch(loadPosts({ posts }))
  } catch (error) {
    console.error("Error fetching posts:", error);
  }
};
