import { CONFIG } from 'src/config-global';

import { ProductsView } from 'src/sections/revenue/view';
import { RevenueView } from '../sections/revenue/view/revenue-view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Doanh Thu - ${CONFIG.appName}`}</title>

      <RevenueView />
    </>
  );
}
