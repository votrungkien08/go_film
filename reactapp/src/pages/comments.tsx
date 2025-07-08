import { CONFIG } from 'src/config-global';

import { ProductsView } from 'src/sections/comment/view';
import { CommentView } from '../sections/comment/view/comment-view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Comment - ${CONFIG.appName}`}</title>

      <CommentView />
    </>
  );
}
