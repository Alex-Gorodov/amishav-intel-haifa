import { useSelector } from 'react-redux';
import ProtocolGroup from '../../components/ProtocolGroup/ProtocolGroup';
import { ProtocolGroups } from '../../constants/Protocols';
import { RootState } from '../../store/root-reducer';

export default function SecurityProtocolsScreen() {
  const image = require('../../../assets/images/protocols/security-cover.jpg');
  const protocols = useSelector((state: RootState) => state.data.protocolsPreview)
  const securityProtocols = protocols.filter(
    (p) => p.group === 'security'
  );

  return (
    <ProtocolGroup
      title='ביטחון'
      image={image}
      protocols={securityProtocols}
    />
  )
}
