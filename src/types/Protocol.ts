import { ImageSourcePropType } from "react-native";

export type Protocol = {
  id: string;
  title: string;
  image?: ImageSourcePropType;
  content: string;
}
