import { Label } from 'src/components/label';
import { SvgColor } from 'src/components/svg-color';

// ----------------------------------------------------------------------

const icon = (name: string) => <SvgColor src={`/assets/icons/navbar/${name}.svg`} />;

export type NavItem = {
  title: string;
  path: string;
  icon: React.ReactNode;
  info?: React.ReactNode;
};

export const navData = [
  {
    title: 'Dashboard',
    path: '/dashboard',
    icon: icon('ic-analytics'),
  },
  {
    title: 'User',
    path: '/dashboard/user',
    icon: icon('ic-user'),
  },
  {
    title: 'Product',
    path: '/dashboard/products',
    icon: icon('ic-cart'),
    info: (
      <Label color="error" variant="inverted">
        +3
      </Label>
    ),
  },
  {
    title: 'Blog',
    path: '/dashboard/blog',
    icon: icon('ic-blog'),
  },
  {
    title: 'Sign in',
    path: '/dashboard/sign-in',
    icon: icon('ic-lock'),
  },
  {
    title: 'Not found',
    path: '/dashboard/404',
    icon: icon('ic-disabled'),
  },
  {
    title: 'Quản Lý Phim',
    path: '/dashboard/films',
    icon: icon('ic-film'),
  },
  {
    title: 'Comment',
    path: '/dashboard/comment',
    icon: icon('ic-comment'),
  },
  {
    title: 'Add',
    path: '/dashboard/add',
    icon: icon('ic-add'),
  },
];
