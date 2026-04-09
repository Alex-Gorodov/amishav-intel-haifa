import { getDocs } from "firebase/firestore";
import { AppDispatch } from "../../types/State";
import { loadProtocolsPreview } from "../actions";
import { PROTOCOLS_HEADERS } from "../../constants";
import { ProtocolPreview } from "../../types/Protocol";

export const fetchProtocolsPreview = async (dispatch: AppDispatch) => {
  try {
    const data = await getDocs(PROTOCOLS_HEADERS);

    const protocolsPreview: ProtocolPreview[] = await Promise.all(
      data.docs.map(async (doc) => {
        const protocolsPreviewData = doc.data();

        return {
          id: doc.id,
          group: protocolsPreviewData.group,
          title: protocolsPreviewData.title
        } as ProtocolPreview;
      })
    );

    dispatch(loadProtocolsPreview({ protocolsPreview }));
  } catch (error) {
    console.error("Error fetching users:", error);
  }
}
