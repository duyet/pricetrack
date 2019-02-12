import { HOME, MY_PRODUCT, ABOUT } from './routes'

const MENUS = [
    {
        path: HOME,
        text: 'Trang chủ'
    },
    {
        path: MY_PRODUCT,
        text: 'Sản phẩm của tôi',
        auth: true
    },
    {
        path: ABOUT,
        text: 'Giới thiệu'
    }
]

export default MENUS