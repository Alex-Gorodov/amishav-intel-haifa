import { ImageSourcePropType } from "react-native";

export type Protocol = {
  id: string;
  title: string;
  headerImage?: string | null;
  images?: string[];
  content: string;
};

export type ProtocolPreview = {
  id: string;
  title: string;
};
