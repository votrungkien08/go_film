import { CONFIG } from 'src/config-global';

import { ProductsView } from 'src/sections/add/view';
import { AddView } from '../sections/add/view/add-view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Add - ${CONFIG.appName}`}</title>

      <AddView />
    </>
  );
}
