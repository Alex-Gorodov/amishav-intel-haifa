import ProtocolGroup from '../../components/ProtocolGroup/ProtocolGroup';
import { Protocols } from '../../constants/Protocols';

export default function SecurityProtocolsScreen() {
  const image = require('../../../assets/images/protocols/security-cover.jpg');

  return (
    <ProtocolGroup
      image={image}
      protocols={Protocols.security}
    />
  )
}
