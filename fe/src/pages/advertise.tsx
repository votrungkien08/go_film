import { CONFIG } from 'src/config-global';

import { ProductsView } from 'src/sections/advertise/view';
import  AdvertisePage from '../sections/advertise/view/advertise-view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Quảng cáo - ${CONFIG.appName}`}</title>

      <AdvertisePage />
    </>
  );
}
