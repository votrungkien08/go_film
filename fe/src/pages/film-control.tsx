import { CONFIG } from 'src/config-global';

import { ProductsView } from 'src/sections/filmcontrol/view';
import { FilmControlView } from '../sections/filmcontrol/view/film-control-view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Film Control - ${CONFIG.appName}`}</title>

      <FilmControlView />
    </>
  );
}
