import ProtocolGroup from '../../components/ProtocolGroup/ProtocolGroup';
import { Protocols } from '../../constants/Protocols';

export default function ControllerProtocolsScreen() {
  const image = require('../../../assets/images/protocols/occ-cover.webp');

  return (
    <ProtocolGroup
      title='בקרה'
      image={image}
      protocols={Protocols.controller}
    />
  )
}
