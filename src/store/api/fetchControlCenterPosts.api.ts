import { getDocs } from "firebase/firestore";
import { Post } from "../../types/Post";
import { AppDispatch } from "../../types/State";
import { loadControllCenterPosts } from "../actions";
import { CONTROLL_CENTER_POSTS_COLLECTION } from "../../constants";

export const fetchControllCenterPosts = async (dispatch: AppDispatch) => {
  try {
    const data = await getDocs(CONTROLL_CENTER_POSTS_COLLECTION);

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

    dispatch(loadControllCenterPosts({ posts }))
  } catch (error) {
    console.error("Error fetching posts:", error);
  }
};
