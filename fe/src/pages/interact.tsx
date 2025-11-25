import { CONFIG } from 'src/config-global';

import { ProductsView } from 'src/sections/interact/view';
import { InteractionView } from '../sections/interact/view/view-interact';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Comment - ${CONFIG.appName}`}</title>

      <InteractionView />
    </>
  );
}
