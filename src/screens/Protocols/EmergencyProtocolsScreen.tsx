import ProtocolGroup from '../../components/ProtocolGroup/ProtocolGroup';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/root-reducer';

export default function EmergencyProtocolsScreen() {
  const image = require('../../../assets/images/protocols/dert-cover.webp');
  const protocols = useSelector((state: RootState) => state.data.protocolsPreview)
  const emergencyProtocols = protocols.filter(
    (p) => p.group === 'emergency'
  );

  return (
    <ProtocolGroup
      title='חירום'
      image={image}
      protocols={emergencyProtocols}
    />
  )
}
