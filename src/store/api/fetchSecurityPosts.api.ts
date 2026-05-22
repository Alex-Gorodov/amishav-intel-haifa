import { getDocs } from "firebase/firestore"
import { AppDispatch } from "../../types/State"
import { Post } from "../../types/Post";
import { loadSecurityPosts } from "../actions";
import { SECURITY_POSTS_COLLECTION } from "../../constants";

export const fetchSecurityPosts = async (dispatch: AppDispatch) => {
  try {
    const data = await getDocs(SECURITY_POSTS_COLLECTION);

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

    dispatch(loadSecurityPosts({ posts }))
  } catch (error) {
    console.error("Error fetching posts:", error);
  }
};
