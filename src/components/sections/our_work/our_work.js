import './our_work.scss'
import Swiper from 'swiper'
import { Navigation, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

const initOurWorkSlider = () => {
	const slider = document.querySelector('.our-work__slider')
	if (!slider) return

	const nextEl = document.querySelector('.our-work__arrow--next')
	const prevEl = document.querySelector('.our-work__arrow--prev')
	const paginationEl = slider.querySelector('.our-work__pagination')

	new Swiper(slider, {
		modules: [Navigation, Pagination],
		speed: 700,
		spaceBetween: 24,
		slidesPerView: 'auto',
		grabCursor: true,
		watchOverflow: true,
		observer: true,
		observeParents: true,
		navigation: nextEl && prevEl ? {
			nextEl,
			prevEl,
		} : false,
		pagination: paginationEl ? {
			el: paginationEl,
			clickable: true,
		} : false,
		breakpoints: {
			0: {
				spaceBetween: 16,
			},
			768: {
				spaceBetween: 20,
			},
			1200: {
				spaceBetween: 24,
			}
		}
	})
}

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', initOurWorkSlider)
} else {
	initOurWorkSlider()
}
