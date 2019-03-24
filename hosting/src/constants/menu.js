import { HOME, MY_PRODUCT, ABOUT, CASHBACK } from './routes'

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
        path: CASHBACK,
        text: 'Cashback',
        auth: false
    },
    {
        path: ABOUT,
        text: 'Giới thiệu'
    }
]

export default MENUS