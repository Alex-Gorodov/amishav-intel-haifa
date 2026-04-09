import { useSelector } from 'react-redux';
import ProtocolGroup from '../../components/ProtocolGroup/ProtocolGroup';
import { ProtocolGroups } from '../../constants/Protocols';
import { RootState } from '../../store/root-reducer';

export default function ControllerProtocolsScreen() {
  const image = require('../../../assets/images/protocols/occ-cover.webp');
  const protocols = useSelector((state: RootState) => state.data.protocolsPreview)
  const controllerProtocols = protocols.filter(
    (p) => p.group === 'controller'
  );

  return (
    <ProtocolGroup
      title='בקרה'
      image={image}
      protocols={controllerProtocols}
    />
  )
}
