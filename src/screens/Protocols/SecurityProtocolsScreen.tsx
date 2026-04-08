import ProtocolGroup from '../../components/ProtocolGroup/ProtocolGroup';
import { ProtocolGroups } from '../../constants/Protocols';

export default function SecurityProtocolsScreen() {
  const image = require('../../../assets/images/protocols/security-cover.jpg');

  return (
    <ProtocolGroup
      title='ביטחון'
      image={image}
      protocols={ProtocolGroups.security}
    />
  )
}
