import { ImageSourcePropType } from "react-native";

export type Protocol = {
  id: string;
  title: string;
  headerImage: ImageSourcePropType;
  images?: ImageSourcePropType[];
  content: string;
}
