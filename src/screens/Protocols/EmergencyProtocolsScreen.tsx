import { Protocols } from '../../constants/Protocols';
import ProtocolGroup from '../../components/ProtocolGroup/ProtocolGroup';

export default function EmergencyProtocolsScreen() {
  const image = require('../../../assets/images/protocols/dert-cover.webp');

  return (
    <ProtocolGroup
      image={image}
      protocols={Protocols.emergency}
    />
  )
}
